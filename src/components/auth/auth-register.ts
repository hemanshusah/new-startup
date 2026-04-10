'use server'

import { createClient } from '@/lib/supabase/server'
import { getSiteUrl } from '@/lib/site-url'

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
      // Since the user has Firebase SMTP linked, this will go through Firebase
      emailRedirectTo: `${getSiteUrl()}/verify`,
    },
  })

  if (error) {
    return { success: false, error: error.message }
  }

  return { 
    success: true, 
    user: data.user
  }
}
