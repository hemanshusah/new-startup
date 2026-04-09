'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { SoftInfra } from '@/types/softinfra'

const FORMAT_COLORS: Record<string, string> = {
  'card-sm': '#2B4EA8',
  'card-dark': '#1E6E2E',
  'card-wide': '#7040A0',
  'inline': '#9B5A00',
  'sidebar': '#005D80',
  'newsletter': '#2A6620',
}

export function SITable({ initialSI }: { initialSI: SoftInfra[] }) {
  const supabase = createClient()
  const [siItems, setSIItems] = useState<SoftInfra[]>(initialSI)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 4000)
  }

  const toggleActive = useCallback(async (si: SoftInfra) => {
    const newVal = !si.is_active
    // Optimistic update
    setSIItems((prev) => prev.map((a) => (a.id === si.id ? { ...a, is_active: newVal } : a)))
    
    const { error } = await supabase.from('softinfra').update({ is_active: newVal }).eq('id', si.id)
    if (error) {
      // Rollback
      setSIItems((prev) => prev.map((a) => (a.id === si.id ? { ...a, is_active: si.is_active } : a)))
      showToast(`Database Error: ${error.message} (Code: ${error.code})`, false)
    } else {
      showToast(`Item "${si.advertiser}" ${newVal ? 'activated' : 'paused'}.`)
    }
  }, [supabase])

  const deleteSI = useCallback(async (si: SoftInfra) => {
    if (!confirm(`Delete item "${si.advertiser}"?`)) return
    const { error } = await supabase.from('softinfra').delete().eq('id', si.id)
    if (!error) {
      setSIItems((prev) => prev.filter((a) => a.id !== si.id))
      showToast('Item deleted.')
    } else {
      showToast(`Delete failed: ${error.message}`, false)
    }
  }, [supabase])

  const duplicateSI = useCallback(async (si: SoftInfra) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, created_at, impression_count, unique_view_count, click_count, ...rest } = si
    const { data, error } = await supabase.from('softinfra').insert({ ...rest, advertiser: rest.advertiser + ' (copy)', is_active: false }).select().single()
    if (!error && data) {
      setSIItems((prev) => [data as SoftInfra, ...prev])
      showToast('Item duplicated.')
    } else {
      showToast('Duplicate failed.', false)
    }
  }, [supabase])

  const ctr = (si: SoftInfra) =>
    si.impression_count > 0
      ? ((si.click_count / si.impression_count) * 100).toFixed(1) + '%'
      : '—'

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', background: toast.ok ? '#1E6E2E' : '#B01F1F', color: '#fff', fontFamily: 'DM Sans, sans-serif', fontSize: '13px', padding: '12px 20px', borderRadius: '8px', zIndex: 200, boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }} role="status">
          {toast.msg}
        </div>
      )}

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
            {siItems.length === 0 ? (
              <tr>
                <td colSpan={11} style={{ padding: '40px', textAlign: 'center', fontFamily: 'DM Sans, sans-serif', fontSize: '13px', color: 'var(--ink-4)' }}>
                  No items yet. <Link href="/admin/softinfra/new" style={{ color: 'var(--ink)', textDecoration: 'underline' }}>Create your first item.</Link>
                </td>
              </tr>
            ) : siItems.map((si) => (
              <tr key={si.id} style={{ borderTop: '1px solid var(--cream-border)' }}
                onMouseEnter={() => setHoveredId(si.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <td style={td}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {si.icon_emoji && <span style={{ fontSize: '16px' }}>{si.icon_emoji}</span>}
                    <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '13px', color: 'var(--ink)', fontWeight: 500 }}>{si.advertiser}</span>
                  </div>
                  <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '11px', color: 'var(--ink-4)', margin: '2px 0 0' }}>{si.headline.slice(0, 40)}{si.headline.length > 40 ? '…' : ''}</p>
                </td>
                <td style={td}>
                  <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '10.5px', fontWeight: 500, color: FORMAT_COLORS[si.format] ?? 'var(--ink-3)', background: 'var(--cream)', borderRadius: '4px', padding: '2px 7px' }}>{si.format}</span>
                </td>
                <td style={td}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {(si.placement ?? []).map((p) => (
                      <span key={p} style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '10px', color: 'var(--ink-3)', background: 'var(--cream)', border: '1px solid var(--cream-border)', borderRadius: '4px', padding: '1px 5px' }}>{p}</span>
                    ))}
                  </div>
                </td>
                <td style={td}><span style={{ fontFamily: 'DM Serif Display, serif', fontSize: '13px', color: 'var(--ink)' }}>{si.slot_index ?? 'Auto'}</span></td>
                <td style={td}><span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '13px', color: 'var(--ink)' }}>{si.priority}</span></td>
                <td style={td}>
                  <button
                    onClick={() => { toggleActive(si) }}
                    style={{ width: '36px', height: '20px', borderRadius: '10px', background: si.is_active ? '#1E6E2E' : 'var(--cream-border)', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s ease' }}
                    aria-label={si.is_active ? 'Pause' : 'Activate'}
                  >
                    <span style={{ position: 'absolute', top: '2px', left: si.is_active ? '18px' : '2px', width: '16px', height: '16px', borderRadius: '50%', background: 'var(--white)', transition: 'left 0.2s ease' }} />
                  </button>
                </td>
                <td style={td}><span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '12.5px', color: 'var(--ink)' }}>{si.impression_count.toLocaleString()}</span></td>
                <td style={td}><span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '12.5px', color: 'var(--ink)' }}>{si.unique_view_count.toLocaleString()}</span></td>
                <td style={td}><span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '12.5px', color: 'var(--ink)' }}>{si.click_count.toLocaleString()}</span></td>
                <td style={td}><span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '12.5px', color: 'var(--ink)' }}>{ctr(si)}</span></td>
                <td style={td}>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'nowrap' }}>
                    <Link href={`/admin/softinfra/${si.id}`} style={actionBtn}>Edit</Link>
                    <button onClick={() => duplicateSI(si)} style={actionBtnEl}>Dup</button>
                    <button onClick={() => deleteSI(si)} style={{ ...actionBtnEl, color: '#B01F1F', borderColor: '#F0B8B8' }}>Del</button>
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
