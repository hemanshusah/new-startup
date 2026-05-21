'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  ArrowRight, 
  Search, 
  Calendar, 
  Video, 
  Star, 
  UserCheck, 
  Settings, 
  Layers, 
  CreditCard, 
  Compass, 
  Award, 
  Sparkles,
  ShieldCheck,
  Check,
  TrendingUp,
  Briefcase
} from 'lucide-react'

export default function HowItWorksPage() {
  const [activeTab, setActiveTab] = useState<'founders' | 'mentors'>('founders')

  return (
    <main style={{ background: 'var(--bg)', minHeight: 'calc(100vh - 56px)', paddingBottom: '90px' }}>
      
      {/* ── HERO HEADER ── */}
      <section style={{
        position: 'relative',
        padding: '100px 24px 80px',
        textAlign: 'center',
        background: 'linear-gradient(180deg, var(--white) 0%, var(--bg) 100%)',
        borderBottom: '1px solid var(--cream-border)',
        overflow: 'hidden'
      }}>
        {/* Decorative gold ambient light */}
        <div style={{
          position: 'absolute',
          top: '-20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '600px',
          height: '350px',
          background: 'radial-gradient(circle, var(--accent-light) 0%, transparent 70%)',
          opacity: 0.5,
          pointerEvents: 'none'
        }} />

        <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            background: 'var(--accent-light)',
            color: 'var(--accent)',
            borderRadius: '100px',
            fontFamily: 'var(--font-sans)',
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: '24px',
            border: '1px solid rgba(184, 70, 10, 0.15)',
          }}>
            <Sparkles size={12} />
            MENTOR PLATFORM
          </div>

          <h1 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(2.2rem, 5vw, 3.75rem)',
            fontWeight: 400,
            color: 'var(--ink)',
            margin: '0 0 20px',
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
          }}>
            How Mentor Connect Works
          </h1>

          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 'clamp(15px, 3.5vw, 17.5px)',
            color: 'var(--ink-3)',
            lineHeight: 1.6,
            maxWidth: '620px',
            margin: '0 auto 40px',
          }}>
            Vetted expertise, structured briefs, and calendar-synchronized schedules. Learn how we bridge seasoned mentors with scaling startup founders.
          </p>

          {/* ── LUXURIOUS TAB SWITCHER ── */}
          <div style={{
            display: 'inline-flex',
            background: 'var(--white)',
            border: '1px solid var(--cream-border)',
            padding: '6px',
            borderRadius: '100px',
            boxShadow: '0 4px 20px rgba(28,26,22,0.03)',
            position: 'relative',
            zIndex: 2
          }}>
            <button
              onClick={() => setActiveTab('founders')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 28px',
                borderRadius: '100px',
                border: 'none',
                background: activeTab === 'founders' ? 'var(--ink)' : 'transparent',
                color: activeTab === 'founders' ? 'var(--white)' : 'var(--ink-3)',
                fontFamily: 'var(--font-sans)',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              <Compass size={15} color={activeTab === 'founders' ? 'var(--accent)' : 'currentColor'} />
              For Ambitious Founders
            </button>
            <button
              onClick={() => setActiveTab('mentors')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 28px',
                borderRadius: '100px',
                border: 'none',
                background: activeTab === 'mentors' ? 'var(--ink)' : 'transparent',
                color: activeTab === 'mentors' ? 'var(--white)' : 'var(--ink-3)',
                fontFamily: 'var(--font-sans)',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              <Award size={15} color={activeTab === 'mentors' ? 'var(--accent)' : 'currentColor'} />
              For Expert Mentors
            </button>
          </div>
        </div>
      </section>

      {/* ── BENTO GRID FLOW PROCESS SECTION ── */}
      <section style={{ padding: '80px 24px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          {/* Tab 1: Founders Flow */}
          {activeTab === 'founders' && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '34px', color: 'var(--ink)', margin: '0 0 10px', fontWeight: 400 }}>
                  Strategic Advisory Flow
                </h2>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '15px', color: 'var(--ink-3)', margin: 0 }}>
                  Skip the networking circles. Connect instantly with builders who have solved your exact problems.
                </p>
              </div>

              {/* BENTO GRID */}
              <div className="bento-grid" style={{ marginBottom: '64px' }}>
                
                {/* Step 1: Top Left - Big Card */}
                <div className="bento-card bento-card-big">
                  <div className="bento-card-content">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                      <div className="bento-step-num">01</div>
                      <div className="bento-step-badge">DIRECT NETWORK</div>
                    </div>
                    <h3 className="bento-card-title">Discover Vetted Mentors</h3>
                    <p className="bento-card-desc">
                      Browse our vetted directory. Filter by specialized domain, target jurisdiction, market category, or notable past companies to pinpoint the perfect mentor.
                    </p>
                  </div>
                  
                  {/* Step 1 Graphic: Search filters & tags */}
                  <div className="bento-card-graphic" style={{ padding: '0 32px 32px' }}>
                    <div className="graphic-container search-mockup">
                      <div className="search-bar-mock">
                        <Search size={14} color="var(--ink-4)" />
                        <span>Search mentors by domain...</span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                        <span className="tag-mock active">Fractional CFO</span>
                        <span className="tag-mock">Regulatory Compliance</span>
                        <span className="tag-mock">Cross-Border Scaling</span>
                        <span className="tag-mock">Market Entry</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 2: Top Right - Small Card */}
                <div className="bento-card bento-card-small">
                  {/* Step 2 Graphic: Calendar mock */}
                  <div className="bento-card-graphic" style={{ padding: '32px 32px 0' }}>
                    <div className="graphic-container calendar-mock">
                      <div className="calendar-header-mock">May 2026</div>
                      <div className="calendar-grid-mock">
                        {[18, 19, 20, 21, 22, 23, 24].map((day, idx) => (
                          <div 
                            key={idx} 
                            className={`calendar-day-mock ${idx === 3 ? 'active' : ''}`}
                          >
                            <span style={{ fontSize: '10px', color: idx === 3 ? 'white' : 'var(--ink-4)', display: 'block' }}>Thu</span>
                            <span style={{ fontWeight: 600 }}>{day}</span>
                          </div>
                        ))}
                      </div>
                      <div className="slot-pill-mock">
                        <Check size={11} color="var(--accent)" />
                        <span>10:30 AM - Confirmed</span>
                      </div>
                    </div>
                  </div>

                  <div className="bento-card-content" style={{ marginTop: 'auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                      <div className="bento-step-num">02</div>
                      <div className="bento-step-badge">SECURE BOOKINGS</div>
                    </div>
                    <h3 className="bento-card-title">Book a Structured Slot</h3>
                    <p className="bento-card-desc">
                      Choose a session duration (30m or 60m) or propose a custom budget session. Fill out a target brief explaining your exact requirements and proceed securely.
                    </p>
                  </div>
                </div>

                {/* Step 3: Bottom Left - Small Card */}
                <div className="bento-card bento-card-small">
                  {/* Step 3 Graphic: Orbit Video connections */}
                  <div className="bento-card-graphic" style={{ padding: '32px 32px 0' }}>
                    <div className="graphic-container meet-mock">
                      <div className="meet-avatar-wrap">
                        <div className="meet-avatar">M</div>
                        <div className="meet-wave-lines">
                          <span className="wave-bar"></span>
                          <span className="wave-bar"></span>
                          <span className="wave-bar"></span>
                          <span className="wave-bar"></span>
                        </div>
                      </div>
                      <div className="meet-link-pill">
                        <Video size={13} color="var(--accent)" />
                        <span>meet.google.com/xyz-abc</span>
                      </div>
                    </div>
                  </div>

                  <div className="bento-card-content" style={{ marginTop: 'auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                      <div className="bento-step-num">03</div>
                      <div className="bento-step-badge">DIRECT INTEGRATION</div>
                    </div>
                    <h3 className="bento-card-title">Connect 1:1 on Google Meet</h3>
                    <p className="bento-card-desc">
                      Once approved, platform instantly issues Google Meet details. Share materials and notes beforehand so your mentor is fully briefed.
                    </p>
                  </div>
                </div>

                {/* Step 4: Bottom Right - Big Card */}
                <div className="bento-card bento-card-big">
                  <div className="bento-card-content">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                      <div className="bento-step-num">04</div>
                      <div className="bento-step-badge">FRACTIONAL GROWTH</div>
                    </div>
                    <h3 className="bento-card-title">Action & Long-term Advisory</h3>
                    <p className="bento-card-desc">
                      Review the advice, download meeting transcripts, and leave feedback. Retain mentors for follow-up strategy session proposals or long-term fractional consulting.
                    </p>
                  </div>
                  
                  {/* Step 4 Graphic: Advisory graph */}
                  <div className="bento-card-graphic" style={{ padding: '0 32px 32px' }}>
                    <div className="graphic-container graph-mock">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                        <span style={{ fontSize: '11px', fontFamily: 'var(--font-sans)', color: 'var(--ink-3)', fontWeight: 600 }}>STRATEGIC ADVISORY VALUE</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10B981', fontSize: '11px', fontWeight: 700 }}>
                          <TrendingUp size={12} />
                          <span>+240% Growth</span>
                        </div>
                      </div>
                      <div style={{ position: 'relative', height: '90px' }}>
                        {/* Custom SVG Line Chart matching premium bento aesthetic */}
                        <svg className="svg-chart-mock" viewBox="0 0 400 90" fill="none" style={{ width: '100%', height: '100%' }}>
                          <path d="M0,80 Q100,75 180,45 T380,10" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" />
                          <path d="M0,80 Q100,75 180,45 T380,10 L380,90 L0,90 Z" fill="url(#gradient-chart)" opacity="0.08" />
                          <circle cx="180" cy="45" r="5" fill="var(--accent)" stroke="white" strokeWidth="2" />
                          <circle cx="380" cy="10" r="5" fill="var(--accent)" stroke="white" strokeWidth="2" />
                          <defs>
                            <linearGradient id="gradient-chart" x1="0" y1="0" x2="0" y2="90">
                              <stop offset="0%" stopColor="var(--accent)" />
                              <stop offset="100%" stopColor="transparent" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <div className="chart-marker" style={{ left: '42%' }}>Advisory Start</div>
                        <div className="chart-marker" style={{ right: '0%' }}>Scaling</div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Call to Action Container */}
              <div style={{
                background: 'linear-gradient(135deg, #FFFDF9, #FAF6EE)',
                border: '1px solid rgba(184, 70, 10, 0.15)',
                borderRadius: '20px',
                padding: '48px',
                textAlign: 'center',
                boxShadow: '0 12px 32px rgba(184, 70, 10, 0.02)'
              }}>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', color: 'var(--ink)', margin: '0 0 10px', fontWeight: 400 }}>
                  Ready to secure strategic direction?
                </h3>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14.5px', color: 'var(--ink-2)', maxWidth: '480px', margin: '0 auto 28px', lineHeight: 1.5 }}>
                  Connect with elite mentors who have successfully raised capital, negotiated complex compliance, and scaled operations globally.
                </p>
                <Link
                  href="/mentor-connect/mentors"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '14px 32px',
                    background: 'var(--ink)',
                    color: 'var(--white)',
                    borderRadius: '100px',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '13.5px',
                    fontWeight: 600,
                    textDecoration: 'none',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 4px 12px rgba(28,26,22,0.1)'
                  }}
                  className="cta-flow-btn"
                >
                  Browse Expert Directory
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          )}

          {/* Tab 2: Mentors Flow */}
          {activeTab === 'mentors' && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '34px', color: 'var(--ink)', margin: '0 0 10px', fontWeight: 400 }}>
                  Mentor Payout & Session Control
                </h2>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '15px', color: 'var(--ink-3)', margin: 0 }}>
                  Set your pricing, sync your standard calendar, and screen requests based on qualified founder briefs.
                </p>
              </div>

              {/* BENTO GRID */}
              <div className="bento-grid" style={{ marginBottom: '64px' }}>
                
                {/* Step 1: Top Left - Big Card */}
                <div className="bento-card bento-card-big">
                  <div className="bento-card-content">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                      <div className="bento-step-num">01</div>
                      <div className="bento-step-badge">NETWORKS STANDARD</div>
                    </div>
                    <h3 className="bento-card-title">Apply for Verification</h3>
                    <p className="bento-card-desc">
                      Submit your builder track record, professional LinkedIn profile, and active areas of expertise. Our network curation filters rigorously to ensure only seasoned builders are admitted.
                    </p>
                  </div>
                  
                  {/* Step 1 Graphic: Premium verified profile card */}
                  <div className="bento-card-graphic" style={{ padding: '0 32px 32px' }}>
                    <div className="graphic-container profile-mock">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-serif)', color: 'var(--accent)', fontWeight: 600 }}>SK</div>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 600, color: 'var(--ink)', margin: '0 0 2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            Siddharth K.
                            <ShieldCheck size={14} color="var(--accent)" />
                          </h4>
                          <span style={{ fontSize: '11px', color: 'var(--ink-4)', fontWeight: 500 }}>Former VP of Product @ Razorpay</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 2: Top Right - Small Card */}
                <div className="bento-card bento-card-small">
                  {/* Step 2 Graphic: Configuration rates */}
                  <div className="bento-card-graphic" style={{ padding: '32px 32px 0' }}>
                    <div className="graphic-container config-mock">
                      <div style={{ fontSize: '11px', color: 'var(--ink-4)', fontWeight: 600, marginBottom: '12px', textTransform: 'uppercase' }}>Session Offerings</div>
                      <div className="config-row-mock">
                        <span>30 Min Strategy Call</span>
                        <span style={{ fontWeight: 600 }}>₹4,500</span>
                      </div>
                      <div className="config-row-mock">
                        <span>60 Min Advisory Slot</span>
                        <span style={{ fontWeight: 600 }}>₹8,000</span>
                      </div>
                    </div>
                  </div>

                  <div className="bento-card-content" style={{ marginTop: 'auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                      <div className="bento-step-num">02</div>
                      <div className="bento-step-badge">TERMS CONTROL</div>
                    </div>
                    <h3 className="bento-card-title">Configure Your Terms</h3>
                    <p className="bento-card-desc">
                      Determine your custom session lengths and set your hourly rates. Sync your Google Calendar to seamlessly project automated availability blocks.
                    </p>
                  </div>
                </div>

                {/* Step 3: Bottom Left - Small Card */}
                <div className="bento-card bento-card-small">
                  {/* Step 3 Graphic: Layered briefs */}
                  <div className="bento-card-graphic" style={{ padding: '32px 32px 0' }}>
                    <div className="graphic-container briefs-mock">
                      <div className="brief-item-mock active">
                        <Briefcase size={12} color="var(--accent)" />
                        <span>Brief #109: Regulatory scaling limits</span>
                      </div>
                      <div className="brief-item-mock">
                        <Briefcase size={12} color="var(--ink-4)" />
                        <span>Brief #108: Compliance structural outline</span>
                      </div>
                    </div>
                  </div>

                  <div className="bento-card-content" style={{ marginTop: 'auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                      <div className="bento-step-num">03</div>
                      <div className="bento-step-badge">BRIEF VALIDATION</div>
                    </div>
                    <h3 className="bento-card-title">Accept Structured Briefs</h3>
                    <p className="bento-card-desc">
                      Founders submit detailed briefs containing specific meeting questions. Approve, reschedule, or decline requests based on compatibility.
                    </p>
                  </div>
                </div>

                {/* Step 4: Bottom Right - Big Card */}
                <div className="bento-card bento-card-big">
                  <div className="bento-card-content">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                      <div className="bento-step-num">04</div>
                      <div className="bento-step-badge">EARNING TRANSPARENCY</div>
                    </div>
                    <h3 className="bento-card-title">Host Calls & Earn Weekly</h3>
                    <p className="bento-card-desc">
                      Conduct strategy calls via integrated calendar invitations. The platform securely aggregates payout balances and transfers them to your bank account every week.
                    </p>
                  </div>
                  
                  {/* Step 4 Graphic: Earnings progress */}
                  <div className="bento-card-graphic" style={{ padding: '0 32px 32px' }}>
                    <div className="graphic-container payout-mock">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--ink-4)', fontWeight: 600 }}>WEEKLY EARNING PAYOUTS</span>
                        <span className="payout-status-badge">Completed</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '60px', padding: '0 10px' }}>
                        {[
                          { week: 'W1', value: 30 },
                          { week: 'W2', value: 45 },
                          { week: 'W3', value: 70 },
                          { week: 'W4', value: 95 }
                        ].map((bar, idx) => (
                          <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                            <div style={{
                              width: '32px',
                              height: `${bar.value}%`,
                              background: idx === 3 ? 'var(--accent)' : 'var(--accent-light)',
                              borderRadius: '4px',
                              transition: 'height 0.3s ease'
                            }} />
                            <span style={{ fontSize: '10px', color: 'var(--ink-4)', fontWeight: 600 }}>{bar.week}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Call to Action Container */}
              <div style={{
                background: 'linear-gradient(135deg, #FFFDF9, #FAF6EE)',
                border: '1px solid rgba(184, 70, 10, 0.15)',
                borderRadius: '20px',
                padding: '48px',
                textAlign: 'center',
                boxShadow: '0 12px 32px rgba(184, 70, 10, 0.02)'
              }}>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', color: 'var(--ink)', margin: '0 0 10px', fontWeight: 400 }}>
                  Ready to share real-world mentor experience?
                </h3>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14.5px', color: 'var(--ink-2)', maxWidth: '480px', margin: '0 auto 28px', lineHeight: 1.5 }}>
                  Join our invite-only community of ecosystem mentors and builders. Help the next generation of Indian startups navigate high-impact growth.
                </p>
                <Link
                  href="/mentor-connect/apply"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '14px 32px',
                    background: 'var(--ink)',
                    color: 'var(--white)',
                    borderRadius: '100px',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '13.5px',
                    fontWeight: 600,
                    textDecoration: 'none',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 4px 12px rgba(28,26,22,0.1)'
                  }}
                  className="cta-flow-btn"
                >
                  Apply as a Mentor
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          )}

        </div>
      </section>

      {/* Embedded High-Aesthetic Style Block */}
      <style dangerouslySetInnerHTML={{
        __html: `
        /* Bento Grid Core */
        .bento-grid {
          display: grid;
          grid-template-columns: 1.4fr 1fr;
          gap: 28px;
        }

        .bento-card {
          background: var(--white);
          border: 1px solid var(--cream-border);
          border-radius: 20px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .bento-card-big {
          grid-column: span 1;
        }

        .bento-card-small {
          grid-column: span 1;
        }

        .bento-card:hover {
          border-color: var(--accent) !important;
          box-shadow: 0 12px 40px rgba(184, 70, 10, 0.05);
          transform: translateY(-4px);
        }

        .bento-card-content {
          padding: 32px 32px 24px;
        }

        .bento-step-num {
          font-family: var(--font-serif);
          fontSize: 16px;
          fontWeight: 700;
          color: var(--accent);
        }

        .bento-step-badge {
          font-family: var(--font-sans);
          font-size: 9.5px;
          font-weight: 700;
          color: var(--ink-4);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          background: var(--bg);
          padding: 4px 10px;
          border-radius: 100px;
          border: 1px solid var(--cream-border);
        }

        .bento-card-title {
          font-family: var(--font-serif);
          font-size: 22px;
          font-weight: 400;
          color: var(--ink);
          margin: 0 0 10px;
          letter-spacing: -0.01em;
        }

        .bento-card-desc {
          font-family: var(--font-sans);
          font-size: 13.5px;
          color: var(--ink-3);
          line-height: 1.6;
          margin: 0;
        }

        /* Bento CSS Illustrations */
        .graphic-container {
          background: var(--white);
          border: 1px solid var(--cream-border);
          border-radius: 14px;
          padding: 24px;
          min-height: 140px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          position: relative;
          overflow: hidden;
          background-image: radial-gradient(var(--cream-border) 1px, transparent 1px);
          background-size: 16px 16px;
        }

        /* Search Mockup */
        .search-mockup {
          gap: 16px;
          align-items: center;
        }

        .search-bar-mock {
          width: 90%;
          background: var(--white);
          border: 1px solid var(--cream-border);
          padding: 10px 14px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: var(--font-sans);
          font-size: 12px;
          color: var(--ink-4);
          box-shadow: 0 2px 8px rgba(0,0,0,0.01);
        }

        .tag-mock {
          font-family: var(--font-sans);
          font-size: 11px;
          font-weight: 500;
          background: var(--bg);
          border: 1px solid var(--cream-border);
          padding: 4px 10px;
          border-radius: 6px;
          color: var(--ink-3);
          transition: all 0.2s ease;
        }

        .tag-mock.active {
          border-color: var(--accent) !important;
          background: var(--accent-light) !important;
          color: var(--accent) !important;
        }

        /* Calendar Mockup */
        .calendar-mock {
          align-items: center;
          gap: 10px;
        }

        .calendar-header-mock {
          font-family: var(--font-sans);
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--accent);
        }

        .calendar-grid-mock {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 6px;
          width: 100%;
        }

        .calendar-day-mock {
          text-align: center;
          font-family: var(--font-sans);
          font-size: 11px;
          padding: 6px 0;
          border-radius: 6px;
          border: 1px solid var(--cream-border);
          background: var(--white);
          color: var(--ink-2);
        }

        .calendar-day-mock.active {
          background: var(--accent) !important;
          border-color: var(--accent) !important;
          color: white !important;
          box-shadow: 0 4px 12px rgba(184,70,10,0.25);
        }

        .slot-pill-mock {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: var(--white);
          border: 1px solid var(--cream-border);
          padding: 4px 12px;
          border-radius: 100px;
          font-family: var(--font-sans);
          font-size: 11px;
          font-weight: 600;
          color: var(--ink-2);
          box-shadow: 0 2px 8px rgba(0,0,0,0.02);
        }

        /* Video Call Mockup */
        .meet-mock {
          align-items: center;
          gap: 16px;
        }

        .meet-avatar-wrap {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .meet-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--ink);
          color: white;
          font-family: var(--font-serif);
          font-size: 16px;
          display: flex;
          align-items: center;
          justifyContent: center;
          border: 2px stroke white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .meet-wave-lines {
          display: flex;
          align-items: center;
          gap: 3px;
        }

        .wave-bar {
          width: 3px;
          height: 12px;
          background: var(--accent);
          border-radius: 10px;
          animation: wave 1.2s ease-in-out infinite alternate;
        }

        .wave-bar:nth-child(2) { height: 20px; animation-delay: 0.15s; }
        .wave-bar:nth-child(3) { height: 16px; animation-delay: 0.3s; }
        .wave-bar:nth-child(4) { height: 8px; animation-delay: 0.45s; }

        @keyframes wave {
          from { transform: scaleY(0.5); }
          to { transform: scaleY(1.3); }
        }

        .meet-link-pill {
          display: flex;
          align-items: center;
          gap: 6px;
          background: var(--white);
          border: 1px solid var(--cream-border);
          padding: 6px 14px;
          border-radius: 100px;
          font-family: var(--font-sans);
          font-size: 11.5px;
          font-weight: 500;
          color: var(--ink-3);
        }

        /* Graph Mockup */
        .chart-marker {
          position: absolute;
          bottom: 12px;
          font-family: var(--font-sans);
          font-size: 9.5px;
          font-weight: 600;
          color: var(--ink-4);
          text-transform: uppercase;
        }

        /* Profile Verification Mockup */
        .profile-mock {
          background: #FFFDF8 !important;
          border: 1px solid rgba(184, 70, 10, 0.15) !important;
          justify-content: center;
        }

        /* Config Mock */
        .config-mock {
          gap: 4px;
        }

        .config-row-mock {
          display: flex;
          justify-content: space-between;
          padding: 8px 12px;
          border-radius: 6px;
          border: 1px solid var(--cream-border);
          background: var(--white);
          font-family: var(--font-sans);
          font-size: 12px;
          color: var(--ink-2);
        }

        /* Briefs Mock */
        .briefs-mock {
          gap: 8px;
        }

        .brief-item-mock {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          border-radius: 8px;
          border: 1px solid var(--cream-border);
          background: var(--white);
          font-family: var(--font-sans);
          font-size: 11px;
          color: var(--ink-3);
        }

        .brief-item-mock.active {
          border-color: var(--accent) !important;
          background: var(--accent-light) !important;
          color: var(--ink) !important;
          font-weight: 600;
        }

        /* Payout Mock */
        .payout-status-badge {
          font-family: var(--font-sans);
          font-size: 9.5px;
          font-weight: 700;
          color: #047857;
          background: #ECFDF5;
          padding: 2px 8px;
          border-radius: 100px;
        }

        .cta-flow-btn:hover {
          background: var(--accent) !important;
          box-shadow: 0 8px 24px rgba(184, 70, 10, 0.2) !important;
          transform: translateY(-1px);
        }

        /* Layout Responsiveness mirroring Bento attached styles */
        @media (max-width: 900px) {
          .bento-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}} />
    </main>
  )
}
