'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavItem {
  label: string
  href: string
}

interface MentorNavProps {
  navItems: NavItem[]
}

export default function MentorNav({ navItems }: MentorNavProps) {
  const pathname = usePathname()

  return (
    <div style={{ borderBottom: '1px solid var(--cream-border)', marginBottom: '32px', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
      <div style={{ display: 'flex', gap: '24px', minWidth: 'max-content', padding: '0 4px' }}>
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '14px',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? 'var(--ink)' : 'var(--ink-4)',
                padding: '12px 0',
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                borderBottom: `2px solid ${isActive ? 'var(--accent)' : 'transparent'}`,
                transition: 'all 0.2s ease',
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
