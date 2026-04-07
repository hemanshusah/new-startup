import { revalidatePath } from 'next/cache'

/** Paths from admin / API cache controls — `/programs` invalidates all program detail pages. */
export function revalidateCachePath(path: string) {
  const trimmed = path.trim() || '/'
  if (trimmed === '/programs') {
    revalidatePath('/programs/[slug]', 'layout')
  } else {
    revalidatePath(trimmed)
  }
}
