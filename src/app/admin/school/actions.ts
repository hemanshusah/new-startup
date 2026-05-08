'use server'

/**
 * Server actions for managing Startup School modules and lessons.
 * Includes CRUD operations with admin authorization checks.
 */

import { auth } from '@/auth'
import { createServiceClient } from '@/lib/supabase/server'
import { revalidateCachePath } from '@/lib/revalidate-paths'

// ── Helpers ────────────────────────────────────────────────

async function requireAdmin() {
  const session = await auth()
  const user = session?.user
  if (!user?.email) throw new Error('Unauthorized')

  const supabase = createServiceClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('email', user.email)
    .single()

  if (profile?.role !== 'admin') throw new Error('Forbidden')
  return supabase
}

function toSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 120)
}

// ── Module Actions ─────────────────────────────────────────

export async function createModule(formData: FormData): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  try {
    const supabase = await requireAdmin()
    const title = formData.get('title') as string
    const slug = (formData.get('slug') as string) || toSlug(title)
    const description = (formData.get('description') as string) || null
    const order_index = Number(formData.get('order_index')) || 0
    const is_published = formData.get('is_published') === 'true'

    const { data, error } = await supabase
      .from('school_modules')
      .insert({
        title: title.trim(),
        slug: slug.trim(),
        description,
        order_index,
        is_published,
        product_slug: 'school',
      })
      .select('id')
      .single()

    if (error) return { ok: false, error: error.message }

    await Promise.allSettled([
      revalidateCachePath('/admin/school/modules'),
      revalidateCachePath('/school'),
    ])

    return { ok: true, id: data.id }
  } catch (err: any) {
    return { ok: false, error: err.message || 'Failed to create module' }
  }
}

export async function updateModule(id: string, formData: FormData): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const supabase = await requireAdmin()
    const title = formData.get('title') as string
    const slug = (formData.get('slug') as string) || toSlug(title)
    const description = (formData.get('description') as string) || null
    const order_index = Number(formData.get('order_index')) || 0
    const is_published = formData.get('is_published') === 'true'

    const { error } = await supabase
      .from('school_modules')
      .update({
        title: title.trim(),
        slug: slug.trim(),
        description,
        order_index,
        is_published,
      })
      .eq('id', id)

    if (error) return { ok: false, error: error.message }

    await Promise.allSettled([
      revalidateCachePath('/admin/school/modules'),
      revalidateCachePath('/school'),
    ])

    return { ok: true }
  } catch (err: any) {
    return { ok: false, error: err.message || 'Failed to update module' }
  }
}

export async function deleteModule(id: string): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const supabase = await requireAdmin()
    const { error } = await supabase
      .from('school_modules')
      .delete()
      .eq('id', id)

    if (error) return { ok: false, error: error.message }

    await Promise.allSettled([
      revalidateCachePath('/admin/school/modules'),
      revalidateCachePath('/school'),
    ])

    return { ok: true }
  } catch (err: any) {
    return { ok: false, error: err.message || 'Failed to delete module' }
  }
}

export async function updateModulePublished(
  id: string,
  is_published: boolean
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const supabase = await requireAdmin()
    const { error } = await supabase
      .from('school_modules')
      .update({ is_published })
      .eq('id', id)

    if (error) return { ok: false, error: error.message }

    await Promise.allSettled([
      revalidateCachePath('/admin/school/modules'),
      revalidateCachePath('/school'),
    ])

    return { ok: true }
  } catch (err: any) {
    return { ok: false, error: err.message || 'Failed to update module' }
  }
}

// ── Lesson Actions ─────────────────────────────────────────

export async function createLesson(formData: FormData): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  try {
    const supabase = await requireAdmin()
    const module_id = formData.get('module_id') as string
    const title = formData.get('title') as string
    const slug = (formData.get('slug') as string) || toSlug(title)
    const subtitle = (formData.get('subtitle') as string) || null
    const content = (formData.get('content') as string) || ''
    const youtube_url = (formData.get('youtube_url') as string) || null
    const group_label = (formData.get('group_label') as string) || null
    const order_index = Number(formData.get('order_index')) || 0
    const is_published = formData.get('is_published') === 'true'

    const { data, error } = await supabase
      .from('school_lessons')
      .insert({
        module_id,
        title: title.trim(),
        slug: slug.trim(),
        subtitle,
        content,
        youtube_url,
        group_label,
        order_index,
        is_published,
        product_slug: 'school',
      })
      .select('id')
      .single()

    if (error) return { ok: false, error: error.message }

    await Promise.allSettled([
      revalidateCachePath('/admin/school/lessons'),
      revalidateCachePath('/school'),
    ])

    return { ok: true, id: data.id }
  } catch (err: any) {
    return { ok: false, error: err.message || 'Failed to create lesson' }
  }
}

export async function updateLesson(id: string, formData: FormData): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const supabase = await requireAdmin()
    const module_id = formData.get('module_id') as string
    const title = formData.get('title') as string
    const slug = (formData.get('slug') as string) || toSlug(title)
    const subtitle = (formData.get('subtitle') as string) || null
    const content = (formData.get('content') as string) || ''
    const youtube_url = (formData.get('youtube_url') as string) || null
    const group_label = (formData.get('group_label') as string) || null
    const order_index = Number(formData.get('order_index')) || 0
    const is_published = formData.get('is_published') === 'true'

    const { error } = await supabase
      .from('school_lessons')
      .update({
        module_id,
        title: title.trim(),
        slug: slug.trim(),
        subtitle,
        content,
        youtube_url,
        group_label,
        order_index,
        is_published,
      })
      .eq('id', id)

    if (error) return { ok: false, error: error.message }

    await Promise.allSettled([
      revalidateCachePath('/admin/school/lessons'),
      revalidateCachePath('/school'),
    ])

    return { ok: true }
  } catch (err: any) {
    return { ok: false, error: err.message || 'Failed to update lesson' }
  }
}

export async function deleteLesson(id: string): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const supabase = await requireAdmin()
    const { error } = await supabase
      .from('school_lessons')
      .delete()
      .eq('id', id)

    if (error) return { ok: false, error: error.message }

    await Promise.allSettled([
      revalidateCachePath('/admin/school/lessons'),
      revalidateCachePath('/school'),
    ])

    return { ok: true }
  } catch (err: any) {
    return { ok: false, error: err.message || 'Failed to delete lesson' }
  }
}

export async function updateLessonPublished(
  id: string,
  is_published: boolean
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const supabase = await requireAdmin()
    const { error } = await supabase
      .from('school_lessons')
      .update({ is_published })
      .eq('id', id)

    if (error) return { ok: false, error: error.message }

    await Promise.allSettled([
      revalidateCachePath('/admin/school/lessons'),
      revalidateCachePath('/school'),
    ])

    return { ok: true }
  } catch (err: any) {
    return { ok: false, error: err.message || 'Failed to update lesson' }
  }
}
