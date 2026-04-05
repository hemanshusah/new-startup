import { createClient } from '@/lib/supabase/server'
import { UsersTable } from '@/components/admin/UsersTable'

export default async function AdminUsersPage() {
  const supabase = await createClient()

  // Fetch profiles with view counts (LEFT JOIN via program_views)
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, email, created_at, role')
    .order('created_at', { ascending: false })

  // Get view counts per user
  const { data: viewCounts } = await supabase
    .from('program_views')
    .select('user_id, viewed_at')

  const viewMap: Record<string, { count: number; last: string }> = {}
  for (const v of viewCounts ?? []) {
    if (!viewMap[v.user_id]) viewMap[v.user_id] = { count: 0, last: v.viewed_at }
    viewMap[v.user_id].count += 1
    if (v.viewed_at > viewMap[v.user_id].last) viewMap[v.user_id].last = v.viewed_at
  }

  const users = (profiles ?? []).map((p) => ({
    ...p,
    total_views: viewMap[p.id]?.count ?? 0,
    last_active: viewMap[p.id]?.last ?? null,
  }))

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '24px', fontWeight: 400, color: 'var(--ink)', marginBottom: '4px' }}>Users</h1>
        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '13px', color: 'var(--ink-3)' }}>{users.length} registered users</p>
      </div>
      <UsersTable initialUsers={users} />
    </div>
  )
}
