/**
 * ⚠️ CAUTION: NEXT.JS 16 PROXY (MIDDLEWARE)
 * This file now handles Auth.js session protection.
 * See REVERT_AUTH_MIGRATION.md if you need to roll back to Supabase Auth.
 */
import { auth } from "@/auth"
import { type NextRequest, NextResponse } from 'next/server'
import { createServiceClient, createClient } from '@/lib/supabase/server'

export async function proxy(request: NextRequest) {
  // 1. Check Auth.js session
  const session = await auth()
  let userEmail = session?.user?.email
  let userId = session?.user?.id

  // 2. Check Supabase session if Auth.js failed
  if (!userEmail) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    userEmail = user?.email
    userId = user?.id
  }
  const { pathname } = request.nextUrl
  
  // Step 1: Protect /programs/[slug] routes — require authentication.
  // If the user is not logged in, redirect to / with a ?redirect param
  if (pathname.startsWith('/programs/')) {
    if (!userEmail) {
      const redirectUrl = new URL('/', request.url)
      redirectUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(redirectUrl)
    }
  }

  // Step 2: Protect /admin/* routes — require admin role.
  if (pathname.startsWith('/admin')) {
    if (!userEmail) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    // Use service client to bypass RLS for role checks based on email
    const supabase = createServiceClient()
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('email', userEmail)
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
