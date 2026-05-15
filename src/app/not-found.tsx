import Link from 'next/link'

export default function NotFound() {
  return (
    <main style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', background: 'var(--white)' }}>
      <div style={{ textAlign: 'center', maxWidth: '500px' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '80px', color: 'var(--ink)', margin: '0 0 16px', lineHeight: 1 }}>404</h1>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', color: 'var(--ink)', margin: '0 0 24px' }}>Page Not Found</h2>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '16px', color: 'var(--ink-3)', lineHeight: 1.6, margin: '0 0 32px' }}>
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <Link 
          href="/" 
          style={{ 
            display: 'inline-block', 
            padding: '14px 32px', 
            background: 'var(--ink)', 
            color: 'var(--white)', 
            borderRadius: '8px', 
            textDecoration: 'none', 
            fontFamily: 'var(--font-sans)', 
            fontWeight: 500 
          }}
        >
          Return Home
        </Link>
      </div>
    </main>
  )
}
