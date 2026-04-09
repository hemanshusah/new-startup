import { createClient } from '@/lib/supabase/server'
import type { SoftInfra } from '@/types/softinfra'

/**
 * Fetches all valid SoftInfra items for a specific placement, sorted purely by priority descending.
 */
export async function getActiveSoftInfra(placement: string): Promise<SoftInfra[]> {
  const supabase = await createClient()

  const { data: siItems, error } = await supabase
    .from('softinfra')
    .select('*')
    .eq('is_active', true)
    .contains('placement', [placement])

  if (error || !siItems) {
    console.error('Error fetching SoftInfra:', error)
    return []
  }

  const today = new Date().toISOString().split('T')[0]
  const validSI = (siItems as SoftInfra[]).filter((si) => {
    if (si.start_date && si.start_date > today) return false
    if (si.end_date && si.end_date < today) return false
    return true
  })

  // Sort strictly by Priority Descending (e.g. 100 comes first, 1 comes last)
  validSI.sort((a, b) => b.priority - a.priority)

  return validSI
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
