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
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0, position: 'relative' }}>
          {/* Permanent WhatsApp Community Button */}
          <Link
            href="https://chat.whatsapp.com/L9zR9g0GpLSFRTzQ5Ybcru"
            target="_blank"
            rel="noopener noreferrer"
            id="nav-whatsapp-btn"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#fff',
              border: '1px solid var(--cream-border)',
              borderRadius: '100px',
              padding: '6px 14px',
              textDecoration: 'none',
              color: 'var(--ink-2)',
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '12px',
              fontWeight: 500,
              transition: 'all 0.15s ease'
            }}
            onMouseOver={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
            onMouseOut={(e) => (e.currentTarget.style.borderColor = 'var(--cream-border)')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            WhatsApp
          </Link>

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
      </nav>
    </header>
  )
}
