import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'How it Works | Mentor Connect',
  description: 'Learn how to book sessions with verified experts or apply to become a mentor.',
}

export default function HowItWorksPage() {
  return (
    <main style={{ background: 'var(--cream)', minHeight: 'calc(100vh - 56px)' }}>
      {/* ── HEADER ── */}
      <section style={{ padding: '80px 24px', textAlign: 'center', background: 'var(--white)', borderBottom: '1px solid var(--cream-border)' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '48px', color: 'var(--ink)', margin: '0 0 16px' }}>
            How Mentor Connect Works
          </h1>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '18px', color: 'var(--ink-3)', lineHeight: 1.6, margin: 0 }}>
            Whether you're a founder looking for guidance or an expert looking to give back, here's everything you need to know.
          </p>
        </div>
      </section>

      {/* ── FOR FOUNDERS ── */}
      <section style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '40px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'var(--accent)', color: 'var(--white)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-serif)', fontSize: '20px' }}>
              F
            </div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '32px', color: 'var(--ink)', margin: 0 }}>
              For Founders
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {[
              { title: '1. Find the right expert', desc: 'Browse our directory of vetted mentors. Filter by industry, expertise, and target markets to find someone who has solved your exact problem before.' },
              { title: '2. Book a session', desc: 'Check their real-time availability. Choose a slot, fill out a brief explaining what you need help with, and securely pay via Razorpay.' },
              { title: '3. Meet via Google Meet', desc: 'Once confirmed, you will automatically receive a calendar invite with a Google Meet link. Join the call at the scheduled time.' },
              { title: '4. Rate and review', desc: 'After the session, leave a review to help other founders and build the mentor\'s reputation.' }
            ].map((step, i) => (
              <div key={i} style={{ display: 'flex', gap: '20px' }}>
                <div style={{ width: '2px', background: i === 3 ? 'transparent' : 'var(--cream-border)', flexShrink: 0, marginTop: '24px', marginLeft: '12px' }} />
                <div style={{ background: 'var(--white)', border: '1px solid var(--cream-border)', borderRadius: '16px', padding: '24px', flex: 1 }}>
                  <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '18px', fontWeight: 600, color: 'var(--ink)', margin: '0 0 8px' }}>
                    {step.title}
                  </h3>
                  <p style={{ fontFamily: 'var(--font-sans)', fontSize: '15px', color: 'var(--ink-3)', lineHeight: 1.6, margin: 0 }}>
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '40px', textAlign: 'center' }}>
            <Link href="/mentor-connect/mentors" style={{ display: 'inline-block', padding: '14px 28px', background: 'var(--ink)', color: 'var(--white)', borderRadius: '8px', fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 500, textDecoration: 'none' }}>
              Browse Directory →
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOR MENTORS ── */}
      <section style={{ padding: '80px 24px', background: 'var(--white)', borderTop: '1px solid var(--cream-border)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '40px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'var(--ink)', color: 'var(--white)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-serif)', fontSize: '20px' }}>
              M
            </div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '32px', color: 'var(--ink)', margin: 0 }}>
              For Mentors
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {[
              { title: '1. Apply and get verified', desc: 'Submit your application with your LinkedIn and proof of experience. We review every application to maintain a high-quality network.' },
              { title: '2. Set your terms', desc: 'Create your profile, define your session types (30m, 60m, etc.), set your own prices, and sync your Google Calendar to manage availability.' },
              { title: '3. Host sessions', desc: 'Review founder briefs before accepting. Join the auto-generated Google Meet to share your expertise.' },
              { title: '4. Get paid weekly', desc: 'Platform handles payments. Earnings minus our flat commission are routed directly to your linked bank account every week.' }
            ].map((step, i) => (
              <div key={i} style={{ display: 'flex', gap: '20px' }}>
                <div style={{ width: '2px', background: i === 3 ? 'transparent' : 'var(--cream-border)', flexShrink: 0, marginTop: '24px', marginLeft: '12px' }} />
                <div style={{ background: 'var(--cream)', border: '1px solid var(--cream-border)', borderRadius: '16px', padding: '24px', flex: 1 }}>
                  <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '18px', fontWeight: 600, color: 'var(--ink)', margin: '0 0 8px' }}>
                    {step.title}
                  </h3>
                  <p style={{ fontFamily: 'var(--font-sans)', fontSize: '15px', color: 'var(--ink-3)', lineHeight: 1.6, margin: 0 }}>
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '40px', textAlign: 'center' }}>
            <Link href="/mentor-connect/apply" style={{ display: 'inline-block', padding: '14px 28px', background: 'var(--ink)', color: 'var(--white)', borderRadius: '8px', fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 500, textDecoration: 'none' }}>
              Apply to become a Mentor →
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
