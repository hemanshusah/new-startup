'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'

interface MentorGoogleLockProps {
  isGoogleConnected: boolean
  children: React.ReactNode
}

export default function MentorGoogleLock({ isGoogleConnected, children }: MentorGoogleLockProps) {
  const pathname = usePathname()
  const router = useRouter()

  // Always allow the availability setup page so they can successfully link their Google Calendar
  const isAvailabilityPage = pathname === '/mentor/availability'

  if (!isGoogleConnected && !isAvailabilityPage) {
    return (
      <div 
        style={{ 
          background: 'var(--white)', 
          border: '1px solid var(--cream-border)', 
          borderRadius: '24px', 
          padding: '60px 40px', 
          textAlign: 'center', 
          maxWidth: '680px', 
          margin: '20px auto',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.02)'
        }}
      >
        <div 
          style={{ 
            width: '80px', 
            height: '80px', 
            background: '#FFF9ED', 
            color: '#D4820E', 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            fontSize: '36px', 
            margin: '0 auto 28px' 
          }}
        >
          📅
        </div>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', color: 'var(--ink)', margin: '0 0 16px', fontWeight: 400 }}>
          Google Calendar Connection Required
        </h2>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '15px', color: 'var(--ink-3)', lineHeight: 1.6, margin: '0 0 32px' }}>
          To maintain a professional, reliable experience for founders, we require all mentors to successfully connect their Google Calendar before publishing availability, editing session types, or receiving bookings.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '380px', margin: '0 auto' }}>
          <Link 
            href="/mentor/availability" 
            style={{ 
              display: 'block', 
              padding: '14px 28px', 
              background: 'var(--accent)', 
              color: 'var(--white)', 
              borderRadius: '8px', 
              fontFamily: 'var(--font-sans)', 
              fontSize: '15px', 
              fontWeight: 600, 
              textDecoration: 'none',
              transition: 'background 0.2s'
            }}
          >
            Go to Calendar Connection
          </Link>
          <span style={{ fontSize: '13px', color: 'var(--ink-4)', fontFamily: 'var(--font-sans)' }}>
            After successfully connecting, all your dashboard features will unlock instantly.
          </span>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
