import { createClient } from '@/lib/supabase/server'
import { GrantsGrid } from '@/components/listing/GrantsGrid'
import { getCurrentProfile } from '@/components/auth/auth-actions'
import { getBookmarkedPrograms, getBookmarkedProgramIds } from '@/lib/bookmarks/actions'
import { redirect } from 'next/navigation'
import type { ProgramListItem } from '@/types/program'

export const dynamic = 'force-dynamic'

export default async function BookmarksPage() {
  const profile = await getCurrentProfile()
  
  if (!profile) {
    redirect('/')
  }

  const [programs, bookmarkedIds] = await Promise.all([
    getBookmarkedPrograms(),
    getBookmarkedProgramIds()
  ])

  // Map to ProgramListItem type if needed, or assume it matches
  const typedPrograms = (programs as any[]).map(p => ({
    ...p,
    // Ensure all required fields for ProgramListItem are present
  })) as ProgramListItem[]

  return (
    <div
      className="listing-wrap"
      style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '48px 24px 80px',
      }}
    >
      <header style={{ marginBottom: '40px' }}>
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '12px',
            fontWeight: 500,
            color: 'var(--accent)',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginBottom: '10px',
          }}
        >
          Your Saved Programs
        </p>
        <h1
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(32px, 5vw, 42px)',
            fontWeight: 400,
            color: 'var(--ink)',
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
            marginBottom: '12px',
          }}
        >
          My <span style={{ color: 'var(--accent)', fontStyle: 'italic' }}>Bookmarks</span>
        </h1>
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '15px',
            fontWeight: 300,
            color: 'var(--ink-3)',
            lineHeight: 1.6,
            maxWidth: '520px',
          }}
        >
          Keep track of the programs you're interested in and never miss an application deadline.
        </p>
      </header>

      <div
        style={{
          height: '1px',
          background: 'var(--cream-border)',
          width: '100%',
          marginBottom: '40px',
        }}
      />

      {typedPrograms.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <p style={{ color: 'var(--ink-3)', fontSize: '16px', marginBottom: '24px' }}>
            You haven't bookmarked any programs yet.
          </p>
          <a 
            href="/" 
            style={{ 
              color: 'var(--accent)', 
              fontWeight: 500, 
              textDecoration: 'none',
              borderBottom: '1px solid var(--accent)'
            }}
          >
            Browse all programs
          </a>
        </div>
      ) : (
        <GrantsGrid
          programs={typedPrograms}
          bookmarkedIds={bookmarkedIds}
          siAds={[]} // No ads on bookmarks page for cleaner look
          hideFilters={true}
        />
      )}
    </div>
  )
}
