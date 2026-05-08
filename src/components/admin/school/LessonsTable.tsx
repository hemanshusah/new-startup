'use client'

import Link from 'next/link'
import { useState } from 'react'
import { updateLessonPublished, deleteLesson } from '@/app/admin/school/actions'

interface SchoolLesson {
  id: string
  module_id: string
  title: string
  slug: string
  subtitle: string | null
  group_label: string | null
  order_index: number
  is_published: boolean
  module_title?: string
  module_slug?: string
  created_at: string
  updated_at: string
}

interface SchoolModule {
  id: string
  title: string
  slug: string
}

interface LessonsTableProps {
  initialLessons: SchoolLesson[]
  modules: SchoolModule[]
}

export function LessonsTable({ initialLessons, modules }: LessonsTableProps) {
  const [lessons, setLessons] = useState(initialLessons)
  const [filterModuleId, setFilterModuleId] = useState<string>('')
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3000)
  }

  const filtered = filterModuleId
    ? lessons.filter((l) => l.module_id === filterModuleId)
    : lessons

  const handleTogglePublished = async (id: string, current: boolean) => {
    const result = await updateLessonPublished(id, !current)
    if (result.ok) {
      setLessons((prev) => prev.map((l) => l.id === id ? { ...l, is_published: !current } : l))
      showToast(!current ? 'Lesson published' : 'Lesson unpublished')
    } else {
      showToast(result.error, false)
    }
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete lesson "${title}"? This cannot be undone.`)) return
    const result = await deleteLesson(id)
    if (result.ok) {
      setLessons((prev) => prev.filter((l) => l.id !== id))
      showToast('Lesson deleted')
    } else {
      showToast(result.error, false)
    }
  }

  return (
    <>
      {toast && (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', background: toast.ok ? '#1E6E2E' : '#B01F1F', color: '#fff', fontFamily: 'var(--font-sans), sans-serif', fontSize: '13px', padding: '12px 20px', borderRadius: '8px', zIndex: 200, boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }} role="status">
          {toast.msg}
        </div>
      )}

      {/* Filter by module */}
      <div style={{ marginBottom: '16px' }}>
        <select
          value={filterModuleId}
          onChange={(e) => setFilterModuleId(e.target.value)}
          style={{
            fontFamily: 'var(--font-sans), sans-serif',
            fontSize: '13px',
            border: '1px solid var(--cream-border)',
            borderRadius: '7px',
            padding: '8px 12px',
            outline: 'none',
            background: 'var(--white)',
          }}
        >
          <option value="">All modules</option>
          {modules.map((m) => (
            <option key={m.id} value={m.id}>{m.title}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 24px',
          background: 'var(--white)',
          border: '1px solid var(--cream-border)',
          borderRadius: '12px',
        }}>
          <p style={{ fontFamily: 'var(--font-sans), sans-serif', fontSize: '14px', color: 'var(--ink-3)', marginBottom: '16px' }}>
            {filterModuleId ? 'No lessons in this module.' : 'No lessons yet. Create one to get started.'}
          </p>
          <Link
            href="/admin/school/lessons/new"
            style={{
              fontFamily: 'var(--font-sans), sans-serif',
              fontSize: '13px',
              fontWeight: 500,
              color: 'var(--white)',
              background: 'var(--ink)',
              borderRadius: '8px',
              padding: '9px 18px',
              textDecoration: 'none',
            }}
          >
            + New lesson
          </Link>
        </div>
      ) : (
        <div style={{
          background: 'var(--white)',
          border: '1px solid var(--cream-border)',
          borderRadius: '12px',
          overflow: 'hidden',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--cream-border)' }}>
                {['Order', 'Module', 'Title', 'Slug', 'Group', 'Status', 'Actions'].map((h) => (
                  <th
                    key={h}
                    style={{
                      fontFamily: 'var(--font-sans), sans-serif',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: 'var(--ink-4)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      padding: '12px 14px',
                      textAlign: 'left',
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((lesson) => (
                <tr
                  key={lesson.id}
                  style={{
                    borderBottom: '1px solid var(--cream-border)',
                    transition: 'background 0.1s ease',
                  }}
                >
                  <td style={{ padding: '12px 14px', fontFamily: 'var(--font-sans), sans-serif', fontSize: '13px', color: 'var(--ink-3)' }}>
                    {lesson.order_index}
                  </td>
                  <td style={{ padding: '12px 14px', fontFamily: 'var(--font-sans), sans-serif', fontSize: '12px', color: 'var(--ink-3)' }}>
                    {lesson.module_title ?? '—'}
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <Link
                      href={`/admin/school/lessons/${lesson.id}`}
                      style={{
                        fontFamily: 'var(--font-sans), sans-serif',
                        fontSize: '13px',
                        fontWeight: 500,
                        color: 'var(--ink)',
                        textDecoration: 'none',
                      }}
                    >
                      {lesson.title}
                    </Link>
                  </td>
                  <td style={{ padding: '12px 14px', fontFamily: 'var(--font-sans), sans-serif', fontSize: '12px', color: 'var(--ink-3)' }}>
                    {lesson.slug}
                  </td>
                  <td style={{ padding: '12px 14px', fontFamily: 'var(--font-sans), sans-serif', fontSize: '12px', color: 'var(--ink-3)' }}>
                    {lesson.group_label ?? '—'}
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <button
                      type="button"
                      onClick={() => handleTogglePublished(lesson.id, lesson.is_published)}
                      style={{
                        fontFamily: 'var(--font-sans), sans-serif',
                        fontSize: '11px',
                        fontWeight: 500,
                        padding: '3px 10px',
                        borderRadius: '12px',
                        border: 'none',
                        cursor: 'pointer',
                        background: lesson.is_published ? '#E8F5E9' : 'var(--cream)',
                        color: lesson.is_published ? '#2E7D32' : 'var(--ink-3)',
                      }}
                    >
                      {lesson.is_published ? 'Published' : 'Draft'}
                    </button>
                  </td>
                  <td style={{ padding: '12px 14px', display: 'flex', gap: '8px' }}>
                    <Link
                      href={`/admin/school/lessons/${lesson.id}`}
                      style={{
                        fontFamily: 'var(--font-sans), sans-serif',
                        fontSize: '12px',
                        color: 'var(--ink-3)',
                        textDecoration: 'none',
                        padding: '4px 10px',
                        border: '1px solid var(--cream-border)',
                        borderRadius: '6px',
                      }}
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(lesson.id, lesson.title)}
                      style={{
                        fontFamily: 'var(--font-sans), sans-serif',
                        fontSize: '12px',
                        color: '#B01F1F',
                        background: 'none',
                        border: '1px solid #F0B8B8',
                        borderRadius: '6px',
                        padding: '4px 10px',
                        cursor: 'pointer',
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
