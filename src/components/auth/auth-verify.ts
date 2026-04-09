'use server'

import { createClient } from '@/lib/supabase/server'

export async function verifyOtp(email: string, otp: string) {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token: otp,
    type: 'signup',
  })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, session: data.session }
}

export async function resendOtp(email: string) {
  const supabase = await createClient()

  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}
