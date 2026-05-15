import { redirect } from 'next/navigation'
import { getAuthenticatedUser } from '@/lib/auth-utils'
import { createServiceClient } from '@/lib/supabase/server'
import Link from 'next/link'
import MentorNav from '@/components/mentor-connect/MentorNav'

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
          <Link href="/" style={{ padding: '14px 28px', background: 'var(--ink)', color: 'var(--white)', borderRadius: '8px', fontFamily: 'var(--font-sans)', fontSize: '15px', fontWeight: 500, textDecoration: 'none' }}>
            Return to Homepage
          </Link>
        </div>
      </main>
    )
  }

  if (isPending) {
    return (
      <main style={{ background: 'var(--cream)', minHeight: 'calc(100vh - 56px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{
          background: 'var(--white)',
          border: '1px solid var(--cream-border)',
          borderRadius: '16px',
          padding: '80px 40px',
          textAlign: 'center',
          maxWidth: '600px',
          width: '100%'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: '#FFF9ED',
            color: '#D4820E',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '40px',
            margin: '0 auto 32px'
          }}>
            ⏳
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '32px', color: 'var(--ink)', marginBottom: '16px' }}>Profile Under Review</h1>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '16px', color: 'var(--ink-3)', lineHeight: 1.6, marginBottom: '32px' }}>
            Thank you for your application! Our team is currently reviewing your profile and credentials.
            This process usually takes <strong>3-5 business days</strong>.
            We'll notify you via email once your dashboard is activated.
          </p>
          <div style={{ padding: '24px', background: 'var(--cream)', borderRadius: '12px', textAlign: 'left' }}>
            <p style={{ margin: 0, fontSize: '14px', color: 'var(--ink-4)', fontFamily: 'var(--font-sans)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>NEXT STEPS:</p>
            <ul style={{ margin: '16px 0 0', paddingLeft: '20px', fontSize: '15px', color: 'var(--ink-2)', fontFamily: 'var(--font-sans)', lineHeight: 1.6 }}>
              <li>Reviewing your professional credentials</li>
              <li>Verifying your expertise areas & industries</li>
              <li>Setting up your mentor presence in the directory</li>
            </ul>
          </div>
          <div style={{ marginTop: '32px' }}>
            <Link href="/" style={{ padding: '14px 28px', background: 'var(--ink)', color: 'var(--white)', borderRadius: '8px', fontFamily: 'var(--font-sans)', fontSize: '15px', fontWeight: 500, textDecoration: 'none' }}>
              Return to Homepage
            </Link>
          </div>
        </div>
      </main>
    )
  }

  if (isSuspended) {
    return (
      <main style={{ background: 'var(--cream)', minHeight: 'calc(100vh - 56px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{ background: 'var(--white)', border: '1px solid #FCA5A5', borderRadius: '16px', padding: '60px 40px', maxWidth: '600px', textAlign: 'center' }}>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '32px', color: '#B01F1F', margin: '0 0 16px' }}>Account Suspended</h1>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '16px', color: 'var(--ink-3)', lineHeight: 1.6, margin: '0 0 32px' }}>
            Your account has been suspended by an administrator. Please contact support for more information.
          </p>
          <Link href="/" style={{ padding: '14px 28px', background: 'var(--ink)', color: 'var(--white)', borderRadius: '8px', fontFamily: 'var(--font-sans)', fontSize: '15px', fontWeight: 500, textDecoration: 'none' }}>
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
    { label: 'Session Types', href: '/mentor/session-types' },
    { label: 'Availability', href: '/mentor/availability' },
    { label: 'Earnings', href: '/mentor/earnings' },
    { label: 'My Profile', href: '/mentor/profile' },
  ]

  return (
    <main style={{ background: 'var(--cream)', minHeight: 'calc(100vh - 56px)', padding: '40px 24px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
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

        <MentorNav navItems={navItems} />

        {children}
      </div>
    </main>
  )
}
