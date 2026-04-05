'use client'

import { useCallback, useEffect, useState, useTransition } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { Program } from '@/types/program'

type SortCol = 'title' | 'type' | 'status' | 'deadline' | 'updated_at'
type SortDir = 'asc' | 'desc'

const TYPE_COLORS: Record<string, { bg: string; color: string }> = {
  grant:       { bg: '#EDF5EA', color: '#2A6620' },
  incubation:  { bg: 'var(--accent-light)', color: 'var(--accent)' },
  accelerator: { bg: '#EEF3FD', color: '#2B4EA8' },
  contest:     { bg: '#FDF5EE', color: '#9B5A00' },
  funding:     { bg: '#F3EEF9', color: '#7040A0' },
  seed:        { bg: '#E8F5FA', color: '#005D80' },
}

const STATUS_COLORS: Record<string, string> = {
  active: '#2A6620',
  closed: '#B01F1F',
  upcoming: '#2B4EA8',
}

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function deadlineColor(dateStr: string): string {
  const days = Math.ceil(
    (new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  )
  if (days < 0) return '#B01F1F'
  if (days <= 7) return '#D4820E'
  return 'var(--ink)'
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

/** Convert filtered programs to CSV and trigger download */
function exportCsv(rows: Program[]) {
  const headers = ['Title', 'Type', 'Status', 'Published', 'Deadline', 'Scope', 'Funding', 'Updated']
  const csv = [
    headers.join(','),
    ...rows.map((p) =>
      [
        `"${p.title}"`,
        p.type,
        p.status,
        p.published ? 'Yes' : 'No',
        p.deadline,
        p.is_india ? 'National' : 'International',
        p.amount_display ?? 'TBA',
        p.updated_at,
      ].join(',')
    ),
  ].join('\n')

  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'programs.csv'
  a.click()
  URL.revokeObjectURL(url)
}

interface ProgramsTableProps {
  initialPrograms: Program[]
}

export function ProgramsTable({ initialPrograms }: ProgramsTableProps) {
  const supabase = createClient()
  const [programs, setPrograms] = useState<Program[]>(initialPrograms)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [scopeFilter, setScopeFilter] = useState('all')
  const [publishedFilter, setPublishedFilter] = useState('all')
  const [sortCol, setSortCol] = useState<SortCol>('updated_at')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [page, setPage] = useState(0)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)
  const [, startTransition] = useTransition()

  const PAGE_SIZE = 25

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 4000)
  }

  // ── Filtering & Sorting (client-side) ──────────────────────────
  const filtered = programs
    .filter((p) => {
      if (search) {
        const q = search.toLowerCase()
        if (!p.title.toLowerCase().includes(q) && !p.organisation.toLowerCase().includes(q)) return false
      }
      if (statusFilter !== 'all' && p.status !== statusFilter) return false
      if (typeFilter !== 'all' && p.type !== typeFilter) return false
      if (scopeFilter === 'national' && !p.is_india) return false
      if (scopeFilter === 'international' && p.is_india) return false
      if (publishedFilter === 'true' && !p.published) return false
      if (publishedFilter === 'false' && p.published) return false
      return true
    })
    .sort((a, b) => {
      const av = a[sortCol] ?? ''
      const bv = b[sortCol] ?? ''
      const cmp = String(av).localeCompare(String(bv))
      return sortDir === 'asc' ? cmp : -cmp
    })

  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)

  const handleSort = (col: SortCol) => {
    if (sortCol === col) setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    else { setSortCol(col); setSortDir('asc') }
  }

  // ── Publish toggle (optimistic UI) ──────────────────────────────
  const togglePublished = useCallback(async (program: Program) => {
    const newVal = !program.published
    setPrograms((prev) =>
      prev.map((p) => (p.id === program.id ? { ...p, published: newVal } : p))
    )
    const { error } = await supabase
      .from('programs')
      .update({ published: newVal })
      .eq('id', program.id)
    if (error) {
      // Roll back
      setPrograms((prev) =>
        prev.map((p) => (p.id === program.id ? { ...p, published: program.published } : p))
      )
      showToast('Failed to update. Please retry.', false)
    } else {
      showToast(`"${program.title}" ${newVal ? 'published' : 'unpublished'}.`)
    }
  }, [supabase])

  // ── Delete ────────────────────────────────────────────────────
  const deleteProgram = useCallback(async (program: Program) => {
    if (!confirm(`Delete "${program.title}"? This cannot be undone.`)) return
    const { error } = await supabase.from('programs').delete().eq('id', program.id)
    if (error) {
      showToast('Delete failed.', false)
    } else {
      setPrograms((prev) => prev.filter((p) => p.id !== program.id))
      showToast(`"${program.title}" deleted.`)
    }
  }, [supabase])

  // ── Bulk actions ──────────────────────────────────────────────
  const bulkPublish = async (val: boolean) => {
    if (!confirm(`${val ? 'Publish' : 'Unpublish'} ${selected.size} programs?`)) return
    const ids = Array.from(selected)
    const { error } = await supabase.from('programs').update({ published: val }).in('id', ids)
    if (!error) {
      setPrograms((prev) => prev.map((p) => selected.has(p.id) ? { ...p, published: val } : p))
      setSelected(new Set())
      showToast(`${ids.length} programs ${val ? 'published' : 'unpublished'}.`)
    } else {
      showToast('Bulk action failed.', false)
    }
  }

  const bulkDelete = async () => {
    if (!confirm(`Delete ${selected.size} programs? This cannot be undone.`)) return
    const ids = Array.from(selected)
    const { error } = await supabase.from('programs').delete().in('id', ids)
    if (!error) {
      setPrograms((prev) => prev.filter((p) => !selected.has(p.id)))
      setSelected(new Set())
      showToast(`${ids.length} programs deleted.`)
    } else {
      showToast('Bulk delete failed.', false)
    }
  }

  const selectAll = () =>
    setSelected(new Set(paginated.map((p) => p.id)))

  const clearSelect = () => setSelected(new Set())

  const colHeader = (label: string, col: SortCol) => (
    <th
      onClick={() => handleSort(col)}
      style={{
        fontFamily: 'DM Sans, sans-serif',
        fontSize: '11px',
        fontWeight: 500,
        color: 'var(--ink-4)',
        textTransform: 'uppercase',
        letterSpacing: '0.07em',
        padding: '10px 14px',
        textAlign: 'left',
        cursor: 'pointer',
        userSelect: 'none',
        background: 'var(--cream)',
        whiteSpace: 'nowrap',
      }}
    >
      {label} {sortCol === col ? (sortDir === 'asc' ? '↑' : '↓') : ''}
    </th>
  )

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            background: toast.ok ? '#1E6E2E' : '#B01F1F',
            color: '#fff',
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '13px',
            padding: '12px 20px',
            borderRadius: '8px',
            zIndex: 200,
            boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
          }}
          role="status"
        >
          {toast.msg}
        </div>
      )}

      {/* Controls */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '16px', alignItems: 'center' }}>
        <input
          id="admin-programs-search"
          type="text"
          placeholder="Search title or organisation…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0) }}
          style={{
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '13px',
            border: '1px solid var(--cream-border)',
            borderRadius: '7px',
            padding: '8px 12px',
            width: '260px',
            outline: 'none',
            background: 'var(--white)',
          }}
        />
        {(['all', 'active', 'closed', 'upcoming'] as const).map((s) => (
          <select
            key={s}
            style={selectStyle}
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(0) }}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="closed">Closed</option>
            <option value="upcoming">Upcoming</option>
          </select>
        )).slice(0, 1)}
        <select
          style={selectStyle}
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); setPage(0) }}
        >
          <option value="all">All Types</option>
          {['grant', 'incubation', 'accelerator', 'contest', 'funding', 'seed'].map((t) => (
            <option key={t} value={t} style={{ textTransform: 'capitalize' }}>{t}</option>
          ))}
        </select>
        <select style={selectStyle} value={scopeFilter} onChange={(e) => { setScopeFilter(e.target.value); setPage(0) }}>
          <option value="all">All Scope</option>
          <option value="national">National</option>
          <option value="international">International</option>
        </select>
        <select style={selectStyle} value={publishedFilter} onChange={(e) => { setPublishedFilter(e.target.value); setPage(0) }}>
          <option value="all">All Published</option>
          <option value="true">Published</option>
          <option value="false">Drafts</option>
        </select>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
          {selected.size > 0 && (
            <>
              <button onClick={() => bulkPublish(true)} style={btnLight}>Publish {selected.size}</button>
              <button onClick={() => bulkPublish(false)} style={btnLight}>Unpublish {selected.size}</button>
              <button onClick={bulkDelete} style={{ ...btnLight, color: '#B01F1F', borderColor: '#B01F1F' }}>
                Delete {selected.size}
              </button>
            </>
          )}
          <button onClick={() => exportCsv(filtered)} style={btnLight}>
            Export CSV
          </button>
        </div>
      </div>

      {/* Bulk select helpers */}
      {paginated.length > 0 && (
        <div style={{ marginBottom: '8px', display: 'flex', gap: '12px' }}>
          <button onClick={selectAll} style={linkBtn}>Select all on page</button>
          {selected.size > 0 && <button onClick={clearSelect} style={linkBtn}>Clear selection</button>}
        </div>
      )}

      {/* Table */}
      <div style={{ background: 'var(--white)', border: '1px solid var(--cream-border)', borderRadius: '12px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ ...thBase, width: '36px' }}><input type="checkbox" checked={selected.size === paginated.length && paginated.length > 0} onChange={(e) => e.target.checked ? selectAll() : clearSelect()} /></th>
              {colHeader('Title', 'title')}
              {colHeader('Type', 'type')}
              {colHeader('Status', 'status')}
              <th style={thBase}>Published</th>
              {colHeader('Deadline', 'deadline')}
              <th style={thBase}>Scope</th>
              <th style={thBase}>Funding</th>
              {colHeader('Updated', 'updated_at')}
              <th style={thBase}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={10} style={{ padding: '40px', textAlign: 'center', fontFamily: 'DM Sans, sans-serif', fontSize: '13px', color: 'var(--ink-4)' }}>
                  No programs match your filters.
                </td>
              </tr>
            ) : paginated.map((p) => {
              const tc = TYPE_COLORS[p.type] ?? { bg: 'var(--cream)', color: 'var(--ink-3)' }
              return (
                <tr key={p.id} style={{ borderTop: '1px solid var(--cream-border)' }}>
                  <td style={tdBase}>
                    <input
                      type="checkbox"
                      checked={selected.has(p.id)}
                      onChange={(e) => {
                        const next = new Set(selected)
                        e.target.checked ? next.add(p.id) : next.delete(p.id)
                        setSelected(next)
                      }}
                    />
                  </td>
                  {/* Title */}
                  <td style={tdBase}>
                    <span
                      title={p.title}
                      style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '13px', color: 'var(--ink)', fontWeight: 500 }}
                    >
                      {p.title.length > 50 ? p.title.slice(0, 50) + '…' : p.title}
                    </span>
                  </td>
                  {/* Type */}
                  <td style={tdBase}>
                    <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '10.5px', fontWeight: 500, background: tc.bg, color: tc.color, borderRadius: '4px', padding: '2px 7px', textTransform: 'capitalize' }}>{p.type}</span>
                  </td>
                  {/* Status */}
                  <td style={tdBase}>
                    <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '12px', color: STATUS_COLORS[p.status] ?? 'var(--ink)', textTransform: 'capitalize' }}>{p.status}</span>
                  </td>
                  {/* Published toggle */}
                  <td style={tdBase}>
                    <button
                      onClick={() => startTransition(() => { togglePublished(p) })}
                      style={{
                        width: '36px',
                        height: '20px',
                        borderRadius: '10px',
                        background: p.published ? 'var(--ink)' : 'var(--cream-border)',
                        border: 'none',
                        cursor: 'pointer',
                        position: 'relative',
                        transition: 'background 0.2s ease',
                      }}
                      aria-label={p.published ? 'Unpublish' : 'Publish'}
                      title={p.published ? 'Published — click to unpublish' : 'Draft — click to publish'}
                    >
                      <span
                        style={{
                          position: 'absolute',
                          top: '2px',
                          left: p.published ? '18px' : '2px',
                          width: '16px',
                          height: '16px',
                          borderRadius: '50%',
                          background: 'var(--white)',
                          transition: 'left 0.2s ease',
                        }}
                      />
                    </button>
                  </td>
                  {/* Deadline */}
                  <td style={tdBase}>
                    <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '12.5px', color: deadlineColor(p.deadline) }}>
                      {formatDate(p.deadline)}
                    </span>
                  </td>
                  {/* Scope */}
                  <td style={tdBase}>
                    <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '12px', color: 'var(--ink-3)' }}>
                      {p.is_india ? 'National' : 'International'}
                    </span>
                  </td>
                  {/* Funding */}
                  <td style={tdBase}>
                    <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '12.5px', color: 'var(--ink)' }}>
                      {p.amount_display ?? 'TBA'}
                    </span>
                  </td>
                  {/* Updated */}
                  <td style={tdBase}>
                    <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '12px', color: 'var(--ink-4)' }}>
                      {relativeTime(p.updated_at)}
                    </span>
                  </td>
                  {/* Actions */}
                  <td style={tdBase}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Link
                        href={`/admin/programs/${p.id}`}
                        style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '12px', color: 'var(--ink)', textDecoration: 'none', border: '1px solid var(--cream-border)', borderRadius: '5px', padding: '3px 9px' }}
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => deleteProgram(p)}
                        style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '12px', color: '#B01F1F', background: 'none', border: '1px solid #F0B8B8', borderRadius: '5px', padding: '3px 9px', cursor: 'pointer' }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '20px' }}>
          <button disabled={page === 0} onClick={() => setPage(page - 1)} style={pageBtn}>← Prev</button>
          <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '12px', color: 'var(--ink-3)', padding: '6px 12px' }}>
            Page {page + 1} of {totalPages}
          </span>
          <button disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)} style={pageBtn}>Next →</button>
        </div>
      )}
    </div>
  )
}

// ── Shared styles ─────────────────────────────────────────────────

const selectStyle: React.CSSProperties = {
  fontFamily: 'DM Sans, sans-serif',
  fontSize: '12.5px',
  border: '1px solid var(--cream-border)',
  borderRadius: '7px',
  padding: '7px 10px',
  background: 'var(--white)',
  color: 'var(--ink)',
  cursor: 'pointer',
  outline: 'none',
}

const btnLight: React.CSSProperties = {
  fontFamily: 'DM Sans, sans-serif',
  fontSize: '12.5px',
  color: 'var(--ink)',
  background: 'var(--white)',
  border: '1px solid var(--cream-border)',
  borderRadius: '7px',
  padding: '7px 14px',
  cursor: 'pointer',
}

const linkBtn: React.CSSProperties = {
  fontFamily: 'DM Sans, sans-serif',
  fontSize: '12px',
  color: 'var(--ink-3)',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: 0,
  textDecoration: 'underline',
}

const thBase: React.CSSProperties = {
  fontFamily: 'DM Sans, sans-serif',
  fontSize: '11px',
  fontWeight: 500,
  color: 'var(--ink-4)',
  textTransform: 'uppercase',
  letterSpacing: '0.07em',
  padding: '10px 14px',
  textAlign: 'left',
  background: 'var(--cream)',
  whiteSpace: 'nowrap',
}

const tdBase: React.CSSProperties = {
  padding: '11px 14px',
  verticalAlign: 'middle',
}

const pageBtn: React.CSSProperties = {
  fontFamily: 'DM Sans, sans-serif',
  fontSize: '12px',
  color: 'var(--ink)',
  background: 'var(--white)',
  border: '1px solid var(--cream-border)',
  borderRadius: '6px',
  padding: '5px 14px',
  cursor: 'pointer',
}
