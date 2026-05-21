import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { createServiceClient } from '@/lib/supabase/server'
import { getAuthenticatedUser } from '@/lib/auth-utils'
import Link from 'next/link'
import { 
  ShieldCheck, 
  Calendar, 
  Clock, 
  Hourglass, 
  Video, 
  FileText, 
  Sparkles, 
  ArrowRight,
  ChevronRight
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Booking Confirmed | Mentor Connect'
}

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{ session?: string }>
}

export default async function BookingSuccessPage({ searchParams }: PageProps) {
  const { session: sessionId } = await searchParams

  if (!sessionId) redirect('/mentor-connect')

  const user = await getAuthenticatedUser()
  if (!user) redirect('/')

  const supabase = createServiceClient()

  // Fetch session with mentor and session type details
  const { data: session } = await supabase
    .from('sessions')
    .select(`
      id,
      status,
      scheduled_start,
      scheduled_end,
      google_meet_link,
      founder_brief,
      amount_inr,
      mentor_id,
      session_type_id
    `)
    .eq('id', sessionId)
    .eq('founder_id', user.id)
    .single()

  if (!session) notFound()

  // Fetch mentor
  const { data: mentor } = await supabase
    .from('mentor_profiles')
    .select('display_name, avatar_url, headline, slug')
    .eq('id', session.mentor_id)
    .single()

  // Fetch session type
  const { data: sessionType } = await supabase
    .from('session_types')
    .select('name, duration_minutes')
    .eq('id', session.session_type_id)
    .single()

  const startDate = new Date(session.scheduled_start)
  const endDate = new Date(session.scheduled_end)
  const dateString = startDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  const startTime = startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  const endTime = endDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })

  const isConfirmed = session.status === 'confirmed'

  return (
    <main style={{ background: 'var(--bg)', minHeight: 'calc(100vh - 56px)', padding: '80px 24px 100px', position: 'relative', overflow: 'hidden' }}>
      
      {/* Ambient radial halo */}
      <div style={{
        position: 'absolute',
        top: '-15%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '600px',
        height: '350px',
        background: 'radial-gradient(circle, var(--accent-light) 0%, transparent 70%)',
        opacity: 0.5,
        pointerEvents: 'none'
      }} />

      <div style={{ maxWidth: '640px', margin: '0 auto', position: 'relative', zIndex: 1 }}>

        {/* Success Banner */}
        <div style={{ 
          background: 'var(--white)', 
          border: '1px solid var(--cream-border)', 
          borderRadius: '24px', 
          padding: '48px 40px', 
          textAlign: 'center', 
          marginBottom: '32px',
          boxShadow: '0 8px 32px rgba(28,26,22,0.02)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Subtle dot drafting background in the badge circle */}
          <div style={{ 
            width: '72px', 
            height: '72px', 
            background: 'var(--accent-light)', 
            color: 'var(--accent)', 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            margin: '0 auto 24px',
            border: '1px solid rgba(184, 70, 10, 0.15)'
          }}>
            <ShieldCheck size={36} />
          </div>

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
            marginBottom: '16px',
            border: '1px solid rgba(184, 70, 10, 0.15)',
          }}>
            <Sparkles size={12} />
            {isConfirmed ? 'CONFIRMED' : 'PENDING ACTION'}
          </div>

          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '32px', color: 'var(--ink)', margin: '0 0 12px', fontWeight: 400 }}>
            {isConfirmed ? 'Session Scheduled' : 'Booking Received'}
          </h1>
          
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '15px', color: 'var(--ink-3)', lineHeight: 1.6, margin: 0 }}>
            {isConfirmed
              ? 'Your meeting has been locked. A calendar invite with full access details and credentials has been shared with your email address.'
              : 'Your booking has been logged successfully and is currently waiting for final confirmation.'
            }
          </p>
        </div>

        {/* Session Details Card */}
        <div style={{ 
          background: 'var(--white)', 
          border: '1px solid var(--cream-border)', 
          borderRadius: '24px', 
          padding: '40px', 
          marginBottom: '32px',
          boxShadow: '0 8px 32px rgba(28,26,22,0.02)'
        }}>
          
          {/* Mentor Profile Details */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '16px', 
            marginBottom: '32px', 
            paddingBottom: '24px', 
            borderBottom: '1px solid var(--cream-border)',
            backgroundImage: 'radial-gradient(var(--cream-border) 1px, transparent 1px)',
            backgroundSize: '16px 16px',
          }}>
            {mentor?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={mentor.avatar_url} alt="" style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--accent)' }} />
            ) : (
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--cream-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-serif)', fontSize: '20px', color: 'var(--ink-4)' }}>
                {mentor?.display_name?.charAt(0) || 'M'}
              </div>
            )}
            <div>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '16px', fontWeight: 600, color: 'var(--ink)', margin: 0 }}>{mentor?.display_name}</p>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--ink-3)', margin: '4px 0 0', lineHeight: 1.4 }}>{mentor?.headline}</p>
            </div>
          </div>

          {/* Session Details Grid */}
          <div className="success-details-grid" style={{ marginBottom: '32px' }}>
            <div className="success-detail-item">
              <div className="detail-icon-frame"><Sparkles size={16} /></div>
              <div>
                <span className="detail-label">Session Format</span>
                <span className="detail-value">{sessionType?.name}</span>
              </div>
            </div>

            <div className="success-detail-item">
              <div className="detail-icon-frame"><Hourglass size={16} /></div>
              <div>
                <span className="detail-label">Duration</span>
                <span className="detail-value">{sessionType?.duration_minutes} Minutes</span>
              </div>
            </div>

            <div className="success-detail-item">
              <div className="detail-icon-frame"><Calendar size={16} /></div>
              <div>
                <span className="detail-label">Scheduled Date</span>
                <span className="detail-value">{dateString}</span>
              </div>
            </div>

            <div className="success-detail-item">
              <div className="detail-icon-frame"><Clock size={16} /></div>
              <div>
                <span className="detail-label">Time Segment</span>
                <span className="detail-value">{startTime} — {endTime}</span>
              </div>
            </div>
          </div>

          {/* Google Meet Link Panel */}
          {session.google_meet_link ? (
            <div style={{ 
              padding: '24px', 
              background: 'var(--accent-light)', 
              borderRadius: '16px', 
              border: '1px solid rgba(184, 70, 10, 0.15)', 
              marginBottom: '32px',
              backgroundImage: 'radial-gradient(rgba(184, 70, 10, 0.05) 1px, transparent 1px)',
              backgroundSize: '12px 12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <Video size={16} color="var(--accent)" />
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Secure Calendar Integration
                </span>
              </div>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13.5px', color: 'var(--ink-2)', margin: '0 0 16px', lineHeight: 1.5 }}>
                Your unique virtual call lobby has been synced. Use the secure Google Meet link below at the scheduled time to enter.
              </p>
              <a
                href={session.google_meet_link}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '13.5px',
                  color: 'var(--white)',
                  background: 'var(--ink)',
                  padding: '10px 24px',
                  borderRadius: '100px',
                  fontWeight: 600,
                  textDecoration: 'none',
                  transition: 'all 0.2s ease'
                }}
                className="cta-flow-btn"
              >
                Join Session ↗
              </a>
            </div>
          ) : (
            <div style={{ 
              padding: '24px', 
              background: '#FFFBEB', 
              borderRadius: '16px', 
              border: '1px solid #FDE68A', 
              marginBottom: '32px',
              backgroundImage: 'radial-gradient(rgba(217, 119, 6, 0.05) 1px, transparent 1px)',
              backgroundSize: '12px 12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <Video size={16} color="#D97706" />
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', fontWeight: 700, color: '#B45309', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Generating Calendar Lobby
                </span>
              </div>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13.5px', color: '#B45309', margin: 0, lineHeight: 1.5 }}>
                Google Calendar is securely synchronizing your availability. A meeting link will generate here and be delivered to your inbox in moments.
              </p>
            </div>
          )}

          {/* Submitted Founder Brief */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <FileText size={14} color="var(--ink-4)" />
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: '11.5px', fontWeight: 700, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Your Goal Brief & Briefing Notes
              </span>
            </div>
            <blockquote style={{ 
              margin: 0, 
              padding: '16px 20px', 
              background: 'var(--bg)', 
              borderLeft: '3px solid var(--accent)', 
              borderRadius: '8px', 
              fontFamily: 'var(--font-sans)', 
              fontSize: '14px', 
              lineHeight: 1.5, 
              color: 'var(--ink-2)', 
              fontStyle: 'italic' 
            }}>
              "{session.founder_brief || 'No briefing notes provided.'}"
            </blockquote>
          </div>

          {/* Amount Paid */}
          {session.amount_inr > 0 && (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              paddingTop: '24px', 
              borderTop: '1px solid var(--cream-border)'
            }}>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--ink-3)', fontWeight: 500 }}>Transaction Total</span>
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', color: 'var(--ink)', fontWeight: 600 }}>₹{session.amount_inr.toLocaleString()}</span>
            </div>
          )}
        </div>

        {/* Bottom Navigation Actions */}
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            href="/profile/sessions"
            style={{
              padding: '14px 32px',
              background: 'var(--ink)',
              color: 'var(--white)',
              borderRadius: '100px',
              fontFamily: 'var(--font-sans)',
              fontSize: '14px',
              fontWeight: 600,
              textDecoration: 'none',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 12px rgba(28,26,22,0.1)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
            className="cta-flow-btn"
          >
            View My Sessions
            <ChevronRight size={14} />
          </Link>
          
          <Link
            href="/mentor-connect/mentors"
            style={{
              padding: '14px 32px',
              background: 'var(--white)',
              color: 'var(--ink)',
              border: '1px solid var(--cream-border)',
              borderRadius: '100px',
              fontFamily: 'var(--font-sans)',
              fontSize: '14px',
              fontWeight: 600,
              textDecoration: 'none',
              transition: 'all 0.2s ease',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
            className="cta-flow-btn-secondary"
          >
            Browse More Mentors
          </Link>
        </div>

      </div>

      {/* Embedded High-Aesthetic Styled Block */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .success-details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }

        .success-detail-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }

        .detail-icon-frame {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          border: 1px solid var(--cream-border);
          background: var(--bg);
          color: var(--accent);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .detail-label {
          display: block;
          font-family: var(--font-sans);
          font-size: 11px;
          font-weight: 700;
          color: var(--ink-4);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 4px;
        }

        .detail-value {
          display: block;
          font-family: var(--font-sans);
          font-size: 14.5px;
          font-weight: 600;
          color: var(--ink);
        }

        .cta-flow-btn:hover {
          background: var(--accent) !important;
          box-shadow: 0 8px 24px rgba(184, 70, 10, 0.2) !important;
          transform: translateY(-1px);
        }

        .cta-flow-btn-secondary:hover {
          border-color: var(--accent) !important;
          color: var(--accent) !important;
          background: var(--accent-light) !important;
        }

        @media (max-width: 500px) {
          .success-details-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }
        }
      `}} />
    </main>
  )
}
