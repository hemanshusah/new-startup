import { auth } from "@/auth"
import { createClient, createServiceClient } from "./supabase/server"

export interface AuthenticatedUser {
  id: string         // This is the STABLE Profile ID
  authId: string     // This is the raw provider ID
  email: string
  type: 'next_auth' | 'supabase'
  role: string
}

/**
 * Unified helper to get the current user from either Auth.js (Google)
 * or Supabase Auth (Credentials).
 * 
 * CRITICAL: This resolves the user to a single stable PROFILE ID from public.profiles
 * based on their email.
 */
export async function getAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  let authUser: { email: string; id: string; type: 'next_auth' | 'supabase' } | null = null

  // 1. Check Auth.js session (primary for Google/OAuth)
  const session = await auth()
  if (session?.user?.email) {
    authUser = {
      email: session.user.email,
      id: session.user.id as string,
      type: 'next_auth'
    }
  }

  // 2. Check Supabase session (primary for Email/Password) if Auth.js failed
  if (!authUser) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user?.email) {
      authUser = {
        email: user.email,
        id: user.id,
        type: 'supabase'
      }
    }
  }

  if (!authUser) return null

  // 3. Resolve the stable Profile by email
  // We use service client to ensure we find the profile even if RLS is tight
  const supabase = createServiceClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('email', authUser.email)
    .single()

  if (!profile) return null

  return {
    id: profile.id, // Current profile ID in the DB
    authId: authUser.id,
    email: authUser.email,
    type: authUser.type,
    role: profile.role
  }
}
