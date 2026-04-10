'use server'

import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { getSiteUrl } from '@/lib/site-url'

export async function registerUser(formData: {
  email: string
  password?: string
  fullName: string
}) {
  const { email, password, fullName } = formData
  const supabase = await createClient()

  // 2. Dynamic Server-Side Link Detection (v20 Build-Safe)
  let redirectBase = getSiteUrl()
  try {
    const headerList = await headers()
    const host = headerList.get('host')
    if (host && !host.includes('localhost')) {
      const protocol = host.includes('vercel.app') || !host.includes(':') ? 'https' : 'http'
      redirectBase = `${protocol}://${host}`
    }
  } catch (e) {
    // Fallback to getSiteUrl() if headers aren't available
  }

  // 1. Sign up in Supabase Auth (handles password hashing & security)
  const { data, error } = await supabase.auth.signUp({
    email,
    password: password || '',
    options: {
      data: {
        full_name: fullName,
      },
      // Since the user has Firebase SMTP linked, this will go through Firebase
      emailRedirectTo: `${redirectBase.replace(/\/$/, '')}/verify`,
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
