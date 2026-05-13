'use server'

import { createServiceClient } from '@/lib/supabase/server'
import { getAuthenticatedUser } from '@/lib/auth-utils'
import { revalidatePath } from 'next/cache'

export async function setAccountIntent(intent: 'founder' | 'mentor' | 'explorer') {
  const user = await getAuthenticatedUser()
  if (!user?.email) throw new Error('Not authenticated')

  const supabase = createServiceClient()
  
  const { error } = await supabase
    .from('profiles')
    .update({ account_intent: intent })
    .eq('email', user.email)

  if (error) throw error

  revalidatePath('/')
  return { success: true }
}
