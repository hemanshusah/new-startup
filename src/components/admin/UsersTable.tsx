'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

type UserRow = {
  id: string
  full_name: string | null
  email: string
  created_at: string
  role: string
  total_views: number
  last_active: string | null
}

export function UsersTable({ initialUsers }: { initialUsers: UserRow[] }) {
  const supabase = createClient()
  const [users, setUsers] = useState<UserRow[]>(initialUsers)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'created_at' | 'total_views'>('created_at')
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 4000)
  }

  const filtered = users
    .filter((u) => {
      if (!search) return true
      const q = search.toLowerCase()
      return (u.full_name ?? '').toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    })
    .sort((a, b) =>
      sortBy === 'total_views'
        ? b.total_views - a.total_views
        : new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

  const updateRole = useCallback(async (userId: string, newRole: string) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)))
    const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId)
    if (error) {
      showToast(`Failed to update role: ${error.message}`, false)
      // rollback
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: u.role } : u)))
    } else {
      showToast(`Role updated to ${newRole}.`)
    }
  }, [supabase])

  const exportCsv = () => {
    const csv = [
      'Name,Email,Joined,Total Views,Role',
      ...filtered.map((u) => `"${u.full_name ?? ''}","${u.email}","${u.created_at}",${u.total_views},"${u.role}"`),
    ].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'users.csv'
    a.click()
  }


  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })

  return (
    <div>
      {toast && (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', background: toast.ok ? '#1E6E2E' : '#B01F1F', color: '#fff', fontFamily: 'DM Sans, sans-serif', fontSize: '13px', padding: '12px 20px', borderRadius: '8px', zIndex: 200 }} role="status">
          {toast.msg}
        </div>
      )}

      {/* Controls */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', alignItems: 'center' }}>
        <input id="admin-users-search" type="text" placeholder="Search name or email…" value={search} onChange={(e) => setSearch(e.target.value)}
          style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '13px', border: '1px solid var(--cream-border)', borderRadius: '7px', padding: '8px 12px', width: '260px', background: 'var(--white)', outline: 'none' }} />
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value as 'created_at' | 'total_views')}
          style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '12.5px', border: '1px solid var(--cream-border)', borderRadius: '7px', padding: '7px 10px', background: 'var(--white)', outline: 'none', cursor: 'pointer' }}>
          <option value="created_at">Sort by joined date</option>
          <option value="total_views">Sort by view count</option>
        </select>
        <button onClick={exportCsv} style={{ marginLeft: 'auto', fontFamily: 'DM Sans, sans-serif', fontSize: '12.5px', color: 'var(--ink)', background: 'var(--white)', border: '1px solid var(--cream-border)', borderRadius: '7px', padding: '7px 14px', cursor: 'pointer' }}>
          Export CSV
        </button>
      </div>

      {/* Table */}
      <div style={{ background: 'var(--white)', border: '1px solid var(--cream-border)', borderRadius: '12px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Name', 'Email', 'Joined', 'Total views', 'Last active', 'Role', 'Actions'].map((h) => (
                <th key={h} style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '10.5px', fontWeight: 500, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.07em', padding: '10px 14px', textAlign: 'left', background: 'var(--cream)', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: '40px', textAlign: 'center', fontFamily: 'DM Sans, sans-serif', fontSize: '13px', color: 'var(--ink-4)' }}>No users found.</td></tr>
            ) : filtered.map((u) => (
              <tr key={u.id} style={{ borderTop: '1px solid var(--cream-border)' }}>
                <td style={{ padding: '12px 14px' }}>
                  <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '13px', color: 'var(--ink)', fontWeight: 500 }}>
                    {u.full_name ?? u.email.split('@')[0]}
                  </span>
                </td>
                <td style={{ padding: '12px 14px' }}>
                  <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '12.5px', color: 'var(--ink-3)' }}>
                    {u.email}
                  </span>
                </td>
                <td style={{ padding: '12px 14px' }}>
                  <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '12.5px', color: 'var(--ink)' }}>
                    {formatDate(u.created_at)}
                  </span>
                </td>
                <td style={{ padding: '12px 14px' }}>
                  <span style={{ fontFamily: 'DM Serif Display, serif', fontSize: '14px', color: 'var(--ink)' }}>
                    {u.total_views.toLocaleString()}
                  </span>
                </td>
                <td style={{ padding: '12px 14px' }}>
                  <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '12px', color: 'var(--ink-4)' }}>
                    {u.last_active ? formatDate(u.last_active) : '—'}
                  </span>
                </td>
                <td style={{ padding: '12px 14px' }}>
                  <select
                    value={u.role}
                    onChange={(e) => updateRole(u.id, e.target.value)}
                    style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '12px', border: '1px solid var(--cream-border)', borderRadius: '6px', padding: '4px 8px', background: 'var(--white)', cursor: 'pointer', color: u.role === 'admin' ? '#B01F1F' : 'var(--ink)' }}
                  >
                    <option value="user">user</option>
                    <option value="admin">admin</option>
                  </select>
                </td>
                <td style={{ padding: '12px 14px' }}>
                  <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '11.5px', color: 'var(--ink-4)' }}>—</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
