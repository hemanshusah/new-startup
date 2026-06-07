'use client'

import React from 'react'

interface TimelineStep {
  timestamp: string
  actor: 'founder' | 'mentor' | string
  event: string
  details?: string
}

interface NegotiationTimelineProps {
  timeline?: TimelineStep[]
}

export function NegotiationTimeline({ timeline = [] }: NegotiationTimelineProps) {
  if (!timeline || timeline.length === 0) return null

  return (
    <div style={{
      marginTop: '20px',
      padding: '20px',
      background: 'var(--cream-light)',
      borderRadius: '12px',
      border: '1px solid var(--cream-border)',
      fontFamily: 'var(--font-sans)'
    }}>
      <h5 style={{
        margin: '0 0 16px',
        fontSize: '11px',
        fontWeight: 700,
        color: 'var(--ink-4)',
        textTransform: 'uppercase',
        letterSpacing: '0.05em'
      }}>
        💬 Discussion & Negotiation History
      </h5>

      <div style={{
        position: 'relative',
        paddingLeft: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}>
        {/* Vertical line */}
        <div style={{
          position: 'absolute',
          left: '7px',
          top: '6px',
          bottom: '6px',
          width: '2px',
          background: 'var(--cream-dark)',
          borderStyle: 'dashed'
        }} />

        {timeline.map((step, idx) => {
          const isFounder = step.actor === 'founder'
          
          return (
            <div key={idx} style={{
              position: 'relative',
              fontSize: '13px'
            }}>
              {/* Timeline circle node */}
              <div style={{
                position: 'absolute',
                left: '-24px',
                top: '4px',
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                background: isFounder ? '#EDF5EA' : '#FFF9E6',
                border: isFounder ? '2px solid #2A6620' : '2px solid #D97706',
                zIndex: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
              }} />

              {/* Step Card Content */}
              <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '8px',
                  marginBottom: '4px'
                }}>
                  <strong style={{
                    color: 'var(--ink)',
                    fontWeight: 600
                  }}>
                    {step.event}
                  </strong>
                  <span style={{
                    fontSize: '11px',
                    color: 'var(--ink-4)',
                    fontWeight: 500
                  }}>
                    {step.timestamp}
                  </span>
                </div>
                {step.details && (
                  <p style={{
                    margin: 0,
                    fontSize: '12px',
                    color: 'var(--ink-3)',
                    lineHeight: 1.4,
                    background: 'var(--white)',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(0, 0, 0, 0.02)',
                    marginTop: '4px'
                  }}>
                    {step.details}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
