import { createServiceClient } from '@/lib/supabase/server'
import { getAuthenticatedUser } from '@/lib/auth-utils'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'My Sessions | Mentor Connect'
}

export const dynamic = 'force-dynamic'

export default async function MySessionsPage() {
  const user = await getAuthenticatedUser()
  if (!user) redirect('/')

  const supabase = createServiceClient()

  // Fetch all sessions for this founder
  const { data: sessions } = await supabase
    .from('sessions')
    .select(`
      id,
      status,
      scheduled_start,
      scheduled_end,
      google_meet_link,
      amount_inr,
      founder_brief,
      mentor_id,
      session_type_id
    `)
    .eq('founder_id', user.id)
    .order('scheduled_start', { ascending: false })

  // Fetch mentor details for all sessions
  const mentorIds = [...new Set(sessions?.map(s => s.mentor_id) || [])]
  const { data: mentors } = mentorIds.length > 0
    ? await supabase.from('mentor_profiles').select('id, display_name, avatar_url, slug').in('id', mentorIds)
    : { data: [] }

  const mentorMap = Object.fromEntries((mentors || []).map(m => [m.id, m]))

  // Fetch session type names
  const sessionTypeIds = [...new Set(sessions?.map(s => s.session_type_id) || [])]
  const { data: sessionTypes } = sessionTypeIds.length > 0
    ? await supabase.from('session_types').select('id, name').in('id', sessionTypeIds)
    : { data: [] }

  const sessionTypeMap = Object.fromEntries((sessionTypes || []).map(st => [st.id, st]))

  // Split into upcoming and past
  const now = new Date()
  const upcoming = (sessions || []).filter(s => new Date(s.scheduled_start) > now && s.status !== 'cancelled')
  const past = (sessions || []).filter(s => new Date(s.scheduled_start) <= now || s.status === 'cancelled')

  const StatusBadge = ({ status }: { status: string }) => {
    const colors: Record<string, { bg: string; text: string }> = {
      confirmed: { bg: '#EDF5EA', text: '#166534' },
      completed: { bg: '#EDF5EA', text: '#166534' },
      pending_payment: { bg: '#FFFBEB', text: '#92400E' },
      cancelled: { bg: '#FEF2F2', text: '#991B1B' },
    }
    const c = colors[status] || { bg: 'var(--cream)', text: 'var(--ink-3)' }
    const label = status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())

    return (
      <span style={{
        padding: '4px 10px',
        borderRadius: '6px',
        background: c.bg,
        color: c.text,
        fontFamily: 'var(--font-sans)',
        fontSize: '12px',
        fontWeight: 600,
        textTransform: 'capitalize'
      }}>
        {label}
      </span>
    )
  }

  const SessionCard = ({ session: s }: { session: typeof sessions extends (infer T)[] | null ? T : never }) => {
    const mentor = mentorMap[s.mentor_id]
    const st = sessionTypeMap[s.session_type_id]
    const startDate = new Date(s.scheduled_start)
    const dateStr = startDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    const timeStr = startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    const isUpcoming = startDate > now && s.status !== 'cancelled'

    return (
      <div style={{ background: 'var(--white)', border: '1px solid var(--cream-border)', borderRadius: '12px', padding: '20px', display: 'flex', gap: '16px', alignItems: 'center' }}>
        {/* Mentor Avatar */}
        {mentor?.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={mentor.avatar_url} alt="" style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
        ) : (
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--cream-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-serif)', fontSize: '18px', color: 'var(--ink-4)', flexShrink: 0 }}>
            {mentor?.display_name?.charAt(0) || 'M'}
          </div>
        )}

        {/* Details */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '15px', fontWeight: 600, color: 'var(--ink)', margin: 0 }}>
              {st?.name || 'Session'}
            </p>
            <StatusBadge status={s.status} />
          </div>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--ink-3)', margin: '0 0 2px' }}>
            with {mentor?.display_name || 'Mentor'}
          </p>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--ink-4)', margin: 0 }}>
            {dateStr} at {timeStr}
          </p>
        </div>

        {/* Action */}
        <div style={{ flexShrink: 0 }}>
          {isUpcoming && s.google_meet_link ? (
            <a
              href={s.google_meet_link}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '8px 16px',
                background: '#166534',
                color: '#fff',
                borderRadius: '8px',
                fontFamily: 'var(--font-sans)',
                fontSize: '13px',
                fontWeight: 500,
                textDecoration: 'none'
              }}
            >
              Join Meet
            </a>
          ) : (
            <Link
              href={`/mentor-connect/book/success?session=${s.id}`}
              style={{
                padding: '8px 16px',
                background: 'var(--cream)',
                color: 'var(--ink)',
                borderRadius: '8px',
                border: '1px solid var(--cream-border)',
                fontFamily: 'var(--font-sans)',
                fontSize: '13px',
                fontWeight: 500,
                textDecoration: 'none'
              }}
            >
              View Details
            </Link>
          )}
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Upcoming Sessions */}
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: '16px', fontWeight: 600, color: 'var(--ink)', margin: '0 0 16px' }}>
          Upcoming Sessions ({upcoming.length})
        </h2>
        {upcoming.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {upcoming.map(s => <SessionCard key={s.id} session={s} />)}
          </div>
        ) : (
          <div style={{ background: 'var(--white)', border: '1px solid var(--cream-border)', borderRadius: '12px', padding: '40px', textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--ink-4)', margin: '0 0 16px' }}>
              You don&apos;t have any upcoming sessions.
            </p>
            <Link
              href="/mentor-connect/mentors"
              style={{
                padding: '10px 20px',
                background: 'var(--ink)',
                color: 'var(--white)',
                borderRadius: '8px',
                fontFamily: 'var(--font-sans)',
                fontSize: '14px',
                fontWeight: 500,
                textDecoration: 'none'
              }}
            >
              Browse Mentors
            </Link>
          </div>
        )}
      </div>

      {/* Past Sessions */}
      {past.length > 0 && (
        <div>
          <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: '16px', fontWeight: 600, color: 'var(--ink)', margin: '0 0 16px' }}>
            Past Sessions ({past.length})
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {past.map(s => <SessionCard key={s.id} session={s} />)}
          </div>
        </div>
      )}
    </div>
  )
}
