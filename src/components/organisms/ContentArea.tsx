'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import rehypeRaw from 'rehype-raw'
import Link from 'next/link'
import type { FullLesson } from '@/lib/school/content'
import type { FlatLesson } from '@/lib/school/navigation'
import { PrevNextNav } from '../molecules/PrevNextNav'

interface ContentAreaProps {
  lesson: FullLesson
  flatLessons: FlatLesson[]
}

/** Renders ::youtube[VIDEO_ID] markers as responsive iframes */
function processYouTubeEmbeds(content: string): string {
  return content.replace(
    /::youtube\[([a-zA-Z0-9_-]+)\]/g,
    (_match, videoId) =>
      `<div class="school-youtube-embed"><iframe src="https://www.youtube.com/embed/${videoId}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`
  )
}

/**
 * Main content area for a Startup School lesson.
 * Handles markdown rendering, YouTube embeds, and navigation.
 * 
 * @param props - lesson data and flat list of all lessons for navigation
 */
export function ContentArea({ lesson, flatLessons }: ContentAreaProps) {
  const processedContent = processYouTubeEmbeds(lesson.content ?? '')

  return (
    <div>
      {/* Category Label */}
      <div style={{ marginBottom: '16px' }}>
        <span style={{ 
          fontFamily: 'var(--font-sans), sans-serif', 
          fontSize: '13px', 
          fontWeight: 600, 
          color: 'var(--accent)', 
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          {lesson.group_label || lesson.module.title}
        </span>
      </div>

      {/* Title */}
      <h1 style={{
        fontFamily: 'var(--font-serif), serif',
        fontSize: '2.75rem',
        fontWeight: 400,
        color: 'var(--ink)',
        marginBottom: '16px',
        lineHeight: 1.15,
        letterSpacing: '-0.02em'
      }}>
        {lesson.title}
      </h1>

      {/* Subtitle */}
      {lesson.subtitle && (
        <p style={{
          fontFamily: 'var(--font-sans), sans-serif',
          fontSize: '1.2rem',
          color: 'var(--ink-2)',
          marginBottom: '40px',
          lineHeight: 1.6,
          maxWidth: '800px'
        }}>
          {lesson.subtitle}
        </p>
      )}

      {/* Content */}
      <div className="school-prose">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeSlug, rehypeRaw]}
        >
          {processedContent}
        </ReactMarkdown>
      </div>

      {/* Prev/Next navigation */}
      <div style={{ marginTop: '48px', paddingTop: '24px', borderTop: '1px solid var(--cream-border)' }}>
        <PrevNextNav
          currentSlug={lesson.slug}
          currentModuleSlug={lesson.module.slug}
          flatLessons={flatLessons}
        />
      </div>
    </div>
  )
}
