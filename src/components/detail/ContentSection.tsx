import type { Program } from '@/types/program'

const sectionHeadingStyle: React.CSSProperties = {
  fontFamily: 'var(--font-section), var(--font-serif)',
  fontSize: 'calc(var(--font-size-heading) * 0.7)',
  fontWeight: 'var(--font-weight-section)' as any,
  fontStyle: 'var(--font-style-section)' as any,
  color: 'var(--ink)',
  marginBottom: '14px',
}

const bodyTextStyle: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: 'var(--font-size-body)',
  fontWeight: 'var(--font-weight-body)' as any,
  fontStyle: 'var(--font-style-body)' as any,
  color: 'var(--ink-2)',
  lineHeight: 1.7,
  margin: 0,
}

interface ContentSectionsProps {
  program: Program
  applyUrl?: string | null
  /** When true, skips the About section (rendered separately in page.tsx between the inline ads) */
  excludeAbout?: boolean
}

/**
 * ContentSections — PROGRESS.md 4.4
 * About, What you get, Eligibility, Focus sectors, How to apply.
 * Sections with null/empty data are omitted entirely.
 * Section gap: 32px.
 */
export function ContentSections({ program, applyUrl, excludeAbout = false }: ContentSectionsProps) {
  const sections: React.ReactNode[] = []

  // ── About ────────────────────────────────────────────────────────
  if (!excludeAbout && program.about) {
    sections.push(
      <section key="about" aria-labelledby="section-about">
        <h2 id="section-about" style={sectionHeadingStyle}>
          About the program
        </h2>
        {program.about.split('\n\n').map((para, i) => (
          <p key={i} style={{ ...bodyTextStyle, marginBottom: '12px' }}>
            {para}
          </p>
        ))}
      </section>
    )
  }

  // ── What you get ──────────────────────────────────────────────────
  if (program.what_you_get && program.what_you_get.length > 0) {
    sections.push(
      <section key="what" aria-labelledby="section-what">
        <h2 id="section-what" style={sectionHeadingStyle}>
          What you get
        </h2>
        <ul
          style={{
            margin: 0,
            padding: '0 0 0 20px',
            listStyleType: 'none',
          }}
        >
          {program.what_you_get.map((item, i) => (
            <li
              key={i}
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 'var(--font-size-body)',
                fontWeight: 300,
                color: 'var(--ink-2)',
                lineHeight: 1.65,
                marginBottom: '8px',
                paddingLeft: '4px',
                position: 'relative',
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  left: '-16px',
                  color: 'var(--accent)',
                  fontWeight: 500,
                }}
                aria-hidden="true"
              >
                ✦
              </span>
              {item}
            </li>
          ))}
        </ul>
      </section>
    )
  }

  // ── Eligibility ───────────────────────────────────────────────────
  if (program.eligibility && program.eligibility.length > 0) {
    sections.push(
      <section key="eligibility" aria-labelledby="section-eligibility">
        <h2 id="section-eligibility" style={sectionHeadingStyle}>
          Eligibility
        </h2>
        <ul style={{ margin: 0, padding: '0 0 0 20px', listStyleType: 'none' }}>
          {program.eligibility.map((item, i) => (
            <li
              key={i}
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 'var(--font-size-body)',
                fontWeight: 300,
                color: 'var(--ink-2)',
                lineHeight: 1.65,
                marginBottom: '8px',
                paddingLeft: '4px',
                position: 'relative',
              }}
            >
              <span
                style={{ position: 'absolute', left: '-16px', color: 'var(--ink-4)' }}
                aria-hidden="true"
              >
                ›
              </span>
              {item}
            </li>
          ))}
        </ul>
      </section>
    )
  }

  // ── Focus sectors ──────────────────────────────────────────────────
  if (program.sectors && program.sectors.length > 0) {
    sections.push(
      <section key="sectors" aria-labelledby="section-sectors">
        <h2 id="section-sectors" style={sectionHeadingStyle}>
          Focus sectors
        </h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {program.sectors.map((sector) => (
            <span
              key={sector}
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '12px',
                fontWeight: 500,
                color: 'var(--ink-2)',
                background: 'var(--cream-dark)',
                border: '1px solid var(--cream-border)',
                borderRadius: '20px',
                padding: '5px 14px',
              }}
            >
              {sector}
            </span>
          ))}
        </div>
      </section>
    )
  }

  // ── How to apply ───────────────────────────────────────────────────
  if (program.how_to_apply) {
    sections.push(
      <section key="how" aria-labelledby="section-how">
        <h2 id="section-how" style={sectionHeadingStyle}>
          How to apply
        </h2>
        {program.how_to_apply.split('\n\n').map((para, i) => (
          <p key={i} style={{ ...bodyTextStyle, marginBottom: '12px' }}>
            {para}
          </p>
        ))}
        {applyUrl && (
          <a
            href={applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            id="program-apply-btn-content"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              fontFamily: 'var(--font-sans)',
              fontSize: 'var(--font-size-body)',
              fontWeight: 500,
              color: 'var(--cream)',
              background: 'var(--ink)',
              borderRadius: '8px',
              padding: '10px 20px',
              textDecoration: 'none',
              marginTop: '8px',
            }}
          >
            Apply now ↗
          </a>
        )}
      </section>
    )
  }

  if (sections.length === 0) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {sections}
    </div>
  )
}
