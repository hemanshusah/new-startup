'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { ComingSoonBadge } from './ComingSoonBadge'
import { useAuth } from '../auth/AuthProvider'

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

  const isActive = (href: string) => pathname === href
  const avatarUrl = profile?.avatar_url || (user?.user_metadata?.avatar_url as string | undefined)
  const initials = user ? getInitials(user) : ''
  const isAdmin = profile?.role === 'admin'

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
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 24px',
          height: '56px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '24px',
        }}
      >
        {/* Logo */}
        <Link
          href="/"
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

        {/* Nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flex: 1 }}>
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

          <Link
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
          </Link>

          <Link
            href="/deals"
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

        {/* Right actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0, position: 'relative' }}>
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
            /* ── Logged-out: Login + Subscribe ── */
            <>
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
              <Link
                href="/newsletter"
                id="nav-subscribe-btn"
                style={{
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: 'var(--cream)',
                  padding: '6px 16px',
                  borderRadius: '6px',
                  background: 'var(--ink)',
                  display: 'inline-block',
                }}
              >
                Subscribe
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}
