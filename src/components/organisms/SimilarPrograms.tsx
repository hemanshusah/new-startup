import Link from 'next/link'
import type { ProgramListItem } from '@/types/program'

function daysUntil(dateStr: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.ceil((new Date(dateStr).getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

function formatDeadline(dateStr: string): { label: string; color: string } {
  const days = daysUntil(dateStr)
  const formatted = new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
  })
  if (days <= 1) return { label: formatted, color: '#E03E2D' }
  if (days <= 7) return { label: formatted, color: '#D4820E' }
  return { label: formatted, color: 'var(--ink-3)' }
}

const TYPE_COLORS: Record<string, { bg: string; color: string }> = {
  grant:       { bg: '#EDF5EA', color: '#2A6620' },
  incubation:  { bg: 'var(--accent-light)', color: 'var(--accent)' },
  accelerator: { bg: '#EEF3FD', color: '#2B4EA8' },
  contest:     { bg: '#FDF5EE', color: '#9B5A00' },
  funding:     { bg: '#F3EEF9', color: '#7040A0' },
  seed:        { bg: '#E8F5FA', color: '#005D80' },
}

interface SimilarProgramsProps {
  programs: Array<{ program: ProgramListItem; score: number }>
}

/**
 * SimilarPrograms — PROGRESS.md 4.7
 * Renders up to 5 similar programs as linked rows.
 * Hidden entirely if fewer than 2 results (parent should handle this check too).
 */
export function SimilarPrograms({ programs }: SimilarProgramsProps) {
  if (programs.length < 2) return null

  return (
    <section aria-labelledby="similar-heading" style={{ marginTop: '48px' }}>
      <h2
        id="similar-heading"
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 'var(--font-size-heading)',
          fontWeight: 400,
          color: 'var(--ink)',
          marginBottom: '16px',
        }}
      >
        Similar programs
      </h2>

      <div
        style={{
          border: '1px solid var(--cream-border)',
          borderRadius: '12px',
          overflow: 'hidden',
        }}
      >
        {programs.map(({ program, score }, idx) => {
          const deadline = formatDeadline(program.deadline)
          const typeColor = TYPE_COLORS[program.type] ?? { bg: 'var(--cream-dark)', color: 'var(--ink-3)' }
          const label = program.type.charAt(0).toUpperCase() + program.type.slice(1)
          // Score is raw points (context.md §12), max possible ≈ 205. Normalize to 0-100% for display.
          const matchPercent = Math.min(100, Math.round((score / 205) * 100))

          return (
            <Link
              key={program.id}
              href={`/programs/${program.slug}`}
              style={{
                display: 'block',
                padding: '16px 18px',
                borderTop: idx > 0 ? '1px solid var(--cream-border)' : 'none',
                textDecoration: 'none',
                background: 'var(--white)',
                transition: 'all 0.12s ease',
              }}
              className="similar-program-row"
            >
              {/* Top Row: Title + Match */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  marginBottom: '8px',
                  gap: '12px',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '16px',
                    fontWeight: 400,
                    color: 'var(--ink)',
                    lineHeight: 1.3,
                  }}
                  className="similar-program-title"
                >
                  {program.title}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '11.5px',
                    fontWeight: 600,
                    color: '#2A6620', // Greenish for match
                    background: '#EDF5EA',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    flexShrink: 0,
                  }}
                >
                  {matchPercent}% match
                </span>
              </div>

              {/* Bottom Row: Meta Information */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  flexWrap: 'wrap',
                }}
              >
                {/* Type badge */}
                <span
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '10px',
                    fontWeight: 500,
                    color: typeColor.color,
                    background: typeColor.bg,
                    borderRadius: '4px',
                    padding: '2px 7px',
                    textTransform: 'capitalize',
                  }}
                >
                  {label}
                </span>

                {/* Deadline */}
                <span
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: 'var(--font-size-body)',
                    color: deadline.color,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <span style={{ color: 'var(--ink-4)', fontSize: '10px' }}>Deadline:</span> {deadline.label}
                </span>

                {/* Amount */}
                {program.amount_display && (
                  <span
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: 'var(--font-size-body)',
                      color: 'var(--ink-3)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <span style={{ color: 'var(--ink-4)', fontSize: '10px' }}>Value:</span> {program.amount_display}
                  </span>
                )}
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
