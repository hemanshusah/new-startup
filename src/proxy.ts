/**
 * ⚠️ CAUTION: NEXT.JS 16 PROXY (MIDDLEWARE)
 * This file now handles Auth.js session protection.
 * See REVERT_AUTH_MIGRATION.md if you need to roll back to Supabase Auth.
 */
import { auth } from "@/auth"
import { type NextRequest, NextResponse } from 'next/server'
import { createServiceClient, createClient } from '@/lib/supabase/server'

export default async function proxy(request: NextRequest) {
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

  // Step 3: Enforce Onboarding - Log out users who bypass the gate
  const onboardingAllowedPaths = [
    '/onboarding',
    '/api/auth',
    '/verify',
    '/logout',
    '/_next',
    '/favicon.ico',
    '/api/softinfra',
    '/api/auth/session'
  ]

  // Check if current path is allowed during onboarding
  const isOnboardingPath = onboardingAllowedPaths.some(p => 
    pathname === p || pathname.startsWith(p + '/')
  )

  if (userEmail && !isOnboardingPath) {
    const supabase = createServiceClient()
    const { data: profile } = await supabase
      .from('profiles')
      .select('account_intent')
      .eq('email', userEmail)
      .single()

    // DEBUG: console.log(`[Onboarding Gate] Path: ${pathname} | Intent: ${profile?.account_intent}`)

    if (!profile?.account_intent) {
      const referer = request.headers.get('referer') || ''
      const isComingFromOnboarding = referer.includes('/onboarding')
      
      const cookieNames = [
        'next-auth.session-token',
        '__Secure-next-auth.session-token',
        'next-auth.callback-url',
        'next-auth.csrf-token',
        'sb-access-token',
        'sb-refresh-token'
      ]

      if (pathname === '/') {
        if (isComingFromOnboarding) {
          // They deliberately left onboarding for the home page -> LOG OUT
          const response = NextResponse.next()
          cookieNames.forEach(name => response.cookies.delete(name))
          return response
        } else {
          // They just logged in or landed on home without intent -> REDIRECT TO ONBOARDING
          return NextResponse.redirect(new URL('/onboarding', request.url))
        }
      }

      // Any other path (like /programs) -> LOG OUT
      const guestUrl = new URL('/', request.url)
      const response = NextResponse.redirect(guestUrl)
      cookieNames.forEach(name => response.cookies.delete(name))
      return response
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
