import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/server'
import { ModuleForm } from '@/components/organisms/admin/school/ModuleForm'

export default async function EditModulePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = createServiceClient()

  const { data: module } = await supabase
    .from('school_modules')
    .select('*')
    .eq('id', id)
    .single()

  if (!module) notFound()

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
          Edit Module
        </h1>
        <p style={{ fontFamily: 'var(--font-sans), sans-serif', fontSize: '13px', color: 'var(--ink-3)' }}>
          {module.title}
        </p>
      </div>

      <ModuleForm module={module} mode="edit" />
    </div>
  )
}
