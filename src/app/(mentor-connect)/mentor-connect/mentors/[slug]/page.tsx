import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/server'
import { getAuthenticatedUser } from '@/lib/auth-utils'
import { SaveMentorButton } from '@/components/mentor-connect/SaveMentorButton'

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

  // Helper to extract YouTube ID for embed
  const getYoutubeEmbedUrl = (url: string) => {
    if (!url) return null
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null
  }

  const embedUrl = mentor.intro_video_url ? getYoutubeEmbedUrl(mentor.intro_video_url) : null

  return (
    <main style={{ background: 'var(--cream)', minHeight: 'calc(100vh - 56px)' }}>
      {/* ── PROFILE HEADER ── */}
      <section style={{ background: 'var(--white)', borderBottom: '1px solid var(--cream-border)', padding: '60px 24px 40px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
          {mentor.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={mentor.avatar_url} alt="" style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '4px solid var(--white)', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
          ) : (
            <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'var(--cream-dark)', flexShrink: 0 }} />
          )}
          
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '36px', color: 'var(--ink)', margin: '0 0 8px' }}>
                  {mentor.display_name}
                </h1>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '18px', color: 'var(--ink-3)', margin: '0 0 16px', lineHeight: 1.4 }}>
                  {mentor.headline}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--ink-4)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    📍 {mentor.location_city}, {mentor.location_country}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    🌐 {mentor.languages.join(', ')}
                  </span>
                  {mentor.verification_tier !== 'community' && (
                    <span style={{ background: '#EDF5EA', color: '#2A6620', padding: '4px 10px', borderRadius: '100px', fontWeight: 500, fontSize: '12px' }}>
                      {mentor.verification_tier === 'verified' ? 'Verified Mentor' : 'Credential Verified'}
                    </span>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <SaveMentorButton mentorId={mentor.id} initialSaved={isSaved} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TWO COLUMN LAYOUT ── */}
      <section style={{ padding: '40px 24px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', gap: '40px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          
          {/* LEFT COLUMN: About & Video */}
          <div style={{ flex: '1 1 600px' }}>
            {embedUrl && (
              <div style={{ marginBottom: '40px', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--cream-border)', aspectRatio: '16/9' }}>
                <iframe 
                  src={embedUrl} 
                  title="Intro Video" 
                  style={{ width: '100%', height: '100%', border: 'none' }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                />
              </div>
            )}

            <div style={{ background: 'var(--white)', borderRadius: '16px', border: '1px solid var(--cream-border)', padding: '32px', marginBottom: '32px' }}>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', color: 'var(--ink)', margin: '0 0 16px' }}>About</h2>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: '16px', color: 'var(--ink-3)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                {mentor.bio}
              </div>
            </div>

            <div style={{ background: 'var(--white)', borderRadius: '16px', border: '1px solid var(--cream-border)', padding: '32px' }}>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', color: 'var(--ink)', margin: '0 0 24px' }}>Expertise & Experience</h2>
              
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 600, color: 'var(--ink)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 12px' }}>Core Expertise</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {mentor.expertise_areas.map((area: string) => (
                    <span key={area} style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', padding: '8px 16px', background: 'var(--cream)', borderRadius: '100px', color: 'var(--ink)', border: '1px solid var(--cream-border)' }}>
                      {area}
                    </span>
                  ))}
                </div>
              </div>

              {mentor.notable_companies && mentor.notable_companies.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 600, color: 'var(--ink)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 12px' }}>Notable Companies</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {mentor.notable_companies.map((company: string) => (
                      <span key={company} style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', padding: '8px 16px', background: '#F8FAFC', borderRadius: '8px', color: '#334155', border: '1px solid #E2E8F0' }}>
                        {company}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {mentor.markets_covered && mentor.markets_covered.length > 0 && (
                <div>
                  <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 600, color: 'var(--ink)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 12px' }}>Markets</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {mentor.markets_covered.map((market: string) => (
                      <span key={market} style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', padding: '8px 16px', background: 'var(--cream)', borderRadius: '100px', color: 'var(--ink)', border: '1px solid var(--cream-border)' }}>
                        {market}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Sessions */}
          <div style={{ flex: '1 1 300px' }}>
            <div style={{ position: 'sticky', top: '24px' }}>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', color: 'var(--ink)', margin: '0 0 20px' }}>Book a Session</h2>
              
              {activeSessions.length === 0 ? (
                <div style={{ background: 'var(--white)', border: '1px solid var(--cream-border)', borderRadius: '16px', padding: '32px', textAlign: 'center' }}>
                  <p style={{ fontFamily: 'var(--font-sans)', fontSize: '15px', color: 'var(--ink-4)', margin: 0 }}>This mentor currently has no active session types.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {activeSessions.map((session: any) => (
                    <div key={session.id} style={{ background: 'var(--white)', border: '1px solid var(--cream-border)', borderRadius: '16px', padding: '24px', transition: 'box-shadow 0.2s ease' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '18px', fontWeight: 600, color: 'var(--ink)', margin: 0 }}>
                          {session.name}
                        </h3>
                        <span style={{ fontFamily: 'var(--font-sans)', fontSize: '16px', fontWeight: 600, color: 'var(--ink)' }}>
                          {session.price_inr > 0 ? `₹${session.price_inr.toLocaleString()}` : 'Free'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--ink-4)', marginBottom: '16px' }}>
                        <span>⏱ {session.duration_minutes} min</span>
                        <span>•</span>
                        <span>🎥 Google Meet</span>
                      </div>
                      <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--ink-3)', lineHeight: 1.5, margin: '0 0 20px' }}>
                        {session.description}
                      </p>
                      
                      <Link
                        href={`/mentor-connect/book/${mentor.slug}/${session.id}`}
                        style={{
                          display: 'block',
                          textAlign: 'center',
                          padding: '14px',
                          background: 'var(--ink)',
                          color: 'var(--white)',
                          borderRadius: '8px',
                          fontFamily: 'var(--font-sans)',
                          fontSize: '15px',
                          fontWeight: 500,
                          textDecoration: 'none',
                          width: '100%',
                        }}
                      >
                        Book {session.duration_minutes} min session
                      </Link>
                    </div>
                  ))}
                </div>
              )}

              {/* Social Links snippet */}
              <div style={{ marginTop: '32px', textAlign: 'center' }}>
                <a href={mentor.linkedin_url} target="_blank" rel="noopener noreferrer" style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: '#0A66C2', textDecoration: 'none', fontWeight: 500 }}>
                  View LinkedIn Profile ↗
                </a>
              </div>
            </div>
          </div>

        </div>
      </section>
    </main>
  )
}
