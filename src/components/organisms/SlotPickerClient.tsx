'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, Clock, ArrowRight, Sparkles } from 'lucide-react'

interface SlotPickerClientProps {
  groupedSlots: Record<string, string[]> // "YYYY-MM-DD" -> ISO timestamp array
  mentorSlug: string
  sessionId: string
}

export function SlotPickerClient({ groupedSlots, mentorSlug, sessionId }: SlotPickerClientProps) {
  const router = useRouter()
  const availableDates = Object.keys(groupedSlots)
  
  // Default to the first available date, if any
  const [selectedDate, setSelectedDate] = useState<string | null>(availableDates.length > 0 ? availableDates[0] : null)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  
  // Prevent hydration mismatch by only rendering time-specific strings on client
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSlotSelect = (slot: string) => {
    setSelectedSlot(slot)
  }

  const handleContinue = () => {
    if (selectedSlot) {
      router.push(`/mentor-connect/book/${mentorSlug}/${sessionId}/details?slot=${encodeURIComponent(selectedSlot)}`)
    }
  }

  if (availableDates.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 0' }}>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '15px', color: 'var(--ink-4)', lineHeight: 1.6 }}>
          This mentor has no available slots at the moment. Please check back later.
        </p>
      </div>
    )
  }

  return (
    <div>
      {/* Date Picker (Horizontal Scroll) */}
      <div style={{ marginBottom: '36px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <Calendar size={16} color="var(--accent)" />
          <h3 style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '13px',
            fontWeight: 700,
            color: 'var(--ink)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            margin: 0
          }}>
            Available Dates
          </h3>
        </div>

        <div style={{
          display: 'flex',
          gap: '10px',
          overflowX: 'auto',
          paddingBottom: '12px',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'thin'
        }} className="date-picker-scroll">
          {availableDates.map(dateStr => {
            const dateObj = new Date(dateStr)
            const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' })
            const dayNum = dateObj.getDate()
            const monthName = dateObj.toLocaleDateString('en-US', { month: 'short' })
            
            const isSelected = selectedDate === dateStr
            
            return (
              <button
                key={dateStr}
                onClick={() => {
                  setSelectedDate(dateStr)
                  setSelectedSlot(null) // Reset slot when date changes
                }}
                style={{
                  minWidth: '76px',
                  padding: '14px 10px',
                  borderRadius: '12px',
                  border: isSelected ? '1.5px solid var(--accent)' : '1px solid var(--cream-border)',
                  background: isSelected ? 'rgba(184, 70, 10, 0.05)' : 'var(--white)',
                  color: isSelected ? 'var(--accent)' : 'var(--ink-3)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  transition: 'all 0.15s ease',
                  flexShrink: 0,
                  boxShadow: isSelected ? '0 4px 12px rgba(184, 70, 10, 0.06)' : 'none'
                }}
                className="date-tab"
              >
                <span style={{ fontSize: '11px', fontWeight: 600, fontFamily: 'var(--font-sans)', textTransform: 'uppercase', letterSpacing: '0.04em', opacity: isSelected ? 1 : 0.7, marginBottom: '4px' }}>
                  {mounted ? dayName : '---'}
                </span>
                <span style={{
                  fontSize: '22px',
                  fontWeight: 600,
                  fontFamily: 'var(--font-serif)',
                  color: isSelected ? 'var(--accent)' : 'var(--ink)',
                  lineHeight: 1
                }}>
                  {mounted ? dayNum : '--'}
                </span>
                <span style={{ fontSize: '11px', fontFamily: 'var(--font-sans)', fontWeight: 500, marginTop: '4px', opacity: isSelected ? 0.9 : 0.6 }}>
                  {mounted ? monthName : '---'}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Time Slots */}
      {selectedDate && (
        <div style={{ marginBottom: '36px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <Clock size={16} color="var(--accent)" />
            <h3 style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '13px',
              fontWeight: 700,
              color: 'var(--ink)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              margin: 0
            }}>
              Available Slots (Your Local Time)
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '10px' }}>
            {groupedSlots[selectedDate].map(slotIso => {
              const slotDate = new Date(slotIso)
              const timeString = slotDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
              const isSelected = selectedSlot === slotIso

              return (
                <button
                  key={slotIso}
                  onClick={() => handleSlotSelect(slotIso)}
                  style={{
                    padding: '14px',
                    borderRadius: '10px',
                    border: isSelected ? '1.5px solid var(--accent)' : '1px solid var(--cream-border)',
                    background: isSelected ? 'var(--accent)' : 'var(--white)',
                    color: isSelected ? 'var(--white)' : 'var(--ink)',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '14px',
                    fontWeight: isSelected ? 600 : 500,
                    transition: 'all 0.15s ease',
                    textAlign: 'center',
                    boxShadow: isSelected ? '0 4px 12px rgba(184, 70, 10, 0.15)' : 'none'
                  }}
                  className="time-slot-btn"
                >
                  {mounted ? timeString : '--:--'}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Continue Button */}
      {selectedSlot && (
        <div style={{
          paddingTop: '28px',
          borderTop: '1px solid var(--cream-border)',
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center'
        }}>
          <button
            onClick={handleContinue}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '14px 36px',
              background: 'var(--ink)',
              color: 'var(--white)',
              borderRadius: '10px',
              fontFamily: 'var(--font-sans)',
              fontSize: '14.5px',
              fontWeight: 600,
              cursor: 'pointer',
              border: 'none',
              transition: 'all 0.15s ease',
              boxShadow: '0 4px 14px rgba(28,26,22,0.1)'
            }}
            className="continue-btn"
          >
            Continue to Brief
            <ArrowRight size={16} />
          </button>
        </div>
      )}

      <style jsx global>{`
        .date-tab:hover {
          border-color: var(--accent) !important;
          transform: translateY(-1px);
        }
        .time-slot-btn:hover {
          border-color: var(--accent) !important;
        }
        .continue-btn:hover {
          background: var(--accent) !important;
          transform: translateY(-1px);
        }
      `}</style>
    </div>
  )
}
