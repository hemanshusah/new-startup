import { NextResponse } from 'next/server'
import { google } from 'googleapis'
import { createServiceClient } from '@/lib/supabase/server'
import { encryptToken } from '@/lib/crypto'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const userId = url.searchParams.get('state') // We passed user.id in state
  const error = url.searchParams.get('error')

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  if (error) {
    console.error('Google OAuth error:', error)
    return NextResponse.redirect(`${baseUrl}/mentor/availability?error=oauth_rejected`)
  }

  if (!code || !userId) {
    return NextResponse.redirect(`${baseUrl}/mentor/availability?error=invalid_request`)
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  )

  try {
    const { tokens } = await oauth2Client.getToken(code)
    
    // Encrypt tokens
    const encryptedAccessToken = tokens.access_token ? encryptToken(tokens.access_token) : null
    const encryptedRefreshToken = tokens.refresh_token ? encryptToken(tokens.refresh_token) : null

    const supabase = createServiceClient()
    
    // Prepare update data
    const updateData: any = {}
    if (encryptedAccessToken) updateData.google_access_token = encryptedAccessToken
    if (encryptedRefreshToken) updateData.google_refresh_token = encryptedRefreshToken
    if (tokens.expiry_date) updateData.google_token_expiry = new Date(tokens.expiry_date).toISOString()

    const { error: dbError } = await supabase
      .from('mentor_profiles')
      .update(updateData)
      .eq('user_id', userId)

    if (dbError) {
      console.error('Database error saving tokens:', dbError)
      return NextResponse.redirect(`${baseUrl}/mentor/availability?error=db_error`)
    }

    return NextResponse.redirect(`${baseUrl}/mentor/availability?success=calendar_connected`)
  } catch (error) {
    console.error('Error exchanging code for tokens:', error)
    return NextResponse.redirect(`${baseUrl}/mentor/availability?error=token_exchange_failed`)
  }
}
