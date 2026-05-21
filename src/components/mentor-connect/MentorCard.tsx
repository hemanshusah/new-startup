'use client'

import Link from 'next/link'
import { SaveMentorButton } from './SaveMentorButton'
import { Star, ShieldCheck, ArrowRight } from 'lucide-react'

interface MentorCardProps {
  mentor: {
    id: string
    slug: string
    display_name: string
    headline: string
    avatar_url: string | null
    verification_tier: string
    avg_rating: number
    expertise_areas: string[]
    industries: string[]
  }
  isSaved?: boolean
  priceStart?: number
}

export function MentorCard({ mentor, isSaved = false, priceStart }: MentorCardProps) {
  return (
    <div className="premium-directory-card" style={{
      background: 'var(--white)',
      border: '1px solid var(--cream-border)',
      borderRadius: 'var(--radius-lg, 16px)',
      padding: '28px',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      position: 'relative',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    }}>
      {/* Floating Save Trigger */}
      <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 10 }}>
        <SaveMentorButton mentorId={mentor.id} initialSaved={isSaved} />
      </div>

      <Link href={`/mentor-connect/mentors/${mentor.slug}`} style={{ textDecoration: 'none', color: 'inherit', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Top Profile Header */}
        <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
          {mentor.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={mentor.avatar_url} alt="" style={{ width: '70px', height: '70px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '2px solid var(--cream-border)' }} />
          ) : (
            <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: '20px', fontWeight: 600, color: 'var(--ink-3)' }}>{mentor.display_name.charAt(0)}</span>
            </div>
          )}
          <div style={{ paddingRight: '28px' }}>
            <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '17px', fontWeight: 600, color: 'var(--ink)', margin: '0 0 6px', lineHeight: 1.25 }}>
              {mentor.display_name}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-start' }}>
              {mentor.verification_tier !== 'community' && (
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '10.5px',
                  background: '#EDF5EA',
                  color: '#2A6620',
                  padding: '3px 8px',
                  borderRadius: '100px',
                  fontWeight: 600
                }}>
                  <ShieldCheck size={11} />
                  {mentor.verification_tier === 'verified' ? 'Verified' : 'Credential Pro'}
                </span>
              )}
              {mentor.avg_rating > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12.5px', color: 'var(--ink-2)', fontFamily: 'var(--font-sans)', fontWeight: 500 }}>
                  <Star size={13} fill="var(--accent)" color="var(--accent)" />
                  <span>{mentor.avg_rating.toFixed(1)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bio / Headline */}
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '13.5px',
          color: 'var(--ink-2)',
          lineHeight: 1.6,
          margin: '0 0 20px',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {mentor.headline}
        </p>

        {/* Expertise Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px', marginTop: 'auto' }}>
          {mentor.expertise_areas.slice(0, 2).map(area => (
            <span key={area} style={{
              fontSize: '12px',
              fontWeight: 500,
              padding: '4px 10px',
              background: 'var(--bg)',
              border: '1px solid var(--cream-border)',
              borderRadius: '100px',
              color: 'var(--ink-3)',
              fontFamily: 'var(--font-sans)'
            }}>
              {area}
            </span>
          ))}
          {mentor.expertise_areas.length > 2 && (
            <span style={{ fontSize: '11.5px', fontWeight: 600, padding: '4px 6px', color: 'var(--ink-4)', fontFamily: 'var(--font-sans)', alignSelf: 'center' }}>
              +{mentor.expertise_areas.length - 2} more
            </span>
          )}
        </div>

        {/* Bottom Booking Block */}
        <div style={{
          borderTop: '1px solid var(--cream-border)',
          paddingTop: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <p style={{ fontSize: '10px', fontWeight: 600, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 4px', fontFamily: 'var(--font-sans)' }}>Consultation</p>
            <p style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ink)', margin: 0, fontFamily: 'var(--font-sans)' }}>
              {priceStart ? `₹${priceStart.toLocaleString()}` : 'Free'}
            </p>
          </div>
          <span className="cta-link-text" style={{
            fontSize: '13.5px',
            fontWeight: 600,
            color: 'var(--accent)',
            fontFamily: 'var(--font-sans)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            transition: 'all 0.2s ease'
          }}>
            Book Slot
            <ArrowRight size={14} className="cta-arrow-icon" style={{ transition: 'transform 0.2s ease' }} />
          </span>
        </div>
      </Link>

      <style dangerouslySetInnerHTML={{
        __html: `
        .premium-directory-card:hover {
          border-color: var(--accent) !important;
          box-shadow: 0 16px 36px rgba(184, 70, 10, 0.08);
          transform: translateY(-4px);
        }
        .premium-directory-card:hover .cta-link-text {
          color: var(--ink) !important;
        }
        .premium-directory-card:hover .cta-arrow-icon {
          transform: translateX(3px);
        }
      `}} />
    </div>
  )
}
