'use client'

import { useState } from 'react'
import { createSessionType, updateSessionType } from '@/lib/mentor-dashboard-actions'

interface SessionType {
  id: string
  name: string
  duration_minutes: number
  price_inr: number
  description: string
}

interface SessionTypeModalProps {
  onClose: () => void
  onSuccess: () => void
  initialData?: SessionType | null
}

export default function SessionTypeModal({ onClose, onSuccess, initialData }: SessionTypeModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    duration_minutes: initialData?.duration_minutes || 30,
    price_inr: initialData?.price_inr || 2500,
    description: initialData?.description || ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (formData.price_inr < 2500 || formData.price_inr > 25000) {
      setError('Price must be between ₹2,500 and ₹25,000')
      setLoading(false)
      return
    }

    const result = initialData 
      ? await updateSessionType(initialData.id, formData)
      : await createSessionType(formData)

    if (result.error) {
      setError(result.error)
    } else {
      onSuccess()
      onClose()
    }
    setLoading(false)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(28,26,22,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '24px' }}>
      <div style={{ background: 'var(--white)', borderRadius: '24px', padding: '32px', width: '100%', maxWidth: '500px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', margin: '0 0 8px' }}>
          {initialData ? 'Edit Session Type' : 'Add Session Type'}
        </h2>
        <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--ink-3)', fontSize: '15px', margin: '0 0 24px' }}>
          Define what you offer to founders and how much you charge.
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--ink-4)', textTransform: 'uppercase', marginBottom: '8px' }}>Session Name</label>
            <input 
              required
              placeholder="e.g. 1-on-1 Strategy Call"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--cream-border)', fontFamily: 'var(--font-sans)', fontSize: '15px' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--ink-4)', textTransform: 'uppercase', marginBottom: '8px' }}>Duration (mins)</label>
              <select 
                value={formData.duration_minutes}
                onChange={e => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--cream-border)', fontFamily: 'var(--font-sans)', fontSize: '15px', background: 'var(--white)' }}
              >
                <option value={30}>30 mins</option>
                <option value={45}>45 mins</option>
                <option value={60}>60 mins</option>
                <option value={90}>90 mins</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--ink-4)', textTransform: 'uppercase', marginBottom: '8px' }}>Price (INR)</label>
              <input 
                required
                type="number"
                min="2500"
                max="25000"
                value={formData.price_inr}
                onChange={e => setFormData({ ...formData, price_inr: parseInt(e.target.value) })}
                style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--cream-border)', fontFamily: 'var(--font-sans)', fontSize: '15px' }}
              />
              <p style={{ margin: '4px 0 0', fontSize: '11px', color: 'var(--ink-4)' }}>Min: ₹2,500</p>
            </div>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--ink-4)', textTransform: 'uppercase', marginBottom: '8px' }}>Description</label>
            <textarea 
              required
              rows={3}
              placeholder="What can the founder expect from this session?"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--cream-border)', fontFamily: 'var(--font-sans)', fontSize: '15px', resize: 'none' }}
            />
          </div>

          {error && <p style={{ color: '#B91C1C', fontSize: '14px', margin: '0 0 16px' }}>{error}</p>}

          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              type="button"
              onClick={onClose}
              style={{ flex: 1, padding: '14px', borderRadius: '12px', border: '1px solid var(--cream-border)', background: 'var(--cream)', fontWeight: 500, cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={loading}
              style={{ flex: 2, padding: '14px', borderRadius: '12px', border: 'none', background: 'var(--ink)', color: 'var(--white)', fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Saving...' : initialData ? 'Update Type' : 'Create Type'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
