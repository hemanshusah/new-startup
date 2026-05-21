'use server'

import { createServiceClient } from '@/lib/supabase/server'
import { getAuthenticatedUser } from '@/lib/auth-utils'
import crypto from 'crypto'
import { revalidatePath } from 'next/cache'

interface InitiateGroupBookingParams {
  groupSessionId: string
}

export async function initiateGroupBooking(params: InitiateGroupBookingParams) {
  const user = await getAuthenticatedUser()
  if (!user) {
    return { error: 'You must be logged in to book a seat.' }
  }

  const supabase = createServiceClient()

  try {
    // 1. Fetch group session
    const { data: session, error: sessionErr } = await supabase
      .from('group_sessions')
      .select('id, price_inr, max_seats, seats_booked, status')
      .eq('id', params.groupSessionId)
      .single()

    if (sessionErr || !session) {
      return { error: 'Group session not found.' }
    }

    if (session.status !== 'scheduled') {
      return { error: 'This group session is no longer active.' }
    }

    // 2. Check if already booked
    const { data: existingBooking } = await supabase
      .from('group_session_bookings')
      .select('id')
      .eq('group_session_id', session.id)
      .eq('founder_id', user.id)
      .maybeSingle()

    if (existingBooking) {
      return { error: 'You have already booked a seat for this session.' }
    }

    const seatsLeft = session.max_seats - session.seats_booked
    const isWaitlist = seatsLeft <= 0

    // 3. Create Razorpay order
    const Razorpay = (await import('razorpay')).default
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    })

    const order = await razorpay.orders.create({
      amount: session.price_inr * 100, // Razorpay uses paise
      currency: 'INR',
      receipt: session.id,
      notes: {
        group_session_id: session.id,
        founder_id: user.id,
        waitlisted: String(isWaitlist)
      }
    })

    return {
      requiresPayment: true,
      razorpayOrderId: order.id,
      razorpayKeyId: process.env.RAZORPAY_KEY_ID,
      amountInr: session.price_inr,
      isWaitlist
    }

  } catch (error: unknown) {
    console.error('Group booking initiation error:', error)
    const message = error instanceof Error ? error.message : 'Failed to initiate booking.'
    return { error: message }
  }
}

interface ConfirmGroupBookingParams {
  groupSessionId: string
  razorpayOrderId: string
  razorpayPaymentId: string
  razorpaySignature: string
}

export async function confirmGroupBooking(params: ConfirmGroupBookingParams) {
  const user = await getAuthenticatedUser()
  if (!user) {
    return { error: 'You must be logged in.' }
  }

  const { groupSessionId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = params

  // 1. Verify Razorpay Signature
  const body = razorpayOrderId + '|' + razorpayPaymentId
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(body)
    .digest('hex')

  if (expectedSignature !== razorpaySignature) {
    console.error('Group booking signature mismatch', { groupSessionId, razorpayOrderId })
    return { error: 'Payment signature verification failed.' }
  }

  const supabase = createServiceClient()

  try {
    // 2. Fetch session to check seats and price
    const { data: session } = await supabase
      .from('group_sessions')
      .select('price_inr, max_seats, seats_booked')
      .eq('id', groupSessionId)
      .single()

    if (!session) {
      return { error: 'Session not found.' }
    }

    const isWaitlist = session.seats_booked >= session.max_seats

    // 3. Insert group_session_bookings record
    const { error: insertError } = await supabase
      .from('group_session_bookings')
      .insert({
        group_session_id: groupSessionId,
        founder_id: user.id,
        razorpay_order_id: razorpayOrderId,
        amount_paid_inr: session.price_inr,
        waitlisted: isWaitlist
      })

    if (insertError) {
      // Handle unique constraint or RLS error
      if (insertError.code === '23505') {
        return { error: 'You have already booked a seat for this session.' }
      }
      console.error('Group booking insert error:', insertError)
      return { error: 'Failed to record booking.' }
    }

    // 4. Increment seats_booked if not waitlisted
    if (!isWaitlist) {
      await supabase
        .from('group_sessions')
        .update({
          seats_booked: session.seats_booked + 1
        })
        .eq('id', groupSessionId)
    }

    revalidatePath('/profile/sessions')
    revalidatePath('/admin/mentor-connect/sessions')
    revalidatePath('/admin/mentor-connect/payments')
    revalidatePath('/admin/mentor-connect')

    return { success: true }

  } catch (error: unknown) {
    console.error('Group booking confirmation error:', error)
    return { error: 'Failed to confirm booking.' }
  }
}
