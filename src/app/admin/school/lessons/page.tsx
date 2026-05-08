import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/server'
import { LessonsTable } from '@/components/admin/school/LessonsTable'

export default async function AdminLessonsPage() {
  const supabase = createServiceClient()

  // Fetch all modules for filter dropdown
  const { data: modules } = await supabase
    .from('school_modules')
    .select('id, title, slug')
    .order('order_index', { ascending: true })

  // Fetch all lessons with module info
  const { data: lessons } = await supabase
    .from('school_lessons')
    .select('*, school_modules!inner(title, slug)')
    .order('order_index', { ascending: true })

  const formatted = (lessons ?? []).map((l: any) => ({
    ...l,
    module_title: l.school_modules?.title ?? '—',
    module_slug: l.school_modules?.slug ?? '',
    school_modules: undefined,
  }))

  return (
    <div>
      {/* Page header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1
            style={{
              fontFamily: 'var(--font-serif), serif',
              fontSize: '24px',
              fontWeight: 400,
              color: 'var(--ink)',
              marginBottom: '4px',
            }}
          >
            School — Lessons
          </h1>
          <p style={{ fontFamily: 'var(--font-sans), sans-serif', fontSize: '13px', color: 'var(--ink-3)' }}>
            {formatted.length} lesson{formatted.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <Link
          href="/admin/school/lessons/new"
          id="admin-school-lessons-new-btn"
          style={{
            fontFamily: 'var(--font-sans), sans-serif',
            fontSize: '13px',
            fontWeight: 500,
            color: 'var(--white)',
            background: 'var(--ink)',
            borderRadius: '8px',
            padding: '9px 18px',
            textDecoration: 'none',
          }}
        >
          + New lesson
        </Link>
      </div>

      <LessonsTable initialLessons={formatted} modules={modules ?? []} />
    </div>
  )
}
