import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export default async function AdminGroupSessionsPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Fetch group sessions
  const { data: sessions, error } = await supabase
    .from('group_sessions')
    .select('*')
    .order('scheduled_start', { ascending: false })
    .limit(100)

  let mergedSessions: any[] = []
  let debugInfo = ''

  if (error) {
    debugInfo = `Database Error: ${error.message}`
  } else if (!sessions) {
    debugInfo = 'No group sessions found.'
  } else if (sessions.length > 0) {
    try {
      const mentorIds = Array.from(new Set(sessions.map(s => s.mentor_id)))
      const { data: mentors } = await supabase
        .from('mentor_profiles')
        .select('id, display_name, slug')
        .in('id', mentorIds)

      const mentorMap = new Map(mentors?.map(m => [m.id, m]))

      mergedSessions = sessions.map(s => ({
        ...s,
        mentor: mentorMap.get(s.mentor_id)
      }))
    } catch (err: any) {
      debugInfo = `Processing Error: ${err.message}`
    }
  }

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '26px', fontWeight: 400, color: 'var(--ink)', marginBottom: '4px' }}>
          Group Office Hours
        </h1>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--ink-3)' }}>
          Manage and monitor all group office hours sessions hosted by mentors.
        </p>
      </div>

      {debugInfo && (
        <div style={{ padding: '16px', background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '12px', color: '#991B1B', marginBottom: '24px', fontSize: '13px', fontFamily: 'var(--font-sans)' }}>
          ⚠️ {debugInfo}
        </div>
      )}

      {mergedSessions.length === 0 ? (
        <div style={{ background: 'var(--white)', border: '1px solid var(--cream-border)', borderRadius: '12px', padding: '48px', textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--ink-4)', margin: 0 }}>
            No group sessions found.
          </p>
        </div>
      ) : (
        <div style={{ background: 'var(--white)', border: '1px solid var(--cream-border)', borderRadius: '12px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-sans)', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: 'var(--cream)', borderBottom: '1px solid var(--cream-border)' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 500, color: 'var(--ink-3)' }}>Session Title</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 500, color: 'var(--ink-3)' }}>Mentor</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 500, color: 'var(--ink-3)' }}>Date & Time</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 500, color: 'var(--ink-3)' }}>Seats Booked</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 500, color: 'var(--ink-3)' }}>Price</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 500, color: 'var(--ink-3)' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {mergedSessions.map((s) => (
                <tr key={s.id} style={{ borderBottom: '1px solid var(--cream-border)' }}>
                  <td style={{ padding: '12px 16px', color: 'var(--ink)', fontWeight: 500 }}>
                    <a href={`/mentor-connect/group-sessions/${s.slug}`} target="_blank" style={{ color: 'var(--accent)', textDecoration: 'none' }}>
                      {s.title} ↗
                    </a>
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--ink)' }}>
                    {s.mentor?.display_name || '—'}
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--ink-3)' }}>
                    {new Date(s.scheduled_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at{' '}
                    {new Date(s.scheduled_start).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--ink)' }}>
                    <strong>{s.seats_booked || 0}</strong> / {s.max_seats}
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--ink)' }}>
                    ₹{s.price_inr.toLocaleString()}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 500,
                      background: s.status === 'scheduled' ? '#EDF5EA' : s.status === 'completed' ? 'var(--cream)' : '#FEF2F2',
                      color: s.status === 'scheduled' ? '#2A6620' : 'var(--ink-3)',
                    }}>
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
