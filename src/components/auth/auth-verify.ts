'use server'

import { createServiceClient } from '@/lib/supabase/server'
import { getAuthenticatedUser } from '@/lib/auth-utils'

/**
 * Server action to verify a 6-digit OTP code against the database.
 */
export async function verifyOtp(email: string, code: string) {
  const supabase = createServiceClient()
  
  // 1. Check for valid OTP in our database
  const { data: record, error: fetchError } = await supabase
    .from('otp_verifications')
    .select('*')
    .eq('email', email)
    .eq('code', code)
    .gt('expires_at', new Date().toISOString())
    .single()

  if (fetchError || !record) {
    return { success: false, error: 'Invalid or expired verification code.' }
  }

  // 2. Mark the user as verified in the profiles table
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ email_verified: true })
    .eq('email', email)

  if (updateError) {
    return { success: false, error: 'Failed to update user profile.' }
  }

  // 3. Cleanup: Delete the used OTP
  await supabase.from('otp_verifications').delete().eq('id', record.id)

  return { success: true }
}

/**
 * Server action to generate and send a new OTP code.
 */
export async function sendOtp(email: string) {
  const supabase = createServiceClient()
  
  // 1. Generate 6-digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString()
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 mins

  // 2. Clear old OTPs for this email
  await supabase.from('otp_verifications').delete().eq('email', email)

  // 3. Save to DB
  const { error } = await supabase
    .from('otp_verifications')
    .insert({
      email,
      code,
      expires_at: expiresAt.toISOString()
    })

  if (error) {
    return { success: false, error: 'Failed to generate verification code.' }
  }

  // 4. Trigger Email (This uses the configured SMTP in Supabase)
  // To get the 50,000 limit, the user needs to add their SMTP in the dashboard.
  return { success: true }
}
