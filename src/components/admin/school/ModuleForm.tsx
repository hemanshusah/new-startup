'use client'

/**
 * Admin form for creating and editing Startup School modules.
 * Handles metadata and auto-slug generation.
 */

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createModule, updateModule } from '@/app/admin/school/actions'

interface SchoolModule {
  id: string
  title: string
  slug: string
  description: string | null
  order_index: number
  is_published: boolean
}

interface ModuleFormProps {
  module?: SchoolModule
  mode: 'create' | 'edit'
}

function toSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 120)
}

const inputStyle = (hasError?: boolean): React.CSSProperties => ({
  fontFamily: 'var(--font-sans), sans-serif',
  fontSize: '13px',
  width: '100%',
  border: `1px solid ${hasError ? '#E03E2D' : 'var(--cream-border)'}`,
  borderRadius: '7px',
  padding: '9px 12px',
  outline: 'none',
  background: 'var(--white)',
  boxSizing: 'border-box',
})

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label style={{ fontFamily: 'var(--font-sans), sans-serif', fontSize: '12.5px', fontWeight: 500, color: 'var(--ink)', display: 'block', marginBottom: '6px' }}>
      {children}{required && <span style={{ color: '#E03E2D', marginLeft: '3px' }}>*</span>}
    </label>
  )
}

function FieldWrap({ children, error }: { children: React.ReactNode; error?: string }) {
  return (
    <div style={{ marginBottom: '18px' }}>
      {children}
      {error && <p style={{ fontFamily: 'var(--font-sans), sans-serif', fontSize: '11.5px', color: '#E03E2D', marginTop: '4px' }}>{error}</p>}
    </div>
  )
}

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
      {label && <span style={{ fontFamily: 'var(--font-sans), sans-serif', fontSize: '13px', color: 'var(--ink-2)' }}>{label}</span>}
    </div>
  )
}

export function ModuleForm({ module, mode }: ModuleFormProps) {
  const router = useRouter()
  const [title, setTitle] = useState(module?.title ?? '')
  const [slug, setSlug] = useState(module?.slug ?? '')
  const [description, setDescription] = useState(module?.description ?? '')
  const [orderIndex, setOrderIndex] = useState(String(module?.order_index ?? 0))
  const [isPublished, setIsPublished] = useState(module?.is_published ?? false)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const slugManuallyEdited = useRef(!!module?.slug)

  // Auto-slug from title
  useEffect(() => {
    if (!slugManuallyEdited.current) {
      setSlug(toSlug(title))
    }
  }, [title])

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 4000)
  }

  const validate = (): Record<string, string> => {
    const errs: Record<string, string> = {}
    if (!title.trim()) errs.title = 'Title is required.'
    if (!slug.trim()) errs.slug = 'Slug is required.'
    return errs
  }

  const handleSave = async () => {
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    setSaving(true)
    const formData = new FormData()
    formData.set('title', title)
    formData.set('slug', slug)
    formData.set('description', description)
    formData.set('order_index', orderIndex)
    formData.set('is_published', String(isPublished))

    const result = mode === 'create'
      ? await createModule(formData)
      : await updateModule(module!.id, formData)

    setSaving(false)

    if (result.ok) {
      showToast(mode === 'create' ? 'Module created!' : 'Module updated!')
      router.push('/admin/school/modules')
    } else {
      showToast(result.error, false)
    }
  }

  return (
    <form onSubmit={(e) => e.preventDefault()} noValidate>
      {toast && (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', background: toast.ok ? '#1E6E2E' : '#B01F1F', color: '#fff', fontFamily: 'var(--font-sans), sans-serif', fontSize: '13px', padding: '12px 20px', borderRadius: '8px', zIndex: 200, boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }} role="status">
          {toast.msg}
        </div>
      )}

      <div style={{
        background: 'var(--white)',
        border: '1px solid var(--cream-border)',
        borderRadius: '12px',
        padding: '22px',
        marginBottom: '20px',
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
          <FieldWrap error={errors.title}>
            <Label required>Title</Label>
            <input type="text" maxLength={200} value={title} onChange={(e) => setTitle(e.target.value)} style={inputStyle(!!errors.title)} placeholder="e.g. Idea Validation" />
          </FieldWrap>
          <FieldWrap error={errors.slug}>
            <Label required>Slug</Label>
            <input
              type="text"
              value={slug}
              onChange={(e) => { slugManuallyEdited.current = true; setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-')) }}
              style={inputStyle(!!errors.slug)}
              placeholder="auto-generated"
            />
          </FieldWrap>
          <FieldWrap>
            <Label>Description</Label>
            <textarea
              rows={3}
              maxLength={500}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ ...inputStyle(), resize: 'vertical' }}
              placeholder="Short module description"
            />
          </FieldWrap>
          <div>
            <FieldWrap>
              <Label>Order index</Label>
              <input type="number" min="0" value={orderIndex} onChange={(e) => setOrderIndex(e.target.value)} style={inputStyle()} />
            </FieldWrap>
            <FieldWrap>
              <Label>Published</Label>
              <Toggle checked={isPublished} onChange={setIsPublished} label={isPublished ? 'Published' : 'Draft'} />
            </FieldWrap>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', justifyContent: 'flex-end' }}>
        <button
          type="button"
          onClick={() => router.push('/admin/school/modules')}
          style={{
            fontFamily: 'var(--font-sans), sans-serif',
            fontSize: '13px',
            color: 'var(--ink-3)',
            background: 'none',
            border: '1px solid var(--cream-border)',
            borderRadius: '8px',
            padding: '9px 18px',
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          style={{
            fontFamily: 'var(--font-sans), sans-serif',
            fontSize: '13px',
            fontWeight: 500,
            color: 'var(--cream)',
            background: 'var(--ink)',
            border: 'none',
            borderRadius: '8px',
            padding: '9px 22px',
            cursor: 'pointer',
          }}
        >
          {saving ? 'Saving…' : mode === 'create' ? 'Create module' : 'Save changes'}
        </button>
      </div>
    </form>
  )
}
