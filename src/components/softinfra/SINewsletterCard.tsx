'use client'

import React, { useState } from 'react'

export function SINewsletterCard() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setStatus('loading')
    // Simulate API call for now — we don't have a backend integrated for newsletter yet
    setTimeout(() => {
      setStatus('success')
      setEmail('')
    }, 1000)
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '32px 24px',
        background: 'var(--cream-dark)',
        gridColumn: 'span 2', // spanning 2 columns typically
        borderRight: '1px solid var(--cream-border)',
        borderBottom: '1px solid var(--cream-border)',
        position: 'relative',
        minHeight: '280px',
      }}
    >
      <div style={{ maxWidth: '400px' }}>
        <p
          style={{
            fontFamily: 'var(--font-sans), sans-serif',
            fontSize: '10px',
            fontWeight: 500,
            color: 'var(--accent)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            margin: '0 0 16px',
          }}
        >
          GrantsIndia Weekly
        </p>

        <h3
          style={{
            fontFamily: 'var(--font-serif), serif',
            fontSize: '28px',
            fontWeight: 400,
            color: 'var(--ink)',
            lineHeight: 1.25,
            margin: '0 0 12px',
          }}
        >
          Never miss a grant deadline again.
        </h3>

        <p
          style={{
            fontFamily: 'var(--font-sans), sans-serif',
            fontSize: '14px',
            fontWeight: 300,
            color: 'var(--ink-2)',
            lineHeight: 1.6,
            margin: '0 0 24px',
          }}
        >
          Join 15,000+ Indian founders getting our curated list of newly opened programs every Tuesday.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px' }}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="founder@startup.com"
            disabled={status === 'loading' || status === 'success'}
            style={{
              flex: 1,
              padding: '12px 16px',
              fontFamily: 'var(--font-sans), sans-serif',
              fontSize: '14px',
              border: '1px solid var(--cream-border)',
              borderRadius: '8px',
              outline: 'none',
              background: 'var(--white)',
            }}
            required
          />
          <button
            type="submit"
            disabled={status === 'loading' || status === 'success'}
            style={{
              padding: '0 20px',
              fontFamily: 'var(--font-sans), sans-serif',
              fontSize: '14px',
              fontWeight: 500,
              color: 'var(--white)',
              background: status === 'success' ? '#2e7d32' : 'var(--accent)',
              border: 'none',
              borderRadius: '8px',
              cursor: status === 'success' ? 'default' : 'pointer',
              transition: 'background 0.2s ease',
              whiteSpace: 'nowrap',
            }}
          >
            {status === 'loading' ? 'Subscribing...' : status === 'success' ? 'Subscribed!' : 'Subscribe'}
          </button>
        </form>
      </div>
    </div>
  )
}
