import { createServiceClient } from '../supabase/server';
import type { Profile } from '@/types/profile';
import type { ProgramListItem } from '@/types/program';

/**
 * Advanced Recommendation Engine for Startup School.
 * Matches user profile data against available programs (grants, incubation, etc.)
 */
export async function getRecommendedPrograms(profile: Profile | null): Promise<ProgramListItem[]> {
  if (!profile || !profile.startup_sectors || !profile.startup_stage) return [];

  const supabase = createServiceClient();

  // 1. Fetch all active programs from 'grants'
  const { data: programs, error } = await supabase
    .from('programs')
    .select('id, slug, title, organisation, type, deadline, amount_display, description_short, is_featured, sectors, stage, is_india, amount_min, amount_max, state')
    .eq('product_slug', 'grants')
    .eq('status', 'active')
    .eq('published', true);

  if (error || !programs) return [];

  // 2. Score and Filter
  const scoredPrograms = programs.map(program => {
    let score = 0;

    // Sector Match (High Priority: 5 points per match)
    if (program.sectors && profile.startup_sectors) {
      const matchingSectors = program.sectors.filter((s: string) => profile.startup_sectors!.includes(s));
      score += matchingSectors.length * 5;
    }

    // Stage Match (High Priority: 10 points)
    // We normalize stage names for comparison if needed, but assuming they align
    if (program.stage && profile.startup_stage) {
      // Basic match or check if program stage contains profile stage
      if (program.stage.toLowerCase().includes(profile.startup_stage.toLowerCase())) {
        score += 10;
      }
    }

    // State Match (Medium Priority: 5 points)
    if (program.state && profile.startup_state) {
      if (program.state.toLowerCase() === profile.startup_state.toLowerCase() || program.is_india) {
        score += 5;
      }
    }

    return { ...program, recommendationScore: score };
  });

  // 3. Sort by score and return top results
  // Filter out those with 0 score (no relevance)
  return scoredPrograms
    .filter(p => p.recommendationScore > 0)
    .sort((a, b) => b.recommendationScore - a.recommendationScore)
    .slice(0, 6); // Return top 6 recommendations
}
