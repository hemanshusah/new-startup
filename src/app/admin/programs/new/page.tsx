import { ProgramForm } from '@/components/admin/ProgramForm'

export default function NewProgramPage() {
  return (
    <div>
      <h1
        style={{
          fontFamily: 'DM Serif Display, serif',
          fontSize: '24px',
          fontWeight: 400,
          color: 'var(--ink)',
          marginBottom: '24px',
        }}
      >
        New program
      </h1>
      <ProgramForm mode="create" />
    </div>
  )
}
