'use client'

import { useState } from 'react'
import { ProfileCompletionTracker } from './ProfileCompletionTracker'
import { RecommendedPrograms } from './RecommendedPrograms'
import type { Profile } from '@/types/profile'
import type { ProgramListItem } from '@/types/program'
import { calculateCompletion } from '@/lib/school/profile-completion'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useAuth } from '../auth/AuthProvider'

interface PersonalizationSectionProps {
  profile: Profile | null
  recommendations: ProgramListItem[]
}

export function PersonalizationSection({ profile: serverProfile, recommendations }: PersonalizationSectionProps) {
  const { profile: clientProfile } = useAuth()
  const [isCollapsed, setIsCollapsed] = useState(false)
  
  // Use client profile as primary source of truth for visibility
  // If client thinks we are logged out, hide immediately
  if (!clientProfile) return null

  // For data calculation, prefer client profile but fallback to server prop
  const profile = (clientProfile || serverProfile) as Profile
  const completion = calculateCompletion(profile)
  const isUnlocked = completion >= 80

  return (
    <div style={{ 
      marginBottom: '40px',
      display: 'var(--personalization-visibility, block)'
    }}>
      {isCollapsed ? (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          background: 'var(--white)',
          border: '1px solid var(--cream-border)',
          borderRadius: '12px',
          padding: '12px 20px',
          marginBottom: '20px',
          boxShadow: '0 4px 12px rgba(28,26,22,0.04)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'var(--bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--ink)'
            }}>
              {completion}%
            </div>
            <div>
              <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--ink)', margin: 0 }}>
                {isUnlocked ? 'Personalization Active' : 'Profile Completion'}
              </p>
              <p style={{ fontSize: '11px', color: 'var(--ink-4)', margin: 0 }}>
                {isUnlocked ? `${recommendations.length} recommendations hidden` : 'Complete profile to unlock recommendations'}
              </p>
            </div>
          </div>
          
          <button 
            onClick={() => setIsCollapsed(false)}
            style={{
              background: 'none',
              border: '1px solid var(--cream-border)',
              borderRadius: '8px',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: 500,
              color: 'var(--ink-2)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            See More <ChevronDown size={14} />
          </button>
        </div>
      ) : (
        <>
          {completion < 100 && (
            <ProfileCompletionTracker profile={profile} onHide={() => setIsCollapsed(true)} />
          )}
          
          {isUnlocked && recommendations.length > 0 && (
            <RecommendedPrograms programs={recommendations} />
          )}
        </>
      )}
    </div>
  )
}
