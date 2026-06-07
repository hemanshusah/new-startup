'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Search, BookOpen, FileText, Menu, ChevronRight, AlignLeft } from 'lucide-react'
import type { SchoolModule } from '@/lib/school/navigation'

interface DocLayoutProps {
  children: React.ReactNode
  navigation: { modules: SchoolModule[] }
  currentSection?: string
  currentSlug?: string
}

/**
 * Core layout for the Startup School curriculum.
 * Features a triple-column design:
 * 1. Fixed Sidebar for navigation (Left)
 * 2. Content Area for reading (Center)
 * 3. Table of Contents (Right)
 * 
 * Includes mobile responsiveness, keyboard shortcuts (Cmd+K for search),
 * and scroll-synchronized TOC.
 */
export function DocLayout({
  children,
  navigation,
  currentSection,
  currentSlug,
}: DocLayoutProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  // Cmd+K / Ctrl+K shortcut for search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen((o) => !o)
      }
      if (e.key === 'Escape') setSearchOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // Lock body scroll when mobile nav is open
  useEffect(() => {
    if (mobileNavOpen) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = prev }
    }
  }, [mobileNavOpen])

  return (
    <div className="school-shell">
      {/* Top sub-header below standard Navbar */}
      <SchoolTopNav
        modules={navigation.modules}
        currentSection={currentSection}
        onOpenSearch={() => setSearchOpen(true)}
      />

      {/* Mobile backdrop */}
      {mobileNavOpen && (
        <div className="school-mobile-backdrop" onClick={() => setMobileNavOpen(false)} />
      )}

      {/* Left Sidebar */}
      <aside className={`school-sidebar${mobileNavOpen ? ' school-sidebar-mobile-open' : ''}`}>
        <SchoolSidebar
          modules={navigation.modules}
          currentSection={currentSection}
          currentSlug={currentSlug}
          onNavigate={() => setMobileNavOpen(false)}
        />
      </aside>

      {/* Main content */}
      <main className="school-content">
        {/* Mobile Curriculum Action Bar */}
        <div className="school-mobile-action-bar" style={{
          display: 'none',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          background: 'var(--white)',
          border: '1px solid var(--cream-border)',
          borderRadius: '12px',
          marginBottom: '28px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
        }}>
          <button
            onClick={() => setMobileNavOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'none',
              border: 'none',
              color: 'var(--ink)',
              fontFamily: 'var(--font-sans)',
              fontSize: '13.5px',
              fontWeight: 600,
              cursor: 'pointer',
              padding: 0
            }}
          >
            <Menu size={16} color="var(--accent)" />
            <span>Curriculum Menu</span>
          </button>
          <button
            onClick={() => setSearchOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'var(--bg)',
              border: 'none',
              padding: '6px 12px',
              borderRadius: '20px',
              color: 'var(--ink-3)',
              fontFamily: 'var(--font-sans)',
              fontSize: '12.5px',
              cursor: 'pointer'
            }}
          >
            <Search size={14} />
            <span>Search</span>
          </button>
        </div>

        {children}
      </main>

      {/* Right TOC */}
      <div className="school-toc">
        <SchoolTOC />
      </div>

      {/* Search modal */}
      {searchOpen && (
        <SchoolSearchModal onClose={() => setSearchOpen(false)} />
      )}
      <DocLayoutStyles />
    </div>
  )
}

/** Global hover styles for DocLayout components */
function DocLayoutStyles() {
  return (
    <style dangerouslySetInnerHTML={{
      __html: `
      .school-sidebar-link {
        transition: all 0.2s ease !important;
      }
      .school-sidebar-link:hover:not(.active) {
        background: var(--bg) !important;
        color: var(--ink) !important;
        transform: translateX(4px);
      }
      .school-toc-link {
        transition: all 0.2s ease !important;
      }
      .school-toc-link:hover:not(.active) {
        color: var(--ink) !important;
        padding-left: 4px !important;
      }
      .school-hamburger:hover {
        background: var(--bg) !important;
        border-color: var(--ink-4) !important;
      }
      .search-result-item {
        transition: all 0.2s ease !important;
      }
      .search-result-item:hover {
        background: var(--bg) !important;
        transform: translateX(4px);
      }
      
      /* Dashboard Button Distinct Hover - Prevents matching background & text bug */
      .school-dashboard-btn {
        background: #0029FF !important;
        color: white !important;
        transition: all 0.2s ease !important;
      }
      .school-dashboard-btn:hover {
        background: var(--ink) !important;
        color: var(--white) !important;
        box-shadow: 0 4px 12px rgba(28, 26, 22, 0.15) !important;
        transform: translateY(-1px) !important;
      }

      /* Desktop sub-navbar sticky alignment below global Navbar (56px) */
      @media (min-width: 1025px) {
        .school-topnav {
          display: flex !important;
          position: sticky !important;
          top: 56px !important;
          z-index: 40 !important;
        }
        .school-sidebar {
          top: 160px !important;
          height: calc(100vh - 160px) !important;
        }
        .school-toc {
          top: 160px !important;
          height: calc(100vh - 160px) !important;
        }
      }

      /* Hide sub-navbar on mobile for clutter-free reading */
      @media (max-width: 1024px) {
        .school-topnav {
          display: none !important;
        }
        .school-mobile-action-bar {
          display: flex !important;
        }
      }
    `}} />
  )
}

// ── TopNav Sub-component ─────────────────────────────────────

function SchoolTopNav({
  modules,
  currentSection,
  onOpenSearch,
}: {
  modules: SchoolModule[]
  currentSection?: string
  onOpenSearch: () => void
}) {
  return (
    <nav className="school-topnav" style={{ display: 'flex', flexDirection: 'column', background: 'var(--white)', borderBottom: '1px solid var(--cream-border)' }}>
      {/* Top Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 24px' }}>

        {/* Left Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/school" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
            <span style={{ fontFamily: 'var(--font-serif), serif', fontSize: '20px', fontWeight: 400, color: 'var(--ink)', letterSpacing: '-0.02em' }}>
              Startup<span style={{ color: '#0029FF' }}>School</span>
            </span>
          </Link>
        </div>

        {/* Center: Search Bar */}
        <div className="school-desktop-search" style={{ flex: 1, maxWidth: '440px', margin: '0 24px' }}>
          <button
            onClick={onOpenSearch}
            style={{
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              padding: '8px 12px',
              background: 'var(--bg)',
              borderRadius: '8px',
              border: '1px solid transparent',
              color: 'var(--ink-3)',
              fontFamily: 'var(--font-sans), sans-serif',
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            <Search size={16} style={{ marginRight: '10px', color: 'var(--ink-4)' }} />
            <span style={{ flex: 1, textAlign: 'left' }}>Search curriculum...</span>
            <kbd style={{
              fontSize: '11px',
              background: 'var(--white)',
              padding: '2px 6px',
              borderRadius: '4px',
              border: '1px solid var(--cream-border)',
              color: 'var(--ink-4)',
              fontWeight: 500
            }}>⌘K</kbd>
          </button>
        </div>

        {/* Right Actions */}
        <div className="school-desktop-actions" style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <Link href="/school" className="school-dashboard-btn" style={{
            background: '#0029FF',
            color: 'white',
            padding: '8px 18px',
            borderRadius: '24px',
            fontSize: '13px',
            fontWeight: 600,
            textDecoration: 'none',
            fontFamily: 'var(--font-sans)',
            boxShadow: '0 2px 8px rgba(0, 41, 255, 0.15)'
          }}>
            Dashboard ›
          </Link>
        </div>
      </div>

      {/* Bottom Row (Tabs) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        overflowX: 'auto',
        scrollbarWidth: 'none',
        gap: '28px',
        borderTop: '1px solid var(--cream-border)'
      }}>
        {modules.map((mod) => {
          const isActive = currentSection === mod.slug;
          return (
            <Link
              key={mod.slug}
              href={`/school/${mod.slug}/${mod.lessons[0]?.slug ?? ''}`}
              style={{
                fontFamily: 'var(--font-sans), sans-serif',
                fontSize: '13.5px',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? 'var(--ink)' : 'var(--ink-3)',
                padding: '12px 0',
                borderBottom: `2px solid ${isActive ? '#0029FF' : 'transparent'}`,
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                marginTop: '1px',
                transition: 'all 0.15s ease'
              }}
            >
              {mod.title}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

// ── Sidebar Sub-component ────────────────────────────────────

/**
 * Vertical sidebar navigation for the active module.
 * Groups lessons by their `group_label` and highlights the current lesson.
 */
function SchoolSidebar({
  modules,
  currentSection,
  currentSlug,
  onNavigate,
}: {
  modules: SchoolModule[]
  currentSection?: string
  currentSlug?: string
  onNavigate?: () => void
}) {
  // Find the active module
  const activeModule = modules.find((m) => m.slug === currentSection) || modules[0]
  if (!activeModule) return null

  // Group lessons by group_label
  const groups: Record<string, typeof activeModule.lessons> = {}
  for (const lesson of activeModule.lessons) {
    const label = lesson.group_label || 'Lessons'
    if (!groups[label]) groups[label] = []
    groups[label].push(lesson)
  }

  return (
    <div style={{ padding: '8px 0' }}>
      {Object.entries(groups).map(([label, lessons]) => (
        <div key={label} style={{ marginBottom: '28px' }}>
          <p style={{
            fontFamily: 'var(--font-sans), sans-serif',
            fontSize: '11.5px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            color: 'var(--ink)',
            padding: '0 24px',
            marginBottom: '10px',
          }}>
            {label}
          </p>
          {lessons.map((lesson) => {
            const isActive = currentSection === activeModule.slug && currentSlug === lesson.slug
            return (
              <Link
                key={lesson.id}
                href={`/school/${activeModule.slug}/${lesson.slug}`}
                className={`school-sidebar-link${isActive ? ' active' : ''}`}
                onClick={onNavigate}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px 16px 8px 24px',
                  fontFamily: 'var(--font-sans), sans-serif',
                  fontSize: '13.5px',
                  color: isActive ? 'var(--accent)' : 'var(--ink-3)',
                  textDecoration: 'none',
                  background: isActive ? 'var(--accent-light)' : 'transparent',
                  margin: '2px 12px',
                  borderRadius: '6px',
                  fontWeight: isActive ? 500 : 400
                }}
              >
                <FileText size={14} style={{ color: isActive ? 'var(--accent)' : 'var(--ink-4)', flexShrink: 0 }} />
                <span>{lesson.title}</span>
              </Link>
            )
          })}
        </div>
      ))}
    </div>
  )
}

// ── TOC Sub-component ────────────────────────────────────────

/**
 * Auto-generated Table of Contents for the current lesson.
 * Scans the DOM for H2/H3 tags and uses IntersectionObserver to highlight active sections.
 */
function SchoolTOC() {
  const [headings, setHeadings] = useState<{ id: string; text: string; level: number }[]>([])
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    // Defer DOM scan to next frame to avoid React concurrent mode conflicts
    const raf = requestAnimationFrame(() => {
      const contentEl = document.querySelector('.school-content')
      if (!contentEl) return

      const h2h3 = contentEl.querySelectorAll('h2[id], h3[id]')
      const parsed = Array.from(h2h3).map((el) => ({
        id: el.id,
        text: el.textContent ?? '',
        level: el.tagName === 'H2' ? 2 : 3,
      }))
      setHeadings(parsed)

      // IntersectionObserver for scroll sync
      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              setActiveId(entry.target.id)
            }
          }
        },
        { rootMargin: '-56px 0px -70% 0px' }
      )

      h2h3.forEach((el) => observer.observe(el))

        // Store cleanup
        ; (window as any).__schoolTocObserver = observer
    })

    return () => {
      cancelAnimationFrame(raf)
      const observer = (window as any).__schoolTocObserver
      if (observer) observer.disconnect()
    }
  }, [])

  if (headings.length === 0) return null

  return (
    <div style={{ padding: '8px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <AlignLeft size={14} style={{ color: 'var(--ink-4)' }} />
        <p style={{
          fontFamily: 'var(--font-sans), sans-serif',
          fontSize: '11.5px',
          fontWeight: 600,
          color: 'var(--ink)',
        }}>
          On this page
        </p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {headings.map((h) => (
          <a
            key={h.id}
            href={`#${h.id}`}
            className={`school-toc-link${activeId === h.id ? ' active' : ''}`}
            style={{
              paddingLeft: h.level === 3 ? '16px' : '0',
              fontFamily: 'var(--font-sans), sans-serif',
              fontSize: '13px',
              color: activeId === h.id ? 'var(--accent)' : 'var(--ink-3)',
              textDecoration: 'none',
              lineHeight: 1.4,
              fontWeight: activeId === h.id ? 500 : 400
            }}
          >
            {h.text}
          </a>
        ))}
      </div>
    </div>
  )
}

// ── Search Modal Sub-component ───────────────────────────────

/**
 * Full-screen search modal.
 * Loads a JSON search index on demand and uses Fuse.js for fuzzy matching.
 */
function SchoolSearchModal({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [index, setIndex] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Load search index on mount
  useEffect(() => {
    fetch('/api/school/search-index')
      .then((r) => r.json())
      .then((data) => {
        setIndex(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  // Search with Fuse.js
  useEffect(() => {
    if (!query.trim() || index.length === 0) {
      setResults([])
      return
    }

    import('fuse.js').then(({ default: Fuse }) => {
      const fuse = new Fuse(index, {
        keys: ['title', 'moduleTitle', 'excerpt'],
        threshold: 0.3,
      })
      setResults(fuse.search(query).slice(0, 8))
    })
  }, [query, index])

  return (
    <div className="school-search-overlay" onClick={onClose}>
      <div className="school-search-box" onClick={(e) => e.stopPropagation()}>
        {/* Search input */}
        <div style={{ padding: '16px', borderBottom: '1px solid var(--cream-border)' }}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search lessons..."
            autoFocus
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontFamily: 'var(--font-sans), sans-serif',
              fontSize: '16px',
              color: 'var(--ink)',
            }}
          />
        </div>

        {/* Results */}
        <div style={{ padding: '8px' }}>
          {loading && (
            <p style={{ padding: '16px', fontFamily: 'var(--font-sans), sans-serif', fontSize: '13px', color: 'var(--ink-3)', textAlign: 'center' }}>Loading...</p>
          )}
          {!loading && query.trim() && results.length === 0 && (
            <p style={{ padding: '16px', fontFamily: 'var(--font-sans), sans-serif', fontSize: '13px', color: 'var(--ink-3)', textAlign: 'center' }}>No results found.</p>
          )}
          {results.map((r: any) => (
            <Link
              key={r.item.id}
              href={`/school/${r.item.moduleSlug}/${r.item.slug}`}
              onClick={onClose}
              className="search-result-item"
              style={{
                display: 'block',
                padding: '10px 12px',
                borderRadius: '8px',
                textDecoration: 'none',
              }}
            >
              <p style={{ fontFamily: 'var(--font-sans), sans-serif', fontSize: '14px', fontWeight: 500, color: 'var(--ink)', marginBottom: '2px' }}>
                {r.item.title}
              </p>
              <p style={{ fontFamily: 'var(--font-sans), sans-serif', fontSize: '12px', color: 'var(--accent)', marginBottom: '2px' }}>
                {r.item.moduleTitle}
              </p>
              <p style={{ fontFamily: 'var(--font-sans), sans-serif', fontSize: '12px', color: 'var(--ink-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {r.item.excerpt}
              </p>
            </Link>
          ))}
          {!loading && !query.trim() && (
            <p style={{ padding: '16px', fontFamily: 'var(--font-sans), sans-serif', fontSize: '13px', color: 'var(--ink-3)', textAlign: 'center' }}>Type to search all lessons...</p>
          )}
        </div>
      </div>
    </div>
  )
}
