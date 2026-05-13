'use client'

import Link from 'next/link'
import { SaveMentorButton } from './SaveMentorButton'

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
    <div style={{
      background: 'var(--white)',
      border: '1px solid var(--cream-border)',
      borderRadius: '16px',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      position: 'relative',
      transition: 'box-shadow 0.2s ease',
    }}>
      <div style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 10 }}>
        <SaveMentorButton mentorId={mentor.id} initialSaved={isSaved} />
      </div>

      <Link href={`/mentor-connect/mentors/${mentor.slug}`} style={{ textDecoration: 'none', color: 'inherit', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
          {mentor.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={mentor.avatar_url} alt="" style={{ width: '72px', height: '72px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
          ) : (
            <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'var(--cream-dark)', flexShrink: 0 }} />
          )}
          <div style={{ paddingRight: '24px' }}>
            <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '18px', fontWeight: 600, color: 'var(--ink)', margin: '0 0 4px' }}>
              {mentor.display_name}
            </h3>
            {mentor.verification_tier !== 'community' && (
              <span style={{ display: 'inline-block', fontSize: '11px', background: '#EDF5EA', color: '#2A6620', padding: '2px 6px', borderRadius: '4px', fontWeight: 500, marginBottom: '8px' }}>
                {mentor.verification_tier === 'verified' ? 'Verified' : 'Credential Verified'}
              </span>
            )}
            {mentor.avg_rating > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: 'var(--ink-3)', fontFamily: 'var(--font-sans)' }}>
                <span style={{ color: '#F59E0B' }}>★</span> {mentor.avg_rating.toFixed(1)}
              </div>
            )}
          </div>
        </div>

        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--ink-3)', lineHeight: 1.5, margin: '0 0 16px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {mentor.headline}
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px', marginTop: 'auto' }}>
          {mentor.expertise_areas.slice(0, 2).map(area => (
            <span key={area} style={{ fontSize: '12px', padding: '4px 8px', background: 'var(--cream)', border: '1px solid var(--cream-border)', borderRadius: '4px', color: 'var(--ink-4)', fontFamily: 'var(--font-sans)' }}>
              {area}
            </span>
          ))}
          {mentor.expertise_areas.length > 2 && (
            <span style={{ fontSize: '12px', padding: '4px 8px', color: 'var(--ink-4)', fontFamily: 'var(--font-sans)' }}>
              +{mentor.expertise_areas.length - 2} more
            </span>
          )}
        </div>

        <div style={{ borderTop: '1px solid var(--cream-border)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: '11px', color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 2px', fontFamily: 'var(--font-sans)' }}>Sessions from</p>
            <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--ink)', margin: 0, fontFamily: 'var(--font-sans)' }}>
              {priceStart ? `₹${priceStart.toLocaleString()}` : 'Free'}
            </p>
          </div>
          <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--accent)', fontFamily: 'var(--font-sans)' }}>
            View Profile →
          </span>
        </div>
      </Link>
    </div>
  )
}
