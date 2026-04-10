'use server'

import { createClient } from '@/lib/supabase/server'

/**
 * Server action to update the user's password.
 * Only works if the user has a valid recovery session (from a reset link).
 */
export async function updatePassword(password: string) {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.updateUser({
    password: password
  })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, user: data.user }
}
