import { createServiceClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function AdminMentorConnectMentorsPage() {
  const supabase = createServiceClient()

  const { data: mentors } = await supabase
    .from('mentor_profiles')
    .select('id, display_name, slug, status, verification_tier, created_at')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '26px', fontWeight: 400, color: 'var(--ink)', marginBottom: '4px' }}>
          Mentors
        </h1>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--ink-3)' }}>
          Approve, suspend, or manage all mentor profiles.
        </p>
      </div>

      {!mentors || mentors.length === 0 ? (
        <div style={{ background: 'var(--white)', border: '1px solid var(--cream-border)', borderRadius: '12px', padding: '48px', textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--ink-4)' }}>
            No mentor profiles yet. Once founders apply at /mentor-connect/apply, they will appear here.
          </p>
        </div>
      ) : (
        <div style={{ background: 'var(--white)', border: '1px solid var(--cream-border)', borderRadius: '12px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-sans)', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: 'var(--cream)', borderBottom: '1px solid var(--cream-border)' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 500, color: 'var(--ink-3)' }}>Name</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 500, color: 'var(--ink-3)' }}>Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 500, color: 'var(--ink-3)' }}>Tier</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 500, color: 'var(--ink-3)' }}>Applied</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 500, color: 'var(--ink-3)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {mentors.map((m) => (
                <tr key={m.id} style={{ borderBottom: '1px solid var(--cream-border)' }}>
                  <td style={{ padding: '12px 16px', color: 'var(--ink)', fontWeight: 500 }}>{m.display_name}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 500,
                      background: m.status === 'active' ? '#EDF5EA' : m.status === 'pending' ? '#FFF9EA' : '#FDF0EA',
                      color: m.status === 'active' ? '#2A6620' : m.status === 'pending' ? '#9B5A00' : '#B8460A',
                    }}>
                      {m.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--ink-3)' }}>{m.verification_tier}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--ink-3)' }}>
                    {new Date(m.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <Link href={`/admin/mentor-connect/mentors/${m.id}`} style={{ color: 'var(--accent)', fontSize: '12px', textDecoration: 'none' }}>
                      Review →
                    </Link>
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
