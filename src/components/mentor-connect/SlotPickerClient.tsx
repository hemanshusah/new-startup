'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

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
      // In Sprint 4, we'll build Step 2: session brief form
      // For now we just append the selected slot as a query param to the next step
      router.push(`/mentor-connect/book/${mentorSlug}/${sessionId}/details?slot=${encodeURIComponent(selectedSlot)}`)
    }
  }

  if (availableDates.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0' }}>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '15px', color: 'var(--ink-4)' }}>
          This mentor has no available slots at the moment. Please check back later.
        </p>
      </div>
    )
  }

  return (
    <div>
      {/* Date Picker (Horizontal Scroll) */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 600, color: 'var(--ink)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 12px' }}>
          Date
        </h3>
        <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px', WebkitOverflowScrolling: 'touch' }}>
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
                  minWidth: '70px',
                  padding: '12px 8px',
                  borderRadius: '12px',
                  border: `1px solid ${isSelected ? 'var(--accent)' : 'var(--cream-border)'}`,
                  background: isSelected ? '#EDF5EA' : 'var(--white)',
                  color: isSelected ? '#2A6620' : 'var(--ink-3)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  transition: 'all 0.15s ease',
                  flexShrink: 0
                }}
              >
                <span style={{ fontSize: '12px', fontWeight: 500, fontFamily: 'var(--font-sans)', marginBottom: '4px' }}>
                  {mounted ? dayName : '---'}
                </span>
                <span style={{ fontSize: '20px', fontWeight: 600, fontFamily: 'var(--font-serif)', color: isSelected ? '#2A6620' : 'var(--ink)' }}>
                  {mounted ? dayNum : '--'}
                </span>
                <span style={{ fontSize: '12px', fontFamily: 'var(--font-sans)' }}>
                  {mounted ? monthName : '---'}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Time Slots */}
      {selectedDate && (
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 600, color: 'var(--ink)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 12px' }}>
            Time (Your Local Time)
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '12px' }}>
            {groupedSlots[selectedDate].map(slotIso => {
              const slotDate = new Date(slotIso)
              const timeString = slotDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
              const isSelected = selectedSlot === slotIso

              return (
                <button
                  key={slotIso}
                  onClick={() => handleSlotSelect(slotIso)}
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    border: `1px solid ${isSelected ? 'var(--accent)' : 'var(--cream-border)'}`,
                    background: isSelected ? 'var(--ink)' : 'var(--white)',
                    color: isSelected ? 'var(--white)' : 'var(--ink)',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '14px',
                    fontWeight: isSelected ? 600 : 500,
                    transition: 'all 0.15s ease',
                    textAlign: 'center'
                  }}
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
        <div style={{ paddingTop: '24px', borderTop: '1px solid var(--cream-border)', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={handleContinue}
            style={{
              padding: '14px 32px',
              background: 'var(--ink)',
              color: 'var(--white)',
              borderRadius: '8px',
              fontFamily: 'var(--font-sans)',
              fontSize: '15px',
              fontWeight: 500,
              cursor: 'pointer',
              border: 'none',
              boxShadow: '0 4px 12px rgba(28,26,22,0.1)'
            }}
          >
            Continue
          </button>
        </div>
      )}
    </div>
  )
}
