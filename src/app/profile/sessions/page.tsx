import { createServiceClient } from '@/lib/supabase/server'
import { getAuthenticatedUser } from '@/lib/auth-utils'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { FounderSessionCard } from '@/components/mentor-connect/FounderSessionCard'

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

  // Fetch submitted reviews
  const sessionIds = sessions?.map(s => s.id) || []
  const { data: reviews } = sessionIds.length > 0
    ? await supabase.from('reviews').select('session_id').in('session_id', sessionIds)
    : { data: [] }
  const reviewedSessionIds = new Set(reviews?.map(r => r.session_id) || [])

  // Split into upcoming and past
  const now = new Date()
  const upcoming = (sessions || []).filter(s => new Date(s.scheduled_start) > now && s.status !== 'cancelled')
  const past = (sessions || []).filter(s => new Date(s.scheduled_start) <= now || s.status === 'cancelled')

  return (
    <div>
      {/* Upcoming Sessions */}
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: '16px', fontWeight: 600, color: 'var(--ink)', margin: '0 0 16px' }}>
          Upcoming Sessions ({upcoming.length})
        </h2>
        {upcoming.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {upcoming.map(s => (
              <FounderSessionCard
                key={s.id}
                session={s}
                mentor={mentorMap[s.mentor_id]}
                sessionType={sessionTypeMap[s.session_type_id]}
                hasReviewedInitial={reviewedSessionIds.has(s.id)}
                nowString={now.toISOString()}
              />
            ))}
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
            {past.map(s => (
              <FounderSessionCard
                key={s.id}
                session={s}
                mentor={mentorMap[s.mentor_id]}
                sessionType={sessionTypeMap[s.session_type_id]}
                hasReviewedInitial={reviewedSessionIds.has(s.id)}
                nowString={now.toISOString()}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
