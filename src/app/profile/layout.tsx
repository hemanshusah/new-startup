import { ProfileNav } from '@/components/molecules/ProfileNav'

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return (
    <main style={{ background: 'var(--cream)', minHeight: 'calc(100vh - 56px)', padding: '40px 24px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '32px',
          fontWeight: 400,
          color: 'var(--ink)',
          marginBottom: '24px'
        }}>
          Dashboard
        </h1>
        <ProfileNav />
        {children}
      </div>
    </main>
  )
}
