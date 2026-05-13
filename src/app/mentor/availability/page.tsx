'use client'

import { useState, useEffect, useMemo } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { updateMentorBookingRules, updateMentorWeeklyAvailability, disconnectGoogleCalendar, checkGoogleCalendarStatus } from '@/lib/mentor-dashboard-actions'

export default function AvailabilityPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [isCalendarValid, setIsCalendarValid] = useState(true)
  const [noticeHours, setNoticeHours] = useState(24)
  const [windowDays, setWindowDays] = useState(14)
  const [weeklySlots, setWeeklySlots] = useState<any[]>([])

  const supabase = useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ), [])
  
  const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: mentor } = await supabase
        .from('mentor_profiles')
        .select('id, notice_period_hours, booking_window_days, google_access_token')
        .eq('user_id', user.id)
        .single()

      if (mentor) {
        setIsConnected(!!mentor.google_access_token)
        setNoticeHours(mentor.notice_period_hours)
        setWindowDays(mentor.booking_window_days)

        // Check if calendar connection is actually valid (token can refresh)
        if (mentor.google_access_token) {
          const status = await checkGoogleCalendarStatus()
          setIsCalendarValid(status.isValid ?? false)
        }

        const { data: availability } = await supabase
          .from('mentor_availability')
          .select('*')
          .eq('mentor_id', mentor.id)
        
        if (availability) {
          setWeeklySlots(availability)
        }
      }
      setLoading(false)
    }
    loadData()
  }, [supabase])

  const handleSaveSettings = async () => {
    setSaving(true)
    try {
      await updateMentorBookingRules(noticeHours, windowDays)
      await updateMentorWeeklyAvailability(weeklySlots)
      alert('Availability settings saved successfully.')
    } catch (err) {
      alert('Error saving settings.')
    } finally {
      setSaving(false)
    }
  }

  const handleDisconnect = async () => {
    if (confirm('Are you sure you want to disconnect your calendar? Your active slots will no longer check for conflicts.')) {
      const res = await disconnectGoogleCalendar()
      if (res.success) {
        setIsConnected(false)
      }
    }
  }

  const addSlot = (dayIndex: number) => {
    setWeeklySlots([...weeklySlots, { day_of_week: dayIndex, start_time: '09:00:00', end_time: '17:00:00', timezone: 'Asia/Kolkata' }])
  }

  const removeSlot = (indexToRemove: number) => {
    setWeeklySlots(weeklySlots.filter((_, idx) => idx !== indexToRemove))
  }

  const updateSlot = (index: number, field: string, value: string) => {
    const updated = [...weeklySlots]
    updated[index] = { ...updated[index], [field]: value }
    setWeeklySlots(updated)
  }

  if (loading) return <div>Loading availability settings...</div>

  return (
    <div>
      <div style={{ background: 'var(--white)', border: '1px solid var(--cream-border)', borderRadius: '16px', padding: '32px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', color: 'var(--ink)', margin: '0 0 8px' }}>
              Google Calendar
            </h2>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '15px', color: 'var(--ink-3)', margin: 0 }}>
              Connect your calendar to automatically prevent double bookings.
            </p>
          </div>
          
          {isConnected ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {isCalendarValid ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#2A6620', background: '#EDF5EA', padding: '6px 12px', borderRadius: '100px', fontSize: '13px', fontWeight: 500, fontFamily: 'var(--font-sans)' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2A6620' }} /> Connected
                </span>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#B42318', background: '#FEF3F2', padding: '6px 12px', borderRadius: '100px', fontSize: '13px', fontWeight: 500, fontFamily: 'var(--font-sans)' }}>
                    ⚠️ Connection Broken
                  </span>
                  <a href="/api/auth/google" style={{ fontSize: '12px', color: 'var(--ink)', fontWeight: 600 }}>Reconnect Calendar</a>
                </div>
              )}
              <button onClick={handleDisconnect} style={{ background: 'none', border: 'none', color: '#D92D20', fontSize: '14px', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontWeight: 500, textDecoration: 'underline' }}>
                Disconnect
              </button>
            </div>
          ) : (
            <a href="/api/auth/google" style={{ display: 'inline-block', padding: '12px 24px', background: 'var(--ink)', color: 'var(--white)', borderRadius: '8px', fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 500, textDecoration: 'none' }}>
              Connect Calendar
            </a>
          )}
        </div>
      </div>

      <div style={{ background: 'var(--white)', border: '1px solid var(--cream-border)', borderRadius: '16px', padding: '32px', marginBottom: '32px' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', color: 'var(--ink)', margin: '0 0 24px' }}>
          Booking Rules
        </h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div>
            <label style={{ display: 'block', fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 500, color: 'var(--ink)', marginBottom: '8px' }}>
              Minimum Notice Period
            </label>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--ink-4)', margin: '0 0 8px' }}>
              How much time do you need before a session starts?
            </p>
            <select 
              value={noticeHours} 
              onChange={e => setNoticeHours(Number(e.target.value))}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--cream-border)', background: 'var(--cream)', fontFamily: 'var(--font-sans)', fontSize: '15px' }}
            >
              <option value={12}>12 Hours</option>
              <option value={24}>24 Hours</option>
              <option value={48}>48 Hours</option>
              <option value={72}>72 Hours</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 500, color: 'var(--ink)', marginBottom: '8px' }}>
              Booking Window
            </label>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--ink-4)', margin: '0 0 8px' }}>
              How far in advance can founders book you?
            </p>
            <select 
              value={windowDays} 
              onChange={e => setWindowDays(Number(e.target.value))}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--cream-border)', background: 'var(--cream)', fontFamily: 'var(--font-sans)', fontSize: '15px' }}
            >
              <option value={7}>1 Week in advance</option>
              <option value={14}>2 Weeks in advance</option>
              <option value={30}>1 Month in advance</option>
              <option value={60}>2 Months in advance</option>
            </select>
          </div>
        </div>
      </div>

      <div style={{ background: 'var(--white)', border: '1px solid var(--cream-border)', borderRadius: '16px', padding: '32px', marginBottom: '32px' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', color: 'var(--ink)', margin: '0 0 8px' }}>
          Weekly Hours
        </h2>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '15px', color: 'var(--ink-3)', margin: '0 0 32px' }}>
          Define the time windows where you are generally available. We'll automatically hide times when your Google Calendar is busy.
        </p>

        {DAYS.map((day, dayIndex) => {
          const slotsForDay = weeklySlots.filter(s => s.day_of_week === dayIndex)
          return (
            <div key={day} style={{ display: 'flex', alignItems: 'flex-start', borderBottom: '1px solid var(--cream-border)', paddingBottom: '24px', marginBottom: '24px' }}>
              <div style={{ width: '120px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: '15px', fontWeight: 500, color: 'var(--ink)' }}>{day}</span>
              </div>
              
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {slotsForDay.length === 0 ? (
                  <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--ink-4)', margin: '8px 0 0' }}>Unavailable</p>
                ) : (
                  slotsForDay.map((slot, idx) => {
                    // Find actual index in weeklySlots array
                    const globalIdx = weeklySlots.findIndex(s => s === slot)
                    return (
                      <div key={globalIdx} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <input 
                          type="time" 
                          value={slot.start_time.substring(0, 5)} 
                          onChange={(e) => updateSlot(globalIdx, 'start_time', e.target.value + ':00')}
                          style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--cream-border)', background: 'var(--cream)' }}
                        />
                        <span style={{ color: 'var(--ink-4)' }}>-</span>
                        <input 
                          type="time" 
                          value={slot.end_time.substring(0, 5)} 
                          onChange={(e) => updateSlot(globalIdx, 'end_time', e.target.value + ':00')}
                          style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--cream-border)', background: 'var(--cream)' }}
                        />
                        <button onClick={() => removeSlot(globalIdx)} style={{ background: 'none', border: 'none', color: '#D92D20', cursor: 'pointer', padding: '8px' }}>
                          ✕
                        </button>
                      </div>
                    )
                  })
                )}
              </div>
              
              <button onClick={() => addSlot(dayIndex)} style={{ background: 'none', border: '1px solid var(--cream-border)', borderRadius: '6px', padding: '8px 12px', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                +
              </button>
            </div>
          )
        })}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button 
          onClick={handleSaveSettings}
          disabled={saving}
          style={{ padding: '14px 32px', background: 'var(--ink)', color: 'var(--white)', borderRadius: '8px', fontFamily: 'var(--font-sans)', fontSize: '15px', fontWeight: 500, cursor: saving ? 'wait' : 'pointer', border: 'none' }}
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  )
}
