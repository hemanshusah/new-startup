'use client'

import { useState, useEffect } from 'react'
import { submitMentorApplication } from '@/lib/mentor-actions'
import { useRouter } from 'next/navigation'

export default function ApplyPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

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
        router.push('/')
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [success, router])

  if (success) {
    return (
      <main style={{ background: 'var(--cream)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{ background: 'var(--white)', border: '1px solid var(--cream-border)', borderRadius: '16px', padding: '60px 40px', maxWidth: '600px', textAlign: 'center' }}>
          <div style={{ width: '64px', height: '64px', background: '#EDF5EA', color: '#2A6620', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', margin: '0 auto 24px' }}>
            ✓
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '32px', color: 'var(--ink)', margin: '0 0 16px' }}>Application Submitted</h1>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '16px', color: 'var(--ink-3)', lineHeight: 1.6, margin: '0 0 32px' }}>
            Thank you for applying to Mentor Connect. Our team will review your application and LinkedIn profile. You will receive an email within 3-5 business days regarding your status.
            <br/><br/>
            Redirecting you to the homepage in 5 seconds...
          </p>
          <button onClick={() => router.push('/')} style={{ padding: '14px 28px', background: 'var(--ink)', color: 'var(--white)', borderRadius: '8px', fontFamily: 'var(--font-sans)', fontSize: '15px', fontWeight: 500, cursor: 'pointer', border: 'none' }}>
            Return to Homepage Now
          </button>
        </div>
      </main>
    )
  }

  return (
    <main style={{ background: 'var(--cream)', minHeight: 'calc(100vh - 56px)', padding: '60px 24px' }}>
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '40px', color: 'var(--ink)', margin: '0 0 16px' }}>Become a Mentor</h1>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '18px', color: 'var(--ink-3)', margin: 0 }}>
            Share your expertise, build your brand, and earn by helping the next generation of founders.
          </p>
        </div>

        {error && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', padding: '16px', borderRadius: '8px', marginBottom: '32px', fontFamily: 'var(--font-sans)', fontSize: '14px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ background: 'var(--white)', border: '1px solid var(--cream-border)', borderRadius: '16px', padding: '40px' }}>
          
          {/* Section 1: Basic Info */}
          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: '18px', fontWeight: 600, color: 'var(--ink)', margin: '0 0 24px', paddingBottom: '12px', borderBottom: '1px solid var(--cream-border)' }}>1. Basic Information</h2>
            
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 500, color: 'var(--ink)', marginBottom: '8px' }}>Profile Picture *</label>
              <input required name="avatar" type="file" accept="image/*" style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--cream-border)', background: 'var(--cream)', fontFamily: 'var(--font-sans)', fontSize: '14px' }} />
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--ink-4)', fontFamily: 'var(--font-sans)' }}>Square JPG or PNG works best.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 500, color: 'var(--ink)', marginBottom: '8px' }}>Display Name *</label>
                <input required name="display_name" type="text" placeholder="e.g. Priya Sharma" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--cream-border)', background: 'var(--cream)', fontFamily: 'var(--font-sans)', fontSize: '15px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 500, color: 'var(--ink)', marginBottom: '8px' }}>LinkedIn URL *</label>
                <input required name="linkedin_url" type="url" placeholder="https://linkedin.com/in/..." style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--cream-border)', background: 'var(--cream)', fontFamily: 'var(--font-sans)', fontSize: '15px' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 500, color: 'var(--ink)', marginBottom: '8px' }}>City *</label>
                <input required name="location_city" type="text" placeholder="e.g. Bangalore" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--cream-border)', background: 'var(--cream)', fontFamily: 'var(--font-sans)', fontSize: '15px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 500, color: 'var(--ink)', marginBottom: '8px' }}>Country *</label>
                <input required name="location_country" type="text" defaultValue="India" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--cream-border)', background: 'var(--cream)', fontFamily: 'var(--font-sans)', fontSize: '15px' }} />
              </div>
            </div>
          </section>

          {/* Section 2: Profile Display */}
          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: '18px', fontWeight: 600, color: 'var(--ink)', margin: '0 0 24px', paddingBottom: '12px', borderBottom: '1px solid var(--cream-border)' }}>2. Professional Profile</h2>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 500, color: 'var(--ink)', marginBottom: '8px' }}>Headline *</label>
              <input required name="headline" type="text" placeholder="e.g. Ex-Stripe India Head | Scaling Fintech & Cross-border Compliance" maxLength={100} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--cream-border)', background: 'var(--cream)', fontFamily: 'var(--font-sans)', fontSize: '15px' }} />
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--ink-4)', fontFamily: 'var(--font-sans)' }}>Keep it under 100 characters.</p>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 500, color: 'var(--ink)', marginBottom: '8px' }}>Detailed Bio *</label>
              <textarea required name="bio" rows={5} placeholder="Tell founders about your journey, what you specialize in, and how exactly you can help them..." style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--cream-border)', background: 'var(--cream)', fontFamily: 'var(--font-sans)', fontSize: '15px', resize: 'vertical' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 500, color: 'var(--ink)', marginBottom: '8px' }}>Years of Experience *</label>
                <input required name="years_experience" type="number" min="1" max="50" placeholder="e.g. 10" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--cream-border)', background: 'var(--cream)', fontFamily: 'var(--font-sans)', fontSize: '15px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 500, color: 'var(--ink)', marginBottom: '8px' }}>Intro Video URL (Optional)</label>
                <input name="intro_video_url" type="url" placeholder="YouTube or Loom link" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--cream-border)', background: 'var(--cream)', fontFamily: 'var(--font-sans)', fontSize: '15px' }} />
              </div>
            </div>
          </section>

          {/* Section 3: Expertise */}
          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: '18px', fontWeight: 600, color: 'var(--ink)', margin: '0 0 24px', paddingBottom: '12px', borderBottom: '1px solid var(--cream-border)' }}>3. Expertise & Tags</h2>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 500, color: 'var(--ink)', marginBottom: '8px' }}>Core Expertise Areas * (Comma separated)</label>
              <input required name="expertise_areas" type="text" placeholder="e.g. Market Entry, Regulatory Compliance, Fundraising" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--cream-border)', background: 'var(--cream)', fontFamily: 'var(--font-sans)', fontSize: '15px' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 500, color: 'var(--ink)', marginBottom: '8px' }}>Industries *</label>
                <input required name="industries" type="text" placeholder="e.g. Fintech, SaaS" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--cream-border)', background: 'var(--cream)', fontFamily: 'var(--font-sans)', fontSize: '15px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 500, color: 'var(--ink)', marginBottom: '8px' }}>Notable Companies</label>
                <input name="notable_companies" type="text" placeholder="e.g. Stripe, Razorpay" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--cream-border)', background: 'var(--cream)', fontFamily: 'var(--font-sans)', fontSize: '15px' }} />
              </div>
            </div>
          </section>

          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              width: '100%', 
              padding: '16px', 
              background: loading ? 'var(--ink-4)' : 'var(--accent)', 
              color: 'var(--white)', 
              borderRadius: '8px', 
              fontFamily: 'var(--font-sans)', 
              fontSize: '16px', 
              fontWeight: 600, 
              cursor: loading ? 'wait' : 'pointer', 
              border: 'none',
              transition: 'background 0.2s ease'
            }}
          >
            {loading ? 'Submitting...' : 'Submit Application'}
          </button>
        </form>
      </div>
    </main>
  )
}
