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
    <div style={{
      borderBottom: '1px solid var(--cream-border)',
      marginBottom: '32px',
      overflowX: 'auto',
      WebkitOverflowScrolling: 'touch',
      position: 'relative'
    }}>
      <div style={{ display: 'flex', gap: '28px', minWidth: 'max-content', padding: '0 4px' }}>
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '13.5px',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? 'var(--accent)' : 'var(--ink-3)',
                padding: '14px 0',
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                position: 'relative',
                transition: 'all 0.2s ease',
                letterSpacing: '-0.01em'
              }}
              className="premium-nav-item"
            >
              {item.label}
              {isActive && (
                <span style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '2px',
                  background: 'var(--accent)',
                  borderRadius: '100px'
                }} />
              )}
            </Link>
          )
        })}
      </div>
      <style dangerouslySetInnerHTML={{
        __html: `
        .premium-nav-item:hover {
          color: var(--accent) !important;
        }
      `}} />
    </div>
  )
}
