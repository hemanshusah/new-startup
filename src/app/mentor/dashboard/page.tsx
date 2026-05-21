'use client'

import { useState, useEffect, useMemo } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import Link from 'next/link'
import { Calendar, Clock, DollarSign, CheckCircle2, ArrowRight, User, PlusCircle, CheckSquare } from 'lucide-react'

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

      // Fetch Admin Config for pending visibility
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

  if (loading) {
    return (
      <div style={{ padding: '60px 40px', textAlign: 'center', fontFamily: 'var(--font-sans)', color: 'var(--ink-3)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: '32px', animation: 'spin 1s linear infinite' }}>⏳</span>
        <span>Assembling your dashboard layout...</span>
        <style dangerouslySetInnerHTML={{ __html: '@keyframes spin { 100% { transform: rotate(360deg); } }' }} />
      </div>
    )
  }

  return (
    <div>
      {/* ── STATS ROW ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${showPending ? 4 : 3}, 1fr)`,
        gap: '20px',
        marginBottom: '40px'
      }} className="stats-grid">
        
        <Link href="/mentor/sessions?tab=upcoming" style={{ textDecoration: 'none' }}>
          <div className="premium-stat-card" style={{
            background: 'var(--white)',
            padding: '24px',
            borderRadius: 'var(--radius-lg, 16px)',
            border: '1px solid var(--cream-border)',
            transition: 'all 0.25s ease',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: '100%'
          }}>
            <div>
              <p style={{ margin: '0 0 8px', fontSize: '11px', fontWeight: 600, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-sans)' }}>Confirmed Sessions</p>
              <h3 style={{ margin: '0 0 4px', fontSize: '32px', fontFamily: 'var(--font-serif)', color: 'var(--ink)', fontWeight: 400 }}>{stats.confirmed}</h3>
            </div>
            <p style={{ margin: '12px 0 0', fontSize: '13px', color: 'var(--ink-3)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={13} color="var(--accent)" />
              Ready to call
            </p>
          </div>
        </Link>

        {showPending && (
          <Link href="/mentor/sessions?tab=pending" style={{ textDecoration: 'none' }}>
            <div className="premium-stat-card" style={{
              background: 'var(--white)',
              padding: '24px',
              borderRadius: 'var(--radius-lg, 16px)',
              border: '1px solid var(--cream-border)',
              transition: 'all 0.25s ease',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              height: '100%'
            }}>
              <div>
                <p style={{ margin: '0 0 8px', fontSize: '11px', fontWeight: 600, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-sans)' }}>Pending Payments</p>
                <h3 style={{ margin: '0 0 4px', fontSize: '32px', fontFamily: 'var(--font-serif)', color: 'var(--ink)', fontWeight: 400 }}>{stats.pending}</h3>
              </div>
              <p style={{ margin: '12px 0 0', fontSize: '13px', color: 'var(--ink-3)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={13} color="var(--accent)" />
                Booked by founders
              </p>
            </div>
          </Link>
        )}

        <div className="premium-stat-card animate-stat" style={{
          background: 'var(--white)',
          padding: '24px',
          borderRadius: 'var(--radius-lg, 16px)',
          border: '1px solid var(--cream-border)',
          transition: 'all 0.25s ease',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          height: '100%'
        }}>
          <div>
            <p style={{ margin: '0 0 8px', fontSize: '11px', fontWeight: 600, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-sans)' }}>Total Earnings</p>
            <h3 style={{ margin: '0 0 4px', fontSize: '32px', fontFamily: 'var(--font-serif)', color: 'var(--ink)', fontWeight: 400 }}>₹{stats.earnings.toLocaleString()}</h3>
          </div>
          <p style={{ margin: '12px 0 0', fontSize: '13px', color: 'var(--ink-3)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <DollarSign size={13} color="var(--accent)" />
            Total delivered
          </p>
        </div>

        <div className="premium-stat-card animate-stat" style={{
          background: 'var(--white)',
          padding: '24px',
          borderRadius: 'var(--radius-lg, 16px)',
          border: '1px solid var(--cream-border)',
          transition: 'all 0.25s ease',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          height: '100%'
        }}>
          <div>
            <p style={{ margin: '0 0 8px', fontSize: '11px', fontWeight: 600, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-sans)' }}>Completed Calls</p>
            <h3 style={{ margin: '0 0 4px', fontSize: '32px', fontFamily: 'var(--font-serif)', color: 'var(--ink)', fontWeight: 400 }}>{stats.completed}</h3>
          </div>
          <p style={{ margin: '12px 0 0', fontSize: '13px', color: 'var(--ink-3)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle2 size={13} color="var(--accent)" />
            Session history
          </p>
        </div>
      </div>

      {/* ── TWO COLUMN MAIN PANEL ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '32px' }} className="main-content-layout">
        
        {/* Left Column: Quick Actions & Navigation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <div style={{
            background: 'var(--white)',
            padding: '32px',
            borderRadius: 'var(--radius-lg, 16px)',
            border: '1px solid var(--cream-border)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.005)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
              <PlusCircle size={18} color="var(--accent)" />
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', margin: 0, fontWeight: 400 }}>Quick Actions</h3>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="actions-grid">
              <Link href="/mentor/availability" className="dashboard-action-btn" style={{
                padding: '20px',
                background: 'var(--bg)',
                borderRadius: 'var(--radius-lg, 12px)',
                textDecoration: 'none',
                color: 'var(--ink)',
                border: '1px solid var(--cream-border)',
                transition: 'all 0.2s ease',
                display: 'block'
              }}>
                <div style={{ fontSize: '22px', marginBottom: '12px' }}>📅</div>
                <p style={{ margin: 0, fontWeight: 600, fontSize: '14.5px', color: 'var(--ink)' }}>Weekly Hours</p>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--ink-3)', lineHeight: 1.4 }}>Manage and allocate calendar schedules</p>
              </Link>
              
              <Link href="/mentor/session-types" className="dashboard-action-btn" style={{
                padding: '20px',
                background: 'var(--bg)',
                borderRadius: 'var(--radius-lg, 12px)',
                textDecoration: 'none',
                color: 'var(--ink)',
                border: '1px solid var(--cream-border)',
                transition: 'all 0.2s ease',
                display: 'block'
              }}>
                <div style={{ fontSize: '22px', marginBottom: '12px' }}>🏷️</div>
                <p style={{ margin: 0, fontWeight: 600, fontSize: '14.5px', color: 'var(--ink)' }}>Session Types</p>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--ink-3)', lineHeight: 1.4 }}>Configure consultations & rates</p>
              </Link>
              
              <Link href="/mentor/sessions" className="dashboard-action-btn" style={{
                padding: '20px',
                background: 'var(--bg)',
                borderRadius: 'var(--radius-lg, 12px)',
                textDecoration: 'none',
                color: 'var(--ink)',
                border: '1px solid var(--cream-border)',
                transition: 'all 0.2s ease',
                display: 'block'
              }}>
                <div style={{ fontSize: '22px', marginBottom: '12px' }}>💬</div>
                <p style={{ margin: 0, fontWeight: 600, fontSize: '14.5px', color: 'var(--ink)' }}>View Sessions</p>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--ink-3)', lineHeight: 1.4 }}>Review upcoming custom agendas</p>
              </Link>
              
              <Link href="/mentor/profile" className="dashboard-action-btn" style={{
                padding: '20px',
                background: 'var(--bg)',
                borderRadius: 'var(--radius-lg, 12px)',
                textDecoration: 'none',
                color: 'var(--ink)',
                border: '1px solid var(--cream-border)',
                transition: 'all 0.2s ease',
                display: 'block'
              }}>
                <div style={{ fontSize: '22px', marginBottom: '12px' }}>👤</div>
                <p style={{ margin: 0, fontWeight: 600, fontSize: '14.5px', color: 'var(--ink)' }}>Edit Profile</p>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--ink-3)', lineHeight: 1.4 }}>Modify biography details</p>
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column: Sessions Overview & Progress */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          <div style={{
            background: 'var(--white)',
            padding: '32px',
            borderRadius: 'var(--radius-lg, 16px)',
            border: '1px solid var(--cream-border)',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.005)'
          }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', margin: 0, fontWeight: 400 }}>Session Overview</h3>
            
            <Link href="/mentor/sessions?tab=upcoming" className="overview-link-block" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'var(--bg)', borderRadius: 'var(--radius-lg, 12px)', border: '1px solid var(--cream-border)', textDecoration: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '18px' }}>📅</span>
                <div>
                  <p style={{ margin: 0, fontWeight: 600, color: 'var(--ink)', fontSize: '14.5px' }}>Confirmed Sessions</p>
                  <p style={{ margin: 0, fontSize: '12px', color: 'var(--ink-3)' }}>{stats.confirmed} scheduled</p>
                </div>
              </div>
              <span className="overview-arrow" style={{ fontSize: '13px', color: 'var(--accent)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '2px', transition: 'all 0.15s ease' }}>
                View All <ArrowRight size={13} className="arrow-icon" style={{ transition: 'transform 0.15s ease' }} />
              </span>
            </Link>

            {showPending && (
              <Link href="/mentor/sessions?tab=pending" className="overview-link-block" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'var(--bg)', borderRadius: 'var(--radius-lg, 12px)', border: '1px solid var(--cream-border)', textDecoration: 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '18px' }}>⏳</span>
                  <div>
                    <p style={{ margin: 0, fontWeight: 600, color: 'var(--ink)', fontSize: '14.5px' }}>Pending Payment</p>
                    <p style={{ margin: 0, fontSize: '12px', color: 'var(--ink-3)' }}>{stats.pending} awaiting confirmation</p>
                  </div>
                </div>
                <span className="overview-arrow" style={{ fontSize: '13px', color: 'var(--accent)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '2px', transition: 'all 0.15s ease' }}>
                  View All <ArrowRight size={13} className="arrow-icon" style={{ transition: 'transform 0.15s ease' }} />
                </span>
              </Link>
            )}
          </div>

          <div style={{
            background: 'var(--white)',
            padding: '32px',
            borderRadius: 'var(--radius-lg, 16px)',
            border: '1px solid var(--cream-border)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.005)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <CheckSquare size={18} color="var(--accent)" />
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', margin: 0, fontWeight: 400 }}>Profile Completeness</h3>
            </div>
            
            <div style={{ height: '6px', background: 'var(--bg)', borderRadius: '100px', marginBottom: '20px', overflow: 'hidden', border: '1px solid var(--cream-border)' }}>
              <div style={{ height: '100%', width: mentor?.google_access_token ? '100%' : '66%', background: 'var(--accent)', borderRadius: '100px', transition: 'width 0.4s ease' }} />
            </div>
            
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', fontSize: '13.5px', color: 'var(--ink-2)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ color: mentor?.avatar_url ? '#2A6620' : 'var(--ink-4)', display: 'flex', alignItems: 'center' }}>
                  <CheckCircle2 size={16} fill={mentor?.avatar_url ? '#EDF5EA' : 'none'} />
                </span>
                <span style={{ textDecoration: mentor?.avatar_url ? 'line-through' : 'none', color: mentor?.avatar_url ? 'var(--ink-4)' : 'var(--ink-2)' }}>Profile photo updated</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ color: '#2A6620', display: 'flex', alignItems: 'center' }}>
                  <CheckCircle2 size={16} fill="#EDF5EA" />
                </span>
                <span style={{ textDecoration: 'line-through', color: 'var(--ink-4)' }}>Availability hours set</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ color: mentor?.google_access_token ? '#2A6620' : 'var(--ink-4)', display: 'flex', alignItems: 'center' }}>
                  <CheckCircle2 size={16} fill={mentor?.google_access_token ? '#EDF5EA' : 'none'} />
                </span>
                <span style={{ textDecoration: mentor?.google_access_token ? 'line-through' : 'none', color: mentor?.google_access_token ? 'var(--ink-4)' : 'var(--ink-2)' }}>Google Calendar connected</span>
              </li>
            </ul>
          </div>
          
        </div>

      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .premium-stat-card:hover {
          border-color: var(--accent) !important;
          box-shadow: 0 12px 30px rgba(184, 70, 10, 0.05);
          transform: translateY(-2px);
        }
        .dashboard-action-btn:hover {
          border-color: var(--accent) !important;
          background: var(--white) !important;
          box-shadow: 0 8px 24px rgba(184, 70, 10, 0.04);
          transform: translateY(-2px);
        }
        .overview-link-block:hover {
          border-color: var(--accent) !important;
          background: var(--white) !important;
          box-shadow: 0 8px 24px rgba(184, 70, 10, 0.03);
        }
        .overview-link-block:hover .overview-arrow {
          color: var(--ink) !important;
        }
        .overview-link-block:hover .arrow-icon {
          transform: translateX(3px);
        }
        @media (max-width: 860px) {
          .stats-grid {
            grid-template-columns: 1fr 1fr !important;
          }
          .main-content-layout {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 580px) {
          .stats-grid {
            grid-template-columns: 1fr !important;
          }
          .actions-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}} />
    </div>
  )
}
