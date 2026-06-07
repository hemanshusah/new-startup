'use client'

import React from 'react'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  children, 
  style, 
  className = '', 
  ...props 
}: ButtonProps) {
  
  // Base style configurations mapped to design tokens
  const baseStyles: React.CSSProperties = {
    fontFamily: 'var(--font-sans, sans-serif)',
    fontWeight: 600,
    borderRadius: '8px',
    border: '1px solid transparent',
    cursor: props.disabled ? 'not-allowed' : 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.15s ease-in-out',
    opacity: props.disabled ? 0.6 : 1,
    gap: '8px',
  }

  // Variant-specific overrides
  const variantStyles: Record<string, React.CSSProperties> = {
    primary: {
      background: 'var(--accent, #b8460a)',
      color: 'var(--white, #ffffff)',
      borderColor: 'var(--accent, #b8460a)',
    },
    secondary: {
      background: 'var(--white, #ffffff)',
      color: 'var(--ink, #1a1814)',
      borderColor: 'var(--cream-border, #e6e2da)',
    },
    tertiary: {
      background: 'var(--cream, #f5f2eb)',
      color: 'var(--ink, #1a1814)',
      borderColor: 'var(--cream-border, #e6e2da)',
    },
    danger: {
      background: '#dc2626',
      color: '#ffffff',
      borderColor: '#dc2626',
    },
    ghost: {
      background: 'transparent',
      color: 'inherit',
      borderColor: 'transparent',
      padding: 0,
    }
  }

  // Size configurations
  const sizeStyles: Record<string, React.CSSProperties> = {
    sm: {
      fontSize: '12.5px',
      padding: '6px 12px',
    },
    md: {
      fontSize: '14.5px',
      padding: '10px 20px',
    },
    lg: {
      fontSize: '16.5px',
      padding: '14px 28px',
    }
  }

  const mergedStyles: React.CSSProperties = {
    ...baseStyles,
    ...variantStyles[variant],
    ...sizeStyles[size],
    ...style,
  }

  return (
    <button 
      style={mergedStyles} 
      className={`btn-atom btn-${variant} btn-${size} ${className}`} 
      {...props}
    >
      {children}
    </button>
  )
}
