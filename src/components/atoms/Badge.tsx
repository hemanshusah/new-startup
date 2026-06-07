'use client'

import React from 'react'
import { ShieldCheck, Star } from 'lucide-react'

export type BadgeVariant = 
  | 'advance' 
  | 'verified' 
  | 'top-rated' 
  | 'available' 
  | 'coming-soon'
  | 'grant' 
  | 'incubation' 
  | 'accelerator' 
  | 'contest' 
  | 'funding' 
  | 'seed'
  | 'closed'
  | 'open'
  | 'days-left'
  | 'type-pill'

interface BadgeProps {
  variant: BadgeVariant
  label?: string
  style?: React.CSSProperties
  className?: string
}

export function Badge({ variant, label, style, className = '' }: BadgeProps) {
  
  // Base atomic badges for Mentor Module
  if (variant === 'advance') {
    return (
      <span className={`badge-advance ${className}`} style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        fontSize: '10px',
        fontWeight: 700,
        background: '#1E1B4B',
        color: '#FCD34D',
        border: '1px solid #F59E0B',
        padding: '4px 8px',
        borderRadius: '4px',
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        ...style
      }}>
        <ShieldCheck size={11} color="#FCD34D" />
        {label || 'Advance'}
      </span>
    )
  }

  if (variant === 'verified') {
    return (
      <span className={`badge-verified ${className}`} style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        fontSize: '10px',
        fontWeight: 700,
        background: 'var(--white)',
        color: 'var(--accent)',
        border: '1px solid var(--cream-border)',
        padding: '4px 8px',
        borderRadius: '4px',
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        ...style
      }}>
        <ShieldCheck size={11} color="var(--accent)" />
        {label || 'Verified'}
      </span>
    )
  }

  if (variant === 'top-rated') {
    return (
      <span className={`badge-top-rated ${className}`} style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        fontSize: '10px',
        fontWeight: 700,
        background: '#FFF9EA',
        color: '#D97706',
        border: '1px solid rgba(217, 119, 6, 0.2)',
        padding: '4px 8px',
        borderRadius: '4px',
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        ...style
      }}>
        <Star size={11} fill="#D97706" color="#D97706" />
        {label || 'Top Rated'}
      </span>
    )
  }

  if (variant === 'available') {
    return (
      <span className={`badge-available ${className}`} style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        fontSize: '10px',
        fontWeight: 700,
        background: '#E6F4EA',
        color: '#137333',
        border: '1px solid rgba(19, 115, 51, 0.2)',
        padding: '4px 8px',
        borderRadius: '4px',
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        ...style
      }}>
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#137333', display: 'inline-block' }} />
        {label || 'Available ASAP'}
      </span>
    )
  }

  if (variant === 'coming-soon') {
    return (
      <span className={`coming-soon-badge ${className}`} style={style}>
        {label || 'Coming Soon'}
      </span>
    )
  }

  // Program Type Badges
  const TYPE_COLORS: Record<string, { bg: string; color: string }> = {
    grant:       { bg: '#EDF5EA', color: '#2A6620' },
    incubation:  { bg: 'var(--accent-light)', color: 'var(--accent)' },
    accelerator: { bg: '#EEF3FD', color: '#2B4EA8' },
    contest:     { bg: '#FDF5EE', color: '#9B5A00' },
    funding:     { bg: '#F3EEF9', color: '#7040A0' },
    seed:        { bg: '#E8F5FA', color: '#005D80' },
  }

  if (TYPE_COLORS[variant]) {
    const colors = TYPE_COLORS[variant]
    return (
      <span className={`badge-type-${variant} ${className}`} style={{
        display: 'inline-block',
        fontFamily: 'var(--font-sans)',
        fontSize: '10.5px',
        fontWeight: 500,
        color: colors.color,
        background: colors.bg,
        borderRadius: '4px',
        padding: '3px 8px',
        textTransform: 'capitalize',
        ...style
      }}>
        {label || variant}
      </span>
    )
  }

  // General statuses
  if (variant === 'closed') {
    return (
      <span className={`badge-status-closed ${className}`} style={{
        display: 'inline-block',
        fontFamily: 'var(--font-sans)',
        fontSize: '10.5px',
        fontWeight: 500,
        color: 'var(--ink-4)',
        background: 'var(--cream-dark)',
        border: '1px solid var(--cream-border)',
        borderRadius: '4px',
        padding: '3px 8px',
        textTransform: 'capitalize',
        ...style
      }}>
        ● {label || 'Closed'}
      </span>
    )
  }

  if (variant === 'open') {
    return (
      <span className={`badge-status-open ${className}`} style={{
        display: 'inline-block',
        fontFamily: 'var(--font-sans)',
        fontSize: '10.5px',
        fontWeight: 500,
        color: '#1E6E2E',
        background: '#EDF5EA',
        border: '1px solid #A8D4A0',
        borderRadius: '4px',
        padding: '3px 8px',
        textTransform: 'capitalize',
        ...style
      }}>
        ● {label || 'Open'}
      </span>
    )
  }

  if (variant === 'days-left') {
    return (
      <span className={`badge-days-left ${className}`} style={{
        fontSize: '11px',
        fontWeight: 600,
        color: '#d93025',
        background: '#fef2f2',
        padding: '2px 6px',
        borderRadius: '4px',
        display: 'inline-block',
        ...style
      }}>
        {label}
      </span>
    )
  }

  if (variant === 'type-pill') {
    return (
      <span className={`badge-type-pill ${className}`} style={{
        fontSize: '10px',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        background: 'var(--bg)',
        padding: '4px 10px',
        borderRadius: '100px',
        color: 'var(--ink-3)',
        display: 'inline-block',
        ...style
      }}>
        {label}
      </span>
    )
  }

  return null
}
