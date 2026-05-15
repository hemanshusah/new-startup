'use client'

import { useState, useRef } from 'react'
import { updateMentorAvatar } from '@/lib/mentor-actions'
import { useRouter } from 'next/navigation'

interface AvatarUploadProps {
  currentUrl: string | null
  displayName: string
}

export function AvatarUpload({ currentUrl, displayName }: AvatarUploadProps) {
  const router = useRouter()
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append('avatar', file)

    try {
      const result = await updateMentorAvatar(formData)
      if (result.success) {
        router.refresh()
      } else {
        alert(result.error || 'Failed to upload image')
      }
    } catch (err) {
      alert('Error uploading image')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div style={{ position: 'relative', width: '100px', height: '100px' }}>
      <div style={{ 
        width: '100px', 
        height: '100px', 
        borderRadius: '50%', 
        overflow: 'hidden', 
        border: '3px solid var(--white)', 
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        background: 'var(--cream)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {currentUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={currentUrl} alt={displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span style={{ fontSize: '32px', color: 'var(--ink-4)', fontFamily: 'var(--font-serif)' }}>
            {displayName.charAt(0)}
          </span>
        )}
      </div>

      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        style={{
          position: 'absolute',
          bottom: '0',
          right: '0',
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          background: 'var(--ink)',
          color: 'var(--white)',
          border: '2px solid var(--white)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: uploading ? 'wait' : 'pointer',
          fontSize: '14px',
          padding: 0
        }}
        title="Change profile picture"
      >
        {uploading ? '...' : '✎'}
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
    </div>
  )
}
