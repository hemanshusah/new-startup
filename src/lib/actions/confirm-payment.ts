'use server'

import crypto from 'crypto'
import { createServiceClient } from '@/lib/supabase/server'

interface ConfirmPaymentParams {
  sessionId: string
  razorpayOrderId: string
  razorpayPaymentId: string
  razorpaySignature: string
}

/**
 * Verifies the Razorpay payment signature and confirms the session.
 * Called from the client after the Razorpay checkout widget reports success.
 */
export async function confirmPayment(params: ConfirmPaymentParams) {
  const { sessionId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = params

  // 1. Verify signature
  const body = razorpayOrderId + '|' + razorpayPaymentId
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(body)
    .digest('hex')

  if (expectedSignature !== razorpaySignature) {
    console.error('Payment signature mismatch', { sessionId, razorpayOrderId })
    return { error: 'Payment verification failed. Please contact support.' }
  }

  const supabase = createServiceClient()

  // 2. Update session status to confirmed
  const { error: updateError } = await supabase
    .from('sessions')
    .update({
      status: 'confirmed',
      razorpay_payment_id: razorpayPaymentId,
    })
    .eq('id', sessionId)
    .eq('razorpay_order_id', razorpayOrderId)

  if (updateError) {
    console.error('Failed to confirm session:', updateError)
    return { error: 'Failed to confirm session. Please contact support.' }
  }

  // 3. Create Google Calendar event with Meet link (non-blocking)
  try {
    const { createSessionEvent } = await import('@/lib/mentor/calendar-booking')
    await createSessionEvent(sessionId)
  } catch (calErr) {
    console.error('Calendar event creation failed (non-blocking):', calErr)
    // Don't fail the payment confirmation if calendar fails
  }

  return { success: true, sessionId }
}
