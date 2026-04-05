import Link from 'next/link'
import type { Program } from '@/types/program'

/** Shared deadline-days helper */
function daysUntil(dateStr: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const d = new Date(dateStr)
  return Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

/** Type badge colours mirror GrantCard */
const TYPE_COLORS: Record<string, { bg: string; color: string }> = {
  grant:       { bg: '#EDF5EA', color: '#2A6620' },
  incubation:  { bg: 'var(--accent-light)', color: 'var(--accent)' },
  accelerator: { bg: '#EEF3FD', color: '#2B4EA8' },
  contest:     { bg: '#FDF5EE', color: '#9B5A00' },
  funding:     { bg: '#F3EEF9', color: '#7040A0' },
  seed:        { bg: '#E8F5FA', color: '#005D80' },
}

interface ProgramHeaderProps {
  program: Program
}

/**
 * ProgramHeader — PROGRESS.md 4.2
 * Breadcrumb, status badge, type badge, H1, organisation, Apply button.
 */
export function ProgramHeader({ program }: ProgramHeaderProps) {
  const days = daysUntil(program.deadline)
  const typeColor = TYPE_COLORS[program.type] ?? { bg: 'var(--cream-dark)', color: 'var(--ink-3)' }
  const label = program.type.charAt(0).toUpperCase() + program.type.slice(1)

  return (
    <div>
      {/* Breadcrumb */}
      <nav
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontFamily: 'DM Sans, sans-serif',
          fontSize: '12px',
          color: 'var(--ink-4)',
          marginBottom: '20px',
          flexWrap: 'wrap',
        }}
        aria-label="Breadcrumb"
      >
        <Link href="/" style={{ color: 'var(--ink-3)', textDecoration: 'none' }}>
          Grants &amp; Funding
        </Link>
        <span aria-hidden="true">›</span>
        <Link
          href={`/?type=${program.type}`}
          style={{ color: 'var(--ink-3)', textDecoration: 'none', textTransform: 'capitalize' }}
        >
          {label}
        </Link>
        <span aria-hidden="true">›</span>
        <span style={{ color: 'var(--ink)' }}>{program.title}</span>
      </nav>

      {/* Badges row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
        {/* Status badge */}
        <span
          style={{
            display: 'inline-block',
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '10.5px',
            fontWeight: 500,
            color: '#1E6E2E',
            background: '#EDF5EA',
            border: '1px solid #A8D4A0',
            borderRadius: '4px',
            padding: '3px 8px',
            textTransform: 'capitalize',
          }}
        >
          ● {program.status}
        </span>

        {/* Type badge */}
        <span
          style={{
            display: 'inline-block',
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '10.5px',
            fontWeight: 500,
            color: typeColor.color,
            background: typeColor.bg,
            borderRadius: '4px',
            padding: '3px 8px',
            textTransform: 'capitalize',
          }}
        >
          {label}
        </span>
      </div>

      {/* H1 */}
      <h1
        style={{
          fontFamily: 'DM Serif Display, serif',
          fontSize: 'clamp(24px, 4vw, 32px)',
          fontWeight: 400,
          color: 'var(--ink)',
          lineHeight: 1.2,
          letterSpacing: '-0.02em',
          marginBottom: '8px',
        }}
      >
        {program.title}
      </h1>

      {/* Organisation */}
      <p
        style={{
          fontFamily: 'DM Sans, sans-serif',
          fontSize: '13.5px',
          fontWeight: 300,
          color: 'var(--ink-3)',
          marginBottom: '24px',
        }}
      >
        by {program.organisation}
      </p>

      {/* Apply button */}
      {program.apply_url && (
        <a
          href={program.apply_url}
          target="_blank"
          rel="noopener noreferrer"
          id="program-apply-btn-header"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '13.5px',
            fontWeight: 500,
            color: 'var(--cream)',
            background: 'var(--ink)',
            borderRadius: '8px',
            padding: '10px 20px',
            textDecoration: 'none',
            marginBottom: '32px',
          }}
        >
          Apply now ↗
        </a>
      )}
    </div>
  )
}
