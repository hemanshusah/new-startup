'use client'

import React, { useEffect, useRef } from 'react'
import type { SoftInfra } from '@/types/softinfra'

interface InlineSIProps {
  si: SoftInfra
}

/**
 * InlineSI — full-width horizontal detail-page content slot.
 * Format: icon/emoji | headline (DM Serif) | description | CTA link
 * Background: `--cream-dark`
 * CONTEXT.md §8 → format: `inline`
 */
export function InlineSI({ si }: InlineSIProps) {
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
        alignItems: 'center',
        gap: '16px',
        background: 'var(--cream-dark)',
        border: si.is_image_only ? 'none' : '1px solid var(--cream-border)',
        borderRadius: '12px',
        padding: si.is_image_only ? '0' : '18px 22px',
        textDecoration: 'none',
        transition: 'background 0.15s ease',
        position: 'relative',
        overflow: 'hidden',
        minHeight: si.is_image_only ? '100px' : 'auto',
      }}
      className="inline-si-link"
      aria-label={`Sponsored: ${si.headline}`}
    >
      {si.is_image_only && si.image_url ? (
        <img 
          src={si.image_url} 
          alt={si.headline || si.advertiser} 
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} 
        />
      ) : (
        <>
          {/* Icon / emoji */}
          {(si.icon_emoji || si.image_url) && (
            <div
              style={{
                flexShrink: 0,
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: 'var(--white)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '22px',
                border: '1px solid var(--cream-border)',
                overflow: 'hidden',
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

          {/* Text block */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                fontFamily: 'var(--font-sans), sans-serif',
                fontSize: '10px',
                fontWeight: 500,
                color: 'var(--ink-4)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                margin: '0 0 3px',
              }}
            >
              Sponsored · {si.advertiser}
            </p>
            <p
              style={{
                fontFamily: 'var(--font-serif), serif',
                fontSize: '15.5px',
                fontWeight: 400,
                color: 'var(--ink)',
                margin: '0 0 3px',
                lineHeight: 1.3,
              }}
            >
              {si.headline}
            </p>
            <p
              style={{
                fontFamily: 'var(--font-sans), sans-serif',
                fontSize: '12.5px',
                fontWeight: 300,
                color: 'var(--ink-2)',
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              {si.subtext}
            </p>
          </div>

          {/* CTA */}
          <div
            style={{
              flexShrink: 0,
              fontFamily: 'var(--font-sans), sans-serif',
              fontSize: '12px',
              fontWeight: 500,
              color: 'var(--accent)',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            {si.cta_text} →
          </div>
        </>
      )}
    </a>
  )
}
