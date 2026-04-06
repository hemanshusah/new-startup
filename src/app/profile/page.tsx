import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProfileView } from '@/components/profile/ProfileView'

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
  const supabase = await createClient()

  // 1. Get Session
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/?redirect=/profile')
  }

  // 2. Fetch Profile (Full)
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) {
    redirect('/')
  }

  // 3. Fetch View History (Last 20 to find 10 unique)
  // Joined with programs to get titles/slugs/types
  const { data: historyData } = await supabase
    .from('program_views')
    .select(`
      viewed_at,
      programs (
        id,
        slug,
        title,
        type,
        organisation,
        amount_display,
        deadline
      )
    `)
    .eq('user_id', user.id)
    .order('viewed_at', { ascending: false })
    .limit(30) // Get more to filter for unique program_ids

  // 4. Flatten and Filter for Unique Programs
  const seen = new Set()
  const history = (historyData || [])
    .map((h: any) => ({
      viewed_at: h.viewed_at,
      program: h.programs
    }))
    .filter((h: any) => {
      if (!h.program || seen.has(h.program.id)) return false
      seen.add(h.program.id)
      return true
    })
    .slice(0, 10) // Only take top 10 unique

  return (
    <main style={{ background: 'var(--cream)', minHeight: 'calc(100vh - 56px)', padding: '40px 24px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <ProfileView
          profile={profile}
          history={history}
        />
      </div>
    </main>
  )
}
