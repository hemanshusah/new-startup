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
          fontFamily: 'DM Serif Display, serif',
          fontSize: '22px',
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
        {programs.map(({ program }, idx) => {
          const deadline = formatDeadline(program.deadline)
          const typeColor = TYPE_COLORS[program.type] ?? { bg: 'var(--cream-dark)', color: 'var(--ink-3)' }
          const label = program.type.charAt(0).toUpperCase() + program.type.slice(1)

          return (
            <Link
              key={program.id}
              href={`/programs/${program.slug}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '14px 18px',
                borderTop: idx > 0 ? '1px solid var(--cream-border)' : 'none',
                textDecoration: 'none',
                background: 'var(--white)',
                transition: 'background 0.12s ease',
              }}
              className="similar-program-row"
            >
              {/* Type badge */}
              <span
                style={{
                  display: 'inline-block',
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize: '10px',
                  fontWeight: 500,
                  color: typeColor.color,
                  background: typeColor.bg,
                  borderRadius: '4px',
                  padding: '2px 7px',
                  flexShrink: 0,
                  textTransform: 'capitalize',
                }}
              >
                {label}
              </span>

              {/* Title */}
              <span
                style={{
                  fontFamily: 'DM Serif Display, serif',
                  fontSize: '14px',
                  fontWeight: 400,
                  color: 'var(--ink)',
                  flex: 1,
                  minWidth: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
                className="similar-program-title"
              >
                {program.title}
              </span>

              {/* Deadline */}
              <span
                style={{
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize: '12px',
                  fontWeight: 400,
                  color: deadline.color,
                  flexShrink: 0,
                }}
              >
                {deadline.label}
              </span>

              {/* Amount */}
              {program.amount_display && (
                <span
                  style={{
                    fontFamily: 'DM Serif Display, serif',
                    fontSize: '13px',
                    fontWeight: 400,
                    color: 'var(--ink)',
                    flexShrink: 0,
                  }}
                >
                  {program.amount_display}
                </span>
              )}
            </Link>
          )
        })}
      </div>
    </section>
  )
}
