'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Video, Calendar, Sparkles, ArrowUpRight, ShieldCheck, Zap, HelpCircle } from 'lucide-react'

interface SessionType {
  id: string
  name: string
  duration_minutes: number
  price_inr: number
  description: string
}

interface SessionSelectorProps {
  activeSessions: SessionType[]
  mentorSlug: string
  mentorId: string
  mentorName: string
}

export default function SessionSelector({
  activeSessions,
  mentorSlug,
  mentorId,
  mentorName
}: SessionSelectorProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const activeSession = activeSessions[selectedIndex] || activeSessions[0]

  if (!activeSession) return null

  return (
    <div style={{
      background: 'var(--white)',
      border: '1px solid var(--cream-border)',
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: '0 12px 32px rgba(28, 26, 22, 0.015)',
      marginTop: '16px'
    }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr' }} className="selector-grid">
        
        {/* Left Column: Quick Notes & Small Session Overview */}
        <div style={{
          background: '#FAF8F5',
          borderRight: '1px solid var(--cream-border)',
          padding: '32px 28px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }} className="selector-left-notes">
          <div>
            <h3 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '18px',
              color: 'var(--ink)',
              margin: '0 0 6px',
              fontWeight: 400
            }}>
              Session Overview
            </h3>
            <p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '13px',
              color: 'var(--ink-3)',
              lineHeight: 1.5,
              margin: '0 0 24px'
            }}>
              Direct calendar integration enables automated scheduling and instant session confirmations.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <ShieldCheck size={16} color="var(--accent)" style={{ marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <h4 style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 600, color: 'var(--ink)', margin: '0 0 2px' }}>Verified Connection</h4>
                  <p style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--ink-4)', margin: 0 }}>Google Calendar connected & verified</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <Video size={16} color="var(--accent)" style={{ marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <h4 style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 600, color: 'var(--ink)', margin: '0 0 2px' }}>Google Meet</h4>
                  <p style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--ink-4)', margin: 0 }}>Secure unique session links generated</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <Zap size={16} color="var(--accent)" style={{ marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <h4 style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 600, color: 'var(--ink)', margin: '0 0 2px' }}>Instant Scheduling</h4>
                  <p style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--ink-4)', margin: 0 }}>Pick your slot and get booked instantly</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <HelpCircle size={16} color="var(--accent)" style={{ marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <h4 style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 600, color: 'var(--ink)', margin: '0 0 2px' }}>Preparation Brief</h4>
                  <p style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--ink-4)', margin: 0 }}>Describe your challenges before checkout</p>
                </div>
              </div>
            </div>
          </div>

          <div style={{
            background: 'var(--white)',
            border: '1px solid var(--cream-border)',
            borderRadius: '10px',
            padding: '12px 16px',
            marginTop: '32px'
          }}>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '11.5px', color: 'var(--ink-3)', margin: 0, lineHeight: 1.5 }}>
              💡 Sessions are covered under our secure founder satisfaction guarantee.
            </p>
          </div>
        </div>

        {/* Right Column: Interactive Tab List & Details */}
        <div style={{
          padding: '32px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }} className="selector-right-pane">
          <div>
            <span style={{
              fontSize: '10px',
              fontWeight: 700,
              color: 'var(--ink-4)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: '14px',
              display: 'block'
            }}>Select Session Type</span>

            {/* Session Type horizontal/vertical selector tabs */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '28px' }}>
              {activeSessions.map((session, index) => {
                const isSelected = index === selectedIndex
                return (
                  <button
                    key={session.id}
                    onClick={() => setSelectedIndex(index)}
                    style={{
                      textAlign: 'left',
                      padding: '8px 16px',
                      borderRadius: '100px',
                      background: isSelected ? 'var(--accent)' : 'var(--bg)',
                      border: '1.5px solid',
                      borderColor: isSelected ? 'var(--accent)' : 'var(--cream-border)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      outline: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                    className="selector-tab-btn"
                  >
                    <span style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: isSelected ? 'var(--white)' : 'var(--ink-2)'
                    }}>
                      {session.name}
                    </span>
                    <span style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '11.5px',
                      color: isSelected ? 'rgba(255,255,255,0.85)' : 'var(--ink-4)',
                      fontWeight: 500
                    }}>
                      ({session.duration_minutes}m)
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Detailed Presenter */}
            <div style={{ minHeight: '120px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <h4 style={{ fontFamily: 'var(--font-sans)', fontSize: '18px', fontWeight: 700, color: 'var(--ink)', margin: 0 }}>
                  {activeSession.name}
                </h4>
              </div>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13.5px', color: 'var(--ink-3)', lineHeight: 1.6, margin: '0 0 20px' }}>
                {activeSession.description}
              </p>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--cream-border)', paddingTop: '20px', marginTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <span style={{ fontSize: '12px', color: 'var(--ink-4)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600, marginBottom: '2px' }}>Total Rate</span>
                <span style={{ fontSize: '13.5px', color: 'var(--ink-3)', fontFamily: 'var(--font-sans)' }}>{activeSession.duration_minutes} min Session</span>
              </div>
              <strong style={{ fontSize: '26px', color: 'var(--ink)', fontFamily: 'var(--font-serif)', fontWeight: 400 }}>
                {activeSession.price_inr > 0 ? `₹${activeSession.price_inr.toLocaleString()}` : 'Free'}
              </strong>
            </div>

            <Link
              href={`/mentor-connect/book/${mentorSlug}/${activeSession.id}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                width: '100%',
                padding: '16px 20px',
                background: 'var(--ink)',
                color: 'var(--white)',
                borderRadius: '10px',
                fontFamily: 'var(--font-sans)',
                fontSize: '14px',
                fontWeight: 600,
                textDecoration: 'none',
                transition: 'all 0.15s ease',
                boxShadow: '0 4px 12px rgba(28,26,22,0.05)'
              }}
              className="session-selector-book-cta"
            >
              Book Selected Session
              <ArrowUpRight size={15} />
            </Link>
          </div>

        </div>

      </div>

      <style jsx global>{`
        .selector-tab-btn:hover {
          border-color: var(--accent) !important;
        }
        .session-selector-book-cta:hover {
          background: var(--accent) !important;
          transform: translateY(-1px);
        }
        @media (max-width: 768px) {
          .selector-grid {
            grid-template-columns: 1fr !important;
          }
          .selector-left-notes {
            border-right: none !important;
            border-bottom: 1px solid var(--cream-border);
          }
        }
      `}</style>
    </div>
  )
}
