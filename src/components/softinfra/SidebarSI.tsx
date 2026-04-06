'use client'

import React, { useEffect, useRef } from 'react'
import type { SoftInfra } from '@/types/softinfra'

interface SidebarSIProps {
  si: SoftInfra
}

/**
 * SidebarSI — vertical stacked content in the detail page sidebar.
 * Format: sponsored label | emoji | headline | description | CTA button
 * CONTEXT.md §8 → format: `sidebar`
 */
export function SidebarSI({ si }: SidebarSIProps) {
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
        display: 'block',
        background: 'var(--cream-dark)',
        border: '1px solid var(--cream-border)',
        borderRadius: '12px',
        padding: '18px',
        textDecoration: 'none',
      }}
      aria-label={`Sponsored: ${si.headline}`}
    >
      {/* Sponsored label */}
      <p
        style={{
          fontFamily: 'DM Sans, sans-serif',
          fontSize: '9.5px',
          fontWeight: 500,
          color: 'var(--ink-4)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          margin: '0 0 12px',
        }}
      >
        Sponsored · {si.advertiser}
      </p>

      {/* Icon / image */}
      {(si.icon_emoji || si.image_url) && (
        <div
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '9px',
            background: 'var(--white)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            border: '1px solid var(--cream-border)',
            overflow: 'hidden',
            marginBottom: '12px',
          }}
        >
          {si.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={si.image_url} alt={si.advertiser} style={{ width: '100%', objectFit: 'cover' }} />
          ) : (
            si.icon_emoji
          )}
        </div>
      )}

      {/* Headline */}
      <p
        style={{
          fontFamily: 'DM Serif Display, serif',
          fontSize: '14.5px',
          fontWeight: 400,
          color: 'var(--ink)',
          margin: '0 0 6px',
          lineHeight: 1.3,
        }}
      >
        {si.headline}
      </p>

      {/* Sub-text */}
      <p
        style={{
          fontFamily: 'DM Sans, sans-serif',
          fontSize: '12px',
          fontWeight: 300,
          color: 'var(--ink-2)',
          margin: '0 0 14px',
          lineHeight: 1.55,
        }}
      >
        {si.subtext}
      </p>

      {/* CTA button */}
      <div
        style={{
          display: 'inline-block',
          fontFamily: 'DM Sans, sans-serif',
          fontSize: '12px',
          fontWeight: 500,
          color: 'var(--cream)',
          background: 'var(--ink)',
          borderRadius: '6px',
          padding: '7px 14px',
        }}
      >
        {si.cta_text}
      </div>
    </a>
  )
}
