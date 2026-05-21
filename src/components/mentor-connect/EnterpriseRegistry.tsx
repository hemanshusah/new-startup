'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ShieldCheck, Star, X, MapPin, Briefcase, Video, ArrowRight, ArrowUpRight, Search, SlidersHorizontal } from 'lucide-react'

const LinkedinIcon = ({ size = 14 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
    <rect x="2" y="9" width="4" height="12"></rect>
    <circle cx="4" cy="4" r="2"></circle>
  </svg>
)

const TwitterIcon = ({ size = 14 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
  </svg>
)

interface Mentor {
  id: string
  display_name: string
  slug: string
  headline: string
  avatar_url: string | null
  verification_tier: string
  avg_rating: number
  expertise_areas: string[]
  industries: string[]
  priceStart: number
  linkedin_url?: string
  twitter_url?: string | null
  intro_video_url?: string | null
}

interface EnterpriseRegistryProps {
  mentors: Mentor[]
  savedMentorIds: string[]
  defaultSearchQuery?: string
  defaultIndustry?: string
  defaultExpertise?: string
}

export default function EnterpriseRegistry({
  mentors,
  savedMentorIds,
  defaultSearchQuery = '',
  defaultIndustry = '',
  defaultExpertise = ''
}: EnterpriseRegistryProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState(defaultSearchQuery)
  const [selectedIndustry, setSelectedIndustry] = useState(defaultIndustry)
  const [selectedExpertise, setSelectedExpertise] = useState(defaultExpertise)
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null)

  // Extract all unique industries and expertises for filter dropdowns dynamically
  const uniqueIndustries = Array.from(
    new Set(mentors.flatMap((m) => m.industries || []))
  ).sort()

  const uniqueExpertises = Array.from(
    new Set(mentors.flatMap((m) => m.expertise_areas || []))
  ).sort()

  // Dynamic filter logic
  const filteredMentors = mentors.filter((mentor) => {
    const matchesSearch =
      !searchQuery ||
      mentor.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mentor.headline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mentor.expertise_areas.some((area) =>
        area.toLowerCase().includes(searchQuery.toLowerCase())
      )

    const matchesIndustry =
      !selectedIndustry || mentor.industries.includes(selectedIndustry)

    const matchesExpertise =
      !selectedExpertise || mentor.expertise_areas.includes(selectedExpertise)

    return matchesSearch && matchesIndustry && matchesExpertise
  })

  const hasActiveFilters = searchQuery || selectedIndustry || selectedExpertise

  const resetFilters = () => {
    setSearchQuery('')
    setSelectedIndustry('')
    setSelectedExpertise('')
  }

  return (
    <div style={{ position: 'relative' }}>
      
      {/* ── COHESIVE HORIZONTAL FILTER TOOLBAR ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        background: 'var(--white)',
        border: '1px solid var(--cream-border)',
        borderRadius: '16px',
        padding: '16px 24px',
        marginBottom: '24px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.005)'
      }}>
        
        {/* Left Side: Inline Search and Select Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: '280px', flexWrap: 'wrap' }}>
          
          {/* Elegant Search Input */}
          <div style={{ position: 'relative', flex: '1', minWidth: '220px', maxWidth: '320px' }}>
            <Search size={15} color="var(--ink-4)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="Search operators, skills..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px 10px 38px',
                borderRadius: '10px',
                border: '1px solid var(--cream-border)',
                background: 'var(--bg)',
                fontFamily: 'var(--font-sans)',
                fontSize: '13px',
                color: 'var(--ink)',
                outline: 'none',
                transition: 'all 0.15s ease'
              }}
              className="toolbar-search-input"
            />
          </div>

          {/* Industry Filter Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.04em', fontFamily: 'var(--font-sans)' }}>Industry:</span>
            <select
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              style={{
                padding: '8px 14px',
                borderRadius: '10px',
                border: '1px solid var(--cream-border)',
                background: 'var(--white)',
                fontFamily: 'var(--font-sans)',
                fontSize: '12.5px',
                fontWeight: 500,
                color: 'var(--ink-2)',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="">All Industries</option>
              {uniqueIndustries.map((ind) => (
                <option key={ind} value={ind}>{ind}</option>
              ))}
            </select>
          </div>

          {/* Expertise Filter Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.04em', fontFamily: 'var(--font-sans)' }}>Expertise:</span>
            <select
              value={selectedExpertise}
              onChange={(e) => setSelectedExpertise(e.target.value)}
              style={{
                padding: '8px 14px',
                borderRadius: '10px',
                border: '1px solid var(--cream-border)',
                background: 'var(--white)',
                fontFamily: 'var(--font-sans)',
                fontSize: '12.5px',
                fontWeight: 500,
                color: 'var(--ink-2)',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="">All Expertises</option>
              {uniqueExpertises.map((exp) => (
                <option key={exp} value={exp}>{exp}</option>
              ))}
            </select>
          </div>

        </div>

        {/* Right Side: Active count and Reset */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--ink-3)', margin: 0 }}>
            Showing <strong style={{ color: 'var(--accent)', fontWeight: 600 }}>{filteredMentors.length}</strong> operator{filteredMentors.length !== 1 && 's'}
          </p>
          {hasActiveFilters && (
            <button 
              onClick={resetFilters}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--accent)',
                fontFamily: 'var(--font-sans)',
                fontSize: '12.5px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: 0
              }}
            >
              Reset Filters
            </button>
          )}
        </div>

      </div>

      {/* ── HIGH DENSITY REGISTRY TABLE ── */}
      {filteredMentors.length === 0 ? (
        <div style={{
          background: 'var(--white)',
          border: '1px dashed var(--cream-border)',
          borderRadius: 'var(--radius-lg, 16px)',
          padding: '90px 24px',
          textAlign: 'center',
          boxShadow: '0 4px 20px rgba(0,0,0,0.005)'
        }}>
          <div style={{ fontSize: '32px', marginBottom: '16px' }}>🔍</div>
          <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', color: 'var(--ink)', margin: '0 0 8px', fontWeight: 400 }}>No Operators Found</h4>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14.5px', color: 'var(--ink-3)', margin: '0 0 20px', maxWidth: '380px', marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.5 }}>
            We couldn't find any verified mentors matching your search query or filters. Try resetting the criteria!
          </p>
          <button 
            onClick={resetFilters} 
            style={{
              display: 'inline-block',
              padding: '10px 20px',
              background: 'var(--ink)',
              color: 'var(--white)',
              borderRadius: '8px',
              border: 'none',
              fontFamily: 'var(--font-sans)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div style={{
          background: 'var(--white)',
          border: '1px solid var(--cream-border)',
          borderRadius: 'var(--radius-lg, 16px)',
          overflow: 'hidden',
          boxShadow: '0 4px 24px rgba(184, 70, 10, 0.01)'
        }} className="registry-table-container">
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{
                background: '#FAF8F5',
                borderBottom: '1px solid var(--cream-border)',
                fontFamily: 'var(--font-sans)',
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--ink-4)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em'
              }}>
                <th style={{ padding: '18px 24px' }}>Operator</th>
                <th style={{ padding: '18px 24px' }} className="hide-mobile">Headline</th>
                <th style={{ padding: '18px 24px' }} className="hide-tablet">Core Expertise</th>
                <th style={{ padding: '18px 24px', textAlign: 'right' }}>Session starting rate</th>
                <th style={{ padding: '18px 24px', textAlign: 'right' }}>Review Rating</th>
                <th style={{ padding: '18px 24px', textAlign: 'right' }}>Preview</th>
              </tr>
            </thead>
            <tbody>
              {filteredMentors.map((mentor) => (
                <tr 
                  key={mentor.id}
                  onClick={() => router.push(`/mentor-connect/mentors/${mentor.slug}`)}
                  style={{
                    borderBottom: '1px solid var(--cream-border)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  className="registry-row"
                >
                  {/* Operator Identity */}
                  <td style={{ padding: '20px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      {mentor.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={mentor.avatar_url} alt="" style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--cream-border)' }} />
                      ) : (
                        <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 600, color: 'var(--ink-3)' }}>
                          {mentor.display_name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <h4 style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 600, color: 'var(--ink)', margin: '0 0 3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          {mentor.display_name}
                          {mentor.verification_tier !== 'community' && (
                            <ShieldCheck size={14} color="var(--accent)" />
                          )}
                        </h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '10.5px', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--ink-4)', fontWeight: 600 }}>{mentor.verification_tier}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }} onClick={(e) => e.stopPropagation()}>
                            {mentor.linkedin_url && (
                              <a href={mentor.linkedin_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--ink-4)', display: 'inline-flex', transition: 'color 0.15s ease' }} className="table-social-icon" title="LinkedIn Profile">
                                <LinkedinIcon size={11.5} />
                              </a>
                            )}
                            {mentor.twitter_url && (
                              <a href={mentor.twitter_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--ink-4)', display: 'inline-flex', transition: 'color 0.15s ease' }} className="table-social-icon" title="Twitter / X Profile">
                                <TwitterIcon size={11.5} />
                              </a>
                            )}
                            {mentor.intro_video_url && (
                              <a href={mentor.intro_video_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--ink-4)', display: 'inline-flex', transition: 'color 0.15s ease' }} className="table-social-icon" title="Intro / YouTube Video">
                                <Video size={11.5} />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>
 
                  {/* Headline */}
                  <td style={{ padding: '20px 24px' }} className="hide-mobile">
                    <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13.5px', color: 'var(--ink-3)', margin: 0, maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {mentor.headline}
                    </p>
                  </td>
 
                  {/* Expertises tags */}
                  <td style={{ padding: '20px 24px' }} className="hide-tablet">
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {mentor.expertise_areas.slice(0, 2).map(area => (
                        <span key={area} style={{
                          fontFamily: 'var(--font-sans)',
                          fontSize: '11px',
                          fontWeight: 500,
                          background: 'var(--bg)',
                          border: '1px solid var(--cream-border)',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          color: 'var(--ink-2)'
                        }}>{area}</span>
                      ))}
                    </div>
                  </td>
 
                  {/* Price starting */}
                  <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                    <span style={{ fontFamily: 'var(--font-sans)', fontSize: '13.5px', fontWeight: 600, color: 'var(--ink)' }}>
                      {mentor.priceStart > 0 ? `₹${mentor.priceStart.toLocaleString()}` : 'Free Slot'}
                    </span>
                  </td>
 
                  {/* Rating */}
                  <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#FFF9EA', border: '1px solid rgba(245, 158, 11, 0.1)', padding: '4px 10px', borderRadius: '100px' }}>
                      <Star size={11} fill="#F59E0B" color="#F59E0B" />
                      <span style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--ink)' }}>{mentor.avg_rating || '5.0'}</span>
                    </div>
                  </td>
 
                  {/* Preview Trigger Action */}
                  <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedMentor(mentor)
                      }}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '8px',
                        border: '1px solid var(--cream-border)',
                        background: 'var(--white)',
                        fontFamily: 'var(--font-sans)',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: 'var(--ink-2)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }} 
                      className="preview-action-btn"
                    >
                      Inspect ↗
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── SLIDE OUT DRAWER PREVIEW SHEET ── */}
      {selectedMentor && (
        <div style={{
          position: 'fixed',
          top: '56px',
          right: 0,
          bottom: 0,
          height: 'calc(100vh - 56px)',
          width: '100%',
          maxWidth: '560px',
          background: 'var(--white)',
          boxShadow: '-8px 0 40px rgba(0,0,0,0.06)',
          zIndex: 49,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          transform: 'translateX(0)',
          animation: 'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          borderLeft: '1px solid var(--cream-border)'
        }} className="preview-drawer-sheet">
          
          <div style={{ overflowY: 'auto', padding: '40px 32px' }}>
            
            {/* Close trigger button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
              <button 
                onClick={() => setSelectedMentor(null)}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'var(--bg)',
                  border: '1px solid var(--cream-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'var(--ink-3)',
                  outline: 'none'
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Profile contents */}
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '28px' }}>
              {selectedMentor.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={selectedMentor.avatar_url} alt="" style={{ width: '70px', height: '70px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--cream-border)' }} />
              ) : (
                <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 600, color: 'var(--ink-3)' }}>
                  {selectedMentor.display_name.charAt(0)}
                </div>
              )}
              <div>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '26px', color: 'var(--ink)', margin: '0 0 4px', fontWeight: 400 }}>
                  {selectedMentor.display_name}
                </h3>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--ink-3)', margin: '0 0 10px' }}>
                  {selectedMentor.headline}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '10px' }}>
                  {selectedMentor.linkedin_url && (
                    <a href={selectedMentor.linkedin_url} target="_blank" rel="noopener noreferrer" style={{ color: '#0A66C2', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', textDecoration: 'none', fontWeight: 600 }} className="drawer-social-link">
                      <LinkedinIcon size={14} />
                      LinkedIn
                    </a>
                  )}
                  {selectedMentor.twitter_url && (
                    <a href={selectedMentor.twitter_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--ink)', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', textDecoration: 'none', fontWeight: 600 }} className="drawer-social-link">
                      <TwitterIcon size={14} />
                      Twitter / X
                    </a>
                  )}
                  {selectedMentor.intro_video_url && (
                    <a href={selectedMentor.intro_video_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', textDecoration: 'none', fontWeight: 600 }} className="drawer-social-link">
                      <Video size={14} />
                      Intro Video
                    </a>
                  )}
                </div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--cream-border)', paddingTop: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              <div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '8px', fontFamily: 'var(--font-sans)' }}>Verification Status</span>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 12px',
                  background: '#EDF5EA',
                  color: '#2A6620',
                  borderRadius: '100px',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  border: '1px solid rgba(42, 102, 32, 0.1)'
                }}>
                  <ShieldCheck size={13} />
                  Vetted ecosystem {selectedMentor.verification_tier}
                </span>
              </div>

              <div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '8px', fontFamily: 'var(--font-sans)' }}>Expertise Scope</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {selectedMentor.expertise_areas.map(area => (
                    <span key={area} style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '12px',
                      background: 'var(--bg)',
                      border: '1px solid var(--cream-border)',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      color: 'var(--ink-2)'
                    }}>{area}</span>
                  ))}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '8px', fontFamily: 'var(--font-sans)' }}>Industries & Covered Markets</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {selectedMentor.industries.map(ind => (
                    <span key={ind} style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '12px',
                      background: '#F0F9FF',
                      border: '1px solid rgba(3, 105, 161, 0.1)',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      color: '#0369A1'
                    }}>{ind}</span>
                  ))}
                </div>
              </div>

              <div style={{ background: '#FAF8F5', border: '1px solid var(--cream-border)', borderRadius: '12px', padding: '20px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '8px', fontFamily: 'var(--font-sans)' }}>Booking Info</span>
                <p style={{ margin: '0 0 16px', fontSize: '13.5px', color: 'var(--ink-2)', lineHeight: 1.5 }}>
                  This operator is currently active and accepting 1:1 strategy slot requests. Choose this profile to configure session calendar times directly.
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13.5px', color: 'var(--ink-3)' }}>Starting at:</span>
                  <strong style={{ fontSize: '16px', color: 'var(--ink)' }}>{selectedMentor.priceStart > 0 ? `₹${selectedMentor.priceStart.toLocaleString()} / session` : 'Free Slot'}</strong>
                </div>
              </div>

            </div>

          </div>

          {/* Persistent direct CTA footer */}
          <div style={{
            padding: '24px 32px',
            borderTop: '1px solid var(--cream-border)',
            background: '#FAF8F5',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px'
          }}>
            <button 
              onClick={() => setSelectedMentor(null)}
              style={{
                padding: '12px 24px',
                borderRadius: '8px',
                border: '1px solid var(--cream-border)',
                background: 'var(--white)',
                fontFamily: 'var(--font-sans)',
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--ink-3)',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <Link
              href={`/mentor-connect/mentors/${selectedMentor.slug}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 28px',
                background: 'var(--ink)',
                color: 'var(--white)',
                borderRadius: '8px',
                fontFamily: 'var(--font-sans)',
                fontSize: '13px',
                fontWeight: 600,
                textDecoration: 'none'
              }}
            >
              Configure Call Times
              <ArrowUpRight size={14} />
            </Link>
          </div>

        </div>
      )}

      {/* Ambient backdrop blur overlay when drawer sheet is active */}
      {selectedMentor && (
        <div 
          onClick={() => setSelectedMentor(null)}
          style={{
            position: 'fixed',
            top: '56px',
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(28, 26, 22, 0.15)',
            backdropFilter: 'blur(4px)',
            zIndex: 48
          }} 
        />
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .registry-row:hover {
          background: #FAF8F5 !important;
        }
        .registry-row:hover .preview-action-btn {
          border-color: var(--accent) !important;
          color: var(--accent) !important;
          background: var(--white) !important;
        }
        .toolbar-search-input:focus {
          border-color: var(--accent) !important;
          background: var(--white) !important;
          box-shadow: 0 4px 12px rgba(184, 70, 10, 0.04) !important;
        }
        @media (max-width: 768px) {
          .hide-mobile { display: none !important; }
        }
        @media (max-width: 960px) {
          .hide-tablet { display: none !important; }
        }
      `}} />
    </div>
  )
}
