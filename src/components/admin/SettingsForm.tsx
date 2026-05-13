'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { revalidateAdminPath } from '@/app/admin/actions'
import {
  PROGRAM_FORM_FIELDS,
  type FieldConfig,
  mergeFieldSchema,
} from '@/lib/site-field-schema'

export type { FieldConfig }

const GOOGLE_FONTS_CURATED = [
  'DM Serif Display', 'Playfair Display', 'Lora', 'Cormorant Garamond', 'Crimson Pro',
  'Libre Baskerville', 'Prata', 'Fraunces', 'Newsreader', 'DM Sans', 'Inter',
  'Montserrat', 'Roboto', 'Open Sans', 'Outfit', 'Plus Jakarta Sans', 'Manrope',
  'Bricolage Grotesque', 'Raleway', 'Space Grotesk'
]

function formatSiteConfigError(err: { code?: string; message?: string }): string {
  const msg = err.message ?? ''
  if (err.code === 'PGRST204' && (msg.includes('field_schema') || msg.includes('sectors'))) {
    return 'Your Supabase database is missing columns field_schema and/or sectors.'
  }
  return msg || 'Save failed.'
}

interface SettingsFormProps {
  settingsRowId: string | null
  initialFieldConfig: Record<string, FieldConfig>
  initialSectors: string[]
  initialCosmeticSettings?: any
  initialMentorSettings?: {
    enabled: boolean
    commissionPct: number
    priceMin: number
    priceMax: number
  }
}

export function SettingsForm({ 
  settingsRowId, 
  initialFieldConfig, 
  initialSectors,
  initialCosmeticSettings,
  initialMentorSettings
}: SettingsFormProps) {
  const supabase = createClient()
  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab') as 'config' | 'tags' | 'appearance' | 'apps' | null
  
  const [rowId, setRowId] = useState<string | null>(settingsRowId)
  const [activeTab, setActiveTab] = useState<'config' | 'tags' | 'appearance' | 'apps'>(tabParam || 'config')
  
  const [fieldConfig, setFieldConfig] = useState<Record<string, FieldConfig>>(() =>
    mergeFieldSchema(initialFieldConfig)
  )
  const [sectors, setSectors] = useState<string[]>(initialSectors)
  const [cosmetic, setCosmetic] = useState<any>(() => {
    const base = initialCosmeticSettings || {}
    return {
      ...base,
      colors: base.colors || { 
        accent: '#B8460A', 
        accentLight: '#FDF0EA', 
        bg: '#F5F2EB', 
        headerBg: '#F5F2EB',
        footerBg: '#F5F2EB',
        text: '#1C1A16', 
        border: '#DAD6CC', 
        white: '#FDFCF9' 
      },
      fonts: base.fonts || { 
        heading: { family: 'DM Serif Display', size: '28px', weight: '400', style: 'normal' },
        section: { family: 'DM Serif Display', size: '16px', weight: '400', style: 'normal' },
        body: { family: 'DM Sans', size: '14px', weight: '400', style: 'normal' }
      },
      borderRadius: base.borderRadius || '12px',
      enabledProducts: base.enabledProducts || { showSchool: true }
    }
  })

  const [mentorSettings, setMentorSettings] = useState(() => ({
    enabled: initialMentorSettings?.enabled ?? false,
    commissionPct: initialMentorSettings?.commissionPct ?? 20,
    priceMin: initialMentorSettings?.priceMin ?? 2500,
    priceMax: initialMentorSettings?.priceMax ?? 25000,
  }))

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

  const saveSettings = async (payload: any, label: string) => {
    setSaving(true)
    let id = rowId
    if (!id) {
       const { data, error } = await supabase.from('site_config').insert({ ...payload, site_name: 'GrantsIndia', product_slug: 'grants' }).select('id').single()
       if (error) { showToast(error.message, false); setSaving(false); return }
       id = data.id; setRowId(id)
    }
    const { error } = await supabase.from('site_config').update(payload).eq('id', id)
    setSaving(false)
    if (error) showToast(formatSiteConfigError(error), false)
    else {
      showToast(`${label} saved.`)
      await Promise.allSettled([
        revalidateAdminPath('/'),
        revalidateAdminPath('/programs')
      ])
      window.location.reload()
    }
  }

  const TabButton = ({ id, label }: { id: typeof activeTab, label: string }) => (
    <button
      onClick={() => setActiveTab(id)}
      style={{
        padding: '10px 20px',
        fontSize: '13px',
        fontWeight: activeTab === id ? 600 : 400,
        color: activeTab === id ? 'var(--ink)' : 'var(--ink-3)',
        borderBottom: activeTab === id ? '2px solid var(--accent)' : '2px solid transparent',
        transition: 'all 0.2s ease',
        background: 'none',
        border: 'none',
        cursor: 'pointer'
      }}
    >
      {label}
    </button>
  )

  const sectionHead = (title: string) => (
    <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--ink)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '16px' }}>{title}</p>
  )

  const colorInput = (label: string, key: string) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <label style={{ fontSize: '12px', color: 'var(--ink-2)' }}>{label}</label>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <input 
          type="color" 
          value={cosmetic.colors[key]} 
          onChange={(e) => setCosmetic({ ...cosmetic, colors: { ...cosmetic.colors, [key]: e.target.value } })}
          style={{ width: '32px', height: '32px', border: '1px solid var(--cream-border)', borderRadius: '4px', cursor: 'pointer' }}
        />
        <input 
          type="text" 
          value={cosmetic.colors[key]} 
          onChange={(e) => setCosmetic({ ...cosmetic, colors: { ...cosmetic.colors, [key]: e.target.value } })}
          style={{ width: '80px', fontSize: '12px', border: '1px solid var(--cream-border)', borderRadius: '4px', padding: '4px 8px' }}
        />
      </div>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {toast && (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', background: toast.ok ? '#1E6E2E' : '#B01F1F', color: '#fff', fontSize: '13px', padding: '12px 20px', borderRadius: '8px', zIndex: 200 }} role="status">
          {toast.msg}
        </div>
      )}

      <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid var(--cream-border)', marginBottom: '4px' }}>
        <TabButton id="config" label="Form Fields" />
        <TabButton id="tags" label="Sector Tags" />
        <TabButton id="appearance" label="Appearance" />
        <TabButton id="apps" label="App Manager" />
      </div>

      {activeTab === 'config' && (
        <div style={{ background: 'var(--white)', border: '1px solid var(--cream-border)', borderRadius: '12px', padding: '24px' }}>
          {sectionHead('Field schema editor')}
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--cream)' }}>
                <th style={{ textAlign: 'left', padding: '10px 12px', fontSize: '10px', fontWeight: 600 }}>FIELD</th>
                <th style={{ textAlign: 'center', padding: '10px 12px', fontSize: '10px', fontWeight: 600 }}>REQUIRED</th>
                <th style={{ textAlign: 'center', padding: '10px 12px', fontSize: '10px', fontWeight: 600 }}>OPTIONAL</th>
                <th style={{ textAlign: 'center', padding: '10px 12px', fontSize: '10px', fontWeight: 600 }}>HIDDEN</th>
              </tr>
            </thead>
            <tbody>
              {PROGRAM_FORM_FIELDS.map((f) => (
                <tr key={f.key} style={{ borderTop: '1px solid var(--cream-border)' }}>
                  <td style={{ padding: '12px', fontSize: '13px' }}>{f.label}</td>
                  {(['required', 'optional', 'hidden'] as const).map((opt) => (
                    <td key={opt} style={{ padding: '12px', textAlign: 'center' }}>
                      <input type="radio" name={f.key} checked={fieldConfig[f.key] === opt} onChange={() => setFieldConfig({ ...fieldConfig, [f.key]: opt })} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={() => saveSettings({ field_schema: fieldConfig }, 'Fields')} disabled={saving} style={{ marginTop: '24px', padding: '10px 24px', borderRadius: '8px', background: 'var(--ink)', color: 'var(--white)', border: 'none', cursor: 'pointer' }}>
            Save Changes
          </button>
        </div>
      )}

      {activeTab === 'tags' && (
        <div style={{ background: 'var(--white)', border: '1px solid var(--cream-border)', borderRadius: '12px', padding: '24px' }}>
          {sectionHead('Sector tags manager')}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
            {sectors.map((s) => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', background: 'var(--cream)', borderRadius: '20px', padding: '5px 14px' }}>
                {s}
                <button onClick={() => setSectors(sectors.filter((x) => x !== s))} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>×</button>
              </div>
            ))}
          </div>
          <button onClick={() => saveSettings({ sectors }, 'Sectors')} disabled={saving} style={{ padding: '10px 24px', borderRadius: '8px', background: 'var(--ink)', color: 'var(--white)', border: 'none', cursor: 'pointer' }}>
            Save Changes
          </button>
        </div>
      )}
      {activeTab === 'apps' && (
        <div style={{ background: 'var(--white)', border: '1px solid var(--cream-border)', borderRadius: '12px', padding: '24px' }}>
          {sectionHead('App Visibility Control')}
          
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            padding: '16px', 
            background: 'var(--cream)', 
            borderRadius: '12px',
            border: '1px solid var(--cream-border)'
          }}>
            <div>
              <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink)', margin: 0 }}>Startup School</p>
              <p style={{ fontSize: '12px', color: 'var(--ink-4)', margin: 0 }}>Show "Startup School" link in header and footer.</p>
            </div>
            <button
              onClick={() => setCosmetic({ 
                ...cosmetic, 
                enabledProducts: { ...cosmetic.enabledProducts, showSchool: !cosmetic.enabledProducts.showSchool } 
              })}
              style={{
                width: '50px', height: '26px', borderRadius: '100px',
                background: cosmetic.enabledProducts.showSchool ? 'var(--accent)' : '#ccc',
                border: 'none', position: 'relative', cursor: 'pointer'
              }}
            >
              <div style={{
                position: 'absolute', top: '3px',
                left: cosmetic.enabledProducts.showSchool ? '27px' : '3px',
                width: '20px', height: '20px', borderRadius: '50%', background: '#fff',
                transition: 'left 0.2s ease'
              }} />
            </button>
          </div>

          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            padding: '16px', 
            background: 'var(--cream)', 
            borderRadius: '12px',
            border: '1px solid var(--cream-border)',
            marginTop: '16px'
          }}>
            <div>
              <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink)', margin: 0 }}>Mentor Connect</p>
              <p style={{ fontSize: '12px', color: 'var(--ink-4)', margin: 0 }}>Enable or disable the entire Mentor Connect platform.</p>
            </div>
            <button
              onClick={() => setMentorSettings({ ...mentorSettings, enabled: !mentorSettings.enabled })}
              style={{
                width: '50px', height: '26px', borderRadius: '100px',
                background: mentorSettings.enabled ? 'var(--accent)' : '#ccc',
                border: 'none', position: 'relative', cursor: 'pointer'
              }}
            >
              <div style={{
                position: 'absolute', top: '3px',
                left: mentorSettings.enabled ? '27px' : '3px',
                width: '20px', height: '20px', borderRadius: '50%', background: '#fff',
                transition: 'left 0.2s ease'
              }} />
            </button>
          </div>

          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            padding: '16px', 
            background: 'var(--cream)', 
            borderRadius: '12px',
            border: '1px solid var(--cream-border)',
            marginTop: '16px'
          }}>
            <div>
              <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink)', margin: 0 }}>Personalization Section</p>
              <p style={{ fontSize: '12px', color: 'var(--ink-4)', margin: 0 }}>Show Health Tracker and Recommendations on the dashboard.</p>
            </div>
            <button
              onClick={() => setCosmetic({ 
                ...cosmetic, 
                enabledProducts: { 
                  ...cosmetic.enabledProducts, 
                  showPersonalization: cosmetic.enabledProducts.showPersonalization === false ? true : false 
                } 
              })}
              style={{
                width: '50px', height: '26px', borderRadius: '100px',
                background: cosmetic.enabledProducts.showPersonalization !== false ? 'var(--accent)' : '#ccc',
                border: 'none', position: 'relative', cursor: 'pointer'
              }}
            >
              <div style={{
                position: 'absolute', top: '3px',
                left: cosmetic.enabledProducts.showPersonalization !== false ? '27px' : '3px',
                width: '20px', height: '20px', borderRadius: '50%', background: '#fff',
                transition: 'left 0.2s ease'
              }} />
            </button>
          </div>
          <button onClick={() => saveSettings({ 
            cosmetic_settings: cosmetic,
            mentor_connect_enabled: mentorSettings.enabled
          }, 'App Visibility')} disabled={saving} style={{ marginTop: '24px', padding: '10px 24px', borderRadius: '8px', background: 'var(--ink)', color: 'var(--white)', border: 'none', cursor: 'pointer' }}>
            Save App Settings
          </button>

          <div style={{ marginTop: '40px' }}>
            {sectionHead('Mentor Connect Configuration')}
            <div style={{ background: 'var(--cream)', border: '1px solid var(--cream-border)', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                <div>
                  <label style={subLabelStyle}>Commission (%)</label>
                  <input 
                    type="number" 
                    value={mentorSettings.commissionPct} 
                    onChange={(e) => setMentorSettings({ ...mentorSettings, commissionPct: Number(e.target.value) })}
                    style={subInputStyle}
                  />
                </div>
                <div>
                  <label style={subLabelStyle}>Min Price (₹)</label>
                  <input 
                    type="number" 
                    value={mentorSettings.priceMin} 
                    onChange={(e) => setMentorSettings({ ...mentorSettings, priceMin: Number(e.target.value) })}
                    style={subInputStyle}
                  />
                </div>
                <div>
                  <label style={subLabelStyle}>Max Price (₹)</label>
                  <input 
                    type="number" 
                    value={mentorSettings.priceMax} 
                    onChange={(e) => setMentorSettings({ ...mentorSettings, priceMax: Number(e.target.value) })}
                    style={subInputStyle}
                  />
                </div>
              </div>
            </div>
            <button 
              onClick={() => saveSettings({ 
                mentor_connect_enabled: mentorSettings.enabled,
                mentor_commission_pct: mentorSettings.commissionPct,
                price_min_inr: mentorSettings.priceMin,
                price_max_inr: mentorSettings.priceMax
              }, 'Mentor Connect')} 
              disabled={saving} 
              style={{ marginTop: '16px', padding: '10px 24px', borderRadius: '8px', background: 'var(--ink)', color: 'var(--white)', border: 'none', cursor: 'pointer' }}
            >
              Save Mentor Settings
            </button>
          </div>
        </div>
      )}

      {activeTab === 'appearance' && (
        <div style={{ background: 'var(--white)', border: '1px solid var(--cream-border)', borderRadius: '12px', padding: '24px' }}>
          {sectionHead('Appearance Settings')}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px', marginBottom: '32px' }}>
            <div>
              <p style={{ fontSize: '13px', fontWeight: 600, marginBottom: '16px' }}>Brand Colors</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                {colorInput('Accent', 'accent')}
                {colorInput('Background', 'bg')}
                {colorInput('Header', 'headerBg')}
                {colorInput('Footer', 'footerBg')}
              </div>
            </div>
            <div>
              <p style={{ fontSize: '13px', fontWeight: 600, marginBottom: '16px' }}>Typography</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <select 
                  value={cosmetic.fonts.heading.family}
                  onChange={(e) => setCosmetic({ ...cosmetic, fonts: { ...cosmetic.fonts, heading: { ...cosmetic.fonts.heading, family: e.target.value } } })}
                  style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--cream-border)' }}
                >
                  {GOOGLE_FONTS_CURATED.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
                <select 
                  value={cosmetic.fonts.body.family}
                  onChange={(e) => setCosmetic({ ...cosmetic, fonts: { ...cosmetic.fonts, body: { ...cosmetic.fonts.body, family: e.target.value } } })}
                  style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--cream-border)' }}
                >
                  {GOOGLE_FONTS_CURATED.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
            </div>
          </div>
          <button onClick={() => saveSettings({ cosmetic_settings: cosmetic }, 'Cosmetic branding')} disabled={saving} style={{ padding: '10px 24px', borderRadius: '8px', background: 'var(--ink)', color: 'var(--white)', border: 'none', cursor: 'pointer' }}>
            Save Appearance
          </button>
        </div>
      )}
    </div>
  )
}

const subLabelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '10px',
  fontWeight: 600,
  color: 'var(--ink-3)',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  marginBottom: '4px',
}

const subInputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 10px',
  borderRadius: '6px',
  border: '1px solid var(--cream-border)',
  background: 'var(--white)',
  fontSize: '13px',
  fontFamily: 'var(--font-sans)',
}
