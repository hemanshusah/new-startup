import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/server'
import { ModulesTable } from '@/components/organisms/admin/school/ModulesTable'

export default async function AdminModulesPage() {
  const supabase = createServiceClient()

  // Fetch modules with lesson count
  const { data: modules } = await supabase
    .from('school_modules')
    .select('*, school_lessons(count)')
    .order('order_index', { ascending: true })

  const formatted = (modules ?? []).map((m: any) => ({
    ...m,
    lesson_count: m.school_lessons?.[0]?.count ?? 0,
    school_lessons: undefined,
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
            School — Modules
          </h1>
          <p style={{ fontFamily: 'var(--font-sans), sans-serif', fontSize: '13px', color: 'var(--ink-3)' }}>
            {formatted.length} module{formatted.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <Link
          href="/admin/school/modules/new"
          id="admin-school-modules-new-btn"
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
          + New module
        </Link>
      </div>

      <ModulesTable initialModules={formatted} />
    </div>
  )
}
