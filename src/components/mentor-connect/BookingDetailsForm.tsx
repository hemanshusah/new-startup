'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { initiateBooking } from '@/lib/actions/booking'
import { useRazorpayCheckout } from '@/lib/hooks/useRazorpayCheckout'
import { PaymentLoadingOverlay } from './PaymentLoadingOverlay'

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
  const [localLoading, setLocalLoading] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
  
  // Custom hook handles all of the script loading, state, verify modals, and verification!
  const checkout = useRazorpayCheckout()

  // Track session details locally if they close payment popup and retry
  const [sessionDetails, setSessionDetails] = useState<{ sessionId: string, razorpayOrderId: string, razorpayKeyId: string } | null>(null)

  const handleSubmit = async () => {
    if (!brief.trim()) {
      setLocalError('Please describe what you need help with.')
      return
    }
    if (brief.trim().length < 20) {
      setLocalError('Please provide at least 20 characters so your mentor can prepare.')
      return
    }

    setLocalLoading(true)
    setLocalError(null)
    checkout.setError(null)

    // Reuse existing booking details if they exist
    if (sessionDetails) {
      setLocalLoading(false)
      checkout.startCheckout({
        sessionId: sessionDetails.sessionId,
        razorpayOrderId: sessionDetails.razorpayOrderId,
        razorpayKeyId: sessionDetails.razorpayKeyId
      })
      return
    }

    try {
      const result = (await initiateBooking({
        mentorId,
        sessionTypeId,
        selectedSlot,
        founderBrief: brief.trim()
      })) as any

      if (result.error) {
        setLocalError(result.error)
        setLocalLoading(false)
        return
      }

      if (result.requiresPayment && result.razorpayOrderId && result.razorpayKeyId) {
        setSessionDetails({
          sessionId: result.sessionId!,
          razorpayOrderId: result.razorpayOrderId,
          razorpayKeyId: result.razorpayKeyId
        })
        setLocalLoading(false)
        // Fire custom hook checkout widget
        checkout.startCheckout({
          sessionId: result.sessionId!,
          razorpayOrderId: result.razorpayOrderId,
          razorpayKeyId: result.razorpayKeyId
        })
      } else if (result.sessionId && !result.requiresPayment) {
        // Free session — go directly to success
        router.push(`/mentor-connect/book/success?session=${result.sessionId}`)
      } else {
        setLocalError('Something went wrong with payment setup. Please try again.')
        setLocalLoading(false)
      }
    } catch (err: any) {
      setLocalError(err.message || 'Something went wrong. Please try again.')
      setLocalLoading(false)
    }
  }

  const activeError = localError || checkout.error
  const activeLoading = localLoading || checkout.loading
  const activeMessage = localLoading ? 'Initiating secure checkout process' : checkout.loadingMessage

  return (
    <div>
      {/* Premium secure lock-screen overlay during payment processing */}
      <PaymentLoadingOverlay isOpen={activeLoading} message={activeMessage} />

      <div style={{ marginBottom: '24px' }}>
        <label style={{
          display: 'block',
          fontFamily: 'var(--font-sans)',
          fontSize: '11px',
          fontWeight: 700,
          color: 'var(--ink)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: '10px'
        }}>
          What do you need help with? *
        </label>
        <textarea
          value={brief}
          onChange={(e) => setBrief(e.target.value)}
          disabled={activeLoading}
          placeholder="E.g. I'm building a fintech startup targeting the Indian market. I need guidance on regulatory compliance for cross-border payments and advice on approaching investors for a seed round..."
          maxLength={500}
          rows={6}
          style={{
            width: '100%',
            padding: '16px',
            borderRadius: '10px',
            border: '1.5px solid var(--cream-border)',
            background: 'rgba(28, 26, 22, 0.02)',
            fontFamily: 'var(--font-sans)',
            fontSize: '15px',
            lineHeight: 1.6,
            resize: 'vertical',
            color: 'var(--ink)',
            outline: 'none',
            transition: 'all 0.15s ease'
          }}
          className="brief-textarea"
        />
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--ink-4)', margin: '6px 0 0', textAlign: 'right' }}>
          {brief.length}/500
        </p>
      </div>

      <div style={{
        marginBottom: '32px',
        padding: '18px 20px',
        background: '#FAF8F5',
        borderRadius: '10px',
        border: '1px solid var(--cream-border)',
        borderLeft: '3px solid var(--accent)'
      }}>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13.5px', color: 'var(--ink-3)', margin: 0, lineHeight: 1.6 }}>
          💡 <strong>Tips for a great brief:</strong> Include your startup stage, specific challenges, and what outcome you&apos;re hoping for. The mentor will review this before your session.
        </p>
      </div>

      {activeError && (
        <div style={{
          background: '#FEF2F2',
          border: '1px solid #FCA5A5',
          color: '#991B1B',
          padding: '14px 18px',
          borderRadius: '10px',
          fontSize: '14px',
          fontFamily: 'var(--font-sans)',
          marginBottom: '28px',
          lineHeight: 1.5
        }}>
          ⚠️ {activeError}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={activeLoading}
        style={{
          width: '100%',
          padding: '16px 20px',
          background: 'var(--ink)',
          color: 'var(--white)',
          border: 'none',
          borderRadius: '100px',
          fontFamily: 'var(--font-sans)',
          fontSize: '15px',
          fontWeight: 600,
          cursor: activeLoading ? 'wait' : 'pointer',
          transition: 'all 0.15s ease',
          boxShadow: '0 4px 14px rgba(28, 26, 22, 0.08)'
        }}
        className="details-confirm-btn"
      >
        {activeLoading ? 'Securing checkout...' : priceInr > 0 ? `Confirm Booking & Pay ₹${priceInr.toLocaleString()}` : 'Confirm Free Booking'}
      </button>

      <style jsx global>{`
        .brief-textarea:focus {
          border-color: var(--accent) !important;
          background: var(--white) !important;
          box-shadow: 0 4px 12px rgba(184, 70, 10, 0.05) !important;
        }
        .details-confirm-btn:hover {
          background: var(--accent) !important;
          box-shadow: 0 8px 24px rgba(184, 70, 10, 0.25) !important;
          transform: translateY(-1px);
        }
      `}</style>
    </div>
  )
}
