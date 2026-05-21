import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { ProgramListItem } from '@/types/program'
import { GrantsGrid } from '@/components/listing/GrantsGrid'
import { getActiveSoftInfra } from '@/lib/softinfra'
import { getSiteUrl } from '@/lib/site-url'
import { getCurrentProfile } from '@/components/auth/auth-actions'
import { calculateCompletion } from '@/lib/school/profile-completion'
import { getRecommendedPrograms } from '@/lib/school/recommendations'
import { PersonalizationSection } from '@/components/dashboard/PersonalizationSection'
import type { Profile } from '@/types/profile'
import { getBookmarkedProgramIds } from '@/lib/bookmarks/actions'

// Ensure the page is always dynamic to reflect auth state (CONTEXT.md §11)
export const dynamic = 'force-dynamic'

export default async function ListingPage() {
  // Fetch ALL published active programs — specific columns only (CONTEXT.md §11)
  // Full array sent to client; pagination & filtering done entirely client-side
  const supabase = await createClient()

  const [sessionProfile, siAds] = await Promise.all([
    getCurrentProfile(),
    getActiveSoftInfra('listing-grid'),
  ])

  const profile = sessionProfile as Profile | null
  const completion = calculateCompletion(profile)
  const isUnlocked = completion >= 80
  const recommendations = isUnlocked ? await getRecommendedPrograms(profile) : []

  const { data, error } = await supabase
    .from('programs')
    .select(
      'id, slug, title, organisation, type, deadline, amount_display, description_short, is_featured, sectors, stage, is_india, amount_min, amount_max, state'
    )
    .match({
      published: true,
      status: 'active',
      product_slug: 'grants'
    })
    .gte('deadline', new Date().toISOString().split('T')[0]) // Filter out closed programs
    .order('is_featured', { ascending: false })
    .order('deadline', { ascending: true })


  const programs: ProgramListItem[] = data ?? []

  // Fetch SoftInfra boundaries and slots
  const { data: configData } = await supabase
    .from('site_config')
    .select('si_slot_positions, show_newsletter, cosmetic_settings')
    .eq('product_slug', 'grants') // Filter by product
    .limit(1)
    .single()

  const siSlotPositions: number[] = configData?.si_slot_positions ?? [3, 9, 15, 21]
  const showNewsletter: boolean = configData?.show_newsletter ?? true
  const cosmetic = configData?.cosmetic_settings || {}
  const homeHeading = cosmetic.homeHeading || 'Grants & funding programs for Indian founders'
  const homeHeadingSize = cosmetic.homeHeadingSize || 'clamp(32px, 5vw, 42px)'


  const bookmarkedIds = await getBookmarkedProgramIds()

  return (
    <div
      className="listing-wrap"
      style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '48px 24px 80px',
        position: 'relative'
      }}
    >
      {/* Ambient background glow */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: '1280px',
        height: '320px',
        background: 'radial-gradient(ellipse 60% 50% at 50% 0%, var(--accent-light) 0%, transparent 70%)',
        opacity: 0.5,
        zIndex: 0,
        pointerEvents: 'none'
      }} />

      {/* Page header */}
      <header style={{ marginBottom: '40px', position: 'relative', zIndex: 1 }}>
        {/* Kicker */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <span style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: 'var(--accent)',
            display: 'inline-block'
          }} />
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '11px',
              fontWeight: 600,
              color: 'var(--accent)',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              margin: 0
            }}
          >
            India Startup Funding · Live Index
          </p>
        </div>

        {/* H1 */}
        <h1
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: homeHeadingSize,
            fontWeight: 400,
            color: 'var(--ink)',
            lineHeight: 1.12,
            letterSpacing: '-0.02em',
            marginBottom: '16px',
            maxWidth: '720px',
          }}
        >
          {homeHeading.includes('Indian founders') ? (
            <>
              {homeHeading.split('Indian founders')[0]}
              <span style={{ color: 'var(--accent)', fontStyle: 'italic' }}>
                Indian founders
              </span>
              {homeHeading.split('Indian founders')[1]}
            </>
          ) : homeHeading}
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '16px',
            fontWeight: 400,
            color: 'var(--ink-3)',
            lineHeight: 1.6,
            maxWidth: '560px',
            margin: 0
          }}
        >
          Curated government initiatives and private sector funding opportunities updated in real-time so you never miss a deadline.
        </p>
      </header>

      {/* Profile Health & Recommendations (Logged-in only) */}
      {profile && (
        <PersonalizationSection
          profile={profile}
          recommendations={recommendations}
        />
      )}

      {/* Horizontal Line — Aesthetic Refresh */}
      <div
        style={{
          height: '1px',
          background: 'var(--cream-border)',
          width: '100%',
          marginBottom: '40px',
        }}
      />

      {/* Error state — shown if DB hasn't been seeded yet */}
      {error && (
        <div
          style={{
            background: '#FFF3E6',
            border: '1px solid #F0C080',
            borderRadius: '8px',
            padding: '16px 20px',
            marginBottom: '24px',
            fontFamily: 'var(--font-sans)',
            fontSize: '13px',
            color: '#7A4010',
          }}
        >
          <strong>Database not connected yet.</strong> Run{' '}
          <code>supabase/migrations/001_initial_schema.sql</code> and{' '}
          <code>supabase/seed.sql</code> in your Supabase SQL Editor, then refresh.
        </div>
      )}

      {/* Grants grid (client component — handles filtering, search, pagination) */}
      <GrantsGrid
        programs={programs}
        siSlotPositions={siSlotPositions}
        siAds={siAds}
        bookmarkedIds={bookmarkedIds}
      />
    </div>
  )
}
