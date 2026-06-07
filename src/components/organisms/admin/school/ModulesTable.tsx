'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { updateModulePublished, deleteModule } from '@/app/admin/school/actions'

interface SchoolModule {
  id: string
  title: string
  slug: string
  description: string | null
  order_index: number
  is_published: boolean
  lesson_count?: number
  created_at: string
  updated_at: string
}

interface ModulesTableProps {
  initialModules: SchoolModule[]
}

export function ModulesTable({ initialModules }: ModulesTableProps) {
  const router = useRouter()
  const [modules, setModules] = useState(initialModules)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3000)
  }

  const handleTogglePublished = async (id: string, current: boolean) => {
    const result = await updateModulePublished(id, !current)
    if (result.ok) {
      setModules((prev) => prev.map((m) => m.id === id ? { ...m, is_published: !current } : m))
      showToast(!current ? 'Module published' : 'Module unpublished')
    } else {
      showToast(result.error, false)
    }
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete module "${title}" and ALL its lessons? This cannot be undone.`)) return
    const result = await deleteModule(id)
    if (result.ok) {
      setModules((prev) => prev.filter((m) => m.id !== id))
      showToast('Module deleted')
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

      {modules.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 24px',
          background: 'var(--white)',
          border: '1px solid var(--cream-border)',
          borderRadius: '12px',
        }}>
          <p style={{ fontFamily: 'var(--font-sans), sans-serif', fontSize: '14px', color: 'var(--ink-3)', marginBottom: '16px' }}>
            No modules yet. Create one to get started.
          </p>
          <Link
            href="/admin/school/modules/new"
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
            + New module
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
                {['Order', 'Title', 'Slug', 'Lessons', 'Status', 'Actions'].map((h) => (
                  <th
                    key={h}
                    style={{
                      fontFamily: 'var(--font-sans), sans-serif',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: 'var(--ink-4)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      padding: '12px 16px',
                      textAlign: 'left',
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {modules.map((mod) => (
                <tr
                  key={mod.id}
                  style={{
                    borderBottom: '1px solid var(--cream-border)',
                    transition: 'background 0.1s ease',
                  }}
                >
                  <td style={{ padding: '12px 16px', fontFamily: 'var(--font-sans), sans-serif', fontSize: '13px', color: 'var(--ink-3)' }}>
                    {mod.order_index}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <Link
                      href={`/admin/school/modules/${mod.id}`}
                      style={{
                        fontFamily: 'var(--font-sans), sans-serif',
                        fontSize: '13px',
                        fontWeight: 500,
                        color: 'var(--ink)',
                        textDecoration: 'none',
                      }}
                    >
                      {mod.title}
                    </Link>
                  </td>
                  <td style={{ padding: '12px 16px', fontFamily: 'var(--font-sans), sans-serif', fontSize: '12px', color: 'var(--ink-3)' }}>
                    {mod.slug}
                  </td>
                  <td style={{ padding: '12px 16px', fontFamily: 'var(--font-sans), sans-serif', fontSize: '13px', color: 'var(--ink-3)' }}>
                    {mod.lesson_count ?? 0}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <button
                      type="button"
                      onClick={() => handleTogglePublished(mod.id, mod.is_published)}
                      style={{
                        fontFamily: 'var(--font-sans), sans-serif',
                        fontSize: '11px',
                        fontWeight: 500,
                        padding: '3px 10px',
                        borderRadius: '12px',
                        border: 'none',
                        cursor: 'pointer',
                        background: mod.is_published ? '#E8F5E9' : 'var(--cream)',
                        color: mod.is_published ? '#2E7D32' : 'var(--ink-3)',
                      }}
                    >
                      {mod.is_published ? 'Published' : 'Draft'}
                    </button>
                  </td>
                  <td style={{ padding: '12px 16px', display: 'flex', gap: '8px' }}>
                    <Link
                      href={`/admin/school/modules/${mod.id}`}
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
                      onClick={() => handleDelete(mod.id, mod.title)}
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
