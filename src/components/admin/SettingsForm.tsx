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
  initialCosmeticSettings?: any
}

const GOOGLE_FONTS_CURATED = [
  'DM Serif Display',
  'Playfair Display',
  'Lora',
  'Cormorant Garamond',
  'Crimson Pro',
  'Libre Baskerville',
  'Prata',
  'Fraunces',
  'Newsreader',
  'DM Sans',
  'Inter',
  'Montserrat',
  'Roboto',
  'Open Sans',
  'Outfit',
  'Plus Jakarta Sans',
  'Manrope',
  'Bricolage Grotesque',
  'Raleway',
  'Space Grotesk',
  // Funky/Decorative Fonts
  'Bangers',
  'Creepster',
  'Lobster',
  'Monoton',
  'Piedra',
  'Pacifico',
  'Spicy Rice'
]

export function SettingsForm({ 
  settingsRowId, 
  initialFieldConfig, 
  initialSectors,
  initialCosmeticSettings 
}: SettingsFormProps) {
  const supabase = createClient()
  const [rowId, setRowId] = useState<string | null>(settingsRowId)
  const [activeTab, setActiveTab] = useState<'config' | 'tags' | 'appearance'>('config')
  
  const [fieldConfig, setFieldConfig] = useState<Record<string, FieldConfig>>(() =>
    mergeFieldSchema(initialFieldConfig)
  )
  const [sectors, setSectors] = useState<string[]>(initialSectors)
  const [cosmetic, setCosmetic] = useState<any>(initialCosmeticSettings || {
    colors: { accent: '#B8460A', accentLight: '#FDF0EA', bg: '#F5F2EB', text: '#1C1A16', border: '#DAD6CC', white: '#FDFCF9' },
    fonts: { 
      heading: { family: 'DM Serif Display', size: '28px', weight: '400', style: 'normal' },
      section: { family: 'DM Serif Display', size: '16px', weight: '400', style: 'normal' },
      body: { family: 'DM Sans', size: '14px', weight: '400', style: 'normal' }
    },
    borderRadius: '12px'
  })

  // Ensure default/legacy structure is resolved 
  useEffect(() => {
    if (cosmetic.fonts) {
      let updated = false
      const newFonts = { ...cosmetic.fonts }

      // Handle old flat strings
      if (typeof newFonts.heading === 'string') {
        newFonts.heading = { family: newFonts.heading, size: cosmetic.fonts.headingSize || '28px', weight: '400', style: 'normal' }
        updated = true
      }
      if (typeof newFonts.section === 'string') {
        newFonts.section = { family: newFonts.section, size: '16px', weight: '400', style: 'normal' }
        updated = true
      }
      if (typeof newFonts.body === 'string') {
        newFonts.body = { family: newFonts.body, size: cosmetic.fonts.bodySize || '14px', weight: '400', style: 'normal' }
        updated = true
      }

      // Ensure keys exist within objects
      const categories = ['heading', 'section', 'body']
      categories.forEach(cat => {
        if (!newFonts[cat].weight) { newFonts[cat].weight = '400'; updated = true }
        if (!newFonts[cat].style) { newFonts[cat].style = 'normal'; updated = true }
        if (!newFonts[cat].size) { 
           newFonts[cat].size = cat === 'heading' ? '28px' : cat === 'section' ? '16px' : '14px'; 
           updated = true 
        }
      })

      if (updated) {
        setCosmetic({ ...cosmetic, fonts: newFonts })
      }
    }
  }, [cosmetic])

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
       // Insert if not exists (simplified for concise code)
       const { data, error } = await supabase.from('site_config').insert({ ...payload, site_name: 'GrantsIndia' }).select('id').single()
       if (error) { showToast(error.message, false); setSaving(false); return }
       id = data.id; setRowId(id)
    }
    const { error } = await supabase.from('site_config').update(payload).eq('id', id)
    setSaving(false)
    if (error) showToast(formatSiteConfigError(error), false)
    else {
      showToast(`${label} saved.`)
      // Automatic revalidation of main pages since theme affects everything
      await Promise.allSettled([
        revalidateAdminPath('/'),
        revalidateAdminPath('/programs')
      ])
      // Force reload to apply theme variables globally if needed
      window.location.reload()
    }
  }

  const addSector = () => {
    if (newSector.trim() && !sectors.includes(newSector.trim())) {
      setSectors([...sectors, newSector.trim()])
      setNewSector('')
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
        fontFamily: 'var(--font-section), var(--font-sans), sans-serif'
      }}
    >
      {label}
    </button>
  )

  const sectionHead = (title: string) => (
    <p style={{ fontFamily: 'var(--font-sans), sans-serif', fontSize: '11px', fontWeight: 600, color: 'var(--ink)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '16px' }}>{title}</p>
  )

  const colorInput = (label: string, section: 'colors', key: string) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, minWidth: '140px' }}>
      <label style={{ fontSize: '12px', color: 'var(--ink-2)', fontFamily: 'var(--font-sans)' }}>{label}</label>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <input 
          type="color" 
          value={cosmetic.colors[key]} 
          onChange={(e) => setCosmetic({ ...cosmetic, colors: { ...cosmetic.colors, [key]: e.target.value } })}
          style={{ width: '36px', height: '36px', border: '1px solid var(--cream-border)', borderRadius: '6px', padding: '2px', cursor: 'pointer' }}
        />
        <input 
          type="text" 
          value={cosmetic.colors[key]} 
          onChange={(e) => setCosmetic({ ...cosmetic, colors: { ...cosmetic.colors, [key]: e.target.value } })}
          style={{ width: '80px', fontFamily: 'monospace', fontSize: '12px', border: '1px solid var(--cream-border)', borderRadius: '6px', padding: '8px' }}
        />
      </div>
    </div>
  )

  const FontControlGroup = ({ label, group, min, max, help }: { label: string, group: 'heading' | 'section' | 'body', min: number, max: number, help?: string }) => {
    const data = cosmetic.fonts[group] || { family: 'DM Sans', size: '14px', weight: '400', style: 'normal' }
    
    const update = (key: string, val: any) => {
      setCosmetic({
        ...cosmetic,
        fonts: {
          ...cosmetic.fonts,
          [group]: { ...data, [key]: val }
        }
      })
    }

    return (
      <div style={{ background: 'var(--cream)', padding: '16px', borderRadius: '10px', border: '1px solid var(--cream-border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <label style={{ fontSize: '11px', color: 'var(--ink)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</label>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button 
              onClick={() => update('weight', data.weight === '700' ? '400' : '700')}
              style={{ width: '28px', height: '28px', borderRadius: '4px', border: '1px solid var(--cream-border)', background: data.weight === '700' ? 'var(--ink)' : 'var(--white)', color: data.weight === '700' ? 'var(--white)' : 'var(--ink)', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
              title="Toggle Bold"
            >B</button>
            <button 
              onClick={() => update('style', data.style === 'italic' ? 'normal' : 'italic')}
              style={{ width: '28px', height: '28px', borderRadius: '4px', border: '1px solid var(--cream-border)', background: data.style === 'italic' ? 'var(--ink)' : 'var(--white)', color: data.style === 'italic' ? 'var(--white)' : 'var(--ink)', fontSize: '12px', fontStyle: 'italic', cursor: 'pointer' }}
              title="Toggle Italic"
            >I</button>
          </div>
        </div>
        
        <select 
          value={data.family}
          onChange={(e) => update('family', e.target.value)}
          style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--cream-border)', fontSize: '13px', background: 'var(--white)', marginBottom: '16px', outline: 'none' }}
        >
          {GOOGLE_FONTS_CURATED.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--ink-3)', marginBottom: '6px' }}>
          <span>Size</span>
          <span style={{ fontWeight: 600 }}>{data.size}</span>
        </div>
        <input 
          type="range" min={min} max={max} step="1"
          value={parseInt(data.size)}
          onChange={(e) => update('size', `${e.target.value}px`)}
          style={{ width: '100%', accentColor: 'var(--accent)', cursor: 'pointer' }}
        />
        {help && <p style={{ fontSize: '10px', color: 'var(--ink-4)', fontStyle: 'italic', marginTop: '8px' }}>{help}</p>}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Font pre-loading for the Live Preview */}
      {activeTab === 'appearance' && (
        <link
          key={`preview-font-${cosmetic.fonts.heading.family}-${cosmetic.fonts.body.family}-${cosmetic.fonts.section.family}`}
          rel="stylesheet"
          href={`https://fonts.googleapis.com/css2?family=${cosmetic.fonts.heading.family.replace(/ /g, '+')}:ital,wght@0,400;0,700;1,400&family=${cosmetic.fonts.body.family.replace(/ /g, '+')}:ital,wght@0,400;0,700;1,400&family=${cosmetic.fonts.section.family.replace(/ /g, '+')}:ital,wght@0,400;0,700;1,400&display=swap`}
        />
      )}

      {toast && (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', background: toast.ok ? '#1E6E2E' : '#B01F1F', color: '#fff', fontFamily: 'var(--font-sans), sans-serif', fontSize: '13px', padding: '12px 20px', borderRadius: '8px', zIndex: 200, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} role="status">
          {toast.msg}
        </div>
      )}

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid var(--cream-border)', marginBottom: '4px' }}>
        <TabButton id="config" label="Form Fields" />
        <TabButton id="tags" label="Sector Tags" />
        <TabButton id="appearance" label="Appearance" />
      </div>

      {/* Tab Content: CONFIG */}
      {activeTab === 'config' && (
        <div style={{ background: 'var(--white)', border: '1px solid var(--cream-border)', borderRadius: '12px', padding: '24px' }}>
          {sectionHead('Field schema editor')}
          <p style={{ fontFamily: 'var(--font-sans), sans-serif', fontSize: '12.5px', color: 'var(--ink-3)', marginBottom: '16px' }}>
            Control which fields appear in the program creation forms.
          </p>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--cream)' }}>
                {['Field', 'Required', 'Optional', 'Hidden'].map((h) => (
                  <th key={h} style={{ fontFamily: 'var(--font-sans), sans-serif', fontSize: '10px', fontWeight: 600, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.07em', padding: '10px 12px', textAlign: h === 'Field' ? 'left' : 'center' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PROGRAM_FORM_FIELDS.map((f) => (
                <tr key={f.key} style={{ borderTop: '1px solid var(--cream-border)' }}>
                  <td style={{ padding: '12px', fontFamily: 'var(--font-sans), sans-serif', fontSize: '13px', color: 'var(--ink)' }}>{f.label}</td>
                  {(['required', 'optional', 'hidden'] as const).map((opt) => (
                    <td key={opt} style={{ padding: '12px', textAlign: 'center' }}>
                      <input type="radio" name={f.key} checked={fieldConfig[f.key] === opt} onChange={() => setFieldConfig({ ...fieldConfig, [f.key]: opt })} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ marginTop: '24px' }}>
            <button onClick={() => saveSettings({ field_schema: fieldConfig }, 'Fields')} disabled={saving} style={{ fontFamily: 'var(--font-sans), sans-serif', fontSize: '13px', fontWeight: 500, color: 'var(--white)', background: 'var(--ink)', border: 'none', borderRadius: '8px', padding: '10px 24px', cursor: 'pointer' }}>
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </div>
      )}

      {/* Tab Content: TAGS */}
      {activeTab === 'tags' && (
        <div style={{ background: 'var(--white)', border: '1px solid var(--cream-border)', borderRadius: '12px', padding: '24px' }}>
          {sectionHead('Sector tags manager')}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
            {sectors.map((s) => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--font-sans), sans-serif', fontSize: '12px', background: 'var(--cream)', border: '1px solid var(--cream-border)', borderRadius: '20px', padding: '5px 14px' }}>
                {s}
                <button onClick={() => setSectors(sectors.filter((x) => x !== s))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-4)', fontSize: '14px', padding: '0 0 0 6px', lineHeight: 1 }}>×</button>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
            <input type="text" value={newSector} onChange={(e) => setNewSector(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSector() } }}
              placeholder="Type a new tag..." style={{ fontFamily: 'var(--font-sans), sans-serif', fontSize: '13px', border: '1px solid var(--cream-border)', borderRadius: '8px', padding: '10px 14px', flex: 1, outline: 'none', background: 'var(--white)' }} />
            <button onClick={addSector} style={{ fontFamily: 'var(--font-sans), sans-serif', fontSize: '13px', color: 'var(--ink)', background: 'var(--cream)', border: '1px solid var(--cream-border)', borderRadius: '8px', padding: '10px 20px', cursor: 'pointer' }}>Add Tag</button>
          </div>
          <button onClick={() => saveSettings({ sectors }, 'Sectors')} disabled={saving} style={{ fontFamily: 'var(--font-sans), sans-serif', fontSize: '13px', fontWeight: 500, color: 'var(--white)', background: 'var(--ink)', border: 'none', borderRadius: '8px', padding: '10px 24px', cursor: 'pointer' }}>
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      )}

      {/* Tab Content: APPEARANCE */}
      {activeTab === 'appearance' && (
        <div style={{ background: 'var(--white)', border: '1px solid var(--cream-border)', borderRadius: '12px', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '24px' }}>
            {sectionHead('App Appearance')}
            <button onClick={() => saveSettings({ cosmetic_settings: cosmetic }, 'Cosmetic branding')} disabled={saving} style={{ fontFamily: 'var(--font-sans), sans-serif', fontSize: '13px', fontWeight: 500, color: 'var(--white)', background: 'var(--ink)', border: 'none', borderRadius: '8px', padding: '10px 24px', cursor: 'pointer' }}>
              {saving ? 'Saving…' : 'Save Appearance'}
            </button>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '48px' }}>
            {/* Controls */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
              {/* Colors */}
              <div>
                <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--ink)', marginBottom: '16px' }}>Brand Colors</p>
                <div style={{ gridTemplateColumns: 'repeat(2, 1fr)', display: 'grid', gap: '16px' }}>
                  {colorInput('Accent (Primary)', 'colors', 'accent')}
                  {colorInput('Accent Light', 'colors', 'accentLight')}
                  {colorInput('Background', 'colors', 'bg')}
                  {colorInput('Main Text (Ink)', 'colors', 'text')}
                  {colorInput('Borders', 'colors', 'border')}
                  {colorInput('Card Background', 'colors', 'white')}
                </div>
              </div>

              {/* Typography */}
              <div>
                <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--ink)', marginBottom: '4px' }}>Typography</p>
                <p style={{ fontSize: '12px', color: 'var(--ink-3)', marginBottom: '16px' }}>Detailed font settings for each app section.</p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <FontControlGroup 
                    label="Main Page Titles (H1)" 
                    group="heading" min={20} max={64} 
                    help="Applies to the large title on the program detail page." 
                  />
                  <FontControlGroup 
                    label="Secondary Headers (Cards & Footer)" 
                    group="section" min={12} max={32} 
                    help="Applies to card titles and section headers like 'About the program'." 
                  />
                  <FontControlGroup 
                    label="Body Text & UI" 
                    group="body" min={11} max={18} 
                    help="General description text and navigational links."
                  />
                </div>
              </div>

              {/* General Style */}
              <div>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)', marginBottom: '16px' }}>Layout Roundness</p>
                  <div style={{ background: 'var(--cream)', padding: '16px', borderRadius: '10px', border: '1px solid var(--cream-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--ink-2)', marginBottom: '8px' }}>
                      <span>Corner Radius</span>
                      <span style={{ fontWeight: 600 }}>{cosmetic.borderRadius}</span>
                    </div>
                    <input 
                      type="range" min="0" max="24" step="2"
                      value={parseInt(cosmetic.borderRadius)}
                      onChange={(e) => setCosmetic({ ...cosmetic, borderRadius: `${e.target.value}px` })}
                      style={{ width: '100%', accentColor: 'var(--accent)' }}
                    />
                  </div>
              </div>
            </div>

            {/* Preview Section */}
            <div>
              <div style={{ position: 'sticky', top: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <h3 className="font-semibold text-lg" style={{ color: 'var(--ink)' }}>Live Preview</h3>
                  <div style={{ fontSize: '12px', color: 'var(--ink-3)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }}></div>
                    Real-time Sync
                  </div>
                </div>

                {/* THEME PREVIEW WRAPPER */}
                <div 
                  className="preview-theme-container"
                  style={{
                    '--font-serif': `"${cosmetic.fonts.heading.family}", serif`,
                    '--font-sans': `"${cosmetic.fonts.body.family}", sans-serif`,
                    '--font-section': `"${cosmetic.fonts.section.family}", sans-serif`,
                    '--font-size-heading': cosmetic.fonts.heading.size,
                    '--font-weight-heading': cosmetic.fonts.heading.weight,
                    '--font-style-heading': cosmetic.fonts.heading.style,
                    '--font-size-section': cosmetic.fonts.section.size,
                    '--font-weight-section': cosmetic.fonts.section.weight,
                    '--font-style-section': cosmetic.fonts.section.style,
                    '--font-size-body': cosmetic.fonts.body.size,
                    '--font-weight-body': cosmetic.fonts.body.weight,
                    '--font-style-body': cosmetic.fonts.body.style,
                    '--ink': cosmetic.colors.text,
                    '--ink-border': cosmetic.colors.border,
                    '--white': cosmetic.colors.white,
                    '--accent': cosmetic.colors.accent,
                    '--radius-lg': cosmetic.borderRadius
                  } as any}
                >
                  {/* List View Card */}
                  <div style={{ 
                    padding: '24px', 
                    background: 'var(--white)', 
                    borderRadius: 'var(--radius-lg)', 
                    border: '1px solid var(--ink-border)', 
                    marginBottom: '20px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
                  }}>
                    <p style={{ fontSize: '10px', color: 'var(--ink-4)', marginBottom: '4px', fontWeight: 600, fontFamily: 'var(--font-sans)', textTransform: 'uppercase' }}>VILLGRO INNOVATIONS FOUNDATION</p>
                    <h3 style={{ 
                      fontFamily: 'var(--font-section)', 
                      fontSize: 'var(--font-size-section)', 
                      fontWeight: 'var(--font-weight-section)',
                      fontStyle: 'var(--font-style-section)',
                      margin: '0 0 8px', 
                      color: 'var(--ink)' 
                    }}>Villgro Social Innovation Grant 2026</h3>
                    <p style={{ 
                      fontFamily: 'var(--font-sans)', 
                      fontSize: 'var(--font-size-body)', 
                      fontWeight: 'var(--font-weight-body)',
                      fontStyle: 'var(--font-style-body)',
                      color: 'var(--ink)', 
                      lineHeight: 1.5, 
                      opacity: 0.8 
                    }}>
                      Supporting innovative startups in the fintech and sustainable energy sectors with seed...
                    </p>
                    <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                       <div style={{ display: 'flex', gap: '8px' }}>
                          <span style={{ fontSize: '10px', padding: '3px 9px', background: 'var(--accent)', color: '#fff', borderRadius: '4px', fontWeight: 600, fontFamily: 'var(--font-sans)' }}>GRANT</span>
                       </div>
                       <div style={{ textAlign: 'right' }}>
                          <div style={{ fontFamily: 'var(--font-section)', fontSize: '16px', fontWeight: 'var(--font-weight-section)', color: 'var(--ink)' }}>₹25L</div>
                          <div style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', color: 'var(--ink-4)' }}>Available</div>
                       </div>
                    </div>
                  </div>

                  {/* Detail Section */}
                  <div style={{ padding: '24px', background: 'var(--white)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--ink-border)' }}>
                    <h1 style={{ 
                      fontFamily: 'var(--font-section)', 
                      fontSize: 'var(--font-size-heading)', 
                      fontWeight: 'var(--font-weight-heading)',
                      fontStyle: 'var(--font-style-heading)',
                      margin: '0 0 16px', 
                      color: 'var(--ink)', 
                      borderBottom: '1px solid var(--ink-border)', 
                      paddingBottom: '8px' 
                    }}>Program Page Title</h1>
                    <h2 style={{ 
                      fontFamily: 'var(--font-section)', 
                      fontSize: 'calc(var(--font-size-heading) * 0.7)', 
                      fontWeight: 'var(--font-weight-section)',
                      fontStyle: 'var(--font-style-section)',
                      margin: '0 0 12px', 
                      color: 'var(--ink)' 
                    }}>About the program</h2>
                    <p style={{ 
                      fontFamily: 'var(--font-sans)', 
                      fontSize: 'var(--font-size-body)', 
                      fontWeight: 'var(--font-weight-body)',
                      fontStyle: 'var(--font-style-body)',
                      color: 'var(--ink)', 
                      lineHeight: 1.6 
                    }}>
                      This program targets social entrepreneurs working on healthcare technology.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
