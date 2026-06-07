import { createClient } from '@supabase/supabase-js'
import { AdminReviewsList } from '@/components/organisms/admin/mentor-connect/AdminReviewsList'

export const dynamic = 'force-dynamic'

export default async function AdminMentorConnectReviewsPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // 1. Fetch raw reviews
  const { data: reviewsData, error } = await supabase
    .from('reviews')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)

  let mergedReviews: any[] = []
  let debugInfo = ''

  if (error) {
    debugInfo = `Database Error: ${error.message}`
  } else if (!reviewsData) {
    debugInfo = 'No reviews found.'
  } else if (reviewsData.length > 0) {
    try {
      const mentorIds = Array.from(new Set(reviewsData.map(r => r.mentor_id)))
      const founderIds = Array.from(new Set(reviewsData.map(r => r.founder_id)))

      // 2. Fetch associated mentor profiles and founder profiles in parallel
      const [mentorsRes, foundersRes] = await Promise.all([
        supabase.from('mentor_profiles').select('id, display_name').in('id', mentorIds),
        supabase.from('profiles').select('id, full_name').in('id', founderIds)
      ])

      const mentorMap = new Map(mentorsRes.data?.map(m => [m.id, m]))
      const founderMap = new Map(foundersRes.data?.map(f => [f.id, f]))

      // 3. Merge
      mergedReviews = reviewsData.map(r => ({
        ...r,
        mentor: mentorMap.get(r.mentor_id),
        founder: founderMap.get(r.founder_id)
      }))
    } catch (err: any) {
      debugInfo = `Processing Error: ${err.message}`
    }
  }

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '26px', fontWeight: 400, color: 'var(--ink)', marginBottom: '4px' }}>
          Mentor Reviews Moderation
        </h1>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--ink-3)' }}>
          Moderate reviews left by founders for sessions. Hide or show them on mentor profiles.
        </p>
      </div>

      {debugInfo && (
        <div style={{ padding: '16px', background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '12px', color: '#991B1B', marginBottom: '24px', fontSize: '13px', fontFamily: 'var(--font-sans)' }}>
          ⚠️ {debugInfo}
        </div>
      )}

      <AdminReviewsList initialReviews={mergedReviews} />
    </div>
  )
}
