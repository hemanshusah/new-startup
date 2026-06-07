import { ModuleForm } from '@/components/organisms/admin/school/ModuleForm'

export default function NewModulePage() {
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
          New Module
        </h1>
        <p style={{ fontFamily: 'var(--font-sans), sans-serif', fontSize: '13px', color: 'var(--ink-3)' }}>
          Create a new curriculum module for Startup School.
        </p>
      </div>

      <ModuleForm mode="create" />
    </div>
  )
}
