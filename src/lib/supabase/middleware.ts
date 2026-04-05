import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Updates the Supabase session from the request cookies and returns
 * the refreshed response alongside the current authenticated user.
 * Must be called at the top of middleware before any redirect logic.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Write cookies to the request (for downstream middleware)
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          // Create a fresh response and write cookies to it
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Do not add any logic between createServerClient and getUser().
  // getUser() refreshes the session token if it has expired.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return { supabaseResponse, user, supabase }
}
