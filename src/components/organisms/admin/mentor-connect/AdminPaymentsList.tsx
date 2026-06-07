'use client'

import React, { useState } from 'react'

interface AdminPaymentsListProps {
  initialSessions: any[]
}

export function AdminPaymentsList({ initialSessions }: AdminPaymentsListProps) {
  const [sessions, setSessions] = useState(initialSessions)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Dummy trigger for receipts
  const handleGenerateReceipt = (sessionId: string) => {
    alert(`Receipt generation initialized for booking: ${sessionId}.\nStatus: Integration Pending (Mocked Trigger Success).`)
  }

  if (sessions.length === 0) {
    return (
      <div style={{ background: 'var(--white)', border: '1px solid var(--cream-border)', borderRadius: '12px', padding: '48px', textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--ink-4)' }}>No transactions found.</p>
      </div>
    )
  }

  return (
    <div style={{ background: 'var(--white)', border: '1px solid var(--cream-border)', borderRadius: '12px', overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-sans)', fontSize: '13px' }}>
        <thead>
          <tr style={{ background: 'var(--cream)', borderBottom: '1px solid var(--cream-border)' }}>
            <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--ink-3)' }}>Transaction Details</th>
            <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--ink-3)' }}>Booking Reference</th>
            <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--ink-3)' }}>Booking Status</th>
            <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--ink-3)' }}>Payment Status</th>
            <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--ink-3)' }}>Date Created</th>
            <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, color: 'var(--ink-3)' }}>Amount</th>
            <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600, color: 'var(--ink-3)' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((s) => {
            const hasPaymentId = !!s.razorpay_payment_id
            const isPaid = s.status === 'confirmed' || s.status === 'completed'
            const isPending = s.status === 'pending_payment'
            const isCancelled = s.status === 'cancelled'

            // Diagnostics and error detection
            let diagnostics = 'All operations succeeded.'
            let isError = false

            if (isPaid && !s.google_meet_link && s.scheduled_start) {
              diagnostics = '⚠️ Calendar Error: Google Meet Link Generation Failed'
              isError = true
            } else if (isPending && hasPaymentId) {
              diagnostics = '⚠️ Delay: Razorpay payment received but session state is pending verification.'
              isError = true
            } else if (isPending) {
              diagnostics = 'Payment checkout initiated. Awaiting Razorpay verification.'
            } else if (isCancelled) {
              diagnostics = 'Booking cancelled. Seat released.'
            } else if (!s.scheduled_start) {
              diagnostics = '🛡️ Archived: This booking has been Soft-Cleaned by Admin.'
            }

            return (
              <React.Fragment key={s.id}>
                <tr style={{ borderBottom: '1px solid var(--cream-border)', background: expandedId === s.id ? 'var(--cream-light)' : 'transparent' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 600, color: 'var(--ink)' }}>
                      {s.razorpay_payment_id || '—'}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--ink-4)', marginTop: '2px' }}>
                      Order: {s.razorpay_order_id || '—'}
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 500, color: 'var(--ink)' }}>
                      {s.founder?.full_name || '—'} ➔ {s.mentor_profiles?.display_name || '—'}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--ink-4)', marginTop: '2px' }}>
                      {s.session_type?.name || '—'}
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 600,
                      background: isPaid ? '#EDF5EA' : isPending ? '#FFF9E6' : '#FDF0EA',
                      color: isPaid ? '#2A6620' : isPending ? '#856404' : '#B8460A',
                    }}>
                      {s.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 600,
                        background: isPaid ? '#EDF5EA' : isPending && !hasPaymentId ? 'var(--cream-dark)' : isError ? '#FFF9E6' : '#FDF0EA',
                        color: isPaid ? '#2A6620' : isPending && !hasPaymentId ? 'var(--ink-4)' : isError ? '#856404' : '#B8460A',
                      }}>
                        {isPaid ? '✓ Received' : isPending && hasPaymentId ? '⏳ Processing' : isPending ? '○ Pending' : '✕ Cancelled'}
                      </span>
                    </div>
                    {isError && (
                      <div style={{ fontSize: '10px', color: '#B8460A', marginTop: '6px', fontWeight: 500 }}>
                        {diagnostics}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--ink-3)' }}>
                    <div>{new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                    <div style={{ fontSize: '11px', opacity: 0.8 }}>{new Date(s.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--ink)', fontWeight: 600, textAlign: 'right' }}>
                    ₹{(s.amount_inr || 0).toLocaleString()}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button
                        onClick={() => setExpandedId(expandedId === s.id ? null : s.id)}
                        style={{
                          background: 'none',
                          border: '1px solid var(--cream-border)',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          cursor: 'pointer',
                          color: 'var(--ink-3)',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {expandedId === s.id ? 'Close' : 'Diagnostics'}
                      </button>
                      <button
                        onClick={() => handleGenerateReceipt(s.id)}
                        style={{
                          background: 'var(--cream)',
                          border: '1px solid var(--cream-border)',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          cursor: 'pointer',
                          color: 'var(--ink)',
                          fontWeight: 500,
                          whiteSpace: 'nowrap'
                        }}
                      >
                        Receipt 🧾
                      </button>
                    </div>
                  </td>
                </tr>
                {expandedId === s.id && (
                  <tr>
                    <td colSpan={7} style={{ padding: '24px', background: 'var(--white)', borderBottom: '1px solid var(--cream-border)' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '32px' }}>
                        <div>
                          <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ink-4)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>
                            Transaction Info
                          </p>
                          <div style={{ background: 'var(--cream)', padding: '14px', borderRadius: '10px', border: '1px solid var(--cream-border)' }}>
                            <p style={{ margin: '0 0 6px', fontSize: '12px', color: 'var(--ink-3)' }}>
                              <strong>Session ID:</strong> <span style={{ fontFamily: 'monospace' }}>{s.id}</span>
                            </p>
                            <p style={{ margin: '0 0 6px', fontSize: '12px', color: 'var(--ink-3)' }}>
                              <strong>Razorpay Order:</strong> <span style={{ fontFamily: 'monospace' }}>{s.razorpay_order_id || '—'}</span>
                            </p>
                            <p style={{ margin: 0, fontSize: '12px', color: 'var(--ink-3)' }}>
                              <strong>Razorpay Payment:</strong> <span style={{ fontFamily: 'monospace' }}>{s.razorpay_payment_id || '—'}</span>
                            </p>
                          </div>
                        </div>

                        <div>
                          <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ink-4)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>
                            Diagnostics & Operations
                          </p>
                          <div style={{ background: isError ? '#FFF4F2' : '#EDF5EA', padding: '14px', borderRadius: '10px', border: isError ? '1px solid #F0B8B8' : '1px solid #BBF7D0' }}>
                            <p style={{ margin: '0 0 4px', fontSize: '12px', fontWeight: 600, color: isError ? '#B01F1F' : '#2A6620' }}>
                              Status: {isError ? 'Action Required' : 'Healthy'}
                            </p>
                            <p style={{ margin: 0, fontSize: '12px', color: isError ? '#B01F1F' : '#2A6620', lineHeight: 1.4 }}>
                              {diagnostics}
                            </p>
                          </div>
                        </div>

                        <div>
                          <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ink-4)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>
                            Booking Receipt Actions
                          </p>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <button
                              onClick={() => handleGenerateReceipt(s.id)}
                              style={{
                                width: '100%',
                                padding: '10px',
                                background: 'var(--ink)',
                                color: 'var(--white)',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '12px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'background 0.2s ease'
                              }}
                            >
                              Generate PDF Receipt
                            </button>
                            <p style={{ margin: 0, fontSize: '11px', color: 'var(--ink-4)', lineHeight: 1.4, textAlign: 'center' }}>
                              Generates a downloadable payment receipt containing booking duration, GST, and payouts.
                            </p>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
