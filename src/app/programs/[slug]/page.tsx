import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { getAuthenticatedUser } from '@/lib/auth-utils'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import type { Program, ProgramListItem } from '@/types/program'
import type { SoftInfra } from '@/types/softinfra'
import { getSimilarPrograms } from '@/lib/similarity'
import { getActiveSoftInfra } from '@/lib/softinfra'
import { ProgramHeader } from '@/components/detail/ProgramHeader'
import { MetaStrip } from '@/components/detail/MetaStrip'
import { ContentSections } from '@/components/detail/ContentSection'
import { DetailSidebar } from '@/components/detail/DetailSidebar'
import { SimilarPrograms } from '@/components/detail/SimilarPrograms'
import { InlineSI } from '@/components/softinfra/InlineSI'
import { absoluteUrl } from '@/lib/site-url'

// 10-minute ISR cache (CONTEXT.md §11)
export const revalidate = 600

function deadlineToIsoDate(deadline: string | null | undefined): string {
  if (!deadline) return ''
  const d = new Date(deadline)
  if (Number.isNaN(d.getTime())) return String(deadline)
  return d.toISOString().split('T')[0]
}

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

  const ogTitle = data.amount_display
    ? `${data.title} — ${data.amount_display}`
    : data.title

  return {
    title: {
      absolute: `${data.title} — GrantsIndia`,
    },
    description: data.description_short,
    openGraph: {
      title: ogTitle,
      description: data.description_short,
    },
    alternates: {
      canonical: absoluteUrl(`/programs/${data.slug}`),
    },
    robots: { index: true, follow: true },
  }
}

interface Props {
  params: Promise<{ slug: string }>
}

export default async function ProgramDetailPage({ params }: Props) {
  const { slug } = await params
  const user = await getAuthenticatedUser()

  if (!user?.email) {
    redirect(`/?redirect=/programs/${slug}`)
  }

  const supabase = createServiceClient()

  // ── Fetch full program ─────────────────────────────────────────────
  const { data: program } = await supabase
    .from('programs')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single()

  if (!program) notFound()

  // ── Record view (CONTEXT.md §5 & §15) ─────────────────────────────
  if (user) {
    supabase.from('program_views').insert({
      program_id: program.id,
      user_id: user.id
    }).then(({ error }) => {
      if (error) console.error('Error recording program view:', error)
    })
  }

  // ── Detail page SoftInfra (fetch once, assign sequentially) ──────────────────
  const siInlineItems = await getActiveSoftInfra('detail-inline')
  const siSidebarItems = await getActiveSoftInfra('detail-sidebar')

  const siA: SoftInfra | null = siInlineItems[0] ?? null
  const siB: SoftInfra | null = siInlineItems[1] ?? null
  const siSidebarA: SoftInfra | null = siSidebarItems[0] ?? null
  const siSidebarB: SoftInfra | null = siSidebarItems[1] ?? null

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
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: program.title,
    organizer: { '@type': 'Organization', name: program.organisation },
    endDate: deadlineToIsoDate(program.deadline as string),
    description: program.description_short,
    url: absoluteUrl(`/programs/${program.slug}`),
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
            {/* Meta strip: Deadline, Funding, Equity, Mode, Stage */}
            <MetaStrip program={program as Program} />

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

            {/* Inline SI A — after About, before What you get (PROGRESS.md 4.5) */}
            {siA && (
              <div style={{ marginBottom: '32px' }}>
                <InlineSI si={siA} />
              </div>
            )}

            {/* Remaining sections: What you get, Eligibility (pass excludeAbout so About not duplicated) */}
            <ContentSections
              program={program as Program}
              applyUrl={program.apply_url}
              excludeAbout
            />

            {/* Inline SI B — after Eligibility, before Focus sectors */}
            {siB && (
              <div style={{ marginTop: '32px' }}>
                <InlineSI si={siB} />
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
              sidebarSiA={siSidebarA}
              sidebarSiB={siSidebarB}
            />
          </div>
        </div>
      </div>
    </>
  )
}
