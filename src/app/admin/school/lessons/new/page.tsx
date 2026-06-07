import { createServiceClient } from '@/lib/supabase/server'
import { LessonForm } from '@/components/organisms/admin/school/LessonForm'

export default async function NewLessonPage() {
  const supabase = createServiceClient()

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
          New Lesson
        </h1>
        <p style={{ fontFamily: 'var(--font-sans), sans-serif', fontSize: '13px', color: 'var(--ink-3)' }}>
          Create a new lesson for Startup School.
        </p>
      </div>

      <LessonForm modules={modules ?? []} mode="create" />
    </div>
  )
}
