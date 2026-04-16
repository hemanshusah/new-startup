'use server'

import { auth } from '@/auth'
import { createServiceClient } from '@/lib/supabase/server'
import { revalidateCachePath } from '@/lib/revalidate-paths'

export async function updateProgramPublished(
  programId: string,
  published: boolean
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth()
  const user = session?.user
  if (!user?.email) {
    return { ok: false, error: 'Unauthorized' }
  }

  // Use service client for role check and update to bypass RLS/Auth mismatch issues
  // while still verifying the user's role on the server.
  const supabase = createServiceClient()
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('email', user.email)
    .single()

  if (profile?.role !== 'admin') {
    return { ok: false, error: 'Forbidden' }
  }

  const { error } = await supabase
    .from('programs')
    .update({ published, updated_at: new Date().toISOString() })
    .eq('id', programId)

  if (error) {
    console.error('[updateProgramPublished]', error)
    return { ok: false, error: error.message }
  }

  try {
    revalidateCachePath('/admin/programs')
    revalidateCachePath('/programs')
    revalidateCachePath(`/programs/${programId}`) // Just in case, though usually slug is used
    return { ok: true }
  } catch (e) {
    console.error('[updateProgramPublished revalidate]', e)
    return { ok: true } // Still ok since DB updated
  }
}
