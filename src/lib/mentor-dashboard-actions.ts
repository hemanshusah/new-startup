'use server'

import { createServiceClient } from '@/lib/supabase/server'
import { getAuthenticatedUser } from '@/lib/auth-utils'
import { getValidOAuthClient } from '@/lib/google-calendar'
import { revalidatePath } from 'next/cache'

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

export async function updateMentorWeeklyAvailability(availabilityData: { day_of_week: number; start_time: string; end_time: string }[]) {
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
    // Deduplicate rules before inserting (in case UI state has duplicates)
    const uniqueRules = Array.from(new Set(availabilityData.map(slot => 
      `${slot.day_of_week}-${slot.start_time}-${slot.end_time}`
    ))).map(key => {
      const [day, start, end] = key.split('-')
      return {
        mentor_id: mentor.id,
        day_of_week: parseInt(day),
        start_time: start,
        end_time: end,
        timezone: 'Asia/Kolkata' // Default to India for now
      }
    })

    const { error: insertError } = await supabase
      .from('mentor_availability')
      .insert(uniqueRules)

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
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('Calendar validation failed:', message)
    return { isConnected: true, isValid: false, error: message }
  }
}

export async function createSessionType(data: { name: string; duration_minutes: number; price_inr: number; description: string }) {
  const user = await getAuthenticatedUser()
  if (!user) return { error: 'Not authenticated' }

  const supabase = createServiceClient()
  const { data: mentor } = await supabase.from('mentor_profiles').select('id').eq('user_id', user.id).single()
  if (!mentor) return { error: 'Mentor not found' }

  if (data.price_inr < 2500 || data.price_inr > 25000) {
    return { error: 'Price must be between ₹2,500 and ₹25,000' }
  }

  const { error } = await supabase.from('session_types').insert({
    mentor_id: mentor.id,
    ...data,
    tier: 'standard',
    is_active: true
  })

  if (error) return { error: error.message }
  return { success: true }
}

export async function updateSessionType(id: string, data: Partial<{ name: string; duration_minutes: number; price_inr: number; description: string; is_active: boolean }>) {
  const user = await getAuthenticatedUser()
  if (!user) return { error: 'Not authenticated' }

  const supabase = createServiceClient()
  const { data: mentor } = await supabase.from('mentor_profiles').select('id').eq('user_id', user.id).single()
  if (!mentor) return { error: 'Mentor not found' }

  const { error } = await supabase
    .from('session_types')
    .update(data)
    .eq('id', id)
    .eq('mentor_id', mentor.id)

  if (error) return { error: error.message }
  return { success: true }
}

export async function deleteSessionType(id: string) {
  const user = await getAuthenticatedUser()
  if (!user) return { error: 'Not authenticated' }

  const supabase = createServiceClient()
  const { data: mentor } = await supabase.from('mentor_profiles').select('id').eq('user_id', user.id).single()
  if (!mentor) return { error: 'Mentor not found' }

  // Check if any historical or active bookings reference this session type
  const { count, error: countError } = await supabase
    .from('sessions')
    .select('id', { count: 'exact', head: true })
    .eq('session_type_id', id)

  if (countError) {
    return { error: 'Failed to verify existing bookings: ' + countError.message }
  }

  if (count && count > 0) {
    // There are bookings, so soft-delete (archive) instead to preserve logs
    const { error: archiveError } = await supabase
      .from('session_types')
      .update({ is_active: false })
      .eq('id', id)
      .eq('mentor_id', mentor.id)

    if (archiveError) return { error: archiveError.message }
    return { success: true, archived: true }
  }

  // No bookings exist, perform a hard delete
  const { error: deleteError } = await supabase
    .from('session_types')
    .delete()
    .eq('id', id)
    .eq('mentor_id', mentor.id)

  if (deleteError) return { error: deleteError.message }
  return { success: true, deleted: true }
}

export async function createMeetingRequest(data: {
  mentorId: string
  sessionTypeId: string
  proposedStart: string
  proposedEnd: string
  proposedStart2?: string
  proposedEnd2?: string
  founderBrief: string
  amountInr: number
}) {
  const user = await getAuthenticatedUser()
  if (!user) return { error: 'Not authenticated' }

  const supabase = createServiceClient()

  const timestamp = new Date().toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })

  // Get session type name for timeline details
  const { data: sessionType } = await supabase
    .from('session_types')
    .select('name')
    .eq('id', data.sessionTypeId)
    .single()

  const initialTimeline = [
    {
      timestamp,
      actor: 'founder',
      event: 'Proposed custom meeting request',
      details: `Baseline: ${sessionType?.name || 'Session'}. Requested rate: ₹${data.amountInr.toLocaleString()}. Option 1: ${new Date(data.proposedStart).toLocaleDateString()} at ${new Date(data.proposedStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` + 
               (data.proposedStart2 ? ` | Option 2: ${new Date(data.proposedStart2).toLocaleDateString()} at ${new Date(data.proposedStart2).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : '')
    }
  ]

  const { data: request, error } = await supabase
    .from('meeting_requests')
    .insert({
      founder_id: user.id,
      mentor_id: data.mentorId,
      session_type_id: data.sessionTypeId,
      proposed_start: data.proposedStart,
      proposed_end: data.proposedEnd,
      proposed_start_2: data.proposedStart2 || null,
      proposed_end_2: data.proposedEnd2 || null,
      founder_brief: data.founderBrief,
      amount_inr: data.amountInr,
      status: 'pending',
      negotiation_timeline: initialTimeline
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating meeting request:', error)
    return { error: error.message }
  }

  revalidatePath('/profile/sessions')
  return { success: true, request }
}

export async function respondToMeetingRequest(requestId: string, status: 'accepted' | 'declined') {
  const user = await getAuthenticatedUser()
  if (!user) return { error: 'Not authenticated' }

  const supabase = createServiceClient()
  
  // Verify user is the mentor for this request
  const { data: request, error: fetchError } = await supabase
    .from('meeting_requests')
    .select('*')
    .eq('id', requestId)
    .single()

  if (fetchError || !request) {
    return { error: 'Request not found' }
  }

  const { data: mentor } = await supabase
    .from('mentor_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!mentor || mentor.id !== request.mentor_id) {
    return { error: 'Not authorized to respond to this request' }
  }

  const timestamp = new Date().toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })

  const updatedTimeline = [
    ...(request.negotiation_timeline || []),
    {
      timestamp,
      actor: 'mentor',
      event: status === 'accepted' ? 'Accepted meeting proposal' : 'Declined meeting proposal',
      details: status === 'accepted' 
        ? `Proposal confirmed at ₹${request.amount_inr.toLocaleString()}. Slot: ${new Date(request.proposed_start).toLocaleDateString()} at ${new Date(request.proposed_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`
        : 'Proposal declined by Mentor.'
    }
  ]

  // Start Transaction equivalent: update request status & timeline
  const { error: updateError } = await supabase
    .from('meeting_requests')
    .update({ 
      status,
      negotiation_timeline: updatedTimeline
    })
    .eq('id', requestId)

  if (updateError) {
    return { error: 'Failed to update request status: ' + updateError.message }
  }

  if (status === 'accepted') {
    // Generate actual session row in sessions
    const sessionStatus = request.amount_inr > 0 ? 'pending_payment' : 'confirmed'
    
    // Auto-calculate platform fee and payouts
    const commissionPct = 20 // Default standard
    const platformCommission = Math.round(request.amount_inr * (commissionPct / 100))
    const mentorPayout = request.amount_inr - platformCommission

    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .insert({
        founder_id: request.founder_id,
        mentor_id: request.mentor_id,
        session_type_id: request.session_type_id,
        scheduled_start: request.proposed_start,
        scheduled_end: request.proposed_end,
        founder_brief: request.founder_brief,
        amount_inr: request.amount_inr,
        platform_commission_inr: platformCommission,
        mentor_payout_inr: mentorPayout,
        status: sessionStatus,
        negotiation_timeline: updatedTimeline
      })
      .select()
      .single()

    if (sessionError) {
      console.error('Failed to create session on request approval:', sessionError)
      // Rollback request status
      await supabase.from('meeting_requests').update({ status: 'pending' }).eq('id', requestId)
      return { error: 'Failed to generate session: ' + sessionError.message }
    }

    // If free session, generate Google Meet link immediately
    if (request.amount_inr === 0) {
      try {
        const { createSessionEvent } = await import('@/lib/mentor/calendar-booking')
        await createSessionEvent(session.id)
      } catch (calErr) {
        console.error('Google calendar scheduling failed on request approval:', calErr)
      }
    }
  }

  revalidatePath('/profile/sessions')
  revalidatePath('/admin/mentor-connect/sessions')
  revalidatePath('/admin/mentor-connect/payments')
  revalidatePath('/admin/mentor-connect')
  
  return { success: true }
}

export async function sendMentorMeetingOffer(data: {
  requestId: string
  offeredStart: string
  offeredEnd: string
  offeredAmountInr: number
}) {
  const user = await getAuthenticatedUser()
  if (!user) return { error: 'Not authenticated' }

  const supabase = createServiceClient()

  // Verify mentor identity
  const { data: request } = await supabase
    .from('meeting_requests')
    .select('mentor_id, negotiation_timeline')
    .eq('id', data.requestId)
    .single()
    
  if (!request) return { error: 'Request not found' }

  const { data: mentor } = await supabase.from('mentor_profiles').select('id').eq('user_id', user.id).single()
  if (!mentor || mentor.id !== request.mentor_id) return { error: 'Not authorized' }

  const timestamp = new Date().toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })

  const updatedTimeline = [
    ...(request.negotiation_timeline || []),
    {
      timestamp,
      actor: 'mentor',
      event: 'Counter-Offered rate and slot options',
      details: `Offered rate: ₹${data.offeredAmountInr.toLocaleString()}. Proposed slot: ${new Date(data.offeredStart).toLocaleDateString()} at ${new Date(data.offeredStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`
    }
  ]

  const { error } = await supabase
    .from('meeting_requests')
    .update({
      status: 'offered',
      offered_start: data.offeredStart,
      offered_end: data.offeredEnd,
      offered_amount_inr: data.offeredAmountInr,
      negotiation_timeline: updatedTimeline
    })
    .eq('id', data.requestId)

  if (error) return { error: error.message }

  revalidatePath('/profile/sessions')
  return { success: true }
}

export async function acceptFounderMeetingOffer(requestId: string) {
  const user = await getAuthenticatedUser()
  if (!user) return { error: 'Not authenticated' }

  const supabase = createServiceClient()

  const { data: request } = await supabase
    .from('meeting_requests')
    .select('*')
    .eq('id', requestId)
    .single()

  if (!request || request.founder_id !== user.id) return { error: 'Request not found' }
  if (request.status !== 'offered') return { error: 'No active offer to accept' }

  const agreedPrice = request.offered_amount_inr
  const agreedStart = request.offered_start
  const agreedEnd = request.offered_end

  const timestamp = new Date().toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })

  const updatedTimeline = [
    ...(request.negotiation_timeline || []),
    {
      timestamp,
      actor: 'founder',
      event: 'Accepted Mentor counter-offer',
      details: `Agreed rate: ₹${agreedPrice.toLocaleString()}. Confirmed slot: ${new Date(agreedStart).toLocaleDateString()} at ${new Date(agreedStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. Initiating payment.`
    }
  ]

  // Update status and timeline on meeting request
  const { error: updateError } = await supabase
    .from('meeting_requests')
    .update({ 
      status: 'accepted',
      negotiation_timeline: updatedTimeline
    })
    .eq('id', requestId)

  if (updateError) return { error: updateError.message }

  const sessionStatus = agreedPrice > 0 ? 'pending_payment' : 'confirmed'
  const commissionPct = 20
  const platformCommission = Math.round(agreedPrice * (commissionPct / 100))
  const mentorPayout = agreedPrice - platformCommission

  // Spawn standard session
  const { data: session, error: sessionError } = await supabase
    .from('sessions')
    .insert({
      founder_id: request.founder_id,
      mentor_id: request.mentor_id,
      session_type_id: request.session_type_id,
      scheduled_start: agreedStart,
      scheduled_end: agreedEnd,
      founder_brief: request.founder_brief,
      amount_inr: agreedPrice,
      platform_commission_inr: platformCommission,
      mentor_payout_inr: mentorPayout,
      status: sessionStatus,
      negotiation_timeline: updatedTimeline
    })
    .select()
    .single()

  if (sessionError) {
    console.error('Failed to create session on founder accept:', sessionError)
    await supabase.from('meeting_requests').update({ status: 'offered' }).eq('id', requestId)
    return { error: sessionError.message }
  }

  // Google calendar mapping if free
  if (agreedPrice === 0) {
    try {
      const { createSessionEvent } = await import('@/lib/mentor/calendar-booking')
      await createSessionEvent(session.id)
    } catch (calErr) {
      console.error('Calendar error:', calErr)
    }
  }

  revalidatePath('/profile/sessions')
  revalidatePath('/admin/mentor-connect/sessions')
  revalidatePath('/admin/mentor-connect/payments')
  revalidatePath('/admin/mentor-connect')

  if (agreedPrice > 0) {
    const { createRazorpayOrderForSession } = await import('@/lib/actions/booking')
    const orderDetails = await createRazorpayOrderForSession(session.id)
    return {
      success: true,
      requiresPayment: true,
      ...orderDetails
    }
  }

  return { success: true, requiresPayment: false, sessionId: session.id }
}

export async function toggleMentorAvailability(available: boolean) {
  const user = await getAuthenticatedUser()
  if (!user) return { error: 'Not authenticated' }

  const supabase = createServiceClient()

  const { error } = await supabase
    .from('mentor_profiles')
    .update({ is_available: available })
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/mentor/sessions')
  return { success: true }
}

export async function adminSoftCleanSession(sessionId: string) {
  const user = await getAuthenticatedUser()
  if (!user) return { error: 'Not authenticated' }

  const supabase = createServiceClient()

  // Verify Admin privileges
  if (user.role !== 'admin') return { error: 'Not authorized as admin' }

  // Attempt to delete Google Calendar Event if it exists (resilient non-blocking)
  try {
    const { deleteSessionEvent } = await import('@/lib/mentor/calendar-booking')
    await deleteSessionEvent(sessionId)
  } catch (err) {
    console.error('Non-blocking Google Calendar cancellation fail:', err)
  }

  // Soft clean: keep transaction but clear meet links, topic brief, scheduling
  const { error } = await supabase
    .from('sessions')
    .update({
      scheduled_start: null,
      scheduled_end: null,
      google_meet_link: null,
      google_calendar_event_id: null,
      founder_brief: 'Session records cleared by Admin'
    })
    .eq('id', sessionId)

  if (error) return { error: error.message }

  revalidatePath('/admin/mentor-connect/payments')
  revalidatePath('/admin/mentor-connect/sessions')
  return { success: true }
}

export async function adminHardDeleteSession(sessionId: string) {
  const user = await getAuthenticatedUser()
  if (!user) return { error: 'Not authenticated' }

  const supabase = createServiceClient()

  // Verify Admin privileges
  if (user.role !== 'admin') return { error: 'Not authorized as admin' }

  // Attempt to delete Google Calendar Event if it exists (resilient non-blocking)
  try {
    const { deleteSessionEvent } = await import('@/lib/mentor/calendar-booking')
    await deleteSessionEvent(sessionId)
  } catch (err) {
    console.error('Non-blocking Google Calendar cancellation fail:', err)
  }

  // Hard delete
  const { error } = await supabase
    .from('sessions')
    .delete()
    .eq('id', sessionId)

  if (error) return { error: error.message }

  revalidatePath('/admin/mentor-connect/payments')
  revalidatePath('/admin/mentor-connect/sessions')
  return { success: true }
}
