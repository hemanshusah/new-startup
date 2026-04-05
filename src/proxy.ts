import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function proxy(request: NextRequest) {
  // Step 1: Refresh the Supabase session on every request.
  // This MUST happen before any redirect logic to keep the session alive.
  const { supabaseResponse, user, supabase } = await updateSession(request)

  // Step 2: Protect /programs/[slug] routes — require authentication.
  // If the user is not logged in, redirect to / with a ?redirect param
  // so the listing page can open the auth modal and redirect back after login.
  if (request.nextUrl.pathname.startsWith('/programs/')) {
    if (!user) {
      const redirectUrl = new URL('/', request.url)
      redirectUrl.searchParams.set('redirect', request.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }
  }

  // Step 3: Protect /admin/* routes — require admin role.
  // No session → redirect home silently.
  // Session but not admin → redirect home silently (per CONTEXT.md §9).
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!user) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static (static assets)
     * - _next/image (image optimisation)
     * - favicon.ico, sitemap.xml, robots.txt
     * - Public images (svg, png, jpg, jpeg, gif, webp)
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
