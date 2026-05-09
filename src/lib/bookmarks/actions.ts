'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleBookmark(programId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Unauthorized' }
  }

  // Check if bookmark exists
  const { data: existing } = await supabase
    .from('user_bookmarks')
    .select('id')
    .eq('user_id', user.id)
    .eq('program_id', programId)
    .single()

  if (existing) {
    // Remove bookmark
    const { error } = await supabase
      .from('user_bookmarks')
      .delete()
      .eq('id', existing.id)

    if (error) return { error: error.message }
  } else {
    // Add bookmark
    const { error } = await supabase
      .from('user_bookmarks')
      .insert({
        user_id: user.id,
        program_id: programId
      })

    if (error) return { error: error.message }
  }

  revalidatePath('/')
  revalidatePath('/bookmarks')
  return { success: true }
}

export async function getBookmarkedProgramIds() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('user_bookmarks')
    .select('program_id')
    .eq('user_id', user.id)

  return data?.map(b => b.program_id) || []
}

export async function getBookmarkedPrograms() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('user_bookmarks')
    .select(`
      program_id,
      programs (*)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching bookmarks:', error)
    return []
  }

  return data?.map(b => b.programs) || []
}
