'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  ShieldCheck, 
  X, 
  Video, 
  ArrowUpRight, 
  SlidersHorizontal,
  Globe,
  CreditCard,
  Cloud,
  Cpu,
  Compass,
  Scale,
  Plane,
  Award,
  FileText
} from 'lucide-react'
import { MentorCard } from './MentorCard'
import { SearchBar } from '@/components/molecules/SearchBar'
import { CategoryPill } from '@/components/molecules/CategoryPill'
import { Avatar } from '@/components/atoms/Avatar'

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

const categories = [
  { id: 'all', label: 'All', icon: Globe, industry: '', expertise: '' },
  { id: 'fintech', label: 'Fintech', icon: CreditCard, industry: 'Fintech', expertise: '' },
  { id: 'saas', label: 'SaaS', icon: Cloud, industry: 'SaaS', expertise: '' },
  { id: 'deeptech', label: 'Deeptech', icon: Cpu, industry: 'Deeptech', expertise: '' },
  { id: 'market-entry', label: 'Market Entry', icon: Compass, industry: '', expertise: 'Market Entry' },
  { id: 'regulatory-compliance', label: 'Regulatory Compliance', icon: Scale, industry: '', expertise: 'Regulatory Compliance' },
  { id: 'us-expansion', label: 'US Expansion', icon: Plane, industry: '', expertise: 'US Expansion' },
  { id: 'grant-navigation', label: 'Grant Navigation', icon: Award, industry: '', expertise: 'Grant Navigation' },
  { id: 'pitch-deck-review', label: 'Pitch Deck Review', icon: FileText, industry: '', expertise: 'Pitch Deck Review' },
]

export default function EnterpriseRegistry({
  mentors,
  savedMentorIds,
  defaultSearchQuery = '',
  defaultIndustry = '',
  defaultExpertise = ''
}: EnterpriseRegistryProps) {
  const [searchQuery, setSearchQuery] = useState(defaultSearchQuery)
  const [selectedIndustry, setSelectedIndustry] = useState(defaultIndustry)
  const [selectedExpertise, setSelectedExpertise] = useState(defaultExpertise)
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null)
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)
  const [advancedSessions, setAdvancedSessions] = useState(false)

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

  const isCategoryActive = (cat: typeof categories[0]) => {
    if (cat.id === 'all') {
      return !selectedIndustry && !selectedExpertise
    }
    if (cat.industry) {
      return selectedIndustry === cat.industry
    }
    if (cat.expertise) {
      return selectedExpertise === cat.expertise
    }
    return false
  }

  const handleCategoryClick = (cat: typeof categories[0]) => {
    if (cat.id === 'all') {
      setSelectedIndustry('')
      setSelectedExpertise('')
    } else if (cat.industry) {
      setSelectedIndustry(cat.industry)
      setSelectedExpertise('')
    } else if (cat.expertise) {
      setSelectedIndustry('')
      setSelectedExpertise(cat.expertise)
    }
  }

  return (
    <div style={{ position: 'relative' }}>
      
      {/* ── SUB-NAVIGATION TABS ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        borderBottom: '1px solid var(--cream-border)',
        paddingBottom: '16px',
        marginBottom: '28px'
      }}>
        <Link 
          href="/mentor-connect/mentors" 
          style={{
            padding: '8px 18px',
            borderRadius: '20px',
            fontSize: '13.5px',
            fontWeight: 600,
            textDecoration: 'none',
            background: 'var(--ink)',
            color: 'var(--white)',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 8px rgba(28, 26, 22, 0.08)'
          }}
        >
          Mentors
        </Link>
        <Link 
          href="/mentor-connect/group-sessions" 
          style={{
            padding: '8px 18px',
            borderRadius: '20px',
            fontSize: '13.5px',
            fontWeight: 500,
            textDecoration: 'none',
            background: 'transparent',
            color: 'var(--ink-3)',
            transition: 'all 0.2s ease'
          }}
          className="subnav-link"
        >
          Group sessions
        </Link>
      </div>

      {/* ── SEARCH & TOOLBAR ── */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap'
        }}>
          {/* Redesigned Search Input Container */}
          <SearchBar 
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by name, company, role"
            onAiSearchClick={() => alert('AI Search activated! Customizing results based on your profile.')}
          />

          {/* Controls: Mock Toggle & Filters Button */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flexWrap: 'wrap'
          }}>
            {/* Mock Toggle */}
            <div 
              onClick={() => setAdvancedSessions(!advancedSessions)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                userSelect: 'none',
                background: 'var(--white)',
                border: '1px solid var(--cream-border)',
                padding: '8px 16px',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
                transition: 'all 0.2s ease'
              }}
              className="mock-toggle-container"
            >
              <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--ink-2)' }}>
                Commit to long term
              </span>
              <div style={{
                width: '34px',
                height: '18px',
                borderRadius: '9px',
                background: advancedSessions ? 'var(--accent)' : 'var(--cream-border)',
                position: 'relative',
                transition: 'background 0.2s ease'
              }}>
                <div style={{
                  width: '14px',
                  height: '14px',
                  borderRadius: '50%',
                  background: 'white',
                  position: 'absolute',
                  top: '2px',
                  left: advancedSessions ? '18px' : '2px',
                  transition: 'left 0.2s ease',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }} />
              </div>
            </div>

            {/* Filters Button */}
            <button 
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: showFilterDropdown ? 'var(--bg)' : 'var(--white)',
                border: `1px solid ${showFilterDropdown ? 'var(--accent)' : 'var(--cream-border)'}`,
                padding: '10px 16px',
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: 600,
                color: showFilterDropdown ? 'var(--accent)' : 'var(--ink-2)',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
                transition: 'all 0.2s ease'
              }}
              className="filters-toggle-btn"
            >
              <SlidersHorizontal size={14} />
              Filters
            </button>
          </div>
        </div>

        {/* Dynamic / Collapsible Dropdown Filters panel */}
        {showFilterDropdown && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            background: '#FAF8F5',
            border: '1px solid var(--cream-border)',
            borderRadius: '12px',
            padding: '16px 20px',
            animation: 'fadeIn 0.2s ease',
            flexWrap: 'wrap'
          }}>
            {/* Industry Filter Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink-3)', fontFamily: 'var(--font-sans)' }}>Industry:</span>
              <select
                value={selectedIndustry}
                onChange={(e) => setSelectedIndustry(e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--cream-border)',
                  background: 'var(--white)',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '13px',
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
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink-3)', fontFamily: 'var(--font-sans)' }}>Expertise:</span>
              <select
                value={selectedExpertise}
                onChange={(e) => setSelectedExpertise(e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--cream-border)',
                  background: 'var(--white)',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '13px',
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
        )}

        {/* Count and Clear Action */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          marginTop: '4px'
        }}>
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
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: 0
              }}
            >
              Clear all filters
            </button>
          )}
        </div>
      </div>

      {/* ── CATEGORY HORIZONTAL BAR ── */}
      <div style={{
        display: 'flex',
        overflowX: 'auto',
        gap: '12px',
        padding: '8px 0 20px 0',
        marginBottom: '24px',
      }} className="category-scroll-container">
        {categories.map((cat) => (
          <CategoryPill 
            key={cat.id}
            label={cat.label}
            icon={cat.icon}
            active={isCategoryActive(cat)}
            onClick={() => handleCategoryClick(cat)}
          />
        ))}
      </div>

      {/* ── RESPONSIVE DIRECTORY GRID ── */}
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
            We couldn&apos;t find any verified mentors matching your search query or filters. Try resetting the criteria!
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
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '24px',
          marginBottom: '40px'
        }} className="mentors-grid-container">
          {filteredMentors.map((mentor) => (
            <MentorCard 
              key={mentor.id}
              mentor={mentor}
              isSaved={savedMentorIds.includes(mentor.id)}
              priceStart={mentor.priceStart}
              onInspect={() => setSelectedMentor(mentor)}
            />
          ))}
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
              <Avatar 
                src={selectedMentor.avatar_url} 
                alt={selectedMentor.display_name} 
                size={70} 
                style={{ borderRadius: '50%' }} 
              />
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
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .category-scroll-container::-webkit-scrollbar {
          display: none;
        }
        .category-scroll-container {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .category-btn {
          box-shadow: 0 2px 4px rgba(0,0,0,0.01);
          transition: all 0.25s ease !important;
        }
        .category-btn:hover {
          background: var(--white) !important;
          border-color: var(--accent) !important;
          box-shadow: 0 4px 12px rgba(184, 70, 10, 0.05);
        }
        .category-btn:hover span {
          color: var(--accent) !important;
        }
        .category-btn.active {
          box-shadow: 0 4px 12px rgba(184, 70, 10, 0.08);
        }
        .subnav-link:hover {
          color: var(--ink) !important;
          background: var(--white) !important;
          box-shadow: 0 2px 8px rgba(0,0,0,0.02);
        }
        .try-ai-search-btn:hover {
          opacity: 0.9;
        }
        .filters-toggle-btn:hover {
          border-color: var(--accent) !important;
          color: var(--accent) !important;
        }
        .mock-toggle-container:hover {
          border-color: var(--accent) !important;
        }
      `}} />
    </div>
  )
}
