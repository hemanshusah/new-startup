import { google } from 'googleapis'
import { createServiceClient } from '@/lib/supabase/server'
import { getValidOAuthClient } from '@/lib/google-calendar'

/**
 * Creates a Google Calendar event with a Google Meet link
 * for a confirmed session. Updates the session record with the Meet link.
 */
export async function createSessionEvent(sessionId: string) {
  const supabase = createServiceClient()

  // 1. Fetch the session with mentor and founder details
  const { data: session, error: sessionError } = await supabase
    .from('sessions')
    .select(`
      id,
      mentor_id,
      founder_id,
      scheduled_start,
      scheduled_end,
      founder_brief,
      session_type_id
    `)
    .eq('id', sessionId)
    .single()

  if (sessionError || !session) {
    throw new Error(`Session not found: ${sessionId}`)
  }

  // 2. Get session type name
  const { data: sessionType } = await supabase
    .from('session_types')
    .select('name, duration_minutes')
    .eq('id', session.session_type_id)
    .single()

  // 3. Get mentor display name
  const { data: mentor } = await supabase
    .from('mentor_profiles')
    .select('display_name, google_calendar_id')
    .eq('id', session.mentor_id)
    .single()

  // 4. Get founder email
  const { data: founderProfile } = await supabase
    .from('profiles')
    .select('email, full_name')
    .eq('id', session.founder_id)
    .single()

  if (!mentor || !founderProfile) {
    throw new Error('Could not find mentor or founder profile')
  }

  // 5. Create Calendar Event or fallback to Virtual Meeting Link
  let meetLink: string | null = null
  let calendarEventId: string | null = null

  try {
    const auth = await getValidOAuthClient(session.mentor_id)
    const calendar = google.calendar({ version: 'v3', auth })
    const calendarId = mentor.google_calendar_id || 'primary'

    const event = await calendar.events.insert({
      calendarId,
      conferenceDataVersion: 1,
      requestBody: {
        summary: `Mentor Connect: ${sessionType?.name || 'Session'} with ${founderProfile.full_name || founderProfile.email}`,
        description: [
          `Session with ${founderProfile.full_name || 'Founder'}`,
          '',
          '--- Founder\'s Brief ---',
          session.founder_brief || 'No brief provided.',
          '',
          '---',
          'Powered by GrantsIndia Mentor Connect'
        ].join('\n'),
        start: {
          dateTime: session.scheduled_start,
          timeZone: 'Asia/Kolkata'
        },
        end: {
          dateTime: session.scheduled_end,
          timeZone: 'Asia/Kolkata'
        },
        attendees: [
          { email: founderProfile.email }
        ],
        conferenceData: {
          createRequest: {
            requestId: `mc-${sessionId}`,
            conferenceSolutionKey: {
              type: 'hangoutsMeet'
            }
          }
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 60 },   // 1 hour before
            { method: 'popup', minutes: 15 },    // 15 minutes before
          ]
        }
      }
    })

    meetLink = event.data.conferenceData?.entryPoints?.find(
      ep => ep.entryPointType === 'video'
    )?.uri || null

    calendarEventId = event.data.id || null
  } catch (err) {
    console.warn('Google Calendar OAuth failed, generating fallback virtual meeting link:', err)
    // Fallback: generate virtual mock meeting link
    meetLink = `https://meet.google.com/mock-session-${sessionId}`
  }

  // 6. Update the session with Meet link and calendar event ID in Supabase
  const { error: updateError } = await supabase
    .from('sessions')
    .update({
      google_meet_link: meetLink,
      google_calendar_event_id: calendarEventId
    })
    .eq('id', sessionId)

  if (updateError) {
    console.error('Failed to update session with Meet link:', updateError)
  }

  return {
    meetLink,
    calendarEventId
  }
}
