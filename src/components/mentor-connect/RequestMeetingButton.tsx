'use client'

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { createMeetingRequest } from '@/lib/mentor-dashboard-actions'
import { Mail, Calendar, CheckCircle, AlertCircle, X } from 'lucide-react'

interface RequestMeetingButtonProps {
  mentorId: string
  mentorName: string
  sessionTypes: any[]
}

export function RequestMeetingButton({ mentorId, mentorName, sessionTypes }: RequestMeetingButtonProps) {
  const [mounted, setMounted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])
  const [selectedSessionType, setSelectedSessionType] = useState(sessionTypes[0]?.id || '')
  
  // Option 1 Timing
  const [proposedDate, setProposedDate] = useState('')
  const [proposedTime, setProposedTime] = useState('')

  // Option 2 Timing
  const [proposedDate2, setProposedDate2] = useState('')
  const [proposedTime2, setProposedTime2] = useState('')

  const [brief, setBrief] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const activeSessionTypeObj = sessionTypes.find(t => t.id === selectedSessionType)
  const price = activeSessionTypeObj?.price_inr || 0
  const duration = activeSessionTypeObj?.duration_minutes || 60

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSessionType || !proposedDate || !proposedTime || !brief.trim()) {
      setError('Please fill in all the required details.')
      return
    }

    if (brief.trim().length < 20) {
      setError('Please provide a brief details (minimum 20 characters).')
      return
    }

    setSubmitting(true)
    setError(null)

    // Option 1 ISO Strings
    const startDateTime = new Date(`${proposedDate}T${proposedTime}`)
    const endDateTime = new Date(startDateTime.getTime() + duration * 60000)

    // Option 2 ISO Strings (if provided)
    let startDateTime2ISO = undefined
    let endDateTime2ISO = undefined
    if (proposedDate2 && proposedTime2) {
      const startDateTime2 = new Date(`${proposedDate2}T${proposedTime2}`)
      const endDateTime2 = new Date(startDateTime2.getTime() + duration * 60000)
      startDateTime2ISO = startDateTime2.toISOString()
      endDateTime2ISO = endDateTime2.toISOString()
    }

    const result = await createMeetingRequest({
      mentorId,
      sessionTypeId: selectedSessionType,
      proposedStart: startDateTime.toISOString(),
      proposedEnd: endDateTime.toISOString(),
      proposedStart2: startDateTime2ISO,
      proposedEnd2: endDateTime2ISO,
      founderBrief: brief,
      amountInr: price
    })

    setSubmitting(true)
    if (result.error) {
      setError(result.error)
      setSubmitting(false)
    } else {
      setSuccess(true)
      setTimeout(() => {
        setIsOpen(false)
        setSuccess(false)
        setProposedDate('')
        setProposedTime('')
        setProposedDate2('')
        setProposedTime2('')
        setBrief('')
        setSubmitting(false)
      }, 3000)
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          width: '100%',
          padding: '14px',
          background: 'transparent',
          border: '1px solid var(--cream-border)',
          color: 'var(--ink-2)',
          borderRadius: 'var(--radius-lg, 8px)',
          fontFamily: 'var(--font-sans)',
          fontSize: '14px',
          fontWeight: 600,
          cursor: 'pointer',
          marginTop: '12px',
          textAlign: 'center',
          transition: 'all 0.2s ease'
        }}
        className="request-custom-btn"
      >
        <Mail size={15} />
        Request Custom Session
      </button>

      {isOpen && mounted && typeof document !== 'undefined'
        ? createPortal(
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              background: 'rgba(15, 23, 42, 0.45)',
              backdropFilter: 'blur(12px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 99999, // Extremely elevated zIndex to override any parent stacking context
              padding: '20px'
            }}>
              <div style={{
                background: 'var(--white)',
                border: '1px solid var(--cream-border)',
                borderRadius: 'var(--radius-lg, 20px)',
                width: '100%',
                maxWidth: '560px',
                boxShadow: '0 24px 60px rgba(184, 70, 10, 0.1)',
                maxHeight: '90vh',
                overflowY: 'auto',
              }}>
                {/* Modal Header */}
                <div style={{
                  padding: '24px 32px',
                  borderBottom: '1px solid var(--cream-border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'var(--bg)',
                  position: 'sticky',
                  top: 0,
                  zIndex: 10
                }}>
                  <div>
                    <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', color: 'var(--ink)', margin: 0, fontWeight: 400 }}>
                      Custom Session Proposal
                    </h3>
                    <p style={{ fontFamily: 'var(--font-sans)', fontSize: '12.5px', color: 'var(--ink-3)', margin: '4px 0 0' }}>
                      Propose direct availability options for {mentorName}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    disabled={submitting}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--ink-4)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '4px'
                    }}
                  >
                    <X size={20} />
                  </button>
                </div>

                {success ? (
                  <div style={{ padding: '60px 32px', textAlign: 'center' }}>
                    <div style={{
                      width: '56px',
                      height: '56px',
                      background: '#EDF5EA',
                      color: '#2A6620',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 20px',
                      border: '1px solid rgba(42, 102, 32, 0.15)'
                    }}>
                      <CheckCircle size={28} />
                    </div>
                    <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', color: 'var(--ink)', margin: '0 0 8px', fontWeight: 400 }}>
                      Proposal Transmitted!
                    </h4>
                    <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--ink-3)', lineHeight: 1.6, margin: 0, maxWidth: '400px', marginLeft: 'auto', marginRight: 'auto' }}>
                      Your slot configurations have been sent to {mentorName}. You will be notified the instant they confirm or update!
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} style={{ padding: '32px' }}>
                    {error && (
                      <div style={{
                        background: '#FEF2F2',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        color: '#991B1B',
                        padding: '12px 16px',
                        borderRadius: 'var(--radius-lg, 8px)',
                        fontSize: '13px',
                        fontFamily: 'var(--font-sans)',
                        marginBottom: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <AlertCircle size={16} style={{ flexShrink: 0 }} />
                        <span>{error}</span>
                      </div>
                    )}

                    {/* Session Type selection */}
                    <div style={{ marginBottom: '24px' }}>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--ink-3)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>
                        Select Baseline Session Type
                      </label>
                      <select
                        value={selectedSessionType}
                        onChange={(e) => setSelectedSessionType(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          borderRadius: 'var(--radius-lg, 8px)',
                          border: '1px solid var(--cream-border)',
                          background: 'var(--bg)',
                          fontFamily: 'var(--font-sans)',
                          fontSize: '13.5px',
                          color: 'var(--ink)',
                          outline: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        {sessionTypes.map((type) => (
                          <option key={type.id} value={type.id}>
                            {type.name} ({type.duration_minutes} min • {type.price_inr > 0 ? `₹${type.price_inr.toLocaleString()}` : 'Free'})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Proposed Option 1 */}
                    <div style={{ background: 'var(--bg)', padding: '20px', borderRadius: 'var(--radius-lg, 12px)', border: '1px solid var(--cream-border)', marginBottom: '20px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: 'var(--ink)', textTransform: 'uppercase', marginBottom: '14px', letterSpacing: '0.04em' }}>
                        <Calendar size={14} color="var(--accent)" />
                        Slot Option 1 (Required)
                      </span>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '10px', fontWeight: 600, color: 'var(--ink-4)', textTransform: 'uppercase', marginBottom: '6px' }}>
                            Proposed Date
                          </label>
                          <input
                            type="date"
                            required
                            min={new Date().toISOString().split('T')[0]}
                            value={proposedDate}
                            onChange={(e) => setProposedDate(e.target.value)}
                            style={{
                              width: '100%',
                              padding: '10px 14px',
                              borderRadius: 'var(--radius-lg, 8px)',
                              border: '1px solid var(--cream-border)',
                              background: 'var(--white)',
                              fontFamily: 'var(--font-sans)',
                              fontSize: '13px',
                              color: 'var(--ink)',
                              outline: 'none'
                            }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '10px', fontWeight: 600, color: 'var(--ink-4)', textTransform: 'uppercase', marginBottom: '6px' }}>
                            Proposed Time
                          </label>
                          <input
                            type="time"
                            required
                            value={proposedTime}
                            onChange={(e) => setProposedTime(e.target.value)}
                            style={{
                              width: '100%',
                              padding: '10px 14px',
                              borderRadius: 'var(--radius-lg, 8px)',
                              border: '1px solid var(--cream-border)',
                              background: 'var(--white)',
                              fontFamily: 'var(--font-sans)',
                              fontSize: '13px',
                              color: 'var(--ink)',
                              outline: 'none'
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Proposed Option 2 */}
                    <div style={{ background: 'var(--bg)', padding: '20px', borderRadius: 'var(--radius-lg, 12px)', border: '1px solid var(--cream-border)', marginBottom: '24px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: 'var(--ink)', textTransform: 'uppercase', marginBottom: '14px', letterSpacing: '0.04em' }}>
                        <Calendar size={14} color="var(--accent)" />
                        Slot Option 2 (Optional)
                      </span>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '10px', fontWeight: 600, color: 'var(--ink-4)', textTransform: 'uppercase', marginBottom: '6px' }}>
                            Proposed Date
                          </label>
                          <input
                            type="date"
                            min={new Date().toISOString().split('T')[0]}
                            value={proposedDate2}
                            onChange={(e) => setProposedDate2(e.target.value)}
                            style={{
                              width: '100%',
                              padding: '10px 14px',
                              borderRadius: 'var(--radius-lg, 8px)',
                              border: '1px solid var(--cream-border)',
                              background: 'var(--white)',
                              fontFamily: 'var(--font-sans)',
                              fontSize: '13px',
                              color: 'var(--ink)',
                              outline: 'none'
                            }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '10px', fontWeight: 600, color: 'var(--ink-4)', textTransform: 'uppercase', marginBottom: '6px' }}>
                            Proposed Time
                          </label>
                          <input
                            type="time"
                            value={proposedTime2}
                            onChange={(e) => setProposedTime2(e.target.value)}
                            style={{
                              width: '100%',
                              padding: '10px 14px',
                              borderRadius: 'var(--radius-lg, 8px)',
                              border: '1px solid var(--cream-border)',
                              background: 'var(--white)',
                              fontFamily: 'var(--font-sans)',
                              fontSize: '13px',
                              color: 'var(--ink)',
                              outline: 'none'
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Pitch Brief */}
                    <div style={{ marginBottom: '28px' }}>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--ink-3)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>
                        Discussion Topics (Brief description)
                      </label>
                      <textarea
                        required
                        rows={3}
                        placeholder="Describe what key problems or challenges you want to outline..."
                        value={brief}
                        onChange={(e) => setBrief(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          borderRadius: 'var(--radius-lg, 8px)',
                          border: '1px solid var(--cream-border)',
                          background: 'var(--bg)',
                          fontFamily: 'var(--font-sans)',
                          fontSize: '13.5px',
                          color: 'var(--ink)',
                          outline: 'none',
                          resize: 'none',
                          lineHeight: 1.6
                        }}
                      />
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        disabled={submitting}
                        style={{
                          padding: '11px 22px',
                          background: 'var(--white)',
                          border: '1px solid var(--cream-border)',
                          borderRadius: 'var(--radius-lg, 8px)',
                          color: 'var(--ink-3)',
                          fontFamily: 'var(--font-sans)',
                          fontSize: '13.5px',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        style={{
                          padding: '11px 24px',
                          background: 'var(--ink)',
                          border: 'none',
                          borderRadius: 'var(--radius-lg, 8px)',
                          color: 'var(--white)',
                          fontFamily: 'var(--font-sans)',
                          fontSize: '13.5px',
                          fontWeight: 600,
                          cursor: submitting ? 'wait' : 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                        className="submit-proposal-btn"
                      >
                        {submitting ? 'Transmitting...' : 'Submit Proposal'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>,
            document.body
          )
        : null}

      <style dangerouslySetInnerHTML={{
        __html: `
        .request-custom-btn:hover {
          border-color: var(--accent) !important;
          color: var(--accent) !important;
          background: var(--accent-light) !important;
        }
        .submit-proposal-btn:hover {
          background: var(--accent) !important;
        }
      `}} />
    </>
  )
}
