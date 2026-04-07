import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms and Conditions',
  description:
    'Terms of use for GrantsIndia — eligibility, your account, acceptable use, disclaimers, limitation of liability, and governing law.',
}

const CONTACT_EMAIL = 'deeksharai014@gmail.com'

function Num({ n }: { n: number }) {
  return (
    <span
      style={{
        width: '28px', height: '28px', borderRadius: '50%',
        background: 'var(--accent)', color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'DM Serif Display, serif', fontSize: '12.5px', flexShrink: 0,
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
          fontFamily: 'DM Serif Display, serif', fontSize: '1.2rem',
          fontWeight: 400, color: 'var(--ink)', letterSpacing: '-0.015em', lineHeight: 1.3,
        }}>
          {title}
        </h2>
      </div>
      <div style={{ paddingLeft: '40px' }}>{children}</div>
    </div>
  )
}

export default function TermsPage() {
  return (
    <main>
      {/* ── Hero ── */}
      <div className="legal-hero">
        <div style={{ color: 'var(--accent)', display: 'flex', justifyContent: 'center', marginBottom: '22px' }}>
          <svg width="54" height="54" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
        </div>
        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '11px', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '14px' }}>
          Legal
        </p>
        <h1 style={{
          fontFamily: 'DM Serif Display, serif', fontSize: 'clamp(32px, 5vw, 48px)',
          fontWeight: 400, color: 'var(--ink)', letterSpacing: '-0.025em',
          lineHeight: 1.1, marginBottom: '18px',
        }}>
          Terms &amp; Conditions
        </h1>
        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '16px', fontWeight: 300, color: 'var(--ink-3)', lineHeight: 1.65, maxWidth: '460px', margin: '0 auto 24px' }}>
          Plain-language terms for a platform built for founders. Please read before using GrantsIndia.
        </p>
        <span style={{
          display: 'inline-block', background: 'var(--cream)', border: '1px solid var(--cream-border)',
          borderRadius: '20px', padding: '4px 16px',
          fontFamily: 'DM Sans, sans-serif', fontSize: '12px', color: 'var(--ink-3)',
        }}>
          Effective April 2026
        </span>
      </div>

      {/* ── Body ── */}
      <div className="legal-body">

        {/* Quick summary */}
        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '11px', fontWeight: 600, letterSpacing: '0.13em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: '14px' }}>
          Good to know
        </p>
        <div className="legal-glance-grid">
          <div className="legal-glance-card">
            <div style={{ color: 'var(--accent)', marginBottom: '12px' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </div>
            <p style={{ fontFamily: 'DM Serif Display, serif', fontSize: '1rem', color: 'var(--ink)', marginBottom: '6px' }}>Free platform</p>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '13px', color: 'var(--ink-3)', lineHeight: 1.6 }}>Core listings and search are completely free. No hidden fees.</p>
          </div>
          <div className="legal-glance-card">
            <div style={{ color: 'var(--accent)', marginBottom: '12px' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
              </svg>
            </div>
            <p style={{ fontFamily: 'DM Serif Display, serif', fontSize: '1rem', color: 'var(--ink)', marginBottom: '6px' }}>Curated, not certified</p>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '13px', color: 'var(--ink-3)', lineHeight: 1.6 }}>We curate listings from public sources. Always verify details directly with the organiser.</p>
          </div>
          <div className="legal-glance-card">
            <div style={{ color: 'var(--accent)', marginBottom: '12px' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <p style={{ fontFamily: 'DM Serif Display, serif', fontSize: '1rem', color: 'var(--ink)', marginBottom: '6px' }}>Mutual respect</p>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '13px', color: 'var(--ink-3)', lineHeight: 1.6 }}>Use the platform fairly and lawfully. We commit to maintaining it responsibly.</p>
          </div>
        </div>

        {/* Section 1 */}
        <SectionCard n={1} title="About GrantsIndia">
          <p>GrantsIndia is a privately operated platform that aggregates and curates publicly available information about startup grants, funding programs, incubation programs, accelerators, and similar opportunities. We are not a government body, a financial institution, or a grant-making organisation. We do not distribute grants, make funding decisions, or represent any of the programs listed on our platform.</p>
          <p>By accessing or using GrantsIndia, you agree to be bound by these Terms and Conditions. If you do not agree, please do not use the platform.</p>
        </SectionCard>

        {/* Section 2 */}
        <SectionCard n={2} title="Eligibility">
          <p>You must be at least <strong>18 years of age</strong> to create an account or use GrantsIndia. By using the platform, you confirm that you meet this requirement. If you are using the platform on behalf of an organisation, you confirm you have the authority to bind that organisation to these terms.</p>
        </SectionCard>

        {/* Section 3 */}
        <SectionCard n={3} title="Your account">
          <p>To access program detail pages, you must create a free account. You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. You agree to notify us immediately if you suspect any unauthorised access.</p>
          <p>You may not create an account using false or misleading information. You may not transfer your account to another person. We reserve the right to suspend or terminate accounts that violate these terms.</p>
        </SectionCard>

        {/* Section 4 */}
        <SectionCard n={4} title="What GrantsIndia provides">
          <p>GrantsIndia provides a curated directory of startup funding opportunities. Information is compiled from publicly available sources including government websites, organiser announcements, and press releases. We make reasonable efforts to ensure accuracy but we cannot guarantee every listing is current, complete, or error-free.</p>
          <ul className="legal-dot-list">
            <li>Deadlines, eligibility criteria, funding amounts, and program details may change after publication. Always verify directly with the program organiser before applying.</li>
            <li>A program appearing on GrantsIndia is not an endorsement, recommendation, or guarantee of quality, legitimacy, or suitability for your startup.</li>
            <li>GrantsIndia does not review, evaluate, or vouch for any programs, organisations, or grant-making bodies listed on the platform.</li>
          </ul>
        </SectionCard>

        {/* Section 5 */}
        <SectionCard n={5} title="Sponsored content and advertising">
          <p>GrantsIndia displays sponsored content from partner companies, clearly labelled as &quot;Sponsored.&quot; We do not allow advertisers to influence editorial decisions about which programs are listed, how they are described, or how they are ranked. The inclusion or exclusion of a program is entirely independent of any commercial relationship.</p>
          <p>Clicking on sponsored links will take you to third-party websites. GrantsIndia is not responsible for the content, accuracy, or practices of those sites.</p>
        </SectionCard>

        {/* Section 6 */}
        <SectionCard n={6} title="Intellectual property">
          <p>All content on GrantsIndia — including the curation, selection, descriptions, design, and organisation of program information — is the intellectual property of GrantsIndia unless otherwise stated. You may not reproduce, republish, scrape, distribute, or create derivative works from our content without written permission.</p>
          <p>You are welcome to share links to individual program pages and quote brief excerpts for non-commercial purposes with attribution and a link to the source page. Program descriptions, logos, and names belong to their respective organisations.</p>
        </SectionCard>

        {/* Section 7 */}
        <SectionCard n={7} title="Acceptable use">
          <p>When using GrantsIndia, you agree <strong>not</strong> to:</p>
          <ul className="legal-no-list">
            <li>Use automated tools, bots, scrapers, or crawlers to extract data without written permission</li>
            <li>Attempt to gain unauthorised access to any part of the platform, its servers, or databases</li>
            <li>Use the platform for any unlawful purpose or in violation of any applicable Indian or international law</li>
            <li>Post, transmit, or distribute spam, malware, or any harmful, defamatory, or fraudulent content</li>
            <li>Impersonate any person or organisation or misrepresent your affiliation with any entity</li>
            <li>Interfere with the security, integrity, or availability of the platform</li>
          </ul>
          <p>Violation may result in immediate account termination and, where appropriate, referral to law enforcement.</p>
        </SectionCard>

        {/* Section 8 */}
        <SectionCard n={8} title="Newsletter">
          <p>If you subscribe to the GrantsIndia newsletter, you consent to receiving periodic emails containing curated program listings, deadline reminders, and relevant sponsor content. You can unsubscribe at any time using the link included in every email. Unsubscribing from the newsletter does not delete your account.</p>
        </SectionCard>

        {/* Section 9 */}
        <SectionCard n={9} title="Third-party links">
          <p>GrantsIndia contains links to external websites, application portals, and sponsor pages. These links are provided for your convenience. We have no control over the content, privacy practices, or reliability of those external sites and accept no responsibility for them. Visiting a third-party link is at your own risk.</p>
        </SectionCard>

        {/* Section 10 */}
        <SectionCard n={10} title="Disclaimers">
          <div className="legal-disclaimer-grid">
            <div className="legal-disclaimer-item">
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '12.5px', fontWeight: 600, color: 'var(--ink)', marginBottom: '5px' }}>No professional advice</p>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '13.5px', color: 'var(--ink-2)', lineHeight: 1.65 }}>Nothing on GrantsIndia constitutes legal, financial, investment, or business advice. Consult qualified professionals before making decisions based on information found here.</p>
            </div>
            <div className="legal-disclaimer-item">
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '12.5px', fontWeight: 600, color: 'var(--ink)', marginBottom: '5px' }}>No guarantee of results</p>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '13.5px', color: 'var(--ink-2)', lineHeight: 1.65 }}>Listing a program on GrantsIndia does not increase or decrease your chances of receiving funding. We have no involvement in or influence over any program&apos;s selection process.</p>
            </div>
            <div className="legal-disclaimer-item">
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '12.5px', fontWeight: 600, color: 'var(--ink)', marginBottom: '5px' }}>Platform availability</p>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '13.5px', color: 'var(--ink-2)', lineHeight: 1.65 }}>We aim to keep GrantsIndia available at all times but do not guarantee uninterrupted access. The platform may be unavailable for maintenance, technical issues, or circumstances beyond our control.</p>
            </div>
          </div>
        </SectionCard>

        {/* Section 11 */}
        <SectionCard n={11} title="Limitation of liability">
          <div className="legal-callout-amber">
            <p style={{ marginBottom: 0 }}>To the maximum extent permitted by applicable law, GrantsIndia and its operators shall not be liable for any indirect, incidental, consequential, or punitive damages arising from your use of the platform — including missed application deadlines, inaccurate program information, or reliance on any content published here. Our total aggregate liability for any claim shall not exceed the amount you have paid us in the 12 months preceding the claim, which in most cases will be <strong>zero</strong>, given that our core service is free.</p>
          </div>
        </SectionCard>

        {/* Section 12 */}
        <SectionCard n={12} title="Indemnification">
          <p>You agree to indemnify and hold harmless GrantsIndia, its operators, and its team members from any claims, losses, damages, or expenses — including reasonable legal fees — arising from your use of the platform in violation of these Terms and Conditions.</p>
        </SectionCard>

        {/* Section 13 */}
        <SectionCard n={13} title="Governing law">
          <p>These Terms and Conditions are governed by the laws of <strong>India</strong>. Any disputes arising from your use of GrantsIndia shall be subject to the exclusive jurisdiction of the courts of India. If any provision of these terms is found to be unenforceable, the remaining provisions will continue in full force.</p>
        </SectionCard>

        {/* Section 14 */}
        <SectionCard n={14} title="Changes to these terms">
          <p>We may update these Terms and Conditions from time to time. We will notify registered users of material changes via email and update the effective date at the top of this page. Continued use of the platform after updated terms are posted constitutes your acceptance of those terms.</p>
        </SectionCard>

        {/* Contact */}
        <div className="legal-contact-card">
          <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '11px', fontWeight: 600, letterSpacing: '0.13em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: '12px' }}>
            Section 15 — Contact
          </p>
          <h2 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 'clamp(22px, 3.5vw, 30px)', fontWeight: 400, color: '#fff', letterSpacing: '-0.02em', marginBottom: '10px' }}>
            Questions about these terms?
          </h2>
          <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '14px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, maxWidth: '360px', margin: '0 auto 24px' }}>
            We&apos;re happy to clarify anything. Drop us a line and we&apos;ll get back to you.
          </p>
          <a href={`mailto:${CONTACT_EMAIL}`} className="legal-email-btn">
            {CONTACT_EMAIL}
          </a>
        </div>

      </div>
    </main>
  )
}
