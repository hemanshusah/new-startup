import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getSchoolNavigation, getFlatLessonList } from '@/lib/school/navigation'
import { getLessonBySlug } from '@/lib/school/content'
import { DocLayout } from '@/components/school/DocLayout'
import { ContentArea } from '@/components/school/ContentArea'

interface PageProps {
  params: Promise<{ section: string; slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { section, slug } = await params
  const lesson = await getLessonBySlug(section, slug)
  if (!lesson) return { title: 'Not Found | Startup School' }
  return {
    title: `${lesson.title} — ${lesson.module.title}`,
    description: lesson.subtitle || `Learn about ${lesson.title} in Startup School.`,
  }
}

export default async function SchoolLessonPage({ params }: PageProps) {
  const { section, slug } = await params
  const [lesson, navigation, flatLessons] = await Promise.all([
    getLessonBySlug(section, slug),
    getSchoolNavigation(),
    getFlatLessonList(),
  ])

  if (!lesson) notFound()

  return (
    <DocLayout
      navigation={navigation}
      currentSection={section}
      currentSlug={slug}
    >
      <ContentArea lesson={lesson} flatLessons={flatLessons} />
    </DocLayout>
  )
}
