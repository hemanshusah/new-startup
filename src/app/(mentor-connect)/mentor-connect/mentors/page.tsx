import type { Metadata } from 'next'
import { createServiceClient } from '@/lib/supabase/server'
import { MentorCard } from '@/components/mentor-connect/MentorCard'
import { getAuthenticatedUser } from '@/lib/auth-utils'

export const metadata: Metadata = {
  title: 'Mentor Directory | Mentor Connect',
  description: 'Find and book sessions with vetted experts for your startup.',
}

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{ industry?: string; expertise?: string }>
}

export default async function MentorDirectoryPage({ searchParams }: PageProps) {
  const { industry, expertise } = await searchParams
  const supabase = createServiceClient()
  const user = await getAuthenticatedUser()

  let query = supabase
    .from('mentor_profiles')
    .select(`
      id,
      slug,
      display_name,
      headline,
      avatar_url,
      verification_tier,
      avg_rating,
      expertise_areas,
      industries,
      session_types ( price_inr )
    `)
    .eq('status', 'active')

  if (industry) {
    query = query.contains('industries', [industry])
  }
  if (expertise) {
    query = query.contains('expertise_areas', [expertise])
  }

  const { data: mentors } = await query

  // Process data to get starting price
  const processedMentors = (mentors || []).map(mentor => {
    const prices = mentor.session_types.map((s: any) => s.price_inr).filter((p: number) => p > 0)
    const priceStart = prices.length > 0 ? Math.min(...prices) : 0
    return { ...mentor, priceStart }
  })

  // Get user's saved mentors if logged in
  let savedMentorIds = new Set<string>()
  if (user) {
    const { data: saved } = await supabase
      .from('saved_mentors')
      .select('mentor_id')
      .eq('user_id', user.id)
    if (saved) {
      saved.forEach(s => savedMentorIds.add(s.mentor_id))
    }
  }

  // Common filters (In production, these could be fetched dynamically from DB)
  const commonIndustries = ['Fintech', 'SaaS', 'Deeptech', 'Cleantech', 'EdTech', 'HealthTech']
  const commonExpertise = ['Market Entry', 'Grant Navigation', 'Regulatory Compliance', 'Fundraising', 'US Expansion', 'Pitch Deck Review']

  return (
    <main style={{ background: 'var(--cream)', minHeight: 'calc(100vh - 56px)' }}>
      {/* ── HEADER ── */}
      <section style={{ padding: '60px 24px', background: 'var(--white)', borderBottom: '1px solid var(--cream-border)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '40px', color: 'var(--ink)', margin: '0 0 16px' }}>
            Mentor Directory
          </h1>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '18px', color: 'var(--ink-3)', margin: 0 }}>
            Browse vetted experts ready to help you navigate your next milestone.
          </p>
        </div>
      </section>

      {/* ── MAIN CONTENT ── */}
      <section style={{ padding: '40px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', gap: '40px', alignItems: 'flex-start' }}>
          
          {/* Filters Sidebar */}
          <aside style={{ width: '280px', flexShrink: 0, display: 'none' /* For mobile we'll need a drawer, but desktop it shows */ }}>
            <div style={{ background: 'var(--white)', border: '1px solid var(--cream-border)', borderRadius: '12px', padding: '24px' }}>
              <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '16px', fontWeight: 600, color: 'var(--ink)', margin: '0 0 20px' }}>
                Filters
              </h3>
              
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 500, color: 'var(--ink)', margin: '0 0 12px' }}>Industry</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {commonIndustries.map(ind => (
                    <a key={ind} href={`?industry=${encodeURIComponent(ind)}`} style={{
                      fontFamily: 'var(--font-sans)', fontSize: '14px', color: industry === ind ? 'var(--accent)' : 'var(--ink-3)', textDecoration: 'none',
                      fontWeight: industry === ind ? 600 : 400
                    }}>
                      {ind}
                    </a>
                  ))}
                </div>
              </div>

              <div>
                <h4 style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 500, color: 'var(--ink)', margin: '0 0 12px' }}>Expertise</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {commonExpertise.map(exp => (
                    <a key={exp} href={`?expertise=${encodeURIComponent(exp)}`} style={{
                      fontFamily: 'var(--font-sans)', fontSize: '14px', color: expertise === exp ? 'var(--accent)' : 'var(--ink-3)', textDecoration: 'none',
                      fontWeight: expertise === exp ? 600 : 400
                    }}>
                      {exp}
                    </a>
                  ))}
                </div>
              </div>

              {(industry || expertise) && (
                <a href="/mentor-connect/mentors" style={{ display: 'block', marginTop: '24px', fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--ink-4)', textDecoration: 'underline' }}>
                  Clear all filters
                </a>
              )}
            </div>
          </aside>

          {/* Directory Grid */}
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--ink-3)', margin: 0 }}>
                Showing <strong style={{ color: 'var(--ink)' }}>{processedMentors.length}</strong> mentors
              </p>
            </div>

            {processedMentors.length === 0 ? (
              <div style={{ background: 'var(--white)', border: '1px dashed var(--cream-border)', borderRadius: '16px', padding: '60px 24px', textAlign: 'center' }}>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '16px', color: 'var(--ink-4)', margin: 0 }}>
                  No mentors found matching your filters.
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
                {processedMentors.map((mentor) => (
                  <MentorCard 
                    key={mentor.id} 
                    mentor={mentor} 
                    isSaved={savedMentorIds.has(mentor.id)}
                    priceStart={mentor.priceStart}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
      
      <style>{`
        @media (min-width: 900px) {
          aside { display: block !important; }
        }
      `}</style>
    </main>
  )
}
