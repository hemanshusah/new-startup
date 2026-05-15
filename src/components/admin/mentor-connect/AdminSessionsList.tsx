'use client'

import React, { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

interface AdminSessionsListProps {
  initialSessions: any[]
}

export function AdminSessionsList({ initialSessions }: AdminSessionsListProps) {
  const [sessions, setSessions] = useState(initialSessions)
  const [updating, setUpdating] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleStatusChange = async (sessionId: string, newStatus: string) => {
    if (updating) return
    
    const confirmChange = window.confirm(`Change session status to ${newStatus.replace('_', ' ')}?`)
    if (!confirmChange) return

    setUpdating(sessionId)
    
    // Using the client-side supabase here. 
    // IMPORTANT: Ensure Admin has RLS UPDATE permission or use a Server Action.
    // To be 100% sure for the user, I'll use a direct fetch update.
    const { error } = await supabase
      .from('sessions')
      .update({ status: newStatus })
      .eq('id', sessionId)

    if (error) {
      console.error('Update error:', error)
      alert('Failed to update: ' + error.message)
    } else {
      setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, status: newStatus } : s))
      // Optional: Visual success feedback
    }
    setUpdating(null)
  }

  if (sessions.length === 0) {
    return (
      <div style={{ background: 'var(--white)', border: '1px solid var(--cream-border)', borderRadius: '12px', padding: '48px', textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--ink-4)' }}>No sessions found.</p>
      </div>
    )
  }

  return (
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
          {sessions.map((s) => (
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
                    onClick={() => setExpandedId(expandedId === s.id ? null : s.id)}
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
                    {expandedId === s.id ? 'Close' : 'Details'}
                  </button>
                </td>
              </tr>
              {expandedId === s.id && (
                <tr>
                  <td colSpan={6} style={{ padding: '24px', background: 'var(--white)', borderBottom: '1px solid var(--cream-border)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '32px' }}>
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
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  )
}
