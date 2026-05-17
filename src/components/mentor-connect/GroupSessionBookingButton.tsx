'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { initiateGroupBooking, confirmGroupBooking } from '@/lib/actions/group-booking'

interface GroupSessionBookingButtonProps {
  groupSessionId: string
  priceInr: number
  isFull: boolean
  isLoggedIn: boolean
}

export function GroupSessionBookingButton({ groupSessionId, priceInr, isFull, isLoggedIn }: GroupSessionBookingButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Load Razorpay script on mount
  useEffect(() => {
    if (!document.getElementById('razorpay-script')) {
      const script = document.createElement('script')
      script.id = 'razorpay-script'
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.async = true
      document.body.appendChild(script)
    }
  }, [])

  const handleBooking = async () => {
    if (!isLoggedIn) {
      router.push('/login?redirect=' + encodeURIComponent(window.location.pathname))
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await initiateGroupBooking({ groupSessionId })

      if (result.error) {
        setError(result.error)
        setLoading(false)
        return
      }

      if (result.requiresPayment && result.razorpayOrderId && result.razorpayKeyId) {
        const options = {
          key: result.razorpayKeyId,
          order_id: result.razorpayOrderId,
          name: 'GrantsIndia',
          description: 'Group Office Hour Booking',
          handler: async function (response: any) {
            setLoading(true)
            setError(null)

            try {
              const confirmResult = await confirmGroupBooking({
                groupSessionId,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              })

              if (confirmResult.error) {
                setError(confirmResult.error)
              } else {
                setSuccess(true)
                router.refresh()
              }
            } catch (err: any) {
              setError(err.message || 'Payment confirmation failed.')
            } finally {
              setLoading(false)
            }
          },
          modal: {
            ondismiss: function () {
              setLoading(false)
              setError('Payment was cancelled. You can try again.')
            }
          },
          theme: {
            color: '#1A1A1A'
          }
        }

        const rzp = new (window as any).Razorpay(options)
        rzp.on('payment.failed', function (response: any) {
          setError(`Payment failed: ${response.error.description}`)
          setLoading(false)
        })
        rzp.open()
      } else {
        setError('Failed to setup payment. Please try again.')
        setLoading(false)
      }

    } catch (err: any) {
      setError(err.message || 'An error occurred during booking.')
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div style={{
        background: '#EDF5EA',
        border: '1px solid #BBF7D0',
        borderRadius: '12px',
        padding: '24px',
        textAlign: 'center',
        fontFamily: 'var(--font-sans)',
      }}>
        <p style={{ color: '#166534', fontWeight: 600, fontSize: '16px', margin: '0 0 4px' }}>✓ Seat Booked Successfully!</p>
        <p style={{ color: '#166534', fontSize: '13px', margin: 0 }}>You are confirmed for this group session.</p>
      </div>
    )
  }

  return (
    <div>
      {error && (
        <div style={{
          background: '#FEF2F2',
          border: '1px solid #FCA5A5',
          color: '#991B1B',
          padding: '12px 14px',
          borderRadius: '8px',
          marginBottom: '16px',
          fontFamily: 'var(--font-sans)',
          fontSize: '13px',
          lineHeight: 1.4
        }}>
          {error}
        </div>
      )}

      <button
        onClick={handleBooking}
        disabled={loading}
        style={{
          width: '100%',
          padding: '16px',
          background: loading ? 'var(--ink-4)' : isFull ? '#991B1B' : 'var(--ink)',
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
        {loading ? 'Processing...' : isFull ? 'Join Waitlist' : `Book a Seat (₹${priceInr.toLocaleString()})`}
      </button>
    </div>
  )
}
