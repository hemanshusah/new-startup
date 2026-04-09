'use server'

import { auth } from '@/auth'
import { createServiceClient } from '@/lib/supabase/server'

export async function getCurrentProfile() {
  const session = await auth()
  if (!session?.user?.email) return null

  const supabase = createServiceClient()
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', session.user.email)
    .single()

  return data
}
