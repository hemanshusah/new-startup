'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ReviewForm } from './ReviewForm'

interface FounderSessionCardProps {
  session: any
  mentor: any
  sessionType: any
  hasReviewedInitial: boolean
  nowString: string
}

export function FounderSessionCard({ session: s, mentor, sessionType: st, hasReviewedInitial, nowString }: FounderSessionCardProps) {
  const [isReviewing, setIsReviewing] = useState(false)
  const [hasReviewed, setHasReviewed] = useState(hasReviewedInitial)

  const startDate = new Date(s.scheduled_start)
  const dateStr = startDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  const timeStr = startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  
  const now = new Date(nowString)
  const isUpcoming = startDate > now && s.status !== 'cancelled'
  const canReview = s.status === 'completed' && !hasReviewed

  const StatusBadge = ({ status }: { status: string }) => {
    const colors: Record<string, { bg: string; text: string }> = {
      confirmed: { bg: '#EDF5EA', text: '#166534' },
      completed: { bg: '#EDF5EA', text: '#166534' },
      pending_payment: { bg: '#FFFBEB', text: '#92400E' },
      cancelled: { bg: '#FEF2F2', text: '#991B1B' },
    }
    const c = colors[status] || { bg: 'var(--cream)', text: 'var(--ink-3)' }
    const label = status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())

    return (
      <span style={{
        padding: '4px 10px',
        borderRadius: '6px',
        background: c.bg,
        color: c.text,
        fontFamily: 'var(--font-sans)',
        fontSize: '12px',
        fontWeight: 600,
        textTransform: 'capitalize'
      }}>
        {label}
      </span>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: 'var(--white)', border: '1px solid var(--cream-border)', borderRadius: '12px', padding: '20px' }}>
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        {/* Mentor Avatar */}
        {mentor?.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={mentor.avatar_url} alt="" style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
        ) : (
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--cream-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-serif)', fontSize: '18px', color: 'var(--ink-4)', flexShrink: 0 }}>
            {mentor?.display_name?.charAt(0) || 'M'}
          </div>
        )}

        {/* Details */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '15px', fontWeight: 600, color: 'var(--ink)', margin: 0 }}>
              {st?.name || 'Session'}
            </p>
            <StatusBadge status={s.status} />
          </div>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--ink-3)', margin: '0 0 2px' }}>
            with {mentor?.display_name || 'Mentor'}
          </p>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--ink-4)', margin: 0 }}>
            {dateStr} at {timeStr}
          </p>
        </div>

        {/* Action */}
        <div style={{ flexShrink: 0, display: 'flex', gap: '10px' }}>
          {isUpcoming && s.google_meet_link ? (
            <a
              href={s.google_meet_link}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '8px 16px',
                background: '#166534',
                color: '#fff',
                borderRadius: '8px',
                fontFamily: 'var(--font-sans)',
                fontSize: '13px',
                fontWeight: 500,
                textDecoration: 'none'
              }}
            >
              Join Meet
            </a>
          ) : (
            <>
              {canReview && !isReviewing && (
                <button
                  onClick={() => setIsReviewing(true)}
                  style={{
                    padding: '8px 16px',
                    background: 'var(--ink)',
                    color: 'var(--white)',
                    borderRadius: '8px',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    border: 'none'
                  }}
                >
                  Write Review
                </button>
              )}
              <Link
                href={`/mentor-connect/book/success?session=${s.id}`}
                style={{
                  padding: '8px 16px',
                  background: 'var(--cream)',
                  color: 'var(--ink)',
                  borderRadius: '8px',
                  border: '1px solid var(--cream-border)',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '13px',
                  fontWeight: 500,
                  textDecoration: 'none'
                }}
              >
                View Details
              </Link>
            </>
          )}
        </div>
      </div>

      {isReviewing && (
        <div style={{ marginTop: '8px', borderTop: '1px solid var(--cream-border)', paddingTop: '16px' }}>
          <ReviewForm
            sessionId={s.id}
            mentorId={s.mentor_id}
            onSuccess={() => {
              setHasReviewed(true)
              setIsReviewing(false)
            }}
            onCancel={() => setIsReviewing(false)}
          />
        </div>
      )}

      {hasReviewed && (
        <p style={{ margin: '4px 0 0 64px', fontFamily: 'var(--font-sans)', fontSize: '12px', color: '#166534', fontWeight: 500 }}>
          ✓ Review submitted! Thank you.
        </p>
      )}
    </div>
  )
}
