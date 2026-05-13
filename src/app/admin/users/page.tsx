import { createServiceClient } from '@/lib/supabase/server'
import { UsersTable } from '@/components/admin/UsersTable'

export default async function AdminUsersPage() {
  const supabase = createServiceClient()

  // Fetch profiles (Base users)
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('id, full_name, email, created_at, role, account_intent')
    .order('created_at', { ascending: false })

  if (profileError) {
    console.error('Error fetching profiles:', profileError)
  }

  // Fetch mentor profiles separately since join relationship might be missing/stale
  const { data: mentorProfiles } = await supabase
    .from('mentor_profiles')
    .select('user_id, status, total_sessions')

  const mentorMap: Record<string, any> = {}
  for (const mp of mentorProfiles ?? []) {
    mentorMap[mp.user_id] = mp
  }

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

  const users = (profiles ?? []).map((p: any) => {
    const mentorProfile = mentorMap[p.id]
    
    return {
      ...p,
      total_views: viewMap[p.id]?.count ?? 0,
      last_active: viewMap[p.id]?.last ?? null,
      mentor_status: mentorProfile?.status ?? null,
      sessions_count: mentorProfile?.total_sessions ?? 0,
    }
  })

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontFamily: 'var(--font-serif), serif', fontSize: '24px', fontWeight: 400, color: 'var(--ink)', marginBottom: '4px' }}>Users</h1>
        <p style={{ fontFamily: 'var(--font-sans), sans-serif', fontSize: '13px', color: 'var(--ink-3)' }}>{users.length} registered users</p>
      </div>
      <UsersTable initialUsers={users} />
    </div>
  )
}
