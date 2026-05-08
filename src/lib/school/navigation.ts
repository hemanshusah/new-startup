/**
 * Logic for fetching and structuring Startup School navigation data.
 * Provides hierarchal (Module -> Lesson) and flat structures.
 */
import { createServiceClient } from '@/lib/supabase/server'

export interface SchoolLesson {
  id: string
  module_id: string
  title: string
  slug: string
  subtitle: string | null
  group_label: string | null
  order_index: number
}

export interface SchoolModule {
  id: string
  title: string
  slug: string
  description: string | null
  order_index: number
  lessons: SchoolLesson[]
}

export interface SchoolNavigation {
  modules: SchoolModule[]
}

/**
 * Fetches all published modules and their published lessons, ordered correctly.
 * Used by Sidebar, TopNav tabs, and prev/next navigation.
 */
export async function getSchoolNavigation(): Promise<SchoolNavigation> {
  const supabase = createServiceClient()

  const { data: modules } = await supabase
    .from('school_modules')
    .select(`
      id,
      title,
      slug,
      description,
      order_index,
      school_lessons (
        id,
        module_id,
        title,
        slug,
        subtitle,
        group_label,
        order_index
      )
    `)
    .eq('is_published', true)
    .eq('school_lessons.is_published', true)
    .order('order_index', { ascending: true })
    .order('order_index', { referencedTable: 'school_lessons', ascending: true })

  const formatted: SchoolModule[] = (modules ?? []).map((m: any) => ({
    id: m.id,
    title: m.title,
    slug: m.slug,
    description: m.description,
    order_index: m.order_index,
    lessons: (m.school_lessons ?? []).map((l: any) => ({
      id: l.id,
      module_id: l.module_id,
      title: l.title,
      slug: l.slug,
      subtitle: l.subtitle,
      group_label: l.group_label,
      order_index: l.order_index,
    })),
  }))

  return { modules: formatted }
}

/** Returns a flat ordered list of all lessons with their module slug for prev/next */
export interface FlatLesson {
  id: string
  title: string
  slug: string
  moduleSlug: string
  moduleTitle: string
}

export async function getFlatLessonList(): Promise<FlatLesson[]> {
  const { modules } = await getSchoolNavigation()
  const flat: FlatLesson[] = []
  for (const mod of modules) {
    for (const lesson of mod.lessons) {
      flat.push({
        id: lesson.id,
        title: lesson.title,
        slug: lesson.slug,
        moduleSlug: mod.slug,
        moduleTitle: mod.title,
      })
    }
  }
  return flat
}
