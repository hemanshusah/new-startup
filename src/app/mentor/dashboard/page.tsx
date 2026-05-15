'use client'

import { useState, useEffect, useMemo } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import Link from 'next/link'

export default function MentorDashboardPage() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ confirmed: 0, pending: 0, earnings: 0, completed: 0 })
  const [mentor, setMentor] = useState<any>(null)
  const [showPending, setShowPending] = useState(true)

  const supabase = useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ), [])

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // 1. Fetch Admin Config for pending visibility
      const { data: config } = await supabase
        .from('site_config')
        .select('*')
        .limit(1)
        .maybeSingle()
      
      const canShowPending = config?.mentor_show_pending_sessions ?? true
      setShowPending(canShowPending)

      const { data: mentorData } = await supabase
        .from('mentor_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (mentorData) {
        setMentor(mentorData)
        
        const { data: sessions } = await supabase
          .from('sessions')
          .select('status, amount_inr')
          .eq('mentor_id', mentorData.id)

        if (sessions) {
          const confirmed = sessions.filter(s => s.status === 'confirmed').length
          const pending = canShowPending ? sessions.filter(s => s.status === 'pending_payment').length : 0
          const completed = sessions.filter(s => s.status === 'completed').length
          const earnings = sessions
            .filter(s => s.status === 'completed')
            .reduce((acc, s) => acc + (s.amount_inr || 0), 0)
          
          setStats({ confirmed, pending, completed, earnings })
        }
      }
      setLoading(false)
    }
    loadData()
  }, [supabase])

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'var(--font-sans)', color: 'var(--ink-3)' }}>Loading dashboard...</div>

  const StatCard = ({ label, value, subtext }: { label: string, value: string | number, subtext: string }) => (
    <div style={{ background: 'var(--white)', padding: '24px', borderRadius: '16px', border: '1px solid var(--cream-border)' }}>
      <p style={{ margin: '0 0 8px', fontSize: '13px', fontWeight: 600, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
      <h3 style={{ margin: '0 0 4px', fontSize: '32px', fontFamily: 'var(--font-serif)', color: 'var(--ink)' }}>{value}</h3>
      <p style={{ margin: 0, fontSize: '14px', color: 'var(--ink-3)' }}>{subtext}</p>
    </div>
  )

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${showPending ? 4 : 3}, 1fr)`, gap: '20px', marginBottom: '40px' }}>
        <Link href="/mentor/sessions?tab=upcoming" style={{ textDecoration: 'none' }}>
          <StatCard label="Confirmed" value={stats.confirmed} subtext="Ready to call" />
        </Link>
        {showPending && (
          <Link href="/mentor/sessions?tab=pending" style={{ textDecoration: 'none' }}>
            <StatCard label="Pending Payment" value={stats.pending} subtext="Booked by founders" />
          </Link>
        )}
        <StatCard label="Total Earnings" value={`₹${stats.earnings.toLocaleString()}`} subtext="Total delivered" />
        <StatCard label="Completed" value={stats.completed} subtext="Session history" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '32px' }}>
        <div style={{ background: 'var(--white)', padding: '32px', borderRadius: '16px', border: '1px solid var(--cream-border)' }}>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', margin: '0 0 24px' }}>Quick Actions</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Link href="/mentor/availability" style={{ padding: '20px', background: 'var(--cream)', borderRadius: '12px', textDecoration: 'none', color: 'var(--ink)', transition: 'transform 0.2s', display: 'block' }}>
              <div style={{ fontSize: '24px', marginBottom: '12px' }}>📅</div>
              <p style={{ margin: 0, fontWeight: 600, fontSize: '15px' }}>Weekly Hours</p>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--ink-3)' }}>Update availability</p>
            </Link>
            <Link href="/mentor/session-types" style={{ padding: '20px', background: 'var(--cream)', borderRadius: '12px', textDecoration: 'none', color: 'var(--ink)', transition: 'transform 0.2s', display: 'block' }}>
              <div style={{ fontSize: '24px', marginBottom: '12px' }}>🏷️</div>
              <p style={{ margin: 0, fontWeight: 600, fontSize: '15px' }}>Session Types</p>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--ink-3)' }}>Manage prices & types</p>
            </Link>
            <Link href="/mentor/sessions" style={{ padding: '20px', background: 'var(--cream)', borderRadius: '12px', textDecoration: 'none', color: 'var(--ink)', transition: 'transform 0.2s', display: 'block' }}>
              <div style={{ fontSize: '24px', marginBottom: '12px' }}>💬</div>
              <p style={{ margin: 0, fontWeight: 600, fontSize: '15px' }}>View Sessions</p>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--ink-3)' }}>Manage upcoming calls</p>
            </Link>
            <Link href="/mentor/profile" style={{ padding: '20px', background: 'var(--cream)', borderRadius: '12px', textDecoration: 'none', color: 'var(--ink)', transition: 'transform 0.2s', display: 'block' }}>
              <div style={{ fontSize: '24px', marginBottom: '12px' }}>👤</div>
              <p style={{ margin: 0, fontWeight: 600, fontSize: '15px' }}>Edit Profile</p>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--ink-3)' }}>Update bio & headline</p>
            </Link>
          </div>
        </div>

        <div style={{ background: 'var(--white)', padding: '32px', borderRadius: '16px', border: '1px solid var(--cream-border)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', margin: 0 }}>Session Overview</h3>
          
          <Link href="/mentor/sessions?tab=upcoming" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'var(--cream)', borderRadius: '12px', textDecoration: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '20px' }}>📅</span>
              <div>
                <p style={{ margin: 0, fontWeight: 600, color: 'var(--ink)', fontSize: '15px' }}>Confirmed Sessions</p>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--ink-3)' }}>{stats.confirmed} scheduled</p>
              </div>
            </div>
            <span style={{ fontSize: '14px', color: 'var(--accent)', fontWeight: 600 }}>View All →</span>
          </Link>

          {showPending && (
            <Link href="/mentor/sessions?tab=pending" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'var(--cream)', borderRadius: '12px', textDecoration: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '20px' }}>⏳</span>
                <div>
                  <p style={{ margin: 0, fontWeight: 600, color: 'var(--ink)', fontSize: '15px' }}>Pending Payment</p>
                  <p style={{ margin: 0, fontSize: '12px', color: 'var(--ink-3)' }}>{stats.pending} awaiting confirmation</p>
                </div>
              </div>
              <span style={{ fontSize: '14px', color: 'var(--accent)', fontWeight: 600 }}>View All →</span>
            </Link>
          )}
        </div>

        <div style={{ background: 'var(--white)', padding: '32px', borderRadius: '16px', border: '1px solid var(--cream-border)' }}>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', margin: '0 0 24px' }}>Profile Completion</h3>
          <div style={{ height: '8px', background: 'var(--cream)', borderRadius: '4px', marginBottom: '16px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: mentor?.google_access_token ? '100%' : '60%', background: 'var(--accent)' }} />
          </div>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', fontSize: '14px', color: 'var(--ink-2)' }}>
            <li style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {mentor?.avatar_url ? '✅' : '⭕️'} Profile Picture Added
            </li>
            <li style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              ✅ Weekly Hours Set
            </li>
            <li style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {mentor?.google_access_token ? '✅' : '⭕️'} Google Calendar Connected
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
