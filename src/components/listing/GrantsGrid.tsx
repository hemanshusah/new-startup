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
  siAds?: SoftInfra[]
}

export function GrantsGrid({ 
  programs, 
  siSlotPositions = [6, 14, 20], 
  siAds = []
}: GrantsGridProps) {
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
   * Auth gate: if logged in → let the Link navigate; if not → prevent and open modal.
   * Called from each GrantCard's onClick.
   */
  const handleCardClick = (e: React.MouseEvent, slug: string) => {
    if (!user) {
      e.preventDefault()
      openModal(`/programs/${slug}`)
    }
    // If user exists, we do nothing and let the <Link> component handle the navigation.
    // This allows the global NavProgress click listener to detect it and show the bar.
  }

  // ── Intelligent Slotting Engine (Pinpoint + Flow) ──
  // Calculate exactly which SoftInfra object lands at which absolute positional index.
  const exactAdMapping = useMemo(() => {
    const mapping = new Map<number, SoftInfra>()
    if (!siAds || siAds.length === 0) return mapping

    // siAds is already sorted by priority DESC natively from the DB fetch.
    const pinpointAds = siAds.filter((ad) => ad.slot_index != null)
    const flowingAds = siAds.filter((ad) => ad.slot_index == null)

    // 1. PINPOINT: Lock in the manually assigned slots.
    // Since it's sorted by priority, the first one to claim a slot_index wins.
    for (const ad of pinpointAds) {
      if (!mapping.has(ad.slot_index!)) {
        mapping.set(ad.slot_index!, ad)
      }
    }

    // 2. GENERATE CONTINUOUS FLOW: Build the grid's structural interval matrix
    const flowPositions: number[] = []
    const defaultGap = 6
    let posIterator = 0
    // Guarantee enough structural positions for the flowing ads (with +10 buffer)
    while (flowPositions.length < flowingAds.length + 10) {
      if (posIterator < siSlotPositions.length) {
        flowPositions.push(siSlotPositions[posIterator])
      } else {
        const last = flowPositions.length > 0 ? flowPositions[flowPositions.length - 1] : 0
        const prev = flowPositions.length > 1 ? flowPositions[flowPositions.length - 2] : 0
        const gap = (last && prev) ? (last - prev) : defaultGap
        flowPositions.push(last + gap)
      }
      posIterator++
    }

    // 3. FLOW MATRICULATION: Drop flowing ads into available positions natively.
    let flowIndex = 0
    for (const pos of flowPositions) {
      if (flowIndex >= flowingAds.length) break

      // A position is natively unavailable if a Pinpoint Ad claimed it
      const hasPinpoint = mapping.has(pos)

      if (!hasPinpoint) {
        mapping.set(pos, flowingAds[flowIndex])
        flowIndex++
      }
    }

    return mapping
  }, [siSlotPositions, siAds])

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
                  onClick={(e) => handleCardClick(e, program.slug)}
                />
              ]

              const pos = index + 1

              // Check if we inject a standard ad here (handles both Pinpoint and Flow logic)
              const mappedAd = exactAdMapping.get(pos)
              if (mappedAd) {
                 elements.push(<SoftInfraCard key={`si-${pos}`} si={mappedAd} />)
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
