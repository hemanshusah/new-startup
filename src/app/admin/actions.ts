'use server'

import { auth } from '@/auth'
import { createServiceClient } from '@/lib/supabase/server'
import { revalidateCachePath } from '@/lib/revalidate-paths'

export async function revalidateAdminPath(
  path: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth()
  const user = session?.user
  if (!user?.email) {
    return { ok: false, error: 'Unauthorized' }
  }

  // Use service client for profile check to handle email lookups reliably
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
    revalidateCachePath(path)
    return { ok: true }
  } catch (e) {
    console.error('[revalidateAdminPath]', e)
    return { ok: false, error: 'Revalidation failed' }
  }
}
