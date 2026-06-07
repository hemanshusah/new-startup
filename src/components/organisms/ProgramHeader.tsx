import Link from 'next/link'
import type { Program } from '@/types/program'
import { BookmarkButton } from '@/components/atoms/BookmarkButton'

import { Badge } from '@/components/atoms/Badge'

/** Shared deadline-days helper */
function daysUntil(dateStr: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const d = new Date(dateStr)
  return Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
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
  const label = program.type.charAt(0).toUpperCase() + program.type.slice(1)

  return (
    <div>
      {/* Breadcrumb */}
      <nav
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontFamily: 'var(--font-sans)',
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
        <Badge 
          variant={days < 0 ? 'closed' : 'open'} 
          label={days < 0 ? 'Closed' : `${program.status} ${days >= 0 ? `• (${days === 0 ? 'Last day' : `${days} days left`})` : ''}`}
        />

        {/* Type badge */}
        <Badge 
          variant={program.type as any} 
          label={label}
        />
      </div>

      {/* H1 */}
      <h1
        style={{
          fontFamily: 'var(--font-section), var(--font-serif), serif',
          fontSize: 'var(--font-size-heading)',
          fontWeight: 'var(--font-weight-heading)' as any,
          fontStyle: 'var(--font-style-heading)' as any,
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
          fontFamily: 'var(--font-sans)',
          fontSize: 'var(--font-size-body)',
          fontWeight: 300,
          color: 'var(--ink-3)',
          marginBottom: '24px',
        }}
      >
        by {program.organisation}
      </p>

      {/* Action Buttons row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
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
              fontFamily: 'var(--font-sans)',
              fontSize: 'var(--font-size-body)',
              fontWeight: 500,
              color: 'var(--cream)',
              background: 'var(--ink)',
              borderRadius: '8px',
              padding: '10px 24px',
              textDecoration: 'none',
              transition: 'all 0.2s ease',
            }}
          >
            Apply now ↗
          </a>
        )}

        <BookmarkButton 
          programId={program.id} 
          showText={true} 
          size={20}
        />
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .bookmark-btn-reusable:hover {
          background: var(--bg) !important;
          transform: translateY(-1px);
        }
      `}} />
    </div>
  )
}
