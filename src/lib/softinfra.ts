import { createClient } from '@/lib/supabase/server'
import type { SoftInfra } from '@/types/softinfra'

/** Grid positions for listing slots (CONTEXT.md — after Nth program card). */
const LISTING_SLOT_GRID_INDEX: Record<string, number> = {
  'listing-grid-a': 6,
  'listing-grid-b': 14,
  'listing-grid-c': 20,
}

/**
 * Fetches and assigns SoftInfra items to slot IDs.
 * Respects `slot_index` when it matches the slot’s grid position, then `priority`, then random tiebreak.
 * One item per slot per render; each item used at most once.
 */
export async function getSIForSlots(
  slotIds: string[],
  placement: string
): Promise<Record<string, SoftInfra | null>> {
  const supabase = await createClient()

  const { data: siItems, error } = await supabase
    .from('softinfra')
    .select('*')
    .eq('is_active', true)
    .contains('placement', [placement])

  if (error || !siItems) {
    console.error('Error fetching SoftInfra:', error)
    return Object.fromEntries(slotIds.map((id) => [id, null]))
  }

  const today = new Date().toISOString().split('T')[0]
  const validSI = (siItems as SoftInfra[]).filter((si) => {
    if (si.start_date && si.start_date > today) return false
    if (si.end_date && si.end_date < today) return false
    return true
  })

  const results: Record<string, SoftInfra | null> = {}
  const usedSIIds = new Set<string>()

  for (const slotId of slotIds) {
    const gridPos = LISTING_SLOT_GRID_INDEX[slotId]
    const candidates = validSI.filter(
      (si) => !usedSIIds.has(si.id) && si.format !== 'newsletter'
    )

    const scored = candidates
      .map((si) => {
        let tier = 2
        if (gridPos !== undefined && si.slot_index === gridPos) tier = 0
        else if (si.slot_index == null) tier = 1
        return { si, tier, priority: si.priority }
      })
      .sort((a, b) => {
        if (a.tier !== b.tier) return a.tier - b.tier
        if (a.priority !== b.priority) return a.priority - b.priority
        return Math.random() - 0.5
      })

    const pick = scored[0]?.si ?? null
    results[slotId] = pick
    if (pick) usedSIIds.add(pick.id)
  }

  return results
}

/**
 * Records a SoftInfra impression.
 * - Increments `softinfra.impression_count` via RPC
 * - If user is logged in, inserts into `softinfra_impressions` (ON CONFLICT DO NOTHING)
 */
export async function recordSIImpression(siId: string, userId?: string | null) {
  const supabase = await createClient()

  await supabase.rpc('increment_softinfra_impression', { p_si_id: siId })

  if (userId) {
    const { error } = await supabase.from('softinfra_impressions').insert({
      softinfra_id: siId,
      user_id: userId,
    })

    if (error && error.code !== '23505') {
      console.error('Failed to log unique softinfra impression', error)
    }
  }
}
