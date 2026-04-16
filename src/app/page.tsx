import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { ProgramListItem } from '@/types/program'
import { GrantsGrid } from '@/components/listing/GrantsGrid'
import { getActiveSoftInfra } from '@/lib/softinfra'
import { getSiteUrl } from '@/lib/site-url'

// ISR: revalidate every 5 minutes (CONTEXT.md §11)
export const revalidate = 300

export const metadata: Metadata = {
  title: 'GrantsIndia — Top 2026 Grants & Funding for Indian Startups',
  description:
    'Discover government and private sector grants, incubation programs, accelerators, and contests for Indian founders. Updated weekly.',
  openGraph: {
    title: 'GrantsIndia — Top 2026 Grants & Funding for Indian Startups',
    description:
      'Discover government and private sector grants, incubation programs, accelerators, and contests for Indian founders. Updated weekly.',
    images: ['/og-default.png'],
  },
  alternates: {
    canonical: `${getSiteUrl()}/`,
  },
}

export default async function ListingPage() {
  // Fetch ALL published active programs — specific columns only (CONTEXT.md §11)
  // Full array sent to client; pagination & filtering done entirely client-side
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('programs')
    .select(
      'id, slug, title, organisation, type, deadline, amount_display, description_short, is_featured, sectors, stage, is_india, amount_min, amount_max, state'
    )
    .eq('published', true)
    .eq('status', 'active')
    .order('is_featured', { ascending: false })
    .order('deadline', { ascending: true })

  const programs: ProgramListItem[] = data ?? []

  // Fetch SoftInfra boundaries and slots
  const { data: configData } = await supabase
    .from('site_config')
    .select('si_slot_positions, show_newsletter, cosmetic_settings')
    .limit(1)
    .single()

  const siSlotPositions: number[] = configData?.si_slot_positions ?? [3, 9, 15, 21]
  const showNewsletter: boolean = configData?.show_newsletter ?? true
  const cosmetic = configData?.cosmetic_settings || {}
  const homeHeading = cosmetic.homeHeading || 'Grants & funding programs for Indian founders'
  const homeHeadingSize = cosmetic.homeHeadingSize || 'clamp(32px, 5vw, 42px)'

  const siAds = await getActiveSoftInfra('listing-grid')

  return (
    <div
      className="listing-wrap"
      style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '48px 24px 80px',
      }}
    >
      {/* Page header */}
      <header style={{ marginBottom: '40px' }}>
        {/* Kicker */}
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '12px',
            fontWeight: 500,
            color: 'var(--accent)',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginBottom: '10px',
          }}
        >
          India Startup Funding · 2026
        </p>
 
        {/* H1 */}
        <h1
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: homeHeadingSize,
            fontWeight: 400,
            color: 'var(--ink)',
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
            marginBottom: '12px',
            maxWidth: '680px',
          }}
        >
          {homeHeading.includes('Indian founders') ? (
            <>
              {homeHeading.split('Indian founders')[0]}
              <span style={{ color: 'var(--accent)', fontStyle: 'italic' }}>Indian founders</span>
              {homeHeading.split('Indian founders')[1]}
            </>
          ) : homeHeading}
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '15px',
            fontWeight: 300,
            color: 'var(--ink-3)',
            lineHeight: 1.6,
            maxWidth: '520px',
          }}
        >
          Curated government and private sector opportunities updated weekly so you
          never miss a deadline.
        </p>
      </header>

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
      />
    </div>
  )
}

// Build sync
