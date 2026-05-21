import { createServiceClient } from '@/lib/supabase/server'
import { getAuthenticatedUser } from '@/lib/auth-utils'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { FounderSessionsList } from '@/components/mentor-connect/FounderSessionsList'

export const metadata: Metadata = {
  title: 'My Sessions | Mentor Connect'
}

export const dynamic = 'force-dynamic'

export default async function MySessionsPage() {
  const user = await getAuthenticatedUser()
  if (!user) redirect('/')

  const supabase = createServiceClient()

  // 1. Fetch standard booked sessions
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
      session_type_id,
      created_at,
      negotiation_timeline
    `)
    .eq('founder_id', user.id)
    .order('scheduled_start', { ascending: false })

  // 2. Fetch custom meeting requests
  const { data: requests } = await supabase
    .from('meeting_requests')
    .select(`
      id,
      mentor_id,
      session_type_id,
      proposed_start,
      proposed_end,
      proposed_start_2,
      proposed_end_2,
      offered_start,
      offered_end,
      offered_amount_inr,
      founder_brief,
      amount_inr,
      status,
      created_at,
      negotiation_timeline
    `)
    .eq('founder_id', user.id)
    .order('created_at', { ascending: false })

  // 3. Extract all unique mentor and session type IDs across both bookings and requests
  const sessionMentorIds = sessions?.map(s => s.mentor_id) || []
  const requestMentorIds = requests?.map(r => r.mentor_id) || []
  const mentorIds = [...new Set([...sessionMentorIds, ...requestMentorIds])]

  const sessionTypeIdsRaw = sessions?.map(s => s.session_type_id) || []
  const requestTypeIdsRaw = requests?.map(r => r.session_type_id) || []
  const sessionTypeIds = [...new Set([...sessionTypeIdsRaw, ...requestTypeIdsRaw])].filter(Boolean)

  // 4. Fetch details
  const { data: mentors } = mentorIds.length > 0
    ? await supabase.from('mentor_profiles').select('id, display_name, avatar_url, slug').in('id', mentorIds)
    : { data: [] }
  const mentorMap = Object.fromEntries((mentors || []).map(m => [m.id, m]))

  const { data: sessionTypes } = sessionTypeIds.length > 0
    ? await supabase.from('session_types').select('id, name, duration_minutes').in('id', sessionTypeIds)
    : { data: [] }
  const sessionTypeMap = Object.fromEntries((sessionTypes || []).map(st => [st.id, st]))

  // 5. Fetch reviews
  const sessionIds = sessions?.map(s => s.id) || []
  const { data: reviews } = sessionIds.length > 0
    ? await supabase.from('reviews').select('session_id').in('session_id', sessionIds)
    : { data: [] }
  const reviewedSessionIds = reviews?.map(r => r.session_id) || []

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '26px', fontWeight: 400, color: 'var(--ink)', marginBottom: '4px' }}>
          My Sessions
        </h1>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--ink-3)' }}>
          Manage your upcoming mentorship interactions, join virtual calls, and view booking history.
        </p>
      </div>

      <FounderSessionsList
        initialSessions={sessions || []}
        mentorMap={mentorMap}
        sessionTypeMap={sessionTypeMap}
        reviewedSessionIds={reviewedSessionIds}
        initialRequests={requests || []}
      />
    </div>
  )
}
