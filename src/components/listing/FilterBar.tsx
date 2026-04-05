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
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        flexWrap: 'wrap',
        marginBottom: '20px',
      }}
    >
      {/* ── National / International scope toggle ── */}
      <div
        style={{
          display: 'inline-flex',
          border: '1px solid var(--cream-border)',
          borderRadius: '20px',
          background: 'var(--white)',
          overflow: 'hidden',
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
              fontWeight: scope === s ? 500 : 400,
              color: scope === s ? 'var(--cream)' : 'var(--ink-3)',
              background: scope === s ? 'var(--ink)' : 'transparent',
              padding: '6px 16px',
              border: 'none',
              cursor: 'pointer',
            }}
            aria-pressed={scope === s}
          >
            {s === 'national' ? 'National' : 'International'}
          </button>
        ))}
      </div>

      {/* ── Type filter tabs ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
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
                fontWeight: isActive ? 500 : 400,
                color: isActive ? 'var(--ink)' : 'var(--ink-3)',
                background: isActive ? 'var(--cream-dark)' : 'transparent',
                border: isActive ? '1px solid var(--cream-border)' : '1px solid transparent',
                borderRadius: '20px',
                padding: '5px 14px',
                cursor: 'pointer',
                transition: 'background 0.15s ease, color 0.15s ease',
                whiteSpace: 'nowrap',
              }}
              aria-pressed={isActive}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* ── Search input ── */}
      <input
        id="program-search"
        type="search"
        placeholder="Search programs…"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        style={{
          fontFamily: 'DM Sans, sans-serif',
          fontSize: '12.5px',
          fontWeight: 400,
          color: 'var(--ink)',
          background: 'var(--white)',
          border: '1px solid var(--cream-border)',
          borderRadius: '6px',
          padding: '6px 12px',
          width: '250px',
          outline: 'none',
          flexShrink: 0,
        }}
        aria-label="Search programs"
      />

      {/* ── Result count (right-aligned) ── */}
      <div
        style={{
          fontFamily: 'DM Sans, sans-serif',
          fontSize: '12px',
          fontWeight: 400,
          color: 'var(--ink-3)',
          whiteSpace: 'nowrap',
          marginLeft: 'auto',
          flexShrink: 0,
        }}
        aria-live="polite"
        aria-atomic="true"
      >
        {totalShown} of {totalFiltered}{' '}
        {totalFiltered === 1 ? 'program' : 'programs'}
      </div>
    </div>
  )
}
