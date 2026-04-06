'use client'

import { useState, useMemo } from 'react'
import { ProgramListItem } from '@/types/program'
import { GrantCard } from './GrantCard'
import { FilterBar, ScopeFilter, TypeFilter } from './FilterBar'
import { useAuth } from '@/components/auth/AuthProvider'
import { SoftInfraCard } from '@/components/softinfra/SICard'
import { SINewsletterCard } from '@/components/softinfra/SINewsletterCard'
import type { SoftInfra } from '@/types/softinfra'

const PAGE_SIZE = 12

interface GrantsGridProps {
  programs: ProgramListItem[]
  siSlotPositions?: number[]
  siForSlots?: Record<string, SoftInfra | null>
}

export function GrantsGrid({ programs, siSlotPositions = [6, 14, 20], siForSlots = {} }: GrantsGridProps) {
  const { user, openModal } = useAuth()

  // Filter state
  const [scope, setScope] = useState<ScopeFilter>('national')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1) // how many PAGE_SIZE batches to show

  // When any filter changes, reset pagination to page 1
  const handleScopeChange = (s: ScopeFilter) => { setScope(s); setPage(1) }
  const handleTypeChange = (t: TypeFilter) => { setTypeFilter(t); setPage(1) }
  const handleSearchChange = (s: string) => { setSearch(s); setPage(1) }

  // Derived: filtered programs (client-side — no extra DB calls per CONTEXT.md §11)
  const filtered = useMemo(() => {
    return programs.filter((p) => {
      // Scope filter
      if (scope === 'national' && !p.is_india) return false
      if (scope === 'international' && p.is_india) return false

      // Type filter
      if (typeFilter !== 'all' && p.type !== typeFilter) return false

      // Search filter (title + organisation + description_short)
      if (search.trim()) {
        const q = search.toLowerCase()
        const hit =
          p.title.toLowerCase().includes(q) ||
          p.organisation.toLowerCase().includes(q) ||
          p.description_short.toLowerCase().includes(q)
        if (!hit) return false
      }

      return true
    })
  }, [programs, scope, typeFilter, search])

  // Paginate: show first (page * PAGE_SIZE) items
  const visibleCount = page * PAGE_SIZE
  const visible = filtered.slice(0, visibleCount)
  const hasMore = visibleCount < filtered.length

  /**
   * Auth gate: if logged in → navigate; if not → open modal with redirect target.
   * Called from each GrantCard's onClick.
   */
  const handleCardClick = (slug: string) => {
    if (user) {
      window.location.href = `/programs/${slug}`
    } else {
      openModal(`/programs/${slug}`)
    }
  }

  return (
    <div>
      {/* Filter bar */}
      <FilterBar
        scope={scope}
        onScopeChange={handleScopeChange}
        typeFilter={typeFilter}
        onTypeChange={handleTypeChange}
        search={search}
        onSearchChange={handleSearchChange}
        totalShown={visible.length}
        totalFiltered={filtered.length}
      />

      {/* 3-column grid — gap: 1px creates hairline border via background on wrapper */}
      {filtered.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '80px 24px',
            fontFamily: 'DM Sans, sans-serif',
            color: 'var(--ink-3)',
            fontSize: '14px',
          }}
        >
          No programs match your filters. Try adjusting the search or switching scope.
        </div>
      ) : (
        <>
          <div
            id="grants-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '1px',
              background: 'var(--cream-border)',
              border: '1px solid var(--cream-border)', // Outer container border
              borderRadius: '12px',
              overflow: 'hidden',
            }}
          >
            {visible.map((program, index) => {
              const elements = [
                <GrantCard
                  key={program.id}
                  program={program}
                  onClick={() => handleCardClick(program.slug)}
                />
              ]

              // Check if we should insert a SoftInfra item AFTER this program
              const pos = index + 1
              const siSlotIndex = siSlotPositions.indexOf(pos)

              if (siSlotIndex !== -1) {
                // Determine which slot this is (a, b, c)
                const slotNames = ['listing-grid-a', 'listing-grid-b', 'listing-grid-c']
                const slotName = slotNames[siSlotIndex]

                if (pos === 20) {
                  // Position 20 is always the Newsletter card (listing-grid-nl)
                  elements.push(<SINewsletterCard key={`nl-${pos}`} />)
                } else if (slotName && siForSlots[slotName]) {
                  // Render the specified SoftInfra card
                  elements.push(<SoftInfraCard key={`si-${pos}`} si={siForSlots[slotName]!} />)
                }
              }

              return elements
            })}
          </div>

          {/* Result count + View more */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
              marginTop: '24px',
            }}
          >
            {hasMore && (
              <button
                id="view-more-btn"
                onClick={() => setPage((p) => p + 1)}
                style={{
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: 'var(--ink)',
                  background: 'var(--white)',
                  border: '1px solid var(--cream-border)',
                  borderRadius: '6px',
                  padding: '8px 20px',
                  cursor: 'pointer',
                  transition: 'background 0.15s ease',
                }}
              >
                View more programs
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}
