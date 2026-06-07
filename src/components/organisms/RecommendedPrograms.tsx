'use client'

import type { ProgramListItem } from '@/types/program'
import Link from 'next/link'
import { Sparkles, ArrowUpRight, Calendar, DollarSign } from 'lucide-react'

interface RecommendedProgramsProps {
  programs: ProgramListItem[]
}

/**
 * Personalized recommendations grid for Startup School.
 * Only shown when profile completion threshold is met.
 */
export function RecommendedPrograms({ programs }: RecommendedProgramsProps) {
  if (programs.length === 0) return null

  return (
    <div style={{ marginBottom: '60px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
        <Sparkles size={18} color="var(--accent)" />
        <h3 style={{ 
          fontFamily: 'var(--font-serif), serif', 
          fontSize: '1.5rem', 
          color: 'var(--ink)',
          margin: 0
        }}>
          Recommended for You
        </h3>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '20px'
      }}>
        {programs.map((program) => (
          <Link 
            key={program.id} 
            href={`/programs/${program.slug}`}
            style={{ textDecoration: 'none' }}
            className="recommendation-card-wrapper"
          >
            <div className="recommendation-card" style={{
              background: 'var(--white)',
              border: '1px solid var(--cream-border)',
              borderRadius: '16px',
              padding: '20px',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <span style={{
                  fontSize: '10px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  background: 'var(--bg)',
                  padding: '4px 8px',
                  borderRadius: '100px',
                  color: 'var(--ink-3)'
                }}>
                  {program.type}
                </span>
                <ArrowUpRight size={16} color="var(--ink-4)" className="card-arrow" />
              </div>

              <h4 style={{
                fontFamily: 'var(--font-sans), sans-serif',
                fontSize: '15px',
                fontWeight: 600,
                color: 'var(--ink)',
                marginBottom: '6px',
                lineHeight: 1.4
              }}>
                {program.title}
              </h4>
              
              <p style={{
                fontSize: '12px',
                color: 'var(--ink-4)',
                marginBottom: '16px',
                fontFamily: 'var(--font-sans), sans-serif'
              }}>
                {program.organisation}
              </p>

              <div style={{ marginTop: 'auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px', borderTop: '1px solid var(--bg)', paddingTop: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--ink-2)' }}>
                    {program.amount_display || 'Grant'}
                  </span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={12} color="var(--ink-4)" />
                    <span style={{ fontSize: '11px', color: 'var(--ink-4)' }}>
                      {new Date(program.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  {(() => {
                    const deadlineDate = new Date(program.deadline)
                    const now = new Date()
                    const diffTime = deadlineDate.getTime() - now.getTime()
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                    if (diffDays > 0 && diffDays <= 60) {
                      return (
                        <span style={{ 
                          fontSize: '10px', 
                          fontWeight: 600, 
                          color: '#d93025',
                          background: '#fef2f2',
                          padding: '1px 5px',
                          borderRadius: '3px'
                        }}>
                          {diffDays} days left
                        </span>
                      )
                    }
                    return null
                  })()}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .recommendation-card-wrapper {
          display: block;
        }
        .recommendation-card:hover {
          border-color: var(--accent) !important;
          box-shadow: 0 12px 32px rgba(184, 70, 10, 0.08);
          transform: translateY(-4px);
        }
        .recommendation-card:hover .card-arrow {
          color: var(--accent) !important;
          transform: translate(2px, -2px);
        }
      `}} />
    </div>
  )
}
