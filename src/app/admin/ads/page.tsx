import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { AdsTable } from '@/components/admin/AdsTable'

export default async function AdminAdsPage() {
  const supabase = await createClient()
  const { data: ads } = await supabase.from('ads').select('*').order('priority', { ascending: true })

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '24px', fontWeight: 400, color: 'var(--ink)', marginBottom: '4px' }}>Ads</h1>
          <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '13px', color: 'var(--ink-3)' }}>{(ads ?? []).length} ads total</p>
        </div>
        <Link href="/admin/ads/new" id="admin-ads-new-btn" style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '13px', fontWeight: 500, color: 'var(--cream)', background: 'var(--ink)', borderRadius: '8px', padding: '9px 18px', textDecoration: 'none' }}>
          + New ad
        </Link>
      </div>
      <AdsTable initialAds={ads ?? []} />
    </div>
  )
}
