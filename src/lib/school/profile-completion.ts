import type { Profile } from '@/types/profile';

/**
 * Calculates the profile completion percentage based on key startup fields.
 * Returns a number between 0 and 100.
 */
export function calculateCompletion(profile: Profile | null): number {
  if (!profile) return 0;

  const weights: Record<string, number> = {
    full_name: 10,
    startup_name: 10,
    startup_website: 10,
    startup_email: 10,
    phone: 10,
    startup_sectors: 10, // Must have at least one sector
    startup_stage: 10,
    startup_state: 10,
    startup_description: 10,
    revenue_status: 10,
  };

  let totalScore = 0;

  for (const [field, weight] of Object.entries(weights)) {
    const value = profile[field as keyof Profile];

    if (field === 'startup_sectors') {
      if (Array.isArray(value) && value.length > 0) {
        totalScore += weight;
      }
    } else if (value !== null && value !== undefined && value !== '') {
      totalScore += weight;
    }
  }

  return Math.min(100, totalScore);
}

/**
 * Returns a list of missing required fields for the user to complete.
 */
export function getMissingFields(profile: Profile | null): string[] {
  if (!profile) return ['All fields missing'];

  const requiredFields: Record<string, string> = {
    full_name: 'Your Name',
    startup_name: 'Startup Name',
    startup_website: 'Website URL',
    startup_email: 'Startup Email',
    phone: 'Phone Number',
    startup_sectors: 'Startup Sector',
    startup_stage: 'Growth Stage',
    startup_state: 'State/Location',
    startup_description: 'Short Description',
    revenue_status: 'Revenue Status',
  };

  const missing: string[] = [];

  for (const [field, label] of Object.entries(requiredFields)) {
    const value = profile[field as keyof Profile];
    if (field === 'startup_sectors') {
      if (!Array.isArray(value) || value.length === 0) {
        missing.push(label);
      }
    } else if (value === null || value === undefined || value === '') {
      missing.push(label);
    }
  }

  return missing;
}
