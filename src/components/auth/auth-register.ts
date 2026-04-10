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
      // Since the user has Firebase SMTP linked, this will go through Firebase
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/verify`,
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
