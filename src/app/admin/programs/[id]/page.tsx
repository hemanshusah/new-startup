import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/server'
import { ProgramForm } from '@/components/admin/ProgramForm'
import type { Program } from '@/types/program'
import { getProgramFormSiteConfig } from '@/lib/site-config'

export default async function EditProgramPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = createServiceClient()

  const { data: program } = await supabase
    .from('programs')
    .select('*')
    .eq('id', id)
    .single()

  if (!program) notFound()

  let programForForm = program as Program
  let wasUnpublishedOnEdit = false
  if (program.published) {
    const { error } = await supabase.from('programs').update({ published: false }).eq('id', id)
    if (!error) {
      programForForm = { ...programForForm, published: false }
      wasUnpublishedOnEdit = true
    }
  }

  const { fieldSchema, sectors } = await getProgramFormSiteConfig()

  return (
    <div>
      <h1
        style={{
          fontFamily: 'DM Serif Display, serif',
          fontSize: '24px',
          fontWeight: 400,
          color: 'var(--ink)',
          marginBottom: '4px',
        }}
      >
        Edit program
      </h1>
      <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '13px', color: 'var(--ink-4)', marginBottom: '24px' }}>
        {program.title}
      </p>
      <ProgramForm
        mode="edit"
        program={programForForm}
        fieldSchema={fieldSchema}
        sectorOptions={sectors}
        wasUnpublishedOnEdit={wasUnpublishedOnEdit}
      />
    </div>
  )
}
