'use server'

import { getAuthenticatedUser } from '@/lib/auth-utils'
import { createServiceClient } from '@/lib/supabase/server'

export async function getCurrentProfile() {
  const user = await getAuthenticatedUser()
  if (!user?.email) return null

  const supabase = createServiceClient()
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', user.email)
    .single()

  return data
}
