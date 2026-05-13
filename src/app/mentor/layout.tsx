import { redirect } from 'next/navigation'
import { getAuthenticatedUser } from '@/lib/auth-utils'
import { createServiceClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function MentorLayout({ children }: { children: React.ReactNode }) {
  const user = await getAuthenticatedUser()

  if (!user) {
    redirect('/?redirect=/mentor/availability')
  }

  const supabase = createServiceClient()

  const { data: mentor } = await supabase
    .from('mentor_profiles')
    .select('status, display_name, avatar_url')
    .eq('user_id', user.id)
    .single()

  if (!mentor) {
    redirect('/mentor-connect/apply')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('phone, email')
    .eq('id', user.id)
    .single()

  const isPending = mentor.status === 'pending'
  const isSuspended = mentor.status === 'suspended'
  const isRejected = mentor.status === 'rejected'

  if (isRejected) {
    return (
      <main style={{ background: 'var(--cream)', minHeight: 'calc(100vh - 56px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{ background: 'var(--white)', border: '1px solid var(--cream-border)', borderRadius: '16px', padding: '60px 40px', maxWidth: '600px', textAlign: 'center' }}>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '32px', color: '#B01F1F', margin: '0 0 16px' }}>Application Rejected</h1>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '16px', color: 'var(--ink-3)', lineHeight: 1.6, margin: '0 0 32px' }}>
            We're sorry, but your mentor application was not approved at this time.
          </p>
          <Link href="/mentor-connect" style={{ padding: '14px 28px', background: 'var(--ink)', color: 'var(--white)', borderRadius: '8px', fontFamily: 'var(--font-sans)', fontSize: '15px', fontWeight: 500, textDecoration: 'none' }}>
            Return to Homepage
          </Link>
        </div>
      </main>
    )
  }

  // Dashboard Nav
  const navItems = [
    { label: 'Dashboard', href: '/mentor/dashboard' },
    { label: 'Sessions', href: '/mentor/sessions' },
    { label: 'Availability', href: '/mentor/availability' },
    { label: 'Earnings', href: '/mentor/earnings' },
  ]

  return (
    <main style={{ background: 'var(--cream)', minHeight: 'calc(100vh - 56px)', padding: '40px 24px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {(isPending || isSuspended) && (
          <div style={{ 
            background: isPending ? '#FFF9E6' : '#FEF2F2', 
            border: `1px solid ${isPending ? '#FFD666' : '#FCA5A5'}`, 
            padding: '16px 24px', 
            borderRadius: '12px', 
            marginBottom: '32px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <span style={{ fontSize: '20px' }}>{isPending ? '⏳' : '🚫'}</span>
            <div>
              <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 600, color: isPending ? '#856404' : '#991B1B', margin: '0 0 4px' }}>
                {isPending ? 'Application Pending Approval' : 'Account Suspended'}
              </h3>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: isPending ? '#856404' : '#991B1B', opacity: 0.8, margin: 0 }}>
                {isPending 
                  ? "Your profile is not yet visible in the directory. You can set up your availability, but founders cannot book you until you're approved."
                  : "Your account has been suspended by an administrator. Please contact support."}
              </p>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', background: 'var(--white)', padding: '24px', borderRadius: '16px', border: '1px solid var(--cream-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--cream)', border: '1px solid var(--cream-border)', overflow: 'hidden', flexShrink: 0 }}>
              {mentor.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={mentor.avatar_url} alt={mentor.display_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', color: 'var(--ink-4)', fontFamily: 'var(--font-serif)' }}>
                  {mentor.display_name.charAt(0)}
                </div>
              )}
            </div>
            <div>
              <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', fontWeight: 400, color: 'var(--ink)', margin: '0 0 4px' }}>
                {mentor.display_name}
              </h1>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--ink-3)', margin: 0 }}>
                  {profile?.email || user.email}
                </p>
                {profile?.phone && (
                  <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--ink-4)', margin: 0 }}>
                    {profile.phone}
                  </p>
                )}
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ 
              display: 'inline-block',
              padding: '6px 12px',
              borderRadius: '100px',
              fontSize: '12px',
              fontWeight: 600,
              background: mentor.status === 'active' ? '#EDF5EA' : mentor.status === 'pending' ? '#FFF9E6' : '#FEF2F2',
              color: mentor.status === 'active' ? '#2A6620' : mentor.status === 'pending' ? '#856404' : '#991B1B',
              textTransform: 'capitalize'
            }}>
              {mentor.status} Status
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{ borderBottom: '1px solid var(--cream-border)', marginBottom: '32px', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <div style={{ display: 'flex', gap: '24px', minWidth: 'max-content', padding: '0 4px' }}>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: 'var(--ink-3)',
                  padding: '12px 0',
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                  borderBottom: '2px solid transparent', // Will be active dynamically in a client component in a real app
                }}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        {children}
      </div>
    </main>
  )
}
