'use server'

import { createServiceClient } from '@/lib/supabase/server'
import { getAuthenticatedUser } from '@/lib/auth-utils'

interface InitiateBookingParams {
  mentorId: string
  sessionTypeId: string
  selectedSlot: string // ISO string
  founderBrief: string
}

export async function initiateBooking(params: InitiateBookingParams) {
  const user = await getAuthenticatedUser()
  if (!user) {
    return { error: 'You must be logged in to book a session.' }
  }

  const supabase = createServiceClient()

  try {
    // 1. Fetch session type for pricing and duration
    const { data: sessionType, error: stError } = await supabase
      .from('session_types')
      .select('id, price_inr, duration_minutes, mentor_id')
      .eq('id', params.sessionTypeId)
      .eq('mentor_id', params.mentorId)
      .single()

    if (stError || !sessionType) {
      return { error: 'Session type not found.' }
    }

    // 2. Calculate commission
    const { data: siteConfig } = await supabase
      .from('site_config')
      .select('mentor_commission_pct')
      .limit(1)
      .single()

    const commissionPct = siteConfig?.mentor_commission_pct ?? 20
    const amountInr = sessionType.price_inr
    const platformCommission = Math.round(amountInr * commissionPct / 100)
    const mentorPayout = amountInr - platformCommission

    // 3. Calculate scheduled start/end
    const scheduledStart = new Date(params.selectedSlot)
    const scheduledEnd = new Date(scheduledStart.getTime() + sessionType.duration_minutes * 60 * 1000)

    // 4. Insert session record
    const { data: session, error: insertError } = await supabase
      .from('sessions')
      .insert({
        mentor_id: params.mentorId,
        founder_id: user.id,
        session_type_id: sessionType.id,
        status: amountInr > 0 ? 'pending_payment' : 'confirmed',
        scheduled_start: scheduledStart.toISOString(),
        scheduled_end: scheduledEnd.toISOString(),
        amount_inr: amountInr,
        platform_commission_inr: platformCommission,
        mentor_payout_inr: mentorPayout,
        founder_brief: params.founderBrief
      })
      .select('id')
      .single()

    if (insertError) {
      console.error('Error creating session:', insertError)
      return { error: insertError.message || 'Failed to create session.' }
    }

    // 5. If free session, confirm immediately and create calendar event
    if (amountInr === 0) {
      // Create calendar event for free sessions
      try {
        const { createSessionEvent } = await import('@/lib/mentor/calendar-booking')
        await createSessionEvent(session.id)
      } catch (calErr) {
        console.error('Calendar event creation failed (non-blocking):', calErr)
      }

      return { sessionId: session.id, requiresPayment: false }
    }

    // 6. For paid sessions, create Razorpay order
    const Razorpay = (await import('razorpay')).default
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    })

    const order = await razorpay.orders.create({
      amount: amountInr * 100, // Razorpay uses paise
      currency: 'INR',
      receipt: session.id,
      notes: {
        session_id: session.id,
        mentor_id: params.mentorId,
        founder_id: user.id
      }
    })

    // Update session with Razorpay order ID
    await supabase
      .from('sessions')
      .update({ razorpay_order_id: order.id })
      .eq('id', session.id)

    return {
      sessionId: session.id,
      requiresPayment: true,
      razorpayOrderId: order.id,
      razorpayKeyId: process.env.RAZORPAY_KEY_ID
    }

  } catch (error: unknown) {
    console.error('Booking error:', error)
    const message = error instanceof Error ? error.message : 'Failed to initiate booking.'
    return { error: message }
  }
}
