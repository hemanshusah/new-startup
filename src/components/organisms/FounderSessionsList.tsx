'use client'

import React, { useState, useMemo } from 'react'
import { FounderSessionCard } from './FounderSessionCard'
import { acceptFounderMeetingOffer } from '@/lib/mentor-dashboard-actions'
import { useRazorpayCheckout } from '@/lib/hooks/useRazorpayCheckout'
import { PaymentLoadingOverlay } from './PaymentLoadingOverlay'
import { NegotiationTimeline } from '@/components/molecules/NegotiationTimeline'

interface FounderSessionsListProps {
  initialSessions: any[]
  mentorMap: Record<string, any>
  sessionTypeMap: Record<string, any>
  reviewedSessionIds: string[]
  initialRequests?: any[]
}

export function FounderSessionsList({
  initialSessions,
  mentorMap,
  sessionTypeMap,
  reviewedSessionIds,
  initialRequests = []
}: FounderSessionsListProps) {
  // Navigation tabs: Booked Sessions, Pending Sessions, Custom Proposals
  const [activeTab, setActiveTab] = useState<'booked' | 'pending' | 'proposals'>('booked')
  const [sortBy, setSortBy] = useState<'closest' | 'latest' | 'furthest'>('closest')
  const [searchQuery, setSearchQuery] = useState('')
  const [submittingId, setSubmittingId] = useState<string | null>(null)
  const [expandedHistoryId, setExpandedHistoryId] = useState<string | null>(null)

  const now = useMemo(() => new Date(), [])
  const reviewedSet = useMemo(() => new Set(reviewedSessionIds), [reviewedSessionIds])

  // Custom checkout hook
  const checkout = useRazorpayCheckout()

  // Filter and sort standard sessions dynamically
  const processedSessions = useMemo(() => {
    let list = [...initialSessions]

    // 1. Apply Search Query (Mentor name or session type name)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter((s) => {
        const mentorName = mentorMap[s.mentor_id]?.display_name?.toLowerCase() || ''
        const sessionTypeName = sessionTypeMap[s.session_type_id]?.name?.toLowerCase() || ''
        return mentorName.includes(q) || sessionTypeName.includes(q)
      })
    }

    // 2. Apply Sorting
    list.sort((a, b) => {
      const dateA = new Date(a.scheduled_start).getTime()
      const dateB = new Date(b.scheduled_start).getTime()

      if (sortBy === 'closest') {
        const diffA = dateA - now.getTime()
        const diffB = dateB - now.getTime()

        if (diffA >= 0 && diffB < 0) return -1
        if (diffB >= 0 && diffA < 0) return 1

        if (diffA >= 0 && diffB >= 0) return diffA - diffB
        return dateB - dateA
      }

      if (sortBy === 'latest') {
        const createdA = new Date(a.created_at || a.scheduled_start).getTime()
        const createdB = new Date(b.created_at || b.scheduled_start).getTime()
        return createdB - createdA
      }

      if (sortBy === 'furthest') {
        return dateB - dateA
      }

      return 0
    })

    return list
  }, [initialSessions, searchQuery, sortBy, now, mentorMap, sessionTypeMap])

  // Booked sessions: strictly confirmed or completed sessions
  const bookedSessions = useMemo(() => {
    return processedSessions.filter((s) => s.status === 'confirmed' || s.status === 'completed')
  }, [processedSessions])

  // Pending sessions: strictly pending_payment sessions
  const pendingSessions = useMemo(() => {
    return processedSessions.filter((s) => s.status === 'pending_payment')
  }, [processedSessions])

  const handleAcceptOffer = async (requestId: string) => {
    if (!confirm('Are you sure you want to accept this meeting offer? This will launch standard checkout.')) return
    setSubmittingId(requestId)
    checkout.setError(null)

    const result = (await acceptFounderMeetingOffer(requestId)) as any
    setSubmittingId(null)

    if (result.error) {
      alert(result.error)
      return
    }

    // If counter-offer requires payment, trigger the Razorpay popup immediately!
    if (result.requiresPayment && result.razorpayOrderId && result.razorpayKeyId && result.sessionId) {
      checkout.startCheckout({
        sessionId: result.sessionId,
        razorpayOrderId: result.razorpayOrderId,
        razorpayKeyId: result.razorpayKeyId,
        onSuccess: () => {
          alert('Counter-offer accepted and payment verified successfully! Your booking is fully confirmed.')
          window.location.reload()
        }
      })
    } else if (result.sessionId && !result.requiresPayment) {
      alert('Free counter-offer accepted and session confirmed!')
      window.location.reload()
    } else {
      alert('Offer accepted successfully!')
      window.location.reload()
    }
  }

  const activeLoading = submittingId !== null || checkout.loading
  const activeMessage = submittingId ? 'Accepting counter-offer and securing booking ticket...' : checkout.loadingMessage
  const activeError = checkout.error

  return (
    <div>
      <PaymentLoadingOverlay isOpen={activeLoading} message={activeMessage} />

      {/* Dynamic Navigation Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        borderBottom: '1px solid var(--cream-border)',
        marginBottom: '28px',
        paddingBottom: '2px',
        overflowX: 'auto'
      }}>
        <button
          onClick={() => setActiveTab('booked')}
          style={{
            padding: '12px 20px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'booked' ? '2px solid var(--ink)' : 'none',
            fontFamily: 'var(--font-sans)',
            fontSize: '14px',
            fontWeight: activeTab === 'booked' ? 600 : 500,
            color: activeTab === 'booked' ? 'var(--ink)' : 'var(--ink-4)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            whiteSpace: 'nowrap'
          }}
        >
          Booked Sessions ({bookedSessions.length})
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          style={{
            padding: '12px 20px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'pending' ? '2px solid var(--ink)' : 'none',
            fontFamily: 'var(--font-sans)',
            fontSize: '14px',
            fontWeight: activeTab === 'pending' ? 600 : 500,
            color: activeTab === 'pending' ? 'var(--ink)' : 'var(--ink-4)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            whiteSpace: 'nowrap'
          }}
        >
          Pending Payment ({pendingSessions.length})
        </button>
        <button
          onClick={() => setActiveTab('proposals')}
          style={{
            padding: '12px 20px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'proposals' ? '2px solid var(--ink)' : 'none',
            fontFamily: 'var(--font-sans)',
            fontSize: '14px',
            fontWeight: activeTab === 'proposals' ? 600 : 500,
            color: activeTab === 'proposals' ? 'var(--ink)' : 'var(--ink-4)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            whiteSpace: 'nowrap'
          }}
        >
          Custom Proposals ({initialRequests.length})
        </button>
      </div>

      {activeError && (
        <div style={{
          background: '#FEF2F2',
          border: '1px solid #FCA5A5',
          color: '#991B1B',
          padding: '12px 18px',
          borderRadius: '8px',
          fontSize: '13px',
          fontFamily: 'var(--font-sans)',
          marginBottom: '20px'
        }}>
          ⚠️ {activeError}
        </div>
      )}

      {activeTab !== 'proposals' && (
        /* Filtering and Sorting Controls Header */
        <div style={{
          background: 'var(--white)',
          border: '1px solid var(--cream-border)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '32px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '20px',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {/* Search */}
          <div style={{ flex: '1 1 240px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--ink-4)', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.05em' }}>
              Search Bookings
            </label>
            <input
              type="text"
              placeholder="Search mentor or session type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid var(--cream-border)',
                background: 'var(--cream)',
                fontFamily: 'var(--font-sans)',
                fontSize: '13px',
                color: 'var(--ink)',
                outline: 'none'
              }}
            />
          </div>

          {/* Sorting Selection */}
          <div style={{ flex: '0 1 200px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--ink-4)', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.05em' }}>
              Timeline Sorting
            </label>
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid var(--cream-border)',
                background: 'var(--cream)',
                fontFamily: 'var(--font-sans)',
                fontSize: '13px',
                color: 'var(--ink)',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="closest">⏳ Timeline: Closest First</option>
              <option value="latest">✨ Latest Booked First</option>
              <option value="furthest">📅 Furthest Future First</option>
            </select>
          </div>
        </div>
      )}

      {/* Render Tab Views */}
      {activeTab === 'booked' && (
        bookedSessions.length === 0 ? (
          <div style={{ background: 'var(--white)', border: '1px solid var(--cream-border)', borderRadius: '16px', padding: '64px 32px', textAlign: 'center' }}>
            <span style={{ fontSize: '32px', display: 'block', marginBottom: '16px' }}>📅</span>
            <p style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', color: 'var(--ink)', margin: '0 0 8px' }}>
              No Booked Sessions Found
            </p>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--ink-4)', margin: 0 }}>
              Once you pay and Google Meet links are generated, your confirmed events show here.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {bookedSessions.map((s) => (
              <FounderSessionCard
                key={s.id}
                session={s}
                mentor={mentorMap[s.mentor_id]}
                sessionType={sessionTypeMap[s.session_type_id]}
                hasReviewedInitial={reviewedSet.has(s.id)}
                nowString={now.toISOString()}
              />
            ))}
          </div>
        )
      )}

      {activeTab === 'pending' && (
        pendingSessions.length === 0 ? (
          <div style={{ background: 'var(--white)', border: '1px solid var(--cream-border)', borderRadius: '16px', padding: '64px 32px', textAlign: 'center' }}>
            <span style={{ fontSize: '32px', display: 'block', marginBottom: '16px' }}>💳</span>
            <p style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', color: 'var(--ink)', margin: '0 0 8px' }}>
              No Pending Payments Found
            </p>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--ink-4)', margin: 0 }}>
              All sessions awaiting Razorpay checkout show here. Complete them to confirm bookings.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {pendingSessions.map((s) => (
              <FounderSessionCard
                key={s.id}
                session={s}
                mentor={mentorMap[s.mentor_id]}
                sessionType={sessionTypeMap[s.session_type_id]}
                hasReviewedInitial={reviewedSet.has(s.id)}
                nowString={now.toISOString()}
              />
            ))}
          </div>
        )
      )}

      {activeTab === 'proposals' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {initialRequests.length === 0 ? (
            <div style={{ background: 'var(--white)', border: '1px solid var(--cream-border)', borderRadius: '16px', padding: '64px 32px', textAlign: 'center' }}>
              <span style={{ fontSize: '32px', display: 'block', marginBottom: '16px' }}>✉</span>
              <p style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', color: 'var(--ink)', margin: '0 0 8px' }}>
                No Custom Proposals Raised
              </p>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--ink-4)', margin: 0 }}>
                You haven't requested any custom slots yet. Propose them directly from any mentor's profile.
              </p>
            </div>
          ) : (
            initialRequests.map((req) => {
              const mentor = mentorMap[req.mentor_id]
              const type = sessionTypeMap[req.session_type_id]
              const dateObj = new Date(req.proposed_start)
              
              const isOffered = req.status === 'offered'
              const offeredDate = req.offered_start ? new Date(req.offered_start) : null
              const showHistory = expandedHistoryId === req.id

              return (
                <div key={req.id} style={{
                  background: 'var(--white)',
                  border: '1px solid var(--cream-border)',
                  borderRadius: '16px',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px'
                }}>
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '20px',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: '1 1 280px' }}>
                      {mentor?.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={mentor.avatar_url} alt="" style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--cream-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-serif)', fontSize: '18px' }}>
                          {mentor?.display_name?.charAt(0) || 'M'}
                        </div>
                      )}
                      <div>
                        <h4 style={{ fontFamily: 'var(--font-sans)', fontSize: '15px', fontWeight: 600, color: 'var(--ink)', margin: 0 }}>
                          {mentor?.display_name}
                        </h4>
                        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--ink-3)', margin: '2px 0 0' }}>
                          Proposed: {type?.name || 'Custom Session'} ({type?.duration_minutes || 60} min)
                        </p>
                        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--ink-4)', margin: '6px 0 0', fontStyle: 'italic' }}>
                          "{req.founder_brief}"
                        </p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '160px' }}>
                      <span style={{ fontSize: '13px', color: 'var(--ink-3)', fontWeight: 500 }}>
                        📅 {dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <span style={{ fontSize: '12px', color: 'var(--ink-4)' }}>
                        ⏰ {dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink)', marginTop: '4px' }}>
                        ₹{req.amount_inr.toLocaleString()}
                      </span>
                    </div>

                    <div>
                      {req.status === 'pending' && (
                        <span style={{ background: '#FFF9E6', color: '#856404', padding: '6px 14px', borderRadius: '100px', fontSize: '12px', fontWeight: 600 }}>
                          ⏳ Awaiting Approval
                        </span>
                      )}
                      {req.status === 'accepted' && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                          <span style={{ background: '#EDF5EA', color: '#2A6620', padding: '6px 14px', borderRadius: '100px', fontSize: '12px', fontWeight: 600 }}>
                            ✓ Accepted & Booked
                          </span>
                        </div>
                      )}
                      {req.status === 'declined' && (
                        <span style={{ background: '#FEF2F2', color: '#991B1B', padding: '6px 14px', borderRadius: '100px', fontSize: '12px', fontWeight: 600 }}>
                          ✕ Declined
                        </span>
                      )}
                      {isOffered && (
                        <span style={{ background: '#FFF9E6', color: '#856404', padding: '6px 14px', borderRadius: '100px', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>
                          ⚡ Counter-Offer Received!
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Render the offer detail drawer and Accept button for 'offered' status */}
                  {isOffered && offeredDate && (
                    <div style={{
                      background: '#FFFDF5',
                      border: '1px solid #FDE68A',
                      padding: '20px',
                      borderRadius: '12px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginTop: '12px'
                    }}>
                      <div>
                        <p style={{ margin: '0 0 6px', fontSize: '12px', fontWeight: 700, color: '#92400E', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Mentor's Proposed Meeting Slot
                        </p>
                        <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'var(--ink)' }}>
                          📅 {offeredDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} at {offeredDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--ink-2)' }}>
                          Rate: <strong style={{ color: 'var(--accent)' }}>₹{req.offered_amount_inr.toLocaleString()}</strong>
                        </p>
                      </div>
                      <button
                        onClick={() => handleAcceptOffer(req.id)}
                        disabled={activeLoading}
                        style={{
                          padding: '10px 24px',
                          background: 'var(--ink)',
                          border: 'none',
                          color: 'white',
                          borderRadius: '100px',
                          fontSize: '13px',
                          fontWeight: 600,
                          cursor: activeLoading ? 'wait' : 'pointer'
                        }}
                      >
                        {activeLoading ? 'Accepting...' : 'Accept & Pay'}
                      </button>
                    </div>
                  )}

                  {/* Negotiation Timeline Toggle Button */}
                  {req.negotiation_timeline && req.negotiation_timeline.length > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px', borderTop: '1px solid var(--cream-border)', paddingTop: '12px' }}>
                      <button
                        onClick={() => setExpandedHistoryId(showHistory ? null : req.id)}
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
                        {showHistory ? 'Hide Discussion History ▴' : 'View Discussion History ▾'}
                      </button>
                    </div>
                  )}

                  {showHistory && (
                    <NegotiationTimeline timeline={req.negotiation_timeline} />
                  )}
                </div>
              )

            })
          )}
        </div>
      )}
    </div>
  )
}
