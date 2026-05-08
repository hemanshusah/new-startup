/**
 * Logic for fetching detailed lesson content and search index data.
 */
import { createServiceClient } from '@/lib/supabase/server'

export interface FullLesson {
  id: string
  module_id: string
  title: string
  slug: string
  subtitle: string | null
  content: string | null
  youtube_url: string | null
  group_label: string | null
  order_index: number
  is_published: boolean
  module: {
    id: string
    title: string
    slug: string
  }
}

/**
 * Fetches a single lesson by section (module slug) and lesson slug.
 * Returns null if not found or unpublished.
 */
export async function getLessonBySlug(
  sectionSlug: string,
  lessonSlug: string
): Promise<FullLesson | null> {
  const supabase = createServiceClient()

  // First get the module by slug
  const { data: module } = await supabase
    .from('school_modules')
    .select('id, title, slug')
    .eq('slug', sectionSlug)
    .eq('is_published', true)
    .single()

  if (!module) return null

  // Then get the lesson within that module
  const { data: lesson } = await supabase
    .from('school_lessons')
    .select('*')
    .eq('module_id', module.id)
    .eq('slug', lessonSlug)
    .eq('is_published', true)
    .single()

  if (!lesson) return null

  return {
    ...lesson,
    module: {
      id: module.id,
      title: module.title,
      slug: module.slug,
    },
  }
}

/**
 * Fetches all published lessons with module info (for search index).
 */
export async function getAllPublishedLessons(): Promise<{
  id: string
  title: string
  slug: string
  moduleTitle: string
  moduleSlug: string
  excerpt: string
}[]> {
  const supabase = createServiceClient()

  const { data: lessons } = await supabase
    .from('school_lessons')
    .select('id, title, slug, content, school_modules!inner(title, slug, is_published)')
    .eq('is_published', true)
    .eq('school_modules.is_published', true)

  return (lessons ?? []).map((l: any) => ({
    id: l.id,
    title: l.title,
    slug: l.slug,
    moduleTitle: l.school_modules?.title ?? '',
    moduleSlug: l.school_modules?.slug ?? '',
    excerpt: (l.content ?? '').replace(/[#*_`>\[\]()]/g, '').slice(0, 150),
  }))
}
