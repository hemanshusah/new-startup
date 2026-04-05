'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Program } from '@/types/program'

// ── Constants ────────────────────────────────────────────────────

const INDIAN_STATES = [
  'Pan India', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
  'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland',
  'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Chandigarh', 'Puducherry',
  'Andaman & Nicobar Islands', 'Dadra & Nagar Haveli and Daman & Diu', 'Lakshadweep',
]

const PREDEFINED_SECTORS = [
  'AgriTech', 'AI / ML', 'CleanTech', 'Climate Tech', 'Deep Tech', 'EdTech',
  'Fintech', 'HealthTech', 'HRTech', 'IoT', 'LegalTech', 'Logistics', 'Manufacturing',
  'Media & Entertainment', 'MedTech', 'PropTech', 'RetailTech', 'SaaS', 'SpaceTech',
  'Sustainability', 'WaterTech', 'Women-led',
]

function toSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 120)
}

// ── Sub-components ───────────────────────────────────────────────

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '12.5px', fontWeight: 500, color: 'var(--ink)', display: 'block', marginBottom: '6px' }}>
      {children}{required && <span style={{ color: '#E03E2D', marginLeft: '3px' }}>*</span>}
    </label>
  )
}

function FieldWrap({ children, error }: { children: React.ReactNode; error?: string }) {
  return (
    <div style={{ marginBottom: '18px' }}>
      {children}
      {error && <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '11.5px', color: '#E03E2D', marginTop: '4px' }}>{error}</p>}
    </div>
  )
}

const inputStyle = (hasError?: boolean): React.CSSProperties => ({
  fontFamily: 'DM Sans, sans-serif',
  fontSize: '13px',
  width: '100%',
  border: `1px solid ${hasError ? '#E03E2D' : 'var(--cream-border)'}`,
  borderRadius: '7px',
  padding: '9px 12px',
  outline: 'none',
  background: 'var(--white)',
  boxSizing: 'border-box',
})

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        style={{
          width: '40px', height: '22px', borderRadius: '11px',
          background: checked ? 'var(--ink)' : 'var(--cream-border)',
          border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s ease', flexShrink: 0,
        }}
      >
        <span style={{
          position: 'absolute', top: '3px', left: checked ? '20px' : '3px',
          width: '16px', height: '16px', borderRadius: '50%',
          background: 'var(--white)', transition: 'left 0.2s ease',
        }} />
      </button>
      {label && <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '13px', color: 'var(--ink-2)' }}>{label}</span>}
    </div>
  )
}

function ListEditor({ value, onChange, placeholder }: { value: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  const [input, setInput] = useState('')
  const add = () => {
    if (input.trim()) { onChange([...value, input.trim()]); setInput('') }
  }
  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i))

  return (
    <div>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add() } }}
          placeholder={placeholder ?? 'Add item…'}
          style={{ ...inputStyle(), flex: 1 }}
        />
        <button type="button" onClick={add} style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '12.5px', color: 'var(--ink)', background: 'var(--cream)', border: '1px solid var(--cream-border)', borderRadius: '7px', padding: '8px 14px', cursor: 'pointer' }}>
          Add
        </button>
      </div>
      <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {value.map((item, i) => (
          <li key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--cream)', borderRadius: '6px', padding: '7px 12px' }}>
            <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '12.5px', color: 'var(--ink)' }}>{item}</span>
            <button type="button" onClick={() => remove(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-4)', fontSize: '14px' }}>×</button>
          </li>
        ))}
      </ul>
    </div>
  )
}

function SectionHeader({ title, open, onToggle, always }: { title: string; open: boolean; onToggle?: () => void; always?: boolean }) {
  return (
    <div
      onClick={always ? undefined : onToggle}
      style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '14px 0', borderBottom: '1px solid var(--cream-border)', cursor: always ? 'default' : 'pointer',
        marginBottom: '20px',
      }}
    >
      <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '12px', fontWeight: 600, color: 'var(--ink)', textTransform: 'uppercase', letterSpacing: '0.07em', margin: 0 }}>{title}</p>
      {!always && <span style={{ color: 'var(--ink-4)', fontSize: '14px' }}>{open ? '▲' : '▼'}</span>}
    </div>
  )
}

// ── Main form ────────────────────────────────────────────────────

interface FormErrors { [key: string]: string }

interface ProgramFormProps {
  program?: Program
  mode: 'create' | 'edit'
}

export function ProgramForm({ program, mode }: ProgramFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)
  const [errors, setErrors] = useState<FormErrors>({})
  const [saving, setSaving] = useState(false)
  const slugManuallyEdited = useRef(!!program?.slug)
  const [showDelete, setShowDelete] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [sectionC, setSectionC] = useState(false)
  const [sectionD, setSectionD] = useState(false)

  // Form state
  const [title, setTitle] = useState(program?.title ?? '')
  const [slug, setSlug] = useState(program?.slug ?? '')
  const [organisation, setOrganisation] = useState(program?.organisation ?? '')
  const [type, setType] = useState(program?.type ?? 'grant')
  const [status, setStatus] = useState(program?.status ?? 'active')
  const [isIndia, setIsIndia] = useState(program?.is_india ?? true)
  const [published, setPublished] = useState(program?.published ?? false)
  const [deadline, setDeadline] = useState(program?.deadline ?? '')
  const [amountMin, setAmountMin] = useState<string>(program?.amount_min?.toString() ?? '')
  const [amountMax, setAmountMax] = useState<string>(program?.amount_max?.toString() ?? '')
  const [amountDisplay, setAmountDisplay] = useState(program?.amount_display ?? '')
  const [equity, setEquity] = useState(program?.equity ?? '')
  const [mode2, setMode2] = useState(program?.mode ?? '')
  const [stage, setStage] = useState(program?.stage ?? '')
  const [duration, setDuration] = useState(program?.duration ?? '')
  const [cohortSize, setCohortSize] = useState(program?.cohort_size ?? '')
  const [state, setState] = useState(program?.state ?? '')
  const [sectors, setSectors] = useState<string[]>(program?.sectors ?? [])
  const [isFeatured, setIsFeatured] = useState(program?.is_featured ?? false)
  const [applyUrl, setApplyUrl] = useState(program?.apply_url ?? '')
  const [descriptionShort, setDescriptionShort] = useState(program?.description_short ?? '')
  const [about, setAbout] = useState(program?.about ?? '')
  const [whatYouGet, setWhatYouGet] = useState<string[]>(program?.what_you_get ?? [])
  const [eligibility, setEligibility] = useState<string[]>(program?.eligibility ?? [])
  const [howToApply, setHowToApply] = useState(program?.how_to_apply ?? '')

  // Auto-slug from title
  useEffect(() => {
    if (!slugManuallyEdited.current) {
      setSlug(toSlug(title))
    }
  }, [title])

  // Auto-save draft every 60s (localStorage)
  useEffect(() => {
    const id = setInterval(() => {
      localStorage.setItem(`program-draft-${program?.id ?? 'new'}`, JSON.stringify({ title, slug, organisation, deadline, descriptionShort }))
    }, 60000)
    return () => clearInterval(id)
  }, [title, slug, organisation, deadline, descriptionShort, program?.id])

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 4000)
  }

  // Keyboard shortcut: Cmd/Ctrl+S → Save draft
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') { e.preventDefault(); saveDraft() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  })

  const buildPayload = () => ({
    title: title.trim(),
    slug: slug.trim(),
    organisation: organisation.trim(),
    type,
    status,
    is_india: isIndia,
    published,
    deadline,
    amount_min: amountMin ? Number(amountMin) : null,
    amount_max: amountMax ? Number(amountMax) : null,
    amount_display: amountDisplay || null,
    equity: equity || null,
    mode: mode2 || null,
    stage: stage || null,
    duration: duration || null,
    cohort_size: cohortSize || null,
    state: isIndia ? (state || null) : null,
    sectors: sectors.length > 0 ? sectors : null,
    is_featured: isFeatured,
    apply_url: applyUrl || null,
    description_short: descriptionShort.trim() || null,
    about: about || null,
    what_you_get: whatYouGet.length > 0 ? whatYouGet : null,
    eligibility: eligibility.length > 0 ? eligibility : null,
    how_to_apply: howToApply || null,
  })

  const validate = (forPublish: boolean): FormErrors => {
    const errs: FormErrors = {}
    if (!title.trim()) errs.title = 'Title is required.'
    if (!slug.trim()) errs.slug = 'Slug is required.'
    if (!organisation.trim()) errs.organisation = 'Organisation is required.'
    if (!deadline) errs.deadline = 'Deadline is required.'
    if (forPublish && !descriptionShort.trim()) errs.descriptionShort = 'Short description is required to publish.'
    if (amountMin && amountMax && Number(amountMin) > Number(amountMax)) errs.amountMin = 'Min must be ≤ max.'
    return errs
  }

  const saveDraft = async () => {
    const errs = validate(false)
    setErrors(errs)
    if (Object.keys(errs).length > 0) return
    setSaving(true)
    const payload = buildPayload()
    const { error } = mode === 'create'
      ? await supabase.from('programs').insert(payload)
      : await supabase.from('programs').update(payload).eq('id', program!.id)
    setSaving(false)
    if (error) {
      showToast(error.message, false)
    } else {
      showToast('Draft saved.')
      if (mode === 'create') router.push('/admin/programs')
    }
  }

  const publish = async () => {
    const errs = validate(true)
    setErrors(errs)
    if (Object.keys(errs).length > 0) { showToast('Please fix the highlighted fields.', false); return }
    setSaving(true)
    const payload = { ...buildPayload(), published: true }
    const { error } = mode === 'create'
      ? await supabase.from('programs').insert(payload)
      : await supabase.from('programs').update(payload).eq('id', program!.id)
    setSaving(false)
    if (error) {
      showToast(error.message, false)
    } else {
      showToast('Program published successfully!')
      router.push('/admin/programs')
    }
  }

  const handleDelete = async () => {
    if (deleteConfirm !== title) return
    setSaving(true)
    const { error } = await supabase.from('programs').delete().eq('id', program!.id)
    setSaving(false)
    if (error) {
      showToast(error.message, false)
    } else {
      showToast('Program deleted.')
      router.push('/admin/programs')
    }
  }

  return (
    <form onSubmit={(e) => e.preventDefault()} noValidate>
      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', background: toast.ok ? '#1E6E2E' : '#B01F1F', color: '#fff', fontFamily: 'DM Sans, sans-serif', fontSize: '13px', padding: '12px 20px', borderRadius: '8px', zIndex: 200, boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }} role="status">
          {toast.msg}
        </div>
      )}

      {/* ── Section A: Core details ── */}
      <div style={sectionWrap}>
        <SectionHeader title="A — Core details" open always />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
          <FieldWrap error={errors.title}>
            <Label required>Title</Label>
            <input type="text" maxLength={200} value={title} onChange={(e) => setTitle(e.target.value)} style={inputStyle(!!errors.title)} placeholder="e.g. EMERGE Pre-Incubation Program 2026" />
          </FieldWrap>
          <FieldWrap error={errors.slug}>
            <Label required>Slug</Label>
            <input type="text" value={slug}
              onChange={(e) => { slugManuallyEdited.current = true; setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-')) }}
              style={inputStyle(!!errors.slug)} placeholder="auto-generated" />
          </FieldWrap>
          <FieldWrap error={errors.organisation}>
            <Label required>Organisation</Label>
            <input type="text" maxLength={150} value={organisation} onChange={(e) => setOrganisation(e.target.value)} style={inputStyle(!!errors.organisation)} />
          </FieldWrap>
          <FieldWrap>
            <Label required>Type</Label>
            <select value={type} onChange={(e) => setType(e.target.value as typeof type)} style={inputStyle()}>
              {['grant', 'incubation', 'accelerator', 'contest', 'funding', 'seed'].map((t) => (
                <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
              ))}
            </select>
          </FieldWrap>
          <FieldWrap>
            <Label required>Status</Label>
            <select value={status} onChange={(e) => setStatus(e.target.value as typeof status)} style={inputStyle()}>
              <option value="active">Active</option>
              <option value="closed">Closed</option>
              <option value="upcoming">Upcoming</option>
            </select>
          </FieldWrap>
          <FieldWrap>
            <Label required>Scope</Label>
            <div style={{ display: 'flex', gap: '12px' }}>
              {[{ label: 'National (India)', val: true }, { label: 'International', val: false }].map(({ label, val }) => (
                <button key={String(val)} type="button" onClick={() => setIsIndia(val)}
                  style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '13px', padding: '7px 16px', borderRadius: '7px', border: `1px solid ${isIndia === val ? 'var(--ink)' : 'var(--cream-border)'}`, background: isIndia === val ? 'var(--ink)' : 'var(--white)', color: isIndia === val ? 'var(--cream)' : 'var(--ink)', cursor: 'pointer' }}>
                  {label}
                </button>
              ))}
            </div>
          </FieldWrap>
          <FieldWrap>
            <Label required>Published</Label>
            <Toggle checked={published} onChange={setPublished} label={published ? 'Published' : 'Draft'} />
          </FieldWrap>
        </div>
      </div>

      {/* ── Section B: Dates & Funding ── */}
      <div style={sectionWrap}>
        <SectionHeader title="B — Dates & Funding" open always />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
          <FieldWrap error={errors.deadline}>
            <Label required>Application deadline</Label>
            <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} style={inputStyle(!!errors.deadline)} />
          </FieldWrap>
          <FieldWrap>
            <Label>Amount display string <span style={{ color: 'var(--ink-4)', fontWeight: 400 }}>(Optional)</span></Label>
            <input type="text" value={amountDisplay} onChange={(e) => setAmountDisplay(e.target.value)} style={inputStyle()} placeholder="e.g. ₹5Cr – ₹200Cr" />
          </FieldWrap>
          <FieldWrap error={errors.amountMin}>
            <Label>Amount min (₹) <span style={{ color: 'var(--ink-4)', fontWeight: 400 }}>(Optional)</span></Label>
            <input type="number" min="0" value={amountMin} onChange={(e) => setAmountMin(e.target.value)} style={inputStyle(!!errors.amountMin)} placeholder="0" />
          </FieldWrap>
          <FieldWrap>
            <Label>Amount max (₹) <span style={{ color: 'var(--ink-4)', fontWeight: 400 }}>(Optional)</span></Label>
            <input type="number" min="0" value={amountMax} onChange={(e) => setAmountMax(e.target.value)} style={inputStyle()} placeholder="0" />
          </FieldWrap>
          <FieldWrap>
            <Label>Equity <span style={{ color: 'var(--ink-4)', fontWeight: 400 }}>(Optional)</span></Label>
            <input type="text" maxLength={50} value={equity} onChange={(e) => setEquity(e.target.value)} style={inputStyle()} placeholder="e.g. Zero equity, 2–5%" />
          </FieldWrap>
        </div>
      </div>

      {/* ── Section C: Program details (collapsible) ── */}
      <div style={sectionWrap}>
        <SectionHeader title="C — Program details" open={sectionC} onToggle={() => setSectionC(!sectionC)} />
        {sectionC && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
            <FieldWrap>
              <Label>Mode <span style={{ color: 'var(--ink-4)', fontWeight: 400 }}>(Optional)</span></Label>
              <select value={mode2} onChange={(e) => setMode2(e.target.value)} style={inputStyle()}>
                <option value="">— Select —</option>
                <option>Virtual</option>
                <option>In-person</option>
                <option>Hybrid</option>
                <option>Online + In-person</option>
              </select>
            </FieldWrap>
            <FieldWrap>
              <Label>Stage <span style={{ color: 'var(--ink-4)', fontWeight: 400 }}>(Optional)</span></Label>
              <select value={stage} onChange={(e) => setStage(e.target.value)} style={inputStyle()}>
                <option value="">— Select —</option>
                <option>Ideation</option>
                <option>Prototype</option>
                <option>MVP</option>
                <option>Revenue Stage</option>
                <option>Any</option>
              </select>
            </FieldWrap>
            <FieldWrap>
              <Label>Duration <span style={{ color: 'var(--ink-4)', fontWeight: 400 }}>(Optional)</span></Label>
              <input type="text" maxLength={50} value={duration} onChange={(e) => setDuration(e.target.value)} style={inputStyle()} placeholder="e.g. ~3 months" />
            </FieldWrap>
            <FieldWrap>
              <Label>Cohort size <span style={{ color: 'var(--ink-4)', fontWeight: 400 }}>(Optional)</span></Label>
              <input type="text" maxLength={80} value={cohortSize} onChange={(e) => setCohortSize(e.target.value)} style={inputStyle()} placeholder="e.g. 30 startups" />
            </FieldWrap>
            {isIndia && (
              <FieldWrap>
                <Label>Indian state <span style={{ color: 'var(--ink-4)', fontWeight: 400 }}>(Optional)</span></Label>
                <select value={state} onChange={(e) => setState(e.target.value)} style={inputStyle()}>
                  <option value="">— All India —</option>
                  {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </FieldWrap>
            )}
            <FieldWrap>
              <Label>Apply URL <span style={{ color: 'var(--ink-4)', fontWeight: 400 }}>(Optional)</span></Label>
              <input type="url" value={applyUrl} onChange={(e) => setApplyUrl(e.target.value)} style={inputStyle()} placeholder="https://…" />
            </FieldWrap>
            <FieldWrap>
              <Label>Is featured</Label>
              <Toggle checked={isFeatured} onChange={setIsFeatured} label="Feature this program" />
            </FieldWrap>
            <div style={{ gridColumn: '1 / -1' }}>
              <FieldWrap>
                <Label>Focus sectors <span style={{ color: 'var(--ink-4)', fontWeight: 400 }}>(Optional)</span></Label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 8px', marginBottom: '10px' }}>
                  {PREDEFINED_SECTORS.map((s) => (
                    <button key={s} type="button"
                      onClick={() => setSectors(sectors.includes(s) ? sectors.filter((x) => x !== s) : [...sectors, s])}
                      style={{
                        fontFamily: 'DM Sans, sans-serif', fontSize: '11.5px', padding: '4px 12px',
                        borderRadius: '20px', border: '1px solid var(--cream-border)', cursor: 'pointer',
                        background: sectors.includes(s) ? 'var(--ink)' : 'var(--cream)',
                        color: sectors.includes(s) ? 'var(--cream)' : 'var(--ink)',
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </FieldWrap>
            </div>
          </div>
        )}
      </div>

      {/* ── Section D: Content (collapsible) ── */}
      <div style={sectionWrap}>
        <SectionHeader title="D — Content" open={sectionD} onToggle={() => setSectionD(!sectionD)} />
        {sectionD && (
          <>
            <FieldWrap error={errors.descriptionShort}>
              <Label>Short description <span style={{ color: 'var(--ink-4)', fontWeight: 400 }}>(max 300 chars — required to publish)</span></Label>
              <textarea
                rows={3} maxLength={300} value={descriptionShort}
                onChange={(e) => setDescriptionShort(e.target.value)}
                style={{ ...inputStyle(!!errors.descriptionShort), resize: 'vertical' }}
                placeholder="Used on listing cards (max 300 chars)"
              />
              <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '11px', color: 'var(--ink-4)' }}>{descriptionShort.length}/300</span>
            </FieldWrap>
            <FieldWrap>
              <Label>About the program <span style={{ color: 'var(--ink-4)', fontWeight: 400 }}>(Optional)</span></Label>
              <textarea rows={6} value={about} onChange={(e) => setAbout(e.target.value)} style={{ ...inputStyle(), resize: 'vertical' }} placeholder="2–5 paragraphs. Use blank lines to separate paragraphs." />
            </FieldWrap>
            <FieldWrap>
              <Label>What you get <span style={{ color: 'var(--ink-4)', fontWeight: 400 }}>(Optional)</span></Label>
              <ListEditor value={whatYouGet} onChange={setWhatYouGet} placeholder="Add a benefit…" />
            </FieldWrap>
            <FieldWrap>
              <Label>Eligibility criteria <span style={{ color: 'var(--ink-4)', fontWeight: 400 }}>(Optional)</span></Label>
              <ListEditor value={eligibility} onChange={setEligibility} placeholder="Add a criterion…" />
            </FieldWrap>
            <FieldWrap>
              <Label>How to apply <span style={{ color: 'var(--ink-4)', fontWeight: 400 }}>(Optional)</span></Label>
              <textarea rows={5} value={howToApply} onChange={(e) => setHowToApply(e.target.value)} style={{ ...inputStyle(), resize: 'vertical' }} placeholder="Steps to apply." />
            </FieldWrap>
          </>
        )}
      </div>

      {/* ── Action buttons ── */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', justifyContent: 'flex-end', paddingTop: '8px' }}>
        {mode === 'edit' && (
          <button type="button" onClick={() => window.open(`/programs/${program?.slug}?preview=true`, '_blank')}
            style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '13px', color: 'var(--ink-3)', background: 'none', border: '1px solid var(--cream-border)', borderRadius: '8px', padding: '9px 18px', cursor: 'pointer' }}>
            Preview ↗
          </button>
        )}
        <button type="button" onClick={saveDraft} disabled={saving}
          style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '13px', color: 'var(--ink)', background: 'var(--cream)', border: '1px solid var(--cream-border)', borderRadius: '8px', padding: '9px 18px', cursor: 'pointer' }}>
          {saving ? 'Saving…' : 'Save draft'}
        </button>
        <button type="button" onClick={publish} disabled={saving}
          style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '13px', fontWeight: 500, color: 'var(--cream)', background: 'var(--ink)', border: 'none', borderRadius: '8px', padding: '9px 22px', cursor: 'pointer' }}>
          {saving ? 'Publishing…' : 'Publish'}
        </button>
      </div>

      {/* ── Delete (edit mode only) ── */}
      {mode === 'edit' && (
        <div style={{ marginTop: '40px', borderTop: '1px solid var(--cream-border)', paddingTop: '24px' }}>
          {!showDelete ? (
            <button type="button" onClick={() => setShowDelete(true)}
              style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '13px', color: '#B01F1F', background: 'none', border: '1px solid #F0B8B8', borderRadius: '8px', padding: '8px 16px', cursor: 'pointer' }}>
              Delete program…
            </button>
          ) : (
            <div style={{ background: '#FFF5F5', border: '1px solid #F0B8B8', borderRadius: '10px', padding: '18px' }}>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '13.5px', color: '#B01F1F', marginBottom: '12px', fontWeight: 500 }}>
                Type the program title to confirm deletion: <strong>{title}</strong>
              </p>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input type="text" value={deleteConfirm} onChange={(e) => setDeleteConfirm(e.target.value)} placeholder="Type title here…" style={{ ...inputStyle(), flex: 1 }} />
                <button type="button" onClick={handleDelete} disabled={deleteConfirm !== title || saving}
                  style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '13px', color: '#fff', background: '#B01F1F', border: 'none', borderRadius: '7px', padding: '9px 18px', cursor: deleteConfirm !== title ? 'not-allowed' : 'pointer', opacity: deleteConfirm !== title ? 0.5 : 1 }}>
                  Delete permanently
                </button>
                <button type="button" onClick={() => { setShowDelete(false); setDeleteConfirm('') }}
                  style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '13px', color: 'var(--ink)', background: 'none', border: '1px solid var(--cream-border)', borderRadius: '7px', padding: '9px 14px', cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </form>
  )
}

// Shared section wrapper style
const sectionWrap: React.CSSProperties = {
  background: 'var(--white)',
  border: '1px solid var(--cream-border)',
  borderRadius: '12px',
  padding: '22px',
  marginBottom: '20px',
}
