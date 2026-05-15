'use server'

import { auth } from '@/auth'
import { createServiceClient } from '@/lib/supabase/server'

export async function deleteUserAdmin(userId: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth()
  const user = session?.user
  if (!user?.email) {
    return { ok: false, error: 'Unauthorized' }
  }

  const supabase = createServiceClient()
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('email', user.email)
    .single()

  if (profile?.role !== 'admin') {
    return { ok: false, error: 'Forbidden' }
  }

  try {
    // 1. Delete from next_auth.users (if exists)
    try {
      // @ts-ignore
      await supabase.schema('next_auth').from('users').delete().eq('id', userId)
    } catch (e) {
      // Ignore if schema not accessible
    }

    // 2. Delete from auth.users (Supabase Auth)
    // This will trigger a cascade to public.profiles, bookmarks, sessions, etc.
    const { error: authError } = await supabase.auth.admin.deleteUser(userId)
    
    if (authError) {
      // Fallback: Try deleting from public.profiles directly if auth delete fails
      await supabase.from('profiles').delete().eq('id', userId)
    }
    
  } catch (err: any) {
    return { ok: false, error: err.message || 'Failed to delete user' }
  }

  return { ok: true }
}

export async function updateMentorStatusAdmin(userId: string, status: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth()
  const user = session?.user
  if (!user?.email) return { ok: false, error: 'Unauthorized' }

  const supabase = createServiceClient()
  const { data: profile } = await supabase.from('profiles').select('role').eq('email', user.email).single()
  if (profile?.role !== 'admin') return { ok: false, error: 'Forbidden' }

  const { error } = await supabase
    .from('mentor_profiles')
    .update({ status })
    .eq('user_id', userId)

  if (error) return { ok: false, error: error.message }
  return { ok: true }
}
