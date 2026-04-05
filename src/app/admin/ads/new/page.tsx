import { AdForm } from '@/components/admin/AdForm'

export default function NewAdPage() {
  return (
    <div>
      <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '24px', fontWeight: 400, color: 'var(--ink)', marginBottom: '24px' }}>New ad</h1>
      <AdForm mode="create" />
    </div>
  )
}
