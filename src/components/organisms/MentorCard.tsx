'use client'

import Link from 'next/link'
import { SaveMentorButton } from '@/components/atoms/SaveMentorButton'
import { Badge } from '@/components/atoms/Badge'
import { Avatar } from '@/components/atoms/Avatar'
import { Star, ArrowRight } from 'lucide-react'

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
    years_experience?: number
    total_sessions?: number
    total_reviews?: number
    location_country?: string
    is_available?: boolean
  }
  isSaved?: boolean
  priceStart?: number
  onInspect?: () => void
}

function getCountryFlag(country?: string | null): string {
  if (!country) return ''
  const c = country.trim().toLowerCase()
  if (c === 'india' || c === 'in') return '🇮🇳'
  if (c === 'united states' || c === 'us' || c === 'usa' || c === 'united states of america') return '🇺🇸'
  if (c === 'united kingdom' || c === 'uk' || c === 'gb' || c === 'england') return '🇬🇧'
  if (c === 'canada' || c === 'ca') return '🇨🇦'
  if (c === 'australia' || c === 'au') return '🇦🇺'
  if (c === 'singapore' || c === 'sg') return '🇸🇬'
  if (c === 'germany' || c === 'de') return '🇩🇪'
  if (c === 'france' || c === 'fr') return '🇫🇷'
  if (c === 'netherlands' || c === 'nl') return '🇳🇱'
  if (c === 'united arab emirates' || c === 'uae' || c === 'ae') return '🇦🇪'
  
  if (c.length === 2) {
    const codePoints = c
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0))
    try {
      return String.fromCodePoint(...codePoints)
    } catch {
      return ''
    }
  }
  return ''
}

export function MentorCard({ mentor, isSaved = false, priceStart, onInspect }: MentorCardProps) {
  const countryFlag = getCountryFlag(mentor.location_country)

  return (
    <div className="premium-directory-card" style={{
      background: 'var(--white)',
      border: '1px solid var(--cream-border)',
      borderRadius: 'var(--radius-lg, 16px)',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      position: 'relative',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    }}>
      {/* Floating Save & Inspect Triggers */}
      <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 10, display: 'flex', gap: '8px', alignItems: 'center' }}>
        {onInspect && (
          <button 
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onInspect()
            }}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid var(--cream-border)',
              background: 'var(--white)',
              fontFamily: 'var(--font-sans)',
              fontSize: '11px',
              fontWeight: 600,
              color: 'var(--ink-2)',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            className="card-inspect-btn"
          >
            Inspect ↗
          </button>
        )}
        <SaveMentorButton mentorId={mentor.id} initialSaved={isSaved} />
      </div>

      <Link href={`/mentor-connect/mentors/${mentor.slug}`} style={{ textDecoration: 'none', color: 'inherit', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Top: Large Vertical Photo of the Mentor */}
        <div style={{ position: 'relative', width: '100%', height: '220px', marginBottom: '18px', flexShrink: 0 }}>
          <Avatar 
            src={mentor.avatar_url} 
            alt={mentor.display_name} 
            size="100%" 
            style={{ 
              borderRadius: '12px' 
            }} 
          />

          {/* Overlay Badges */}
          <div style={{ 
            position: 'absolute', 
            top: '12px', 
            left: '12px', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '6px', 
            zIndex: 10 
          }}>
            {(mentor.verification_tier === 'credential_verified' || mentor.verification_tier === 'advance') && (
              <Badge variant="advance" />
            )}
            {mentor.verification_tier === 'verified' && (
              <Badge variant="verified" />
            )}
            {mentor.avg_rating >= 4.8 && (
              <Badge variant="top-rated" />
            )}
            {mentor.is_available !== false && (
              <Badge variant="available" />
            )}
          </div>
        </div>

        {/* Middle: Profile Details */}
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          {/* Name and Flag */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
            <h3 style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '17px',
              fontWeight: 700,
              color: 'var(--ink)',
              margin: 0,
              lineHeight: 1.2
            }}>
              {mentor.display_name}
            </h3>
            {countryFlag && (
              <span style={{ fontSize: '18px', display: 'inline-block', lineHeight: 1 }} title={mentor.location_country}>
                {countryFlag}
              </span>
            )}
          </div>

          {/* Headline */}
          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '13.5px',
            color: 'var(--ink-2)',
            lineHeight: 1.4,
            margin: '0 0 10px',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            minHeight: '38px'
          }}>
            {mentor.headline}
          </p>

          {/* Rating details */}
          {mentor.avg_rating > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12.5px', color: 'var(--ink-2)', fontFamily: 'var(--font-sans)', fontWeight: 500, marginBottom: '16px' }}>
              <Star size={13} fill="var(--accent)" color="var(--accent)" />
              <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{mentor.avg_rating.toFixed(1)}</span>
              {mentor.total_reviews !== undefined && mentor.total_reviews > 0 && (
                <span style={{ color: 'var(--ink-4)', marginLeft: '2px' }}>({mentor.total_reviews} {mentor.total_reviews === 1 ? 'review' : 'reviews'})</span>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12.5px', color: 'var(--ink-4)', fontFamily: 'var(--font-sans)', fontWeight: 500, marginBottom: '16px' }}>
              <Star size={13} fill="#E4E4E7" color="#E4E4E7" />
              <span>No reviews yet</span>
            </div>
          )}

          {/* Bottom stats and button */}
          <div style={{ marginTop: 'auto' }}>
            {/* Statistics Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              background: 'var(--bg, #FAF8F5)',
              borderRadius: '8px',
              padding: '10px 12px',
              marginBottom: '16px',
              border: '1px solid var(--cream-border)'
            }}>
              <div>
                <span style={{ fontSize: '9px', color: 'var(--ink-4)', textTransform: 'uppercase', display: 'block', fontWeight: 600, letterSpacing: '0.04em', marginBottom: '2px' }}>Experience</span>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink)' }}>
                  {mentor.years_experience ? `${mentor.years_experience} Years` : '5+ Years'}
                </span>
              </div>
              <div>
                <span style={{ fontSize: '9px', color: 'var(--ink-4)', textTransform: 'uppercase', display: 'block', fontWeight: 600, letterSpacing: '0.04em', marginBottom: '2px' }}>Avg. Attendance</span>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink)' }}>
                  {mentor.total_sessions && mentor.total_sessions > 0 ? `${mentor.total_sessions}+ Sessions` : '98%'}
                </span>
              </div>
            </div>

            {/* Booking action block */}
            <div style={{
              borderTop: '1px solid var(--cream-border)',
              paddingTop: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 2px', display: 'block', fontFamily: 'var(--font-sans)' }}>Consultation</span>
                <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ink)', fontFamily: 'var(--font-sans)', display: 'block' }}>
                  {priceStart ? `₹${priceStart.toLocaleString()}` : 'Free'}
                </span>
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
          </div>
        </div>
      </Link>

      <style dangerouslySetInnerHTML={{
        __html: `
        .premium-directory-card {
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
          will-change: transform, box-shadow;
        }
        .premium-directory-card:hover {
          border-color: var(--accent) !important;
          box-shadow: 0 16px 36px rgba(184, 70, 10, 0.08) !important;
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
