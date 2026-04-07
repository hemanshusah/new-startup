'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useSyncExternalStore } from 'react'
import { ComingSoonBadge } from './ComingSoonBadge'
import { WhatsAppLink } from './WhatsAppLink'
import { useAuth } from '../auth/AuthProvider'

const COMPACT_NAV_MQ = '(max-width: 1024px)'

function subscribeCompactNav(callback: () => void) {
  const mq = window.matchMedia(COMPACT_NAV_MQ)
  mq.addEventListener('change', callback)
  return () => mq.removeEventListener('change', callback)
}

function getCompactNavSnapshot() {
  return window.matchMedia(COMPACT_NAV_MQ).matches
}

function getCompactNavServerSnapshot() {
  return false
}

/** Returns up to 2 initials from a name or email */
function getInitials(user: { email?: string; user_metadata?: { full_name?: string } }) {
  const name = user.user_metadata?.full_name
  if (name) {
    const parts = name.trim().split(' ')
    return parts.length >= 2
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : parts[0].slice(0, 2).toUpperCase()
  }
  return (user.email ?? 'U').slice(0, 2).toUpperCase()
}

/** Global navigation bar — PROGRESS.md 2.2 & 3.4 */
export function Navbar() {
  const pathname = usePathname()
  const { user, profile, openModal, signOut } = useAuth()
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const isCompactNav = useSyncExternalStore(
    subscribeCompactNav,
    getCompactNavSnapshot,
    getCompactNavServerSnapshot
  )

  const isActive = (href: string) => pathname === href
  const avatarUrl = profile?.avatar_url || (user?.user_metadata?.avatar_url as string | undefined)
  const initials = user ? getInitials(user) : ''
  const isAdmin = profile?.role === 'admin'

  useEffect(() => {
    if (mobileMenuOpen) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = prev
      }
    }
  }, [mobileMenuOpen])

  useEffect(() => {
    if (!isCompactNav && mobileMenuOpen) setMobileMenuOpen(false)
  }, [isCompactNav, mobileMenuOpen])

  return (
    <header
      style={{
        background: 'var(--cream)',
        borderBottom: '1px solid var(--cream-border)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <nav
        className="navbar-shell"
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: isCompactNav ? '0 16px' : '0 24px',
          minHeight: '56px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          onClick={() => setMobileMenuOpen(false)}
          style={{
            fontFamily: 'DM Serif Display, serif',
            fontSize: '20px',
            fontWeight: 400,
            letterSpacing: '-0.01em',
            flexShrink: 0,
          }}
        >
          <span style={{ color: 'var(--ink)' }}>Grants</span>
          <span style={{ color: 'var(--accent)' }}>India</span>
        </Link>

        {/* Nav links — desktop (hidden on compact: burger + drawer instead) */}
        {!isCompactNav && (
          <div className="nav-desktop-links" style={{ display: 'flex', alignItems: 'center', gap: '24px', flex: 1 }}>
            <Link
              href="/"
              style={{
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '13px',
                fontWeight: isActive('/') ? 500 : 400,
                color: isActive('/') ? 'var(--ink)' : 'var(--ink-3)',
                transition: 'color 0.15s ease',
              }}
            >
              Grants &amp; Funding
            </Link>

            {/* <Link
              href="/events"
              style={{
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '13px',
                fontWeight: 400,
                color: 'var(--ink-3)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              Events
              <ComingSoonBadge label="Launching Soon" />
            </Link>

            <Link
              href="/newsletter"
              style={{
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '13px',
                fontWeight: 400,
                color: 'var(--ink-3)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              Newsletter
              <ComingSoonBadge label="Launching Soon" />
            </Link> */}

            <Link
              href="mailto:deeksharai014@gmail.com?subject=Software%20Deals%20%20%3C%3E%20StartupProgram%20Site!"
              style={{
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '13px',
                fontWeight: 400,
                color: 'var(--ink-3)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              Software Deals
              <ComingSoonBadge label="Coming Soon" />
            </Link>
          </div>
        )}

        {/* Right actions — desktop */}
        {!isCompactNav && (
          <div
            className="nav-desktop-actions"
            style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0, position: 'relative' }}
          >
            <WhatsAppLink id="nav-whatsapp-btn" />

            {user ? (
              /* ── Logged-in: Avatar / Initials + dropdown ── */
              <div style={{ position: 'relative' }}>
                <button
                  id="nav-avatar-btn"
                  onClick={() => setAvatarMenuOpen((o) => !o)}
                  aria-expanded={avatarMenuOpen}
                  aria-haspopup="true"
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '50%',
                    border: '2px solid var(--cream-border)',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    background: 'var(--cream-dark)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    padding: 0,
                  }}
                >
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={avatarUrl}
                      alt="Your avatar"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <span
                      style={{
                        fontFamily: 'DM Sans, sans-serif',
                        fontSize: '12px',
                        fontWeight: 500,
                        color: 'var(--ink-2)',
                        lineHeight: 1,
                      }}
                    >
                      {initials}
                    </span>
                  )}
                </button>

                {/* Dropdown menu */}
                {avatarMenuOpen && (
                  <>
                    {/* Backdrop to close menu */}
                    <div
                      style={{ position: 'fixed', inset: 0, zIndex: 49 }}
                      onClick={() => setAvatarMenuOpen(false)}
                      aria-hidden="true"
                    />
                    <div
                      id="nav-avatar-menu"
                      style={{
                        position: 'absolute',
                        top: 'calc(100% + 8px)',
                        right: 0,
                        background: 'var(--white)',
                        border: '1px solid var(--cream-border)',
                        borderRadius: '10px',
                        padding: '6px',
                        minWidth: '180px',
                        boxShadow: '0 8px 24px rgba(28,26,22,0.1)',
                        zIndex: 50,
                      }}
                      role="menu"
                    >
                      <div
                        style={{
                          padding: '6px 10px 10px',
                          borderBottom: '1px solid var(--cream-border)',
                          marginBottom: '6px',
                        }}
                      >
                        <p
                          style={{
                            fontFamily: 'DM Sans, sans-serif',
                            fontSize: '11px',
                            color: 'var(--ink-4)',
                            margin: 0,
                          }}
                        >
                          Signed in as
                        </p>
                        <p
                          style={{
                            fontFamily: 'DM Sans, sans-serif',
                            fontSize: '12px',
                            fontWeight: 500,
                            color: 'var(--ink)',
                            margin: 0,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: '160px',
                          }}
                        >
                          {user.email}
                        </p>
                      </div>

                      <Link
                        href="/profile"
                        onClick={() => setAvatarMenuOpen(false)}
                        role="menuitem"
                        style={{
                          display: 'block',
                          width: '100%',
                          textAlign: 'left',
                          fontFamily: 'DM Sans, sans-serif',
                          fontSize: '13px',
                          color: 'var(--ink)',
                          textDecoration: 'none',
                          background: 'none',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '7px 10px',
                          cursor: 'pointer',
                          transition: 'background 0.12s ease',
                        }}
                      >
                        My Profile
                      </Link>

                      {isAdmin && (
                        <Link
                          href="/admin/dashboard"
                          onClick={() => setAvatarMenuOpen(false)}
                          role="menuitem"
                          style={{
                            display: 'block',
                            width: '100%',
                            textAlign: 'left',
                            fontFamily: 'DM Sans, sans-serif',
                            fontSize: '13px',
                            color: 'var(--ink)',
                            textDecoration: 'none',
                            background: 'none',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '7px 10px',
                            cursor: 'pointer',
                            transition: 'background 0.12s ease',
                          }}
                        >
                          Admin Dashboard
                        </Link>
                      )}

                      <div style={{ height: '1px', background: 'var(--cream-border)', margin: '6px 0' }} />

                      <button
                        id="nav-sign-out-btn"
                        onClick={() => { setAvatarMenuOpen(false); signOut() }}
                        role="menuitem"
                        style={{
                          display: 'block',
                          width: '100%',
                          textAlign: 'left',
                          fontFamily: 'DM Sans, sans-serif',
                          fontSize: '13px',
                          color: 'var(--accent)',
                          background: 'none',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '7px 10px',
                          cursor: 'pointer',
                          transition: 'background 0.12s ease',
                        }}
                      >
                        Sign out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              /* ── Logged-out: Login only (WhatsApp is permanent above) ── */
              <button
                id="nav-login-btn"
                onClick={() => openModal()}
                style={{
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize: '13px',
                  fontWeight: 400,
                  color: 'var(--ink)',
                  padding: '6px 14px',
                  border: '1px solid var(--cream-border)',
                  borderRadius: '6px',
                  background: 'transparent',
                  cursor: 'pointer',
                  transition: 'border-color 0.15s ease, background 0.15s ease',
                }}
              >
                Login
              </button>
            )}
          </div>
        )}

        {/* Mobile menu toggle — only on compact screens */}
        {isCompactNav && (
          <button
            type="button"
            className="nav-burger"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((o) => !o)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: '5px',
              width: '44px',
              height: '44px',
              padding: '10px',
              background: 'var(--white)',
              border: '1px solid var(--cream-border)',
              borderRadius: '10px',
              cursor: 'pointer',
              flexShrink: 0,
              boxShadow: '0 1px 2px rgba(28,26,22,0.06)',
            }}
          >
            <span style={{ display: 'block', height: '2px', background: 'var(--ink)', borderRadius: '1px', width: '100%' }} />
            <span style={{ display: 'block', height: '2px', background: 'var(--ink)', borderRadius: '1px', width: '100%' }} />
            <span style={{ display: 'block', height: '2px', background: 'var(--ink)', borderRadius: '1px', width: '100%' }} />
          </button>
        )}
      </nav>

      {/* Mobile drawer */}
      {isCompactNav && mobileMenuOpen && (
        <>
          <div
            className="nav-mobile-backdrop"
            style={{ position: 'fixed', inset: 0, background: 'rgba(28,26,22,0.35)', zIndex: 60 }}
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden
          />
          <div
            className="nav-mobile-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Main navigation"
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              width: 'min(320px, 92vw)',
              height: '100vh',
              background: 'var(--white)',
              borderLeft: '1px solid var(--cream-border)',
              zIndex: 70,
              padding: '20px 18px 28px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              overflowY: 'auto',
              boxShadow: '-8px 0 32px rgba(0,0,0,0.08)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '12px', fontWeight: 600, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Menu</span>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
                style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '22px', lineHeight: 1, color: 'var(--ink-3)', padding: '4px 8px', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                ×
              </button>
            </div>
            <Link href="/" onClick={() => setMobileMenuOpen(false)} style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '14px', fontWeight: isActive('/') ? 500 : 400, color: isActive('/') ? 'var(--ink)' : 'var(--ink-2)', padding: '10px 0', borderBottom: '1px solid var(--cream-border)' }}>Grants &amp; Funding</Link>
            {/* <Link href="/events" onClick={() => setMobileMenuOpen(false)} style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '14px', padding: '10px 0', borderBottom: '1px solid var(--cream-border)', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--ink-2)' }}>Events <ComingSoonBadge label="Launching Soon" /></Link>
            <Link href="/newsletter" onClick={() => setMobileMenuOpen(false)} style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '14px', padding: '10px 0', borderBottom: '1px solid var(--cream-border)', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--ink-2)' }}>Newsletter <ComingSoonBadge label="Launching Soon" /></Link> */}
            <Link href="mailto:deeksharai014@gmail.com?subject=Software%20Deals%20%20%3C%3E%20StartupProgram%20Site!" onClick={() => setMobileMenuOpen(false)} style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '14px', padding: '10px 0', borderBottom: '1px solid var(--cream-border)', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--ink-2)' }}>Software Deals <ComingSoonBadge label="Coming Soon" /></Link>
            <WhatsAppLink
              onClick={() => setMobileMenuOpen(false)}
              style={{ marginTop: '8px' }}
            />
            <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--cream-border)' }}>
              {user ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <Link href="/profile" onClick={() => setMobileMenuOpen(false)} style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '14px', color: 'var(--ink)', padding: '8px 0' }}>My Profile</Link>
                  {isAdmin && (
                    <Link href="/admin/dashboard" onClick={() => setMobileMenuOpen(false)} style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '14px', color: 'var(--ink)', padding: '8px 0' }}>Admin Dashboard</Link>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false)
                      signOut()
                    }}
                    style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '14px', color: 'var(--accent)', textAlign: 'left', padding: '8px 0', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false)
                    openModal()
                  }}
                  style={{
                    width: '100%',
                    fontFamily: 'DM Sans, sans-serif',
                    fontSize: '14px',
                    padding: '10px 14px',
                    border: '1px solid var(--cream-border)',
                    borderRadius: '8px',
                    background: 'var(--ink)',
                    color: 'var(--cream)',
                    cursor: 'pointer',
                  }}
                >
                  Login
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </header>
  )
}
