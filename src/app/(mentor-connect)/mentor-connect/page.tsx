import type { Metadata } from 'next'
import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/server'
import { ArrowRight } from 'lucide-react'
import LandingHero from '@/components/organisms/LandingHero'
import FeaturedCarousel from '@/components/organisms/FeaturedCarousel'

export const metadata: Metadata = {
  title: 'Mentor Connect | GrantsHub India',
  description: 'Book sessions with verified mentors in cross-border expansion, grant navigation, regulatory compliance, and market entry.',
}

// Revalidate this page every hour
export const revalidate = 3600

export default async function MentorConnectHomepage() {
  const supabase = createServiceClient()

  // Fetch featured mentors with required fields
  const { data: featuredMentors } = await supabase
    .from('mentor_profiles')
    .select(`
      id,
      display_name,
      slug,
      headline,
      avatar_url,
      verification_tier,
      avg_rating,
      bio,
      expertise_areas,
      years_experience,
      total_sessions,
      total_reviews,
      location_country,
      session_types ( price_inr )
    `)
    .eq('status', 'active')
    .eq('is_featured', true)
    .limit(4)

  return (
    <main style={{ background: 'var(--bg)', minHeight: 'calc(100vh - 56px)' }}>
      {/* ── HERO SECTION ── */}
      <LandingHero />

      {/* ── BRAND LOGOS BAR ── */}
      <section style={{
        padding: '36px 24px',
        background: 'var(--white)',
        borderBottom: '1px solid var(--cream-border)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '20px'
      }}>
        <span style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '11px',
          color: 'var(--ink-3)',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          textAlign: 'center'
        }}>
          Proven success with 20,000+ top organizations
        </span>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: '40px 60px',
          width: '100%',
          maxWidth: '1100px',
          color: 'var(--ink-2)',
        }} className="brand-logos-container">
          {/* Netflix */}
          <div title="Netflix" style={{ display: 'flex', alignItems: 'center' }}>
            <svg viewBox="0 0 100 100" height="22" fill="currentColor" style={{ opacity: 0.65 }}>
              <path d="M32 12v76c4-1 8-2 12-3V34l24 54c4-1 8-2 12-3V12c-4 1-8 2-12 3v54L44 15c-4 1-8 2-12 3z"/>
            </svg>
          </div>
          
          {/* Figma */}
          <div title="Figma" style={{ display: 'flex', alignItems: 'center' }}>
            <svg viewBox="0 0 100 150" height="24" fill="currentColor" style={{ opacity: 0.65 }}>
              <path d="M25 25c0-13.8 11.2-25 25-25s25 11.2 25 25-11.2 25-25 25H25V25zm0 50c0-13.8 11.2-25 25-25s25 11.2 25 25-11.2 25-25 25H25V75zm25 50c13.8 0 25-11.2 25-25s-11.2-25-25-25-25 11.2-25 25 11.2 25 25 25zm0-100c13.8 0 25 11.2 25 25S63.8 75 50 75h-25V50c0-13.8 11.2-25 25-25zm0 125c0-13.8-11.2-25-25-25V150c13.8 0 25-11.2 25-25z" />
            </svg>
          </div>

          {/* Booking.com */}
          <div title="Booking.com" style={{ display: 'flex', alignItems: 'center', fontFamily: 'var(--font-sans)', fontWeight: 800, fontSize: '18px', color: 'currentColor', opacity: 0.65, letterSpacing: '-0.03em' }}>
            Booking.com
          </div>

          {/* DoorDash */}
          <div title="DoorDash" style={{ display: 'flex', alignItems: 'center' }}>
            <svg viewBox="0 0 120 60" height="18" fill="currentColor" style={{ opacity: 0.65 }}>
              <path d="M110 10H50C25 10 10 25 10 40c0 10 8 15 18 15h32c22 0 35-12 35-25 0-5-4-8-10-8H55c-6 0-10 4-10 8 0 5 4 8 10 8h22c8 0 10 4 8 7-2 4-6 5-13 5H30c-8 0-12-4-12-10 0-10 10-20 28-20h64c8 0 10-4 10-8s-2-7-10-7z"/>
            </svg>
          </div>

          {/* Notion */}
          <div title="Notion" style={{ display: 'flex', alignItems: 'center', gap: '6px', opacity: 0.65 }}>
            <div style={{ width: '20px', height: '20px', border: '2.5px solid currentColor', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '12px', lineHeight: 1 }}>N</div>
            <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '14.5px', letterSpacing: '-0.02em' }}>Notion</span>
          </div>

          {/* Spotify */}
          <div title="Spotify" style={{ display: 'flex', alignItems: 'center' }}>
            <svg viewBox="0 0 100 100" height="22" fill="currentColor" style={{ opacity: 0.65 }}>
              <path d="M50 0C22.4 0 0 22.4 0 50s22.4 50 50 50 50-22.4 50-50S77.6 0 50 0zm22.9 72.1c-1 1.5-3 2-4.5 1-12-7.3-27.1-8.9-44.9-4.9-1.7.4-3.5-.7-3.9-2.4-.4-1.7.7-3.5 2.4-3.9 19.5-4.5 36.1-2.6 49.5 5.6 1.5.9 2 2.9 1 4.6zm6.1-13.6c-1.2 2-3.8 2.6-5.8 1.4-13.7-8.4-34.7-10.9-50.9-6-2.2.7-4.6-.6-5.3-2.8-.7-2.2.6-4.6 2.8-5.3 18.5-5.6 41.7-2.8 57.8 7.1 2 1.2 2.6 3.8 1.4 5.6zm.5-14.2c-16.4-9.8-43.5-10.7-59.2-5.9-2.5.8-5.2-.6-6-3.1-.8-2.5.6-5.2 3.1-6 18.1-5.5 48.1-4.4 67.1 6.9 2.3 1.3 3 4.3 1.6 6.6-1.3 2.3-4.3 3-6.6 1.5z" />
            </svg>
          </div>

          {/* Slack */}
          <div title="Slack" style={{ display: 'flex', alignItems: 'center' }}>
            <svg viewBox="0 0 100 100" height="22" fill="currentColor" style={{ opacity: 0.65 }}>
              <path d="M22 62c0-5.5-4.5-10-10-10S2 56.5 2 62s4.5 10 10 10h10V62zm5 0c0 5.5 4.5 10 10 10s10-4.5 10-10V22c0-5.5-4.5-10-10-10S27 16.5 27 22v40zm11-40c0-5.5-4.5-10-10-10S18 16.5 18 22s4.5 10 10 10h10V22zm0 5c0 5.5 4.5 10 10 10s10-4.5 10-10v40c0 5.5-4.5 10-10 10S38 72.5 38 67V27zM78 38c0 5.5 4.5 10 10 10s10-4.5 10-10-4.5-10-10-10H78v10zm-5 0c0-5.5-4.5-10-10-10s-10 4.5-10 10v40c0 5.5 4.5 10 10 10s10-4.5 10-10V38zm-11 40c0 5.5 4.5 10 10 10s10-4.5 10-10-4.5-10-10-10H62v10zm0-5c0-5.5-4.5-10-10-10s-10 4.5-10 10v40c0 5.5 4.5 10 10 10s10-4.5 10-10V73z" />
            </svg>
          </div>
        </div>
      </section>

      {/* ── FEATURED MENTORS SECTION ── */}
      <section style={{ padding: '90px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {!featuredMentors || featuredMentors.length === 0 ? (
            <div style={{ padding: '80px 40px', textAlign: 'center', background: 'var(--white)', borderRadius: 'var(--radius-lg, 16px)', border: '1px dashed var(--cream-border)' }}>
              <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--ink-4)', fontSize: '15px' }}>No featured mentors available at this time. Browse our complete network directory!</p>
            </div>
          ) : (
            <FeaturedCarousel mentors={featuredMentors as any} />
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
        .btn-mentor-apply:hover {
          opacity: 0.95;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.25) !important;
        }
        @media (max-width: 768px) {
          .brand-logos-container {
            gap: 30px 40px !important;
          }
        }
      `}} />
    </main>
  )
}
