import { createServiceClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Group Office Hours | Mentor Connect',
  description: 'Join group sessions with verified mentors. Learn alongside other founders at affordable prices.',
}

export const dynamic = 'force-dynamic'

export default async function GroupSessionsDirectoryPage() {
  const supabase = createServiceClient()

  // Fetch upcoming group sessions
  const { data: sessions } = await supabase
    .from('group_sessions')
    .select('*')
    .eq('status', 'scheduled')
    .gte('scheduled_start', new Date().toISOString())
    .order('scheduled_start', { ascending: true })

  // Fetch mentor details
  const mentorIds = [...new Set(sessions?.map(s => s.mentor_id) || [])]
  const { data: mentors } = mentorIds.length > 0
    ? await supabase.from('mentor_profiles').select('id, display_name, avatar_url, slug').in('id', mentorIds)
    : { data: [] }

  const mentorMap = Object.fromEntries((mentors || []).map(m => [m.id, m]))

  return (
    <main style={{ background: 'var(--cream)', minHeight: 'calc(100vh - 56px)', padding: '60px 24px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>

        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '36px', color: 'var(--ink)', margin: '0 0 12px' }}>
            Group Office Hours
          </h1>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '16px', color: 'var(--ink-3)', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
            Join live group sessions with verified mentors. Learn alongside other founders at a fraction of the cost of 1:1 sessions.
          </p>
        </div>

        {!sessions || sessions.length === 0 ? (
          <div style={{ background: 'var(--white)', border: '1px solid var(--cream-border)', borderRadius: '16px', padding: '64px 40px', textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '16px', color: 'var(--ink-4)', margin: '0 0 20px' }}>
              No upcoming group sessions at the moment. Check back soon!
            </p>
            <Link
              href="/mentor-connect/mentors"
              style={{
                padding: '12px 24px',
                background: 'var(--ink)',
                color: 'var(--white)',
                borderRadius: '8px',
                fontFamily: 'var(--font-sans)',
                fontSize: '15px',
                fontWeight: 500,
                textDecoration: 'none'
              }}
            >
              Browse 1:1 Mentors Instead
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
            {sessions.map(s => {
              const mentor = mentorMap[s.mentor_id]
              const seatsLeft = (s.max_seats || 0) - (s.seats_booked || 0)

              return (
                <Link
                  key={s.id}
                  href={`/mentor-connect/group-sessions/${s.slug}`}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div style={{
                    background: 'var(--white)',
                    border: '1px solid var(--cream-border)',
                    borderRadius: '16px',
                    padding: '28px',
                    transition: 'box-shadow 0.2s ease, transform 0.2s ease',
                    cursor: 'pointer'
                  }}>
                    {/* Topic Tags */}
                    {s.topic_tags && s.topic_tags.length > 0 && (
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
                        {s.topic_tags.slice(0, 3).map((tag: string) => (
                          <span key={tag} style={{
                            padding: '3px 8px',
                            borderRadius: '4px',
                            background: 'var(--cream)',
                            fontFamily: 'var(--font-sans)',
                            fontSize: '11px',
                            color: 'var(--ink-3)',
                            fontWeight: 500
                          }}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', color: 'var(--ink)', margin: '0 0 8px' }}>
                      {s.title}
                    </h3>

                    {s.description && (
                      <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--ink-4)', margin: '0 0 16px', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {s.description}
                      </p>
                    )}

                    {/* Mentor Info */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', paddingTop: '16px', borderTop: '1px solid var(--cream-border)' }}>
                      {mentor?.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={mentor.avatar_url} alt="" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--cream-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-serif)', fontSize: '14px', color: 'var(--ink-4)' }}>
                          {mentor?.display_name?.charAt(0) || 'M'}
                        </div>
                      )}
                      <span style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 500, color: 'var(--ink)' }}>
                        {mentor?.display_name || 'Mentor'}
                      </span>
                    </div>

                    {/* Meta Info */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'var(--font-sans)', fontSize: '13px' }}>
                      <div style={{ color: 'var(--ink-3)' }}>
                        <div>{new Date(s.scheduled_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                        <div>{new Date(s.scheduled_start).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 600, color: seatsLeft > 0 ? '#166534' : '#991B1B' }}>
                          {seatsLeft > 0 ? `${seatsLeft} seats left` : 'Full'}
                        </div>
                        <div style={{ fontWeight: 600, color: 'var(--ink)' }}>
                          {s.price_inr > 0 ? `₹${s.price_inr.toLocaleString()}` : 'Free'}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
