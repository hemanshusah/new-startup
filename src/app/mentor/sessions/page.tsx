'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useSearchParams } from 'next/navigation'
import { 
  respondToMeetingRequest, 
  sendMentorMeetingOffer, 
  toggleMentorAvailability 
} from '@/lib/mentor-dashboard-actions'
import { NegotiationTimeline } from '@/components/mentor-connect/NegotiationTimeline'

export default function MentorSessionsPage() {
  const searchParams = useSearchParams()
  const initialTab = searchParams.get('tab') as 'upcoming' | 'pending' | 'past' | 'proposals'
  const [activeTab, setActiveTab] = useState<'upcoming' | 'pending' | 'past' | 'proposals'>(initialTab || 'upcoming')
  const [loading, setLoading] = useState(true)
  const [sessions, setSessions] = useState<any[]>([])
  const [requests, setRequests] = useState<any[]>([])
  const [isAvailable, setIsAvailable] = useState(true)
  const [showPending, setShowPending] = useState(true)
  const [debugError, setDebugError] = useState<string | null>(null)
  const [expandedHistoryId, setExpandedHistoryId] = useState<string | null>(null)
  
  // Track actions and active counter-offer card ID
  const [actionId, setActionId] = useState<string | null>(null)
  const [counterOfferId, setCounterOfferId] = useState<string | null>(null)
  
  // Counter offer form states
  const [counterDate, setCounterDate] = useState('')
  const [counterTime, setCounterTime] = useState('')
  const [counterPrice, setCounterPrice] = useState(3000)

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
      .select('id, is_available')
      .eq('user_id', user.id)
      .single()

    if (mentor) {
      setIsAvailable(mentor.is_available)

      // Fetch sessions & meeting requests
      const [sessionsRes, requestsRes] = await Promise.all([
        supabase.from('sessions').select('*').eq('mentor_id', mentor.id).order('scheduled_start', { ascending: false }),
        supabase.from('meeting_requests').select('*').eq('mentor_id', mentor.id).order('created_at', { ascending: false })
      ])

      const sessionsData = sessionsRes.data || []
      const requestsData = requestsRes.data || []

      // Collect all unique founder IDs and session type IDs
      const founderIds = Array.from(new Set([
        ...sessionsData.map(s => s.founder_id),
        ...requestsData.map(r => r.founder_id)
      ]))
      const sessionTypeIds = Array.from(new Set([
        ...sessionsData.map(s => s.session_type_id),
        ...requestsData.map(r => r.session_type_id).filter(Boolean)
      ]))

      // Fetch profiles & session types in parallel
      const [profilesRes, typesRes] = await Promise.all([
        supabase.from('profiles').select('id, full_name, email, avatar_url, startup_name, startup_website, startup_description').in('id', founderIds),
        supabase.from('session_types').select('id, name').in('id', sessionTypeIds)
      ])

      const profileMap = new Map(profilesRes.data?.map(p => [p.id, p]))
      const typeMap = new Map(typesRes.data?.map(t => [t.id, t]))

      // Merge data
      const mergedSessions = sessionsData.map(session => ({
        ...session,
        founder: profileMap.get(session.founder_id),
        session_type: typeMap.get(session.session_type_id)
      }))

      const mergedRequests = requestsData.map(req => ({
        ...req,
        founder: profileMap.get(req.founder_id),
        session_type: typeMap.get(req.session_type_id)
      }))

      setSessions(mergedSessions)
      setRequests(mergedRequests)
    }
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleToggleAvailability = async () => {
    const nextState = !isAvailable
    setIsAvailable(nextState)
    const result = await toggleMentorAvailability(nextState)
    if (result.error) {
      alert(result.error)
      setIsAvailable(!nextState)
    }
  }

  const handleDecline = async (requestId: string) => {
    setActionId(requestId)
    const result = await respondToMeetingRequest(requestId, 'declined')
    setActionId(null)

    if (result.error) {
      alert(result.error)
    } else {
      await loadData()
    }
  }

  // Accepts Option 1 or Option 2 by sending it as a formal "offer" at the baseline rate
  const handleOfferSlot = async (req: any, optionNum: 1 | 2) => {
    setActionId(req.id)
    const startStr = optionNum === 1 ? req.proposed_start : req.proposed_start_2
    const endStr = optionNum === 1 ? req.proposed_end : req.proposed_end_2

    if (!startStr || !endStr) {
      alert('Error: Selected proposed slot timing is invalid.')
      setActionId(null)
      return
    }

    const result = await sendMentorMeetingOffer({
      requestId: req.id,
      offeredStart: startStr,
      offeredEnd: endStr,
      offeredAmountInr: req.amount_inr
    })

    setActionId(null)
    if (result.error) {
      alert(result.error)
    } else {
      alert('Offer sent to founder successfully!')
      await loadData()
    }
  }

  const handleCustomCounterOffer = async (req: any) => {
    if (!counterDate || !counterTime) {
      alert('Please select both a date and time for the counter-offer.')
      return
    }

    setActionId(req.id)
    const duration = req.session_type?.duration_minutes || 60
    const startDateTime = new Date(`${counterDate}T${counterTime}`)
    const endDateTime = new Date(startDateTime.getTime() + duration * 60000)

    const result = await sendMentorMeetingOffer({
      requestId: req.id,
      offeredStart: startDateTime.toISOString(),
      offeredEnd: endDateTime.toISOString(),
      offeredAmountInr: counterPrice
    })

    setActionId(null)
    if (result.error) {
      alert(result.error)
    } else {
      alert('Counter-offer proposed successfully!')
      setCounterOfferId(null)
      setCounterDate('')
      setCounterTime('')
      await loadData()
    }
  }

  const now = new Date()
  
  const upcomingSessions = sessions.filter(s => {
    return new Date(s.scheduled_start) > now && s.status === 'confirmed'
  })

  const pendingSessions = sessions.filter(s => {
    return s.status === 'pending_payment'
  })

  const pastSessions = sessions.filter(s => {
    const isPast = new Date(s.scheduled_start) <= now
    const isInactive = s.status === 'cancelled' || s.status === 'completed'
    return (isPast && s.status !== 'pending_payment') || isInactive
  })

  const pendingRequests = requests.filter(r => r.status === 'pending')
  const completedRequests = requests.filter(r => r.status !== 'pending')

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'var(--font-sans)', color: 'var(--ink-3)' }}>Loading sessions...</div>

  const SessionCard = ({ session }: { session: any }) => (
    <div style={{ background: 'var(--white)', padding: '24px', borderRadius: '16px', border: '1px solid var(--cream-border)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '14px', background: 'var(--cream)', border: '1px solid var(--cream-border)', overflow: 'hidden', flexShrink: 0 }}>
            {session.founder?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
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
      {/* Sleek Premium Availability Toggles Widget */}
      <div style={{
        background: 'var(--white)',
        border: '1px solid var(--cream-border)',
        borderRadius: '20px',
        padding: '24px',
        marginBottom: '32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)'
      }}>
        <div>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', color: 'var(--ink)', margin: '0 0 4px' }}>
            Directory Visibility
          </h3>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--ink-3)', margin: 0 }}>
            {isAvailable 
              ? '🟢 Active — You are visible in the mentor directory for bookings & custom requests.' 
              : '🔴 Offline — You are currently hidden from search results.'
            }
          </p>
        </div>
        <button
          onClick={handleToggleAvailability}
          style={{
            padding: '12px 28px',
            background: isAvailable ? 'var(--ink)' : 'transparent',
            border: `1px solid ${isAvailable ? 'var(--ink)' : 'var(--cream-border)'}`,
            color: isAvailable ? 'white' : 'var(--ink)',
            borderRadius: '100px',
            fontFamily: 'var(--font-sans)',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          {isAvailable ? 'Go Offline' : 'Set Active'}
        </button>
      </div>

      <div style={{ display: 'flex', gap: '32px', marginBottom: '32px', borderBottom: '1px solid var(--cream-border)', overflowX: 'auto' }}>
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
            cursor: 'pointer',
            whiteSpace: 'nowrap'
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
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            Pending Payment ({pendingSessions.length})
          </button>
        )}
        <button 
          onClick={() => setActiveTab('proposals')}
          style={{ 
            padding: '12px 0', 
            background: 'none', 
            border: 'none', 
            borderBottom: `2px solid ${activeTab === 'proposals' ? 'var(--accent)' : 'transparent'}`,
            color: activeTab === 'proposals' ? 'var(--ink)' : 'var(--ink-4)',
            fontFamily: 'var(--font-sans)',
            fontSize: '15px',
            fontWeight: activeTab === 'proposals' ? 600 : 500,
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          Proposals ({pendingRequests.length})
        </button>
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
            cursor: 'pointer',
            whiteSpace: 'nowrap'
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

        {activeTab === 'proposals' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {pendingRequests.length === 0 && completedRequests.length === 0 ? (
              <div style={{ padding: '60px 40px', textAlign: 'center', background: 'var(--white)', borderRadius: '24px', border: '1px dashed var(--cream-border)' }}>
                <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--ink-4)', margin: 0 }}>No custom meeting requests found.</p>
              </div>
            ) : (
              <>
                {pendingRequests.map(req => {
                  const reqDate1 = new Date(req.proposed_start)
                  const reqDate2 = req.proposed_start_2 ? new Date(req.proposed_start_2) : null
                  const isCountering = counterOfferId === req.id

                  return (
                    <div key={req.id} style={{ background: 'var(--white)', padding: '24px', borderRadius: '16px', border: '1px solid var(--cream-border)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', gap: '16px' }}>
                          <div style={{ width: '64px', height: '64px', borderRadius: '14px', background: 'var(--cream)', border: '1px solid var(--cream-border)', overflow: 'hidden', flexShrink: 0 }}>
                            {req.founder?.avatar_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={req.founder.avatar_url} alt={req.founder.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', color: 'var(--ink-4)', fontFamily: 'var(--font-serif)' }}>
                                {req.founder?.full_name?.charAt(0) || '?'}
                              </div>
                            )}
                          </div>
                          <div>
                            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', color: 'var(--ink)', margin: '0 0 4px' }}>
                              {req.founder?.full_name || 'Restricted Profile'}
                            </h3>
                            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--ink-3)', fontWeight: 600, margin: 0 }}>
                              {req.founder?.startup_name || 'Startup Name Locked'}
                            </p>
                          </div>
                        </div>
                        
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ display: 'inline-block', fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '100px', background: '#FFF9E6', color: '#856404', textTransform: 'uppercase', marginBottom: '8px' }}>
                            Awaiting Response
                          </span>
                          <p style={{ margin: 0, fontSize: '12px', color: 'var(--ink-4)' }}>
                            Created {new Date(req.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {/* Side by side info panels */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div style={{ padding: '20px', background: 'var(--cream)', borderRadius: '16px', border: '1px solid var(--cream-border)' }}>
                          <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ink-4)', textTransform: 'uppercase', margin: '0 0 12px', letterSpacing: '0.1em' }}>Proposed Topic & Pitch</p>
                          <p style={{ fontSize: '15px', color: 'var(--ink-2)', margin: 0, lineHeight: 1.6, fontStyle: 'italic' }}>
                            "{req.founder_brief}"
                          </p>
                        </div>
                        
                        <div style={{ padding: '20px', background: 'var(--white)', borderRadius: '16px', border: '1px solid var(--cream-border)', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '8px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '13px', color: 'var(--ink-4)' }}>Baseline Session:</span>
                            <span style={{ fontSize: '13px', fontWeight: 600 }}>{req.session_type?.name || 'Custom Session'}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '13px', color: 'var(--ink-4)' }}>Baseline Price:</span>
                            <span style={{ fontSize: '13px', fontWeight: 600 }}>₹{req.amount_inr.toLocaleString()}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '13px', color: 'var(--ink-4)' }}>Mode:</span>
                            <span style={{ fontSize: '13px', fontWeight: 600 }}>🎥 Google Meet</span>
                          </div>
                        </div>
                      </div>

                      {/* Display Slot Options beautifully */}
                      <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '20px', borderRadius: '16px' }}>
                        <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ink-4)', textTransform: 'uppercase', margin: '0 0 16px', letterSpacing: '0.1em' }}>Proposals Slot Choices</p>
                        <div style={{ display: 'grid', gridTemplateColumns: reqDate2 ? '1fr 1fr' : '1fr', gap: '16px' }}>
                          {/* Option 1 Option Card */}
                          <div style={{ padding: '16px', background: 'white', border: '1px solid #E2E8F0', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <p style={{ margin: '0 0 4px', fontSize: '11px', fontWeight: 600, color: 'var(--accent)', textTransform: 'uppercase' }}>Option 1</p>
                              <p style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>
                                {reqDate1.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </p>
                              <p style={{ margin: 0, fontSize: '13px', color: 'var(--ink-4)' }}>
                                {reqDate1.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                            <button
                              onClick={() => handleOfferSlot(req, 1)}
                              disabled={!!actionId}
                              style={{
                                padding: '8px 16px',
                                background: 'var(--ink)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '100px',
                                fontSize: '12px',
                                fontWeight: 600,
                                cursor: actionId ? 'wait' : 'pointer'
                              }}
                            >
                              Accept Option 1
                            </button>
                          </div>

                          {/* Option 2 Option Card (if present) */}
                          {reqDate2 && (
                            <div style={{ padding: '16px', background: 'white', border: '1px solid #E2E8F0', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div>
                                <p style={{ margin: '0 0 4px', fontSize: '11px', fontWeight: 600, color: 'var(--accent)', textTransform: 'uppercase' }}>Option 2</p>
                                <p style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>
                                  {reqDate2.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </p>
                                <p style={{ margin: 0, fontSize: '13px', color: 'var(--ink-4)' }}>
                                  {reqDate2.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                              <button
                                onClick={() => handleOfferSlot(req, 2)}
                                disabled={!!actionId}
                                style={{
                                  padding: '8px 16px',
                                  background: 'var(--ink)',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '100px',
                                  fontSize: '12px',
                                  fontWeight: 600,
                                  cursor: actionId ? 'wait' : 'pointer'
                                }}
                              >
                                Accept Option 2
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action buttons (Decline or open counter-offer drawer) */}
                      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '12px', borderTop: '1px solid var(--cream-border)' }}>
                        <button
                          onClick={() => handleDecline(req.id)}
                          disabled={!!actionId}
                          style={{
                            padding: '10px 24px',
                            background: 'transparent',
                            border: '1px solid #DC2626',
                            color: '#DC2626',
                            borderRadius: '100px',
                            fontFamily: 'var(--font-sans)',
                            fontSize: '13px',
                            fontWeight: 600,
                            cursor: actionId ? 'wait' : 'pointer'
                          }}
                        >
                          Decline Entirely
                        </button>
                        <button
                          onClick={() => {
                            if (isCountering) {
                              setCounterOfferId(null)
                            } else {
                              setCounterOfferId(req.id)
                              setCounterPrice(req.amount_inr)
                            }
                          }}
                          disabled={!!actionId}
                          style={{
                            padding: '10px 24px',
                            background: 'transparent',
                            border: '1px solid var(--ink)',
                            color: 'var(--ink)',
                            borderRadius: '100px',
                            fontFamily: 'var(--font-sans)',
                            fontSize: '13px',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          {isCountering ? 'Hide Counter-Offer Form' : 'Propose Counter-Offer'}
                        </button>
                      </div>

                      {/* Slide-open Counter-Offer form */}
                      {isCountering && (
                        <div style={{
                          background: '#F8FAFC',
                          border: '1px solid #E2E8F0',
                          padding: '24px',
                          borderRadius: '16px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '16px',
                          animation: 'slideDown 0.25s ease-out'
                        }}>
                          <span style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--ink)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Propose Counter-Offer Details
                          </span>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                            <div>
                              <label style={{ display: 'block', fontSize: '10px', fontWeight: 600, color: 'var(--ink-4)', textTransform: 'uppercase', marginBottom: '6px' }}>
                                Custom Proposed Date
                              </label>
                              <input
                                type="date"
                                required
                                min={new Date().toISOString().split('T')[0]}
                                value={counterDate}
                                onChange={(e) => setCounterDate(e.target.value)}
                                style={{
                                  width: '100%',
                                  padding: '10px 14px',
                                  borderRadius: '8px',
                                  border: '1px solid var(--cream-border)',
                                  background: 'white',
                                  fontSize: '13px',
                                  outline: 'none'
                                }}
                              />
                            </div>
                            <div>
                              <label style={{ display: 'block', fontSize: '10px', fontWeight: 600, color: 'var(--ink-4)', textTransform: 'uppercase', marginBottom: '6px' }}>
                                Custom Proposed Time
                              </label>
                              <input
                                type="time"
                                required
                                value={counterTime}
                                onChange={(e) => setCounterTime(e.target.value)}
                                style={{
                                  width: '100%',
                                  padding: '10px 14px',
                                  borderRadius: '8px',
                                  border: '1px solid var(--cream-border)',
                                  background: 'white',
                                  fontSize: '13px',
                                  outline: 'none'
                                }}
                              />
                            </div>
                            <div>
                              <label style={{ display: 'block', fontSize: '10px', fontWeight: 600, color: 'var(--ink-4)', textTransform: 'uppercase', marginBottom: '6px' }}>
                                Custom Proposed Price (INR)
                              </label>
                              <input
                                type="number"
                                required
                                min={0}
                                max={25000}
                                step={100}
                                value={counterPrice}
                                onChange={(e) => setCounterPrice(Number(e.target.value))}
                                style={{
                                  width: '100%',
                                  padding: '10px 14px',
                                  borderRadius: '8px',
                                  border: '1px solid var(--cream-border)',
                                  background: 'white',
                                  fontSize: '13px',
                                  outline: 'none'
                                }}
                              />
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <button
                              onClick={() => handleCustomCounterOffer(req)}
                              disabled={!!actionId}
                              style={{
                                padding: '10px 24px',
                                background: 'var(--ink)',
                                border: 'none',
                                color: 'white',
                                borderRadius: '100px',
                                fontSize: '13px',
                                fontWeight: 600,
                                cursor: actionId ? 'wait' : 'pointer'
                              }}
                            >
                              {actionId === req.id ? 'Submitting offer...' : 'Send Counter-Offer'}
                            </button>
                          </div>
                        </div>
                      )}
                      {/* Negotiation Timeline Toggle Button */}
                      {req.negotiation_timeline && req.negotiation_timeline.length > 0 && (
                        <>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px', borderTop: '1px solid var(--cream-border)', paddingTop: '12px' }}>
                            <button
                              onClick={() => setExpandedHistoryId(expandedHistoryId === req.id ? null : req.id)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--ink-3)',
                                fontFamily: 'var(--font-sans)',
                                fontSize: '13px',
                                fontWeight: 500,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              {expandedHistoryId === req.id ? 'Hide Discussion History ▴' : 'View Discussion History ▾'}
                            </button>
                          </div>
                          {expandedHistoryId === req.id && (
                            <NegotiationTimeline timeline={req.negotiation_timeline} />
                          )}
                        </>
                      )}
                    </div>
                  )

                })}

                {completedRequests.length > 0 && (
                  <div style={{ marginTop: '24px' }}>
                    <h4 style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 600, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>
                      Processed Proposals ({completedRequests.length})
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {completedRequests.map(req => {
                        const showHistory = expandedHistoryId === req.id
                        return (
                          <div key={req.id} style={{ background: 'var(--white)', padding: '20px 24px', borderRadius: '12px', border: '1px solid var(--cream-border)', display: 'flex', flexDirection: 'column', gap: '12px', opacity: 0.85 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div>
                                <p style={{ fontSize: '13px', color: 'var(--ink-4)', margin: '0 0 4px' }}>
                                  {new Date(req.proposed_start).toLocaleDateString()} • {req.session_type?.name || 'Custom Session'}
                                </p>
                                <h4 style={{ margin: 0, fontFamily: 'var(--font-sans)', fontSize: '16px', color: 'var(--ink)' }}>{req.founder?.full_name}</h4>
                                {req.status === 'offered' && (
                                  <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--accent)', fontWeight: 600 }}>
                                    Counter-offered for ₹{req.offered_amount_inr.toLocaleString()} on {new Date(req.offered_start).toLocaleDateString()} at {new Date(req.offered_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </p>
                                )}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                {req.negotiation_timeline && req.negotiation_timeline.length > 0 && (
                                  <button
                                    onClick={() => setExpandedHistoryId(showHistory ? null : req.id)}
                                    style={{
                                      background: 'none',
                                      border: 'none',
                                      color: 'var(--ink-3)',
                                      fontFamily: 'var(--font-sans)',
                                      fontSize: '12px',
                                      fontWeight: 500,
                                      cursor: 'pointer'
                                    }}
                                  >
                                    {showHistory ? 'Hide History ▴' : 'View History ▾'}
                                  </button>
                                )}
                                <span style={{
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  padding: '4px 12px',
                                  borderRadius: '100px',
                                  textTransform: 'uppercase',
                                  background: req.status === 'accepted' ? '#EDF5EA' : req.status === 'offered' ? '#FFF9E6' : '#FEF2F2',
                                  color: req.status === 'accepted' ? '#2A6620' : req.status === 'offered' ? '#856404' : '#991B1B'
                                }}>
                                  {req.status === 'offered' ? 'Offer Dispatched' : req.status}
                                </span>
                              </div>
                            </div>
                            {showHistory && req.negotiation_timeline && (
                              <NegotiationTimeline timeline={req.negotiation_timeline} />
                            )}
                          </div>
                        )
                      })}

                    </div>
                  </div>
                )}
              </>
            )}
          </div>
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
