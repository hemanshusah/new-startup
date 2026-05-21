'use client'

import { useState, useEffect, useMemo } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import Link from 'next/link'

export default function MentorGroupSessionsPage() {
  const [loading, setLoading] = useState(true)
  const [sessions, setSessions] = useState<any[]>([])

  const supabase = useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ), [])

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: mentor } = await supabase
        .from('mentor_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (mentor) {
        const { data } = await supabase
          .from('group_sessions')
          .select('*')
          .eq('mentor_id', mentor.id)
          .order('scheduled_start', { ascending: false })

        if (data) setSessions(data)
      }
      setLoading(false)
    }
    loadData()
  }, [supabase])

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'var(--font-sans)', color: 'var(--ink-3)' }}>Loading group sessions...</div>

  const statusColors: Record<string, { bg: string; text: string }> = {
    scheduled: { bg: '#EDF5EA', text: '#166534' },
    completed: { bg: 'var(--cream)', text: 'var(--ink-3)' },
    cancelled: { bg: '#FEF2F2', text: '#991B1B' },
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', margin: '0 0 4px', color: 'var(--ink)' }}>Group Office Hours</h1>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--ink-4)', margin: 0 }}>Create and manage your group sessions.</p>
        </div>
        <Link
          href="/mentor/group-sessions/new"
          style={{
            padding: '10px 20px',
            background: 'var(--ink)',
            color: 'var(--white)',
            borderRadius: '8px',
            fontFamily: 'var(--font-sans)',
            fontSize: '14px',
            fontWeight: 500,
            textDecoration: 'none'
          }}
        >
          + Create New
        </Link>
      </div>

      {sessions.length === 0 ? (
        <div style={{ background: 'var(--white)', border: '1px solid var(--cream-border)', borderRadius: '16px', padding: '48px', textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '15px', color: 'var(--ink-4)', margin: '0 0 16px' }}>
            You haven&apos;t created any group sessions yet.
          </p>
          <Link
            href="/mentor/group-sessions/new"
            style={{
              padding: '10px 20px',
              background: 'var(--ink)',
              color: 'var(--white)',
              borderRadius: '8px',
              fontFamily: 'var(--font-sans)',
              fontSize: '14px',
              fontWeight: 500,
              textDecoration: 'none'
            }}
          >
            Create Your First Group Session
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {sessions.map(s => {
            const sc = statusColors[s.status] || { bg: 'var(--cream)', text: 'var(--ink-3)' }
            return (
              <div key={s.id} style={{ background: 'var(--white)', border: '1px solid var(--cream-border)', borderRadius: '12px', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', color: 'var(--ink)', margin: '0 0 4px' }}>{s.title}</h3>
                    <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--ink-4)', margin: 0 }}>
                      {new Date(s.scheduled_start).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })} at{' '}
                      {new Date(s.scheduled_start).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                    </p>
                  </div>
                  <span style={{ padding: '4px 10px', borderRadius: '6px', background: sc.bg, color: sc.text, fontFamily: 'var(--font-sans)', fontSize: '11px', fontWeight: 600 }}>
                    {s.status}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '24px', fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--ink-3)' }}>
                  <span>🎟 {s.seats_booked || 0}/{s.max_seats} seats</span>
                  <span>💰 {s.price_inr > 0 ? `₹${s.price_inr.toLocaleString()}` : 'Free'}</span>
                  {s.google_meet_link && <a href={s.google_meet_link} target="_blank" style={{ color: 'var(--accent)' }}>🎥 Meet Link ↗</a>}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
