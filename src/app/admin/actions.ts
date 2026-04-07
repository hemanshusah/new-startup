'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidateCachePath } from '@/lib/revalidate-paths'

export async function revalidateAdminPath(
  path: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { ok: false, error: 'Unauthorized' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return { ok: false, error: 'Forbidden' }
  }

  try {
    revalidateCachePath(path)
    return { ok: true }
  } catch (e) {
    console.error('[revalidateAdminPath]', e)
    return { ok: false, error: 'Revalidation failed' }
  }
}
