import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdForm } from '@/components/admin/AdForm'
import type { Ad } from '@/types/ad'

export default async function EditAdPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: ad } = await supabase.from('ads').select('*').eq('id', id).single()
  if (!ad) notFound()

  return (
    <div>
      <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '24px', fontWeight: 400, color: 'var(--ink)', marginBottom: '4px' }}>Edit ad</h1>
      <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '13px', color: 'var(--ink-4)', marginBottom: '24px' }}>{ad.advertiser}</p>
      <AdForm mode="edit" ad={ad as Ad} />
    </div>
  )
}
