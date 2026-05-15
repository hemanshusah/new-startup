'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import SessionTypeModal from '@/components/mentor-connect/SessionTypeModal'
import { deleteSessionType, updateSessionType } from '@/lib/mentor-dashboard-actions'

interface SessionType {
  id: string
  name: string
  duration_minutes: number
  price_inr: number
  description: string
  is_active: boolean
}

export default function MentorSessionTypesPage() {
  const [loading, setLoading] = useState(true)
  const [sessionTypes, setSessionTypes] = useState<SessionType[]>([])
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingType, setEditingType] = useState<SessionType | null>(null)

  const supabase = useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ), [])

  const loadData = useCallback(async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: mentor } = await supabase
      .from('mentor_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (mentor) {
      // Load session types
      const { data: typesData } = await supabase
        .from('session_types')
        .select('*')
        .eq('mentor_id', mentor.id)
        .order('created_at', { ascending: false })
      
      if (typesData) setSessionTypes(typesData)
    }
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleDeleteType = async (id: string) => {
    if (confirm('Are you sure you want to delete this session type? Past bookings will not be affected.')) {
      const result = await deleteSessionType(id)
      if (result.success) loadData()
      else alert(result.error)
    }
  }

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    const result = await updateSessionType(id, { is_active: !currentStatus })
    if (result.success) loadData()
    else alert(result.error)
  }

  if (loading && !isModalOpen) return <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'var(--font-sans)', color: 'var(--ink-3)' }}>Loading session types...</div>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', color: 'var(--ink)', margin: '0 0 8px' }}>Session Offerings</h1>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '15px', color: 'var(--ink-3)', margin: 0 }}>Create and manage the types of sessions founders can book with you.</p>
        </div>
        <button 
          onClick={() => {
            setEditingType(null)
            setIsModalOpen(true)
          }}
          style={{ padding: '12px 24px', background: 'var(--ink)', color: 'white', borderRadius: '12px', border: 'none', fontSize: '14px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 12px rgba(28,26,22,0.1)' }}
        >
          + Create New Type
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
        {sessionTypes.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', padding: '80px 40px', textAlign: 'center', background: 'var(--white)', borderRadius: '24px', border: '1px dashed var(--cream-border)' }}>
            <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--ink-4)', margin: '0 0 24px' }}>You haven't created any session types yet.</p>
            <button 
              onClick={() => setIsModalOpen(true)}
              style={{ padding: '10px 20px', background: 'var(--cream)', borderRadius: '8px', border: '1px solid var(--cream-border)', fontWeight: 600, cursor: 'pointer' }}
            >
              Add your first session type
            </button>
          </div>
        ) : (
          sessionTypes.map(type => (
            <div key={type.id} style={{ background: 'var(--white)', padding: '28px', borderRadius: '20px', border: '1px solid var(--cream-border)', opacity: type.is_active ? 1 : 0.7, position: 'relative', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '18px', fontWeight: 600, color: 'var(--ink)', margin: 0, paddingRight: '40px' }}>{type.name}</h3>
                <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--ink)', fontFamily: 'var(--font-serif)' }}>₹{type.price_inr}</span>
              </div>
              
              <div style={{ display: 'flex', gap: '12px', fontSize: '13px', color: 'var(--ink-4)', fontFamily: 'var(--font-sans)', marginBottom: '16px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>⏱ {type.duration_minutes} min</span>
                <span>•</span>
                <button 
                  onClick={() => handleToggleStatus(type.id, type.is_active)}
                  style={{ background: 'none', border: 'none', padding: 0, color: type.is_active ? '#166534' : '#991B1B', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
                >
                  {type.is_active ? 'Active' : 'Paused'}
                </button>
              </div>

              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--ink-3)', lineHeight: 1.6, margin: '0 0 24px', flexGrow: 1 }}>{type.description}</p>
              
              <div style={{ display: 'flex', gap: '12px', marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid var(--cream)' }}>
                <button 
                  onClick={() => {
                    setEditingType(type)
                    setIsModalOpen(true)
                  }}
                  style={{ flex: 1, padding: '10px', background: 'var(--cream)', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', color: 'var(--ink-2)' }}
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleDeleteType(type.id)}
                  style={{ padding: '10px 16px', background: 'none', border: '1px solid #FEF2F2', color: '#B91C1C', borderRadius: '8px', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <SessionTypeModal 
          initialData={editingType}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => loadData()}
        />
      )}
    </div>
  )
}
