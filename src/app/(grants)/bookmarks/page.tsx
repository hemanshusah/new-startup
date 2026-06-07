import { getBookmarkedPrograms, getBookmarkedProgramIds, getBookmarkedMentors } from '@/lib/bookmarks/actions'
import { GrantsGrid } from '@/components/organisms/GrantsGrid'
import { getCurrentProfile } from '@/components/auth/auth-actions'
import { redirect } from 'next/navigation'
import type { ProgramListItem } from '@/types/program'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function BookmarksPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const profile = await getCurrentProfile()
  const resolvedSearchParams = await searchParams
  const currentTab = resolvedSearchParams.tab || 'programs'
  
  if (!profile) {
    redirect('/')
  }

  const [programs, bookmarkedIds, mentors] = await Promise.all([
    getBookmarkedPrograms(),
    getBookmarkedProgramIds(),
    getBookmarkedMentors()
  ])

  const typedPrograms = (programs as any[]).map(p => ({
    ...p,
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
          Your Saved Items
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
          Keep track of the programs and mentors you're interested in and never miss an opportunity.
        </p>
      </header>

      {/* Tab Switcher */}
      <div style={{
        display: 'flex',
        gap: '24px',
        borderBottom: '1px solid var(--cream-border)',
        marginBottom: '40px',
        padding: '0 4px',
      }}>
        <Link
          href="/bookmarks?tab=programs"
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '15px',
            fontWeight: currentTab === 'programs' ? 500 : 400,
            color: currentTab === 'programs' ? 'var(--ink)' : 'var(--ink-3)',
            padding: '12px 0',
            borderBottom: `2px solid ${currentTab === 'programs' ? 'var(--accent)' : 'transparent'}`,
            textDecoration: 'none',
            transition: 'all 0.15s ease',
          }}
        >
          Programs ({typedPrograms.length})
        </Link>
        <Link
          href="/bookmarks?tab=mentors"
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '15px',
            fontWeight: currentTab === 'mentors' ? 500 : 400,
            color: currentTab === 'mentors' ? 'var(--ink)' : 'var(--ink-3)',
            padding: '12px 0',
            borderBottom: `2px solid ${currentTab === 'mentors' ? 'var(--accent)' : 'transparent'}`,
            textDecoration: 'none',
            transition: 'all 0.15s ease',
          }}
        >
          Mentors ({mentors.length})
        </Link>
      </div>

      {currentTab === 'programs' ? (
        typedPrograms.length === 0 ? (
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
            siAds={[]} 
            hideFilters={true}
          />
        )
      ) : (
        mentors.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <p style={{ color: 'var(--ink-3)', fontSize: '16px', marginBottom: '24px' }}>
              You haven't saved any mentors yet.
            </p>
            <Link 
              href="/mentor-connect/mentors" 
              style={{ 
                color: 'var(--accent)', 
                fontWeight: 500, 
                textDecoration: 'none',
                borderBottom: '1px solid var(--accent)'
              }}
            >
              Browse mentor directory
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
            {mentors.map((mentor: any) => (
              <Link
                key={mentor.id}
                href={`/mentor-connect/mentors/${mentor.slug}`}
                style={{
                  textDecoration: 'none',
                  background: 'var(--white)',
                  border: '1px solid var(--cream-border)',
                  borderRadius: '16px',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  {mentor.avatar_url ? (
                    <img 
                      src={mentor.avatar_url} 
                      alt="" 
                      style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--cream-border)' }} 
                    />
                  ) : (
                    <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--cream-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                      👤
                    </div>
                  )}
                  <div>
                    <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', fontWeight: 400, color: 'var(--ink)', margin: '0 0 4px' }}>
                      {mentor.display_name}
                    </h3>
                    <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--ink-3)', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.4 }}>
                      {mentor.headline}
                    </p>
                  </div>
                </div>
                <div style={{ 
                  marginTop: 'auto',
                  padding: '12px',
                  textAlign: 'center',
                  background: 'var(--cream)',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: 'var(--ink)'
                }}>
                  View Profile
                </div>
              </Link>
            ))}
          </div>
        )
      )}
    </div>
  )
}
