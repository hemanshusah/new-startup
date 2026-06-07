'use client'

import React from 'react'

interface SpinnerProps {
  size?: number
  strokeWidth?: number
  color?: string
  backgroundColor?: string
  style?: React.CSSProperties
  className?: string
}

export function Spinner({ 
  size = 24, 
  strokeWidth = 3, 
  color = 'var(--accent, #b8460a)', 
  backgroundColor = 'var(--cream, #f5f2eb)', 
  style, 
  className 
}: SpinnerProps) {
  
  return (
    <div 
      className={`spinner-atom ${className || ''}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        border: `${strokeWidth}px solid ${backgroundColor}`,
        borderTop: `${strokeWidth}px solid ${color}`,
        borderRadius: '50%',
        animation: 'spinner-spin 1s linear infinite',
        display: 'inline-block',
        boxSizing: 'border-box',
        ...style
      }}
    >
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes spinner-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}} />
    </div>
  )
}
