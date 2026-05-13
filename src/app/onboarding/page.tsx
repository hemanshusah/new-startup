'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { setAccountIntent } from './actions'
import { Rocket, GraduationCap, Compass, Loader2 } from 'lucide-react'

const INTENTS = [
  {
    id: 'founder',
    title: 'Startup Founder',
    description: 'I am looking for grants, incubation, and mentorship to grow my startup.',
    icon: Rocket,
    color: '#B8460A',
    bg: '#FDF0EA'
  },
  {
    id: 'mentor',
    title: 'Expert Mentor',
    description: 'I want to share my knowledge and guide the next generation of founders.',
    icon: GraduationCap,
    color: '#1E6E2E',
    bg: '#EDF5EA'
  },
  {
    id: 'explorer',
    title: 'Ecosystem Explorer',
    description: 'I am just browsing and want to stay updated on the Indian startup scene.',
    icon: Compass,
    color: '#2B4EA8',
    bg: '#EEF3FD'
  }
]

export default function OnboardingPage() {
  const router = useRouter()
  const [selected, setSelected] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleContinue = async () => {
    if (!selected) return

    setLoading(true)
    setError(null)
    try {
      await setAccountIntent(selected as any)
      if (selected === 'mentor') {
        router.push('/mentor-connect/apply')
      } else {
        router.push('/')
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
      setLoading(false)
    }
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'var(--bg)', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '40px 24px'
    }}>
      <div style={{ maxWidth: '800px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h1 style={{ 
            fontFamily: 'var(--font-serif)', 
            fontSize: '40px', 
            fontWeight: 400, 
            color: 'var(--ink)',
            marginBottom: '12px'
          }}>
            Welcome to GrantsIndia
          </h1>
          <p style={{ 
            fontFamily: 'var(--font-sans)', 
            fontSize: '16px', 
            color: 'var(--ink-3)',
            maxWidth: '500px',
            margin: '0 auto'
          }}>
            How do you plan to use the platform? Select the path that best describes you.
          </p>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
          gap: '20px',
          marginBottom: '40px'
        }}>
          {INTENTS.map((intent) => {
            const Icon = intent.icon
            const isSelected = selected === intent.id
            return (
              <button
                key={intent.id}
                onClick={() => setSelected(intent.id)}
                style={{
                  background: 'var(--white)',
                  border: `2px solid ${isSelected ? intent.color : 'var(--cream-border)'}`,
                  borderRadius: '16px',
                  padding: '32px 24px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  boxShadow: isSelected ? `0 8px 24px ${intent.color}15` : 'none'
                }}
              >
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: intent.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: intent.color
                }}>
                  <Icon size={24} />
                </div>
                <div>
                  <h3 style={{ 
                    fontFamily: 'var(--font-sans)', 
                    fontSize: '18px', 
                    fontWeight: 600, 
                    color: 'var(--ink)',
                    marginBottom: '8px'
                  }}>
                    {intent.title}
                  </h3>
                  <p style={{ 
                    fontFamily: 'var(--font-sans)', 
                    fontSize: '13px', 
                    color: 'var(--ink-3)',
                    lineHeight: 1.5,
                    margin: 0
                  }}>
                    {intent.description}
                  </p>
                </div>
                {isSelected && (
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: intent.color,
                    color: 'var(--white)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px'
                  }}>
                    ✓
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {error && (
          <p style={{ color: '#d93025', fontSize: '14px', textAlign: 'center', marginBottom: '20px' }}>
            {error}
          </p>
        )}

        <div style={{ textAlign: 'center' }}>
          <button
            onClick={handleContinue}
            disabled={!selected || loading}
            style={{
              padding: '14px 48px',
              borderRadius: '8px',
              background: selected ? 'var(--ink)' : 'var(--cream-dark)',
              color: selected ? 'var(--white)' : 'var(--ink-4)',
              border: 'none',
              fontFamily: 'var(--font-sans)',
              fontSize: '16px',
              fontWeight: 600,
              cursor: (!selected || loading) ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            {loading && <Loader2 size={18} className="animate-spin" />}
            {loading ? 'Setting up...' : 'Continue'}
          </button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}} />
    </div>
  )
}
