import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/server'
import { getAuthenticatedUser } from '@/lib/auth-utils'
import { SaveMentorButton } from '@/components/mentor-connect/SaveMentorButton'
import { RequestMeetingButton } from '@/components/mentor-connect/RequestMeetingButton'
import SessionSelector from '@/components/mentor-connect/SessionSelector'
import { Star, ShieldCheck, Sparkles, MapPin, Globe, ArrowLeft, Video, Calendar, Shield } from 'lucide-react'

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

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = createServiceClient()
  
  const { data: mentor } = await supabase
    .from('mentor_profiles')
    .select('display_name, headline')
    .eq('slug', slug)
    .single()

  if (!mentor) return { title: 'Mentor Not Found' }

  return {
    title: `${mentor.display_name} | Mentor Connect`,
    description: mentor.headline,
  }
}

export const dynamic = 'force-dynamic'

export default async function MentorProfilePage({ params }: PageProps) {
  const { slug } = await params
  const supabase = createServiceClient()
  const user = await getAuthenticatedUser()

  const { data: mentor } = await supabase
    .from('mentor_profiles')
    .select(`
      *,
      session_types (
        id,
        name,
        tier,
        duration_minutes,
        price_inr,
        description,
        is_active
      )
    `)
    .eq('slug', slug)
    .single()

  if (!mentor || mentor.status !== 'active') {
    notFound()
  }

  const activeSessions = (mentor.session_types || []).filter((s: any) => s.is_active)
  const isCalendarConnected = !!(mentor.google_access_token && mentor.google_refresh_token)

  let isSaved = false
  if (user) {
    const { data: saved } = await supabase
      .from('saved_mentors')
      .select('id')
      .eq('user_id', user.id)
      .eq('mentor_id', mentor.id)
      .single()
    if (saved) isSaved = true
  }

  // Fetch reviews for this mentor
  const { data: rawReviews } = await supabase
    .from('reviews')
    .select('*')
    .eq('mentor_id', mentor.id)
    .eq('is_hidden', false)
    .order('created_at', { ascending: false })

  let reviews: any[] = []
  if (rawReviews && rawReviews.length > 0) {
    const founderIds = rawReviews.map(r => r.founder_id)
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', founderIds)

    const profileMap = new Map(profiles?.map(p => [p.id, p]))
    reviews = rawReviews.map(r => ({
      ...r,
      founder: profileMap.get(r.founder_id)
    }))
  }

  // Helper to extract YouTube ID for embed
  const getYoutubeEmbedUrl = (url: string) => {
    if (!url) return null
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null
  }

  const embedUrl = mentor.intro_video_url ? getYoutubeEmbedUrl(mentor.intro_video_url) : null

  return (
    <main style={{ background: 'var(--bg)', minHeight: 'calc(100vh - 56px)', position: 'relative' }}>
      {/* Ambient background glow */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: '1280px',
        height: '350px',
        background: 'radial-gradient(ellipse 60% 50% at 50% 0%, var(--accent-light) 0%, transparent 70%)',
        opacity: 0.5,
        zIndex: 0,
        pointerEvents: 'none'
      }} />

      {/* Breadcrumbs Row */}
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '24px 24px 0', position: 'relative', zIndex: 1 }}>
        <Link href="/mentor-connect/mentors" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          fontFamily: 'var(--font-sans)',
          fontSize: '13px',
          fontWeight: 600,
          color: 'var(--ink-3)',
          textDecoration: 'none',
          transition: 'color 0.15s ease'
        }} className="back-to-dir">
          <ArrowLeft size={14} />
          Back to directory
        </Link>
      </div>

      {/* ── PROFILE HEADER ── */}
      <section style={{ padding: '32px 24px 40px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', gap: '32px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          {mentor.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={mentor.avatar_url} alt="" style={{ width: '110px', height: '110px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '4px solid var(--white)', boxShadow: '0 8px 24px rgba(28,26,22,0.06)' }} />
          ) : (
            <div style={{ width: '110px', height: '110px', borderRadius: '50%', background: 'var(--white)', border: '4px solid var(--white)', boxShadow: '0 8px 24px rgba(28,26,22,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: '28px', fontWeight: 600, color: 'var(--ink-3)' }}>{mentor.display_name.charAt(0)}</span>
            </div>
          )}
          
          <div style={{ flex: 1, minWidth: '280px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px', flexWrap: 'wrap' }}>
                  <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '36px', color: 'var(--ink)', margin: 0, fontWeight: 400, letterSpacing: '-0.01em' }}>
                    {mentor.display_name}
                  </h1>
                  {mentor.verification_tier !== 'community' && (
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '11px',
                      background: '#EDF5EA',
                      color: '#2A6620',
                      padding: '4px 10px',
                      borderRadius: '100px',
                      fontWeight: 600,
                      letterSpacing: '0.02em',
                      border: '1px solid rgba(42, 102, 32, 0.15)'
                    }}>
                      <ShieldCheck size={12} />
                      {mentor.verification_tier === 'verified' ? 'Verified Mentor' : 'Credential Pro'}
                    </span>
                  )}
                </div>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '18px', color: 'var(--ink-3)', margin: '0 0 20px', lineHeight: 1.45, fontWeight: 400, maxWidth: '680px' }}>
                  {mentor.headline}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center', fontFamily: 'var(--font-sans)', fontSize: '13.5px', color: 'var(--ink-3)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={14} color="var(--accent)" />
                    {mentor.location_city}, {mentor.location_country}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Globe size={14} color="var(--accent)" />
                    {mentor.languages.join(', ')}
                  </span>
                  {mentor.avg_rating > 0 && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600, color: 'var(--ink)' }}>
                      <Star size={14} fill="var(--accent)" color="var(--accent)" />
                      {mentor.avg_rating.toFixed(1)} <span style={{ color: 'var(--ink-4)', fontWeight: 400 }}>({mentor.total_reviews} reviews)</span>
                    </span>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                <a href={mentor.linkedin_url} target="_blank" rel="noopener noreferrer" style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#0A66C2',
                  background: 'rgba(10, 102, 194, 0.05)',
                  border: '1px solid rgba(10, 102, 194, 0.15)',
                  padding: '8px 16px',
                  borderRadius: '100px',
                  textDecoration: 'none',
                  transition: 'all 0.15s ease'
                }} className="profile-social-btn">
                  <LinkedinIcon size={14} />
                  LinkedIn
                </a>
                {mentor.twitter_url && (
                  <a href={mentor.twitter_url} target="_blank" rel="noopener noreferrer" style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'var(--ink)',
                    background: 'rgba(28, 26, 22, 0.04)',
                    border: '1px solid rgba(28, 26, 22, 0.12)',
                    padding: '8px 16px',
                    borderRadius: '100px',
                    textDecoration: 'none',
                    transition: 'all 0.15s ease'
                  }} className="profile-social-btn">
                    <TwitterIcon size={14} />
                    Twitter / X
                  </a>
                )}
                {mentor.intro_video_url && (
                  <a href={mentor.intro_video_url} target="_blank" rel="noopener noreferrer" style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'var(--accent)',
                    background: 'rgba(184, 70, 10, 0.05)',
                    border: '1px solid rgba(184, 70, 10, 0.15)',
                    padding: '8px 16px',
                    borderRadius: '100px',
                    textDecoration: 'none',
                    transition: 'all 0.15s ease'
                  }} className="profile-social-btn">
                    <Video size={14} />
                    Intro Video
                  </a>
                )}
                <SaveMentorButton mentorId={mentor.id} initialSaved={isSaved} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TOP PROMOTED CUSTOM strategy session BANNER ── */}
      {activeSessions.length > 0 && (
        <section style={{ padding: '0 24px 32px', position: 'relative', zIndex: 1 }}>
          <div style={{
            maxWidth: '1000px',
            margin: '0 auto',
            background: 'linear-gradient(135deg, #FFFDF9 0%, #FAF6EE 100%)',
            border: '2px solid #E6C280',
            borderRadius: '16px',
            padding: '24px 32px',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 8px 30px rgba(230, 194, 128, 0.08)'
          }}>
            <div style={{
              position: 'absolute',
              top: '-40px',
              right: '-40px',
              width: '120px',
              height: '120px',
              background: 'radial-gradient(circle, rgba(230, 194, 128, 0.25) 0%, transparent 70%)',
              pointerEvents: 'none'
            }} />

            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '20px', position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', flex: '1 1 500px' }}>
                <div style={{
                  background: '#F5ECE0',
                  color: '#B4460A',
                  padding: '10px',
                  borderRadius: '12px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Sparkles size={20} />
                </div>
                <div>
                  <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', fontWeight: 400, color: 'var(--ink)', margin: '0 0 6px' }}>
                    Need a Custom Strategy Proposal?
                  </h4>
                  <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13.5px', color: 'var(--ink-3)', lineHeight: 1.5, margin: 0 }}>
                    If you require a custom advisory framework, dedicated timeline options, or distinct team workshops, submit a tailored request directly to {mentor.display_name}.
                  </p>
                </div>
              </div>
              <div style={{ flex: '0 0 auto' }}>
                <RequestMeetingButton
                  mentorId={mentor.id}
                  mentorName={mentor.display_name}
                  sessionTypes={activeSessions}
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── TWO COLUMN LAYOUT (About & Credentials) ── */}
      <section style={{ padding: '0 24px 32px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', gap: '40px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          
          {/* LEFT COLUMN: About & Expertise */}
          <div style={{ flex: '1 1 580px', minWidth: 0 }}>
            {embedUrl && (
              <div style={{ marginBottom: '32px', borderRadius: 'var(--radius-lg, 16px)', overflow: 'hidden', border: '1px solid var(--cream-border)', aspectRatio: '16/9', background: '#000', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                <iframe 
                  src={embedUrl} 
                  title="Intro Video" 
                  style={{ width: '100%', height: '100%', border: 'none' }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                />
              </div>
            )}

            {/* About */}
            <div style={{ padding: '0 0 32px 0', borderBottom: '1px solid var(--cream-border)', marginBottom: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
                <Sparkles size={16} color="var(--accent)" />
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', color: 'var(--ink)', margin: 0, fontWeight: 400 }}>About</h2>
              </div>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: '16px', color: 'var(--ink-2)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                {mentor.bio}
              </div>
            </div>

            {/* Expertise & Experience (Seamless row format below About) */}
            <div style={{ padding: '0 0 32px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
                <Shield size={16} color="var(--accent)" />
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', color: 'var(--ink)', margin: 0, fontWeight: 400 }}>Expertise & Experience</h2>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontFamily: 'var(--font-sans)', fontSize: '15.5px', color: 'var(--ink-2)', lineHeight: 1.7 }}>
                <p style={{ margin: 0 }}>
                  <strong style={{ color: 'var(--ink)', fontWeight: 600 }}>Core Focus Areas:</strong>{' '}
                  {mentor.expertise_areas.join(' · ')}
                </p>
                {mentor.notable_companies && mentor.notable_companies.length > 0 && (
                  <p style={{ margin: 0 }}>
                    <strong style={{ color: 'var(--ink)', fontWeight: 600 }}>Notable Experience:</strong>{' '}
                    {mentor.notable_companies.join(' · ')}
                  </p>
                )}
                {mentor.markets_covered && mentor.markets_covered.length > 0 && (
                  <p style={{ margin: 0 }}>
                    <strong style={{ color: 'var(--ink)', fontWeight: 600 }}>Markets Covered:</strong>{' '}
                    {mentor.markets_covered.join(' · ')}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Overview Details */}
          <div style={{ flex: '1 1 320px', position: 'sticky', top: '80px' }}>
            <div style={{ background: 'var(--white)', borderRadius: '16px', border: '1px solid var(--cream-border)', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.01)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
                <Shield size={16} color="var(--accent)" />
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', color: 'var(--ink)', margin: 0, fontWeight: 400 }}>Overview Details</h2>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontFamily: 'var(--font-sans)', fontSize: '14px' }}>
                <div>
                  <span style={{ color: 'var(--ink-4)', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '4px' }}>Timezone</span>
                  <span style={{ color: 'var(--ink)', fontWeight: 500 }}>{mentor.timezone}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--ink-4)', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '4px' }}>Verification Tier</span>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: 'var(--accent)',
                    fontWeight: 600,
                    background: 'rgba(184, 70, 10, 0.05)',
                    padding: '4px 12px',
                    borderRadius: '100px',
                    fontSize: '12.5px',
                    border: '1px solid rgba(184, 70, 10, 0.15)',
                    marginTop: '2px'
                  }}>
                    <ShieldCheck size={13} />
                    {mentor.verification_tier.charAt(0).toUpperCase() + mentor.verification_tier.slice(1)} Operator
                  </span>
                </div>
                <div>
                  <span style={{ color: 'var(--ink-4)', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '4px' }}>Average Rating</span>
                  <span style={{ color: 'var(--ink)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    ⭐ {mentor.avg_rating ? mentor.avg_rating.toFixed(1) : '5.0'} / 5.0
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── FULL WIDTH ROW: Book a Session ── */}
      <section style={{ padding: '24px 24px 48px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ background: 'var(--white)', border: '1px solid var(--cream-border)', borderRadius: '16px', padding: '36px', boxShadow: '0 4px 20px rgba(0,0,0,0.01)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <Calendar size={18} color="var(--accent)" />
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', color: 'var(--ink)', margin: 0, fontWeight: 400 }}>Book a Session</h2>
            </div>
            
            {!isCalendarConnected ? (
              <div style={{
                background: '#FFFDF5',
                border: '1px solid rgba(184, 70, 10, 0.15)',
                borderRadius: 'var(--radius-lg, 16px)',
                padding: '28px',
                textAlign: 'center',
                boxShadow: '0 4px 20px rgba(0,0,0,0.01)'
              }}>
                <span style={{ fontSize: '32px', display: 'block', marginBottom: '12px' }}>🗓️</span>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 600, color: 'var(--accent)', margin: '0 0 6px' }}>
                  Custom Requests Only
                </p>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--ink-3)', margin: 0, lineHeight: 1.55 }}>
                  This mentor is currently offline for instant bookings. You can still send a custom meeting proposal!
                </p>
              </div>
            ) : activeSessions.length === 0 ? (
              <div style={{ background: 'var(--bg)', border: '1px solid var(--cream-border)', borderRadius: 'var(--radius-lg, 16px)', padding: '32px', textAlign: 'center' }}>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--ink-4)', margin: 0 }}>This mentor currently has no active session types.</p>
              </div>
            ) : (
              <SessionSelector
                activeSessions={activeSessions}
                mentorSlug={mentor.slug}
                mentorId={mentor.id}
                mentorName={mentor.display_name}
              />
            )}
          </div>
        </div>
      </section>

      {/* ── FULL WIDTH ROW: Reviews ── */}
      <section style={{ padding: '0 24px 80px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ background: 'var(--white)', borderRadius: '16px', border: '1px solid var(--cream-border)', padding: '36px', boxShadow: '0 12px 40px rgba(28,26,22,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
              <Star size={16} fill="var(--accent)" color="var(--accent)" />
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', color: 'var(--ink)', margin: 0, fontWeight: 400 }}>
                Reviews ({reviews.length})
              </h2>
            </div>

            {reviews.length === 0 ? (
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--ink-4)', margin: 0 }}>
                No reviews left for this mentor yet.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {reviews.map((r: any) => (
                  <div key={r.id} style={{ borderBottom: '1px solid var(--cream-border)', paddingBottom: '24px', lastChild: { borderBottom: 'none' } } as any}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 600, color: 'var(--ink)' }}>
                        {r.founder?.full_name || 'Founder'}
                      </span>
                      <div style={{ display: 'flex', gap: '2px' }}>
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <Star key={idx} size={13} fill={idx < r.rating_overall ? 'var(--accent)' : 'none'} color={idx < r.rating_overall ? 'var(--accent)' : 'var(--cream-border)'} />
                        ))}
                      </div>
                    </div>
                    <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--ink-2)', lineHeight: 1.55, margin: '0 0 12px' }}>
                      {r.review_text}
                    </p>

                    {r.mentor_reply && (
                      <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius-lg, 12px)', padding: '16px 20px', marginTop: '12px', borderLeft: '3px solid var(--accent)', border: '1px solid var(--cream-border)' }}>
                        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', fontWeight: 600, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0 0 6px' }}>
                          Reply from {mentor.display_name}:
                        </p>
                        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13.5px', color: 'var(--ink-3)', margin: 0, lineHeight: 1.5 }}>
                          {r.mentor_reply}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <style dangerouslySetInnerHTML={{
        __html: `
        .back-to-dir:hover {
          color: var(--accent) !important;
        }
      `}} />
    </main>
  )
}
