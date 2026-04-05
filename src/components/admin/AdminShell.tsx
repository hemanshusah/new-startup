'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/auth/AuthProvider'
import { useRef } from 'react'

const NAV_ITEMS = [
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
    label: 'Ads',
    href: '/admin/ads',
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
}

export function AdminShell({ children, adminEmail }: AdminShellProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = useRef(createClient()).current

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const displayName = adminEmail
    ? adminEmail.split('@')[0]
    : 'Admin'

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--cream)' }}>
      {/* ── Fixed Left Sidebar ── */}
      <aside
        style={{
          width: '220px',
          flexShrink: 0,
          background: 'var(--white)',
          borderRight: '1px solid var(--cream-border)',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 40,
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
              fontFamily: 'DM Serif Display, serif',
              fontSize: '18px',
              fontWeight: 400,
              textDecoration: 'none',
            }}
          >
            <span style={{ color: 'var(--ink)' }}>Grants</span>
            <span style={{ color: 'var(--accent)' }}>India</span>
          </Link>
          <p
            style={{
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '10px',
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
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '9px 11px',
                  borderRadius: '8px',
                  marginBottom: '2px',
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize: '13px',
                  fontWeight: isActive ? 500 : 400,
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
            background: 'var(--cream)',
          }}
        >
          <p
            style={{
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '11px',
              color: 'var(--ink-4)',
              marginBottom: '2px',
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
              marginBottom: '10px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {adminEmail ?? displayName}
          </p>
          <button
            id="admin-sign-out-btn"
            onClick={handleSignOut}
            style={{
              width: '100%',
              fontFamily: 'DM Sans, sans-serif',
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
        style={{
          marginLeft: '220px',
          flex: 1,
          minHeight: '100vh',
          padding: '32px 36px',
          maxWidth: 'calc(100vw - 220px)',
          overflowX: 'hidden',
        }}
      >
        {children}
      </main>
    </div>
  )
}
