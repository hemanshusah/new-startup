'use client'

import Link from 'next/link'
import { ProgramListItem } from '@/types/program'
import React from 'react'
import { ArrowUpRight, Calendar } from 'lucide-react'
import { BookmarkButton } from '@/components/atoms/BookmarkButton'
import { Badge } from '@/components/atoms/Badge'

interface GrantCardProps {
  program: ProgramListItem
  onClick?: (e: React.MouseEvent) => void
  isBookmarkedInitial?: boolean
}

export function GrantCard({ program, onClick, isBookmarkedInitial = false }: GrantCardProps) {
  const deadlineDate = new Date(program.deadline)
  const formattedDeadline = deadlineDate.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short'
  })

  return (
    <div className="grant-card-unified-wrapper" style={{ position: 'relative' }}>
      <Link
        href={`/programs/${program.slug}`}
        onClick={onClick}
        className="grant-card-unified"
        style={{ textDecoration: 'none', display: 'block' }}
        aria-label={`${program.title} by ${program.organisation}`}
      >
        <div className="card-inner" style={{
          background: 'var(--white)',
          border: '1px solid var(--cream-border)',
          borderRadius: 'var(--radius-lg, 16px)',
          padding: '24px',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative'
        }}>
          {/* Top row: Type Badge & Arrow */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <Badge variant="type-pill" label={program.type} />
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <div style={{ transform: 'translate(4px, -4px)' }}>
                <BookmarkButton 
                  programId={program.id} 
                  initialBookmarked={isBookmarkedInitial}
                  size={18}
                />
              </div>
              <ArrowUpRight size={18} className="card-arrow" style={{ color: 'var(--ink-4)', transition: 'all 0.3s ease' }} />
            </div>
          </div>

          {/* Content Section */}
          <div style={{ flex: 1 }}>
            <h4 style={{
              fontFamily: 'var(--font-sans), sans-serif',
              fontSize: '16px',
              fontWeight: 600,
              color: 'var(--ink)',
              marginBottom: '6px',
              lineHeight: 1.4
            }}>
              {program.title}
            </h4>

            <p style={{
              fontSize: '13px',
              color: 'var(--ink-4)',
              marginBottom: '16px',
              fontFamily: 'var(--font-sans), sans-serif'
            }}>
              {program.organisation}
            </p>

            <p style={{
              fontSize: '13.5px',
              lineHeight: '1.6',
              color: 'var(--ink-2)',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              marginBottom: '20px'
            }}>
              {program.description_short}
            </p>
          </div>

          {/* Footer info: Amount & Deadline */}
          <div style={{
            marginTop: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            borderTop: '1px solid var(--cream-border)',
            paddingTop: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink)' }}>
                {program.amount_display || 'Grant'}
              </span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={14} color="var(--ink-4)" />
                <span style={{ fontSize: '12px', color: 'var(--ink-3)', fontWeight: 500 }}>
                  {formattedDeadline}
                </span>
              </div>
              {(() => {
                const now = new Date()
                const diffTime = deadlineDate.getTime() - now.getTime()
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                if (diffDays > 0) {
                  return (
                    <Badge variant="days-left" label={`${diffDays} days left`} />
                  )
                }
                return null
              })()}
            </div>
          </div>
        </div>

        <style dangerouslySetInnerHTML={{
          __html: `
          .grant-card-unified:hover .card-inner {
            border-color: var(--accent) !important;
            box-shadow: 0 12px 32px rgba(184, 70, 10, 0.08);
            transform: translateY(-4px);
          }
          .grant-card-unified:hover .card-arrow {
            color: var(--accent) !important;
            transform: translate(2px, -2px);
          }
          .bookmark-btn:hover {
            background: var(--bg) !important;
            transform: scale(1.1);
          }
        `}} />
      </Link>
    </div>
  )
}
