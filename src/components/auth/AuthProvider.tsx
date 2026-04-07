'use client'

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

// ─── Types ────────────────────────────────────────────────────────────────────

interface AuthContextValue {
  user: User | null
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
})

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<AuthContextValue['profile'] | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [redirectTo, setRedirectTo] = useState<string | null>(null)

  // ── Bootstrap: read initial session & listen for changes ──────────────────
  useEffect(() => {
    // Get the current session synchronously from the cookie-backed client
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null)
    })

    // Listen for sign in / sign out events
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: string, session: any) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  // ── Fetch Profile when User changes ─────────────────────────────────────────
  useEffect(() => {
    if (!user) {
      setProfile(null)
      return
    }

    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (!error && data) {
        setProfile(data)
      }
    }

    fetchProfile()
  }, [user, supabase])

  // ── Check if the URL contains ?redirect= (middleware set it) ──────────────
  // If the listing page was loaded after a protected route redirect, auto-open the modal
  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const redir = params.get('redirect')
    if (redir && !user) {
      setRedirectTo(redir)
      setIsModalOpen(true)
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
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    router.push('/')
    router.refresh()
  }, [supabase, router])

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
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth() {
  return useContext(AuthContext)
}
