'use client'

import { ProgramType } from '@/types/program'
import { useEffect, useState } from 'react'
import { SearchBar } from '@/components/molecules/SearchBar'

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
  const [localSearch, setLocalSearch] = useState(search)

  // Keep local input in sync if parent resets it
  useEffect(() => {
    setLocalSearch(search)
  }, [search])

  // Debounce updates to avoid filtering on every keystroke
  useEffect(() => {
    const t = window.setTimeout(() => {
      onSearchChange(localSearch)
    }, 180)
    return () => window.clearTimeout(t)
  }, [localSearch, onSearchChange])

  return (
    <div
      className="filter-bar-shell"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '24px',
        flexWrap: 'wrap',
        marginBottom: '32px',
      }}
    >
      {/* ── Search input (Pill shape) ── */}
      <SearchBar 
        value={localSearch}
        onChange={setLocalSearch}
        placeholder="Enter keywords to search"
        style={{
          maxWidth: '260px',
          minWidth: '220px',
          borderRadius: '20px',
          padding: '4px 12px 4px 16px',
        }}
        className="filter-search-input-wrapper"
      />

      {/* ── Mobile Scroll Row (Scope + Types) ── */}
      <div className="filter-mobile-bottom-row">
        {/* ── National / International scope toggle ── */}
        <div
          className="filter-scope-pill"
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
              className={`scope-segment ${scope === s ? 'active' : ''}`}
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '12px',
                fontWeight: scope === s ? 500 : 400,
                color: scope === s ? 'var(--white)' : 'var(--ink-4)',
                background: scope === s ? 'var(--ink)' : 'transparent',
                padding: '6px 18px',
                border: 'none',
                borderRadius: '18px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
              }}
              aria-pressed={scope === s}
            >
              {s === 'national' ? 'National' : 'International'}
            </button>
          ))}
        </div>

        {/* ── Divider for Mobile ── */}
        <div className="filter-mobile-divider" style={{ width: '1px', height: '20px', background: 'var(--cream-border)', margin: '0 8px', flexShrink: 0 }} />

        {/* ── Type filter tabs (Desktop) ── */}
        <div
          className="filter-chips-scroll"
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
                className={`filter-chip ${isActive ? 'active' : ''}`}
                id={`type-filter-${tab.value}`}
                onClick={() => onTypeChange(tab.value)}
                style={{
                  fontFamily: 'var(--font-sans)',
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

        {/* ── Type filter dropdown (Mobile Only) ── */}
        <div className="filter-mobile-type-selector">
          <select
            id="mobile-type-filter"
            value={typeFilter}
            onChange={(e) => onTypeChange(e.target.value as TypeFilter)}
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '12px',
              fontWeight: 500,
              color: 'var(--ink)',
              background: 'var(--white)',
              border: '1px solid var(--cream-border)',
              borderRadius: '20px',
              padding: '6px 32px 6px 12px',
              cursor: 'pointer',
              appearance: 'none',
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%23333' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 12px center',
            }}
            aria-label="Select program type"
          >
            {TYPE_TABS.map((tab) => (
              <option key={tab.value} value={tab.value}>
                {tab.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Result count (right-aligned) ── */}
      <div
        className="filter-result-count"
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 'var(--font-size-body)',
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
