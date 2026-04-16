'use client'

import Link from 'next/link'
import { ProgramListItem } from '@/types/program'
import React from 'react'

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
    return { label: 'CLOSED', color: 'var(--ink-4)', dot: 'var(--ink-4)' }
  }

  const label = new Date(deadline).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
  
  // Force deadlines to RED as requested
  return { label, color: '#E03E2D', dot: '#E03E2D' }
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
    <Link
      href={`/programs/${program.slug}`}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.(e as unknown as React.MouseEvent)}
      className="grant-card"
      style={{
        background: 'var(--white)',
        padding: '32px 28px 28px',
        minHeight: '240px',
        borderRadius: 0, 
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        transition: 'background 0.1s ease',
        textDecoration: 'none', // Critical for Link
      }}
      aria-label={`${program.title} by ${program.organisation}`}
    >
      {/* Top section */}
      <div>
        {/* Organisation */}
        <p
          className="org-name"
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '11px',
            fontWeight: 500,
            color: 'var(--ink-4)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '4px',
          }}
        >
          {program.organisation}
        </p>

        {/* Title */}
        <h3
          style={{
            fontFamily: 'var(--font-section), var(--font-serif), serif',
            fontSize: 'var(--font-size-section)',
            fontWeight: 'var(--font-weight-section)',
            fontStyle: 'var(--font-style-section)',
            color: 'var(--ink)',
            lineHeight: 1.35,
            marginBottom: '10px',
            marginTop: 0,
          }}
        >
          {program.title}
        </h3>

        {/* Description — 2-line clamp */}
        <p
          className="line-clamp-2"
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 'var(--font-size-body)',
            fontWeight: 'var(--font-weight-body)',
            fontStyle: 'var(--font-style-body)',
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
              fontFamily: 'var(--font-sans)',
              fontSize: '10px',
              fontWeight: 600,
              borderRadius: '4px',
              padding: '3px 9px',
              display: 'inline-block',
              background: typeStyle.bg,
              color: typeStyle.color,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              lineHeight: 1,
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
              className="meta-text"
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '11px',
                fontWeight: 500,
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
              className="amount-display"
              style={{
                fontFamily: 'var(--font-section)',
                fontSize: '16px',
                fontWeight: 'var(--font-weight-section)',
                color: 'var(--ink)',
              }}
            >
              {program.amount_display}
            </div>
            <div
              className="meta-text"
              style={{
                fontFamily: 'var(--font-sans)',
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
    </Link>
  )
}
