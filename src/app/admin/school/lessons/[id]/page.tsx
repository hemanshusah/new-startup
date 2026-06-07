import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/server'
import { LessonForm } from '@/components/organisms/admin/school/LessonForm'

export default async function EditLessonPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = createServiceClient()

  const { data: lesson } = await supabase
    .from('school_lessons')
    .select('*')
    .eq('id', id)
    .single()

  if (!lesson) notFound()

  const { data: modules } = await supabase
    .from('school_modules')
    .select('id, title, slug')
    .order('order_index', { ascending: true })

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1
          style={{
            fontFamily: 'var(--font-serif), serif',
            fontSize: '24px',
            fontWeight: 400,
            color: 'var(--ink)',
            marginBottom: '4px',
          }}
        >
          Edit Lesson
        </h1>
        <p style={{ fontFamily: 'var(--font-sans), sans-serif', fontSize: '13px', color: 'var(--ink-3)' }}>
          {lesson.title}
        </p>
      </div>

      <LessonForm lesson={lesson} modules={modules ?? []} mode="edit" />
    </div>
  )
}
