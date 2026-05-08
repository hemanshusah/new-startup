import Link from 'next/link'
import type { FlatLesson } from '@/lib/school/navigation'

interface PrevNextNavProps {
  currentSlug: string
  currentModuleSlug: string
  flatLessons: FlatLesson[]
}

export function PrevNextNav({ currentSlug, currentModuleSlug, flatLessons }: PrevNextNavProps) {
  const currentIndex = flatLessons.findIndex(
    (l) => l.slug === currentSlug && l.moduleSlug === currentModuleSlug
  )

  const prev = currentIndex > 0 ? flatLessons[currentIndex - 1] : null
  const next = currentIndex < flatLessons.length - 1 ? flatLessons[currentIndex + 1] : null

  if (!prev && !next) return null

  const cardStyle: React.CSSProperties = {
    flex: 1,
    padding: '16px 20px',
    border: '1px solid var(--cream-border)',
    borderRadius: 'var(--radius-md)',
    textDecoration: 'none',
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
      {/* Previous */}
      {prev ? (
        <Link href={`/school/${prev.moduleSlug}/${prev.slug}`} style={cardStyle}>
          <p style={{ fontFamily: 'var(--font-sans), sans-serif', fontSize: '12px', color: 'var(--ink-4)', marginBottom: '4px' }}>
            ← Previous
          </p>
          <p style={{ fontFamily: 'var(--font-sans), sans-serif', fontSize: '14px', fontWeight: 500, color: 'var(--ink)' }}>
            {prev.title}
          </p>
        </Link>
      ) : (
        <div style={{ flex: 1 }} />
      )}

      {/* Next */}
      {next ? (
        <Link href={`/school/${next.moduleSlug}/${next.slug}`} style={{ ...cardStyle, textAlign: 'right' }}>
          <p style={{ fontFamily: 'var(--font-sans), sans-serif', fontSize: '12px', color: 'var(--ink-4)', marginBottom: '4px' }}>
            Next →
          </p>
          <p style={{ fontFamily: 'var(--font-sans), sans-serif', fontSize: '14px', fontWeight: 500, color: 'var(--ink)' }}>
            {next.title}
          </p>
        </Link>
      ) : (
        <div style={{ flex: 1 }} />
      )}
    </div>
  )
}
