'use client'

import { useState, useEffect } from 'react'
import { submitMentorApplication } from '@/lib/mentor-actions'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthProvider'
import { 
  Sparkles, 
  UploadCloud, 
  MapPin, 
  Award, 
  Compass, 
  ShieldCheck, 
  ArrowRight,
  User,
  Briefcase
} from 'lucide-react'

const LinkedinIcon = ({ size = 14, color = 'currentColor', style }: { size?: number; color?: string; style?: React.CSSProperties }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, ...style }}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
    <rect x="2" y="9" width="4" height="12"></rect>
    <circle cx="4" cy="4" r="2"></circle>
  </svg>
)

const TwitterIcon = ({ size = 14, color = 'currentColor', style }: { size?: number; color?: string; style?: React.CSSProperties }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, ...style }}>
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
  </svg>
)

export default function ApplyPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  // Custom states for premium image preview dropzone
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarName, setAvatarName] = useState<string | null>(null)

  const { profile, status } = useAuth()
  const authLoading = status === 'loading'

  useEffect(() => {
    // If they already applied, send them to dashboard
    if (!authLoading && profile?.account_intent === 'mentor' && profile.mentor_status) {
      router.push('/mentor/availability')
    }
  }, [profile, authLoading, router])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarName(file.name)
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    
    try {
      const result = await submitMentorApplication(formData)
      if (result.error) {
        setError(result.error)
      } else {
        setSuccess(true)
        window.scrollTo(0, 0)
        // Refresh to update Navbar mentor_status
        router.refresh()
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        router.push('/mentor/availability')
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [success, router])

  if (authLoading) {
    return (
      <div style={{ 
        padding: '100px', 
        textAlign: 'center', 
        fontFamily: 'var(--font-sans)', 
        color: 'var(--ink-4)', 
        background: 'var(--bg)', 
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div className="spinner-mock" />
          <span>Verifying authentication status...</span>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <main style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', position: 'relative', overflow: 'hidden' }}>
        {/* Glow */}
        <div style={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '500px',
          height: '300px',
          background: 'radial-gradient(circle, var(--accent-light) 0%, transparent 70%)',
          opacity: 0.6,
          pointerEvents: 'none'
        }} />

        <div style={{ 
          background: 'var(--white)', 
          border: '1px solid var(--cream-border)', 
          borderRadius: '24px', 
          padding: '60px 40px', 
          maxWidth: '560px', 
          textAlign: 'center',
          boxShadow: '0 16px 48px rgba(28,26,22,0.05)',
          position: 'relative',
          zIndex: 1
        }}>
          <div style={{ 
            width: '72px', 
            height: '72px', 
            background: 'var(--accent-light)', 
            color: 'var(--accent)', 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            margin: '0 auto 24px',
            border: '1px solid rgba(184,70,10,0.15)'
          }}>
            <ShieldCheck size={36} />
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '32px', color: 'var(--ink)', margin: '0 0 16px', fontWeight: 400 }}>
            Application Received
          </h1>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '15px', color: 'var(--ink-3)', lineHeight: 1.6, margin: '0 0 32px' }}>
            Thank you for applying. Our network curators will review your builder history, credentials, and LinkedIn profile. Verified practitioners usually receive access credentials within 3-5 business days.
            <br/><br/>
            <span style={{ fontSize: '13px', color: 'var(--ink-4)', fontWeight: 500 }}>
              Redirecting you to the availability dashboard in 5 seconds...
            </span>
          </p>
          <button 
            onClick={() => router.push('/mentor/availability')} 
            style={{ 
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '14px 32px', 
              background: 'var(--ink)', 
              color: 'var(--white)', 
              borderRadius: '100px', 
              fontFamily: 'var(--font-sans)', 
              fontSize: '14px', 
              fontWeight: 600, 
              cursor: 'pointer', 
              border: 'none',
              transition: 'background 0.2s ease'
            }}
            className="cta-flow-btn"
          >
            Access Dashboard
            <ArrowRight size={14} />
          </button>
        </div>
      </main>
    )
  }

  return (
    <main style={{ background: 'var(--bg)', minHeight: 'calc(100vh - 56px)', padding: '80px 24px 100px', position: 'relative', overflow: 'hidden' }}>
      
      {/* Decorative gold ambient light */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '600px',
        height: '350px',
        background: 'radial-gradient(circle, var(--accent-light) 0%, transparent 70%)',
        opacity: 0.5,
        pointerEvents: 'none'
      }} />

      <div style={{ maxWidth: '720px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        
        {/* HERO TITLE */}
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
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
            marginBottom: '20px',
            border: '1px solid rgba(184, 70, 10, 0.15)',
          }}>
            <Sparkles size={12} />
            BUILDER PORTAL
          </div>

          <h1 style={{ 
            fontFamily: 'var(--font-serif)', 
            fontSize: 'clamp(2rem, 4.5vw, 2.75rem)', 
            color: 'var(--ink)', 
            margin: '0 0 16px',
            fontWeight: 400,
            letterSpacing: '-0.02em'
          }}>
            Become a Mentor
          </h1>
          
          <p style={{ 
            fontFamily: 'var(--font-sans)', 
            fontSize: '16px', 
            color: 'var(--ink-3)', 
            maxWidth: '520px', 
            margin: '0 auto',
            lineHeight: 1.5
          }}>
            Share your expert operator experience, guide next-generation builders, and manage strategic advisory calls seamlessly.
          </p>
        </div>

        {error && (
          <div style={{ 
            background: '#FEF2F2', 
            border: '1px solid #FCA5A5', 
            color: '#991B1B', 
            padding: '16px 20px', 
            borderRadius: '12px', 
            marginBottom: '32px', 
            fontFamily: 'var(--font-sans)', 
            fontSize: '14px',
            fontWeight: 500
          }}>
            {error}
          </div>
        )}

        {/* ONBOARDING FORM */}
        <form 
          onSubmit={handleSubmit} 
          encType="multipart/form-data"
          style={{ 
            background: 'var(--white)', 
            border: '1px solid var(--cream-border)', 
            borderRadius: '24px', 
            padding: '48px 40px',
            boxShadow: '0 8px 32px rgba(28,26,22,0.02)'
          }}
        >
          
          {/* Section 1: Basic Info */}
          <section style={{ marginBottom: '48px' }}>
            <div className="form-section-header">
              <span className="form-step-badge">01</span>
              <h2 className="form-section-title">Basic Information</h2>
            </div>
            
            {/* Custom Premium File Upload Zone */}
            <div style={{ marginBottom: '28px' }}>
              <label style={{ display: 'block', fontFamily: 'var(--font-sans)', fontSize: '13.5px', fontWeight: 600, color: 'var(--ink-2)', marginBottom: '10px' }}>
                Profile Picture <span style={{ color: 'var(--accent)' }}>*</span>
              </label>
              
              <input 
                required 
                id="avatar-input"
                name="avatar" 
                type="file" 
                accept="image/*" 
                onChange={handleAvatarChange}
                style={{ display: 'none' }} 
              />
              
              <div 
                onClick={() => document.getElementById('avatar-input')?.click()}
                className="custom-upload-zone"
              >
                {avatarPreview ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ 
                      width: '70px', 
                      height: '70px', 
                      borderRadius: '50%', 
                      backgroundImage: `url(${avatarPreview})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      border: '2px solid var(--accent)'
                    }} />
                    <div style={{ textAlign: 'left' }}>
                      <span style={{ display: 'block', fontFamily: 'var(--font-sans)', fontSize: '13.5px', fontWeight: 600, color: 'var(--ink)' }}>
                        Image uploaded successfully
                      </span>
                      <span style={{ display: 'block', fontFamily: 'var(--font-sans)', fontSize: '11px', color: 'var(--ink-4)' }}>
                        {avatarName || 'avatar-image.png'} (Click to change)
                      </span>
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center' }}>
                    <UploadCloud size={28} color="var(--accent)" style={{ marginBottom: '10px' }} />
                    <span style={{ display: 'block', fontFamily: 'var(--font-sans)', fontSize: '13.5px', fontWeight: 600, color: 'var(--ink)' }}>
                      Click to upload avatar
                    </span>
                    <span style={{ display: 'block', fontFamily: 'var(--font-sans)', fontSize: '11.5px', color: 'var(--ink-4)', marginTop: '2px' }}>
                      Supports square JPG, JPEG or PNG images.
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label className="form-field-label">
                Display Name <span style={{ color: 'var(--accent)' }}>*</span>
              </label>
              <input 
                required 
                name="display_name" 
                type="text" 
                placeholder="e.g. Siddharth Kapoor" 
                className="premium-input" 
              />
            </div>

            {/* Social Links Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '24px' }}>
              <div>
                <label className="form-field-label">
                  LinkedIn Profile <span style={{ color: 'var(--accent)' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <LinkedinIcon size={15} color="var(--ink-4)" style={{ position: 'absolute', left: '14px', top: '16px' }} />
                  <input 
                    required 
                    name="linkedin_url" 
                    type="url" 
                    placeholder="https://linkedin.com/in/..." 
                    className="premium-input" 
                    style={{ paddingLeft: '40px' }}
                  />
                </div>
              </div>
              <div>
                <label className="form-field-label">
                  Twitter / X URL (Optional)
                </label>
                <div style={{ position: 'relative' }}>
                  <TwitterIcon size={15} color="var(--ink-4)" style={{ position: 'absolute', left: '14px', top: '16px' }} />
                  <input 
                    name="twitter_url" 
                    type="url" 
                    placeholder="https://x.com/..." 
                    className="premium-input" 
                    style={{ paddingLeft: '40px' }}
                  />
                </div>
              </div>
            </div>

            {/* Location Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
              <div>
                <label className="form-field-label">
                  City <span style={{ color: 'var(--accent)' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <MapPin size={15} color="var(--ink-4)" style={{ position: 'absolute', left: '14px', top: '16px' }} />
                  <input 
                    required 
                    name="location_city" 
                    type="text" 
                    placeholder="e.g. Mumbai" 
                    className="premium-input" 
                    style={{ paddingLeft: '40px' }}
                  />
                </div>
              </div>
              <div>
                <label className="form-field-label">
                  Country <span style={{ color: 'var(--accent)' }}>*</span>
                </label>
                <input 
                  required 
                  name="location_country" 
                  type="text" 
                  defaultValue="India" 
                  className="premium-input" 
                />
              </div>
            </div>
          </section>

          {/* Section 2: Profile Display */}
          <section style={{ marginBottom: '48px' }}>
            <div className="form-section-header">
              <span className="form-step-badge">02</span>
              <h2 className="form-section-title">Professional Profile</h2>
            </div>
            
            <div style={{ marginBottom: '24px' }}>
              <label className="form-field-label">
                Professional Headline <span style={{ color: 'var(--accent)' }}>*</span>
              </label>
              <input 
                required 
                name="headline" 
                type="text" 
                placeholder="e.g. Ex-Razorpay VP | Scaling Fintech Operations & Compliance" 
                maxLength={100} 
                className="premium-input" 
              />
              <span style={{ display: 'block', fontSize: '11px', color: 'var(--ink-4)', marginTop: '6px', fontWeight: 500 }}>
                Keep it under 100 characters to ensure clean card presentation.
              </span>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label className="form-field-label">
                Detailed Biography <span style={{ color: 'var(--accent)' }}>*</span>
              </label>
              <textarea 
                required 
                name="bio" 
                rows={5} 
                placeholder="Describe your career journey, notable accomplishments, core competencies, and how exactly you intend to support founders..." 
                className="premium-input" 
                style={{ resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
              <div>
                <label className="form-field-label">
                  Years of Professional Experience <span style={{ color: 'var(--accent)' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Award size={15} color="var(--ink-4)" style={{ position: 'absolute', left: '14px', top: '16px' }} />
                  <input 
                    required 
                    name="years_experience" 
                    type="number" 
                    min="1" 
                    max="50" 
                    placeholder="e.g. 12" 
                    className="premium-input" 
                    style={{ paddingLeft: '40px' }}
                  />
                </div>
              </div>
              <div>
                <label className="form-field-label">
                  Introduction Video URL (Optional)
                </label>
                <div style={{ position: 'relative' }}>
                  <Compass size={15} color="var(--ink-4)" style={{ position: 'absolute', left: '14px', top: '16px' }} />
                  <input 
                    name="intro_video_url" 
                    type="url" 
                    placeholder="YouTube or Loom video link" 
                    className="premium-input" 
                    style={{ paddingLeft: '40px' }}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Expertise */}
          <section style={{ marginBottom: '48px' }}>
            <div className="form-section-header">
              <span className="form-step-badge">03</span>
              <h2 className="form-section-title">Expertise & Tags</h2>
            </div>
            
            <div style={{ marginBottom: '24px' }}>
              <label className="form-field-label">
                Core Expertise Areas <span style={{ color: 'var(--accent)' }}>*</span>
              </label>
              <input 
                required 
                name="expertise_areas" 
                type="text" 
                placeholder="e.g. Capital Fundraising, Growth Hacking, Regulatory Operations (comma separated)" 
                className="premium-input" 
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
              <div>
                <label className="form-field-label">
                  Industries <span style={{ color: 'var(--accent)' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Briefcase size={14} color="var(--ink-4)" style={{ position: 'absolute', left: '14px', top: '16px' }} />
                  <input 
                    required 
                    name="industries" 
                    type="text" 
                    placeholder="e.g. Fintech, Web3, SaaS (comma separated)" 
                    className="premium-input" 
                    style={{ paddingLeft: '40px' }}
                  />
                </div>
              </div>
              <div>
                <label className="form-field-label">
                  Notable Organizations / Past Companies
                </label>
                <input 
                  name="notable_companies" 
                  type="text" 
                  placeholder="e.g. Razorpay, Antler, Stripe (comma separated)" 
                  className="premium-input" 
                />
              </div>
            </div>
          </section>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              width: '100%', 
              padding: '16px 24px', 
              background: loading ? 'var(--ink-4)' : 'var(--accent)', 
              color: 'var(--white)', 
              borderRadius: '100px', 
              fontFamily: 'var(--font-sans)', 
              fontSize: '15px', 
              fontWeight: 600, 
              cursor: loading ? 'wait' : 'pointer', 
              border: 'none',
              transition: 'all 0.25s ease',
              boxShadow: '0 4px 14px rgba(184, 70, 10, 0.15)'
            }}
            className="cta-flow-btn"
          >
            {loading ? 'Submitting Application...' : 'Submit Application'}
          </button>
        </form>
      </div>

      {/* Embedded High-Aesthetic Styled Block */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .form-section-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 28px;
          padding-bottom: 14px;
          border-bottom: 1px solid var(--cream-border);
          background-image: radial-gradient(var(--cream-border) 1px, transparent 1px);
          background-size: 16px 16px;
        }

        .form-section-title {
          font-family: var(--font-serif);
          font-size: 20px;
          font-weight: 400;
          color: var(--ink);
          margin: 0;
        }

        .form-step-badge {
          font-family: var(--font-sans);
          font-size: 11px;
          font-weight: 700;
          color: var(--accent);
          background: var(--accent-light);
          border: 1px solid rgba(184,70,10,0.15);
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .form-field-label {
          display: block;
          font-family: var(--font-sans);
          font-size: 13.5px;
          font-weight: 600;
          color: var(--ink-2);
          margin-bottom: 8px;
        }

        .premium-input {
          width: 100%;
          padding: 13px 16px;
          border-radius: 10px;
          border: 1px solid var(--cream-border);
          background: var(--bg);
          font-family: var(--font-sans);
          font-size: 14.5px;
          color: var(--ink);
          outline: none;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .premium-input::placeholder {
          color: var(--ink-4);
        }

        .premium-input:focus {
          border-color: var(--accent) !important;
          background: var(--white) !important;
          box-shadow: 0 4px 16px rgba(184, 70, 10, 0.04) !important;
        }

        .custom-upload-zone {
          border: 1px dashed var(--cream-border);
          border-radius: 12px;
          background: var(--bg);
          padding: 24px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          background-image: radial-gradient(var(--cream-border) 1px, transparent 1px);
          background-size: 14px 14px;
        }

        .custom-upload-zone:hover {
          border-color: var(--accent);
          background: var(--white);
          box-shadow: 0 4px 16px rgba(184,70,10,0.02);
        }

        .spinner-mock {
          width: 24px;
          height: 24px;
          border: 2px solid var(--cream-border);
          border-top-color: var(--accent);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}} />
    </main>
  )
}
