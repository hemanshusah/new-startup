'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { revalidateAdminPath } from '@/app/admin/actions'
import {
  PROGRAM_FORM_FIELDS,
  SECTOR_DEFAULTS,
  mergeFieldSchema,
  type FieldConfig,
} from '@/lib/site-field-schema'

export type { FieldConfig }

/** PostgREST: columns missing from DB / stale schema cache */
function formatSiteConfigError(err: { code?: string; message?: string }): string {
  const msg = err.message ?? ''
  if (err.code === 'PGRST204' && (msg.includes('field_schema') || msg.includes('sectors'))) {
    return 'Your Supabase database is missing columns field_schema and/or sectors. Run the SQL in grantsindia/supabase/migrations/007_site_config_add_field_schema_sectors.sql in the Supabase SQL Editor, then open Project Settings → Data API and reload the schema (or wait ~1 minute).'
  }
  return msg || 'Save failed.'
}

interface SettingsFormProps {
  settingsRowId: string | null
  initialFieldConfig: Record<string, FieldConfig>
  initialSectors: string[]
}

export function SettingsForm({ settingsRowId, initialFieldConfig, initialSectors }: SettingsFormProps) {
  const supabase = createClient()
  const [rowId, setRowId] = useState<string | null>(settingsRowId)
  const [fieldConfig, setFieldConfig] = useState<Record<string, FieldConfig>>(() =>
    mergeFieldSchema(initialFieldConfig)
  )
  const [sectors, setSectors] = useState<string[]>(initialSectors)

  useEffect(() => {
    setRowId(settingsRowId)
  }, [settingsRowId])
  const [newSector, setNewSector] = useState('')
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)
  const [saving, setSaving] = useState(false)

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 4000)
  }

  const ensureRowInsert = async (): Promise<{ id: string | null; err?: { code?: string; message?: string } }> => {
    const { data, error } = await supabase
      .from('site_config')
      .insert({
        site_name: 'GrantsIndia',
        programs_per_page: 12,
        si_slot_positions: [6, 14, 20],
        maintenance_mode: false,
        field_schema: fieldConfig,
        sectors,
      })
      .select('id')
      .single()
    if (error) {
      console.error('[settings] insert site_config', error)
      return { id: null, err: error }
    }
    return { id: data?.id ?? null }
  }

  const saveFieldConfig = async () => {
    setSaving(true)
    let id = rowId
    if (!id) {
      const { id: newId, err } = await ensureRowInsert()
      if (err) {
        setSaving(false)
        showToast(formatSiteConfigError(err), false)
        return
      }
      if (newId) setRowId(newId)
      id = newId
    }
    if (!id) {
      setSaving(false)
      showToast('Could not create site_config. Set SUPABASE_SERVICE_ROLE_KEY for server-side seed or run migration 007.', false)
      return
    }
    const { error } = await supabase.from('site_config').update({ field_schema: fieldConfig }).eq('id', id)
    setSaving(false)
    error ? showToast(formatSiteConfigError(error), false) : showToast('Field schema saved.')
  }

  const saveSectors = async () => {
    setSaving(true)
    let id = rowId
    if (!id) {
      const { id: newId, err } = await ensureRowInsert()
      if (err) {
        setSaving(false)
        showToast(formatSiteConfigError(err), false)
        return
      }
      if (newId) setRowId(newId)
      id = newId
    }
    if (!id) {
      setSaving(false)
      showToast('Could not create site_config. Set SUPABASE_SERVICE_ROLE_KEY or run migration 007.', false)
      return
    }
    const { error } = await supabase.from('site_config').update({ sectors }).eq('id', id)
    setSaving(false)
    error ? showToast(formatSiteConfigError(error), false) : showToast('Sector tags saved.')
  }

  const addSector = () => {
    if (newSector.trim() && !sectors.includes(newSector.trim())) {
      setSectors([...sectors, newSector.trim()])
      setNewSector('')
    }
  }

  const revalidate = async (path: string) => {
    const res = await revalidateAdminPath(path)
    if (res.ok) showToast(`Revalidated ${path}`)
    else showToast(res.error ?? 'Revalidation failed.', false)
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
            {PROGRAM_FORM_FIELDS.map((f) => (
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
