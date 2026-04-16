'use server'

import { auth } from '@/auth'
import { createServiceClient } from '@/lib/supabase/server'
import { revalidateCachePath } from '@/lib/revalidate-paths'
import type { Program } from '@/types/program'

/** Simple slug generator */
function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')     // Replace spaces with -
    .replace(/[^\w-]+/g, '')  // Remove all non-word chars
    .replace(/--+/g, '-')     // Replace multiple - with single -
}

/** 
 * Bulk import programs with deduplication.
 * Checks for existing title + organisation combinations.
 */
export async function bulkImportPrograms(
  programs: Partial<Program>[]
): Promise<{ ok: true; count: number } | { ok: false; error: string }> {
  try {
    const session = await auth()
    if (!session?.user?.email) return { ok: false, error: 'Unauthorized' }

    const supabase = createServiceClient()
    
    // Admin check
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('email', session.user.email)
      .single()

    if (profile?.role !== 'admin') return { ok: false, error: 'Forbidden' }

    // 1. Fetch existing programs to detect duplicates
    const { data: existing } = await supabase
      .from('programs')
      .select('title, organisation')

    const existingKeys = new Set(
      existing?.map((p) => `${p.title.toLowerCase().trim()}|${p.organisation.toLowerCase().trim()}`) || []
    )

    // 2. Filter out duplicates and prepare for insertion
    const toInsert = programs
      .filter((p) => {
        if (!p.title || !p.organisation) return false
        const key = `${p.title.toLowerCase().trim()}|${p.organisation.toLowerCase().trim()}`
        return !existingKeys.has(key)
      })
      .map((p) => {
        // Clean up text fields and generate slug
        const title = p.title!.trim()
        const org = p.organisation!.trim()
        
        return {
          ...p,
          title,
          organisation: org,
          slug: p.slug?.trim() || slugify(title),
          published: p.published ?? false,
          is_india: p.is_india ?? true,
          is_featured: p.is_featured ?? false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      })

    if (toInsert.length === 0) {
      return { ok: true, count: 0 }
    }

    // 3. Batch insert (Supabase handles batching automatically for arrays)
    const { error: insertError } = await supabase.from('programs').insert(toInsert)
    if (insertError) {
      console.error('[bulkImportPrograms] insert error:', insertError)
      throw new Error(insertError.message)
    }

    // 4. Revalidate listing and admin pages
    await Promise.allSettled([
      revalidateCachePath('/admin/programs'),
      revalidateCachePath('/programs'),
    ])

    return { ok: true, count: toInsert.length }
  } catch (err: any) {
    console.error('[bulkImportPrograms] catch error:', err)
    return { ok: false, error: err.message || 'Import failed' }
  }
}
