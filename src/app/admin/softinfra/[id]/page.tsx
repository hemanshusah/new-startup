import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/server'
import { SIForm } from '@/components/admin/SIForm'
import type { SoftInfra } from '@/types/softinfra'

export default async function EditSIPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createServiceClient()
  const { data: siItem } = await supabase.from('softinfra').select('*').eq('id', id).single()
  if (!siItem) notFound()

  return (
    <div>
      <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '24px', fontWeight: 400, color: 'var(--ink)', marginBottom: '4px' }}>Edit item</h1>
      <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '13px', color: 'var(--ink-4)', marginBottom: '24px' }}>{siItem.advertiser}</p>
      <SIForm mode="edit" si={siItem as SoftInfra} />
    </div>
  )
}
