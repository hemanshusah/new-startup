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

  const { error } = await supabase
    .from('session_types')
    .delete()
    .eq('id', id)
    .eq('mentor_id', mentor.id)

  if (error) return { error: error.message }
  return { success: true }
}
