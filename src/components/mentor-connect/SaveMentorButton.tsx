'use client'

import { useState } from 'react'
import { toggleSavedMentor } from '@/lib/mentor-actions'

interface SaveMentorButtonProps {
  mentorId: string
  initialSaved: boolean
}

export function SaveMentorButton({ mentorId, initialSaved }: SaveMentorButtonProps) {
  const [isSaved, setIsSaved] = useState(initialSaved)
  const [isLoading, setIsLoading] = useState(false)

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault() // prevent navigating to profile link if inside a card
    e.stopPropagation()
    
    if (isLoading) return
    setIsLoading(true)

    try {
      const result = await toggleSavedMentor(mentorId)
      if (result.error) {
        alert(result.error)
      } else if (result.saved !== undefined) {
        setIsSaved(result.saved)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      style={{
        background: 'var(--white)',
        border: `1px solid ${isSaved ? 'var(--accent)' : 'var(--cream-border)'}`,
        borderRadius: '50%',
        width: '36px',
        height: '36px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: isLoading ? 'wait' : 'pointer',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        transition: 'all 0.2s ease',
        color: isSaved ? 'var(--accent)' : 'var(--ink-4)',
      }}
      aria-label={isSaved ? "Unsave mentor" : "Save mentor"}
      title={isSaved ? "Unsave mentor" : "Save mentor"}
    >
      {isSaved ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M17 3H7C5.9 3 5.01 3.9 5.01 5L5 21L12 18L19 21V5C19 3.9 18.1 3 17 3Z" />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        </svg>
      )}
    </button>
  )
}
