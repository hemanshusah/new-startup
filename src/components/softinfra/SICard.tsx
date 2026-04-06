'use client'

import React, { useEffect, useRef } from 'react'
import type { SoftInfra } from '@/types/softinfra'

interface SoftInfraCardProps {
  si: SoftInfra
}

export function SoftInfraCard({ si }: SoftInfraCardProps) {
  const isDark = si.format === 'card-dark'
  const isWide = si.format === 'card-wide' || si.format === 'card-dark'

  const hasFired = useRef(false)

  useEffect(() => {
    if (hasFired.current) return
    hasFired.current = true

    // Track impression
    fetch('/api/softinfra/impression', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ si_id: si.id }),
    }).catch((err) => console.error('Failed to log impression', err))
  }, [si.id])


  return (
    <a
      href={`/api/softinfra/click?id=${si.id}&url=${encodeURIComponent(si.cta_url)}`}
      target="_blank"
      rel="noopener noreferrer sponsored"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '24px',
        textDecoration: 'none',
        background: isDark ? 'var(--ink)' : 'var(--cream-dark)',
        gridColumn: isWide ? 'span 2' : 'span 1',
        border: isDark ? 'none' : '1px solid var(--cream-border)',
        borderRadius: '0', 
        position: 'relative',
        overflow: 'hidden',
        minHeight: '280px',
      }}
      className="si-card-link"
    >
      <div style={{ position: 'relative', zIndex: 2 }}>
        <p
          style={{
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '10px',
            fontWeight: 500,
            color: isDark ? 'var(--ink-4)' : 'var(--ink-3)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            margin: '0 0 16px',
          }}
        >
          Sponsored · {si.advertiser}
        </p>

        {(si.icon_emoji || si.image_url) && (
          <div
            style={{
              width: '48px',
              height: '48px',
              background: isDark ? 'var(--ink-2)' : 'var(--white)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              marginBottom: '16px',
              border: isDark ? 'none' : '1px solid var(--cream-border)',
              overflow: 'hidden',
            }}
          >
            {si.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={si.image_url} alt="" style={{ width: '100%', objectFit: 'cover' }} />
            ) : (
              si.icon_emoji
            )}
          </div>
        )}

        <h3
          style={{
            fontFamily: 'DM Serif Display, serif',
            fontSize: isWide ? '28px' : '20px',
            fontWeight: 400,
            color: isDark ? 'white' : 'var(--ink)',
            lineHeight: 1.25,
            margin: '0 0 8px',
          }}
        >
          {si.headline}
        </h3>

        <p
          style={{
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '13.5px',
            fontWeight: 300,
            color: isDark ? 'var(--ink-4)' : 'var(--ink-2)',
            lineHeight: 1.6,
            margin: 0,
            maxWidth: '90%',
          }}
        >
          {si.subtext}
        </p>
      </div>

      <div
        style={{
          marginTop: '24px',
          fontFamily: 'DM Sans, sans-serif',
          fontSize: '13px',
          fontWeight: 500,
          color: isDark ? 'var(--cream)' : 'var(--accent)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          position: 'relative',
          zIndex: 2,
        }}
      >
        {si.cta_text} <span>→</span>
      </div>
    </a>
  )
}
