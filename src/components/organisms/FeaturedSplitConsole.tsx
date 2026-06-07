'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ShieldCheck, ArrowRight, Video, Star, MapPin, Award } from 'lucide-react'

interface Mentor {
  id: string
  display_name: string
  slug: string
  headline: string
  avatar_url: string | null
  verification_tier: string
  avg_rating: number
  bio?: string
  expertise_areas?: string[]
}

interface FeaturedSplitConsoleProps {
  mentors: Mentor[]
}

export default function FeaturedSplitConsole({ mentors }: FeaturedSplitConsoleProps) {
  const [selectedIdx, setSelectedIdx] = useState(0)
  const activeMentor = mentors[selectedIdx]

  if (!mentors || mentors.length === 0) return null

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '380px 1fr',
      background: 'var(--white)',
      border: '1px solid var(--cream-border)',
      borderRadius: 'var(--radius-lg, 20px)',
      overflow: 'hidden',
      boxShadow: '0 8px 32px rgba(184, 70, 10, 0.015)',
      position: 'relative'
    }} className="split-console-container">
      
      {/* ── LEFT PANE: HIGH DENSITY LIST ── */}
      <div style={{
        borderRight: '1px solid var(--cream-border)',
        background: '#FAF8F5',
        overflowY: 'auto',
        maxHeight: '520px'
      }} className="split-console-left">
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--cream-border)',
          background: 'var(--white)'
        }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-sans)' }}>Featured Indexes</span>
        </div>
        <div style={{ padding: '12px' }}>
          {mentors.map((mentor, idx) => {
            const isSelected = idx === selectedIdx
            return (
              <button
                key={mentor.id}
                onClick={() => setSelectedIdx(idx)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  width: '100%',
                  padding: '16px',
                  borderRadius: '12px',
                  border: `1px solid ${isSelected ? 'var(--cream-border)' : 'transparent'}`,
                  background: isSelected ? 'var(--white)' : 'transparent',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  outline: 'none',
                  boxShadow: isSelected ? '0 4px 16px rgba(0,0,0,0.01)' : 'none',
                  marginBottom: '6px'
                }}
                className="selector-item-btn"
              >
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  {mentor.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={mentor.avatar_url} alt="" style={{ width: '46px', height: '46px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--cream-border)' }} />
                  ) : (
                    <div style={{ width: '46px', height: '46px', borderRadius: '50%', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', fontWeight: 600, color: 'var(--ink-3)' }}>
                      {mentor.display_name.charAt(0)}
                    </div>
                  )}
                  {isSelected && (
                    <span style={{ position: 'absolute', right: '-2px', bottom: '-2px', width: '12px', height: '12px', background: 'var(--accent)', borderRadius: '50%', border: '2px solid var(--white)' }} />
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 600, color: 'var(--ink)', margin: '0 0 3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {mentor.display_name}
                    {mentor.verification_tier !== 'community' && (
                      <ShieldCheck size={13} color="var(--accent)" />
                    )}
                  </h4>
                  <p style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--ink-3)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {mentor.headline}
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── RIGHT PANE: LIVE DETAIL PREVIEW ── */}
      <div style={{
        padding: '40px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: '520px',
        background: 'var(--white)'
      }} className="split-console-right">
        
        {activeMentor && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Top header meta */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '3px 8px',
                  background: 'var(--accent-light)',
                  color: 'var(--accent)',
                  borderRadius: '100px',
                  fontSize: '10px',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  marginBottom: '10px',
                  border: '1px solid rgba(184, 70, 10, 0.1)'
                }}>
                  <Award size={10} />
                  Vetted Operator Profile
                </span>
                
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', color: 'var(--ink)', margin: '0 0 4px', fontWeight: 400 }}>
                  {activeMentor.display_name}
                </h3>
                
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14.5px', color: 'var(--ink-3)', margin: 0 }}>
                  {activeMentor.headline}
                </p>
              </div>

              {/* Rating tag */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#FFF9EA', border: '1px solid rgba(245, 158, 11, 0.15)', padding: '6px 12px', borderRadius: '100px' }}>
                <Star size={13} fill="#F59E0B" color="#F59E0B" />
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ink)' }}>{activeMentor.avg_rating || '5.0'}</span>
              </div>
            </div>

            {/* Biography Extract */}
            <div style={{ borderTop: '1px solid var(--cream-border)', paddingTop: '20px' }}>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--ink-2)', lineHeight: 1.6, margin: 0 }}>
                {activeMentor.bio || 'This vetted expert specialises in high-scale expansion, grant acquisition strategy, and strategic growth. Book a direct session to connect 1:1.'}
              </p>
            </div>

            {/* Expertise Areas */}
            {activeMentor.expertise_areas && activeMentor.expertise_areas.length > 0 && (
              <div>
                <p style={{ margin: '0 0 10px', fontSize: '11px', fontWeight: 700, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.04em', fontFamily: 'var(--font-sans)' }}>Domain Expertises</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {activeMentor.expertise_areas.slice(0, 4).map((area) => (
                    <span key={area} style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '11.5px',
                      background: 'var(--bg)',
                      border: '1px solid var(--cream-border)',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      color: 'var(--ink-2)'
                    }}>
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Visual Intro Video mockup */}
            <div style={{
              background: '#FAF8F5',
              border: '1px solid var(--cream-border)',
              borderRadius: '12px',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '10px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Video size={16} color="var(--accent)" />
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>Vetted Intro Video Available</p>
                  <p style={{ margin: 0, fontSize: '11.5px', color: 'var(--ink-3)' }}>Watch a 90s intro of their professional journey</p>
                </div>
              </div>
              <Link href={`/mentor-connect/mentors/${activeMentor.slug}`} style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent)', textDecoration: 'none' }}>
                Watch Video →
              </Link>
            </div>

          </div>
        )}

        {/* Dynamic CTA slot */}
        <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'flex-end' }}>
          <Link
            href={`/mentor-connect/mentors/${activeMentor.slug}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '14px 28px',
              background: 'var(--ink)',
              color: 'var(--white)',
              borderRadius: '10px',
              fontFamily: 'var(--font-sans)',
              fontSize: '13.5px',
              fontWeight: 600,
              textDecoration: 'none',
              boxShadow: '0 4px 14px rgba(28,26,22,0.1)'
            }}
            className="hover-btn-glow"
          >
            Book 1:1 Session
            <ArrowRight size={14} />
          </Link>
        </div>

      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        @media (max-width: 860px) {
          .split-console-container {
            grid-template-columns: 1fr !important;
          }
          .split-console-left {
            border-right: none !important;
            border-bottom: 1px solid var(--cream-border);
          }
        }
        .selector-item-btn:hover {
          background: var(--white) !important;
          border-color: var(--cream-border) !important;
        }
      `}} />
    </div>
  )
}
