import { createClient } from '@/lib/supabase/server'
import type { SoftInfra } from '@/types/softinfra'

/**
 * Fetches and assigns SoftInfra items to a list of requested slot IDs.
 * Priorities:
 * 1. Exact match on `slot_index`
 * 2. Highest `priority` score (lower number = higher priority)
 * 3. Fallback (random selection among remaining)
 *
 * @param slotIds Array of slot IDs (e.g., ['listing-grid-a', 'listing-grid-b'])
 * @param placement Component placement context (e.g., 'listing-grid')
 * @returns A record mapping slot IDs to an Assigned SoftInfra (or null if none available)
 */
export async function getSIForSlots(
  slotIds: string[],
  placement: string
): Promise<Record<string, SoftInfra | null>> {
  const supabase = await createClient()

  // 1. Fetch all active SoftInfra items matching the placement, within their campaign dates
  const { data: siItems, error } = await supabase
    .from('softinfra')
    .select('*')
    .eq('is_active', true)
    .contains('placement', [placement])

  if (error || !siItems) {
    console.error('Error fetching SoftInfra:', error)
    return Object.fromEntries(slotIds.map((id) => [id, null]))
  }

  // Filter out items that have expired or haven't started yet
  const today = new Date().toISOString().split('T')[0]
  let validSI = (siItems as SoftInfra[]).filter((si) => {
    if (si.start_date && si.start_date > today) return false
    if (si.end_date && si.end_date < today) return false
    return true
  })

  const results: Record<string, SoftInfra | null> = {}
  const usedSIIds = new Set<string>()

  validSI.sort((a, b) => {
    if (a.slot_index && !b.slot_index) return -1
    if (!a.slot_index && b.slot_index) return 1
    if (a.slot_index && b.slot_index) return a.slot_index - b.slot_index
    return a.priority - b.priority
  })

  // 3. Assign items to slots
  // We just iterate through requested slots and assign the best remaining item
  for (const slotId of slotIds) {
    const siToAssign = validSI.find(
      (si) => !usedSIIds.has(si.id) && si.format !== 'newsletter' // keep newsletter separate
    )
    if (siToAssign) {
      results[slotId] = siToAssign
      usedSIIds.add(siToAssign.id)
    } else {
      results[slotId] = null
    }
  }

  return results
}

/**
 * Records a SoftInfra impression.
 * - Increments `softinfra.impression_count` via RPC
 * - If user is logged in, inserts a row into `softinfra_impressions` (ON CONFLICT DO NOTHING)
 */
export async function recordSIImpression(siId: string, userId?: string | null) {
  const supabase = await createClient()

  // 1. Always increment the generic counter
  await supabase.rpc('increment_softinfra_impression', { p_si_id: siId })

  // 2. If user is authenticated, attempt to record their specific impression
  if (userId) {
    const { error } = await supabase
      .from('softinfra_impressions')
      .insert({
        softinfra_id: siId,
        user_id: userId,
      })

    // We ignore error here since it's likely just a unique constraint violation
    // (meaning the user has already seen this before), which is expected.
    if (error && error.code !== '23505') {
      console.error('Failed to log unique softinfra impression', error)
    }
  }
}

