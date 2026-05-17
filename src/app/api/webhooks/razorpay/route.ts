import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'

/**
 * Razorpay Webhook Handler
 * 
 * Active events: payment.captured, payment.failed
 * This is a safety net — primary confirmation happens client-side.
 * Catches edge cases like browser closure after payment.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-razorpay-signature')

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(body)
      .digest('hex')

    if (expectedSignature !== signature) {
      console.error('Webhook signature mismatch')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const event = JSON.parse(body)
    const eventType = event.event

    // Use service role client to bypass RLS
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    if (eventType === 'payment.captured') {
      const payment = event.payload.payment.entity
      const orderId = payment.order_id
      const paymentId = payment.id

      // Find the session by razorpay_order_id
      const { data: session } = await supabase
        .from('sessions')
        .select('id, status')
        .eq('razorpay_order_id', orderId)
        .single()

      if (!session) {
        console.error('Webhook: Session not found for order', orderId)
        return NextResponse.json({ status: 'session_not_found' })
      }

      // Only confirm if still pending (avoid double-confirming)
      if (session.status === 'pending_payment') {
        await supabase
          .from('sessions')
          .update({
            status: 'confirmed',
            razorpay_payment_id: paymentId,
          })
          .eq('id', session.id)

        // Create Google Calendar event (non-blocking)
        try {
          const { createSessionEvent } = await import('@/lib/mentor/calendar-booking')
          await createSessionEvent(session.id)
        } catch (calErr) {
          console.error('Webhook: Calendar event creation failed:', calErr)
        }

        console.log(`Webhook: Session ${session.id} confirmed via webhook`)
      }

      return NextResponse.json({ status: 'ok' })
    }

    if (eventType === 'payment.failed') {
      const payment = event.payload.payment.entity
      const orderId = payment.order_id

      console.error('Webhook: Payment failed for order', orderId, payment.error_description)

      return NextResponse.json({ status: 'logged' })
    }

    // Unknown event — acknowledge
    return NextResponse.json({ status: 'ignored' })

  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
