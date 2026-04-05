import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import type { Program, ProgramListItem } from '@/types/program'
import type { Ad } from '@/types/ad'
import { getSimilarPrograms } from '@/lib/similarity'
import { ProgramHeader } from '@/components/detail/ProgramHeader'
import { MetaStrip } from '@/components/detail/MetaStrip'
import { ContentSections } from '@/components/detail/ContentSection'
import { DetailSidebar } from '@/components/detail/DetailSidebar'
import { SimilarPrograms } from '@/components/detail/SimilarPrograms'
import { InlineAd } from '@/components/ads/InlineAd'

// 10-minute ISR cache (CONTEXT.md §11)
export const revalidate = 600

// ─── Metadata (CONTEXT.md §14) ─────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from('programs')
    .select('title, description_short, amount_display, slug')
    .eq('slug', slug)
    .single()

  if (!data) return { title: 'Program not found' }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://grantsindia.com'
  const ogTitle = data.amount_display
    ? `${data.title} — ${data.amount_display}`
    : data.title

  return {
    title: data.title,
    description: data.description_short,
    openGraph: {
      title: ogTitle,
      description: data.description_short,
    },
    alternates: {
      canonical: `${siteUrl}/programs/${data.slug}`,
    },
    robots: { index: true, follow: true },
  }
}

// ─── Page ──────────────────────────────────────────────────────────────────

interface Props {
  params: Promise<{ slug: string }>
}

export default async function ProgramDetailPage({ params }: Props) {
  const { slug } = await params

  // ── Auth check (belt-and-braces on top of middleware) ───────────
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect(`/?redirect=/programs/${slug}`)
  }

  // ── Fetch full program ─────────────────────────────────────────────
  const { data: program } = await supabase
    .from('programs')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single()

  if (!program) notFound()

  // ── Detail page ads (fetch once, assign to slots) ──────────────────
  const { data: adsRaw } = await supabase
    .from('ads')
    .select('*')
    .eq('is_active', true)
    .contains('placement', ['detail-inline'])
    .order('priority', { ascending: true })

  const { data: sidebarAdsRaw } = await supabase
    .from('ads')
    .select('*')
    .eq('is_active', true)
    .contains('placement', ['detail-sidebar'])
    .order('priority', { ascending: true })

  const inlineAds: Ad[] = adsRaw ?? []
  const sidebarAds: Ad[] = sidebarAdsRaw ?? []

  const adA: Ad | null = inlineAds[0] ?? null
  const adB: Ad | null = inlineAds[1] ?? null
  const sidebarAdA: Ad | null = sidebarAds[0] ?? null
  const sidebarAdB: Ad | null = sidebarAds[1] ?? null

  // ── All programs for similarity scoring (lightweight query) ──────────
  const { data: allProgramsRaw } = await supabase
    .from('programs')
    .select('id,slug,title,organisation,type,deadline,amount_display,description_short,is_featured,sectors,stage,is_india,amount_min,amount_max,state')
    .eq('published', true)
    .eq('status', 'active')
    .neq('slug', slug)

  const allPrograms: ProgramListItem[] = allProgramsRaw ?? []

  // Similarity scored in-memory — no extra DB call (CONTEXT.md §11)
  const similar = getSimilarPrograms(program as Program, allPrograms)

  // "More [type] programs" for sidebar (max 5, same type, different slug)
  const morePrograms = allPrograms
    .filter((p) => p.type === program.type)
    .slice(0, 5)

  // ── JSON-LD structured data (CONTEXT.md §14) ──────────────────────
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://grantsindia.com'
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: program.title,
    organizer: { '@type': 'Organization', name: program.organisation },
    endDate: program.deadline,
    description: program.description_short,
    url: `${siteUrl}/programs/${program.slug}`,
  }

  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '40px 24px 80px',
        }}
      >
        {/* Header: breadcrumb, badges, H1, org, Apply button */}
        <ProgramHeader program={program as Program} />

        {/* Meta strip: Deadline, Funding, Equity, Mode, Stage */}
        <MetaStrip program={program as Program} />

        {/* Two-column layout */}
        <div
          style={{
            display: 'flex',
            gap: '40px',
            alignItems: 'flex-start',
          }}
        >
          {/* ── Main content column ── */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* About section */}
            {program.about && (
              <section
                aria-labelledby="section-about"
                style={{ marginBottom: '32px' }}
              >
                <h2
                  id="section-about"
                  style={{
                    fontFamily: 'DM Serif Display, serif',
                    fontSize: '22px',
                    fontWeight: 400,
                    color: 'var(--ink)',
                    marginBottom: '14px',
                  }}
                >
                  About the program
                </h2>
                {program.about.split('\n\n').map((para: string, i: number) => (
                  <p
                    key={i}
                    style={{
                      fontFamily: 'DM Sans, sans-serif',
                      fontSize: '14px',
                      fontWeight: 300,
                      color: 'var(--ink-2)',
                      lineHeight: 1.7,
                      marginBottom: '12px',
                    }}
                  >
                    {para}
                  </p>
                ))}
              </section>
            )}

            {/* Inline Ad A — after About, before What you get (PROGRESS.md 4.5) */}
            {adA && (
              <div style={{ marginBottom: '32px' }}>
                <InlineAd ad={adA} />
              </div>
            )}

            {/* Remaining sections: What you get, Eligibility (pass excludeAbout so About not duplicated) */}
            <ContentSections
              program={program as Program}
              applyUrl={program.apply_url}
              excludeAbout
            />

            {/* Inline Ad B — after Eligibility, before Focus sectors
                ContentSections already renders all sections, so AdB appears after main content */}
            {adB && (
              <div style={{ marginTop: '32px' }}>
                <InlineAd ad={adB} />
              </div>
            )}

            {/* Similar Programs */}
            {similar.length >= 2 && (
              <SimilarPrograms programs={similar} />
            )}
          </div>

          {/* ── Sidebar ── */}
          <div className="detail-sidebar">
            <DetailSidebar
              program={program as Program}
              morePrograms={morePrograms}
              sidebarAdA={sidebarAdA}
              sidebarAdB={sidebarAdB}
            />
          </div>
        </div>
      </div>
    </>
  )
}
