import Link from 'next/link'
import type { Program, ProgramListItem } from '@/types/program'
import type { Ad } from '@/types/ad'
import { SidebarAd } from '@/components/ads/SidebarAd'

function daysUntil(dateStr: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.ceil((new Date(dateStr).getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

function formatDeadline(dateStr: string) {
  const formatted = new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
  // Force it to be red as requested by user
  return { label: formatted, color: '#E03E2D' }
}

interface DetailSidebarProps {
  program: Program
  /** Active programs of same type for "More programs" section (max 5) */
  morePrograms: ProgramListItem[]
  sidebarAdA: Ad | null
  sidebarAdB: Ad | null
}

const cardStyle: React.CSSProperties = {
  background: 'var(--white)',
  border: '1px solid var(--cream-border)',
  borderRadius: '12px',
  padding: '18px',
  marginBottom: '16px',
}

/**
 * DetailSidebar — PROGRESS.md 4.6
 * Sticky sidebar: Quick Facts → SidebarAd A → More Programs → SidebarAd B
 */
export function DetailSidebar({
  program,
  morePrograms,
  sidebarAdA,
  sidebarAdB,
}: DetailSidebarProps) {
  const deadline = formatDeadline(program.deadline)
  const label = program.type.charAt(0).toUpperCase() + program.type.slice(1)

  const quickFacts = [
    { label: 'Organiser', value: program.organisation },
    { label: 'Deadline', value: deadline.label, color: deadline.color },
    { label: 'Equity', value: program.equity ?? '—' },
    { label: 'Mode', value: program.mode ?? '—' },
    { label: 'Duration', value: program.duration ?? '—' },
    { label: 'Cohort size', value: program.cohort_size ?? '—' },
  ]

  return (
    <aside
      style={{
        width: '300px',
        flexShrink: 0,
        position: 'sticky',
        top: '72px',
        alignSelf: 'flex-start',
        paddingBottom: '24px',
      }}
    >
      {/* Quick Facts card */}
      <div style={cardStyle}>
        <p
          style={{
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '11px',
            fontWeight: 500,
            color: 'var(--ink-4)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: '14px',
          }}
        >
          Quick Facts
        </p>

        <dl style={{ margin: 0 }}>
          {quickFacts.map(({ label, value, color }) => (
            <div
              key={label}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: '12px',
                paddingBottom: '10px',
                marginBottom: '10px',
                borderBottom: '1px solid var(--cream-border)',
              }}
            >
              <dt
                style={{
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize: '12px',
                  color: 'var(--ink-3)',
                  flexShrink: 0,
                }}
              >
                {label}
              </dt>
              <dd
                style={{
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize: '12.5px',
                  fontWeight: 500,
                  color: color ?? 'var(--ink)',
                  margin: 0,
                  textAlign: 'right',
                }}
              >
                {value}
              </dd>
            </div>
          ))}
        </dl>

        {program.apply_url && (
          <a
            href={program.apply_url}
            target="_blank"
            rel="noopener noreferrer"
            id="program-apply-btn-sidebar"
            style={{
              display: 'block',
              textAlign: 'center',
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '13px',
              fontWeight: 500,
              color: 'var(--cream)',
              background: 'var(--ink)',
              borderRadius: '8px',
              padding: '10px',
              textDecoration: 'none',
              marginTop: '4px',
            }}
          >
            Apply now ↗
          </a>
        )}
      </div>

      {/* Sidebar Ad A */}
      {sidebarAdA && (
        <div style={{ marginBottom: '16px' }}>
          <SidebarAd ad={sidebarAdA} />
        </div>
      )}

      {/* More [type] programs */}
      {morePrograms.length > 0 && (
        <div style={{ ...cardStyle, marginBottom: '16px' }}>
          <p
            style={{
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '11px',
              fontWeight: 500,
              color: 'var(--ink-4)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '12px',
            }}
          >
            More {label} programs
          </p>

          <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
            {morePrograms.map((p, i) => {
              const dl = formatDeadline(p.deadline)
              return (
                <li
                  key={p.id}
                  style={{
                    paddingBottom: '10px',
                    marginBottom: '10px',
                    borderBottom: i < morePrograms.length - 1 ? '1px solid var(--cream-border)' : 'none',
                  }}
                >
                  <Link
                    href={`/programs/${p.slug}`}
                    style={{ textDecoration: 'none' }}
                  >
                    <p
                      style={{
                        fontFamily: 'DM Sans, sans-serif',
                        fontSize: '14px',
                        fontWeight: 500,
                        color: 'var(--ink)',
                        margin: '0 0 3px',
                        lineHeight: 1.4,
                      }}
                    >
                      {p.title}
                    </p>
                    <p
                      style={{
                        fontFamily: 'DM Sans, sans-serif',
                        fontSize: '11.5px',
                        color: dl.color,
                        margin: 0,
                      }}
                    >
                      {dl.label}
                    </p>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {/* Sidebar Ad B */}
      {sidebarAdB && (
        <div>
          <SidebarAd ad={sidebarAdB} />
        </div>
      )}
    </aside>
  )
}
