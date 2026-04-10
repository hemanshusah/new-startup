import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

/**
 * Root-level Verification & Callback Route
 * Handles 'confirm' links and PKCE codes without conflicting with NextAuth.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const code = searchParams.get('code')
  const type = searchParams.get('type') as EmailOtpType | null
  const view = searchParams.get('view')
  const next = searchParams.get('next') ?? '/profile'

  console.log(`[Verify Route] Processing: ${type} | Token: ${token_hash ? 'Yes' : 'No'} | Code: ${code ? 'Yes' : 'No'}`)

  // Create a response first so cookies can be set on it
  let response = NextResponse.redirect(new URL(next, origin))

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Case 1: Token Hash (Standard Confirm Link)
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash })
    if (!error) {
      if (type === 'recovery' || view === 'reset') {
        // FORCE redirect to root Home Page with reset view
        const resetUrl = new URL('/', origin)
        resetUrl.searchParams.set('view', 'reset')
        return NextResponse.redirect(resetUrl, {
          headers: response.headers // Pass through cookies
        })
      } else {
        const profileUrl = new URL(next, origin)
        profileUrl.searchParams.set('verified', 'true')
        return NextResponse.redirect(profileUrl, {
          headers: response.headers // Pass through cookies
        })
      }
    }
    console.error(`[Verify Route] verifyOtp Error: ${error.message}`)
  }

  // Case 2: PKCE Code
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Check if we came from a recovery-ish path or just a regular signup
      if (next.includes('view=reset') || request.url.includes('type=recovery') || view === 'reset') {
        const resetUrl = new URL('/', origin)
        resetUrl.searchParams.set('view', 'reset')
        return NextResponse.redirect(resetUrl, {
          headers: response.headers // Pass through cookies
        })
      } else {
        const profileUrl = new URL(next, origin)
        profileUrl.searchParams.set('verified', 'true')
        return NextResponse.redirect(profileUrl, {
          headers: response.headers // Pass through cookies
        })
      }
    }
    console.error(`[Verify Route] PKCE Error: ${error.message}`)
  }

  // Fallback to error
  return NextResponse.redirect(new URL('/error', origin))
}
