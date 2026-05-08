import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'How GrantsIndia collects, uses, and protects your information. Account data, cookies, your rights, and our commitment to never selling your data.',
}

const CONTACT_EMAIL = 'deeksharai014@gmail.com'

function Num({ n }: { n: number }) {
  return (
    <span
      style={{
        width: '28px', height: '28px', borderRadius: '50%',
        background: 'var(--accent)', color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--font-serif), serif', fontSize: '12.5px', flexShrink: 0,
      }}
    >
      {n}
    </span>
  )
}

function SectionCard({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="legal-section-card">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <Num n={n} />
        <h2 style={{
          fontFamily: 'var(--font-serif), serif', fontSize: '1.2rem',
          fontWeight: 400, color: 'var(--ink)', letterSpacing: '-0.015em', lineHeight: 1.3,
        }}>
          {title}
        </h2>
      </div>
      <div style={{ paddingLeft: '40px' }}>{children}</div>
    </div>
  )
}

function Check() {
  return (
    <div className="legal-check-icon">
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    </div>
  )
}

export default function PrivacyPage() {
  return (
    <main>
      {/* ── Hero ── */}
      <div className="legal-hero">
        <div style={{ color: 'var(--accent)', display: 'flex', justifyContent: 'center', marginBottom: '22px' }}>
          <svg width="54" height="54" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>
        <p style={{ fontFamily: 'var(--font-sans), sans-serif', fontSize: '11px', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '14px' }}>
          Legal
        </p>
        <h1 style={{
          fontFamily: 'var(--font-serif), serif', fontSize: 'clamp(32px, 5vw, 48px)',
          fontWeight: 400, color: 'var(--ink)', letterSpacing: '-0.025em',
          lineHeight: 1.1, marginBottom: '18px',
        }}>
          Privacy Policy
        </h1>
        <p style={{ fontFamily: 'var(--font-sans), sans-serif', fontSize: '16px', fontWeight: 300, color: 'var(--ink-3)', lineHeight: 1.65, maxWidth: '460px', margin: '0 auto 24px' }}>
          We built GrantsIndia on trust. Here&apos;s exactly what that means for your personal data.
        </p>
        <span style={{
          display: 'inline-block', background: 'var(--cream)', border: '1px solid var(--cream-border)',
          borderRadius: '20px', padding: '4px 16px',
          fontFamily: 'var(--font-sans), sans-serif', fontSize: '12px', color: 'var(--ink-3)',
        }}>
          Effective April 2026
        </span>
      </div>

      {/* ── Body ── */}
      <div className="legal-body">

        {/* At a glance */}
        <p style={{ fontFamily: 'var(--font-sans), sans-serif', fontSize: '11px', fontWeight: 600, letterSpacing: '0.13em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: '14px' }}>
          Privacy at a glance
        </p>
        <div className="legal-glance-grid">
          <div className="legal-glance-card">
            <div style={{ color: 'var(--accent)', marginBottom: '12px' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <p style={{ fontFamily: 'var(--font-serif), serif', fontSize: '1rem', color: 'var(--ink)', marginBottom: '6px' }}>Minimal collection</p>
            <p style={{ fontFamily: 'var(--font-sans), sans-serif', fontSize: '13px', color: 'var(--ink-3)', lineHeight: 1.6 }}>Just your email and profile basics. No phone numbers, no payment data.</p>
          </div>
          <div className="legal-glance-card">
            <div style={{ color: 'var(--accent)', marginBottom: '12px' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
              </svg>
            </div>
            <p style={{ fontFamily: 'var(--font-serif), serif', fontSize: '1rem', color: 'var(--ink)', marginBottom: '6px' }}>Never sold</p>
            <p style={{ fontFamily: 'var(--font-sans), sans-serif', fontSize: '13px', color: 'var(--ink-3)', lineHeight: 1.6 }}>Your data is never sold to advertisers, data brokers, or third parties. Full stop.</p>
          </div>
          <div className="legal-glance-card">
            <div style={{ color: 'var(--accent)', marginBottom: '12px' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <p style={{ fontFamily: 'var(--font-serif), serif', fontSize: '1rem', color: 'var(--ink)', marginBottom: '6px' }}>You&apos;re in control</p>
            <p style={{ fontFamily: 'var(--font-sans), sans-serif', fontSize: '13px', color: 'var(--ink-3)', lineHeight: 1.6 }}>Delete your account, export your data, or unsubscribe anytime.</p>
          </div>
        </div>

        {/* Section 1 */}
        <SectionCard n={1} title="Who we are">
          <p>GrantsIndia is a private platform that curates startup grants, funding programs, incubation opportunities, and related resources for founders and entrepreneurs in India. We are not affiliated with any government body. &quot;We,&quot; &quot;us,&quot; and &quot;our&quot; refer to GrantsIndia throughout this policy.</p>
        </SectionCard>

        {/* Section 2 */}
        <SectionCard n={2} title="What information we collect">
          <div className="legal-sub-item">
            <p className="legal-sub-item__label">Information you give us directly</p>
            <p>When you create an account we collect your email address and, if you sign up via Google, your name and profile picture. When you subscribe to our newsletter we collect your email. We do not collect phone numbers, addresses, payment details, or government-issued identification.</p>
          </div>
          <div className="legal-sub-item">
            <p className="legal-sub-item__label">Information collected automatically</p>
            <p>We automatically collect technical data including IP address, browser type, device type, pages visited, and timestamps. This keeps the platform running and helps us understand usage at a high level.</p>
          </div>
          <div className="legal-sub-item">
            <p className="legal-sub-item__label">Activity on the platform</p>
            <p>When signed in, we record which program detail pages you&apos;ve viewed. This helps improve relevance of suggestions. We do not track your activity across other websites.</p>
          </div>
        </SectionCard>

        {/* Section 3 */}
        <SectionCard n={3} title="How we use your information">
          <p>We use the information we collect to:</p>
          <ul className="legal-dot-list">
            <li>Create and maintain your account</li>
            <li>Show program detail pages, which require an account to access</li>
            <li>Send the GrantsIndia newsletter if you have subscribed</li>
            <li>Send transactional emails such as account confirmation and password reset</li>
            <li>Improve the platform by understanding which programs and features are most used</li>
            <li>Detect and prevent fraudulent or abusive use of the platform</li>
            <li>Show contextually relevant sponsored content from advertising partners</li>
          </ul>
          <p>We do not use your information to build advertising profiles or share your data with data brokers.</p>
        </SectionCard>

        {/* Section 4 */}
        <SectionCard n={4} title="Sponsored content and advertising">
          <p>GrantsIndia displays sponsored cards from partner companies on the listing page, detail pages, and in email newsletters. Ads are selected based on the <strong>context of the page</strong> — for example, a tool relevant to startup founders — not your personal profile or browsing history across other sites.</p>
          <p>When you click a sponsored link, we record that a click occurred on that ad unit. If signed in, we also note that your account has seen that ad to avoid showing it excessively. We do not share your personal identity with advertisers. They receive only aggregated, anonymised impression and click counts.</p>
        </SectionCard>

        {/* Section 5 */}
        <SectionCard n={5} title="Who we share your information with">
          <p>We share your data only in these limited circumstances:</p>
          <div className="legal-sub-item">
            <p className="legal-sub-item__label">Service providers</p>
            <p>Supabase (database) and Vercel (hosting) process data on our behalf under data processing agreements. They do not use your data for their own purposes.</p>
          </div>
          <div className="legal-sub-item">
            <p className="legal-sub-item__label">Legal requirements</p>
            <p>We may disclose information if required by law, court order, or a verified request by a law enforcement or government authority.</p>
          </div>
          <div className="legal-sub-item">
            <p className="legal-sub-item__label">Business transfer</p>
            <p>If GrantsIndia is acquired or its assets are transferred, your data may transfer as part of that transaction. We will notify users via email or a prominent notice before this occurs.</p>
          </div>
          <div className="legal-callout-accent">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <circle cx="12" cy="12" r="10" />
              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
            </svg>
            We do not sell your personal information. Ever.
          </div>
        </SectionCard>

        {/* Section 6 */}
        <SectionCard n={6} title="Cookies">
          <p>We use a small number of strictly necessary cookies to keep you signed in across sessions. We do not use advertising cookies, tracking pixels, or third-party analytics cookies that follow you across other websites.</p>
          <p>We use privacy-friendly, cookieless analytics to understand aggregate traffic patterns. You can delete cookies through your browser settings at any time — though doing so will sign you out of your account.</p>
        </SectionCard>

        {/* Section 7 */}
        <SectionCard n={7} title="Data retention">
          <p>We retain your account information for as long as your account is active. If you delete your account, we delete your profile data within <strong>30 days</strong>. Certain records such as anonymised usage logs may be retained for up to 12 months for security and operational purposes. Newsletter subscription data is retained until you unsubscribe.</p>
        </SectionCard>

        {/* Section 8 */}
        <SectionCard n={8} title="Your rights">
          <p>You have the right to:</p>
          <ul className="legal-check-list">
            <li><Check />Access the personal information we hold about you</li>
            <li><Check />Correct any inaccurate information in your account</li>
            <li><Check />Delete your account and associated personal data</li>
            <li><Check />Withdraw consent for newsletter communications by unsubscribing at any time</li>
            <li><Check />Export a copy of your data by contacting us</li>
          </ul>
          <p>To exercise any of these rights, contact us at the email address below. We will respond within 30 days.</p>
        </SectionCard>

        {/* Section 9 */}
        <SectionCard n={9} title="Children">
          <p>GrantsIndia is not intended for use by anyone under the age of 18. We do not knowingly collect personal information from children. If you believe a minor has created an account on our platform, please contact us and we will promptly delete the account and associated data.</p>
        </SectionCard>

        {/* Section 10 */}
        <SectionCard n={10} title="Changes to this policy">
          <p>We may update this Privacy Policy from time to time. When we make material changes, we will notify registered users by email and update the effective date at the top of this page. Continued use of the platform after changes are posted constitutes acceptance of the updated policy.</p>
        </SectionCard>

        {/* Contact */}
        <div className="legal-contact-card">
          <p style={{ fontFamily: 'var(--font-sans), sans-serif', fontSize: '11px', fontWeight: 600, letterSpacing: '0.13em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: '12px' }}>
            Section 11 — Contact
          </p>
          <h2 style={{ fontFamily: 'var(--font-serif), serif', fontSize: 'clamp(22px, 3.5vw, 30px)', fontWeight: 400, color: '#fff', letterSpacing: '-0.02em', marginBottom: '10px' }}>
            Questions about your privacy?
          </h2>
          <p style={{ fontFamily: 'var(--font-sans), sans-serif', fontSize: '14px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, marginBottom: '24px', maxWidth: '360px', margin: '0 auto 24px' }}>
            We&apos;re a small team. Reach out with any questions or requests and we&apos;ll respond within 30 days.
          </p>
          <a href={`mailto:${CONTACT_EMAIL}`} className="legal-email-btn">
            {CONTACT_EMAIL}
          </a>
        </div>

      </div>
    </main>
  )
}
