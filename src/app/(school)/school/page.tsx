import Link from 'next/link'
import { getSchoolNavigation } from '@/lib/school/navigation'

/**
 * /school → Dashboard view showing all available modules (courses)
 */
export default async function SchoolPage() {
  const { modules } = await getSchoolNavigation()

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header section with core project aesthetics */}
      <header style={{ 
        background: 'var(--white)', 
        borderBottom: '1px solid var(--cream-border)', 
        padding: '60px 24px 80px',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ 
            display: 'inline-block',
            padding: '4px 12px',
            background: 'var(--accent-light)',
            color: 'var(--accent)',
            borderRadius: '100px',
            fontSize: '12px',
            fontWeight: 600,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            marginBottom: '24px'
          }}>
            Academy
          </div>
          <h1 style={{ 
            fontFamily: 'var(--font-serif), serif', 
            fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', 
            fontWeight: 400,
            color: 'var(--ink)',
            lineHeight: 1.1,
            marginBottom: '20px'
          }}>
            Startup<span style={{ color: 'var(--accent)' }}>School</span>
          </h1>
          <p style={{ 
            fontFamily: 'var(--font-sans), sans-serif',
            fontSize: '1.15rem',
            color: 'var(--ink-3)',
            lineHeight: 1.6,
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            A structured curriculum designed to help Indian founders build, scale, and fund their startups from scratch.
          </p>
        </div>
      </header>

      {/* Main Dashboard Grid */}
      <main style={{ 
        flex: 1,
        maxWidth: '1200px', 
        width: '100%',
        margin: '-40px auto 80px', 
        padding: '0 24px'
      }}>
        {modules.length === 0 ? (
          <div style={{ 
            background: 'var(--white)', 
            padding: '60px', 
            borderRadius: '16px', 
            border: '1px solid var(--cream-border)',
            textAlign: 'center'
          }}>
             <p style={{ color: 'var(--ink-3)' }}>No courses are published yet. Check back soon!</p>
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', 
            gap: '32px' 
          }}>
            {modules.map((mod, idx) => (
              <Link 
                key={mod.id} 
                href={mod.lessons.length > 0 ? `/school/${mod.slug}/${mod.lessons[0].slug}` : '#'}
                className="module-card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  background: 'var(--white)',
                  border: '1px solid var(--cream-border)',
                  borderRadius: '16px',
                  padding: '32px',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Visual indicator (index) */}
                <div style={{
                  position: 'absolute',
                  top: '24px',
                  right: '32px',
                  fontSize: '48px',
                  fontWeight: 700,
                  color: 'var(--bg)',
                  lineHeight: 1,
                  userSelect: 'none',
                  zIndex: 0
                }}>
                  {String(idx + 1).padStart(2, '0')}
                </div>

                <div style={{ position: 'relative', zIndex: 1 }}>
                  <h3 style={{ 
                    fontFamily: 'var(--font-serif), serif', 
                    fontSize: '1.5rem', 
                    color: 'var(--ink)',
                    marginBottom: '12px',
                    fontWeight: 400
                  }}>
                    {mod.title}
                  </h3>
                  <p style={{ 
                    fontFamily: 'var(--font-sans), sans-serif',
                    fontSize: '14px',
                    color: 'var(--ink-3)',
                    lineHeight: 1.5,
                    marginBottom: '24px',
                    minHeight: '63px'
                  }}>
                    {mod.description || 'Explore the fundamentals of this module and master the core concepts needed for success.'}
                  </p>

                  <div style={{ 
                    marginTop: 'auto',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <span style={{ 
                      fontSize: '12px', 
                      color: 'var(--ink-4)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      fontWeight: 600
                    }}>
                      {mod.lessons.length} {mod.lessons.length === 1 ? 'Lesson' : 'Lessons'}
                    </span>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'var(--bg)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--ink-2)',
                      transition: 'all 0.2s ease'
                    }} className="card-arrow">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12 5 19 12 12 19"></polyline>
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* Footer link back to main site */}
      <footer style={{ padding: '40px 24px', textAlign: 'center', borderTop: '1px solid var(--cream-border)', background: 'var(--white)' }}>
        <Link href="/" className="back-link" style={{ color: 'var(--ink-3)', fontSize: '13px', textDecoration: 'none' }}>
           &larr; Back to GrantsIndia
        </Link>
      </footer>

      {/* Inline styles for hover effects since we can't do them easily in inline style objects */}
      <style dangerouslySetInnerHTML={{ __html: `
        .module-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        .module-card:hover {
          border-color: var(--accent) !important;
          box-shadow: 0 12px 24px rgba(184, 70, 10, 0.08);
          transform: translateY(-4px);
        }
        .module-card:hover .card-arrow {
          background: var(--accent) !important;
          color: white !important;
          transform: translateX(4px);
        }
        .back-link {
          transition: all 0.2s ease;
          opacity: 0.8;
        }
        .back-link:hover {
          opacity: 1;
          color: var(--accent) !important;
          transform: translateX(-4px);
          display: inline-block;
        }
      `}} />
    </div>
  )
}
