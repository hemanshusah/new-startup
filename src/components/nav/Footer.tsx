'use client'

import Link from 'next/link'
import { WhatsAppLink } from './WhatsAppLink'

export function Footer() {
  return (
    <footer style={{
      background: 'var(--cream)',
      borderTop: '1px solid var(--cream-border)',
      padding: '80px 24px 40px',
      marginTop: 'auto'
    }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <div className="footer-grid" style={{
          display: 'grid',
          gridTemplateColumns: '1.5fr 1fr 1fr 1fr',
          gap: '48px',
          marginBottom: '80px'
        }}>
          {/* Brand & Socials */}
          <div>
            <Link href="/" style={{
              fontFamily: 'DM Serif Display, serif',
              fontSize: '22px',
              color: 'var(--ink)',
              textDecoration: 'none',
              display: 'block',
              marginBottom: '12px'
            }}>
              StartupGrantsIndia
            </Link>
            <p style={{
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '14px',
              lineHeight: '1.6',
              color: 'var(--ink-3)',
              marginBottom: '24px',
              maxWidth: '240px'
            }}>
              India&apos;s startup funding directory — grants, events & deals in one place.
            </p>

            {/* Social Buttons Row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
              <WhatsAppLink />
              <Link
                href="https://linkedin.com"
                target="_blank"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#fff',
                  border: '1px solid var(--cream-border)',
                  borderRadius: '8px',
                  width: '32px',
                  height: '32px',
                  textDecoration: 'none',
                  color: 'var(--ink-2)',
                  transition: 'all 0.15s ease'
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
              </Link>
              <Link
                href="mailto:hello@startupgrantsindia.com"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#fff',
                  border: '1px solid var(--cream-border)',
                  borderRadius: '8px',
                  width: '32px',
                  height: '32px',
                  textDecoration: 'none',
                  color: 'var(--ink-2)',
                  transition: 'all 0.15s ease'
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><path d="m22 6-10 7L2 6" /></svg>
              </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Link href="/contact" style={linkStyle}>Contact Us</Link>
              <Link href="/advertise" style={linkStyle}>Partner With Us</Link>
            </div>
          </div>

          {/* Founders */}
          <div>
            <h4 style={headerStyle}>FOR FOUNDERS</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Link href="/" style={linkStyle}>Browse Grants</Link>
              <Link href="/newsletter" style={linkStyle}>Newsletter</Link>
              <Link href="/events" style={linkStyle}>Startup Events</Link>
              <Link href="/deals" style={linkStyle}>Software Deals</Link>
            </div>
          </div>

          {/* Partners */}
          <div>
            <h4 style={headerStyle}>FOR PARTNERS</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Link href="/advertise" style={linkStyle}>Advertise With Us</Link>
              <Link href="/submit-program" style={linkStyle}>Submit a Program</Link>
              <Link href="/deals" style={linkStyle}>Submit a Software Deal</Link>
              <Link href="/events" style={linkStyle}>Submit an Event</Link>
            </div>
          </div>

          {/* Legal */}
          <div>
            <h4 style={headerStyle}>LEGAL</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Link href="/terms" style={linkStyle}>Terms &amp; Conditions</Link>
              <Link href="/privacy" style={linkStyle}>Privacy Policy</Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '32px',
          borderTop: '1px solid var(--cream-border)'
        }}>
          <p style={{
            fontFamily: 'SF Mono, Fira Code, monospace',
            fontSize: '11px',
            color: 'var(--ink-4)',
            textTransform: 'lowercase'
          }}>
            © 2026 Poodnak Private Limited. All rights reserved.
          </p>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            background: '#FFF9ED',
            border: '1px solid #FFBE46',
            borderRadius: '100px',
            color: '#D4820E',
            fontSize: '11px',
            fontFamily: 'DM Sans, sans-serif'
          }}>
            <span style={{ width: '6px', height: '6px', background: '#D4820E', borderRadius: '50%' }} />
            We are a private platform. Not affiliated with any government body
          </div>
        </div>
      </div>
    </footer>
  )
}

const headerStyle = {
  fontFamily: 'DM Sans, sans-serif',
  fontSize: '10px',
  fontWeight: 700,
  color: 'var(--ink-4)',
  letterSpacing: '0.1em',
  marginBottom: '24px',
  textTransform: 'uppercase' as const
}

const linkStyle = {
  fontFamily: 'DM Sans, sans-serif',
  fontSize: '13.5px',
  fontWeight: 400,
  color: 'var(--ink-2)',
  textDecoration: 'none',
  transition: 'color 0.1s ease'
}
