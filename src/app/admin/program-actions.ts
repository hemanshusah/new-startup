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

  // Fetch program to check deadline and status
  const { data: program } = await supabase
    .from('programs')
    .select('status, deadline')
    .eq('id', programId)
    .single()

  if (published && program) {
    // Safety check: Prevent publishing programs that have already passed their deadline
    if (program.deadline && new Date(program.deadline) < new Date(new Date().setHours(0, 0, 0, 0))) {
      return { ok: false, error: 'Cannot publish a program that has already expired. Please update the deadline first.' }
    }
    const today = new Date().toISOString().split('T')[0]
    if (program.status === 'active' && program.deadline && program.deadline < today) {
      return { ok: false, error: 'Cannot publish an active program with a past deadline. Please update the deadline first.' }
    }
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
    // 3. Clear relevant caches in parallel
    await Promise.allSettled([
      revalidateCachePath('/admin/programs'),
      revalidateCachePath('/programs'),
      revalidateCachePath(`/programs/${programId}`),
    ])

    return { ok: true }
  } catch (err) {
    console.error('Failed to update published status:', err)
    return { ok: false, error: 'Failed to update program status' }
  }
}
