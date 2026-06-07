'use client'

import React from 'react'

interface CategoryPillProps {
  label: string
  icon: React.ComponentType<{ size?: number; color?: string; style?: React.CSSProperties }>
  active: boolean
  onClick: () => void
  style?: React.CSSProperties
  className?: string
}

export function CategoryPill({
  label,
  icon: IconComponent,
  active,
  onClick,
  style,
  className = ''
}: CategoryPillProps) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        minWidth: '110px',
        padding: '14px 12px',
        borderRadius: '12px',
        background: active ? 'var(--white)' : 'transparent',
        border: active ? '2px solid var(--accent)' : '1px solid var(--cream-border)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        outline: 'none',
        flexShrink: 0,
        ...style
      }}
      className={`category-btn ${active ? 'active' : ''} ${className}`}
    >
      <IconComponent 
        size={18} 
        color={active ? 'var(--accent)' : 'var(--ink-3)'} 
        style={{ transition: 'color 0.2s ease' }}
      />
      <span style={{
        fontSize: '12px',
        fontWeight: active ? 600 : 500,
        color: active ? 'var(--ink)' : 'var(--ink-2)',
        whiteSpace: 'nowrap',
        fontFamily: 'var(--font-sans)'
      }}>
        {label}
      </span>
    </button>
  )
}
