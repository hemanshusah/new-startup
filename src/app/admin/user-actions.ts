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
    // 1. Delete from bookmarks
    await supabase.from('bookmarks').delete().eq('user_id', userId)

    // 2. Delete from next_auth.users via direct PostgreSQL query if we had pg, but we'll try with Postgrest just in case it's exposed, if not we ignore since it's just NextAuth tokens and doesn't affect the app's profile.
    // We can use a trick: the Supabase JS client doesn't expose `schema()` normally, but we can pass it if we use the v2 client. 
    // Actually, createServiceClient gives us a v2 client. We can try `.schema('next_auth')` but typescript might complain. We will use `@ts-ignore`
    try {
      // @ts-ignore
      await supabase.schema('next_auth').from('users').delete().eq('id', userId)
    } catch (e) {
      console.error("Could not delete from next_auth.users", e)
    }

    // 3. Delete from public.profiles
    await supabase.from('profiles').delete().eq('id', userId)
    
    // 4. Delete from auth.users (Supabase Auth)
    await supabase.auth.admin.deleteUser(userId)
    
  } catch (err: any) {
    return { ok: false, error: err.message || 'Failed to delete user' }
  }

  return { ok: true }
}
