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

  // Prefer request host (custom domain on Vercel sends x-forwarded-host) over env defaults
  let redirectBase = getSiteUrl()
  try {
    const headerList = await headers()
    const forwarded = headerList.get('x-forwarded-host')
    const rawHost = forwarded?.split(',')[0]?.trim() || headerList.get('host')
    if (rawHost && !rawHost.includes('localhost')) {
      const proto =
        headerList.get('x-forwarded-proto')?.split(',')[0]?.trim() ||
        (rawHost.includes('localhost') ? 'http' : 'https')
      redirectBase = `${proto}://${rawHost}`
    }
  } catch {
    // Fallback to getSiteUrl()
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
