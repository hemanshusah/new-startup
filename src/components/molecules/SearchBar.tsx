'use client'

import React from 'react'
import { Search, Sparkles } from 'lucide-react'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  onAiSearchClick?: () => void
  style?: React.CSSProperties
  className?: string
}

export function SearchBar({
  value,
  onChange,
  placeholder = 'Search...',
  onAiSearchClick,
  style,
  className = ''
}: SearchBarProps) {
  return (
    <div 
      style={{
        position: 'relative',
        flex: 1,
        minWidth: '280px',
        display: 'flex',
        alignItems: 'center',
        border: '1px solid var(--cream-border)',
        borderRadius: '12px',
        background: 'var(--white)',
        padding: '4px 8px 4px 16px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
        transition: 'all 0.2s ease',
        ...style
      }} 
      className={`search-input-wrapper ${className}`}
    >
      <Search size={16} color="var(--ink-4)" style={{ marginRight: '8px', flexShrink: 0 }} />
      <input 
        type="text" 
        placeholder={placeholder} 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          flex: 1,
          border: 'none',
          outline: 'none',
          padding: '8px 0',
          fontSize: '13.5px',
          color: 'var(--ink)',
          background: 'transparent',
          fontFamily: 'var(--font-sans)'
        }}
      />
      {onAiSearchClick && (
        <button 
          onClick={onAiSearchClick}
          style={{
            background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
            color: 'var(--white)',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 16px',
            fontSize: '12.5px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 2px 8px rgba(109, 40, 217, 0.15)',
            transition: 'opacity 0.2s ease',
            marginLeft: '8px',
            flexShrink: 0
          }}
          className="try-ai-search-btn"
        >
          <Sparkles size={13} />
          Try AI Search
        </button>
      )}
    </div>
  )
}
