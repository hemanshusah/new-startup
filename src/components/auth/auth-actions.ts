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

  if (!data) return null

  // If mentor, also fetch mentor status
  if (data.account_intent === 'mentor') {
    const { data: mentor } = await supabase
      .from('mentor_profiles')
      .select('status')
      .eq('user_id', data.id)
      .single()
    
    return { ...data, mentor_status: mentor?.status || null }
  }

  return data
}
