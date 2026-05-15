import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { createServiceClient } from '@/lib/supabase/server'
import { getAuthenticatedUser } from '@/lib/auth-utils'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Booking Confirmed | Mentor Connect'
}

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{ session?: string }>
}

export default async function BookingSuccessPage({ searchParams }: PageProps) {
  const { session: sessionId } = await searchParams

  if (!sessionId) redirect('/mentor-connect')

  const user = await getAuthenticatedUser()
  if (!user) redirect('/')

  const supabase = createServiceClient()

  // Fetch session with mentor and session type details
  const { data: session } = await supabase
    .from('sessions')
    .select(`
      id,
      status,
      scheduled_start,
      scheduled_end,
      google_meet_link,
      founder_brief,
      amount_inr,
      mentor_id,
      session_type_id
    `)
    .eq('id', sessionId)
    .eq('founder_id', user.id)
    .single()

  if (!session) notFound()

  // Fetch mentor
  const { data: mentor } = await supabase
    .from('mentor_profiles')
    .select('display_name, avatar_url, headline, slug')
    .eq('id', session.mentor_id)
    .single()

  // Fetch session type
  const { data: sessionType } = await supabase
    .from('session_types')
    .select('name, duration_minutes')
    .eq('id', session.session_type_id)
    .single()

  const startDate = new Date(session.scheduled_start)
  const endDate = new Date(session.scheduled_end)
  const dateString = startDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  const startTime = startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  const endTime = endDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })

  const isConfirmed = session.status === 'confirmed'

  return (
    <main style={{ background: 'var(--cream)', minHeight: 'calc(100vh - 56px)', padding: '60px 24px' }}>
      <div style={{ maxWidth: '640px', margin: '0 auto' }}>

        {/* Success Banner */}
        <div style={{ background: 'var(--white)', border: '1px solid var(--cream-border)', borderRadius: '16px', padding: '48px 40px', textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ width: '72px', height: '72px', background: '#EDF5EA', color: '#2A6620', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', margin: '0 auto 24px' }}>
            ✓
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', color: 'var(--ink)', margin: '0 0 12px' }}>
            {isConfirmed ? 'Session Confirmed!' : 'Booking Received'}
          </h1>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '15px', color: 'var(--ink-3)', lineHeight: 1.6, margin: 0 }}>
            {isConfirmed
              ? 'Your session has been confirmed. A calendar invite with the Google Meet link has been sent to your email.'
              : 'Your booking has been received and is awaiting payment confirmation.'
            }
          </p>
        </div>

        {/* Session Details Card */}
        <div style={{ background: 'var(--white)', border: '1px solid var(--cream-border)', borderRadius: '16px', padding: '32px', marginBottom: '32px' }}>
          {/* Mentor Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid var(--cream-border)' }}>
            {mentor?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={mentor.avatar_url} alt="" style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--cream-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-serif)', fontSize: '20px', color: 'var(--ink-4)' }}>
                {mentor?.display_name?.charAt(0) || 'M'}
              </div>
            )}
            <div>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '16px', fontWeight: 600, color: 'var(--ink)', margin: 0 }}>{mentor?.display_name}</p>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--ink-4)', margin: '2px 0 0' }}>{mentor?.headline}</p>
            </div>
          </div>

          {/* Session Details Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
            <div>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', fontWeight: 600, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 6px' }}>Session</p>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '15px', color: 'var(--ink)', margin: 0 }}>{sessionType?.name}</p>
            </div>
            <div>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', fontWeight: 600, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 6px' }}>Duration</p>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '15px', color: 'var(--ink)', margin: 0 }}>{sessionType?.duration_minutes} min</p>
            </div>
            <div>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', fontWeight: 600, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 6px' }}>Date</p>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '15px', color: 'var(--ink)', margin: 0 }}>{dateString}</p>
            </div>
            <div>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', fontWeight: 600, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 6px' }}>Time</p>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '15px', color: 'var(--ink)', margin: 0 }}>{startTime} — {endTime}</p>
            </div>
          </div>

          {/* Google Meet Link */}
          {session.google_meet_link && (
            <div style={{ padding: '16px 20px', background: '#EDF5EA', borderRadius: '10px', border: '1px solid #BBF7D0', marginBottom: '20px' }}>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', fontWeight: 600, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px' }}>Google Meet Link</p>
              <a
                href={session.google_meet_link}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontFamily: 'var(--font-sans)', fontSize: '15px', color: '#166534', fontWeight: 500, wordBreak: 'break-all' }}
              >
                {session.google_meet_link} ↗
              </a>
            </div>
          )}

          {/* Amount Paid */}
          {session.amount_inr > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '20px', borderTop: '1px solid var(--cream-border)' }}>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--ink-4)' }}>Amount Paid</span>
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', color: 'var(--ink)', fontWeight: 600 }}>₹{session.amount_inr.toLocaleString()}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <Link
            href="/profile/sessions"
            style={{
              padding: '14px 28px',
              background: 'var(--ink)',
              color: 'var(--white)',
              borderRadius: '8px',
              fontFamily: 'var(--font-sans)',
              fontSize: '15px',
              fontWeight: 500,
              textDecoration: 'none'
            }}
          >
            View My Sessions
          </Link>
          <Link
            href="/mentor-connect/mentors"
            style={{
              padding: '14px 28px',
              background: 'var(--white)',
              color: 'var(--ink)',
              border: '1px solid var(--cream-border)',
              borderRadius: '8px',
              fontFamily: 'var(--font-sans)',
              fontSize: '15px',
              fontWeight: 500,
              textDecoration: 'none'
            }}
          >
            Browse More Mentors
          </Link>
        </div>

      </div>
    </main>
  )
}
