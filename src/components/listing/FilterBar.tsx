'use client'

import { ProgramType } from '@/types/program'

export type ScopeFilter = 'national' | 'international'
export type TypeFilter = ProgramType | 'all'

interface FilterBarProps {
  scope: ScopeFilter
  onScopeChange: (s: ScopeFilter) => void
  typeFilter: TypeFilter
  onTypeChange: (t: TypeFilter) => void
  search: string
  onSearchChange: (s: string) => void
  totalShown: number
  totalFiltered: number
}

const TYPE_TABS: { label: string; value: TypeFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Grant', value: 'grant' },
  { label: 'Incubation', value: 'incubation' },
  { label: 'Accelerator', value: 'accelerator' },
  { label: 'Contest', value: 'contest' },
  { label: 'Funding', value: 'funding' },
]

export function FilterBar({
  scope,
  onScopeChange,
  typeFilter,
  onTypeChange,
  search,
  onSearchChange,
  totalShown,
  totalFiltered,
}: FilterBarProps) {
  return (
    <div
      className="filter-bar-row"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '24px',
        flexWrap: 'wrap',
        marginBottom: '32px',
      }}
    >
      {/* ── National / International scope toggle ── */}
      <div
        style={{
          display: 'inline-flex',
          border: '1px solid var(--cream-border)',
          borderRadius: '20px',
          background: 'var(--white)',
          padding: '2px', // Slight padding for segment feel
          flexShrink: 0,
        }}
        role="group"
        aria-label="Program scope"
      >
        {(['national', 'international'] as ScopeFilter[]).map((s) => (
          <button
            key={s}
            id={`scope-${s}`}
            onClick={() => onScopeChange(s)}
            className="scope-segment"
            style={{
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '12px',
              fontWeight: 500,
              color: scope === s ? 'var(--white)' : 'var(--ink-4)',
              background: scope === s ? 'var(--ink)' : 'transparent',
              padding: '6px 18px',
              border: 'none',
              borderRadius: '18px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            aria-pressed={scope === s}
          >
            {s === 'national' ? 'National' : 'International'}
          </button>
        ))}
      </div>

      {/* ── Search input (Pill shape) ── */}
      <div className="filter-bar-search" style={{ position: 'relative', flexShrink: 0, minWidth: 0 }}>
        <span
          style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--ink-4)',
            fontSize: '14px',
          }}
        >
          ⌕
        </span>
        <input
          id="program-search"
          type="search"
          placeholder="Enter keywords to search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          style={{
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '12.5px',
            fontWeight: 400,
            color: 'var(--ink)',
            background: 'var(--white)',
            border: '1px solid var(--cream-border)',
            borderRadius: '20px', // Pill shape
            padding: '7px 12px 7px 32px', // Extra left padding for icon
            width: '100%',
            maxWidth: '260px',
            outline: 'none',
          }}
          aria-label="Search programs"
          suppressHydrationWarning
        />
      </div>

      {/* ── Type filter tabs ── */}
      <div
        className="filter-bar-types"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flex: 1,
        }}
        role="group"
        aria-label="Program type filter"
      >
        {TYPE_TABS.map((tab) => {
          const isActive = typeFilter === tab.value
          return (
            <button
              key={tab.value}
              id={`type-filter-${tab.value}`}
              onClick={() => onTypeChange(tab.value)}
              style={{
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '12px',
                fontWeight: 500,
                color: isActive ? 'var(--white)' : 'var(--ink-4)',
                background: isActive ? 'var(--ink)' : 'var(--white)',
                border: '1px solid var(--cream-border)',
                borderRadius: '20px',
                padding: '6px 18px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
              }}
              aria-pressed={isActive}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* ── Result count (right-aligned) ── */}
      <div
        style={{
          fontFamily: 'DM Sans, sans-serif',
          fontSize: '12px',
          fontWeight: 400,
          color: 'var(--ink-4)',
          whiteSpace: 'nowrap',
          marginLeft: 'auto',
          flexShrink: 0,
        }}
        aria-live="polite"
        aria-atomic="true"
      >
        Showing {totalShown} of {totalFiltered} programs
      </div>
    </div>
  )
}
