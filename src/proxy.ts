/**
 * ⚠️ CAUTION: NEXT.JS 16 PROXY (MIDDLEWARE)
 * This file now handles Auth.js session protection.
 * See REVERT_AUTH_MIGRATION.md if you need to roll back to Supabase Auth.
 */
import { auth } from "@/auth"
import { type NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

/**
 * Proxy (Next.js 16 Middleware) — Handles global request interception.
 * Replaces the deprecated middleware.ts convention.
 */
export async function proxy(request: NextRequest) {
  const session = await auth()
  const user = session?.user
  
  const { pathname } = request.nextUrl

  // Step 1: Protect /programs/[slug] routes — require authentication.
  // If the user is not logged in, redirect to / with a ?redirect param
  if (pathname.startsWith('/programs/')) {
    if (!user) {
      const redirectUrl = new URL('/', request.url)
      redirectUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(redirectUrl)
    }
  }

  // Step 2: Protect /admin/* routes — require admin role.
  if (pathname.startsWith('/admin')) {
    if (!user?.email) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    // Use service client to bypass RLS for role checks based on email
    const supabase = createServiceClient()
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('email', user.email)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return NextResponse.next()
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
