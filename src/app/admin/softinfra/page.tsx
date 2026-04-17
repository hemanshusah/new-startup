import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/server'
import { SITable } from '@/components/admin/SITable'

export default async function AdminSIPage() {
  const supabase = createServiceClient()
  const { data: siItems } = await supabase.from('softinfra').select('*').order('priority', { ascending: true })

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-serif), serif', fontSize: '24px', fontWeight: 400, color: 'var(--ink)', marginBottom: '4px' }}>SoftInfra</h1>
          <p style={{ fontFamily: 'var(--font-sans), sans-serif', fontSize: '13px', color: 'var(--ink-3)' }}>{(siItems ?? []).length} items total</p>
        </div>
        <Link href="/admin/softinfra/new" id="admin-si-new-btn" style={{ fontFamily: 'var(--font-sans), sans-serif', fontSize: '13px', fontWeight: 500, color: 'var(--white)', background: 'var(--ink)', borderRadius: '8px', padding: '9px 18px', textDecoration: 'none' }}>
          + New item
        </Link>
      </div>
      <SITable initialSI={siItems ?? []} />
    </div>
  )
}
