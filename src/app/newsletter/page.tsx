import Link from 'next/link'
import type { Metadata } from 'next'
import { EmailCapture } from '@/components/ui/EmailCapture'

export const metadata: Metadata = {
  title: 'Newsletter — GrantsIndia',
  description:
    'Weekly digest of the best grants, accelerators, and funding opportunities for Indian startups. Subscribe free on GrantsIndia.',
}

export default function NewsletterPage() {
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
        India&rsquo;s Best Grants, Weekly in Your Inbox
      </h1>

      {/* Value prop */}
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
        Every Friday — curated grants, deadlines, and funding news for Indian founders.
        Free forever. No spam. Join 12,000+ founders already subscribed.
      </p>

      {/* Email capture */}
      <EmailCapture id="newsletter-email" buttonLabel="Subscribe free" />

      <p
        style={{
          fontFamily: 'DM Sans, sans-serif',
          fontSize: '11px',
          color: 'var(--ink-4)',
          marginTop: '12px',
        }}
      >
        Free forever · No spam · Unsubscribe anytime
      </p>

      {/* Back link */}
      <Link
        href="/"
        style={{
          fontFamily: 'DM Sans, sans-serif',
          fontSize: '12px',
          color: 'var(--ink-3)',
          marginTop: '24px',
        }}
      >
        ← Back to Grants &amp; Funding
      </Link>
    </div>
  )
}
