import { ProgramListItem } from '@/types/program'

/**
 * Shared logic to determine if a program should be visible on the public main page.
 * This ensures the Admin Dashboard and Main Page are always in sync.
 */
/**
 * Authoritative visibility logic for programs.
 * This is used across the Admin Dashboard and the Public Home Page to ensure
 * they stay in sync and only show live, active, and non-expired programs.
 */
export function isProgramPubliclyVisible(program: {
  published: boolean;
  status: string;
  product_slug: string | null;
  deadline: string;
}): boolean {
  const today = new Date().toISOString().split('T')[0]
  
  return (
    program.published === true &&
    program.status === 'active' &&
    program.product_slug === 'grants' &&
    (!program.deadline || program.deadline >= today)
  )
}

/**
 * Filter for Supabase queries to get public programs.
 * Usage: supabase.from('programs').select('*').match(PUBLIC_PROGRAM_FILTERS).gte('deadline', today)
 */
/**
 * Shared Supabase filter object for public-facing program queries.
 * Enforces: Published, Active Status, and Non-Expired Deadline.
 */
export const PUBLIC_PROGRAM_FILTERS = {
  published: true,
  status: 'active',
  product_slug: 'grants'
}
