'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/auth/AuthProvider'
import { useMemo, useRef, useState, useEffect } from 'react'
import { PageTransition } from '@/components/ui/PageTransition'

const NAV_ITEMS = [
  // ... (keep navigation items)
  {
    label: 'Dashboard',
    href: '/admin/dashboard',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <rect x="1" y="1" width="6" height="6" rx="1" fill="currentColor" opacity="0.8" />
        <rect x="9" y="1" width="6" height="6" rx="1" fill="currentColor" opacity="0.8" />
        <rect x="1" y="9" width="6" height="6" rx="1" fill="currentColor" opacity="0.8" />
        <rect x="9" y="9" width="6" height="6" rx="1" fill="currentColor" opacity="0.8" />
      </svg>
    ),
  },
  {
    label: 'Programs',
    href: '/admin/programs',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <rect x="1" y="3" width="14" height="2" rx="1" fill="currentColor" />
        <rect x="1" y="7" width="14" height="2" rx="1" fill="currentColor" />
        <rect x="1" y="11" width="8" height="2" rx="1" fill="currentColor" />
      </svg>
    ),
  },
  {
    label: 'SoftInfra',
    href: '/admin/softinfra',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M2 11 L8 3 L14 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5 8 L11 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: 'Users',
    href: '/admin/users',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <circle cx="8" cy="5" r="3" fill="currentColor" opacity="0.8" />
        <path d="M2 14c0-3.314 2.686-5 6-5s6 1.686 6 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: 'Settings',
    href: '/admin/settings',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
]

interface AdminShellProps {
  children: React.ReactNode
  adminEmail?: string
  role?: string
}

export function AdminShell({ children, adminEmail, role }: AdminShellProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const { user, profile, signOut } = useAuth()
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  useEffect(() => {
    if (mobileSidebarOpen) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = prev
      }
    }
  }, [mobileSidebarOpen])

  const handleSignOut = async () => {
    await signOut()
  }

  const displayName = adminEmail
    ? adminEmail.split('@')[0]
    : 'Admin'

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      {mobileSidebarOpen && (
        <div
          className="admin-sidebar-backdrop"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(28,26,22,0.35)',
            zIndex: 999,
          }}
          onClick={() => setMobileSidebarOpen(false)}
          aria-hidden
        />
      )}
      {/* ── Fixed Left Sidebar ── */}
      <aside
        className={`admin-sidebar${mobileSidebarOpen ? ' admin-sidebar-open' : ''}`}
        style={{
          width: '220px',
          flexShrink: 0,
          background: 'var(--header-bg)',
          borderRight: '1px solid var(--cream-border)',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 1000,
          boxShadow: '4px 0 24px rgba(0,0,0,0.02)',
          transition: 'transform 0.2s ease',
        }}
      >
        {/* Logo */}
        <div
          style={{
            padding: '20px 18px 16px',
            borderBottom: '1px solid var(--cream-border)',
          }}
        >
          <Link
            href="/"
            style={{
              fontFamily: 'var(--font-section), var(--font-serif), serif',
              fontSize: '18px',
              fontWeight: 'var(--font-weight-section)' as any,
              fontStyle: 'var(--font-style-section)' as any,
              textDecoration: 'none',
            }}
          >
            <span style={{ color: 'var(--ink)' }}>Grants</span>
            <span style={{ color: 'var(--accent)' }}>India</span>
          </Link>
          <p
            style={{
              fontFamily: 'var(--font-sans), sans-serif',
              fontSize: '10px',
              fontWeight: 'var(--font-weight-body)' as any,
              color: 'var(--ink-4)',
              marginTop: '2px',
            }}
          >
            Admin Panel
          </p>
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === '/admin/dashboard'
                ? pathname === '/admin/dashboard' || pathname === '/admin'
                : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileSidebarOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '9px 11px',
                  borderRadius: '8px',
                  marginBottom: '2px',
                  fontFamily: 'var(--font-section), var(--font-sans), sans-serif',
                  fontSize: '13px',
                  fontWeight: isActive ? 600 : ('var(--font-weight-section)' as any),
                  fontStyle: 'var(--font-style-section)' as any,
                  color: isActive ? 'var(--ink)' : 'var(--ink-3)',
                  background: isActive ? 'var(--cream)' : 'transparent',
                  textDecoration: 'none',
                  transition: 'background 0.12s ease, color 0.12s ease',
                }}
              >
                <span style={{ color: isActive ? 'var(--ink)' : 'var(--ink-4)', flexShrink: 0 }}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Sidebar footer — admin name + logout */}
        <div
          style={{
            padding: '14px 14px',
            borderTop: '1px solid var(--cream-border)',
            background: 'var(--header-bg)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'var(--cream-dark)',
              border: '1px solid var(--cream-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              flexShrink: 0,
            }}>
              {profile?.avatar_url || user?.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                  src={profile?.avatar_url || user?.image || ''} 
                  alt="Avatar" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              ) : (
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--ink-4)' }}>
                  {(adminEmail || user?.email || 'A').slice(0, 1).toUpperCase()}
                </span>
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{
                  fontFamily: 'var(--font-sans), sans-serif',
                  fontSize: '10px',
                  color: 'var(--ink-4)',
                  marginBottom: '1px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em'
                }}
              >
                Signed in as
              </p>
              <p
                style={{
                  fontFamily: 'var(--font-sans), sans-serif',
                  fontSize: '12px',
                  fontWeight: 500,
                  color: 'var(--ink)',
                  margin: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
                title={adminEmail ?? displayName}
              >
                {adminEmail ?? displayName}
              </p>
            </div>
          </div>
          <button
            id="admin-sign-out-btn"
            onClick={handleSignOut}
            style={{
              width: '100%',
              fontFamily: 'var(--font-sans), sans-serif',
              fontSize: '12px',
              fontWeight: 500,
              color: 'var(--ink-3)',
              background: 'transparent',
              border: '1px solid var(--cream-border)',
              borderRadius: '6px',
              padding: '7px 0',
              cursor: 'pointer',
              transition: 'border-color 0.12s ease, color 0.12s ease',
            }}
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Main content area ── */}
      <main
        className="admin-main"
        style={{
          marginLeft: '220px',
          flex: 1,
          minHeight: '100vh',
          padding: '40px 48px',
          maxWidth: 'calc(100vw - 220px)',
          position: 'relative',
        }}
      >
        <button
          type="button"
          className="admin-burger"
          aria-label="Open navigation menu"
          onClick={() => setMobileSidebarOpen(true)}
          style={{
            display: 'none',
            alignItems: 'center',
            justifyContent: 'center',
            width: '40px',
            height: '40px',
            marginBottom: '16px',
            border: '1px solid var(--cream-border)',
            borderRadius: '8px',
            background: 'var(--white)',
            cursor: 'pointer',
          }}
        >
          <span style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ width: '18px', height: '2px', background: 'var(--ink)', borderRadius: '1px' }} />
            <span style={{ width: '18px', height: '2px', background: 'var(--ink)', borderRadius: '1px' }} />
            <span style={{ width: '18px', height: '2px', background: 'var(--ink)', borderRadius: '1px' }} />
          </span>
        </button>
        {/* Admin Role Warning Banner */}
        {role && role !== 'admin' && (
          <div style={{
            background: '#FFF4F2',
            border: '1px solid #F0B8B8',
            borderRadius: '8px',
            padding: '12px 18px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <span style={{ fontSize: '18px' }}>⚠️</span>
            <div>
              <p style={{ fontFamily: 'var(--font-sans), sans-serif', fontSize: '13px', fontWeight: 600, color: '#B01F1F', margin: 0 }}>
                Restricted Access
              </p>
              <p style={{ fontFamily: 'var(--font-sans), sans-serif', fontSize: '12px', color: '#B01F1F', margin: '2px 0 0', opacity: 0.8 }}>
                Your account ({adminEmail}) is logged in, but might not have &quot;admin&quot; privileges in the database. some actions may fail.
              </p>
            </div>
          </div>
        )}

        <PageTransition>
          {children}
        </PageTransition>
      </main>
    </div>
  )
}
