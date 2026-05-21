import type { Metadata } from 'next'
import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/server'
import { MentorCard } from '@/components/mentor-connect/MentorCard'
import { getAuthenticatedUser } from '@/lib/auth-utils'
import { Sparkles, SlidersHorizontal, Search, X, Check, Globe, HelpCircle } from 'lucide-react'
import EnterpriseRegistry from '@/components/mentor-connect/EnterpriseRegistry'

export const metadata: Metadata = {
  title: 'Ecosystem Directory | Mentor Connect',
  description: 'Book verified 1:1 sessions with industry leaders, cross-border operators, and scaling experts.',
}

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{ industry?: string; expertise?: string; q?: string }>
}

export default async function MentorDirectoryPage({ searchParams }: PageProps) {
  const { industry, expertise, q } = await searchParams
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
      linkedin_url,
      twitter_url,
      intro_video_url,
      session_types ( price_inr )
    `)
    .eq('status', 'active')
    .eq('is_available', true)

  if (industry) {
    query = query.contains('industries', [industry])
  }
  if (expertise) {
    query = query.contains('expertise_areas', [expertise])
  }

  const { data: mentors } = await query

  // Process data to get starting price and filter by search query on display name or bio if provided
  let processedMentors = (mentors || []).map(mentor => {
    const prices = mentor.session_types.map((s: any) => s.price_inr).filter((p: number) => p > 0)
    const priceStart = prices.length > 0 ? Math.min(...prices) : 0
    return { ...mentor, priceStart }
  })

  if (q) {
    const lowerQuery = q.toLowerCase()
    processedMentors = processedMentors.filter(mentor => 
      mentor.display_name.toLowerCase().includes(lowerQuery) ||
      mentor.headline.toLowerCase().includes(lowerQuery) ||
      mentor.expertise_areas.some((area: string) => area.toLowerCase().includes(lowerQuery))
    )
  }

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

  // Common filters
  const commonIndustries = ['Fintech', 'SaaS', 'Deeptech', 'Cleantech', 'EdTech', 'HealthTech']
  const commonExpertise = ['Market Entry', 'Grant Navigation', 'Regulatory Compliance', 'Fundraising', 'US Expansion', 'Pitch Deck Review']

  return (
    <main style={{ background: 'var(--bg)', minHeight: 'calc(100vh - 56px)', position: 'relative', paddingBottom: '100px' }}>
      {/* Ambient background glow */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: '1280px',
        height: '340px',
        background: 'radial-gradient(ellipse 60% 50% at 50% 0%, var(--accent-light) 0%, transparent 70%)',
        opacity: 0.5,
        zIndex: 0,
        pointerEvents: 'none'
      }} />

      {/* ── HEADER & SEARCH BAR ── */}
      <section style={{ padding: '60px 24px 40px', background: 'transparent', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '24px' }}>
            <div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 12px',
                background: 'var(--accent-light)',
                color: 'var(--accent)',
                borderRadius: '100px',
                fontFamily: 'var(--font-sans)',
                fontSize: '10.5px',
                fontWeight: 600,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                marginBottom: '16px',
                border: '1px solid rgba(184, 70, 10, 0.12)'
              }}>
                <Sparkles size={11} />
                DIRECT ACCESS
              </div>
              <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '42px', color: 'var(--ink)', margin: '0 0 12px', fontWeight: 400, letterSpacing: '-0.015em' }}>
                Expert Operator Index
              </h1>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '15.5px', color: 'var(--ink-3)', margin: 0, maxWidth: '580px', lineHeight: 1.6 }}>
                Book direct 1:1 strategy slots with vetted leaders, regulatory compliance specialists, and scaling advisors.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ── MAIN DIRECTORY CONTENT ── */}
      <section style={{ padding: '0 24px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <EnterpriseRegistry 
            mentors={processedMentors} 
            savedMentorIds={Array.from(savedMentorIds)} 
            defaultSearchQuery={q}
            defaultIndustry={industry}
            defaultExpertise={expertise}
          />
        </div>
      </section>
    </main>
  )
}
