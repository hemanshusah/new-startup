'use client'

import React, { useEffect, useRef } from 'react'
import type { SoftInfra } from '@/types/softinfra'

interface SoftInfraCardProps {
  si: SoftInfra
}

export function SoftInfraCard({ si }: SoftInfraCardProps) {
  const isDark = si.format === 'card-dark'
  const isWide = si.format === 'card-wide' || si.format === 'card-dark'
  const isInline = si.format === 'inline'

  const hasFired = useRef(false)

  useEffect(() => {
    if (hasFired.current || si.id === 'preview') return
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
        flexDirection: isInline ? 'row' : 'column',
        alignItems: isInline ? 'center' : 'stretch',
        justifyContent: 'space-between',
        padding: si.is_image_only ? '0' : (isInline ? '18px 24px' : '24px'),
        textDecoration: 'none',
        background: isDark ? 'var(--ink)' : 'var(--cream-dark)',
        gridColumn: isInline ? 'span 3' : (isWide ? 'span 2' : 'span 1'),
        border: (isDark || si.is_image_only) ? 'none' : '1px solid var(--cream-border)',
        borderRadius: '0', 
        position: 'relative',
        overflow: 'hidden',
        minHeight: (isInline && !si.is_image_only) ? 'auto' : '280px',
      }}
      className="si-card-link"
      aria-label={`Sponsored: ${si.headline}`}
    >
      {si.is_image_only && si.image_url ? (
        <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
          <img 
            src={si.image_url} 
            alt={si.headline || si.advertiser} 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          />
        </div>
      ) : (
        <>
          <div style={{ position: 'relative', zIndex: 2, display: isInline ? 'flex' : 'block', alignItems: 'center', gap: '20px', flex: 1, minWidth: 0 }}>
            {/* Left/Top Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize: '10px',
                  fontWeight: 500,
                  color: isDark ? 'var(--ink-4)' : 'var(--ink-3)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  margin: '0 0 8px',
                }}
              >
                Sponsored · {si.advertiser}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {(si.icon_emoji || si.image_url) && (
                  <div
                    style={{
                      flexShrink: 0,
                      width: isInline ? '42px' : '48px',
                      height: isInline ? '42px' : '48px',
                      background: isDark ? 'var(--ink-2)' : 'var(--white)',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: isInline ? '22px' : '24px',
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

                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3
                    style={{
                      fontFamily: 'DM Serif Display, serif',
                      fontSize: isInline ? '18px' : (isWide ? '28px' : '20px'),
                      fontWeight: 400,
                      color: isDark ? 'white' : 'var(--ink)',
                      lineHeight: 1.25,
                      margin: '0 0 4px',
                    }}
                  >
                    {si.headline}
                  </h3>

                  {(!isInline || (isInline && si.subtext)) && (
                    <p
                      style={{
                        fontFamily: 'DM Sans, sans-serif',
                        fontSize: '13.5px',
                        fontWeight: 300,
                        color: isDark ? 'var(--ink-4)' : 'var(--ink-2)',
                        lineHeight: 1.6,
                        margin: 0,
                        maxWidth: isInline ? 'none' : '90%',
                      }}
                    >
                      {si.subtext}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: isInline ? '0' : '24px',
              marginLeft: isInline ? '24px' : '0',
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '13px',
              fontWeight: 500,
              color: isDark ? 'var(--cream)' : 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              position: 'relative',
              zIndex: 2,
              whiteSpace: 'nowrap',
            }}
          >
            {si.cta_text} <span>→</span>
          </div>
        </>
      )}
    </a>
  )
}
