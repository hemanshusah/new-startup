import { ProgramForm } from '@/components/admin/ProgramForm'
import { getProgramFormSiteConfig } from '@/lib/site-config'

export default async function NewProgramPage() {
  const { fieldSchema, sectors } = await getProgramFormSiteConfig()

  return (
    <div>
      <h1
        style={{
          fontFamily: 'var(--font-serif), serif',
          fontSize: '24px',
          fontWeight: 400,
          color: 'var(--ink)',
          marginBottom: '24px',
        }}
      >
        New program
      </h1>
      <ProgramForm mode="create" fieldSchema={fieldSchema} sectorOptions={sectors} />
    </div>
  )
}
