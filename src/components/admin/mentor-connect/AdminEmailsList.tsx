'use client'

import { useState } from 'react'

interface EmailLog {
  id: string
  to: string
  subject: string
  text?: string
  html?: string
  state: 'SUCCESS' | 'PENDING' | 'ERROR' | 'UNKNOWN'
  error?: string
  attempts: number
  endTime?: string
  createdAt?: string
}

interface AdminEmailsListProps {
  initialEmails: EmailLog[]
}

export function AdminEmailsList({ initialEmails }: AdminEmailsListProps) {
  const [emails, setEmails] = useState<EmailLog[]>(initialEmails)
  const [search, setSearch] = useState('')
  const [selectedEmail, setSelectedEmail] = useState<EmailLog | null>(null)
  const [filterState, setFilterState] = useState<'ALL' | 'SUCCESS' | 'PENDING' | 'ERROR'>('ALL')

  const filteredEmails = emails.filter(email => {
    const matchesSearch = 
      email.to.toLowerCase().includes(search.toLowerCase()) || 
      email.subject.toLowerCase().includes(search.toLowerCase())
    
    if (filterState === 'ALL') return matchesSearch
    return matchesSearch && email.state === filterState
  })

  return (
    <div style={{ display: 'grid', gridTemplateColumns: selectedEmail ? '1.2fr 1fr' : '1fr', gap: '24px', transition: 'all 0.3s ease' }}>
      
      {/* Table Side */}
      <div>
        {/* Filters and Search Bar */}
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Search by recipient or subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: 1,
              minWidth: '240px',
              padding: '10px 14px',
              border: '1px solid var(--cream-border)',
              borderRadius: '8px',
              fontSize: '13px',
              fontFamily: 'var(--font-sans)',
              outline: 'none',
              background: 'var(--white)'
            }}
          />

          <div style={{ display: 'flex', background: 'var(--white)', border: '1px solid var(--cream-border)', borderRadius: '8px', padding: '2px' }}>
            {(['ALL', 'SUCCESS', 'PENDING', 'ERROR'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilterState(tab)}
                style={{
                  padding: '6px 12px',
                  background: filterState === tab ? 'var(--cream-dark)' : 'none',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontFamily: 'var(--font-sans)',
                  color: 'var(--ink)',
                  fontWeight: filterState === tab ? 600 : 400,
                  cursor: 'pointer'
                }}
              >
                {tab === 'ALL' ? 'All' : tab.charAt(0) + tab.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Email Logs Table */}
        {filteredEmails.length === 0 ? (
          <div style={{ background: 'var(--white)', border: '1px solid var(--cream-border)', borderRadius: '12px', padding: '48px', textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--ink-4)', margin: 0 }}>
              No email logs found.
            </p>
          </div>
        ) : (
          <div style={{ background: 'var(--white)', border: '1px solid var(--cream-border)', borderRadius: '12px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-sans)', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: 'var(--cream)', borderBottom: '1px solid var(--cream-border)' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 500, color: 'var(--ink-3)' }}>Recipient</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 500, color: 'var(--ink-3)' }}>Subject</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 500, color: 'var(--ink-3)' }}>Triggered</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 500, color: 'var(--ink-3)' }}>State</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 500, color: 'var(--ink-3)' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmails.map((email) => {
                  const isSelected = selectedEmail?.id === email.id
                  return (
                    <tr 
                      key={email.id} 
                      style={{ 
                        borderBottom: '1px solid var(--cream-border)', 
                        background: isSelected ? 'var(--cream)' : 'none',
                        cursor: 'pointer',
                        transition: 'background 0.2s'
                      }}
                      onClick={() => setSelectedEmail(email)}
                    >
                      <td style={{ padding: '16px 12px', color: 'var(--ink)', fontWeight: 500 }}>
                        {email.to}
                      </td>
                      <td style={{ padding: '16px 12px', color: 'var(--ink)' }}>
                        {email.subject}
                      </td>
                      <td style={{ padding: '16px 12px', color: 'var(--ink-3)', fontSize: '12px' }}>
                        {email.createdAt ? new Date(email.createdAt).toLocaleString() : '—'}
                      </td>
                      <td style={{ padding: '16px 12px' }}>
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 500,
                          background: 
                            email.state === 'SUCCESS' ? '#EDF5EA' : 
                            email.state === 'PENDING' ? '#FEF3C7' : 
                            email.state === 'ERROR' ? '#FEF2F2' : '#F4F4F5',
                          color: 
                            email.state === 'SUCCESS' ? '#166534' : 
                            email.state === 'PENDING' ? '#B45309' : 
                            email.state === 'ERROR' ? '#B91C1C' : '#71717A',
                        }}>
                          {email.state}
                        </span>
                      </td>
                      <td style={{ padding: '16px 12px' }}>
                        <button
                          style={{
                            padding: '4px 8px',
                            background: 'none',
                            border: '1px solid var(--cream-border)',
                            borderRadius: '4px',
                            fontSize: '11px',
                            color: 'var(--ink-3)',
                            cursor: 'pointer'
                          }}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details Side Panel */}
      {selectedEmail && (
        <div style={{ background: 'var(--white)', border: '1px solid var(--cream-border)', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', height: 'fit-content' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--cream-border)', paddingBottom: '12px' }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '16px', fontWeight: 600, color: 'var(--ink)', margin: 0 }}>
              Email Delivery Log
            </h3>
            <button 
              onClick={() => setSelectedEmail(null)}
              style={{ background: 'none', border: 'none', fontSize: '18px', color: 'var(--ink-4)', cursor: 'pointer' }}
            >
              ✕
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
            <div>
              <span style={{ color: 'var(--ink-4)', display: 'block', marginBottom: '2px', fontWeight: 500 }}>Recipient</span>
              <strong style={{ color: 'var(--ink)' }}>{selectedEmail.to}</strong>
            </div>

            <div>
              <span style={{ color: 'var(--ink-4)', display: 'block', marginBottom: '2px', fontWeight: 500 }}>Subject</span>
              <strong style={{ color: 'var(--ink)' }}>{selectedEmail.subject}</strong>
            </div>

            <div>
              <span style={{ color: 'var(--ink-4)', display: 'block', marginBottom: '2px', fontWeight: 500 }}>SMTP Attempts</span>
              <strong style={{ color: 'var(--ink)' }}>{selectedEmail.attempts}</strong>
            </div>

            {selectedEmail.endTime && (
              <div>
                <span style={{ color: 'var(--ink-4)', display: 'block', marginBottom: '2px', fontWeight: 500 }}>Delivered At</span>
                <strong style={{ color: 'var(--ink)' }}>{new Date(selectedEmail.endTime).toLocaleString()}</strong>
              </div>
            )}

            <div>
              <span style={{ color: 'var(--ink-4)', display: 'block', marginBottom: '4px', fontWeight: 500 }}>SMTP Status State</span>
              <span style={{
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                display: 'inline-block',
                background: 
                  selectedEmail.state === 'SUCCESS' ? '#EDF5EA' : 
                  selectedEmail.state === 'PENDING' ? '#FEF3C7' : 
                  selectedEmail.state === 'ERROR' ? '#FEF2F2' : '#F4F4F5',
                color: 
                  selectedEmail.state === 'SUCCESS' ? '#166534' : 
                  selectedEmail.state === 'PENDING' ? '#B45309' : 
                  selectedEmail.state === 'ERROR' ? '#B91C1C' : '#71717A',
              }}>
                {selectedEmail.state}
              </span>
            </div>

            {/* ERROR SUMMARY PANEL */}
            {selectedEmail.state === 'ERROR' && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '8px', padding: '16px', marginTop: '8px' }}>
                <span style={{ color: '#991B1B', fontWeight: 600, display: 'block', marginBottom: '6px', fontSize: '12px' }}>
                  ⚠️ SMTP Error Details
                </span>
                <p style={{ margin: 0, color: '#B91C1C', fontFamily: 'monospace', fontSize: '11px', lineHeight: 1.5, wordBreak: 'break-all' }}>
                  {selectedEmail.error || 'SMTP delivery timed out or failed without logs.'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  )
}
