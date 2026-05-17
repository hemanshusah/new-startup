'use client'

import { useState } from 'react'
import { submitReview } from '@/lib/actions/reviews'

interface ReviewFormProps {
  sessionId: string
  mentorId: string
  onSuccess: () => void
  onCancel: () => void
}

export function ReviewForm({ sessionId, mentorId, onSuccess, onCancel }: ReviewFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [ratingOverall, setRatingOverall] = useState(5)
  const [ratingKnowledge, setRatingKnowledge] = useState(5)
  const [ratingClarity, setRatingClarity] = useState(5)
  const [ratingActionability, setRatingActionability] = useState(5)
  const [wouldRebook, setWouldRebook] = useState(true)
  const [reviewText, setReviewText] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reviewText.trim()) {
      setError('Please write a short review text.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await submitReview({
        sessionId,
        mentorId,
        ratingOverall,
        ratingKnowledge,
        ratingClarity,
        ratingActionability,
        wouldRebook,
        reviewText
      })

      if (result.error) {
        setError(result.error)
      } else {
        onSuccess()
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred.')
    } finally {
      setLoading(false)
    }
  }

  const renderStars = (rating: number, setRating: (r: number) => void) => {
    return (
      <div style={{ display: 'flex', gap: '6px' }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              fontSize: '20px',
              color: star <= rating ? '#EAB308' : '#D1D5DB',
              transition: 'transform 0.1s ease'
            }}
          >
            ★
          </button>
        ))}
      </div>
    )
  }

  const labelStyle = {
    fontFamily: 'var(--font-sans)',
    fontSize: '13px',
    fontWeight: 500,
    color: 'var(--ink-2)',
    width: '140px'
  }

  const ratingRowStyle = {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '10px'
  }

  return (
    <form onSubmit={handleSubmit} style={{ background: 'var(--cream-light)', padding: '24px', borderRadius: '12px', border: '1px solid var(--cream-border)' }}>
      <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', color: 'var(--ink)', margin: '0 0 16px' }}>
        Leave a Review
      </h3>

      <div style={{ marginBottom: '20px' }}>
        <div style={ratingRowStyle}>
          <span style={labelStyle}>Overall Rating *</span>
          {renderStars(ratingOverall, setRatingOverall)}
        </div>
        <div style={ratingRowStyle}>
          <span style={labelStyle}>Knowledge</span>
          {renderStars(ratingKnowledge, setRatingKnowledge)}
        </div>
        <div style={ratingRowStyle}>
          <span style={labelStyle}>Clarity</span>
          {renderStars(ratingClarity, setRatingClarity)}
        </div>
        <div style={ratingRowStyle}>
          <span style={labelStyle}>Actionability</span>
          {renderStars(ratingActionability, setRatingActionability)}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
        <input
          type="checkbox"
          id="wouldRebook"
          checked={wouldRebook}
          onChange={(e) => setWouldRebook(e.target.checked)}
          style={{ width: '16px', height: '16px', cursor: 'pointer' }}
        />
        <label htmlFor="wouldRebook" style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--ink-2)', cursor: 'pointer' }}>
          Would you book a session with this mentor again?
        </label>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 500, color: 'var(--ink-2)', marginBottom: '8px' }}>
          Your Review *
        </label>
        <textarea
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          placeholder="Share your experience. How did this session help your startup? What were your key takeaways?"
          rows={4}
          maxLength={1000}
          required
          style={{
            width: '100%',
            padding: '12px 14px',
            borderRadius: '8px',
            border: '1px solid var(--cream-border)',
            background: 'var(--white)',
            fontFamily: 'var(--font-sans)',
            fontSize: '14px',
            color: 'var(--ink)',
            lineHeight: 1.5,
            resize: 'vertical'
          }}
        />
      </div>

      {error && (
        <div style={{
          background: '#FEF2F2',
          border: '1px solid #FCA5A5',
          color: '#991B1B',
          padding: '12px',
          borderRadius: '8px',
          fontFamily: 'var(--font-sans)',
          fontSize: '13px',
          marginBottom: '16px'
        }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
        <button
          type="button"
          onClick={onCancel}
          style={{
            padding: '8px 16px',
            background: 'none',
            border: '1px solid var(--cream-border)',
            borderRadius: '6px',
            fontFamily: 'var(--font-sans)',
            fontSize: '13px',
            color: 'var(--ink-3)',
            cursor: 'pointer'
          }}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '8px 20px',
            background: loading ? 'var(--ink-4)' : 'var(--ink)',
            color: 'var(--white)',
            borderRadius: '6px',
            fontFamily: 'var(--font-sans)',
            fontSize: '13px',
            fontWeight: 600,
            cursor: loading ? 'wait' : 'pointer',
            border: 'none'
          }}
        >
          {loading ? 'Submitting...' : 'Submit Review'}
        </button>
      </div>
    </form>
  )
}
