'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

export default function CreateGroupSessionPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [topicTags, setTopicTags] = useState('')
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [durationMinutes, setDurationMinutes] = useState(60)
  const [maxSeats, setMaxSeats] = useState(10)
  const [priceInr, setPriceInr] = useState(2500)

  const supabase = useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ), [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !date || !startTime) {
      setError('Please fill in all required fields.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setError('Not logged in.'); return }

      const { data: mentor } = await supabase
        .from('mentor_profiles')
        .select('id, timezone')
        .eq('user_id', user.id)
        .single()

      if (!mentor) { setError('Mentor profile not found.'); return }

      // Calculate start/end times
      const scheduledStart = new Date(`${date}T${startTime}:00`)
      const scheduledEnd = new Date(scheduledStart.getTime() + durationMinutes * 60 * 1000)

      // Generate slug
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString(36)

      const tags = topicTags.split(',').map(t => t.trim()).filter(Boolean)

      const { error: insertError } = await supabase
        .from('group_sessions')
        .insert({
          mentor_id: mentor.id,
          slug,
          title: title.trim(),
          description: description.trim(),
          topic_tags: tags,
          scheduled_start: scheduledStart.toISOString(),
          scheduled_end: scheduledEnd.toISOString(),
          timezone: mentor.timezone || 'Asia/Kolkata',
          max_seats: maxSeats,
          seats_booked: 0,
          price_inr: priceInr,
          status: 'scheduled'
        })

      if (insertError) {
        setError(insertError.message)
      } else {
        router.push('/mentor/group-sessions')
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  const fieldStyle = {
    width: '100%',
    padding: '12px 14px',
    borderRadius: '10px',
    border: '1px solid var(--cream-border)',
    background: 'var(--cream)',
    fontFamily: 'var(--font-sans)',
    fontSize: '15px',
    color: 'var(--ink)'
  }

  const labelStyle = {
    display: 'block',
    fontFamily: 'var(--font-sans)',
    fontSize: '14px',
    fontWeight: 500 as const,
    color: 'var(--ink)',
    marginBottom: '6px'
  }

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <a href="/mentor/group-sessions" style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--ink-4)', textDecoration: 'none' }}>← Back to group sessions</a>
      </div>

      <div style={{ background: 'var(--white)', border: '1px solid var(--cream-border)', borderRadius: '16px', padding: '32px', maxWidth: '640px' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', color: 'var(--ink)', margin: '0 0 8px' }}>Create Group Session</h1>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--ink-4)', margin: '0 0 32px' }}>Host a group office hour for multiple founders.</p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={labelStyle}>Title *</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. India Market Entry Office Hours" style={fieldStyle} required />
          </div>

          <div>
            <label style={labelStyle}>Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="What will you cover in this session?" rows={4} style={{ ...fieldStyle, resize: 'vertical' }} />
          </div>

          <div>
            <label style={labelStyle}>Topic Tags (comma-separated)</label>
            <input type="text" value={topicTags} onChange={e => setTopicTags(e.target.value)} placeholder="e.g. Market Entry, Fundraising, Compliance" style={fieldStyle} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Date *</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} style={fieldStyle} required />
            </div>
            <div>
              <label style={labelStyle}>Start Time *</label>
              <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} style={fieldStyle} required />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Duration (min)</label>
              <select value={durationMinutes} onChange={e => setDurationMinutes(Number(e.target.value))} style={fieldStyle}>
                <option value={30}>30 min</option>
                <option value={45}>45 min</option>
                <option value={60}>60 min</option>
                <option value={90}>90 min</option>
                <option value={120}>120 min</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Max Seats</label>
              <input type="number" value={maxSeats} onChange={e => setMaxSeats(Number(e.target.value))} min={2} max={100} style={fieldStyle} />
            </div>
            <div>
              <label style={labelStyle}>Price (₹)</label>
              <input type="number" value={priceInr} onChange={e => setPriceInr(Number(e.target.value))} min={2500} style={fieldStyle} />
            </div>
          </div>

          {error && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', padding: '12px 16px', borderRadius: '8px', fontFamily: 'var(--font-sans)', fontSize: '14px' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '14px',
              background: loading ? 'var(--ink-4)' : 'var(--ink)',
              color: 'var(--white)',
              borderRadius: '10px',
              fontFamily: 'var(--font-sans)',
              fontSize: '16px',
              fontWeight: 600,
              cursor: loading ? 'wait' : 'pointer',
              border: 'none'
            }}
          >
            {loading ? 'Creating...' : 'Create Group Session'}
          </button>
        </form>
      </div>
    </div>
  )
}
