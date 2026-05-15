'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { initiateBooking } from '@/lib/actions/booking'

interface BookingDetailsFormProps {
  mentorId: string
  mentorSlug: string
  sessionTypeId: string
  selectedSlot: string
  priceInr: number
}

export function BookingDetailsForm({ mentorId, mentorSlug, sessionTypeId, selectedSlot, priceInr }: BookingDetailsFormProps) {
  const router = useRouter()
  const [brief, setBrief] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!brief.trim()) {
      setError('Please describe what you need help with.')
      return
    }
    if (brief.trim().length < 20) {
      setError('Please provide at least 20 characters so your mentor can prepare.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await initiateBooking({
        mentorId,
        sessionTypeId,
        selectedSlot,
        founderBrief: brief.trim()
      })

      if (result.error) {
        setError(result.error)
        return
      }

      if (result.requiresPayment && result.razorpayOrderId) {
        // TODO: Open Razorpay checkout widget once keys are configured
        // For now, show a message
        setError('Payment integration is being configured. Please try again shortly.')
      } else if (result.sessionId) {
        // Free session or payment completed — go to success
        router.push(`/mentor-connect/book/success?session=${result.sessionId}`)
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <label style={{
          display: 'block',
          fontFamily: 'var(--font-sans)',
          fontSize: '14px',
          fontWeight: 500,
          color: 'var(--ink)',
          marginBottom: '8px'
        }}>
          What do you need help with? *
        </label>
        <textarea
          value={brief}
          onChange={(e) => setBrief(e.target.value)}
          placeholder="E.g. I'm building a fintech startup targeting the Indian market. I need guidance on regulatory compliance for cross-border payments and advice on approaching investors for a seed round..."
          maxLength={500}
          rows={6}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: '10px',
            border: '1px solid var(--cream-border)',
            background: 'var(--cream)',
            fontFamily: 'var(--font-sans)',
            fontSize: '15px',
            lineHeight: 1.5,
            resize: 'vertical',
            color: 'var(--ink)'
          }}
        />
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--ink-4)', margin: '6px 0 0', textAlign: 'right' }}>
          {brief.length}/500
        </p>
      </div>

      <div style={{ marginBottom: '24px', padding: '16px', background: 'var(--cream)', borderRadius: '10px', border: '1px solid var(--cream-border)' }}>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--ink-3)', margin: 0, lineHeight: 1.5 }}>
          💡 <strong>Tips for a great brief:</strong> Include your startup stage, specific challenges, and what outcome you're hoping for. The mentor will review this before your session.
        </p>
      </div>

      {error && (
        <div style={{
          background: '#FEF2F2',
          border: '1px solid #FCA5A5',
          color: '#991B1B',
          padding: '14px 16px',
          borderRadius: '8px',
          marginBottom: '24px',
          fontFamily: 'var(--font-sans)',
          fontSize: '14px'
        }}>
          {error}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{
          width: '100%',
          padding: '16px',
          background: loading ? 'var(--ink-4)' : 'var(--ink)',
          color: 'var(--white)',
          borderRadius: '10px',
          fontFamily: 'var(--font-sans)',
          fontSize: '16px',
          fontWeight: 600,
          cursor: loading ? 'wait' : 'pointer',
          border: 'none',
          transition: 'background 0.2s ease'
        }}
      >
        {loading ? 'Processing...' : priceInr > 0 ? `Proceed to Pay ₹${priceInr.toLocaleString()}` : 'Confirm Booking'}
      </button>
    </div>
  )
}
