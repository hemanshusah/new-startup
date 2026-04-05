'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const FIELDS = [
  { key: 'description_short', label: 'Short description' },
  { key: 'about', label: 'About the program' },
  { key: 'what_you_get', label: 'What you get' },
  { key: 'eligibility', label: 'Eligibility criteria' },
  { key: 'how_to_apply', label: 'How to apply' },
  { key: 'mode', label: 'Mode' },
  { key: 'stage', label: 'Stage' },
  { key: 'duration', label: 'Duration' },
  { key: 'cohort_size', label: 'Cohort size' },
  { key: 'equity', label: 'Equity' },
  { key: 'amount_min', label: 'Amount (min)' },
  { key: 'amount_max', label: 'Amount (max)' },
  { key: 'amount_display', label: 'Amount display string' },
  { key: 'state', label: 'Indian state' },
  { key: 'sectors', label: 'Focus sectors' },
  { key: 'apply_url', label: 'Apply URL' },
  { key: 'is_featured', label: 'Is featured' },
]

const SECTOR_DEFAULTS = [
  'AgriTech', 'AI / ML', 'CleanTech', 'Climate Tech', 'Deep Tech', 'EdTech',
  'Fintech', 'HealthTech', 'HRTech', 'IoT', 'LegalTech', 'Logistics', 'Manufacturing',
  'Media & Entertainment', 'MedTech', 'PropTech', 'RetailTech', 'SaaS', 'SpaceTech',
  'Sustainability', 'WaterTech', 'Women-led',
]

type FieldConfig = 'required' | 'optional' | 'hidden'

interface SettingsFormProps {
  initialFieldConfig: Record<string, FieldConfig>
  initialSectors: string[]
}

export function SettingsForm({ initialFieldConfig, initialSectors }: SettingsFormProps) {
  const supabase = createClient()
  const [fieldConfig, setFieldConfig] = useState<Record<string, FieldConfig>>(initialFieldConfig)
  const [sectors, setSectors] = useState<string[]>(initialSectors)
  const [newSector, setNewSector] = useState('')
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)
  const [saving, setSaving] = useState(false)

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 4000)
  }

  const saveFieldConfig = async () => {
    setSaving(true)
    const { error } = await supabase.from('site_config').upsert({ key: 'field_schema', value: JSON.stringify(fieldConfig) }, { onConflict: 'key' })
    setSaving(false)
    error ? showToast('Save failed.', false) : showToast('Field schema saved.')
  }

  const saveSectors = async () => {
    setSaving(true)
    const { error } = await supabase.from('site_config').upsert({ key: 'sectors', value: JSON.stringify(sectors) }, { onConflict: 'key' })
    setSaving(false)
    error ? showToast('Save failed.', false) : showToast('Sector tags saved.')
  }

  const addSector = () => {
    if (newSector.trim() && !sectors.includes(newSector.trim())) {
      setSectors([...sectors, newSector.trim()])
      setNewSector('')
    }
  }

  const revalidate = async (path: string) => {
    const secret = process.env.NEXT_PUBLIC_REVALIDATE_SECRET ?? ''
    const res = await fetch(`/api/revalidate?path=${encodeURIComponent(path)}&secret=${secret}`)
    if (res.ok) showToast(`Revalidated ${path}`)
    else showToast('Revalidation failed.', false)
  }

  const sectionHead = (title: string) => (
    <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '12px', fontWeight: 600, color: 'var(--ink)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '16px' }}>{title}</p>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {toast && (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', background: toast.ok ? '#1E6E2E' : '#B01F1F', color: '#fff', fontFamily: 'DM Sans, sans-serif', fontSize: '13px', padding: '12px 20px', borderRadius: '8px', zIndex: 200 }} role="status">
          {toast.msg}
        </div>
      )}

      {/* Field schema editor */}
      <div style={{ background: 'var(--white)', border: '1px solid var(--cream-border)', borderRadius: '12px', padding: '22px' }}>
        {sectionHead('Field schema editor')}
        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '12.5px', color: 'var(--ink-3)', marginBottom: '16px' }}>
          Control which optional fields appear in the program form. Does not affect DB columns.
        </p>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Field', 'Required', 'Optional', 'Hidden'].map((h) => (
                <th key={h} style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '10.5px', fontWeight: 500, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.07em', padding: '8px 12px', textAlign: 'left', background: 'var(--cream)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {FIELDS.map((f) => (
              <tr key={f.key} style={{ borderTop: '1px solid var(--cream-border)' }}>
                <td style={{ padding: '10px 12px', fontFamily: 'DM Sans, sans-serif', fontSize: '13px', color: 'var(--ink)' }}>{f.label}</td>
                {(['required', 'optional', 'hidden'] as const).map((opt) => (
                  <td key={opt} style={{ padding: '10px 12px', textAlign: 'center' }}>
                    <input type="radio" name={f.key} checked={fieldConfig[f.key] === opt} onChange={() => setFieldConfig({ ...fieldConfig, [f.key]: opt })} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ marginTop: '16px' }}>
          <button onClick={saveFieldConfig} disabled={saving} style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '13px', fontWeight: 500, color: 'var(--cream)', background: 'var(--ink)', border: 'none', borderRadius: '8px', padding: '9px 20px', cursor: 'pointer' }}>
            {saving ? 'Saving…' : 'Save field schema'}
          </button>
        </div>
      </div>

      {/* Sector tags manager */}
      <div style={{ background: 'var(--white)', border: '1px solid var(--cream-border)', borderRadius: '12px', padding: '22px' }}>
        {sectionHead('Sector tags manager')}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
          {sectors.map((s) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'DM Sans, sans-serif', fontSize: '12px', background: 'var(--cream)', border: '1px solid var(--cream-border)', borderRadius: '20px', padding: '4px 12px' }}>
              {s}
              <button onClick={() => setSectors(sectors.filter((x) => x !== s))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-4)', fontSize: '13px', padding: '0 0 0 4px' }}>×</button>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
          <input type="text" value={newSector} onChange={(e) => setNewSector(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSector() } }}
            placeholder="Add new sector…" style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '13px', border: '1px solid var(--cream-border)', borderRadius: '7px', padding: '8px 12px', flex: 1, outline: 'none', background: 'var(--white)' }} />
          <button onClick={addSector} style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '12.5px', color: 'var(--ink)', background: 'var(--cream)', border: '1px solid var(--cream-border)', borderRadius: '7px', padding: '8px 14px', cursor: 'pointer' }}>Add</button>
        </div>
        <button onClick={saveSectors} disabled={saving} style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '13px', fontWeight: 500, color: 'var(--cream)', background: 'var(--ink)', border: 'none', borderRadius: '8px', padding: '9px 20px', cursor: 'pointer' }}>
          Save sectors
        </button>
      </div>

      {/* Cache controls */}
      <div style={{ background: 'var(--white)', border: '1px solid var(--cream-border)', borderRadius: '12px', padding: '22px' }}>
        {sectionHead('Cache controls')}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[
            { label: 'Revalidate listing page', path: '/' },
            { label: 'Revalidate all program pages', path: '/programs' },
          ].map(({ label, path }) => (
            <div key={path} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: 'var(--cream)', borderRadius: '8px' }}>
              <div>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '13px', color: 'var(--ink)', margin: '0 0 2px' }}>{label}</p>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '11px', color: 'var(--ink-4)', margin: 0 }}>Calls /api/revalidate?path={path}</p>
              </div>
              <button onClick={() => revalidate(path)} style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '12.5px', color: 'var(--ink)', background: 'var(--white)', border: '1px solid var(--cream-border)', borderRadius: '7px', padding: '7px 14px', cursor: 'pointer' }}>
                Revalidate
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
