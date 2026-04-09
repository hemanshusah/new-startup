import { auth } from "@/auth"
import { createClient } from "./supabase/server"

export interface AuthenticatedUser {
  id: string
  email: string
  type: 'next_auth' | 'supabase'
}

/**
 * Unified helper to get the current user from either Auth.js (Google)
 * or Supabase Auth (Credentials).
 */
export async function getAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  // 1. Check Auth.js session (primary for Google/OAuth)
  const session = await auth()
  if (session?.user?.email) {
    return {
      email: session.user.email,
      id: session.user.id as string,
      type: 'next_auth'
    }
  }

  // 2. Check Supabase session (primary for Email/Password)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (user?.email) {
    return {
      email: user.email,
      id: user.id,
      type: 'supabase'
    }
  }

  return null
}
