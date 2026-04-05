import Link from 'next/link'
import type { Metadata } from 'next'
import { EmailCapture } from '@/components/ui/EmailCapture'

export const metadata: Metadata = {
  title: 'Events — GrantsIndia',
  description:
    'Startup events, demo days, and founder meetups for the Indian startup ecosystem. Launching soon on GrantsIndia.',
}

export default function EventsPage() {
  return (
    <div
      style={{
        minHeight: 'calc(100vh - 56px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 24px',
        textAlign: 'center',
      }}
    >
      {/* Logo */}
      <Link
        href="/"
        style={{
          fontFamily: 'DM Serif Display, serif',
          fontSize: '22px',
          fontWeight: 400,
          marginBottom: '40px',
          display: 'inline-block',
        }}
      >
        <span style={{ color: 'var(--ink)' }}>Grants</span>
        <span style={{ color: 'var(--accent)' }}>India</span>
      </Link>

      {/* Launching Soon tag */}
      <span
        className="coming-soon-badge"
        style={{ marginBottom: '20px', fontSize: '11px', padding: '3px 10px' }}
      >
        Launching Soon
      </span>

      {/* Headline */}
      <h1
        style={{
          fontFamily: 'DM Serif Display, serif',
          fontSize: 'clamp(28px, 5vw, 40px)',
          fontWeight: 400,
          color: 'var(--ink)',
          lineHeight: 1.2,
          marginBottom: '16px',
          maxWidth: '520px',
        }}
      >
        Events for Indian Founders
      </h1>

      {/* Message */}
      <p
        style={{
          fontFamily: 'DM Sans, sans-serif',
          fontSize: '15px',
          fontWeight: 300,
          color: 'var(--ink-2)',
          lineHeight: 1.65,
          marginBottom: '36px',
          maxWidth: '440px',
        }}
      >
        Demo days, hackathons, investor meets, and founder conferences — all in one place.
        We&rsquo;re building something great. Drop your email to get notified first.
      </p>

      {/* Email capture (client component — event handlers cannot be in Server Components) */}
      <EmailCapture id="events-email" buttonLabel="Notify me" />

      {/* Back link */}
      <Link
        href="/"
        style={{
          fontFamily: 'DM Sans, sans-serif',
          fontSize: '12px',
          color: 'var(--ink-3)',
          marginTop: '32px',
        }}
      >
        ← Back to Grants &amp; Funding
      </Link>
    </div>
  )
}
