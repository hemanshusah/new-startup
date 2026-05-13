'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function setAccountIntent(intent: 'founder' | 'mentor' | 'explorer') {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('profiles')
    .update({ account_intent: intent })
    .eq('id', user.id)

  if (error) throw error

  revalidatePath('/')
  return { success: true }
}
