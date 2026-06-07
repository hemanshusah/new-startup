'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { deleteUserAdmin, updateMentorStatusAdmin } from '@/app/admin/user-actions'
import { useRouter } from 'next/navigation'

type UserRow = {
  id: string
  full_name: string | null
  email: string
  created_at: string
  role: string
  account_intent: string
  total_views: number
  last_active: string | null
  mentor_status: string | null
  sessions_count: number
}

export function UsersTable({ initialUsers }: { initialUsers: UserRow[] }) {
  const supabase = useState(() => createClient())[0]
  const [users, setUsers] = useState<UserRow[]>(initialUsers)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'created_at' | 'total_views'>('created_at')
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 4000)
  }

  const handleDelete = async (userId: string) => {
    if (deleteConfirmText.toLowerCase() !== 'delete') {
      showToast('Please type "delete" to confirm.', false)
      return
    }
    setIsDeleting(true)
    const res = await deleteUserAdmin(userId)
    setIsDeleting(false)
    if (res.ok) {
      showToast('User deleted successfully.')
      setUsers((prev) => prev.filter((u) => u.id !== userId))
      setDeletingId(null)
      setDeleteConfirmText('')
      router.refresh()
    } else {
      showToast(res.error || 'Failed to delete user.', false)
    }
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

  const updateMentorStatus = useCallback(async (userId: string, newStatus: string) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, mentor_status: newStatus } : u)))
    const res = await updateMentorStatusAdmin(userId, newStatus)
    if (!res.ok) {
      showToast(`Failed to update status: ${res.error}`, false)
      // rollback
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, mentor_status: u.mentor_status } : u)))
    } else {
      showToast(`Mentor status updated to ${newStatus}.`)
    }
  }, [])

  const exportCsv = () => {
    const csv = [
      'Name,Email,Joined,Intent,Views,Mentor Status,Sessions,Role',
      ...filtered.map((u) => `"${u.full_name ?? ''}","${u.email}","${u.created_at}","${u.account_intent || 'founder'}",${u.total_views},"${u.mentor_status || ''}",${u.sessions_count || 0},"${u.role}"`),
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
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', background: toast.ok ? '#1E6E2E' : '#B01F1F', color: '#fff', fontFamily: 'var(--font-sans), sans-serif', fontSize: '13px', padding: '12px 20px', borderRadius: '8px', zIndex: 200 }} role="status">
          {toast.msg}
        </div>
      )}

      {/* Controls */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', alignItems: 'center' }}>
        <input id="admin-users-search" type="text" placeholder="Search name or email…" value={search} onChange={(e) => setSearch(e.target.value)}
          style={{ fontFamily: 'var(--font-sans), sans-serif', fontSize: '13px', border: '1px solid var(--cream-border)', borderRadius: '7px', padding: '8px 12px', width: '260px', background: 'var(--white)', outline: 'none' }} />
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value as 'created_at' | 'total_views')}
          style={{ fontFamily: 'var(--font-sans), sans-serif', fontSize: '12.5px', border: '1px solid var(--cream-border)', borderRadius: '7px', padding: '7px 10px', background: 'var(--white)', outline: 'none', cursor: 'pointer' }}>
          <option value="created_at">Sort by joined date</option>
          <option value="total_views">Sort by view count</option>
        </select>
        <button onClick={exportCsv} style={{ marginLeft: 'auto', fontFamily: 'var(--font-sans), sans-serif', fontSize: '12.5px', color: 'var(--ink)', background: 'var(--white)', border: '1px solid var(--cream-border)', borderRadius: '7px', padding: '7px 14px', cursor: 'pointer' }}>
          Export CSV
        </button>
      </div>

      {/* Table */}
      <div style={{ background: 'var(--white)', border: '1px solid var(--cream-border)', borderRadius: '12px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Name', 'Email', 'Joined', 'Intent', 'Views', 'Mentor Status', 'Sessions', 'Role', 'Actions'].map((h) => (
                <th key={h} style={{ fontFamily: 'var(--font-sans), sans-serif', fontSize: '10.5px', fontWeight: 500, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.07em', padding: '10px 14px', textAlign: 'left', background: 'var(--cream)', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={9} style={{ padding: '40px', textAlign: 'center', fontFamily: 'var(--font-sans), sans-serif', fontSize: '13px', color: 'var(--ink-4)' }}>No users found.</td></tr>
            ) : filtered.map((u) => (
              <tr key={u.id} style={{ borderTop: '1px solid var(--cream-border)' }}>
                <td style={{ padding: '12px 14px' }}>
                  <span style={{ fontFamily: 'var(--font-sans), sans-serif', fontSize: '13px', color: 'var(--ink)', fontWeight: 500 }}>
                    {u.full_name ?? u.email.split('@')[0]}
                  </span>
                </td>
                <td style={{ padding: '12px 14px' }}>
                  <span style={{ fontFamily: 'var(--font-sans), sans-serif', fontSize: '12.5px', color: 'var(--ink-3)' }}>
                    {u.email}
                  </span>
                </td>
                <td style={{ padding: '12px 14px' }}>
                  <span style={{ fontFamily: 'var(--font-sans), sans-serif', fontSize: '12.5px', color: 'var(--ink)' }}>
                    {formatDate(u.created_at)}
                  </span>
                </td>
                <td style={{ padding: '12px 14px' }}>
                  <span style={{ fontFamily: 'var(--font-sans), sans-serif', fontSize: '12px', background: u.account_intent === 'mentor' ? '#E0F2FE' : '#F1F5F9', color: u.account_intent === 'mentor' ? '#0369A1' : '#475569', padding: '2px 6px', borderRadius: '4px', fontWeight: 500 }}>
                    {u.account_intent || 'founder'}
                  </span>
                </td>
                <td style={{ padding: '12px 14px' }}>
                  <span style={{ fontFamily: 'var(--font-serif), serif', fontSize: '14px', color: 'var(--ink)' }}>
                    {u.total_views.toLocaleString()}
                  </span>
                </td>
                <td style={{ padding: '12px 14px' }}>
                  {u.account_intent === 'mentor' ? (
                    <select
                      value={u.mentor_status || 'pending'}
                      onChange={(e) => updateMentorStatus(u.id, e.target.value)}
                      style={{ fontFamily: 'var(--font-sans), sans-serif', fontSize: '12px', border: '1px solid var(--cream-border)', borderRadius: '6px', padding: '4px 8px', background: 'var(--white)', cursor: 'pointer', color: u.mentor_status === 'active' ? '#1E6E2E' : '#B45309' }}
                    >
                      <option value="pending">pending</option>
                      <option value="active">active</option>
                      <option value="suspended">suspended</option>
                      <option value="rejected">rejected</option>
                    </select>
                  ) : (
                    <span style={{ color: 'var(--ink-4)', fontSize: '12px' }}>—</span>
                  )}
                </td>
                <td style={{ padding: '12px 14px' }}>
                  <span style={{ fontFamily: 'var(--font-serif), serif', fontSize: '14px', color: 'var(--ink)' }}>
                    {u.sessions_count || 0}
                  </span>
                </td>
                <td style={{ padding: '12px 14px' }}>
                  <select
                    value={u.role}
                    onChange={(e) => updateRole(u.id, e.target.value)}
                    style={{ fontFamily: 'var(--font-sans), sans-serif', fontSize: '12px', border: '1px solid var(--cream-border)', borderRadius: '6px', padding: '4px 8px', background: 'var(--white)', cursor: 'pointer', color: u.role === 'admin' ? '#B01F1F' : 'var(--ink)' }}
                  >
                    <option value="user">user</option>
                    <option value="admin">admin</option>
                  </select>
                </td>
                <td style={{ padding: '12px 14px' }}>
                  {deletingId === u.id ? (
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <input 
                        type="text" 
                        placeholder="Type delete" 
                        value={deleteConfirmText}
                        onChange={(e) => setDeleteConfirmText(e.target.value)}
                        style={{ fontFamily: 'var(--font-sans), sans-serif', fontSize: '11px', border: '1px solid var(--cream-border)', borderRadius: '4px', padding: '4px 6px', width: '80px', outline: 'none' }}
                      />
                      <button 
                        onClick={() => handleDelete(u.id)}
                        disabled={isDeleting}
                        style={{ background: '#B01F1F', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 8px', fontSize: '11px', cursor: isDeleting ? 'wait' : 'pointer' }}
                      >
                        {isDeleting ? '...' : 'Confirm'}
                      </button>
                      <button 
                        onClick={() => { setDeletingId(null); setDeleteConfirmText(''); }}
                        disabled={isDeleting}
                        style={{ background: 'var(--cream)', color: 'var(--ink)', border: '1px solid var(--cream-border)', borderRadius: '4px', padding: '4px 8px', fontSize: '11px', cursor: 'pointer' }}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => { setDeletingId(u.id); setDeleteConfirmText(''); }}
                      style={{ background: 'transparent', color: '#B01F1F', border: '1px solid #B01F1F', borderRadius: '4px', padding: '4px 8px', fontSize: '11px', cursor: 'pointer', fontFamily: 'var(--font-sans), sans-serif' }}
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
