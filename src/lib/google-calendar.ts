import { google } from 'googleapis'
import { createServiceClient } from '@/lib/supabase/server'
import { decryptToken, encryptToken } from '@/lib/crypto'

/**
 * Returns an authenticated OAuth2 client for a given mentor.
 * Handles token decryption and automatic refreshing if expired.
 */
export async function getValidOAuthClient(mentorId: string) {
  const supabase = createServiceClient()

  const { data: mentor, error } = await supabase
    .from('mentor_profiles')
    .select('google_access_token, google_refresh_token, google_token_expiry')
    .eq('id', mentorId)
    .single()

  if (error || !mentor) {
    throw new Error('Mentor not found or database error')
  }

  if (!mentor.google_access_token || !mentor.google_refresh_token) {
    throw new Error('Mentor has not connected their Google Calendar')
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  )

  const accessToken = decryptToken(mentor.google_access_token)
  const refreshToken = decryptToken(mentor.google_refresh_token)

  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
    expiry_date: mentor.google_token_expiry ? new Date(mentor.google_token_expiry).getTime() : undefined
  })

  // Handle token refresh automatically
  oauth2Client.on('tokens', async (tokens) => {
    const updateData: any = {}
    
    if (tokens.access_token) {
      updateData.google_access_token = encryptToken(tokens.access_token)
    }
    if (tokens.refresh_token) {
      updateData.google_refresh_token = encryptToken(tokens.refresh_token)
    }
    if (tokens.expiry_date) {
      updateData.google_token_expiry = new Date(tokens.expiry_date).toISOString()
    }

    if (Object.keys(updateData).length > 0) {
      await supabase
        .from('mentor_profiles')
        .update(updateData)
        .eq('id', mentorId)
    }
  })

  // Ensure tokens are fresh
  const tokenInfo = await oauth2Client.getAccessToken()
  if (!tokenInfo.token) {
    throw new Error('Failed to obtain a valid access token')
  }

  return oauth2Client
}

/**
 * Fetches the busy intervals for a mentor's primary calendar
 * between timeMin and timeMax.
 */
export async function getMentorBusyIntervals(mentorId: string, timeMin: Date, timeMax: Date) {
  const auth = await getValidOAuthClient(mentorId)
  const calendar = google.calendar({ version: 'v3', auth })

  const res = await calendar.freebusy.query({
    requestBody: {
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      timeZone: 'UTC', // the response will be in UTC
      items: [{ id: 'primary' }]
    }
  })

  const busyIntervals = res.data.calendars?.primary?.busy || []
  
  return busyIntervals.map(interval => ({
    start: new Date(interval.start as string),
    end: new Date(interval.end as string)
  }))
}
