'use server'

import { createServiceClient } from '@/lib/supabase/server'
import { getFirestoreDb } from '@/lib/firebase-admin'

interface TriggerBookingEmailsParams {
  sessionId: string
}

export async function triggerBookingEmails({ sessionId }: TriggerBookingEmailsParams) {
  const supabase = createServiceClient()

  try {
    // 1. Fetch complete session details from Supabase
    const { data: session, error: sessionErr } = await supabase
      .from('sessions')
      .select(`
        id,
        scheduled_start,
        scheduled_end,
        google_meet_link,
        founder_brief,
        amount_inr,
        mentor_id,
        founder_id,
        session_type_id
      `)
      .eq('id', sessionId)
      .single()

    if (sessionErr || !session) {
      console.error('Email trigger failed: Session not found in Supabase.', sessionErr)
      return { error: 'Session not found.' }
    }

    // 2. Fetch related profiles (Founder and Mentor) from Supabase
    const [founderRes, mentorRes, typeRes] = await Promise.all([
      supabase.from('profiles').select('email, full_name').eq('id', session.founder_id).single(),
      supabase.from('mentor_profiles').select('display_name, user_id').eq('id', session.mentor_id).single(),
      supabase.from('session_types').select('name, duration_minutes').eq('id', session.session_type_id).single()
    ])

    if (founderRes.error || !founderRes.data || mentorRes.error || !mentorRes.data || typeRes.error || !typeRes.data) {
      console.error('Email trigger failed: Could not fetch profiles from Supabase.', { founderRes, mentorRes, typeRes })
      return { error: 'Profiles not found.' }
    }

    const founderProfile = founderRes.data
    const mentorProfile = mentorRes.data
    const sessionType = typeRes.data

    // Fetch mentor's user profile to get their email address
    const { data: mentorUser, error: mentorUserErr } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', mentorProfile.user_id)
      .single()

    if (mentorUserErr || !mentorUser) {
      console.error('Email trigger failed: Could not fetch mentor user email.', mentorUserErr)
      return { error: 'Mentor user not found.' }
    }

    const startDate = new Date(session.scheduled_start)
    const dateString = startDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    const timeString = startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    const meetingLink = session.google_meet_link || `https://meet.google.com/mock-session-${sessionId}`

    // ── FOUNDER EMAIL HTML ──
    const founderHtml = `
      <div style="font-family: system-ui, -apple-system, sans-serif; background-color: #FAF9F5; padding: 40px 20px; color: #1A1A1A;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border: 1px solid #E8E5DD; border-radius: 16px; padding: 40px; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
          <div style="text-align: center; margin-bottom: 32px;">
            <span style="font-size: 24px; font-weight: bold; letter-spacing: -0.02em; color: #1A1A1A;">GrantsIndia</span>
            <div style="font-size: 13px; color: #737373; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.08em;">Mentor Connect</div>
          </div>
          
          <h2 style="font-size: 22px; margin: 0 0 16px; font-weight: 600; text-align: center;">Session Confirmed!</h2>
          <p style="font-size: 15px; line-height: 1.6; color: #404040; text-align: center; margin: 0 0 32px;">
            Your payment of <strong>₹${session.amount_inr.toLocaleString()}</strong> has been verified. Your session with <strong>${mentorProfile.display_name}</strong> is officially scheduled.
          </p>

          <div style="background-color: #FAF9F5; border-radius: 12px; border: 1px solid #E8E5DD; padding: 24px; margin-bottom: 32px;">
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr>
                <td style="padding: 6px 0; color: #737373; font-weight: 500; width: 120px;">Session Type</td>
                <td style="padding: 6px 0; color: #1A1A1A; font-weight: 600;">${sessionType.name} (${sessionType.duration_minutes} mins)</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #737373; font-weight: 500;">Host</td>
                <td style="padding: 6px 0; color: #1A1A1A; font-weight: 600;">${mentorProfile.display_name}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #737373; font-weight: 500;">Date</td>
                <td style="padding: 6px 0; color: #1A1A1A; font-weight: 600;">${dateString}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #737373; font-weight: 500;">Time</td>
                <td style="padding: 6px 0; color: #1A1A1A; font-weight: 600;">${timeString} (IST)</td>
              </tr>
            </table>
          </div>

          <div style="text-align: center; margin-bottom: 32px;">
            <p style="font-size: 13px; color: #737373; margin: 0 0 12px;">Guaranteed Meeting Link</p>
            <a href="${meetingLink}" target="_blank" style="display: inline-block; background-color: #1A1A1A; color: #FFFFFF; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 15px;">
              Join Google Meet
            </a>
          </div>

          <div style="border-top: 1px solid #E8E5DD; padding-top: 24px;">
            <p style="font-size: 12px; font-weight: 600; color: #737373; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 8px;">Your Brief Notes</p>
            <blockquote style="margin: 0; padding: 12px 16px; background-color: #F8FAFC; border-left: 3px solid #64748B; border-radius: 4px; font-size: 14px; line-height: 1.5; color: #334155; font-style: italic;">
              ${session.founder_brief || 'No notes provided.'}
            </blockquote>
          </div>

          <div style="border-top: 1px solid #E8E5DD; margin-top: 32px; padding-top: 24px; text-align: center; font-size: 12px; color: #A3A3A3;">
            This email was dispatched via Firebase SMTP relay because your booking was completed in Supabase.
          </div>
        </div>
      </div>
    `

    // ── MENTOR EMAIL HTML ──
    const mentorHtml = `
      <div style="font-family: system-ui, -apple-system, sans-serif; background-color: #FAF9F5; padding: 40px 20px; color: #1A1A1A;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border: 1px solid #E8E5DD; border-radius: 16px; padding: 40px; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
          <div style="text-align: center; margin-bottom: 32px;">
            <span style="font-size: 24px; font-weight: bold; letter-spacing: -0.02em; color: #1A1A1A;">GrantsIndia</span>
            <div style="font-size: 13px; color: #737373; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.08em;">Mentor Connect</div>
          </div>
          
          <h2 style="font-size: 22px; margin: 0 0 16px; font-weight: 600; text-align: center;">New Booking Received</h2>
          <p style="font-size: 15px; line-height: 1.6; color: #404040; text-align: center; margin: 0 0 32px;">
            Founder <strong>${founderProfile.full_name || 'A Founder'}</strong> has successfully booked a session with you.
          </p>

          <div style="background-color: #FAF9F5; border-radius: 12px; border: 1px solid #E8E5DD; padding: 24px; margin-bottom: 32px;">
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr>
                <td style="padding: 6px 0; color: #737373; font-weight: 500; width: 120px;">Session Type</td>
                <td style="padding: 6px 0; color: #1A1A1A; font-weight: 600;">${sessionType.name} (${sessionType.duration_minutes} mins)</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #737373; font-weight: 500;">Founder</td>
                <td style="padding: 6px 0; color: #1A1A1A; font-weight: 600;">${founderProfile.full_name} (${founderProfile.email})</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #737373; font-weight: 500;">Date</td>
                <td style="padding: 6px 0; color: #1A1A1A; font-weight: 600;">${dateString}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #737373; font-weight: 500;">Time</td>
                <td style="padding: 6px 0; color: #1A1A1A; font-weight: 600;">${timeString} (IST)</td>
              </tr>
            </table>
          </div>

          <div style="text-align: center; margin-bottom: 32px;">
            <p style="font-size: 13px; color: #737373; margin: 0 0 12px;">Guaranteed Meeting Link</p>
            <a href="${meetingLink}" target="_blank" style="display: inline-block; background-color: #1A1A1A; color: #FFFFFF; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 15px;">
              Join Google Meet
            </a>
          </div>

          <div style="border-top: 1px solid #E8E5DD; padding-top: 24px;">
            <p style="font-size: 12px; font-weight: 600; color: #737373; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 8px;">Founder's Brief / Notes</p>
            <blockquote style="margin: 0; padding: 12px 16px; background-color: #F8FAFC; border-left: 3px solid #64748B; border-radius: 4px; font-size: 14px; line-height: 1.5; color: #334155; font-style: italic;">
              ${session.founder_brief || 'No notes provided.'}
            </blockquote>
          </div>

          <div style="border-top: 1px solid #E8E5DD; margin-top: 32px; padding-top: 24px; text-align: center; font-size: 12px; color: #A3A3A3;">
            This email was dispatched via Firebase SMTP relay because a booking was confirmed in Supabase.
          </div>
        </div>
      </div>
    `

    // 3. Write documents to Firebase Firestore 'mail' collection
    try {
      const db = getFirestoreDb()
      if (!db) {
        console.warn('Firebase Firestore not initialized (credentials missing). Skipping email trigger queue.')
        return { success: true, mocked: true }
      }

      // Founder Email document
      await db.collection('mail').add({
        to: founderProfile.email,
        message: {
          subject: `Confirmed: Your Session with ${mentorProfile.display_name}`,
          text: `Your session with ${mentorProfile.display_name} is confirmed for ${dateString} at ${timeString}. Join Meet: ${meetingLink}`,
          html: founderHtml
        }
      })

      // Mentor Email document
      await db.collection('mail').add({
        to: mentorUser.email,
        message: {
          subject: `New Booking: Session with ${founderProfile.full_name || 'Founder'}`,
          text: `You have a new session booking with ${founderProfile.full_name} on ${dateString} at ${timeString}. Join Meet: ${meetingLink}`,
          html: mentorHtml
        }
      })

      console.log('Firebase SMTP triggers inserted successfully for session:', sessionId)
    } catch (fbErr) {
      console.error('Failed to write email triggers to Firebase Firestore (non-blocking):', fbErr)
      // Do not block the payment flow if email triggers fail locally
    }

    return { success: true }

  } catch (error: unknown) {
    console.error('Trigger booking emails error:', error)
    return { error: 'Failed to process booking emails.' }
  }
}
