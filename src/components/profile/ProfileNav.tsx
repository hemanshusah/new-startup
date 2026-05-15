'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function ProfileNav() {
  const pathname = usePathname()

  const navItems = [
    { label: 'My Profile', href: '/profile' },
  ]

  return (
    <div style={{
      borderBottom: '1px solid var(--cream-border)',
      marginBottom: '32px',
      overflowX: 'auto',
      WebkitOverflowScrolling: 'touch',
    }}>
      <div style={{
        display: 'flex',
        gap: '24px',
        minWidth: 'max-content',
        padding: '0 4px',
      }}>
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '14px',
                fontWeight: isActive ? 500 : 400,
                color: isActive ? 'var(--ink)' : 'var(--ink-3)',
                padding: '12px 0',
                borderBottom: `2px solid ${isActive ? 'var(--accent)' : 'transparent'}`,
                textDecoration: 'none',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
              }}
            >
              {item.label}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
