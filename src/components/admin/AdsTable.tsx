'use client'

import { useState, useCallback, useTransition } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { Ad } from '@/types/ad'

const FORMAT_COLORS: Record<string, string> = {
  'card-sm': '#2B4EA8',
  'card-dark': '#1E6E2E',
  'card-wide': '#7040A0',
  'inline': '#9B5A00',
  'sidebar': '#005D80',
  'newsletter': '#2A6620',
}

export function AdsTable({ initialAds }: { initialAds: Ad[] }) {
  const supabase = createClient()
  const [ads, setAds] = useState<Ad[]>(initialAds)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)
  const [, startTransition] = useTransition()

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 4000)
  }

  const toggleActive = useCallback(async (ad: Ad) => {
    const newVal = !ad.is_active
    setAds((prev) => prev.map((a) => (a.id === ad.id ? { ...a, is_active: newVal } : a)))
    const { error } = await supabase.from('ads').update({ is_active: newVal }).eq('id', ad.id)
    if (error) {
      setAds((prev) => prev.map((a) => (a.id === ad.id ? { ...a, is_active: ad.is_active } : a)))
      showToast('Failed to update status.', false)
    } else {
      showToast(`Ad "${ad.advertiser}" ${newVal ? 'activated' : 'paused'}.`)
    }
  }, [supabase])

  const deleteAd = useCallback(async (ad: Ad) => {
    if (!confirm(`Delete ad "${ad.advertiser}"?`)) return
    const { error } = await supabase.from('ads').delete().eq('id', ad.id)
    if (!error) {
      setAds((prev) => prev.filter((a) => a.id !== ad.id))
      showToast('Ad deleted.')
    } else {
      showToast('Delete failed.', false)
    }
  }, [supabase])

  const duplicateAd = useCallback(async (ad: Ad) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, created_at, impression_count, unique_view_count, click_count, ...rest } = ad
    const { data, error } = await supabase.from('ads').insert({ ...rest, advertiser: rest.advertiser + ' (copy)', is_active: false }).select().single()
    if (!error && data) {
      setAds((prev) => [data as Ad, ...prev])
      showToast('Ad duplicated.')
    } else {
      showToast('Duplicate failed.', false)
    }
  }, [supabase])

  const ctr = (ad: Ad) =>
    ad.impression_count > 0
      ? ((ad.click_count / ad.impression_count) * 100).toFixed(1) + '%'
      : '—'

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', background: toast.ok ? '#1E6E2E' : '#B01F1F', color: '#fff', fontFamily: 'DM Sans, sans-serif', fontSize: '13px', padding: '12px 20px', borderRadius: '8px', zIndex: 200, boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }} role="status">
          {toast.msg}
        </div>
      )}

      {/* Placement preview wireframe */}
      <div style={{ background: 'var(--white)', border: '1px solid var(--cream-border)', borderRadius: '12px', padding: '18px', marginBottom: '20px' }}>
        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '11px', fontWeight: 500, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '14px' }}>Placement Wireframe</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', maxWidth: '400px' }}>
          {['listing-grid-a (pos 6)', 'listing-grid-b (pos 14)', 'listing-grid-c (pos 20)'].map((slot, i) => {
            const slotPlacement = ['listing-grid', 'listing-grid', 'listing-grid'][i]
            const highlighted = hoveredId
              ? ads.find((a) => a.id === hoveredId && a.placement?.includes(slotPlacement as never))
              : null
            return (
              <div key={slot} style={{ height: '50px', borderRadius: '6px', border: '1px dashed var(--cream-border)', background: highlighted ? 'var(--accent-light)' : 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '9.5px', color: highlighted ? 'var(--accent)' : 'var(--ink-4)' }}>Ad slot {i + 1}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Table */}
      <div style={{ background: 'var(--white)', border: '1px solid var(--cream-border)', borderRadius: '12px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Advertiser', 'Format', 'Placements', 'Slot', 'Priority', 'Status', 'Impressions', 'Views', 'Clicks', 'CTR', 'Actions'].map((h) => (
                <th key={h} style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '10.5px', fontWeight: 500, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.07em', padding: '10px 14px', textAlign: 'left', background: 'var(--cream)', whiteSpace: 'nowrap' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ads.length === 0 ? (
              <tr>
                <td colSpan={11} style={{ padding: '40px', textAlign: 'center', fontFamily: 'DM Sans, sans-serif', fontSize: '13px', color: 'var(--ink-4)' }}>
                  No ads yet. <Link href="/admin/ads/new" style={{ color: 'var(--ink)', textDecoration: 'underline' }}>Create your first ad.</Link>
                </td>
              </tr>
            ) : ads.map((ad) => (
              <tr key={ad.id} style={{ borderTop: '1px solid var(--cream-border)' }}
                onMouseEnter={() => setHoveredId(ad.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <td style={td}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {ad.icon_emoji && <span style={{ fontSize: '16px' }}>{ad.icon_emoji}</span>}
                    <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '13px', color: 'var(--ink)', fontWeight: 500 }}>{ad.advertiser}</span>
                  </div>
                  <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '11px', color: 'var(--ink-4)', margin: '2px 0 0' }}>{ad.headline.slice(0, 40)}{ad.headline.length > 40 ? '…' : ''}</p>
                </td>
                <td style={td}>
                  <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '10.5px', fontWeight: 500, color: FORMAT_COLORS[ad.format] ?? 'var(--ink-3)', background: 'var(--cream)', borderRadius: '4px', padding: '2px 7px' }}>{ad.format}</span>
                </td>
                <td style={td}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {(ad.placement ?? []).map((p) => (
                      <span key={p} style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '10px', color: 'var(--ink-3)', background: 'var(--cream)', border: '1px solid var(--cream-border)', borderRadius: '4px', padding: '1px 5px' }}>{p}</span>
                    ))}
                  </div>
                </td>
                <td style={td}><span style={{ fontFamily: 'DM Serif Display, serif', fontSize: '13px', color: 'var(--ink)' }}>{ad.slot_index ?? 'Auto'}</span></td>
                <td style={td}><span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '13px', color: 'var(--ink)' }}>{ad.priority}</span></td>
                <td style={td}>
                  <button
                    onClick={() => startTransition(() => { toggleActive(ad) })}
                    style={{ width: '36px', height: '20px', borderRadius: '10px', background: ad.is_active ? '#1E6E2E' : 'var(--cream-border)', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s ease' }}
                    aria-label={ad.is_active ? 'Pause' : 'Activate'}
                  >
                    <span style={{ position: 'absolute', top: '2px', left: ad.is_active ? '18px' : '2px', width: '16px', height: '16px', borderRadius: '50%', background: 'var(--white)', transition: 'left 0.2s ease' }} />
                  </button>
                </td>
                <td style={td}><span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '12.5px', color: 'var(--ink)' }}>{ad.impression_count.toLocaleString()}</span></td>
                <td style={td}><span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '12.5px', color: 'var(--ink)' }}>{ad.unique_view_count.toLocaleString()}</span></td>
                <td style={td}><span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '12.5px', color: 'var(--ink)' }}>{ad.click_count.toLocaleString()}</span></td>
                <td style={td}><span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '12.5px', color: 'var(--ink)' }}>{ctr(ad)}</span></td>
                <td style={td}>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'nowrap' }}>
                    <Link href={`/admin/ads/${ad.id}`} style={actionBtn}>Edit</Link>
                    <button onClick={() => duplicateAd(ad)} style={actionBtnEl}>Dup</button>
                    <button onClick={() => deleteAd(ad)} style={{ ...actionBtnEl, color: '#B01F1F', borderColor: '#F0B8B8' }}>Del</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const td: React.CSSProperties = { padding: '12px 14px', verticalAlign: 'middle' }
const actionBtn: React.CSSProperties = { fontFamily: 'DM Sans, sans-serif', fontSize: '11.5px', color: 'var(--ink)', textDecoration: 'none', border: '1px solid var(--cream-border)', borderRadius: '5px', padding: '3px 9px' }
const actionBtnEl: React.CSSProperties = { fontFamily: 'DM Sans, sans-serif', fontSize: '11.5px', color: 'var(--ink-3)', background: 'none', border: '1px solid var(--cream-border)', borderRadius: '5px', padding: '3px 9px', cursor: 'pointer' }
