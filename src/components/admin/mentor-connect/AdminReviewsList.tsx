'use client'

import { useState } from 'react'
import { toggleReviewVisibility } from '@/lib/actions/reviews-admin'

interface AdminReviewsListProps {
  initialReviews: any[]
}

export function AdminReviewsList({ initialReviews }: AdminReviewsListProps) {
  const [reviews, setReviews] = useState(initialReviews)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleToggle = async (reviewId: string, currentHidden: boolean) => {
    setLoadingId(reviewId)
    setError(null)

    try {
      const result = await toggleReviewVisibility(reviewId, currentHidden)
      if (result.error) {
        setError(result.error)
      } else {
        setReviews(prev =>
          prev.map(r => r.id === reviewId ? { ...r, is_hidden: !currentHidden } : r)
        )
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during moderation.')
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div>
      {error && (
        <div style={{ padding: '12px 16px', background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', borderRadius: '8px', marginBottom: '20px', fontFamily: 'var(--font-sans)', fontSize: '13px' }}>
          ⚠️ {error}
        </div>
      )}

      {reviews.length === 0 ? (
        <div style={{ background: 'var(--white)', border: '1px solid var(--cream-border)', borderRadius: '12px', padding: '48px', textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--ink-4)', margin: 0 }}>
            No reviews found.
          </p>
        </div>
      ) : (
        <div style={{ background: 'var(--white)', border: '1px solid var(--cream-border)', borderRadius: '12px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-sans)', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: 'var(--cream)', borderBottom: '1px solid var(--cream-border)' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 500, color: 'var(--ink-3)' }}>Mentor</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 500, color: 'var(--ink-3)' }}>Founder</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 500, color: 'var(--ink-3)' }}>Ratings</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 500, color: 'var(--ink-3)' }}>Review Content</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 500, color: 'var(--ink-3)' }}>Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 500, color: 'var(--ink-3)' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((r) => (
                <tr key={r.id} style={{ borderBottom: '1px solid var(--cream-border)', verticalAlign: 'top' }}>
                  <td style={{ padding: '16px 12px', color: 'var(--ink)', fontWeight: 500 }}>
                    {r.mentor?.display_name || '—'}
                  </td>
                  <td style={{ padding: '16px 12px', color: 'var(--ink)' }}>
                    {r.founder?.full_name || '—'}
                  </td>
                  <td style={{ padding: '16px 12px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '11px', color: 'var(--ink-3)' }}>
                      <span style={{ color: '#EAB308', fontWeight: 600 }}>Overall: {r.rating_overall}★</span>
                      <span>Knowledge: {r.rating_knowledge}★</span>
                      <span>Clarity: {r.rating_clarity}★</span>
                      <span>Actionability: {r.rating_actionability}★</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px 12px', maxWidth: '300px' }}>
                    <p style={{ margin: '0 0 6px', color: 'var(--ink)', lineHeight: 1.4 }}>{r.review_text}</p>
                    <span style={{ fontSize: '11px', color: 'var(--ink-4)' }}>
                      Submitted: {new Date(r.created_at).toLocaleDateString()}
                    </span>
                  </td>
                  <td style={{ padding: '16px 12px' }}>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 500,
                      background: r.is_hidden ? '#FEF2F2' : '#EDF5EA',
                      color: r.is_hidden ? '#B91C1C' : '#166534',
                    }}>
                      {r.is_hidden ? 'Hidden' : 'Visible'}
                    </span>
                  </td>
                  <td style={{ padding: '16px 12px' }}>
                    <button
                      onClick={() => handleToggle(r.id, r.is_hidden)}
                      disabled={loadingId === r.id}
                      style={{
                        padding: '6px 12px',
                        background: 'none',
                        border: '1px solid var(--cream-border)',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontFamily: 'var(--font-sans)',
                        color: r.is_hidden ? '#166534' : '#B91C1C',
                        cursor: loadingId === r.id ? 'wait' : 'pointer',
                        fontWeight: 500
                      }}
                    >
                      {loadingId === r.id ? '...' : r.is_hidden ? 'Unhide' : 'Hide'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
