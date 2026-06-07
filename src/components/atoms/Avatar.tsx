'use client'

import React from 'react'

interface AvatarProps {
  src?: string | null
  alt: string
  size?: number | string
  style?: React.CSSProperties
  className?: string
}

export function Avatar({ src, alt, size = '100%', style, className }: AvatarProps) {
  const initials = alt
    .split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const containerStyle: React.CSSProperties = {
    width: typeof size === 'number' ? `${size}px` : size,
    height: typeof size === 'number' ? `${size}px` : size,
    borderRadius: '12px',
    border: '1px solid var(--cream-border)',
    overflow: 'hidden',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    ...style,
  }

  if (src) {
    return (
      <div style={containerStyle} className={className}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={src} 
          alt={alt} 
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover'
          }} 
        />
      </div>
    )
  }

  return (
    <div 
      style={{
        ...containerStyle,
        background: 'linear-gradient(135deg, var(--cream) 0%, #EFEBE4 100%)',
      }} 
      className={className}
    >
      <span style={{ 
        fontSize: typeof size === 'number' ? `${size * 0.4}px` : '36px', 
        fontWeight: 600, 
        color: 'var(--ink-3)', 
        fontFamily: 'var(--font-serif, serif)' 
      }}>
        {initials || alt.charAt(0).toUpperCase()}
      </span>
    </div>
  )
}
