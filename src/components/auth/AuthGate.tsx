'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from './AuthProvider'

/**
 * Returns a click handler for a grant card.
 * - If the user is authenticated: navigates to `/programs/[slug]`.
 * - If not authenticated: opens the auth modal with `redirectTo` set to the detail page.
 */
export function useAuthGate(slug: string) {
  const { user, openModal } = useAuth()
  const router = useRouter()

  return () => {
    if (user) {
      router.push(`/programs/${slug}`)
    } else {
      openModal(`/programs/${slug}`)
    }
  }
}
