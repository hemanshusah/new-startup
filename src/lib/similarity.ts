import type { Program, ProgramListItem } from '@/types/program'

/**
 * Scores similarity between the current program and a candidate program.
 * Algorithm as per CONTEXT.md §12 — 9 signals, pure in-memory, no DB query.
 */
export function scoreSimilarity(
  current: Program,
  candidate: Program | ProgramListItem
): number {
  // Exclude the program comparing against itself
  if (candidate.slug === current.slug) return 0

  let score = 0

  // 1. Same type → +40 (strongest signal)
  if (candidate.type === current.type) score += 40

  // 2. Each overlapping sector tag → +15 per match (max +60)
  const currentSectors = current.sectors ?? []
  const candidateSectors = candidate.sectors ?? []
  const sectorOverlap = currentSectors.filter((s) => candidateSectors.includes(s)).length
  score += Math.min(sectorOverlap * 15, 60)

  // 3. Same scope (National / International) → +20
  if (candidate.is_india === current.is_india) score += 20

  // 4. Same stage → +15
  if (
    current.stage &&
    candidate.stage &&
    candidate.stage === current.stage
  ) {
    score += 15
  }

  // 5. Deadline within 14 days of current → +10
  if (current.deadline && candidate.deadline) {
    const delta = Math.abs(
      new Date(candidate.deadline).getTime() - new Date(current.deadline).getTime()
    )
    const days = delta / (1000 * 60 * 60 * 24)
    if (days <= 14) score += 10
  }

  // 6. Same organising body → +25
  if (
    current.organisation &&
    candidate.organisation &&
    candidate.organisation.trim().toLowerCase() ===
      current.organisation.trim().toLowerCase()
  ) {
    score += 25
  }

  // 7. Amount range overlap → +10
  const cMin = current.amount_min ?? null
  const cMax = current.amount_max ?? null
  const dMin = candidate.amount_min ?? null
  const dMax = candidate.amount_max ?? null
  if (cMin !== null && cMax !== null && dMin !== null && dMax !== null) {
    const overlapStart = Math.max(cMin, dMin)
    const overlapEnd = Math.min(cMax, dMax)
    if (overlapStart <= overlapEnd) score += 10
  }

  // 8. Same Indian state → +20 (only meaningful when is_india = true)
  if (
    current.is_india &&
    candidate.is_india &&
    current.state &&
    candidate.state &&
    current.state === candidate.state
  ) {
    score += 20
  }

  // 9. Is featured → +5 (editorial boost)
  if (candidate.is_featured) score += 5

  return score
}

/**
 * Returns the top `limit` similar programs ordered by score descending.
 * If fewer than 2 programs score above 0, returns an empty array
 * (so the section can be hidden entirely per spec).
 */
export function getSimilarPrograms(
  current: Program,
  allPrograms: ProgramListItem[],
  limit = 5
): Array<{ program: ProgramListItem; score: number }> {
  const scored = allPrograms
    .filter((p) => p.slug !== current.slug)
    .map((p) => ({ program: p, score: scoreSimilarity(current, p) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)

  if (scored.length < 2) return []
  return scored
}
