import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createServiceClient } from '@/lib/supabase/server'
import { BookingDetailsForm } from '@/components/organisms/BookingDetailsForm'
import { 
  Sparkles, 
  Calendar, 
  Clock, 
  Hourglass, 
  Video,
  ArrowLeft
} from 'lucide-react'

interface PageProps {
  params: Promise<{ slug: string; sessionId: string }>
  searchParams: Promise<{ slot?: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = createServiceClient()
  const { data: mentor } = await supabase.from('mentor_profiles').select('display_name').eq('slug', slug).single()
  return {
    title: `Complete Booking with ${mentor?.display_name || 'Mentor'} | Mentor Connect`,
  }
}

export const dynamic = 'force-dynamic'

export default async function BookingDetailsPage({ params, searchParams }: PageProps) {
  const { slug, sessionId } = await params
  const { slot } = await searchParams

  if (!slot) notFound()

  const supabase = createServiceClient()

  // Fetch mentor
  const { data: mentor } = await supabase
    .from('mentor_profiles')
    .select('id, display_name, avatar_url, headline, timezone')
    .eq('slug', slug)
    .single()

  if (!mentor) notFound()

  // Fetch session type
  const { data: sessionType } = await supabase
    .from('session_types')
    .select('id, name, duration_minutes, price_inr, description, tier')
    .eq('id', sessionId)
    .eq('mentor_id', mentor.id)
    .single()

  if (!sessionType) notFound()

  // Parse the slot time
  const slotDate = new Date(slot)
  const endDate = new Date(slotDate.getTime() + sessionType.duration_minutes * 60 * 1000)

  const dateString = slotDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  const startTime = slotDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  const endTime = endDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })

  return (
    <main style={{ background: 'var(--bg)', minHeight: 'calc(100vh - 56px)', padding: '60px 24px 100px', position: 'relative', overflow: 'hidden' }}>
      
      {/* Ambient radial glow halo */}
      <div style={{
        position: 'absolute',
        top: '-15%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '700px',
        height: '400px',
        background: 'radial-gradient(circle, var(--accent-light) 0%, transparent 70%)',
        opacity: 0.45,
        pointerEvents: 'none'
      }} />

      <div style={{ maxWidth: '960px', margin: '0 auto', position: 'relative', zIndex: 1 }}>

        <div style={{ marginBottom: '32px' }}>
          <a 
            href={`/mentor-connect/book/${slug}/${sessionId}`} 
            style={{ 
              fontFamily: 'var(--font-sans)', 
              fontSize: '13.5px', 
              color: 'var(--ink-3)', 
              textDecoration: 'none', 
              fontWeight: 600, 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '6px',
              transition: 'color 0.15s ease'
            }} 
            className="back-link-slots"
          >
            <ArrowLeft size={14} />
            Back to slot selection
          </a>
        </div>

        {/* Premium visual checkpoint steps */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          maxWidth: '640px',
          margin: '0 auto 56px',
          fontFamily: 'var(--font-sans)',
          fontSize: '12px',
          position: 'relative'
        }}>
          {/* Progress bar background line */}
          <div style={{ position: 'absolute', top: '15px', left: '24px', right: '24px', height: '2px', background: 'var(--cream-border)', zIndex: 0 }} />
          <div style={{ position: 'absolute', top: '15px', left: '24px', width: '38%', height: '2px', background: 'var(--accent)', zIndex: 0 }} />

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', position: 'relative', zIndex: 1 }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent)', color: 'var(--white)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '12px', border: '2px solid var(--accent)' }}>1</div>
            <span style={{ color: 'var(--ink-3)', fontWeight: 600, letterSpacing: '0.02em' }}>Select Slot</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', position: 'relative', zIndex: 1 }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--white)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '12px', border: '2px solid var(--accent)', boxShadow: '0 0 0 4px var(--accent-light)' }}>2</div>
            <span style={{ color: 'var(--ink)', fontWeight: 700, letterSpacing: '0.02em' }}>Session Brief</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', position: 'relative', zIndex: 1 }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--white)', border: '2px solid var(--cream-border)', color: 'var(--ink-4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '12px' }}>3</div>
            <span style={{ color: 'var(--ink-4)', fontWeight: 500, letterSpacing: '0.02em' }}>Payment</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center', position: 'relative', zIndex: 1 }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--white)', border: '2px solid var(--cream-border)', color: 'var(--ink-4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '12px' }}>4</div>
            <span style={{ color: 'var(--ink-4)', fontWeight: 500, letterSpacing: '0.02em' }}>Confirmed</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '40px', alignItems: 'flex-start' }} className="details-grid-wrapper">
          
          {/* Left: Brief Form Container */}
          <div style={{ 
            background: 'var(--white)', 
            border: '1px solid var(--cream-border)', 
            borderRadius: '24px', 
            padding: '40px', 
            boxShadow: '0 8px 32px rgba(28,26,22,0.02)' 
          }}>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '26px', color: 'var(--ink)', margin: '0 0 8px', fontWeight: 400 }}>
              Session Brief
            </h1>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13.5px', color: 'var(--ink-3)', margin: '0 0 32px', lineHeight: 1.6 }}>
              Help your mentor prepare by describing what you need guidance on. The more specific you are, the more valuable the session will be.
            </p>

            <BookingDetailsForm
              mentorId={mentor.id}
              mentorSlug={slug}
              sessionTypeId={sessionType.id}
              selectedSlot={slot}
              priceInr={sessionType.price_inr}
            />
          </div>

          {/* Right: Booking Summary Card */}
          <div style={{ 
            background: 'var(--white)', 
            border: '1px solid var(--cream-border)', 
            borderRadius: '24px', 
            padding: '32px', 
            position: 'sticky', 
            top: '80px',
            boxShadow: '0 8px 32px rgba(28,26,22,0.02)'
          }}>
            
            {/* Mentor info header */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px', 
              marginBottom: '24px', 
              paddingBottom: '24px', 
              borderBottom: '1px solid var(--cream-border)',
              backgroundImage: 'radial-gradient(var(--cream-border) 1px, transparent 1px)',
              backgroundSize: '12px 12px'
            }}>
              {mentor.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={mentor.avatar_url} alt="" style={{ width: '52px', height: '52px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid var(--accent)' }} />
              ) : (
                <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'var(--cream-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-serif)', fontSize: '18px', color: 'var(--ink-4)' }}>
                  {mentor.display_name.charAt(0)}
                </div>
              )}
              <div>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '15px', fontWeight: 600, color: 'var(--ink)', margin: 0 }}>{mentor.display_name}</p>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--ink-3)', margin: '2px 0 0', lineHeight: 1.3 }}>{mentor.headline}</p>
              </div>
            </div>

            {/* Visual Icon Grid Rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontFamily: 'var(--font-sans)' }}>
              
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid var(--cream-border)', background: 'var(--bg)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Sparkles size={14} />
                </div>
                <div>
                  <p style={{ color: 'var(--ink-4)', fontSize: '10px', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>Session Format</p>
                  <p style={{ color: 'var(--ink)', margin: 0, fontWeight: 600, fontSize: '13.5px' }}>{sessionType.name}</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid var(--cream-border)', background: 'var(--bg)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Calendar size={14} />
                </div>
                <div>
                  <p style={{ color: 'var(--ink-4)', fontSize: '10px', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>Scheduled Date</p>
                  <p style={{ color: 'var(--ink)', margin: 0, fontWeight: 600, fontSize: '13.5px' }}>{dateString}</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid var(--cream-border)', background: 'var(--bg)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Clock size={14} />
                </div>
                <div>
                  <p style={{ color: 'var(--ink-4)', fontSize: '10px', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>Time Slot</p>
                  <p style={{ color: 'var(--ink)', margin: 0, fontWeight: 600, fontSize: '13.5px' }}>{startTime} — {endTime}</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid var(--cream-border)', background: 'var(--bg)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Hourglass size={14} />
                </div>
                <div>
                  <p style={{ color: 'var(--ink-4)', fontSize: '10px', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>Duration</p>
                  <p style={{ color: 'var(--ink)', margin: 0, fontWeight: 600, fontSize: '13.5px' }}>{sessionType.duration_minutes} Minutes</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid var(--cream-border)', background: 'var(--bg)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Video size={14} />
                </div>
                <div>
                  <p style={{ color: 'var(--ink-4)', fontSize: '10px', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>Lobby Channel</p>
                  <p style={{ color: 'var(--ink)', margin: 0, fontWeight: 600, fontSize: '13.5px' }}>Google Meet Video</p>
                </div>
              </div>
            </div>

            {/* Total Price Section */}
            <div style={{ 
              marginTop: '28px', 
              paddingTop: '24px', 
              borderTop: '1px solid var(--cream-border)', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center' 
            }}>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--ink-3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Total Fee</span>
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', color: 'var(--ink)', fontWeight: 600 }}>
                {sessionType.price_inr > 0 ? `₹${sessionType.price_inr.toLocaleString()}` : 'Free'}
              </span>
            </div>
          </div>

        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .back-link-slots:hover {
          color: var(--accent) !important;
          transform: translateX(-2px);
        }
        @media (max-width: 860px) {
          .details-grid-wrapper {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
          }
        }
      `}} />
    </main>
  )
}
