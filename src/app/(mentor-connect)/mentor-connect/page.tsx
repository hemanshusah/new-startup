import type { Metadata } from 'next'
import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Mentor Connect | GrantsHub India',
  description: 'Book sessions with verified mentors in cross-border expansion, grant navigation, regulatory compliance, and market entry.',
}

// Revalidate this page every hour
export const revalidate = 3600

export default async function MentorConnectHomepage() {
  const supabase = createServiceClient()

  // Fetch featured mentors
  const { data: featuredMentors } = await supabase
    .from('mentor_profiles')
    .select('id, display_name, slug, headline, avatar_url, verification_tier, avg_rating')
    .eq('status', 'active')
    .eq('is_featured', true)
    .limit(4)

  return (
    <main style={{ background: 'var(--cream)', minHeight: 'calc(100vh - 56px)' }}>
      {/* ── HERO SECTION ── */}
      <section style={{
        padding: '100px 24px',
        textAlign: 'center',
        background: 'linear-gradient(180deg, var(--white) 0%, var(--cream) 100%)',
        borderBottom: '1px solid var(--cream-border)',
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{
            display: 'inline-block',
            padding: '6px 12px',
            background: '#EDF5EA',
            color: '#2A6620',
            borderRadius: '100px',
            fontFamily: 'var(--font-sans)',
            fontSize: '12px',
            fontWeight: 600,
            letterSpacing: '0.04em',
            marginBottom: '24px',
          }}>
            NOW LIVE IN BETA
          </div>
          <h1 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'min(64px, 12vw)',
            fontWeight: 400,
            color: 'var(--ink)',
            margin: '0 0 20px',
            lineHeight: 1.05,
          }}>
            Expertise you can <br /> actually trust.
          </h1>
          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 'min(20px, 5vw)',
            color: 'var(--ink-3)',
            lineHeight: 1.5,
            maxWidth: '600px',
            margin: '0 auto 40px',
          }}>
            Book 1:1 sessions with vetted founders and operators who have successfully navigated grants, compliance, and cross-border expansion.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href="/mentor-connect/mentors"
              style={{
                padding: '16px 32px',
                background: 'var(--ink)',
                color: 'var(--white)',
                borderRadius: '12px',
                fontFamily: 'var(--font-sans)',
                fontSize: '15px',
                fontWeight: 500,
                textDecoration: 'none',
                boxShadow: '0 4px 12px rgba(28,26,22,0.1)',
                transition: 'transform 0.15s ease',
              }}
            >
              Browse Directory
            </Link>
            <Link
              href="/mentor-connect/how-it-works"
              style={{
                padding: '16px 32px',
                background: 'var(--white)',
                color: 'var(--ink)',
                border: '1px solid var(--cream-border)',
                borderRadius: '12px',
                fontFamily: 'var(--font-sans)',
                fontSize: '15px',
                fontWeight: 500,
                textDecoration: 'none',
                transition: 'background 0.15s ease',
              }}
            >
              How it Works
            </Link>
          </div>
        </div>
      </section>

      {/* ── STATS / TRUST BAR ── */}
      <section style={{ padding: '40px 24px', borderBottom: '1px solid var(--cream-border)', background: 'var(--white)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '32px' }}>
          {[
            { label: 'Vetted Mentors', value: '50+' },
            { label: 'Avg. Rating', value: '4.9/5' },
            { label: 'Active Sectors', value: '12' },
          ].map((stat) => (
            <div key={stat.label} style={{ textAlign: 'center' }}>
              <p style={{ fontFamily: 'var(--font-serif)', fontSize: '36px', color: 'var(--ink)', margin: '0 0 4px' }}>{stat.value}</p>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURED MENTORS ── */}
      <section style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
            <div>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '36px', color: 'var(--ink)', margin: '0 0 8px' }}>
                Featured Experts
              </h2>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '16px', color: 'var(--ink-3)', margin: 0 }}>
                Hand-picked mentors who consistently deliver high-impact sessions.
              </p>
            </div>
            <Link
              href="/mentor-connect/mentors"
              style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 500, color: 'var(--accent)', textDecoration: 'none' }}
            >
              View all →
            </Link>
          </div>

          {!featuredMentors || featuredMentors.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center', background: 'var(--white)', borderRadius: '16px', border: '1px dashed var(--cream-border)' }}>
              <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--ink-4)' }}>No featured mentors yet. Check back soon!</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
              {featuredMentors.map((mentor) => (
                <Link key={mentor.id} href={`/mentor-connect/mentors/${mentor.slug}`} style={{ textDecoration: 'none' }}>
                  <div style={{
                    background: 'var(--white)',
                    border: '1px solid var(--cream-border)',
                    borderRadius: '16px',
                    padding: '24px',
                    height: '100%',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                      {mentor.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={mentor.avatar_url} alt="" style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--cream-dark)' }} />
                      )}
                      <div>
                        <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '16px', fontWeight: 600, color: 'var(--ink)', margin: '0 0 4px' }}>
                          {mentor.display_name}
                        </h3>
                        {mentor.verification_tier !== 'community' && (
                          <span style={{ fontSize: '11px', background: '#EDF5EA', color: '#2A6620', padding: '2px 6px', borderRadius: '4px', fontWeight: 500 }}>
                            {mentor.verification_tier === 'verified' ? 'Verified' : 'Credential Verified'}
                          </span>
                        )}
                      </div>
                    </div>
                    <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--ink-3)', lineHeight: 1.5, margin: 0, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {mentor.headline}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── FOR MENTORS CTA ── */}
      <section style={{ padding: '80px 24px', background: 'var(--ink)', color: 'var(--white)', textAlign: 'center' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '40px', margin: '0 0 16px' }}>
            Are you an expert?
          </h2>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '18px', color: 'rgba(255,255,255,0.7)', margin: '0 0 40px', lineHeight: 1.6 }}>
            Join our curated network of top operators. Monetize your knowledge, give back to the ecosystem, and build your personal brand.
          </p>
          <Link
            href="/mentor-connect/apply"
            style={{
              display: 'inline-block',
              padding: '16px 32px',
              background: 'var(--white)',
              color: 'var(--ink)',
              borderRadius: '12px',
              fontFamily: 'var(--font-sans)',
              fontSize: '15px',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Apply to be a Mentor
          </Link>
        </div>
      </section>
    </main>
  )
}
