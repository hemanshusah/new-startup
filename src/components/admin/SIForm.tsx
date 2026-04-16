'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { InlineSI } from '@/components/softinfra/InlineSI'
import { SidebarSI } from '@/components/softinfra/SidebarSI'
import { SoftInfraCard } from '@/components/softinfra/SICard'
import { SINewsletterCard } from '@/components/softinfra/SINewsletterCard'
import { uploadPublicImage } from '@/lib/supabase/storage'
import type { SoftInfra, SoftInfraFormat } from '@/types/softinfra'

const PLACEMENTS = ['listing-grid', 'detail-inline', 'detail-sidebar'] as const
const FORMATS: SoftInfraFormat[] = ['card-sm', 'card-dark', 'card-wide', 'inline', 'sidebar'] as const

interface SIFormProps {
  si?: SoftInfra
  mode: 'create' | 'edit'
}

export function SIForm({ si, mode }: SIFormProps) {
  const supabase = createClient()
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Fields
  const [advertiser, setAdvertiser] = useState(si?.advertiser ?? '')
  const [headline, setHeadline] = useState(si?.headline ?? '')
  const [subtext, setSubtext] = useState(si?.subtext ?? '')
  const [ctaText, setCtaText] = useState(si?.cta_text ?? '')
  const [ctaUrl, setCtaUrl] = useState(si?.cta_url ?? '')
  const [iconEmoji, setIconEmoji] = useState(si?.icon_emoji ?? '')
  const [imageUrl, setImageUrl] = useState(si?.image_url ?? '')
  const [format, setFormat] = useState<SoftInfraFormat>(si?.format ?? 'card-sm')
  const [placements, setPlacements] = useState<string[]>(si?.placement ?? [])
  const [slotIndex, setSlotIndex] = useState<string>(si?.slot_index?.toString() ?? '')
  const [priority, setPriority] = useState(si?.priority?.toString() ?? '50')
  const [startDate, setStartDate] = useState(si?.start_date ?? '')
  const [endDate, setEndDate] = useState(si?.end_date ?? '')
  const [isActive, setIsActive] = useState(si?.is_active ?? true)
  const [isImageOnly, setIsImageOnly] = useState(si?.is_image_only ?? false)

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 4000)
  }

  const validate = (): Record<string, string> => {
    const e: Record<string, string> = {}
    if (!advertiser.trim()) e.advertiser = 'Required.'
    if (!isImageOnly) {
      if (!headline.trim()) e.headline = 'Required.'
      if (!subtext.trim()) e.subtext = 'Required.'
      if (!ctaText.trim()) e.ctaText = 'Required.'
    }
    if (!ctaUrl.trim()) e.ctaUrl = 'Required.'
    if (isImageOnly && !imageUrl) e.imageUrl = 'Image is required for Image Only mode.'
    if (placements.length === 0) e.placements = 'At least one placement is required.'
    return e
  }

  const buildPayload = () => ({
    advertiser: advertiser.trim(),
    headline: headline.trim(),
    subtext: subtext.trim(),
    cta_text: ctaText.trim(),
    cta_url: ctaUrl.trim(),
    icon_emoji: iconEmoji || null,
    image_url: imageUrl || null,
    format,
    placement: placements,
    slot_index: slotIndex ? Number(slotIndex) : null,
    priority: Number(priority),
    start_date: startDate || null,
    end_date: endDate || null,
    is_active: isActive,
    is_image_only: isImageOnly,
  })

  const save = async () => {
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length > 0) return
    setSaving(true)
    const payload = buildPayload()
    const { error } = mode === 'create'
      ? await supabase.from('softinfra').insert(payload)
      : await supabase.from('softinfra').update(payload).eq('id', si!.id)
    setSaving(false)
    if (error) { showToast(error.message, false) }
    else { showToast(mode === 'create' ? 'Created!' : 'Updated!'); router.push('/admin/softinfra') }
  }

  // Live preview si object
  const previewSI: SoftInfra = {
    id: 'preview',
    advertiser, headline, subtext, cta_text: ctaText, cta_url: ctaUrl,
    icon_emoji: iconEmoji || null, image_url: imageUrl || null, format,
    placement: placements as never, slot_index: slotIndex ? Number(slotIndex) : null,
    priority: Number(priority), is_active: isActive, is_image_only: isImageOnly,
    start_date: startDate || null, end_date: endDate || null,
    click_count: 0, impression_count: 0, unique_view_count: 0, created_at: '',
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadPublicImage('softinfra', file)
      setImageUrl(url)
      showToast('Image uploaded successfully!')
    } catch (err: any) {
      console.error('Upload Error Details:', err)
      const msg = err.message === 'Bucket not found' 
        ? 'Error: "softinfra" storage bucket not found. Please create it in Supabase dashboard.' 
        : (err.message || 'Upload failed')
      showToast(msg, false)
    } finally {
      setUploading(false)
    }
  }

  const inputSt: React.CSSProperties = { fontFamily: 'var(--font-sans), sans-serif', fontSize: '13px', width: '100%', border: '1px solid var(--cream-border)', borderRadius: '7px', padding: '9px 12px', outline: 'none', background: 'var(--white)', boxSizing: 'border-box' }
  const hasErr = (k: string) => !!errors[k]
  const iFull = (k: string) => ({ ...inputSt, border: `1px solid ${hasErr(k) ? '#E03E2D' : 'var(--cream-border)'}` })

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '28px', alignItems: 'flex-start' }}>
      {/* Form */}
      <div>
        {toast && (
          <div style={{ position: 'fixed', bottom: '24px', right: '24px', background: toast.ok ? '#1E6E2E' : '#B01F1F', color: '#fff', fontFamily: 'var(--font-sans), sans-serif', fontSize: '13px', padding: '12px 20px', borderRadius: '8px', zIndex: 200 }} role="status">
            {toast.msg}
          </div>
        )}
        <div style={{ background: 'var(--white)', border: '1px solid var(--cream-border)', borderRadius: '12px', padding: '22px' }}>
          {[
            { label: 'Advertiser name', key: 'advertiser', val: advertiser, set: setAdvertiser, max: 80, req: true },
          ].map(({ label, key, val, set, max, req }) => (
            <div key={key} style={{ marginBottom: '16px' }}>
              <label style={{ fontFamily: 'var(--font-sans), sans-serif', fontSize: '12.5px', fontWeight: 500, color: 'var(--ink)', display: 'block', marginBottom: '5px' }}>{label}{req && <span style={{ color: '#E03E2D', marginLeft: '3px' }}>*</span>}</label>
              <input type="text" maxLength={max} value={val} onChange={(e) => set(e.target.value)} style={iFull(key)} />
              {errors[key] && <p style={{ fontFamily: 'var(--font-sans), sans-serif', fontSize: '11px', color: '#E03E2D', marginTop: '4px' }}>{errors[key]}</p>}
            </div>
          ))}

          {/* Headline */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontFamily: 'var(--font-sans), sans-serif', fontSize: '12.5px', fontWeight: 500, color: 'var(--ink)', display: 'block', marginBottom: '5px' }}>Headline <span style={{ color: '#E03E2D' }}>*</span></label>
            <input type="text" maxLength={60} value={headline} onChange={(e) => setHeadline(e.target.value)} style={iFull('headline')} placeholder="Max 60 chars" />
            <span style={{ fontFamily: 'var(--font-sans), sans-serif', fontSize: '11px', color: 'var(--ink-4)' }}>{headline.length}/60</span>
            {errors.headline && <p style={{ fontFamily: 'var(--font-sans), sans-serif', fontSize: '11px', color: '#E03E2D', marginTop: '4px' }}>{errors.headline}</p>}
          </div>

          {/* Subtext */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontFamily: 'var(--font-sans), sans-serif', fontSize: '12.5px', fontWeight: 500, color: 'var(--ink)', display: 'block', marginBottom: '5px' }}>Subtext <span style={{ color: '#E03E2D' }}>*</span></label>
            <textarea rows={2} maxLength={120} value={subtext} onChange={(e) => setSubtext(e.target.value)} style={{ ...iFull('subtext'), resize: 'vertical' }} placeholder="Max 120 chars" />
            <span style={{ fontFamily: 'var(--font-sans), sans-serif', fontSize: '11px', color: 'var(--ink-4)' }}>{subtext.length}/120</span>
          </div>

          {/* CTA */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 20px', marginBottom: '16px' }}>
            <div>
              <label style={{ fontFamily: 'var(--font-sans), sans-serif', fontSize: '12.5px', fontWeight: 500, color: 'var(--ink)', display: 'block', marginBottom: '5px' }}>CTA text <span style={{ color: '#E03E2D' }}>*</span></label>
              <input type="text" maxLength={40} value={ctaText} onChange={(e) => setCtaText(e.target.value)} style={iFull('ctaText')} placeholder="e.g. Claim free credits" />
            </div>
            <div>
              <label style={{ fontFamily: 'var(--font-sans), sans-serif', fontSize: '12.5px', fontWeight: 500, color: 'var(--ink)', display: 'block', marginBottom: '5px' }}>CTA URL <span style={{ color: '#E03E2D' }}>*</span></label>
              <input type="url" value={ctaUrl} onChange={(e) => setCtaUrl(e.target.value)} style={iFull('ctaUrl')} placeholder="https://…" />
            </div>
          </div>

          {/* Icon / Image / Image Only Toggle */}
          <div style={{ padding: '20px', background: 'var(--cream-bg)', borderRadius: '12px', marginBottom: '24px', border: '2px solid var(--cream-border)', boxShadow: isImageOnly ? '0 0 0 2px var(--accent)' : 'none', transition: 'all 0.2s ease' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', marginBottom: '20px' }}>
              <div 
                onClick={() => setIsImageOnly(!isImageOnly)}
                style={{ 
                  width: '44px', 
                  height: '24px', 
                  borderRadius: '12px', 
                  background: isImageOnly ? 'var(--accent)' : 'var(--cream-border)', 
                  position: 'relative', 
                  transition: 'background 0.2s ease' 
                }}
              >
                <div style={{ position: 'absolute', top: '3px', left: isImageOnly ? '23px' : '3px', width: '18px', height: '18px', borderRadius: '50%', background: 'var(--white)', transition: 'left 0.2s ease' }} />
              </div>
              <div>
                <span style={{ fontFamily: 'var(--font-sans), sans-serif', fontSize: '14px', fontWeight: 600, color: 'var(--ink)', display: 'block' }}>Display Ad Mode (Image Only)</span>
                <span style={{ fontFamily: 'var(--font-sans), sans-serif', fontSize: '12px', color: 'var(--ink-3)' }}>The entire card will be replaced by your uploaded image. No text will be shown.</span>
              </div>
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 24px' }}>
              <div>
                <label style={{ fontFamily: 'var(--font-sans), sans-serif', fontSize: '12.5px', fontWeight: 500, color: 'var(--ink)', display: 'block', marginBottom: '5px' }}>Icon emoji <span style={{ color: 'var(--ink-4)', fontWeight: 400 }}>(Optional)</span></label>
                <input type="text" value={iconEmoji} onChange={(e) => setIconEmoji(e.target.value)} style={inputSt} placeholder="Single emoji e.g. 📝" disabled={isImageOnly} />
              </div>
              <div>
                <label style={{ fontFamily: 'var(--font-sans), sans-serif', fontSize: '12.5px', fontWeight: 500, color: 'var(--ink)', display: 'block', marginBottom: '5px' }}>Upload Image</label>
                <input type="file" accept="image/*" onChange={handleFileUpload} style={{ ...inputSt, padding: '7px' }} disabled={uploading} />
                {uploading && <p style={{ fontFamily: 'var(--font-sans), sans-serif', fontSize: '11px', color: 'var(--ink-4)', marginTop: '4px' }}>Uploading...</p>}
                {imageUrl && !uploading && <p style={{ fontFamily: 'var(--font-sans), sans-serif', fontSize: '11px', color: '#1E6E2E', marginTop: '4px' }}>✓ Image ready</p>}
                
                {/* Dimensional Guidance */}
                <p style={{ fontFamily: 'var(--font-sans), sans-serif', fontSize: '11px', color: 'var(--accent)', marginTop: '8px', fontWeight: 500 }}>
                  Recommended: {
                    format === 'card-sm' ? '400 × 280 px' :
                    format === 'card-dark' || format === 'card-wide' ? '800 × 280 px' :
                    format === 'inline' ? '1200 × 140 px' :
                    format === 'sidebar' ? '300 × 250 px' : 'Original size'
                  }
                </p>
              </div>
            </div>
            <div style={{ marginTop: '16px' }}>
                <label style={{ fontFamily: 'var(--font-sans), sans-serif', fontSize: '12.5px', fontWeight: 500, color: 'var(--ink)', display: 'block', marginBottom: '5px' }}>Image URL <span style={{ color: 'var(--ink-4)', fontWeight: 400 }}>(Manual Override)</span></label>
                <input type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} style={iFull('imageUrl')} placeholder="https://…" />
                {errors.imageUrl && <p style={{ fontFamily: 'var(--font-sans), sans-serif', fontSize: '11px', color: '#E03E2D', marginTop: '4px' }}>{errors.imageUrl}</p>}
            </div>
          </div>

          {/* Format */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontFamily: 'var(--font-sans), sans-serif', fontSize: '12.5px', fontWeight: 500, color: 'var(--ink)', display: 'block', marginBottom: '5px' }}>Format <span style={{ color: '#E03E2D' }}>*</span></label>
            <select value={format} onChange={(e) => setFormat(e.target.value as SoftInfraFormat)} style={inputSt}>
              {FORMATS.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>

          {/* Placements */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontFamily: 'var(--font-sans), sans-serif', fontSize: '12.5px', fontWeight: 500, color: 'var(--ink)', display: 'block', marginBottom: '8px' }}>Placements <span style={{ color: '#E03E2D' }}>*</span></label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {PLACEMENTS.map((p) => (
                <label key={p} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--font-sans), sans-serif', fontSize: '12.5px', color: 'var(--ink)', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={placements.includes(p)}
                    onChange={(e) => setPlacements(e.target.checked ? [...placements, p] : placements.filter((x) => x !== p))}
                  />
                  {p}
                </label>
              ))}
            </div>
            {errors.placements && <p style={{ fontFamily: 'var(--font-sans), sans-serif', fontSize: '11px', color: '#E03E2D', marginTop: '4px' }}>{errors.placements}</p>}
          </div>

          {/* Slot index / Priority / Dates */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px 20px', marginBottom: '16px' }}>
            <div>
              <label style={{ fontFamily: 'var(--font-sans), sans-serif', fontSize: '12.5px', fontWeight: 500, color: 'var(--ink)', display: 'block', marginBottom: '5px' }}>Slot index</label>
              <input type="number" min="1" value={slotIndex} onChange={(e) => setSlotIndex(e.target.value)} style={inputSt} placeholder="Auto" />
            </div>
            <div>
              <label style={{ fontFamily: 'var(--font-sans), sans-serif', fontSize: '12.5px', fontWeight: 500, color: 'var(--ink)', display: 'block', marginBottom: '5px' }}>Priority <span style={{ color: '#E03E2D' }}>*</span></label>
              <input type="number" min="1" max="100" value={priority} onChange={(e) => setPriority(e.target.value)} style={inputSt} />
            </div>
            <div>
              <label style={{ fontFamily: 'var(--font-sans), sans-serif', fontSize: '12.5px', fontWeight: 500, color: 'var(--ink)', display: 'block', marginBottom: '5px' }}>Start date</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={inputSt} />
            </div>
            <div>
              <label style={{ fontFamily: 'var(--font-sans), sans-serif', fontSize: '12.5px', fontWeight: 500, color: 'var(--ink)', display: 'block', marginBottom: '5px' }}>End date</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={inputSt} />
            </div>
          </div>

          {/* Is active */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <button type="button" onClick={() => setIsActive(!isActive)}
                style={{ width: '40px', height: '22px', borderRadius: '11px', background: isActive ? 'var(--ink)' : 'var(--cream-border)', border: 'none', cursor: 'pointer', position: 'relative', flexShrink: 0 }}>
                <span style={{ position: 'absolute', top: '3px', left: isActive ? '20px' : '3px', width: '16px', height: '16px', borderRadius: '50%', background: 'var(--white)', transition: 'left 0.2s ease' }} />
              </button>
              <span style={{ fontFamily: 'var(--font-sans), sans-serif', fontSize: '13px', color: 'var(--ink-2)' }}>{isActive ? 'Active' : 'Paused'}</span>
            </label>
          </div>

          {/* Save button */}
          <button type="button" onClick={save} disabled={saving}
            style={{ fontFamily: 'var(--font-sans), sans-serif', fontSize: '13px', fontWeight: 500, color: 'var(--cream)', background: 'var(--ink)', border: 'none', borderRadius: '8px', padding: '10px 24px', cursor: 'pointer' }}>
            {saving ? 'Saving…' : mode === 'create' ? 'Create' : 'Save changes'}
          </button>
        </div>
      </div>

      {/* Live preview panel */}
      <div style={{ position: 'sticky', top: '24px' }}>
        <p style={{ fontFamily: 'var(--font-sans), sans-serif', fontSize: '11px', fontWeight: 500, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '12px' }}>Live Preview — {format}</p>
        <div style={{ maxWidth: (format === 'card-wide' || format === 'card-dark' || format === 'newsletter') ? '800px' : '360px' }}>
          {format === 'inline' && <InlineSI si={previewSI} />}
          {format === 'sidebar' && <SidebarSI si={previewSI} />}
          {(format === 'card-sm' || format === 'card-dark' || format === 'card-wide') && <SoftInfraCard si={previewSI} />}
        </div>
      </div>
    </div>
  )
}
