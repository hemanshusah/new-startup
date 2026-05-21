import type { Metadata } from 'next'
import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/server'
import { ArrowRight, Star, ShieldCheck, Sparkles, Award } from 'lucide-react'
import FeaturedSplitConsole from '@/components/mentor-connect/FeaturedSplitConsole'

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
    .select('id, display_name, slug, headline, avatar_url, verification_tier, avg_rating, bio, expertise_areas')
    .eq('status', 'active')
    .eq('is_featured', true)
    .limit(4)

  return (
    <main style={{ background: 'var(--bg)', minHeight: 'calc(100vh - 56px)' }}>
      {/* ── HERO SECTION ── */}
      <section style={{
        position: 'relative',
        padding: '120px 24px 100px',
        textAlign: 'center',
        background: 'linear-gradient(180deg, var(--white) 0%, var(--bg) 100%)',
        borderBottom: '1px solid var(--cream-border)',
        overflow: 'hidden'
      }}>
        {/* Subtle Decorative Ambient Lights */}
        <div style={{
          position: 'absolute',
          top: '-20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '600px',
          height: '400px',
          background: 'radial-gradient(circle, var(--accent-light) 0%, transparent 70%)',
          opacity: 0.6,
          zIndex: 0,
          pointerEvents: 'none'
        }} />

        <div style={{ maxWidth: '850px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            background: 'var(--accent-light)',
            color: 'var(--accent)',
            borderRadius: '100px',
            fontFamily: 'var(--font-sans)',
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: '28px',
            border: '1px solid rgba(184, 70, 10, 0.15)',
            boxShadow: '0 2px 8px rgba(184, 70, 10, 0.05)'
          }}>
            <Sparkles size={12} />
            EXPERT NETWORK
          </div>

          <h1 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(2.5rem, 6vw, 4.25rem)',
            fontWeight: 400,
            color: 'var(--ink)',
            margin: '0 0 24px',
            lineHeight: 1.08,
            letterSpacing: '-0.02em',
          }}>
            Expertise you can<br />
            <span style={{ color: 'var(--accent)', position: 'relative', display: 'inline-block' }}>
              actually trust.
            </span>
          </h1>

          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 'clamp(15px, 3.5vw, 18px)',
            color: 'var(--ink-3)',
            lineHeight: 1.6,
            maxWidth: '640px',
            margin: '0 auto 44px',
          }}>
            Skip the generic advice. Connect 1:1 with vetted operators and ecosystem leaders who have built real companies, secured massive grants, and executed global operations.
          </p>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href="/mentor-connect/mentors"
              className="btn-primary-custom"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '16px 36px',
                background: 'var(--ink)',
                color: 'var(--white)',
                borderRadius: 'var(--radius-lg, 12px)',
                fontFamily: 'var(--font-sans)',
                fontSize: '14.5px',
                fontWeight: 600,
                textDecoration: 'none',
                boxShadow: '0 8px 24px rgba(28,26,22,0.12)',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              Browse Network
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/mentor-connect/how-it-works"
              className="btn-secondary-custom"
              style={{
                padding: '16px 36px',
                background: 'var(--white)',
                color: 'var(--ink)',
                border: '1px solid var(--cream-border)',
                borderRadius: 'var(--radius-lg, 12px)',
                fontFamily: 'var(--font-sans)',
                fontSize: '14.5px',
                fontWeight: 600,
                textDecoration: 'none',
                transition: 'all 0.2s ease',
              }}
            >
              How it Works
            </Link>
          </div>
        </div>
      </section>


      {/* ── FEATURED MENTORS ── */}
      <section style={{ padding: '90px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '48px', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '38px', color: 'var(--ink)', margin: '0 0 10px', fontWeight: 400 }}>
                Featured Experts & Operators
              </h2>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '15px', color: 'var(--ink-3)', margin: 0 }}>
                Hand-picked operators with deep expertise who consistently deliver high-impact sessions.
              </p>
            </div>
            <Link
              href="/mentor-connect/mentors"
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '14px',
                fontWeight: 600,
                color: 'var(--accent)',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
              className="hover-arrow-move"
            >
              View entire directory
              <span className="arrow" style={{ transition: 'transform 0.2s ease' }}>→</span>
            </Link>
          </div>

          {!featuredMentors || featuredMentors.length === 0 ? (
            <div style={{ padding: '80px 40px', textAlign: 'center', background: 'var(--white)', borderRadius: 'var(--radius-lg, 16px)', border: '1px dashed var(--cream-border)' }}>
              <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--ink-4)', fontSize: '15px' }}>No featured mentors available at this time. Browse our complete network directory!</p>
            </div>
          ) : (
            <FeaturedSplitConsole mentors={featuredMentors} />
          )}
        </div>
      </section>

      {/* ── FOR MENTORS CTA ── */}
      <section style={{
        position: 'relative',
        padding: '100px 24px',
        background: 'var(--ink)',
        color: 'var(--white)',
        textAlign: 'center',
        overflow: 'hidden'
      }}>
        {/* Glowing Decorative Background Mesh */}
        <div style={{
          position: 'absolute',
          bottom: '-50%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '700px',
          height: '350px',
          background: 'radial-gradient(circle, rgba(184, 70, 10, 0.15) 0%, transparent 80%)',
          opacity: 0.7,
          pointerEvents: 'none'
        }} />

        <div style={{ maxWidth: '650px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '42px', margin: '0 0 16px', fontWeight: 400, letterSpacing: '-0.01em' }}>
            Are you a builder or industry expert?
          </h2>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '17px', color: 'rgba(255,255,255,0.7)', margin: '0 0 44px', lineHeight: 1.65 }}>
            Join our invite-only community of ecosystem operators. Help India's most promising founders scale while building your personal operator brand.
          </p>
          <Link
            href="/mentor-connect/apply"
            className="btn-mentor-apply"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '16px 36px',
              background: 'var(--white)',
              color: 'var(--ink)',
              borderRadius: 'var(--radius-lg, 12px)',
              fontFamily: 'var(--font-sans)',
              fontSize: '14.5px',
              fontWeight: 600,
              textDecoration: 'none',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}
          >
            Apply to be a Mentor
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Embedded High-Aesthetic Style Block */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .btn-primary-custom:hover {
          background: var(--accent) !important;
          box-shadow: 0 12px 32px rgba(184, 70, 10, 0.25) !important;
          transform: translateY(-2px);
        }
        .btn-secondary-custom:hover {
          background: var(--bg) !important;
          border-color: var(--accent) !important;
          color: var(--accent) !important;
        }
        .btn-mentor-apply:hover {
          opacity: 0.95;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.25) !important;
        }
        .premium-mentor-card:hover {
          border-color: var(--accent) !important;
          box-shadow: 0 16px 36px rgba(184, 70, 10, 0.08);
          transform: translateY(-6px);
        }
        .premium-mentor-card:hover .cta-arrow {
          color: var(--ink) !important;
        }
        .premium-mentor-card:hover .arrow-sym {
          transform: translateX(4px);
        }
        .hover-arrow-move:hover .arrow {
          transform: translateX(4px);
        }
      `}} />
    </main>
  )
}
