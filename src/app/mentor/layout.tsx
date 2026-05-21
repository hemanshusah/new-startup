import { redirect } from 'next/navigation'
import { getAuthenticatedUser } from '@/lib/auth-utils'
import { createServiceClient } from '@/lib/supabase/server'
import Link from 'next/link'
import MentorNav from '@/components/mentor-connect/MentorNav'
import MentorGoogleLock from '@/components/mentor-connect/MentorGoogleLock'
import { Clock, ShieldCheck, AlertCircle, ArrowLeft, Mail, Phone } from 'lucide-react'

export default async function MentorLayout({ children }: { children: React.ReactNode }) {
  const user = await getAuthenticatedUser()

  if (!user) {
    redirect('/?redirect=/mentor/availability')
  }

  const supabase = createServiceClient()

  const { data: mentor } = await supabase
    .from('mentor_profiles')
    .select('status, display_name, avatar_url, google_refresh_token, id')
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
      <main style={{ background: 'var(--bg)', minHeight: 'calc(100vh - 56px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', position: 'relative' }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: '600px',
          height: '240px',
          background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(239, 68, 68, 0.08) 0%, transparent 70%)',
          opacity: 0.5,
          zIndex: 0,
          pointerEvents: 'none'
        }} />
        <div style={{ background: 'var(--white)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 'var(--radius-lg, 16px)', padding: '60px 40px', maxWidth: '600px', textAlign: 'center', zIndex: 1, boxShadow: '0 8px 30px rgba(0,0,0,0.01)' }}>
          <div style={{
            width: '64px',
            height: '64px',
            background: '#FEF2F2',
            color: '#EF4444',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            border: '1px solid rgba(239, 68, 68, 0.15)'
          }}>
            <AlertCircle size={28} />
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', color: 'var(--ink)', margin: '0 0 12px', fontWeight: 400 }}>Application Declined</h1>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '15px', color: 'var(--ink-3)', lineHeight: 1.6, margin: '0 0 32px' }}>
            We appreciate your interest in joining Mentor Connect. Unfortunately, your professional profile could not be approved at this time.
          </p>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 28px', background: 'var(--ink)', color: 'var(--white)', borderRadius: 'var(--radius-lg, 8px)', fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 600, textDecoration: 'none' }}>
            <ArrowLeft size={16} />
            Return to Homepage
          </Link>
        </div>
      </main>
    )
  }

  if (isPending) {
    return (
      <main style={{ background: 'var(--bg)', minHeight: 'calc(100vh - 56px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', position: 'relative' }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: '600px',
          height: '240px',
          background: 'radial-gradient(ellipse 60% 50% at 50% 0%, var(--accent-light) 0%, transparent 70%)',
          opacity: 0.5,
          zIndex: 0,
          pointerEvents: 'none'
        }} />
        <div style={{
          background: 'var(--white)',
          border: '1px solid var(--cream-border)',
          borderRadius: 'var(--radius-lg, 16px)',
          padding: '60px 40px',
          textAlign: 'center',
          maxWidth: '560px',
          width: '100%',
          zIndex: 1,
          boxShadow: '0 8px 30px rgba(184, 70, 10, 0.02)'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            background: 'var(--accent-light)',
            color: 'var(--accent)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            border: '1px solid rgba(184, 70, 10, 0.12)'
          }}>
            <Clock size={28} />
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', color: 'var(--ink)', marginBottom: '12px', fontWeight: 400 }}>Profile Under Review</h1>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '15px', color: 'var(--ink-3)', lineHeight: 1.6, marginBottom: '32px' }}>
            Our team is currently reviewing your professional background and credentials. This typically takes <strong>2-3 business days</strong>.
          </p>
          <div style={{ padding: '24px', background: 'var(--bg)', borderRadius: 'var(--radius-lg, 12px)', border: '1px solid var(--cream-border)', textAlign: 'left' }}>
            <p style={{ margin: 0, fontSize: '11px', color: 'var(--ink-3)', fontFamily: 'var(--font-sans)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Verification Steps:</p>
            <ul style={{ margin: '14px 0 0', paddingLeft: '18px', fontSize: '13.5px', color: 'var(--ink-2)', fontFamily: 'var(--font-sans)', lineHeight: 1.65 }}>
              <li style={{ marginBottom: '8px' }}>Authenticating professional identity & bios</li>
              <li style={{ marginBottom: '8px' }}>Mapping domain expertises & covered industries</li>
              <li style={{ marginBottom: 0 }}>Enabling secure Google calendar slot allocations</li>
            </ul>
          </div>
          <div style={{ marginTop: '32px' }}>
            <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 28px', background: 'var(--ink)', color: 'var(--white)', borderRadius: 'var(--radius-lg, 8px)', fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 600, textDecoration: 'none' }}>
              <ArrowLeft size={16} />
              Return to Homepage
            </Link>
          </div>
        </div>
      </main>
    )
  }

  if (isSuspended) {
    return (
      <main style={{ background: 'var(--bg)', minHeight: 'calc(100vh - 56px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', position: 'relative' }}>
        <div style={{ background: 'var(--white)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 'var(--radius-lg, 16px)', padding: '60px 40px', maxWidth: '600px', textAlign: 'center', boxShadow: '0 8px 30px rgba(0,0,0,0.01)' }}>
          <div style={{
            width: '64px',
            height: '64px',
            background: '#FEF2F2',
            color: '#EF4444',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            border: '1px solid rgba(239, 68, 68, 0.15)'
          }}>
            <AlertCircle size={28} />
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', color: 'var(--ink)', margin: '0 0 12px', fontWeight: 400 }}>Profile Deactivated</h1>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '15px', color: 'var(--ink-3)', lineHeight: 1.6, margin: '0 0 32px' }}>
            Your access has been temporarily suspended by an administrator. Please reach out to ecosystem support.
          </p>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 28px', background: 'var(--ink)', color: 'var(--white)', borderRadius: 'var(--radius-lg, 8px)', fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 600, textDecoration: 'none' }}>
            <ArrowLeft size={16} />
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
    <main style={{ background: 'var(--bg)', minHeight: 'calc(100vh - 56px)', padding: '40px 24px 80px', position: 'relative' }}>
      {/* Ambient background glow */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: '1000px',
        height: '260px',
        background: 'radial-gradient(ellipse 60% 50% at 50% 0%, var(--accent-light) 0%, transparent 70%)',
        opacity: 0.45,
        zIndex: 0,
        pointerEvents: 'none'
      }} />

      <div style={{ maxWidth: '1000px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        
        {/* Profile Card Banner */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '32px',
          background: 'var(--white)',
          padding: '28px',
          borderRadius: 'var(--radius-lg, 16px)',
          border: '1px solid var(--cream-border)',
          boxShadow: '0 4px 24px rgba(184, 70, 10, 0.015)',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <div style={{ width: '74px', height: '74px', borderRadius: '50%', background: 'var(--bg)', border: '2px solid var(--cream-border)', overflow: 'hidden', flexShrink: 0 }}>
              {mentor.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={mentor.avatar_url} alt={mentor.display_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', color: 'var(--ink-4)', fontFamily: 'var(--font-serif)' }}>
                  {mentor.display_name.charAt(0)}
                </div>
              )}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '26px', fontWeight: 400, color: 'var(--ink)', margin: 0 }}>
                  {mentor.display_name}
                </h1>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 10px',
                  borderRadius: '100px',
                  fontSize: '10px',
                  fontWeight: 600,
                  background: '#EDF5EA',
                  color: '#2A6620',
                  textTransform: 'uppercase',
                  border: '1px solid rgba(42, 102, 32, 0.15)',
                  letterSpacing: '0.02em'
                }}>
                  <ShieldCheck size={11} />
                  Active Operator
                </span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontFamily: 'var(--font-sans)', fontSize: '13.5px', color: 'var(--ink-3)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Mail size={13} color="var(--accent)" />
                  {profile?.email || user.email}
                </span>
                {profile?.phone && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Phone size={13} color="var(--accent)" />
                    {profile.phone}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Navigation selector */}
        <MentorNav navItems={navItems} />

        {/* Form Lock components */}
        <MentorGoogleLock isGoogleConnected={!!mentor.google_refresh_token}>
          {children}
        </MentorGoogleLock>
      </div>
    </main>
  )
}
