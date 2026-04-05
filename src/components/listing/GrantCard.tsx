'use client'

import { ProgramListItem } from '@/types/program'

/** Deadline colour logic per CONTEXT.md §3 */
function getDeadlineInfo(deadline: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const deadlineDate = new Date(deadline)
  deadlineDate.setHours(0, 0, 0, 0)
  const diffDays = Math.ceil(
    (deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  )

  if (diffDays < 0) {
    return { label: 'Closed', color: 'var(--ink-4)', dot: 'var(--ink-4)' }
  }
  if (diffDays === 0) {
    return { label: 'Closes today', color: '#E03E2D', dot: '#E03E2D' }
  }
  if (diffDays === 1) {
    return { label: '1 day left', color: '#E03E2D', dot: '#E03E2D' }
  }
  if (diffDays <= 7) {
    return { label: `${diffDays} days left`, color: '#D4820E', dot: '#D4820E' }
  }

  const label = new Date(deadline).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
  return { label, color: 'var(--ink-4)', dot: 'var(--ink-4)' }
}

/** Type badge colours (editorial palette, not from spec — fills gap spec doesn't detail) */
const TYPE_STYLES: Record<string, { bg: string; color: string }> = {
  grant:       { bg: '#EDF5EA', color: '#2A6620' },
  incubation:  { bg: '#EBF1FF', color: '#1A4FA3' },
  accelerator: { bg: '#F2EBFF', color: '#5B21A8' },
  contest:     { bg: '#FFF3E6', color: '#A05205' },
  funding:     { bg: '#FFEBEB', color: '#B01F1F' },
  seed:        { bg: '#E9FFF4', color: '#1A7A4D' },
}

interface GrantCardProps {
  program: ProgramListItem
  /** onClick — used for auth gate in Phase 3; defaults to href navigation */
  onClick?: (e: React.MouseEvent) => void
}

export function GrantCard({ program, onClick }: GrantCardProps) {
  const deadline = getDeadlineInfo(program.deadline)
  const typeStyle = TYPE_STYLES[program.type] ?? { bg: 'var(--cream-dark)', color: 'var(--ink-2)' }

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.(e as unknown as React.MouseEvent)}
      className="grant-card"
      style={{
        background: 'var(--white)',
        padding: '26px 24px 22px',
        minHeight: '220px',
        borderRadius: 0,
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        transition: 'background 0.1s ease',
      }}
      aria-label={`${program.title} by ${program.organisation}`}
    >
      {/* Top section */}
      <div>
        {/* Organisation */}
        <p
          style={{
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '11px',
            fontWeight: 500,
            color: 'var(--ink-4)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '6px',
          }}
        >
          {program.organisation}
        </p>

        {/* Title */}
        <h3
          style={{
            fontFamily: 'DM Serif Display, serif',
            fontSize: '15.5px',
            fontWeight: 400,
            color: 'var(--ink)',
            lineHeight: 1.35,
            marginBottom: '8px',
          }}
        >
          {program.title}
        </h3>

        {/* Description — 2-line clamp */}
        <p
          className="line-clamp-2"
          style={{
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '13px',
            fontWeight: 300,
            color: 'var(--ink-2)',
            lineHeight: 1.55,
          }}
        >
          {program.description_short}
        </p>
      </div>

      {/* Bottom row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          marginTop: '16px',
        }}
      >
        {/* Left: badge + deadline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {/* Type badge pill */}
          <span
            style={{
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '10.5px',
              fontWeight: 500,
              borderRadius: '4px',
              padding: '2px 7px',
              display: 'inline-block',
              background: typeStyle.bg,
              color: typeStyle.color,
              textTransform: 'capitalize',
              lineHeight: 1.4,
            }}
          >
            {program.type}
          </span>

          {/* Deadline */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: deadline.dot,
                flexShrink: 0,
                display: 'inline-block',
              }}
            />
            <span
              style={{
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '11px',
                fontWeight: 400,
                color: deadline.color,
              }}
            >
              {deadline.label}
            </span>
          </div>
        </div>

        {/* Right: amount */}
        {program.amount_display && (
          <div style={{ textAlign: 'right' }}>
            <div
              style={{
                fontFamily: 'DM Serif Display, serif',
                fontSize: '16px',
                fontWeight: 400,
                color: 'var(--ink)',
              }}
            >
              {program.amount_display}
            </div>
            <div
              style={{
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '10px',
                fontWeight: 400,
                color: 'var(--ink-4)',
                marginTop: '1px',
              }}
            >
              Available
            </div>
          </div>
        )}
      </div>

      {/* Hover arrow — fades in on hover via CSS (.grant-card:hover .hover-arrow) */}
      <span
        className="hover-arrow"
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          fontSize: '14px',
          color: 'var(--ink-3)',
        }}
      >
        ↗
      </span>
    </article>
  )
}
