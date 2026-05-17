'use server'

import { createServiceClient } from '@/lib/supabase/server'
import { getAuthenticatedUser } from '@/lib/auth-utils'

/**
 * Moderates a review by toggling its is_hidden state.
 * Restricts access using service client or checks admin status.
 */
export async function toggleReviewVisibility(reviewId: string, currentHidden: boolean) {
  const user = await getAuthenticatedUser()
  if (!user) {
    return { error: 'Not authenticated.' }
  }

  const supabase = createServiceClient()

  // Verify user is an admin
  const { data: isAdmin, error: adminErr } = await supabase.rpc('is_admin')
  if (adminErr || !isAdmin) {
    // Fallback: check if they have access via RLS policies or profiles
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()
    
    if (!profile || !profile.is_admin) {
      return { error: 'Unauthorized. Admin privileges required.' }
    }
  }

  try {
    const { error } = await supabase
      .from('reviews')
      .update({ is_hidden: !currentHidden })
      .eq('id', reviewId)

    if (error) {
      console.error('Failed to moderate review:', error)
      return { error: 'Failed to update review visibility.' }
    }

    return { success: true }
  } catch (err: any) {
    console.error('Toggle review visibility error:', err)
    return { error: 'An unexpected error occurred.' }
  }
}
