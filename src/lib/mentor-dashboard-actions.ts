'use server'

import { createServiceClient } from '@/lib/supabase/server'
import { getAuthenticatedUser } from '@/lib/auth-utils'
import { getValidOAuthClient } from '@/lib/google-calendar'

export async function updateMentorBookingRules(noticeHours: number, windowDays: number) {
  const user = await getAuthenticatedUser()
  if (!user) return { error: 'Not authenticated' }

  const supabase = createServiceClient()
  
  const { error } = await supabase
    .from('mentor_profiles')
    .update({
      notice_period_hours: noticeHours,
      booking_window_days: windowDays
    })
    .eq('user_id', user.id)

  if (error) {
    console.error('Error updating booking rules:', error)
    return { error: 'Failed to update booking rules' }
  }

  return { success: true }
}

export async function updateMentorWeeklyAvailability(availabilityData: any[]) {
  const user = await getAuthenticatedUser()
  if (!user) return { error: 'Not authenticated' }

  const supabase = createServiceClient()

  // First get the mentor ID
  const { data: mentor } = await supabase
    .from('mentor_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!mentor) return { error: 'Mentor not found' }

  // Transaction: delete old, insert new
  const { error: deleteError } = await supabase
    .from('mentor_availability')
    .delete()
    .eq('mentor_id', mentor.id)

  if (deleteError) {
    return { error: 'Failed to clear old availability' }
  }

  if (availabilityData.length > 0) {
    const insertData = availabilityData.map(slot => ({
      mentor_id: mentor.id,
      day_of_week: slot.day_of_week,
      start_time: slot.start_time,
      end_time: slot.end_time,
      timezone: slot.timezone || 'Asia/Kolkata'
    }))

    const { error: insertError } = await supabase
      .from('mentor_availability')
      .insert(insertData)

    if (insertError) {
      console.error('Error inserting availability:', insertError)
      return { error: 'Failed to save new availability' }
    }
  }

  return { success: true }
}

export async function disconnectGoogleCalendar() {
  const user = await getAuthenticatedUser()
  if (!user) return { error: 'Not authenticated' }

  const supabase = createServiceClient()
  
  const { error } = await supabase
    .from('mentor_profiles')
    .update({
      google_access_token: null,
      google_refresh_token: null,
      google_token_expiry: null
    })
    .eq('user_id', user.id)

  if (error) return { error: 'Failed to disconnect calendar' }
  
  return { success: true }
}

export async function checkGoogleCalendarStatus() {
  const user = await getAuthenticatedUser()
  if (!user) return { error: 'Not authenticated' }

  const supabase = createServiceClient()
  const { data: mentor } = await supabase
    .from('mentor_profiles')
    .select('id, google_access_token')
    .eq('user_id', user.id)
    .single()

  if (!mentor || !mentor.google_access_token) return { isConnected: false }

  try {
    await getValidOAuthClient(mentor.id)
    return { isConnected: true, isValid: true }
  } catch (err: any) {
    console.error('Calendar validation failed:', err.message)
    return { isConnected: true, isValid: false, error: err.message }
  }
}

