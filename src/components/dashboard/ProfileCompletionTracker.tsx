'use client'

import { calculateCompletion, getMissingFields } from '@/lib/school/profile-completion'
import type { Profile } from '@/types/profile'
import { Rocket, ChevronRight, CheckCircle2, AlertCircle, ChevronUp } from 'lucide-react'
import Link from 'next/link'

interface ProfileCompletionTrackerProps {
  profile: Profile | null
  onHide?: () => void
}

/**
 * Premium progress tracker for Startup Profile completion.
 * Displayed on the School Dashboard to encourage users to reach the 80% threshold.
 */
export function ProfileCompletionTracker({ profile, onHide }: ProfileCompletionTrackerProps) {
  const completion = calculateCompletion(profile)
  const isComplete = completion >= 100
  const isUnlocked = completion >= 80
  const missing = getMissingFields(profile)

  return (
    <div className="tracker-card" style={{
      background: 'var(--white)',
      border: '1px solid var(--cream-border)',
      borderRadius: '20px',
      padding: '24px',
      marginBottom: '32px',
      boxShadow: '0 8px 24px rgba(28,26,22,0.06)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div>
          <h3 style={{ 
            fontFamily: 'var(--font-serif), serif', 
            fontSize: '1.25rem', 
            color: 'var(--ink)', 
            marginBottom: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            {isUnlocked ? <Rocket size={20} className="rocket-icon" /> : <AlertCircle size={20} color="var(--accent)" />}
            {isUnlocked ? 'Personalization Unlocked' : 'Complete Your Startup Profile'}
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--ink-4)', maxWidth: '400px' }}>
            {isUnlocked 
              ? 'Your profile is ready! You can now see personalized program recommendations below.' 
              : `Reach 80% to unlock personalized recommendations for your startup.`}
          </p>
        </div>
        
        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {onHide && (
              <button 
                onClick={onHide}
                style={{
                  background: 'none',
                  border: '1px solid var(--cream-border)',
                  borderRadius: '6px',
                  padding: '4px 10px',
                  fontSize: '11px',
                  fontWeight: 500,
                  color: 'var(--ink-4)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.2s ease'
                }}
              >
                Hide <ChevronUp size={12} />
              </button>
            )}
            <span style={{ 
              fontSize: '24px', 
              fontWeight: 600, 
              color: isUnlocked ? 'var(--accent)' : 'var(--ink)',
              fontFamily: 'var(--font-sans), sans-serif'
            }}>
              {completion}%
            </span>
          </div>
          <p style={{ fontSize: '11px', color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Profile Health</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ 
        height: '8px', 
        background: 'var(--bg)', 
        borderRadius: '4px', 
        marginBottom: '20px',
        position: 'relative'
      }}>
        <div style={{ 
          width: `${completion}%`, 
          height: '100%', 
          background: isUnlocked ? 'var(--accent)' : 'var(--ink)', 
          borderRadius: '4px',
          transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
        }} />
        {/* 80% marker */}
        <div style={{
          position: 'absolute',
          left: '80%',
          top: '-4px',
          bottom: '-4px',
          width: '2px',
          background: 'var(--cream-border)',
          zIndex: 1
        }} />
      </div>

      {/* Action Area */}
      {!isComplete && (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          background: 'var(--bg)',
          padding: '12px 16px',
          borderRadius: '12px'
        }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', color: 'var(--ink-3)', fontWeight: 500 }}>Next steps:</span>
            {missing.slice(0, 2).map((field, i) => (
              <span key={field} style={{ 
                fontSize: '11px', 
                color: 'var(--ink-2)', 
                background: 'var(--white)',
                padding: '2px 8px',
                borderRadius: '100px',
                border: '1px solid var(--cream-border)'
              }}>
                + {field}
              </span>
            ))}
            {missing.length > 2 && <span style={{ fontSize: '11px', color: 'var(--ink-4)' }}>+{missing.length - 2} more</span>}
          </div>
          
          <Link href="/profile" style={{
            fontSize: '13px',
            color: 'var(--accent)',
            fontWeight: 500,
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }} className="edit-link">
            Complete Profile <ChevronRight size={14} />
          </Link>
        </div>
      )}

      {isComplete && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent)', fontSize: '13px', fontWeight: 500 }}>
          <CheckCircle2 size={16} />
          Profile 100% complete. You are all set!
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .edit-link:hover {
          text-decoration: underline;
        }
        .rocket-icon {
          animation: wiggle 2s ease-in-out infinite;
        }
        @keyframes wiggle {
          0%, 100% { transform: rotate(-5deg); }
          50% { transform: rotate(5deg); }
        }
        .tracker-card {
          transition: transform 0.2s ease;
        }
        .tracker-card:hover {
          transform: translateY(-2px);
        }
      `}} />
    </div>
  )
}
