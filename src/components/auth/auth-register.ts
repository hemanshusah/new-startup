'use server'

import { createClient } from '@/lib/supabase/server'

export async function registerUser(formData: {
  email: string
  password?: string
  fullName: string
}) {
  const { email, password, fullName } = formData
  const supabase = await createClient()

  // 1. Sign up in Supabase Auth (handles password hashing & security)
  const { data, error } = await supabase.auth.signUp({
    email,
    password: password || '',
    options: {
      data: {
        full_name: fullName,
      },
      // Automatically confirm email for this demo/startup stage if desired, 
      // or let Supabase send a verification email.
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback`,
    },
  })

  if (error) {
    return { success: false, error: error.message }
  }

  // 2. Generate and trigger OTP (New flow)
  const { sendOtp } = await import('./auth-verify')
  await sendOtp(email)

  return { 
    success: true, 
    user: data.user,
    confirmationRequired: true // Force confirmation flow
  }
}
