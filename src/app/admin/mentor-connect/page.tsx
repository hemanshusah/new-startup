import { createServiceClient } from '@/lib/supabase/server'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AdminMentorConnectPage() {
  const supabase = createServiceClient()

  // Fetch basic stats
  const [
    { count: totalMentors },
    { count: pendingMentors },
    { count: totalSessions },
    { data: mentors },
  ] = await Promise.all([
    supabase.from('mentor_profiles').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('mentor_profiles').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('sessions').select('*', { count: 'exact', head: true }),
    supabase.from('mentor_profiles').select('id, display_name, slug, status, created_at').order('created_at', { ascending: false }).limit(10),
  ])

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{
          fontFamily: 'var(--font-serif), serif',
          fontSize: '26px',
          fontWeight: 400,
          color: 'var(--ink)',
          marginBottom: '4px',
        }}>
          Mentor Connect
        </h1>
        <p style={{ fontFamily: 'var(--font-sans), sans-serif', fontSize: '13px', color: 'var(--ink-3)' }}>
          Manage mentors, sessions, and module settings.
        </p>
      </div>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
        {[
          { label: 'Active Mentors', value: totalMentors ?? 0 },
          { label: 'Pending Approvals', value: pendingMentors ?? 0 },
          { label: 'Total Sessions', value: totalSessions ?? 0 },
        ].map((stat) => (
          <div key={stat.label} style={{
            background: 'var(--white)',
            border: '1px solid var(--cream-border)',
            borderRadius: '12px',
            padding: '20px',
          }}>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px' }}>
              {stat.label}
            </p>
            <p style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', color: 'var(--ink)', margin: 0 }}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '32px', alignItems: 'start' }}>
        {/* Mentors Table (Main Column) */}
        <div>
          <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: 400, color: 'var(--ink)', margin: 0 }}>
              Recent Applications
            </h2>
          </div>

          {!mentors || mentors.length === 0 ? (
            <div style={{ background: 'var(--white)', border: '1px solid var(--cream-border)', borderRadius: '12px', padding: '48px', textAlign: 'center' }}>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--ink-4)' }}>
                No mentor profiles yet.
              </p>
            </div>
          ) : (
            <div style={{ background: 'var(--white)', border: '1px solid var(--cream-border)', borderRadius: '12px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-sans)', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: 'var(--cream)', borderBottom: '1px solid var(--cream-border)' }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 500, color: 'var(--ink-3)' }}>Name</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 500, color: 'var(--ink-3)' }}>Status</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 500, color: 'var(--ink-3)' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {mentors.map((m: any) => (
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

        {/* Quick Actions (Sidebar Column) */}
        <div style={{ position: 'sticky', top: '40px' }}>
          <div style={{ background: 'var(--white)', border: '1px solid var(--cream-border)', borderRadius: '12px', padding: '22px' }}>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', fontWeight: 500, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>
              Quick Actions
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <Link href="/admin/mentor-connect/sessions" style={quickLinkStyle}>Manage Sessions</Link>
              <Link href="/admin/dashboard/app-manager" style={quickLinkStyle}>App Visibility Settings</Link>
              <div style={{ borderTop: '1px solid var(--cream-border)', marginTop: '8px', paddingTop: '8px' }}>
                <Link href="/mentor-connect/apply" target="_blank" style={quickLinkStyle}>Open Public Form ↗</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const quickLinkStyle: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: '13px',
  color: 'var(--accent)',
  textDecoration: 'none',
  padding: '8px 12px',
  borderRadius: '6px',
  display: 'block',
  background: 'var(--cream-light)',
  marginBottom: '4px',
  transition: 'background 0.12s ease',
}
