'use client'

import React, { useState, useEffect } from 'react'
import { Bookmark } from 'lucide-react'
import { useAuth } from '@/components/auth/AuthProvider'
import { toggleBookmark } from '@/lib/bookmarks/actions'

interface BookmarkButtonProps {
  programId: string
  initialBookmarked?: boolean
  size?: number
  showText?: boolean
}

export function BookmarkButton({ 
  programId, 
  initialBookmarked = false, 
  size = 18,
  showText = false
}: BookmarkButtonProps) {
  const { user, openModal } = useAuth()
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked)
  const [isToggling, setIsToggling] = useState(false)

  // Sync state with props and handle auth changes
  useEffect(() => {
    if (!user) {
      setIsBookmarked(false)
    } else {
      setIsBookmarked(initialBookmarked)
    }
  }, [initialBookmarked, user])

  const handleBookmarkClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!user) {
      openModal()
      return
    }

    if (isToggling) return

    setIsToggling(true)
    const previousState = isBookmarked
    // Optimistic update
    setIsBookmarked(!previousState)

    try {
      const result = await toggleBookmark(programId)
      if (result.error) {
        // Revert on error
        setIsBookmarked(previousState)
        console.error('Bookmark toggle failed:', result.error)
      }
    } catch (err) {
      setIsBookmarked(previousState)
      console.error('Bookmark toggle error:', err)
    } finally {
      setIsToggling(false)
    }
  }

  return (
    <button
      onClick={handleBookmarkClick}
      disabled={isToggling}
      style={{
        background: 'none',
        border: 'none',
        padding: '8px',
        cursor: 'pointer',
        color: isBookmarked ? 'var(--accent)' : 'var(--ink-4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        transition: 'all 0.2s ease',
        borderRadius: '8px',
      }}
      className="bookmark-btn-reusable"
      title={isBookmarked ? "Remove bookmark" : "Bookmark program"}
    >
      <Bookmark
        size={size}
        fill={isBookmarked ? 'currentColor' : 'none'}
        strokeWidth={2}
      />
      {showText && (
        <span style={{ 
          fontFamily: 'var(--font-sans)', 
          fontSize: '14px', 
          fontWeight: 500,
          color: isBookmarked ? 'var(--accent)' : 'var(--ink-3)'
        }}>
          {isBookmarked ? 'Saved' : 'Save for later'}
        </span>
      )}
    </button>
  )
}
