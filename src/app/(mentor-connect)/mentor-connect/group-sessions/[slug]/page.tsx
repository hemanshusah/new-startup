import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createServiceClient } from '@/lib/supabase/server'
import { getAuthenticatedUser } from '@/lib/auth-utils'
import { GroupSessionBookingButton } from '@/components/mentor-connect/GroupSessionBookingButton'
import Link from 'next/link'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = createServiceClient()
  const { data: session } = await supabase.from('group_sessions').select('title').eq('slug', slug).single()
  return {
    title: `${session?.title || 'Group Session'} | Mentor Connect`,
  }
}

export const dynamic = 'force-dynamic'

export default async function GroupSessionDetailPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = createServiceClient()
  const user = await getAuthenticatedUser()

  // Fetch session
  const { data: session } = await supabase
    .from('group_sessions')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!session) notFound()

  // Fetch mentor
  const { data: mentor } = await supabase
    .from('mentor_profiles')
    .select('id, display_name, avatar_url, headline, slug')
    .eq('id', session.mentor_id)
    .single()

  if (!mentor) notFound()

  // Check if logged in user already booked
  let alreadyBooked = false
  if (user) {
    const { data: booking } = await supabase
      .from('group_session_bookings')
      .select('id')
      .eq('group_session_id', session.id)
      .eq('founder_id', user.id)
      .maybeSingle()

    alreadyBooked = !!booking
  }

  const startDate = new Date(session.scheduled_start)
  const endDate = new Date(session.scheduled_end)
  const dateString = startDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  const startTime = startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  const endTime = endDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })

  const seatsLeft = (session.max_seats || 0) - (session.seats_booked || 0)
  const isFull = seatsLeft <= 0

  return (
    <main style={{ background: 'var(--cream)', minHeight: 'calc(100vh - 56px)', padding: '60px 24px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>

        <div style={{ marginBottom: '32px' }}>
          <Link href="/mentor-connect/group-sessions" style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--ink-4)', textDecoration: 'none' }}>
            ← Back to group sessions
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '32px', alignItems: 'flex-start' }}>

          {/* Left Column: Details */}
          <div style={{ background: 'var(--white)', border: '1px solid var(--cream-border)', borderRadius: '16px', padding: '32px' }}>
            {/* Topic Tags */}
            {session.topic_tags && session.topic_tags.length > 0 && (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
                {session.topic_tags.map((tag: string) => (
                  <span key={tag} style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    background: 'var(--cream)',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '12px',
                    color: 'var(--ink-3)',
                    fontWeight: 500
                  }}>
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '32px', color: 'var(--ink)', margin: '0 0 16px', lineHeight: 1.2 }}>
              {session.title}
            </h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
              {mentor.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={mentor.avatar_url} alt="" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--cream-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-serif)', fontSize: '16px', color: 'var(--ink-4)' }}>
                  {mentor.display_name.charAt(0)}
                </div>
              )}
              <div>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 600, color: 'var(--ink)', margin: 0 }}>
                  Hosted by {mentor.display_name}
                </p>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--ink-4)', margin: '2px 0 0' }}>
                  {mentor.headline}
                </p>
              </div>
            </div>

            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', color: 'var(--ink)', margin: '0 0 12px', borderTop: '1px solid var(--cream-border)', paddingTop: '24px' }}>
              About This Session
            </h2>
            <div style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '15px',
              color: 'var(--ink-2)',
              lineHeight: 1.7,
              whiteSpace: 'pre-wrap'
            }}>
              {session.description || 'No description provided.'}
            </div>
          </div>

          {/* Right Column: Checkout/Booking Summary Card */}
          <div style={{ background: 'var(--white)', border: '1px solid var(--cream-border)', borderRadius: '16px', padding: '24px', position: 'sticky', top: '80px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px', fontFamily: 'var(--font-sans)', fontSize: '14px' }}>
              <div>
                <p style={{ color: 'var(--ink-4)', fontSize: '11px', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Date</p>
                <p style={{ color: 'var(--ink)', margin: 0, fontWeight: 500 }}>{dateString}</p>
              </div>
              <div>
                <p style={{ color: 'var(--ink-4)', fontSize: '11px', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Time</p>
                <p style={{ color: 'var(--ink)', margin: 0, fontWeight: 500 }}>{startTime} — {endTime}</p>
              </div>
              <div>
                <p style={{ color: 'var(--ink-4)', fontSize: '11px', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Availability</p>
                <p style={{ color: seatsLeft > 0 ? '#166534' : '#991B1B', margin: 0, fontWeight: 600 }}>
                  {seatsLeft > 0 ? `${seatsLeft} of ${session.max_seats} seats remaining` : 'Waiting List Only'}
                </p>
              </div>
              <div>
                <p style={{ color: 'var(--ink-4)', fontSize: '11px', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Format</p>
                <p style={{ color: 'var(--ink)', margin: 0, fontWeight: 500 }}>🎥 Live interactive group session</p>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--cream-border)', paddingTop: '20px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--ink-4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Price</span>
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', color: 'var(--ink)', fontWeight: 600 }}>
                ₹{session.price_inr.toLocaleString()}
              </span>
            </div>

            {alreadyBooked ? (
              <div style={{
                background: '#EDF5EA',
                border: '1px solid #BBF7D0',
                borderRadius: '10px',
                padding: '16px',
                textAlign: 'center',
                fontFamily: 'var(--font-sans)',
                fontSize: '14px',
                color: '#166534',
                fontWeight: 500
              }}>
                ✓ You already booked a seat!
              </div>
            ) : (
              <GroupSessionBookingButton
                groupSessionId={session.id}
                priceInr={session.price_inr}
                isFull={isFull}
                isLoggedIn={!!user}
              />
            )}
          </div>

        </div>
      </div>
    </main>
  )
}
