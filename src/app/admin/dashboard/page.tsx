import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/server'
import { StatCard } from '@/components/admin/StatCard'

function relativeTime(dateStr: string, now: number): string {
  const diff = now - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

const ACTION_COLORS: Record<string, string> = {
  created: '#2A6620',
  updated: '#2B4EA8',
  published: '#005D80',
  unpublished: '#9B5A00',
  deleted: '#B01F1F',
}

export default async function AdminDashboard() {
  const supabase = createServiceClient()
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now()
  const today = new Date(now).toISOString().split('T')[0]
  const sevenDaysLater = new Date(now + 7 * 86400000).toISOString().split('T')[0]
  const sevenDaysAgo = new Date(now - 7 * 86400000).toISOString()

  // ── Metric queries (parallel) ──────────────────────────────────────
  const [
    { count: programsLive },
    { count: closingSoon },
    { count: usersCount },
    { data: adsData },
    { data: clickData },
    { data: auditLog },
    { count: draftsCount },
  ] = await Promise.all([
    supabase
      .from('programs')
      .select('*', { count: 'exact', head: true })
      .eq('published', true)
      .eq('status', 'active'),
    supabase
      .from('programs')
      .select('*', { count: 'exact', head: true })
      .eq('published', true)
      .gte('deadline', today)
      .lte('deadline', sevenDaysLater),
    supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true }),
    supabase
      .from('ads')
      .select('impression_count, updated_at')
      .gt('updated_at', sevenDaysAgo),
    supabase
      .from('click_log')
      .select('id', { count: 'exact', head: true })
      .gt('clicked_at', sevenDaysAgo),
    supabase
      .from('program_audit_log')
      .select('id, action, program_title, changed_at, changed_by')
      .order('changed_at', { ascending: false })
      .limit(20),
    supabase
      .from('programs')
      .select('*', { count: 'exact', head: true })
      .eq('published', false),
  ])

  const totalImpressions = (adsData ?? []).reduce(
    (sum: number, ad: { impression_count: number }) => sum + (ad.impression_count ?? 0),
    0
  )
  const totalClicks = clickData ?? 0
  const ctr =
    totalImpressions > 0
      ? ((Number(totalClicks) / totalImpressions) * 100).toFixed(1) + '%'
      : '—'

  return (
    <div>
      {/* Page heading */}
      <div style={{ marginBottom: '28px' }}>
        <h1
          style={{
            fontFamily: 'var(--font-serif), serif',
            fontSize: '26px',
            fontWeight: 400,
            color: 'var(--ink)',
            marginBottom: '4px',
          }}
        >
          Dashboard
        </h1>
        <p style={{ fontFamily: 'var(--font-sans), sans-serif', fontSize: '13px', color: 'var(--ink-3)' }}>
          Overview of your GrantsIndia platform.
        </p>
      </div>

      {/* ── 6 Metric Cards ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '16px',
          marginBottom: '32px',
        }}
      >
        <StatCard label="Programs live" value={programsLive ?? 0} />
        <StatCard
          label="Closing soon (7d)"
          value={closingSoon ?? 0}
          sub="Programs with deadline in 7 days"
        />
        <StatCard label="Registered users" value={usersCount ?? 0} />
        <StatCard
          label="Ad impressions (7d)"
          value={totalImpressions.toLocaleString()}
          sub="Based on updated_at in last 7 days"
        />
        <StatCard label="Ad clicks (7d)" value={Number(totalClicks).toLocaleString()} />
        <StatCard label="Avg CTR" value={ctr} sub="Clicks ÷ impressions" />
      </div>

      {/* ── Two-column: Quick Actions + Activity Feed ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '24px' }}>
        {/* Quick Actions */}
        <div
          style={{
            background: 'var(--white)',
            border: '1px solid var(--cream-border)',
            borderRadius: '12px',
            padding: '22px',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-sans), sans-serif',
              fontSize: '11px',
              fontWeight: 500,
              color: 'var(--ink-4)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '16px',
            }}
          >
            Quick Actions
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Link
              href="/admin/programs/new"
              id="admin-new-program-btn"
              style={{
                display: 'block',
                fontFamily: 'var(--font-sans), sans-serif',
                fontSize: '13px',
                fontWeight: 500,
                color: 'var(--cream)',
                background: 'var(--ink)',
                borderRadius: '8px',
                padding: '10px 16px',
                textDecoration: 'none',
                textAlign: 'center',
              }}
            >
              + Add new program
            </Link>
            <Link
              href="/admin/ads/new"
              id="admin-new-ad-btn"
              style={{
                display: 'block',
                fontFamily: 'var(--font-sans), sans-serif',
                fontSize: '13px',
                fontWeight: 500,
                color: 'var(--ink)',
                background: 'var(--cream)',
                border: '1px solid var(--cream-border)',
                borderRadius: '8px',
                padding: '10px 16px',
                textDecoration: 'none',
                textAlign: 'center',
              }}
            >
              + Add new ad
            </Link>

            <div
              style={{
                borderTop: '1px solid var(--cream-border)',
                paddingTop: '12px',
                marginTop: '4px',
              }}
            >
              <Link
                href="/admin/programs?deadline=7d"
                style={{
                  fontFamily: 'var(--font-sans), sans-serif',
                  fontSize: '12.5px',
                  color: '#D4820E',
                  textDecoration: 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '6px 0',
                }}
              >
                <span>Programs closing in 7 days</span>
                <strong>{closingSoon ?? 0}</strong>
              </Link>
              <Link
                href="/admin/programs?published=false"
                style={{
                  fontFamily: 'var(--font-sans), sans-serif',
                  fontSize: '12.5px',
                  color: 'var(--ink-3)',
                  textDecoration: 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '6px 0',
                }}
              >
                <span>Unpublished drafts</span>
                <strong>{draftsCount ?? 0}</strong>
              </Link>
            </div>
          </div>
        </div>

        {/* Activity Feed */}
        <div
          style={{
            background: 'var(--white)',
            border: '1px solid var(--cream-border)',
            borderRadius: '12px',
            padding: '22px',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-sans), sans-serif',
              fontSize: '11px',
              fontWeight: 500,
              color: 'var(--ink-4)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '16px',
            }}
          >
            Recent Activity
          </p>

          {!auditLog || auditLog.length === 0 ? (
            <p
              style={{
                fontFamily: 'var(--font-sans), sans-serif',
                fontSize: '13px',
                color: 'var(--ink-4)',
                textAlign: 'center',
                padding: '24px 0',
              }}
            >
              No activity yet. Create or edit a program to see entries here.
            </p>
          ) : (
            <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
              {auditLog.map((entry) => (
                <li
                  key={entry.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    paddingBottom: '10px',
                    marginBottom: '10px',
                    borderBottom: '1px solid var(--cream-border)',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-sans), sans-serif',
                      fontSize: '10px',
                      fontWeight: 500,
                      color: ACTION_COLORS[entry.action] ?? 'var(--ink-3)',
                      background: 'var(--cream)',
                      borderRadius: '4px',
                      padding: '2px 6px',
                      textTransform: 'capitalize',
                      flexShrink: 0,
                      marginTop: '2px',
                    }}
                  >
                    {entry.action}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontFamily: 'var(--font-sans), sans-serif',
                        fontSize: '12.5px',
                        color: 'var(--ink)',
                        margin: '0 0 2px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {entry.program_title}
                    </p>
                    <p
                      style={{
                        fontFamily: 'var(--font-sans), sans-serif',
                        fontSize: '11px',
                        color: 'var(--ink-4)',
                        margin: 0,
                      }}
                    >
                      {relativeTime(entry.changed_at, now)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
