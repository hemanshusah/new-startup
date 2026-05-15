import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createServiceClient } from '@/lib/supabase/server'
import { BookingDetailsForm } from '@/components/mentor-connect/BookingDetailsForm'

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
    <main style={{ background: 'var(--cream)', minHeight: 'calc(100vh - 56px)', padding: '60px 24px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>

        <div style={{ marginBottom: '32px' }}>
          <a href={`/mentor-connect/book/${slug}/${sessionId}`} style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--ink-4)', textDecoration: 'none' }}>
            ← Back to slot selection
          </a>
        </div>

        {/* Progress Steps */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '40px', fontFamily: 'var(--font-sans)', fontSize: '13px' }}>
          <span style={{ color: 'var(--ink-4)' }}>1. Select Slot</span>
          <span style={{ color: 'var(--ink-4)' }}>→</span>
          <span style={{ color: 'var(--ink)', fontWeight: 600 }}>2. Session Brief</span>
          <span style={{ color: 'var(--ink-4)' }}>→</span>
          <span style={{ color: 'var(--ink-4)' }}>3. Payment</span>
          <span style={{ color: 'var(--ink-4)' }}>→</span>
          <span style={{ color: 'var(--ink-4)' }}>4. Confirmed</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '32px', alignItems: 'flex-start' }}>
          
          {/* Left: Brief Form */}
          <div style={{ background: 'var(--white)', border: '1px solid var(--cream-border)', borderRadius: '16px', padding: '32px' }}>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', color: 'var(--ink)', margin: '0 0 8px' }}>
              Session Brief
            </h1>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--ink-4)', margin: '0 0 32px', lineHeight: 1.5 }}>
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
          <div style={{ background: 'var(--white)', border: '1px solid var(--cream-border)', borderRadius: '16px', padding: '24px', position: 'sticky', top: '80px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid var(--cream-border)' }}>
              {mentor.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={mentor.avatar_url} alt="" style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--cream-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-serif)', fontSize: '18px', color: 'var(--ink-4)' }}>
                  {mentor.display_name.charAt(0)}
                </div>
              )}
              <div>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '15px', fontWeight: 600, color: 'var(--ink)', margin: 0 }}>{mentor.display_name}</p>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--ink-4)', margin: '2px 0 0' }}>{mentor.headline}</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontFamily: 'var(--font-sans)', fontSize: '14px' }}>
              <div>
                <p style={{ color: 'var(--ink-4)', fontSize: '12px', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Session</p>
                <p style={{ color: 'var(--ink)', margin: 0, fontWeight: 500 }}>{sessionType.name}</p>
              </div>
              <div>
                <p style={{ color: 'var(--ink-4)', fontSize: '12px', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Date</p>
                <p style={{ color: 'var(--ink)', margin: 0 }}>{dateString}</p>
              </div>
              <div>
                <p style={{ color: 'var(--ink-4)', fontSize: '12px', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Time</p>
                <p style={{ color: 'var(--ink)', margin: 0 }}>{startTime} — {endTime}</p>
              </div>
              <div>
                <p style={{ color: 'var(--ink-4)', fontSize: '12px', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Duration</p>
                <p style={{ color: 'var(--ink)', margin: 0 }}>{sessionType.duration_minutes} minutes</p>
              </div>
              <div>
                <p style={{ color: 'var(--ink-4)', fontSize: '12px', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Mode</p>
                <p style={{ color: 'var(--ink)', margin: 0 }}>🎥 Google Meet</p>
              </div>
            </div>

            <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--cream-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--ink-4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total</span>
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', color: 'var(--ink)', fontWeight: 600 }}>
                {sessionType.price_inr > 0 ? `₹${sessionType.price_inr.toLocaleString()}` : 'Free'}
              </span>
            </div>
          </div>

        </div>
      </div>
    </main>
  )
}
