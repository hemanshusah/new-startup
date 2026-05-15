'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useSearchParams } from 'next/navigation'

export default function MentorSessionsPage() {
  const searchParams = useSearchParams()
  const initialTab = searchParams.get('tab') as 'upcoming' | 'pending' | 'past'
  const [activeTab, setActiveTab] = useState<'upcoming' | 'pending' | 'past'>(initialTab || 'upcoming')
  const [loading, setLoading] = useState(true)
  const [sessions, setSessions] = useState<any[]>([])
  const [showPending, setShowPending] = useState(true)
  const [debugError, setDebugError] = useState<string | null>(null)

  const supabase = useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ), [])

  const loadData = useCallback(async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // 1. Fetch Admin Config for pending visibility
    const { data: config } = await supabase
      .from('site_config')
      .select('*')
      .limit(1)
      .maybeSingle()
    
    if (config) setShowPending(config.mentor_show_pending_sessions ?? true)

    // 2. Fetch Mentor Profile
    const { data: mentor } = await supabase
      .from('mentor_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (mentor) {
      // 1. Fetch sessions first (Simple query, no joins to avoid schema cache errors)
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('sessions')
        .select('*')
        .eq('mentor_id', mentor.id)
        .order('scheduled_start', { ascending: false })
      
      if (sessionsError) {
        console.error('Sessions fetch error:', sessionsError)
        setDebugError(sessionsError.message)
        setLoading(false)
        return
      }

      if (sessionsData && sessionsData.length > 0) {
        // 2. Collect unique founder IDs and session type IDs
        const founderIds = Array.from(new Set(sessionsData.map(s => s.founder_id)))
        const sessionTypeIds = Array.from(new Set(sessionsData.map(s => s.session_type_id)))

        // 3. Fetch founder profiles and session types in parallel
        const [profilesRes, typesRes] = await Promise.all([
          supabase.from('profiles').select('id, full_name, email, avatar_url, startup_name, startup_website, startup_description').in('id', founderIds),
          supabase.from('session_types').select('id, name').in('id', sessionTypeIds)
        ])

        // 4. Create lookup maps
        const profileMap = new Map(profilesRes.data?.map(p => [p.id, p]))
        const typeMap = new Map(typesRes.data?.map(t => [t.id, t]))

        // 5. Merge data manually
        const mergedSessions = sessionsData.map(session => ({
          ...session,
          founder: profileMap.get(session.founder_id),
          session_type: typeMap.get(session.session_type_id)
        }))

        setSessions(mergedSessions)
      } else {
        setSessions([])
      }
    }
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    loadData()
  }, [loadData])

  const now = new Date()
  
  const upcomingSessions = sessions.filter(s => {
    return new Date(s.scheduled_start) > now && s.status === 'confirmed'
  })

  const pendingSessions = sessions.filter(s => {
    // Show all pending sessions regardless of time
    return s.status === 'pending_payment'
  })

  const pastSessions = sessions.filter(s => {
    const isPast = new Date(s.scheduled_start) <= now
    const isInactive = s.status === 'cancelled' || s.status === 'completed'
    // If it's pending and past, it still stays in Pending tab for visibility
    return (isPast && s.status !== 'pending_payment') || isInactive
  })

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'var(--font-sans)', color: 'var(--ink-3)' }}>Loading sessions...</div>

  const SessionCard = ({ session }: { session: any }) => (
    <div style={{ background: 'var(--white)', padding: '24px', borderRadius: '16px', border: '1px solid var(--cream-border)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '14px', background: 'var(--cream)', border: '1px solid var(--cream-border)', overflow: 'hidden', flexShrink: 0 }}>
            {session.founder?.avatar_url ? (
              <img src={session.founder.avatar_url} alt={session.founder.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', color: 'var(--ink-4)', fontFamily: 'var(--font-serif)' }}>
                {session.founder?.full_name?.charAt(0) || '?'}
              </div>
            )}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', color: 'var(--ink)', margin: 0 }}>
                {session.founder?.full_name || 'Restricted Profile'}
              </h3>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {session.session_type?.name}
              </span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '15px', color: 'var(--ink)', fontWeight: 600, margin: 0 }}>
                {session.founder?.startup_name || 'Startup Name Locked'}
              </p>
              {session.founder?.startup_website && (
                <a 
                  href={session.founder.startup_website.startsWith('http') ? session.founder.startup_website : `https://${session.founder.startup_website}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ fontSize: '13px', color: 'var(--ink-4)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  {session.founder.startup_website.replace(/^https?:\/\/(www\.)?/, '')} ↗
                </a>
              )}
            </div>
          </div>
        </div>
        
        <div style={{ textAlign: 'right' }}>
          <span style={{ 
            display: 'inline-block',
            fontSize: '11px', 
            fontWeight: 700, 
            padding: '4px 10px', 
            borderRadius: '100px', 
            textTransform: 'uppercase',
            letterSpacing: '0.02em',
            background: session.status === 'confirmed' ? '#EDF5EA' : '#FFF9E6',
            color: session.status === 'confirmed' ? '#2A6620' : '#856404',
            marginBottom: '8px'
          }}>
            {session.status.replace('_', ' ')}
          </span>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--ink-3)', fontWeight: 500 }}>
            {new Date(session.scheduled_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--ink-4)' }}>
            {new Date(session.scheduled_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div style={{ padding: '20px', background: 'var(--cream)', borderRadius: '16px', border: '1px solid var(--cream-border)' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ink-4)', textTransform: 'uppercase', margin: '0 0 12px', letterSpacing: '0.1em' }}>Founder's Brief</p>
          <p style={{ fontSize: '15px', color: 'var(--ink-2)', margin: 0, lineHeight: 1.6, fontStyle: 'italic' }}>
            "{session.founder_brief || 'No brief provided'}"
          </p>
        </div>

        <div style={{ padding: '20px', background: 'var(--white)', borderRadius: '16px', border: '1px solid var(--cream-border)' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ink-4)', textTransform: 'uppercase', margin: '0 0 12px', letterSpacing: '0.1em' }}>About Startup</p>
          <p style={{ fontSize: '14px', color: 'var(--ink-3)', margin: 0, lineHeight: 1.6 }}>
            {session.founder?.startup_description || 'No description available for this startup profile yet.'}
          </p>
        </div>
      </div>

      {session.status === 'confirmed' && session.google_meet_link && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '8px', borderTop: '1px solid var(--cream-border)' }}>
          <a 
            href={session.google_meet_link} 
            target="_blank" 
            style={{ display: 'inline-block', padding: '12px 32px', background: 'var(--ink)', color: 'white', borderRadius: '100px', textDecoration: 'none', fontSize: '14px', fontWeight: 600, transition: 'all 0.2s ease' }}
          >
            Join Meeting
          </a>
        </div>
      )}
    </div>
  )

  return (
    <div>
      <div style={{ display: 'flex', gap: '32px', marginBottom: '32px', borderBottom: '1px solid var(--cream-border)' }}>
        <button 
          onClick={() => setActiveTab('upcoming')}
          style={{ 
            padding: '12px 0', 
            background: 'none', 
            border: 'none', 
            borderBottom: `2px solid ${activeTab === 'upcoming' ? 'var(--accent)' : 'transparent'}`,
            color: activeTab === 'upcoming' ? 'var(--ink)' : 'var(--ink-4)',
            fontFamily: 'var(--font-sans)',
            fontSize: '15px',
            fontWeight: activeTab === 'upcoming' ? 600 : 500,
            cursor: 'pointer'
          }}
        >
          Confirmed ({upcomingSessions.length})
        </button>
        {showPending && (
          <button 
            onClick={() => setActiveTab('pending')}
            style={{ 
              padding: '12px 0', 
              background: 'none', 
              border: 'none', 
              borderBottom: `2px solid ${activeTab === 'pending' ? 'var(--accent)' : 'transparent'}`,
              color: activeTab === 'pending' ? 'var(--ink)' : 'var(--ink-4)',
              fontFamily: 'var(--font-sans)',
              fontSize: '15px',
              fontWeight: activeTab === 'pending' ? 600 : 500,
              cursor: 'pointer'
            }}
          >
            Pending Payment ({pendingSessions.length})
          </button>
        )}
        <button 
          onClick={() => setActiveTab('past')}
          style={{ 
            padding: '12px 0', 
            background: 'none', 
            border: 'none', 
            borderBottom: `2px solid ${activeTab === 'past' ? 'var(--accent)' : 'transparent'}`,
            color: activeTab === 'past' ? 'var(--ink)' : 'var(--ink-4)',
            fontFamily: 'var(--font-sans)',
            fontSize: '15px',
            fontWeight: activeTab === 'past' ? 600 : 500,
            cursor: 'pointer'
          }}
        >
          Past Sessions
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {activeTab === 'upcoming' && (
          upcomingSessions.length === 0 ? (
            <div style={{ padding: '60px 40px', textAlign: 'center', background: 'var(--white)', borderRadius: '24px', border: '1px dashed var(--cream-border)' }}>
              <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--ink-4)', margin: 0 }}>No confirmed sessions found.</p>
            </div>
          ) : (
            upcomingSessions.map(s => <SessionCard key={s.id} session={s} />)
          )
        )}

        {activeTab === 'pending' && showPending && (
          pendingSessions.length === 0 ? (
            <div style={{ padding: '60px 40px', textAlign: 'center', background: 'var(--white)', borderRadius: '24px', border: '1px dashed var(--cream-border)' }}>
              <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--ink-4)', margin: 0 }}>No pending bookings found.</p>
            </div>
          ) : (
            pendingSessions.map(s => <SessionCard key={s.id} session={s} />)
          )
        )}

        {activeTab === 'past' && (
          pastSessions.length === 0 ? (
            <div style={{ padding: '60px 40px', textAlign: 'center', background: 'var(--white)', borderRadius: '24px', border: '1px dashed var(--cream-border)' }}>
              <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--ink-4)', margin: 0 }}>No past sessions found.</p>
            </div>
          ) : (
            pastSessions.map(s => (
              <div key={s.id} style={{ background: 'var(--white)', padding: '16px 24px', borderRadius: '12px', border: '1px solid var(--cream-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.7 }}>
                <div>
                  <p style={{ fontSize: '13px', color: 'var(--ink-4)', margin: '0 0 4px' }}>
                    {new Date(s.scheduled_start).toLocaleDateString()} • {s.session_type?.name}
                  </p>
                  <h4 style={{ margin: 0, fontFamily: 'var(--font-sans)', fontSize: '16px', color: 'var(--ink)' }}>{s.founder?.full_name}</h4>
                </div>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink-4)' }}>{s.status.toUpperCase()}</span>
              </div>
            ))
          )
        )}
      </div>

      <div style={{ marginTop: '80px', padding: '20px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '12px', color: '#64748B', fontFamily: 'monospace' }}>
        <p style={{ margin: '0 0 8px', fontWeight: 700, textTransform: 'uppercase' }}>🔧 Debug Info:</p>
        <p style={{ margin: '0 0 4px' }}>Sessions Array Length: {sessions.length}</p>
        <p style={{ margin: '0 0 4px' }}>Active Tab: {activeTab}</p>
        {debugError && <p style={{ margin: 0, color: '#DC2626' }}>Error: {debugError}</p>}
        {!debugError && sessions.length === 0 && <p style={{ margin: 0 }}>Query successful but returned 0 rows.</p>}
      </div>
    </div>
  )
}
