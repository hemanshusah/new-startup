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
          <a href={`/mentor-connect/mentors/${slug}`} style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--ink-4)', textDecoration: 'none' }}>
            ← Back to profile
          </a>
        </div>

        <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
          
          {/* Left Column: Session Details */}
          <div style={{ flex: '1 1 300px', background: 'var(--white)', border: '1px solid var(--cream-border)', borderRadius: '16px', padding: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid var(--cream-border)' }}>
              {mentor.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={mentor.avatar_url} alt="" style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--cream-dark)' }} />
              )}
              <div>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--ink-4)', margin: '0 0 2px' }}>Booking a session with</p>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', color: 'var(--ink)', margin: 0 }}>{mentor.display_name}</h2>
              </div>
            </div>

            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', color: 'var(--ink)', margin: '0 0 16px' }}>
              {session.name}
            </h1>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px', fontFamily: 'var(--font-sans)', fontSize: '15px', color: 'var(--ink-3)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                ⏱ {session.duration_minutes} minutes
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                🎥 Google Meet
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                💳 {session.price_inr > 0 ? `₹${session.price_inr.toLocaleString()}` : 'Free'}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                🌍 Timezone: {mentor.timezone}
              </span>
            </div>

            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--ink-4)', lineHeight: 1.5, margin: 0 }}>
              {session.description}
            </p>
          </div>

          {/* Right Column: Slot Picker */}
          <div style={{ flex: '1 1 500px', background: 'var(--white)', border: '1px solid var(--cream-border)', borderRadius: '16px', padding: '32px' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', color: 'var(--ink)', margin: '0 0 24px' }}>
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
    </main>
  )
}
