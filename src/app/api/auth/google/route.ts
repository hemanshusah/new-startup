import { NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/auth-utils'
import { google } from 'googleapis'

export async function GET() {
  const user = await getAuthenticatedUser()
  
  if (!user) {
    return NextResponse.redirect(new URL('/?redirect=/mentor/availability', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'))
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  )

  const scopes = [
    'https://www.googleapis.com/auth/calendar.readonly',
    'https://www.googleapis.com/auth/calendar.events'
  ]

  const authorizationUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline', // Requests a refresh token
    prompt: 'consent',      // Forces consent screen to ensure refresh token is returned
    scope: scopes,
    state: user.id          // Pass user ID to map the token back
  })

  return NextResponse.redirect(authorizationUrl)
}
