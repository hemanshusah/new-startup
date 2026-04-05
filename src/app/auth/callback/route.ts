import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * OAuth callback handler — exchanges the Supabase auth code for a session.
 * Called by Supabase after Google (or any provider) redirect.
 * Redirects: to `next` param if present, else to `/`
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Something went wrong — redirect to login with error state
  return NextResponse.redirect(`${origin}/?auth_error=callback_failed`)
}
