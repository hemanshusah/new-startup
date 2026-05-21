import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createServiceClient } from '@/lib/supabase/server'
import { SlotPickerClient } from '@/components/mentor-connect/SlotPickerClient'
import { generateAvailableSlots } from '@/lib/slot-generator'

interface PageProps {
  params: Promise<{ slug: string; sessionId: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, sessionId } = await params
  const supabase = createServiceClient()
  
  const { data: mentor } = await supabase.from('mentor_profiles').select('display_name').eq('slug', slug).single()
  const { data: session } = await supabase.from('session_types').select('name').eq('id', sessionId).single()

  if (!mentor || !session) return { title: 'Book Session | Mentor Connect' }

  return {
    title: `Book ${session.name} with ${mentor.display_name} | Mentor Connect`,
  }
}

export const dynamic = 'force-dynamic'

export default async function BookSessionPage({ params }: PageProps) {
  const { slug, sessionId } = await params
  const supabase = createServiceClient()

  // 1. Fetch Mentor and Session Type
  const { data: mentor } = await supabase
    .from('mentor_profiles')
    .select('id, display_name, avatar_url, timezone')
    .eq('slug', slug)
    .single()

  if (!mentor) notFound()

  const { data: session } = await supabase
    .from('session_types')
    .select('id, name, duration_minutes, price_inr, description')
    .eq('id', sessionId)
    .eq('mentor_id', mentor.id)
    .single()

  if (!session) notFound()

  // 2. Generate Available Slots based on mentor's rules and Google Calendar
  const availableSlots = await generateAvailableSlots(mentor.id, session.duration_minutes)

  return (
    <main style={{ background: 'var(--cream)', minHeight: 'calc(100vh - 56px)', padding: '60px 24px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        <div style={{ marginBottom: '32px' }}>
          <a href={`/mentor-connect/mentors/${slug}`} style={{ fontFamily: 'var(--font-sans)', fontSize: '14.5px', color: 'var(--accent)', textDecoration: 'none', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }} className="back-link-profile">
            ← Back to profile
          </a>
        </div>

        <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
          
          {/* Left Column: Session Details */}
          <div style={{ flex: '1 1 340px', background: 'var(--white)', border: '1px solid var(--cream-border)', borderRadius: '16px', padding: '36px', boxShadow: '0 12px 32px rgba(28,26,22,0.015)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid var(--cream-border)' }}>
              {mentor.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={mentor.avatar_url} alt="" style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--cream-border)' }} />
              ) : (
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--cream-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-serif)', fontSize: '20px', color: 'var(--ink-4)' }}>
                  {mentor.display_name.charAt(0)}
                </div>
              )}
              <div>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--ink-4)', margin: '0 0 2px' }}>Booking a session with</p>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', color: 'var(--ink)', fontWeight: 400, margin: 0 }}>{mentor.display_name}</h2>
              </div>
            </div>

            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '26px', color: 'var(--ink)', margin: '0 0 16px', fontWeight: 400 }}>
              {session.name}
            </h1>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '28px', paddingBottom: '24px', borderBottom: '1px solid var(--cream-border)', fontFamily: 'var(--font-sans)', fontSize: '14.5px', color: 'var(--ink-3)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                ⏱ <span style={{ fontWeight: 600 }}>{session.duration_minutes} minutes</span> duration
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                🎥 Delivered via <span style={{ fontWeight: 600 }}>Google Meet</span>
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                💳 Price: <span style={{ fontWeight: 600, color: 'var(--accent)' }}>{session.price_inr > 0 ? `₹${session.price_inr.toLocaleString()}` : 'Free'}</span>
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                🌍 Mentor Timezone: <span style={{ fontWeight: 600 }}>{mentor.timezone}</span>
              </span>
            </div>

            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13.5px', color: 'var(--ink-3)', lineHeight: 1.6, margin: 0 }}>
              {session.description}
            </p>
          </div>

          {/* Right Column: Slot Picker */}
          <div style={{ flex: '1 1 500px', background: 'var(--white)', border: '1px solid var(--cream-border)', borderRadius: '16px', padding: '36px', boxShadow: '0 12px 32px rgba(28,26,22,0.015)' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', color: 'var(--ink)', margin: '0 0 24px', fontWeight: 400 }}>
              Select a Date & Time
            </h2>
            <SlotPickerClient 
              groupedSlots={availableSlots} 
              mentorSlug={slug}
              sessionId={session.id}
            />
          </div>

        </div>
      </div>
      <style dangerouslySetInnerHTML={{
        __html: `
        .back-link-profile:hover {
          text-decoration: underline !important;
        }
      `}} />
    </main>
  )
}
