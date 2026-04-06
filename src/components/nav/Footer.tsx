'use client'

import Link from 'next/link'

export function Footer() {
  return (
    <footer style={{ 
      background: 'var(--cream)', 
      borderTop: '1px solid var(--cream-border)',
      padding: '80px 24px 40px',
      marginTop: 'auto'
    }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ 
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
              <Link 
                href="https://chat.whatsapp.com/L9zR9g0GpLSFRTzQ5Ybcru" 
                target="_blank"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#fff',
                  border: '1px solid var(--cream-border)',
                  borderRadius: '100px',
                  padding: '6px 14px',
                  textDecoration: 'none',
                  color: 'var(--ink-2)',
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize: '12px',
                  fontWeight: 500,
                  transition: 'all 0.15s ease'
                }}
                onMouseOver={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
                onMouseOut={(e) => (e.currentTarget.style.borderColor = 'var(--cream-border)')}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                WhatsApp
              </Link>
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
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
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
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><path d="m22 6-10 7L2 6"/></svg>
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
              <Link href="/terms" style={linkStyle}>Terms of Service</Link>
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
            © 2026 StartupGrantsIndia. All rights reserved.
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
