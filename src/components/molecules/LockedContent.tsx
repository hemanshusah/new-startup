'use client'

import { useAuth } from '../auth/AuthProvider'
import { Lock } from 'lucide-react'

interface LockedContentProps {
  lessonTitle: string
  moduleTitle: string
}

/**
 * Premium placeholder for unauthenticated users in Startup School.
 * Displays a locked state and provides a call to action to sign in.
 */
export function LockedContent({ lessonTitle, moduleTitle }: LockedContentProps) {
  const { openModal } = useAuth()

  return (
    <div style={{
      padding: '80px 24px',
      textAlign: 'center',
      background: 'var(--white)',
      border: '1px solid var(--cream-border)',
      borderRadius: '24px',
      maxWidth: '700px',
      margin: '40px auto',
      boxShadow: '0 12px 40px rgba(28,26,22,0.08)'
    }}>
      <div style={{
        width: '64px',
        height: '64px',
        borderRadius: '50%',
        background: 'var(--accent-light)',
        color: 'var(--accent)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 24px',
      }}>
        <Lock size={28} />
      </div>

      <h2 style={{
        fontFamily: 'var(--font-serif), serif',
        fontSize: '2rem',
        color: 'var(--ink)',
        marginBottom: '16px',
        fontWeight: 400
      }}>
        Join Startup School to View
      </h2>

      <p style={{
        fontFamily: 'var(--font-sans), sans-serif',
        fontSize: '1.1rem',
        color: 'var(--ink-3)',
        lineHeight: 1.6,
        marginBottom: '32px',
        maxWidth: '480px',
        margin: '0 auto 40px'
      }}>
        You're attempting to view <strong>"{lessonTitle}"</strong> from the <strong>{moduleTitle}</strong> module. 
        Please sign in to access our full curriculum and resources.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
        <button
          onClick={() => openModal()}
          style={{
            background: 'var(--ink)',
            color: 'var(--white)',
            padding: '14px 32px',
            borderRadius: '100px',
            fontSize: '16px',
            fontWeight: 500,
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            fontFamily: 'var(--font-sans), sans-serif',
            boxShadow: '0 4px 12px rgba(28,26,22,0.15)'
          }}
          className="locked-cta"
        >
          Sign in to Continue
        </button>
        
        <p style={{ 
          fontSize: '13px', 
          color: 'var(--ink-4)', 
          fontFamily: 'var(--font-sans), sans-serif' 
        }}>
          Free for all Indian startup founders.
        </p>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .locked-cta:hover {
          background: var(--accent) !important;
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(184, 70, 10, 0.2);
        }
      `}} />
    </div>
  )
}
