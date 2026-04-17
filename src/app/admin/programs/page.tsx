import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/server'
import { ProgramsTable } from '@/components/admin/ProgramsTable'

export default async function AdminProgramsPage() {
  const supabase = createServiceClient()

  const { data: programs } = await supabase
    .from('programs')
    .select('*')
    .order('updated_at', { ascending: false })

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
            Programs
          </h1>
          <p style={{ fontFamily: 'var(--font-sans), sans-serif', fontSize: '13px', color: 'var(--ink-3)' }}>
            {(programs ?? []).length} programs total
          </p>
        </div>
        <Link
          href="/admin/programs/new"
          id="admin-programs-new-btn"
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
          + New program
        </Link>
      </div>

      <ProgramsTable initialPrograms={programs ?? []} />
    </div>
  )
}
