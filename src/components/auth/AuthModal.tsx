'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from './AuthProvider'

// ─── Types ────────────────────────────────────────────────────────────────────

type View = 'signin' | 'signup' | 'forgot'

// ─── Google SVG Icon ──────────────────────────────────────────────────────────

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 6.293C4.672 4.166 6.656 3.58 9 3.58z"
        fill="#EA4335"
      />
    </svg>
  )
}

// ─── Input helpers ────────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  fontFamily: 'DM Sans, sans-serif',
  fontSize: '13.5px',
  color: 'var(--ink)',
  background: 'var(--white)',
  border: '1px solid var(--cream-border)',
  borderRadius: '7px',
  padding: '10px 13px',
  width: '100%',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.15s ease',
}

// ─── AuthModal ────────────────────────────────────────────────────────────────

export function AuthModal() {
  const { isModalOpen, closeModal, redirectTo } = useAuth()
  const router = useRouter()
  const supabase = useRef(createClient()).current

  const [view, setView] = useState<View>('signin')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Form fields
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')

  // Reset state when view changes
  const switchView = (v: View) => {
    setView(v)
    setError(null)
    setSuccess(null)
    setPassword('')
    setConfirmPassword('')
  }

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [closeModal])

  const handleSuccess = useCallback(() => {
    closeModal()
    if (redirectTo) {
      router.push(redirectTo)
    }
    router.refresh()
  }, [closeModal, redirectTo, router])

  // ── Sign In ──────────────────────────────────────────────────────────────

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      handleSuccess()
    }
  }

  // ── Sign Up ──────────────────────────────────────────────────────────────

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName || undefined },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      setSuccess(
        'Account created! Check your email to confirm your address, then sign in.'
      )
    }
  }

  // ── Forgot Password ──────────────────────────────────────────────────────

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback`,
    })
    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      setSuccess('Password reset email sent! Check your inbox.')
    }
  }

  // ── Google OAuth ─────────────────────────────────────────────────────────

  const handleGoogleSignIn = async () => {
    setLoading(true)
    const next = redirectTo ?? '/'
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    })
    // Browser will redirect — no need to setLoading(false)
  }

  if (!isModalOpen) return null

  return (
    <>
      {/* ── Backdrop ── */}
      <div
        id="auth-modal-backdrop"
        onClick={closeModal}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(28,26,22,0.55)',
          zIndex: 100,
          backdropFilter: 'blur(2px)',
        }}
        aria-hidden="true"
      />

      {/* ── Modal card ── */}
      <div
        id="auth-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 101,
          background: 'var(--white)',
          borderRadius: '16px',
          padding: '32px 32px 28px',
          width: '100%',
          maxWidth: '420px',
          boxShadow: '0 20px 60px rgba(28,26,22,0.18)',
        }}
      >
        {/* Close button */}
        <button
          id="auth-modal-close"
          onClick={closeModal}
          aria-label="Close"
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            border: '1px solid var(--cream-border)',
            background: 'var(--cream)',
            color: 'var(--ink-3)',
            cursor: 'pointer',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          ✕
        </button>

        {/* ── Sign In View ─────────────────────────────── */}
        {view === 'signin' && (
          <>
            <h2
              id="auth-modal-title"
              style={{
                fontFamily: 'DM Serif Display, serif',
                fontSize: '20px',
                fontWeight: 400,
                color: 'var(--ink)',
                marginBottom: '4px',
              }}
            >
              Sign in to view program details
            </h2>
            <p
              style={{
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '13px',
                color: 'var(--ink-3)',
                marginBottom: '24px',
              }}
            >
              Free forever. No spam.
            </p>

            {/* Google button */}
            <button
              id="auth-google-btn"
              onClick={handleGoogleSignIn}
              disabled={loading}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                width: '100%',
                padding: '10px 0',
                border: '1px solid var(--cream-border)',
                borderRadius: '8px',
                background: 'var(--white)',
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '13.5px',
                fontWeight: 500,
                color: 'var(--ink)',
                cursor: 'pointer',
                marginBottom: '20px',
                transition: 'background 0.15s ease',
              }}
            >
              <GoogleIcon />
              Continue with Google
            </button>

            {/* "or" divider */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '20px',
              }}
            >
              <div style={{ flex: 1, height: '1px', background: 'var(--cream-border)' }} />
              <span
                style={{
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize: '12px',
                  color: 'var(--ink-4)',
                }}
              >
                or
              </span>
              <div style={{ flex: 1, height: '1px', background: 'var(--cream-border)' }} />
            </div>

            {/* Sign in form */}
            <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input
                id="signin-email"
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={inputStyle}
              />

              {/* Password + show/hide */}
              <div style={{ position: 'relative' }}>
                <input
                  id="signin-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ ...inputStyle, paddingRight: '44px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: 'DM Sans, sans-serif',
                    fontSize: '11px',
                    color: 'var(--ink-3)',
                    padding: '0',
                  }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>

              {/* Error */}
              {error && (
                <p
                  style={{
                    fontFamily: 'DM Sans, sans-serif',
                    fontSize: '12.5px',
                    color: '#B01F1F',
                    margin: 0,
                  }}
                >
                  {error}
                </p>
              )}

              {/* Submit */}
              <button
                id="signin-submit"
                type="submit"
                disabled={loading}
                style={{
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize: '13.5px',
                  fontWeight: 500,
                  color: 'var(--cream)',
                  background: loading ? 'var(--ink-3)' : 'var(--ink)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '11px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  width: '100%',
                  transition: 'background 0.15s ease',
                  marginTop: '4px',
                }}
              >
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
            </form>

            {/* Links */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '16px',
              }}
            >
              <button
                onClick={() => switchView('forgot')}
                style={{
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize: '12px',
                  color: 'var(--ink-3)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                Forgot password?
              </button>
              <button
                id="switch-to-signup"
                onClick={() => switchView('signup')}
                style={{
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize: '12px',
                  color: 'var(--accent)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                Don&apos;t have an account? Sign up
              </button>
            </div>
          </>
        )}

        {/* ── Sign Up View ─────────────────────────────── */}
        {view === 'signup' && (
          <>
            <h2
              id="auth-modal-title"
              style={{
                fontFamily: 'DM Serif Display, serif',
                fontSize: '20px',
                fontWeight: 400,
                color: 'var(--ink)',
                marginBottom: '4px',
              }}
            >
              Create your free account
            </h2>
            <p
              style={{
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '13px',
                color: 'var(--ink-3)',
                marginBottom: '24px',
              }}
            >
              Free forever. Access all program details.
            </p>

            {/* Google button */}
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                width: '100%',
                padding: '10px 0',
                border: '1px solid var(--cream-border)',
                borderRadius: '8px',
                background: 'var(--white)',
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '13.5px',
                fontWeight: 500,
                color: 'var(--ink)',
                cursor: 'pointer',
                marginBottom: '20px',
              }}
            >
              <GoogleIcon />
              Sign up with Google
            </button>

            {/* "or" divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--cream-border)' }} />
              <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '12px', color: 'var(--ink-4)' }}>or</span>
              <div style={{ flex: 1, height: '1px', background: 'var(--cream-border)' }} />
            </div>

            {success ? (
              <div
                style={{
                  background: '#EDF5EA',
                  border: '1px solid #A8D4A0',
                  borderRadius: '8px',
                  padding: '14px 16px',
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize: '13px',
                  color: '#2A6620',
                }}
              >
                {success}
              </div>
            ) : (
              <form onSubmit={handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input
                  id="signup-name"
                  type="text"
                  placeholder="Full name (optional)"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  style={inputStyle}
                />
                <input
                  id="signup-email"
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={inputStyle}
                />

                <div style={{ position: 'relative' }}>
                  <input
                    id="signup-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{ ...inputStyle, paddingRight: '44px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontFamily: 'DM Sans, sans-serif',
                      fontSize: '11px',
                      color: 'var(--ink-3)',
                      padding: '0',
                    }}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>

                <div style={{ position: 'relative' }}>
                  <input
                    id="signup-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    style={{ ...inputStyle, paddingRight: '44px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontFamily: 'DM Sans, sans-serif',
                      fontSize: '11px',
                      color: 'var(--ink-3)',
                      padding: '0',
                    }}
                    aria-label={showConfirmPassword ? 'Hide' : 'Show'}
                  >
                    {showConfirmPassword ? 'Hide' : 'Show'}
                  </button>
                </div>

                {error && (
                  <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '12.5px', color: '#B01F1F', margin: 0 }}>
                    {error}
                  </p>
                )}

                <button
                  id="signup-submit"
                  type="submit"
                  disabled={loading}
                  style={{
                    fontFamily: 'DM Sans, sans-serif',
                    fontSize: '13.5px',
                    fontWeight: 500,
                    color: 'var(--cream)',
                    background: loading ? 'var(--ink-3)' : 'var(--ink)',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '11px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    width: '100%',
                    marginTop: '4px',
                  }}
                >
                  {loading ? 'Creating account…' : 'Create account'}
                </button>
              </form>
            )}

            <div style={{ marginTop: '16px', textAlign: 'center' }}>
              <button
                id="switch-to-signin"
                onClick={() => switchView('signin')}
                style={{
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize: '12px',
                  color: 'var(--accent)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                Already have an account? Sign in
              </button>
            </div>
          </>
        )}

        {/* ── Forgot Password View ──────────────────── */}
        {view === 'forgot' && (
          <>
            <h2
              id="auth-modal-title"
              style={{
                fontFamily: 'DM Serif Display, serif',
                fontSize: '20px',
                fontWeight: 400,
                color: 'var(--ink)',
                marginBottom: '4px',
              }}
            >
              Reset your password
            </h2>
            <p
              style={{
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '13px',
                color: 'var(--ink-3)',
                marginBottom: '24px',
              }}
            >
              Enter your email and we&apos;ll send a reset link.
            </p>

            {success ? (
              <div
                style={{
                  background: '#EDF5EA',
                  border: '1px solid #A8D4A0',
                  borderRadius: '8px',
                  padding: '14px 16px',
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize: '13px',
                  color: '#2A6620',
                }}
              >
                {success}
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input
                  id="forgot-email"
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={inputStyle}
                />

                {error && (
                  <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '12.5px', color: '#B01F1F', margin: 0 }}>
                    {error}
                  </p>
                )}

                <button
                  id="forgot-submit"
                  type="submit"
                  disabled={loading}
                  style={{
                    fontFamily: 'DM Sans, sans-serif',
                    fontSize: '13.5px',
                    fontWeight: 500,
                    color: 'var(--cream)',
                    background: loading ? 'var(--ink-3)' : 'var(--ink)',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '11px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    width: '100%',
                  }}
                >
                  {loading ? 'Sending…' : 'Send reset link'}
                </button>
              </form>
            )}

            <div style={{ marginTop: '16px', textAlign: 'center' }}>
              <button
                onClick={() => switchView('signin')}
                style={{
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize: '12px',
                  color: 'var(--accent)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                ← Back to sign in
              </button>
            </div>
          </>
        )}
      </div>
    </>
  )
}
