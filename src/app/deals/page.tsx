import Link from 'next/link'
import type { Metadata } from 'next'
import { EmailCapture } from '@/components/ui/EmailCapture'

export const metadata: Metadata = {
  title: 'Software Deals — GrantsIndia',
  description:
    'Exclusive software deals and startup discounts on the tools you need to build and grow. Coming soon on GrantsIndia.',
}

export default function DealsPage() {
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

      {/* Coming Soon tag */}
      <span
        className="coming-soon-badge"
        style={{ marginBottom: '20px', fontSize: '11px', padding: '3px 10px' }}
      >
        Coming Soon
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
          maxWidth: '540px',
        }}
      >
        Software Deals for Indian Startups
      </h1>

      {/* Description */}
      <p
        style={{
          fontFamily: 'DM Sans, sans-serif',
          fontSize: '15px',
          fontWeight: 300,
          color: 'var(--ink-2)',
          lineHeight: 1.65,
          marginBottom: '36px',
          maxWidth: '460px',
        }}
      >
        Exclusive credits and discounts on Notion, Zoho, AWS, Razorpay, and 50+ tools that
        Indian founders actually use. Drop your email to be first in line.
      </p>

      {/* Email capture */}
      <EmailCapture id="deals-email" buttonLabel="Get early access" />

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
