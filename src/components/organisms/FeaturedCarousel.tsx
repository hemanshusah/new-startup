'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { MentorCard } from './MentorCard'

interface Mentor {
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
  priceStart?: number
}

interface FeaturedCarouselProps {
  mentors: Mentor[]
}

export default function FeaturedCarousel({ mentors }: FeaturedCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const offset = direction === 'left' ? -320 : 320
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' })
    }
  }

  if (!mentors || mentors.length === 0) return null

  // Process data to map and clean parameters
  const processedMentors = mentors.map(m => {
    const sessionTypes = (m as any).session_types
    let priceStart = m.priceStart
    if (priceStart === undefined && sessionTypes && Array.isArray(sessionTypes)) {
      const prices = sessionTypes.map((s: any) => s.price_inr).filter((p: number) => p > 0)
      priceStart = prices.length > 0 ? Math.min(...prices) : 0
    }
    return {
      ...m,
      priceStart,
      industries: m.industries || [],
      expertise_areas: m.expertise_areas || []
    }
  })

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {/* Header Row */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: '36px',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div>
          <h2 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(28px, 4vw, 36px)',
            color: 'var(--ink)',
            margin: '0 0 8px',
            fontWeight: 400,
            letterSpacing: '-0.015em',
            lineHeight: 1.15
          }}>
            Discover the world's top mentors
          </h2>
          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '14.5px',
            color: 'var(--ink-3)',
            margin: 0
          }}>
            Connect 1:1 with vetted operators, scaling leaders, and industry specialists.
          </p>
        </div>

        {/* Action Row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link
            href="/mentor-connect/mentors"
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '13.5px',
              fontWeight: 600,
              color: 'var(--accent)',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 20px',
              borderRadius: '8px',
              border: '1px solid var(--cream-border)',
              background: 'var(--white)',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 6px rgba(0,0,0,0.01)'
            }}
            className="carousel-explore-btn"
          >
            Explore all
            <span style={{ transition: 'transform 0.2s ease' }} className="arrow-sym">→</span>
          </Link>

          {/* Navigation Arrows */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => scroll('left')}
              aria-label="Scroll left"
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                border: '1px solid var(--cream-border)',
                background: 'var(--white)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--ink)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 6px rgba(0,0,0,0.01)'
              }}
              className="carousel-nav-btn"
            >
              <ArrowLeft size={16} />
            </button>
            <button
              onClick={() => scroll('right')}
              aria-label="Scroll right"
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                border: '1px solid var(--cream-border)',
                background: 'var(--white)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--ink)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 6px rgba(0,0,0,0.01)'
              }}
              className="carousel-nav-btn"
            >
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Carousel Track Container */}
      <div 
        ref={scrollRef}
        className="carousel-track"
        style={{
          display: 'flex',
          gap: '24px',
          overflowX: 'auto',
          scrollBehavior: 'smooth',
          paddingBottom: '24px',
          margin: '0 -12px',
          paddingLeft: '12px',
          paddingRight: '12px',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {processedMentors.map((mentor) => (
          <div 
            key={mentor.id} 
            style={{
              minWidth: '290px',
              width: '320px',
              flexShrink: 0,
            }}
          >
            <MentorCard mentor={mentor} priceStart={mentor.priceStart} />
          </div>
        ))}
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          .carousel-track::-webkit-scrollbar {
            display: none;
          }
          .carousel-track {
            scrollbar-width: none;
            -ms-overflow-style: none;
          }
          .carousel-explore-btn:hover {
            border-color: var(--accent) !important;
            color: var(--accent) !important;
            background: var(--bg) !important;
          }
          .carousel-explore-btn:hover .arrow-sym {
            transform: translateX(3px);
          }
          .carousel-nav-btn:hover {
            background: var(--bg) !important;
            border-color: var(--ink) !important;
            color: var(--accent) !important;
          }
        `
      }} />
    </div>
  )
}
