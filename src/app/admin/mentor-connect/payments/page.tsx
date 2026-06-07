import { createClient } from '@supabase/supabase-js'
import { AdminPaymentsList } from '@/components/organisms/admin/mentor-connect/AdminPaymentsList'

export const dynamic = 'force-dynamic'

export default async function AdminMentorConnectPaymentsPage() {
  // Use direct connection with Service Role Key to bypass RLS issues in Admin view
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // 1. Fetch raw sessions
  const { data: sessionsData, error: sessionsError } = await supabase
    .from('sessions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)

  let mergedSessions: any[] = []
  let debugInfo = ''

  if (sessionsError) {
    debugInfo = `Database Error: ${sessionsError.message} (Code: ${sessionsError.code})`
  } else if (!sessionsData) {
    debugInfo = 'Database returned null for sessionsData'
  } else {
    try {
      if (sessionsData.length > 0) {
        const mentorIds = Array.from(new Set(sessionsData.map(s => s.mentor_id)))
        const founderIds = Array.from(new Set(sessionsData.map(s => s.founder_id)))
        const typeIds = Array.from(new Set(sessionsData.map(s => s.session_type_id)))

        // 2. Fetch related data in parallel
        const [mentorsRes, foundersRes, typesRes] = await Promise.all([
          supabase.from('mentor_profiles').select('id, display_name, slug').in('id', mentorIds),
          supabase.from('profiles').select('id, full_name, email, startup_name').in('id', founderIds),
          supabase.from('session_types').select('id, name').in('id', typeIds)
        ])

        const mentorMap = new Map(mentorsRes.data?.map(m => [m.id, m]))
        const founderMap = new Map(foundersRes.data?.map(f => [f.id, f]))
        const typeMap = new Map(typesRes.data?.map(t => [t.id, t]))

        // 3. Merge
        mergedSessions = sessionsData.map(s => ({
          ...s,
          mentor_profiles: mentorMap.get(s.mentor_id),
          founder: founderMap.get(s.founder_id),
          session_type: typeMap.get(s.session_type_id)
        }))
      }
    } catch (err: any) {
      debugInfo = `Processing Error: ${err.message}`
    }
  }

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '26px', fontWeight: 400, color: 'var(--ink)', marginBottom: '4px' }}>
          Payments & Receipts
        </h1>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--ink-3)' }}>
          Monitor transaction statuses, diagnose payment delays, and manage billing receipts.
        </p>
      </div>

      {debugInfo && (
        <div style={{ padding: '16px', background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '12px', color: '#991B1B', marginBottom: '24px', fontSize: '13px', fontFamily: 'monospace' }}>
          ⚠️ {debugInfo}
        </div>
      )}

      <AdminPaymentsList initialSessions={mergedSessions} />
    </div>
  )
}
