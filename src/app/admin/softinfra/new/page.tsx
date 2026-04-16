import { SIForm } from '@/components/admin/SIForm'

export default function NewSIPage() {
  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-serif), serif', fontSize: '24px', fontWeight: 400, color: 'var(--ink)', marginBottom: '24px' }}>New item</h1>
      <SIForm mode="create" />
    </div>
  )
}
