'use client'

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useRouter } from 'next/navigation'
import { SessionProvider, useSession, signOut as nextAuthSignOut } from 'next-auth/react'
import { createClient } from '@/lib/supabase/client'

// ─── Types ────────────────────────────────────────────────────────────────────

interface AuthContextValue {
  user: any | null // Transitioning from Supabase User to Auth.js User
  profile: {
    id: string
    role: 'user' | 'admin'
    full_name?: string
    avatar_url?: string
    phone?: string
    startup_name?: string
    startup_website?: string
    startup_email?: string
  } | null
  isModalOpen: boolean
  /** Open the auth modal; pass a redirect path to navigate there after sign-in */
  openModal: (redirectTo?: string) => void
  closeModal: () => void
  redirectTo: string | null
  signOut: () => Promise<void>
  status: 'loading' | 'authenticated' | 'unauthenticated'
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue>({
  user: null,
  profile: null,
  isModalOpen: false,
  openModal: () => { },
  closeModal: () => { },
  redirectTo: null,
  signOut: async () => { },
  status: 'loading',
})

// ─── Inner Provider (where useSession is available) ──────────────────────────

function AuthProviderInner({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { data: session, status } = useSession()
  const supabase = useMemo(() => createClient(), [])

  const [profile, setProfile] = useState<AuthContextValue['profile'] | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [redirectTo, setRedirectTo] = useState<string | null>(null)

  const user = session?.user ?? null

  // ── Fetch Profile when User changes ─────────────────────────────────────────
  useEffect(() => {
    if (!user?.email) {
      setProfile(null)
      return
    }

    const fetchProfile = async () => {
      const { getCurrentProfile } = await import('./auth-actions')
      const data = await getCurrentProfile()
      if (data) {
        setProfile(data)
      }
    }
    fetchProfile()
  }, [user])

  // ── Handle redirect param ───────────────────────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const redir = params.get('redirect')
    if (redir && !user) {
      const timer = setTimeout(() => {
        setRedirectTo(redir)
        setIsModalOpen(true)
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [user])

  // ── Scroll lock ────────────────────────────────────────────────────────────
  useEffect(() => {
    document.body.style.overflow = isModalOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isModalOpen])

  // ── Actions ────────────────────────────────────────────────────────────────

  const openModal = useCallback((dest?: string) => {
    if (dest) setRedirectTo(dest)
    setIsModalOpen(true)
  }, [])

  const closeModal = useCallback(() => {
    setIsModalOpen(false)
    setRedirectTo(null)
  }, [])

  const signOut = useCallback(async () => {
    await nextAuthSignOut({ redirect: false })
    setProfile(null)
    router.push('/')
    router.refresh()
  }, [router])

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isModalOpen,
        openModal,
        closeModal,
        redirectTo,
        signOut,
        status,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// ─── Main Provider Wrapper ────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthProviderInner>
        {children}
      </AuthProviderInner>
    </SessionProvider>
  )
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth() {
  return useContext(AuthContext)
}
