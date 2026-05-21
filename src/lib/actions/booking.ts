'use server'

import { createServiceClient } from '@/lib/supabase/server'
import { getAuthenticatedUser } from '@/lib/auth-utils'
import { revalidatePath } from 'next/cache'

interface InitiateBookingParams {
  mentorId: string
  sessionTypeId: string
  selectedSlot: string // ISO string
  founderBrief: string
}

/**
 * Creates a Razorpay order for an existing session that is in pending_payment status.
 * Reusable backend checkout order generator.
 */
export async function createRazorpayOrderForSession(sessionId: string) {
  const supabase = createServiceClient()

  // 1. Fetch session details
  const { data: session, error: fetchErr } = await supabase
    .from('sessions')
    .select('*')
    .eq('id', sessionId)
    .single()

  if (fetchErr || !session) {
    return { error: 'Session booking not found.' }
  }

  if (session.status === 'confirmed' || session.status === 'completed') {
    return { error: 'Session is already paid and confirmed.', requiresPayment: false }
  }

  if (session.amount_inr === 0) {
    return { requiresPayment: false }
  }

  // 2. Spawn secure Razorpay Order
  try {
    const Razorpay = (await import('razorpay')).default
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    })

    const order = await razorpay.orders.create({
      amount: session.amount_inr * 100, // Razorpay works in paise
      currency: 'INR',
      receipt: session.id,
      notes: {
        session_id: session.id,
        mentor_id: session.mentor_id,
        founder_id: session.founder_id
      }
    })

    // 3. Update session with razorpay_order_id in database
    const { error: updateErr } = await supabase
      .from('sessions')
      .update({ razorpay_order_id: order.id })
      .eq('id', session.id)

    if (updateErr) {
      console.error('Failed to update Razorpay order ID in session:', updateErr)
      return { error: 'Failed to secure checkout credentials.' }
    }

    return {
      sessionId: session.id,
      requiresPayment: true,
      razorpayOrderId: order.id,
      razorpayKeyId: process.env.RAZORPAY_KEY_ID
    }
  } catch (err: any) {
    console.error('Razorpay order creation error:', err)
    return { error: err.message || 'Razorpay order formulation failed.' }
  }
}

/**
 * Initiates standard session booking.
 */
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
      try {
        const { createSessionEvent } = await import('@/lib/mentor/calendar-booking')
        await createSessionEvent(session.id)
      } catch (calErr) {
        console.error('Calendar event creation failed (non-blocking):', calErr)
      }

      revalidatePath('/profile/sessions')
      revalidatePath('/admin/mentor-connect/sessions')
      revalidatePath('/admin/mentor-connect/payments')
      revalidatePath('/admin/mentor-connect')

      return { sessionId: session.id, requiresPayment: false }
    }

    // 6. Reuse reusable Razorpay order helper for paid sessions
    return await createRazorpayOrderForSession(session.id)

  } catch (error: unknown) {
    console.error('Booking error:', error)
    const message = error instanceof Error ? error.message : 'Failed to initiate booking.'
    return { error: message }
  }
}

/**
 * Public action allowing founders to complete/resume payment for any pending_payment session.
 */
export async function initiateExistingSessionPayment(sessionId: string) {
  const user = await getAuthenticatedUser()
  if (!user) return { error: 'You must be logged in to resume payment.' }

  const supabase = createServiceClient()

  // Verify owner is the founder
  const { data: session, error } = await supabase
    .from('sessions')
    .select('founder_id, status')
    .eq('id', sessionId)
    .single()

  if (error || !session) return { error: 'Session not found.' }
  if (session.founder_id !== user.id) return { error: 'Not authorized to checkout this session.' }
  if (session.status !== 'pending_payment') return { error: 'This session does not require payment at this time.' }

  return await createRazorpayOrderForSession(sessionId)
}
