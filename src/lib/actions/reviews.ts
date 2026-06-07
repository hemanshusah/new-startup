'use server'

import { createServiceClient } from '@/lib/supabase/server'
import { getAuthenticatedUser } from '@/lib/auth-utils'

interface SubmitReviewParams {
  sessionId: string
  mentorId: string
  ratingOverall: number
  ratingKnowledge: number
  ratingClarity: number
  ratingActionability: number
  wouldRebook: boolean
  reviewText: string
}

export async function submitReview(params: SubmitReviewParams) {
  const user = await getAuthenticatedUser()
  if (!user) {
    return { error: 'You must be logged in to submit a review.' }
  }

  const {
    sessionId,
    mentorId,
    ratingOverall,
    ratingKnowledge,
    ratingClarity,
    ratingActionability,
    wouldRebook,
    reviewText
  } = params

  if (ratingOverall < 1 || ratingOverall > 5 ||
      ratingKnowledge < 1 || ratingKnowledge > 5 ||
      ratingClarity < 1 || ratingClarity > 5 ||
      ratingActionability < 1 || ratingActionability > 5) {
    return { error: 'Ratings must be between 1 and 5.' }
  }

  if (!reviewText.trim()) {
    return { error: 'Please write a brief review.' }
  }

  const supabase = createServiceClient()

  try {
    // 1. Verify session is completed and user is the founder
    const { data: session, error: sessionErr } = await supabase
      .from('sessions')
      .select('id, status, founder_id')
      .eq('id', sessionId)
      .single()

    if (sessionErr || !session) {
      return { error: 'Session not found.' }
    }

    if (session.founder_id !== user.id) {
      return { error: 'You are not authorized to review this session.' }
    }

    if (session.status !== 'completed') {
      return { error: 'You can only review completed sessions.' }
    }

    // 2. Check if already reviewed
    const { data: existingReview } = await supabase
      .from('reviews')
      .select('id')
      .eq('session_id', sessionId)
      .maybeSingle()

    if (existingReview) {
      return { error: 'You have already reviewed this session.' }
    }

    // 3. Insert review
    const { error: insertErr } = await supabase
      .from('reviews')
      .insert({
        session_id: sessionId,
        mentor_id: mentorId,
        founder_id: user.id,
        rating_overall: ratingOverall,
        rating_knowledge: ratingKnowledge,
        rating_clarity: ratingClarity,
        rating_actionability: ratingActionability,
        would_rebook: wouldRebook,
        review_text: reviewText.trim()
      })

    if (insertErr) {
      console.error('Submit review insert error:', insertErr)
      return { error: 'Failed to submit review. Please try again.' }
    }

    // 4. Update mentor profile stats
    // Fetch all non-hidden reviews for this mentor
    const { data: allReviews } = await supabase
      .from('reviews')
      .select('rating_overall')
      .eq('mentor_id', mentorId)
      .eq('is_hidden', false)

    if (allReviews) {
      const totalReviews = allReviews.length
      const sumRatings = allReviews.reduce((sum, r) => sum + r.rating_overall, 0)
      const avgRating = totalReviews > 0 ? Number((sumRatings / totalReviews).toFixed(2)) : 0.00

      await supabase
        .from('mentor_profiles')
        .update({
          avg_rating: avgRating,
          total_reviews: totalReviews
        })
        .eq('id', mentorId)
    }

    return { success: true }

  } catch (error: unknown) {
    console.error('Submit review error:', error)
    return { error: 'An error occurred while submitting your review.' }
  }
}
