'use client'

import React, { useState, useMemo } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { adminSoftCleanSession, adminHardDeleteSession } from '@/lib/mentor-dashboard-actions'

interface AdminSessionsListProps {
  initialSessions: any[]
}

export function AdminSessionsList({ initialSessions }: AdminSessionsListProps) {
  const [sessions, setSessions] = useState(initialSessions)
  const [updating, setUpdating] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Safety Delete States
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')

  // Filters & Sorting States
  const [sortBy, setSortBy] = useState<'closest' | 'latest' | 'furthest'>('latest')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending_payment' | 'confirmed' | 'completed' | 'cancelled'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleStatusChange = async (sessionId: string, newStatus: string) => {
    if (updating) return
    
    const confirmChange = window.confirm(`Change session status to ${newStatus.replace('_', ' ')}?`)
    if (!confirmChange) return

    setUpdating(sessionId)
    
    const { error } = await supabase
      .from('sessions')
      .update({ status: newStatus })
      .eq('id', sessionId)

    if (error) {
      console.error('Update error:', error)
      alert('Failed to update: ' + error.message)
    } else {
      setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, status: newStatus } : s))
    }
    setUpdating(null)
  }

  const handleSoftClean = async (sessionId: string) => {
    if (!confirm('Are you sure you want to soft-clean this session? Booking details will be deleted but financial logs will be preserved.')) return
    setLoadingId(sessionId)
    const result = await adminSoftCleanSession(sessionId)
    setLoadingId(null)

    if (result.error) {
      alert(result.error)
    } else {
      alert('Session soft-cleaned successfully! Schedules cleared, payouts preserved.')
      window.location.reload()
    }
  }

  const handleHardDelete = async (sessionId: string) => {
    if (deleteConfirmText !== 'DELETE') {
      alert('Error: You must type DELETE in the confirmation box to purge this record.')
      return
    }
    if (!confirm('WARNING: This will permanently delete ALL data for this session. This cannot be undone. Proceed?')) return

    setLoadingId(sessionId)
    const result = await adminHardDeleteSession(sessionId)
    setLoadingId(null)

    if (result.error) {
      alert(result.error)
    } else {
      alert('Session record purged permanently.')
      setDeleteConfirmText('')
      setExpandedId(null)
      window.location.reload()
    }
  }

  // Filter & Sort dynamically
  const processedSessions = useMemo(() => {
    let list = [...sessions]

    // 1. Search Query (Mentor, Founder, or Startup)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter((s) => {
        const mentorName = s.mentor_profiles?.display_name?.toLowerCase() || ''
        const founderName = s.founder?.full_name?.toLowerCase() || ''
        const startupName = s.founder?.startup_name?.toLowerCase() || ''
        const sessionName = s.session_type?.name?.toLowerCase() || ''
        return mentorName.includes(q) || founderName.includes(q) || startupName.includes(q) || sessionName.includes(q)
      })
    }

    // 2. Status Filter
    if (statusFilter !== 'all') {
      list = list.filter(s => s.status === statusFilter)
    }

    // 3. Sorting
    list.sort((a, b) => {
      const dateA = new Date(a.scheduled_start).getTime()
      const dateB = new Date(b.scheduled_start).getTime()

      if (sortBy === 'closest') {
        const now = Date.now()
        const diffA = Math.abs(dateA - now)
        const diffB = Math.abs(dateB - now)
        return diffA - diffB // Closest to current time first
      }

      if (sortBy === 'latest') {
        // Latest booked (created_at) first
        const createdA = new Date(a.created_at || a.scheduled_start).getTime()
        const createdB = new Date(b.created_at || b.scheduled_start).getTime()
        return createdB - createdA
      }

      if (sortBy === 'furthest') {
        // Chronological: Furthest into the future first
        return dateB - dateA
      }

      return 0
    })

    return list
  }, [sessions, searchQuery, statusFilter, sortBy])

  return (
    <div>
      {/* Filtering Header for Admins */}
      <div style={{
        background: 'var(--white)',
        border: '1px solid var(--cream-border)',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '24px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '16px',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Search */}
        <div style={{ flex: '1 1 240px' }}>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--ink-4)', textTransform: 'uppercase', marginBottom: '6px' }}>
            Search Session Records
          </label>
          <input
            type="text"
            placeholder="Search by mentor, founder, startup..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid var(--cream-border)',
              background: 'var(--cream)',
              fontFamily: 'var(--font-sans)',
              fontSize: '13px',
              color: 'var(--ink)',
              outline: 'none'
            }}
          />
        </div>

        {/* Sorting */}
        <div style={{ flex: '0 1 180px' }}>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--ink-4)', textTransform: 'uppercase', marginBottom: '6px' }}>
            Sort Timeline
          </label>
          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid var(--cream-border)',
              background: 'var(--cream)',
              fontFamily: 'var(--font-sans)',
              fontSize: '13px',
              color: 'var(--ink)',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="latest">✨ Newest Booked First</option>
            <option value="closest">⏳ Timeline: Closest First</option>
            <option value="furthest">📅 Future Furthest First</option>
          </select>
        </div>

        {/* Status Filter */}
        <div style={{ flex: '0 1 180px' }}>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--ink-4)', textTransform: 'uppercase', marginBottom: '6px' }}>
            Status Filter
          </label>
          <select
            value={statusFilter}
            onChange={(e: any) => setStatusFilter(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid var(--cream-border)',
              background: 'var(--cream)',
              fontFamily: 'var(--font-sans)',
              fontSize: '13px',
              color: 'var(--ink)',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="all">Show All Bookings</option>
            <option value="pending_payment">Pending Payment</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {processedSessions.length === 0 ? (
        <div style={{ background: 'var(--white)', border: '1px solid var(--cream-border)', borderRadius: '12px', padding: '48px', textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--ink-4)' }}>No matching bookings found.</p>
        </div>
      ) : (
        <div style={{ background: 'var(--white)', border: '1px solid var(--cream-border)', borderRadius: '12px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-sans)', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: 'var(--cream)', borderBottom: '1px solid var(--cream-border)' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--ink-3)' }}>Mentor</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--ink-3)' }}>Founder</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--ink-3)' }}>Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--ink-3)' }}>Date & Time</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, color: 'var(--ink-3)' }}>Amount</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600, color: 'var(--ink-3)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {processedSessions.map((s) => (
                <React.Fragment key={s.id}>
                  <tr style={{ borderBottom: '1px solid var(--cream-border)', background: expandedId === s.id ? 'var(--cream-light)' : 'transparent' }}>
                    <td style={{ padding: '12px 16px', color: 'var(--ink)', fontWeight: 500 }}>
                      {s.mentor_profiles?.display_name || '—'}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 500, color: 'var(--ink)' }}>{s.founder?.full_name || '—'}</div>
                      <div style={{ fontSize: '11px', color: 'var(--ink-4)' }}>{s.founder?.startup_name || 'No Startup'}</div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ position: 'relative', display: 'inline-block' }}>
                        <select
                          value={s.status}
                          disabled={updating === s.id}
                          onChange={(e) => handleStatusChange(s.id, e.target.value)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '8px',
                            border: '1px solid var(--cream-border)',
                            fontSize: '11px',
                            fontWeight: 600,
                            background: s.status === 'confirmed' ? '#EDF5EA' : s.status === 'pending_payment' ? '#FFF9E6' : 'var(--cream)',
                            color: s.status === 'confirmed' ? '#2A6620' : s.status === 'pending_payment' ? '#856404' : 'var(--ink-3)',
                            cursor: updating === s.id ? 'wait' : 'pointer',
                            outline: 'none',
                            appearance: 'none',
                            paddingRight: '24px'
                          }}
                        >
                          <option value="pending_payment">Pending Payment</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        {updating === s.id && (
                          <span style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', fontSize: '10px' }}>⏳</span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--ink-3)' }}>
                      <div>{new Date(s.scheduled_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                      <div style={{ fontSize: '11px' }}>{new Date(s.scheduled_start).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--ink-3)', textAlign: 'right' }}>
                      ₹{(s.amount_inr || 0).toLocaleString()}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <button
                        onClick={() => {
                          setExpandedId(expandedId === s.id ? null : s.id)
                          setDeleteConfirmText('')
                        }}
                        style={{
                          background: 'none',
                          border: '1px solid var(--cream-border)',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          cursor: 'pointer',
                          color: 'var(--ink-3)'
                        }}
                      >
                        {expandedId === s.id ? 'Close' : 'Manage 🛠️'}
                      </button>
                    </td>
                  </tr>
                  {expandedId === s.id && (
                    <tr>
                      <td colSpan={6} style={{ padding: '24px', background: 'var(--white)', borderBottom: '1px solid var(--cream-border)' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 1.2fr', gap: '24px' }}>
                          <div>
                            <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ink-4)', textTransform: 'uppercase', marginBottom: '8px' }}>Founder Contact</p>
                            <p style={{ margin: '0 0 4px', fontWeight: 500 }}>{s.founder?.full_name}</p>
                            <p style={{ margin: 0, color: 'var(--ink-3)' }}>{s.founder?.email}</p>
                            <p style={{ margin: '8px 0 0', fontSize: '12px', fontStyle: 'italic', background: 'var(--cream)', padding: '12px', borderRadius: '8px' }}>
                              "{s.founder_brief || 'No brief provided'}"
                            </p>
                          </div>
                          <div>
                            <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ink-4)', textTransform: 'uppercase', marginBottom: '8px' }}>Session Details</p>
                            <p style={{ margin: '0 0 4px', fontWeight: 500 }}>{s.session_type?.name}</p>
                            <p style={{ margin: 0, color: 'var(--ink-3)' }}>Mode: 🎥 Google Meet</p>
                            {s.google_meet_link ? (
                              <a href={s.google_meet_link} target="_blank" style={{ display: 'inline-block', marginTop: '8px', fontSize: '12px', color: 'var(--accent)', fontWeight: 600 }}>Join Link ↗</a>
                            ) : (
                              <p style={{ margin: '8px 0 0', fontSize: '12px', color: 'var(--ink-4)' }}>No meeting link generated yet.</p>
                            )}
                          </div>
                          <div>
                            <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ink-4)', textTransform: 'uppercase', marginBottom: '8px' }}>Financial Overview</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                                <span style={{ color: 'var(--ink-4)' }}>Booking Amount:</span>
                                <span style={{ fontWeight: 500 }}>₹{(s.amount_inr || 0).toLocaleString()}</span>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                                <span style={{ color: 'var(--ink-4)' }}>Platform Fee:</span>
                                <span style={{ fontWeight: 500 }}>₹{(s.platform_commission_inr || 0).toLocaleString()}</span>
                              </div>
                              <div style={{ borderTop: '1px solid var(--cream-border)', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600 }}>
                                <span style={{ color: 'var(--ink)' }}>Mentor Payout:</span>
                                <span style={{ color: 'var(--accent)' }}>₹{(s.mentor_payout_inr || 0).toLocaleString()}</span>
                              </div>
                            </div>
                          </div>

                          {/* Administrative Safety Controls shifted here */}
                          <div style={{ borderLeft: '1px solid var(--cream-border)', paddingLeft: '20px' }}>
                            <p style={{ fontSize: '11px', fontWeight: 700, color: '#DC2626', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>
                              Secure Admin Controls
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                              {/* Soft clean */}
                              <div>
                                <button
                                  onClick={() => handleSoftClean(s.id)}
                                  disabled={loadingId === s.id}
                                  style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    background: '#FFFBEB',
                                    border: '1px solid #FCD34D',
                                    borderRadius: '6px',
                                    color: '#B45309',
                                    fontSize: '11px',
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                  }}
                                >
                                  {loadingId === s.id ? 'Processing...' : '🗑&nbsp; Soft-Clean Session'}
                                </button>
                                <p style={{ margin: '4px 0 0', fontSize: '10px', color: 'var(--ink-4)', lineHeight: 1.3 }}>
                                  Wipes meet links & scheduling but preserves checkout payout data.
                                </p>
                              </div>

                              {/* Hard purge */}
                              <div style={{ borderTop: '1px dashed var(--cream-border)', paddingTop: '10px' }}>
                                <input
                                  type="text"
                                  placeholder='Type "DELETE" to confirm'
                                  value={deleteConfirmText}
                                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                                  style={{
                                    width: '100%',
                                    padding: '6px 10px',
                                    borderRadius: '6px',
                                    border: '1px solid var(--cream-border)',
                                    fontSize: '11px',
                                    outline: 'none',
                                    marginBottom: '6px'
                                  }}
                                />
                                <button
                                  onClick={() => handleHardDelete(s.id)}
                                  disabled={loadingId === s.id || deleteConfirmText !== 'DELETE'}
                                  style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    background: deleteConfirmText === 'DELETE' ? '#FEF2F2' : '#F3F4F6',
                                    border: deleteConfirmText === 'DELETE' ? '1px solid #FCA5A5' : '1px solid #E5E7EB',
                                    borderRadius: '6px',
                                    color: deleteConfirmText === 'DELETE' ? '#DC2626' : '#9CA3AF',
                                    fontSize: '11px',
                                    fontWeight: 600,
                                    cursor: deleteConfirmText === 'DELETE' ? 'pointer' : 'not-allowed'
                                  }}
                                >
                                  🔥 Hard Purge Record
                                </button>
                                <p style={{ margin: '4px 0 0', fontSize: '10px', color: 'var(--ink-4)', lineHeight: 1.3 }}>
                                  Completely erases this session booking row from database.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
