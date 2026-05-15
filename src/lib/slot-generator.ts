'use server'

import { createServiceClient } from '@/lib/supabase/server'
import { getMentorBusyIntervals } from '@/lib/google-calendar'
import { addDays, addHours, addMinutes, isBefore, isAfter, isSameDay, startOfDay, endOfDay, parseISO, format } from 'date-fns'

export async function generateAvailableSlots(mentorId: string, durationMinutes: number) {
  const supabase = createServiceClient()

  // 1. Fetch mentor settings
  const { data: mentor } = await supabase
    .from('mentor_profiles')
    .select('notice_period_hours, booking_window_days, timezone, google_access_token')
    .eq('id', mentorId)
    .single()

  if (!mentor) throw new Error('Mentor not found')

  // 2. Fetch weekly availability rules
  const { data: weeklyAvailability } = await supabase
    .from('mentor_availability')
    .select('*')
    .eq('mentor_id', mentorId)

  if (!weeklyAvailability || weeklyAvailability.length === 0) {
    return {} // Mentor hasn't set up availability
  }

  // 3. Define the window
  const now = new Date()
  const minDate = addHours(now, mentor.notice_period_hours)
  const maxDate = addDays(now, mentor.booking_window_days)

  // 4. Fetch blocked dates from DB
  const { data: blockedDates } = await supabase
    .from('blocked_dates')
    .select('blocked_date')
    .eq('mentor_id', mentorId)
    .gte('blocked_date', minDate.toISOString().split('T')[0])
    .lte('blocked_date', maxDate.toISOString().split('T')[0])

  const blockedDateStrings = new Set((blockedDates || []).map(b => b.blocked_date))

  // 5. Fetch existing booked sessions from our DB
  const { data: existingSessions } = await supabase
    .from('sessions')
    .select(`
      scheduled_start,
      session_types ( duration_minutes )
    `)
    .eq('mentor_id', mentorId)
    .in('status', ['confirmed', 'pending_payment'])
    .gte('scheduled_start', minDate.toISOString())
    .lte('scheduled_start', maxDate.toISOString())

  const dbBookings = (existingSessions || []).map((s: any) => ({
    start: new Date(s.scheduled_start),
    end: addMinutes(new Date(s.scheduled_start), s.session_types.duration_minutes)
  }))

  // 6. Fetch Google Calendar FreeBusy (if connected)
  let googleBusyIntervals: { start: Date, end: Date }[] = []
  if (mentor.google_access_token) {
    try {
      googleBusyIntervals = await getMentorBusyIntervals(mentorId, minDate, maxDate)
    } catch (e) {
      console.error('Failed to fetch Google Calendar freebusy, falling back to DB only', e)
      // We could throw an error here, but for resilience, we just rely on DB bookings if Calendar fails temporarily
    }
  }

  const allBusyIntervals = [...dbBookings, ...googleBusyIntervals]

  // Helper to check if a slot overlaps with any busy interval
  const isSlotFree = (slotStart: Date, slotEnd: Date) => {
    return !allBusyIntervals.some(busy => {
      // Overlap condition: start1 < end2 AND end1 > start2
      return isBefore(slotStart, busy.end) && isAfter(slotEnd, busy.start)
    })
  }

  // 7. Generate slots day by day
  const availableSlots: Date[] = []
  
  // We'll generate slots by iterating through each day in the window
  let currentDay = startOfDay(minDate)
  const endWindow = endOfDay(maxDate)

  while (isBefore(currentDay, endWindow)) {
    const dayOfWeek = currentDay.getDay()
    const dateString = format(currentDay, 'yyyy-MM-dd')

    // Skip if day is explicitly blocked
    if (blockedDateStrings.has(dateString)) {
      currentDay = addDays(currentDay, 1)
      continue
    }

    // Find rules for this day of week
    const dayRules = weeklyAvailability.filter(r => r.day_of_week === dayOfWeek)

    for (const rule of dayRules) {
      // rule.start_time is like "09:00:00"
      const [startHour, startMin] = rule.start_time.split(':').map(Number)
      const [endHour, endMin] = rule.end_time.split(':').map(Number)

      let slotStart = new Date(currentDay)
      slotStart.setHours(startHour, startMin, 0, 0)
      
      const ruleEnd = new Date(currentDay)
      ruleEnd.setHours(endHour, endMin, 0, 0)

      // Generate slots in 30 min increments within this rule
      while (isBefore(slotStart, ruleEnd)) {
        const slotEnd = addMinutes(slotStart, durationMinutes)
        
        // Ensure the slot doesn't exceed the rule end time
        if (isAfter(slotEnd, ruleEnd)) break

        // Ensure slot is after our min notice period
        if (isAfter(slotStart, minDate)) {
          // Check against busy intervals
          if (isSlotFree(slotStart, slotEnd)) {
            availableSlots.push(slotStart)
          }
        }

        // Increment by 30 mins (Standard interval for slot generation)
        slotStart = addMinutes(slotStart, 30)
      }
    }

    currentDay = addDays(currentDay, 1)
  }

  // Sort slots chronologically
  availableSlots.sort((a, b) => a.getTime() - b.getTime())

  // Group by date for the UI
  const grouped: Record<string, string[]> = {}
  availableSlots.forEach(slot => {
    const dateKey = format(slot, 'yyyy-MM-dd')
    if (!grouped[dateKey]) grouped[dateKey] = []
    grouped[dateKey].push(slot.toISOString())
  })

  return grouped
}
