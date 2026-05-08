'use client'

/**
 * Admin form for creating and editing Startup School lessons.
 * Includes a markdown editor with custom YouTube embed support and auto-slug generation.
 */

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { createLesson, updateLesson } from '@/app/admin/school/actions'

// Dynamic import for MDEditor to avoid SSR issues
const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false })

interface SchoolModule {
  id: string
  title: string
  slug: string
}

interface SchoolLesson {
  id: string
  module_id: string
  title: string
  slug: string
  subtitle: string | null
  content: string | null
  youtube_url: string | null
  group_label: string | null
  order_index: number
  is_published: boolean
}

interface LessonFormProps {
  lesson?: SchoolLesson
  modules: SchoolModule[]
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

function SectionHeader({ title, open, onToggle }: { title: string; open: boolean; onToggle: () => void }) {
  return (
    <div
      onClick={onToggle}
      style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '14px 0', borderBottom: '1px solid var(--cream-border)', cursor: 'pointer',
        marginBottom: '20px',
      }}
    >
      <p style={{ fontFamily: 'var(--font-sans), sans-serif', fontSize: '12px', fontWeight: 600, color: 'var(--ink)', textTransform: 'uppercase', letterSpacing: '0.07em', margin: 0 }}>{title}</p>
      <span style={{ color: 'var(--ink-4)', fontSize: '14px' }}>{open ? '▲' : '▼'}</span>
    </div>
  )
}

/** Extract YouTube video ID from various URL formats */
function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

export function LessonForm({ lesson, modules, mode }: LessonFormProps) {
  const router = useRouter()
  const [moduleId, setModuleId] = useState(lesson?.module_id ?? (modules[0]?.id ?? ''))
  const [title, setTitle] = useState(lesson?.title ?? '')
  const [slug, setSlug] = useState(lesson?.slug ?? '')
  const [subtitle, setSubtitle] = useState(lesson?.subtitle ?? '')
  const [content, setContent] = useState(lesson?.content ?? '')
  const [youtubeUrl, setYoutubeUrl] = useState(lesson?.youtube_url ?? '')
  const [groupLabel, setGroupLabel] = useState(lesson?.group_label ?? '')
  const [orderIndex, setOrderIndex] = useState(String(lesson?.order_index ?? 0))
  const [isPublished, setIsPublished] = useState(lesson?.is_published ?? false)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [contentOpen, setContentOpen] = useState(true)
  const slugManuallyEdited = useRef(!!lesson?.slug)

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
    if (!moduleId) errs.moduleId = 'Module is required.'
    if (!title.trim()) errs.title = 'Title is required.'
    if (!slug.trim()) errs.slug = 'Slug is required.'
    return errs
  }

  const handleInsertYouTube = () => {
    const url = prompt('Paste a YouTube URL:')
    if (!url) return
    const videoId = extractYouTubeId(url)
    if (!videoId) {
      showToast('Invalid YouTube URL. Use a youtube.com/watch?v= or youtu.be/ link.', false)
      return
    }
    // Insert the YouTube embed marker into the content
    const embed = `\n\n::youtube[${videoId}]\n\n`
    setContent((prev) => prev + embed)
    showToast('YouTube video embedded!')
  }

  const handleSave = async () => {
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    setSaving(true)
    const formData = new FormData()
    formData.set('module_id', moduleId)
    formData.set('title', title)
    formData.set('slug', slug)
    formData.set('subtitle', subtitle)
    formData.set('content', content)
    formData.set('youtube_url', youtubeUrl)
    formData.set('group_label', groupLabel)
    formData.set('order_index', orderIndex)
    formData.set('is_published', String(isPublished))

    const result = mode === 'create'
      ? await createLesson(formData)
      : await updateLesson(lesson!.id, formData)

    setSaving(false)

    if (result.ok) {
      showToast(mode === 'create' ? 'Lesson created!' : 'Lesson updated!')
      router.push('/admin/school/lessons')
    } else {
      showToast(result.error, false)
    }
  }

  // Cmd+S shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') { e.preventDefault(); handleSave() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  })

  const sectionWrap: React.CSSProperties = {
    background: 'var(--white)',
    border: '1px solid var(--cream-border)',
    borderRadius: '12px',
    padding: '22px',
    marginBottom: '20px',
  }

  return (
    <form onSubmit={(e) => e.preventDefault()} noValidate>
      {toast && (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', background: toast.ok ? '#1E6E2E' : '#B01F1F', color: '#fff', fontFamily: 'var(--font-sans), sans-serif', fontSize: '13px', padding: '12px 20px', borderRadius: '8px', zIndex: 200, boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }} role="status">
          {toast.msg}
        </div>
      )}

      {/* Section A — Metadata */}
      <div style={sectionWrap}>
        <div style={{ padding: '14px 0', borderBottom: '1px solid var(--cream-border)', marginBottom: '20px' }}>
          <p style={{ fontFamily: 'var(--font-sans), sans-serif', fontSize: '12px', fontWeight: 600, color: 'var(--ink)', textTransform: 'uppercase', letterSpacing: '0.07em', margin: 0 }}>A — Lesson Details</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
          <FieldWrap error={errors.moduleId}>
            <Label required>Module</Label>
            <select
              value={moduleId}
              onChange={(e) => setModuleId(e.target.value)}
              style={inputStyle(!!errors.moduleId)}
            >
              <option value="">— Select module —</option>
              {modules.map((m) => (
                <option key={m.id} value={m.id}>{m.title}</option>
              ))}
            </select>
          </FieldWrap>
          <FieldWrap error={errors.title}>
            <Label required>Title</Label>
            <input type="text" maxLength={200} value={title} onChange={(e) => setTitle(e.target.value)} style={inputStyle(!!errors.title)} placeholder="e.g. Writing Problem Statements" />
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
            <Label>Subtitle</Label>
            <input type="text" maxLength={300} value={subtitle} onChange={(e) => setSubtitle(e.target.value)} style={inputStyle()} placeholder="Short description below the title" />
          </FieldWrap>
          <FieldWrap>
            <Label>Group label</Label>
            <input type="text" maxLength={100} value={groupLabel} onChange={(e) => setGroupLabel(e.target.value)} style={inputStyle()} placeholder="e.g. Foundation, Start here" />
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

      {/* Section B — Content (collapsible) */}
      <div style={sectionWrap}>
        <SectionHeader title="B — Content" open={contentOpen} onToggle={() => setContentOpen(!contentOpen)} />
        {contentOpen && (
          <>
            {/* YouTube embed button */}
            <div style={{ marginBottom: '12px' }}>
              <button
                type="button"
                onClick={handleInsertYouTube}
                style={{
                  fontFamily: 'var(--font-sans), sans-serif',
                  fontSize: '12px',
                  fontWeight: 500,
                  color: 'var(--ink)',
                  background: 'var(--cream)',
                  border: '1px solid var(--cream-border)',
                  borderRadius: '7px',
                  padding: '7px 14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M14.5 4.5s-.2-1.2-.7-1.7c-.7-.7-1.4-.7-1.8-.7C9.5 2 8 2 8 2s-1.5 0-4 .1c-.4 0-1.1 0-1.8.7-.5.5-.7 1.7-.7 1.7S1.3 5.9 1.3 7.2v1.6c0 1.3.2 2.7.2 2.7s.2 1.2.7 1.7c.7.7 1.6.7 2 .7 1.4.1 5.8.2 5.8.2s1.5 0 4-.1c.4 0 1.1 0 1.8-.7.5-.5.7-1.7.7-1.7s.2-1.3.2-2.7V7.2c0-1.3-.2-2.7-.2-2.7z" fill="#FF0000" />
                  <path d="M6.5 10.5V5.5L10.5 8L6.5 10.5z" fill="#fff" />
                </svg>
                Insert YouTube Video
              </button>
              <p style={{ fontFamily: 'var(--font-sans), sans-serif', fontSize: '11px', color: 'var(--ink-4)', marginTop: '4px' }}>
                Inserts a ::youtube[VIDEO_ID] tag into the content. It will render as an embedded video on the public page.
              </p>
            </div>

            {/* WYSIWYG Markdown Editor */}
            <div data-color-mode="light">
              <MDEditor
                value={content}
                onChange={(val) => setContent(val ?? '')}
                height={400}
                preview="live"
              />
            </div>
          </>
        )}
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', justifyContent: 'flex-end' }}>
        <button
          type="button"
          onClick={() => router.push('/admin/school/lessons')}
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
          {saving ? 'Saving…' : mode === 'create' ? 'Create lesson' : 'Save changes'}
        </button>
      </div>
    </form>
  )
}
