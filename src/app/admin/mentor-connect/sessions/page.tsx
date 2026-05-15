import { createServiceClient } from '@/lib/supabase/server'

export default async function AdminMentorConnectSessionsPage() {
  const supabase = createServiceClient()

  const { data: sessions } = await supabase
    .from('sessions')
    .select(`
      id,
      status,
      scheduled_start,
      amount_inr,
      mentor_profiles ( display_name ),
      founder_id
    `)
    .order('scheduled_start', { ascending: false })
    .limit(50)

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '26px', fontWeight: 400, color: 'var(--ink)', marginBottom: '4px' }}>
          Sessions
        </h1>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--ink-3)' }}>
          All booked sessions across all mentors.
        </p>
      </div>

      {!sessions || sessions.length === 0 ? (
        <div style={{ background: 'var(--white)', border: '1px solid var(--cream-border)', borderRadius: '12px', padding: '48px', textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--ink-4)' }}>
            No sessions booked yet.
          </p>
        </div>
      ) : (
        <div style={{ background: 'var(--white)', border: '1px solid var(--cream-border)', borderRadius: '12px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-sans)', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: 'var(--cream)', borderBottom: '1px solid var(--cream-border)' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 500, color: 'var(--ink-3)' }}>Mentor</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 500, color: 'var(--ink-3)' }}>Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 500, color: 'var(--ink-3)' }}>Date</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 500, color: 'var(--ink-3)' }}>Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s: any) => (
                <tr key={s.id} style={{ borderBottom: '1px solid var(--cream-border)' }}>
                  <td style={{ padding: '12px 16px', color: 'var(--ink)', fontWeight: 500 }}>
                    {s.mentor_profiles?.display_name ?? '—'}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 500,
                      background: s.status === 'confirmed' ? '#EDF5EA' : 'var(--cream)',
                      color: s.status === 'confirmed' ? '#2A6620' : 'var(--ink-3)',
                    }}>
                      {s.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--ink-3)' }}>
                    {new Date(s.scheduled_start).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--ink-3)' }}>
                    ₹{(s.amount_inr ?? 0).toLocaleString()}
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
