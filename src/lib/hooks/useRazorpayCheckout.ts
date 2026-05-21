'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { confirmPayment } from '@/lib/actions/confirm-payment'

declare global {
  interface Window {
    Razorpay: any
  }
}

export function useRazorpayCheckout() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')
  const [error, setError] = useState<string | null>(null)

  // Ensure script is loaded
  useEffect(() => {
    if (typeof window !== 'undefined' && !document.getElementById('razorpay-script')) {
      const script = document.createElement('script')
      script.id = 'razorpay-script'
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.async = true
      document.body.appendChild(script)
    }
  }, [])

  const startCheckout = async (params: {
    sessionId: string
    razorpayOrderId: string
    razorpayKeyId: string
    onSuccess?: (sessionId: string) => void
  }) => {
    setLoading(true)
    setLoadingMessage('Opening payment window')
    setError(null)

    // Wait a brief moment if Razorpay script is still initializing
    if (typeof window === 'undefined' || !window.Razorpay) {
      await new Promise((resolve) => setTimeout(resolve, 800))
    }

    if (typeof window === 'undefined' || !window.Razorpay) {
      setError('Razorpay payment gateway failed to load. Please refresh the page and try again.')
      setLoading(false)
      return
    }

    const options = {
      key: params.razorpayKeyId,
      order_id: params.razorpayOrderId,
      name: 'GrantsIndia',
      description: 'Mentor Connect Session',
      handler: async function (response: any) {
        setLoading(true)
        setLoadingMessage('Verifying payment and generating secure Google Meet credentials')
        setError(null)

        try {
          const result = await confirmPayment({
            sessionId: params.sessionId,
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          })

          if (result.error) {
            setError(result.error)
            setLoading(false)
          } else {
            if (params.onSuccess) {
              params.onSuccess(params.sessionId)
            } else {
              router.push(`/mentor-connect/book/success?session=${params.sessionId}`)
            }
          }
        } catch (err: any) {
          setError(err.message || 'Payment verification failed.')
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

    try {
      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', function (response: any) {
        setError(`Payment failed: ${response.error.description}`)
        setLoading(false)
      })
      rzp.open()
    } catch (err: any) {
      setError(err.message || 'Failed to open Razorpay payment gateway.')
      setLoading(false)
    }
  }

  return {
    loading,
    loadingMessage,
    error,
    setError,
    startCheckout
  }
}
