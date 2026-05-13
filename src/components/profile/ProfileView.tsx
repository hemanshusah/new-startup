'use client'

import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { uploadAvatar } from '@/lib/supabase/storage'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { useEffect } from 'react'

interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  phone: string | null
  startup_name: string | null
  startup_website: string | null
  startup_email: string | null
  startup_sectors: string[] | null
  startup_stage: string | null
  startup_state: string | null
  startup_city: string | null
  startup_description: string | null
  revenue_status: string | null
  funding_status: string | null
  account_intent: string | null
  role: string
  created_at: string
}


export function ProfileView({ 
  profile: initialProfile, 
  userImage,
  sectorOptions = []
}: { 
  profile: Profile; 
  userImage?: string | null;
  sectorOptions?: string[];
}) {
  const supabase = createClient()
  const [profile, setProfile] = useState<Profile>({
    ...initialProfile,
    startup_sectors: initialProfile.startup_sectors || [],
    startup_stage: initialProfile.startup_stage || null,
    startup_state: initialProfile.startup_state || null,
    startup_city: initialProfile.startup_city || null,
    startup_description: initialProfile.startup_description || null,
    revenue_status: initialProfile.revenue_status || null,
    funding_status: initialProfile.funding_status || null,
    startup_name: initialProfile.startup_name || null,
    startup_website: initialProfile.startup_website || null,
    startup_email: initialProfile.startup_email || null,
    phone: initialProfile.phone || null
  })
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState<'personal' | 'startup' | 'mentor'>('personal')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const searchParams = useSearchParams()

  // Handle verification success message
  useEffect(() => {
    if (searchParams.get('verified') === 'true') {
      setMessage({ type: 'success', text: 'Email verified successfully! Welcome to your profile.' })
    }
  }, [searchParams])

  // ── Handlers ────────────────────────────────────────────────────────────

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      // 1. Check if email changed
      const emailChanged = profile.email !== initialProfile.email

      if (emailChanged) {
        const { error: authError } = await supabase.auth.updateUser({ email: profile.email })
        if (authError) throw authError
        setMessage({ type: 'success', text: 'Email update triggered. Check your inbox for verification.' })
      }

      // 2. Update Profile Table
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name || null,
          avatar_url: profile.avatar_url || null,
          phone: profile.phone || null,
          account_intent: profile.account_intent || null,
          startup_name: profile.startup_name || null,
          startup_website: profile.startup_website || null,
          startup_email: profile.startup_email || null,
          startup_sectors: profile.startup_sectors && profile.startup_sectors.length > 0 ? profile.startup_sectors : null,
          startup_stage: profile.startup_stage || null,
          startup_state: profile.startup_state || null,
          startup_city: profile.startup_city || null,
          startup_description: profile.startup_description || null,
          revenue_status: profile.revenue_status || null,
          funding_status: profile.funding_status || null,
        })
        .eq('id', profile.id)

      if (error) throw error

      if (!emailChanged) {
        setMessage({ type: 'success', text: 'Profile updated successfully.' })
        setIsEditing(false)
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update profile.'
      setMessage({ type: 'error', text: msg })
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    try {
      const publicUrl = await uploadAvatar(profile.id, file)

      // Update DB
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', profile.id)

      if (error) throw error
      setProfile(prev => ({ ...prev, avatar_url: publicUrl }))
      setMessage({ type: 'success', text: 'Avatar updated!' })
    } catch (err: unknown) {
      setMessage({ type: 'error', text: 'Failed to upload avatar.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="profile-layout-grid" style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '40px', alignItems: 'start' }}>

      {/* ── Left Column: Avatar & Overview ── */}
      <aside className="profile-sidebar" style={{
        background: 'var(--white)',
        padding: '32px',
        borderRadius: '16px',
        border: '1px solid var(--cream-border)',
        position: 'sticky',
        top: '96px'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ position: 'relative', marginBottom: '20px' }}>
            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '60px',
              background: 'var(--cream-dark)',
              border: '4px solid var(--white)',
              boxShadow: '0 4px 12px rgba(28,26,22,0.08)',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {profile.avatar_url || userImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                  src={profile.avatar_url || userImage || ''} 
                  alt={profile.full_name || 'Profile'} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              ) : (
                <span style={{ fontSize: '36px', fontFamily: 'var(--font-serif)', color: 'var(--ink-3)' }}>
                  {profile.full_name?.slice(0, 1) || profile.email?.slice(0, 1).toUpperCase()}
                </span>
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                position: 'absolute',
                bottom: '4px',
                right: '4px',
                width: '32px',
                height: '32px',
                borderRadius: '16px',
                background: 'var(--ink)',
                color: 'var(--white)',
                border: '2px solid var(--white)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px'
              }}
              title="Change Photo"
            >
              📷
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarUpload}
              style={{ display: 'none' }}
              accept="image/*"
            />
          </div>

          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', margin: '0 0 4px' }}>
            {profile.full_name || 'Anonymous User'}
          </h1>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--ink-3)', margin: '0 0 20px' }}>
            Member since {new Date(profile.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
          </p>

          <div style={{ width: '100%', height: '1px', background: 'var(--cream-border)', margin: '0 0 20px' }} />

          <div style={{ width: '100%', textAlign: 'left' }}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '10px', color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</label>
              <p style={{ fontSize: '14px', margin: '2px 0 0', wordBreak: 'break-all' }}>{profile.email}</p>
            </div>
            {profile.phone && (
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '10px', color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Phone</label>
                <p style={{ fontSize: '14px', margin: '2px 0 0' }}>{profile.phone}</p>
              </div>
            )}
            {profile.account_intent === 'mentor' && (
              <Link
                href="/mentor/availability"
                style={{
                  display: 'block',
                  marginTop: '12px',
                  padding: '10px',
                  background: 'var(--ink)',
                  borderRadius: '8px',
                  textAlign: 'center',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: 'var(--white)',
                  textDecoration: 'none'
                }}
              >
                Mentor Dashboard
              </Link>
            )}
            {profile.role === 'admin' && (
              <Link
                href="/admin"
                style={{
                  display: 'block',
                  marginTop: '12px',
                  padding: '10px',
                  background: 'var(--cream-dark)',
                  borderRadius: '8px',
                  textAlign: 'center',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: 'var(--ink)',
                  textDecoration: 'none'
                }}
              >
                Admin Dashboard
              </Link>
            )}
          </div>
        </div>
      </aside>

      {/* ── Right Column: Content ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

        {/* Profile Tabs/Sections */}
        <section style={{
          background: 'var(--white)',
          padding: '40px',
          borderRadius: '16px',
          border: '1px solid var(--cream-border)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', margin: 0 }}>Account Information</h2>
            <button
              onClick={() => setIsEditing(!isEditing)}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                border: '1px solid var(--cream-border)',
                background: isEditing ? 'var(--cream-dark)' : 'transparent',
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          <AnimatePresence mode="wait">
            {isEditing ? (
              <motion.form
                key="edit"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onSubmit={handleUpdate}
                style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 500, marginBottom: '6px' }}>Full Name</label>
                    <input
                      type="text"
                      className="profile-input"
                      value={profile.full_name || ''}
                      onChange={e => setProfile(p => ({ ...p, full_name: e.target.value }))}
                      style={inputStyle}
                    />
                  </div>
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 500, marginBottom: '6px' }}>Email Address</label>
                    <input
                      type="email"
                      className="profile-input"
                      value={profile.email || ''}
                      onChange={e => setProfile(p => ({ ...p, email: e.target.value }))}
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 500, marginBottom: '6px' }}>Phone Number</label>
                    <input
                      type="tel"
                      className="profile-input"
                      value={profile.phone || ''}
                      onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))}
                      style={inputStyle}
                      placeholder="+91..."
                    />
                  </div>
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 500, marginBottom: '6px' }}>Primary Goal on GrantsIndia</label>
                    <select
                      value={profile.account_intent || 'founder'}
                      onChange={e => setProfile(p => ({ ...p, account_intent: e.target.value as any }))}
                      style={inputStyle}
                    >
                      <option value="founder">I am a Founder seeking grants</option>
                      <option value="mentor">I am a Mentor</option>
                      <option value="explorer">Just exploring</option>
                    </select>
                  </div>
                </div>

                {profile.account_intent === 'founder' && (
                  <>
                    <div style={{ height: '1px', background: 'var(--cream-border)', margin: '10px 0' }} />

                    <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', margin: '0 0 4px' }}>Startup Details</h3>
                    <p style={{ fontSize: '13px', color: 'var(--ink-3)', margin: '0 0 20px' }}>Tell us about your venture to get tailored recommendations.</p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 500, marginBottom: '6px' }}>Startup Name</label>
                    <input
                      type="text"
                      className="profile-input"
                      value={profile.startup_name || ''}
                      onChange={e => setProfile(p => ({ ...p, startup_name: e.target.value }))}
                      style={inputStyle}
                    />
                  </div>
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 500, marginBottom: '6px' }}>Official Startup Email</label>
                    <input
                      type="email"
                      className="profile-input"
                      value={profile.startup_email || ''}
                      onChange={e => setProfile(p => ({ ...p, startup_email: e.target.value }))}
                      style={inputStyle}
                      placeholder="hello@yourstartup.com"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 500, marginBottom: '6px' }}>Startup Website</label>
                    <input
                      type="url"
                      className="profile-input"
                      value={profile.startup_website || ''}
                      onChange={e => setProfile(p => ({ ...p, startup_website: e.target.value }))}
                      style={inputStyle}
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 500, marginBottom: '6px' }}>Startup Stage</label>
                    <select
                      value={profile.startup_stage || ''}
                      onChange={e => setProfile(p => ({ ...p, startup_stage: e.target.value }))}
                      style={inputStyle}
                    >
                      <option value="">Select Stage</option>
                      <option value="idea">Idea / Pre-seed</option>
                      <option value="mvp">MVP / Early Prototype</option>
                      <option value="early-traction">Early Traction</option>
                      <option value="scaling">Scaling</option>
                      <option value="mature">Mature / Established</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 500, marginBottom: '6px' }}>Revenue Status</label>
                    <select
                      value={profile.revenue_status || ''}
                      onChange={e => setProfile(p => ({ ...p, revenue_status: e.target.value }))}
                      style={inputStyle}
                    >
                      <option value="">Select Status</option>
                      <option value="pre-revenue">Pre-revenue</option>
                      <option value="revenue-generating">Revenue Generating</option>
                      <option value="profitable">Profitable</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 500, marginBottom: '6px' }}>Funding Status</label>
                    <select
                      value={profile.funding_status || ''}
                      onChange={e => setProfile(p => ({ ...p, funding_status: e.target.value || null }))}
                      style={inputStyle}
                    >
                      <option value="">Select Status</option>
                      <option value="bootstrapped">Bootstrapped</option>
                      <option value="angel-funded">Angel Funded</option>
                      <option value="seed-funded">Seed Funded</option>
                      <option value="series-a">Series A</option>
                      <option value="series-b+">Series B+</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 500, marginBottom: '6px' }}>State / Location</label>
                    <input
                      type="text"
                      className="profile-input"
                      value={profile.startup_state || ''}
                      onChange={e => setProfile(p => ({ ...p, startup_state: e.target.value }))}
                      style={inputStyle}
                      placeholder="e.g. Maharashtra"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 500, marginBottom: '6px' }}>Focus Sectors</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                    {sectorOptions.length > 0 ? sectorOptions.map(sector => (
                      <button
                        key={sector}
                        type="button"
                        onClick={() => {
                          const current = profile.startup_sectors || []
                          const updated = current.includes(sector) 
                            ? current.filter(s => s !== sector)
                            : [...current, sector]
                          setProfile(p => ({ ...p, startup_sectors: updated }))
                        }}
                        style={{
                          padding: '6px 14px',
                          borderRadius: '100px',
                          fontSize: '12px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          border: '1px solid var(--cream-border)',
                          background: profile.startup_sectors?.includes(sector) ? 'var(--ink)' : 'var(--white)',
                          color: profile.startup_sectors?.includes(sector) ? 'var(--white)' : 'var(--ink-2)',
                        }}
                      >
                        {sector}
                      </button>
                    )) : (
                      <p style={{ fontSize: '12px', color: 'var(--ink-4)' }}>No sectors defined by admin.</p>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 500, marginBottom: '6px' }}>Startup Description</label>
                  <textarea
                    value={profile.startup_description || ''}
                    onChange={e => setProfile(p => ({ ...p, startup_description: e.target.value }))}
                    style={{ ...inputStyle, height: '100px', resize: 'vertical' }}
                    placeholder="Briefly describe what your startup does..."
                  />
                </div>
                  </>
                )}

                {message && (
                  <div style={{
                    padding: '12px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    background: message.type === 'success' ? '#EDF5EA' : '#FDF0EA',
                    color: message.type === 'success' ? '#1E6E2E' : '#B8460A',
                    border: '1px solid currentColor'
                  }}>
                    {message.text}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    background: 'var(--ink)',
                    color: 'var(--white)',
                    border: 'none',
                    fontWeight: 500,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    marginTop: '10px',
                    opacity: loading ? 0.7 : 1
                  }}
                >
                  {loading ? 'Saving...' : 'Save All Changes'}
                </button>
              </motion.form>
            ) : (
              <motion.div
                key="view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}
              >
                <div style={infoBoxStyle}>
                  <label style={labelStyle}>Primary Goal on GrantsIndia</label>
                  <p style={{ ...valueStyle, textTransform: 'capitalize' }}>
                    {profile.account_intent === 'founder' ? 'Founder seeking grants' : 
                     profile.account_intent === 'mentor' ? 'Mentor' : 
                     profile.account_intent === 'explorer' ? 'Exploring' : '—'}
                  </p>
                </div>

                {profile.account_intent === 'founder' && (
                  <>
                    <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', margin: '16px 0 0' }}>Startup Details</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
                      <div style={infoBoxStyle}>
                        <label style={labelStyle}>Startup Name</label>
                        <p style={valueStyle}>{profile.startup_name || '—'}</p>
                      </div>
                      <div style={infoBoxStyle}>
                        <label style={labelStyle}>Official Email</label>
                        <p style={valueStyle}>{profile.startup_email || '—'}</p>
                      </div>
                      <div style={infoBoxStyle}>
                        <label style={labelStyle}>Website</label>
                        <p style={valueStyle}>
                          {profile.startup_website ? (
                            <a href={profile.startup_website} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>
                              {profile.startup_website.replace(/^https?:\/\//, '')}
                            </a>
                          ) : '—'}
                        </p>
                      </div>
                      <div style={infoBoxStyle}>
                        <label style={labelStyle}>Stage</label>
                        <p style={valueStyle}>{profile.startup_stage || '—'}</p>
                      </div>
                      <div style={infoBoxStyle}>
                        <label style={labelStyle}>Funding</label>
                        <p style={valueStyle}>{profile.funding_status || '—'}</p>
                      </div>
                      <div style={infoBoxStyle}>
                        <label style={labelStyle}>Sectors</label>
                        <p style={valueStyle}>{profile.startup_sectors?.join(', ') || '—'}</p>
                      </div>
                      <div style={infoBoxStyle}>
                        <label style={labelStyle}>Location</label>
                        <p style={valueStyle}>{profile.startup_state || '—'}</p>
                      </div>
                      <div style={infoBoxStyle}>
                        <label style={labelStyle}>Revenue</label>
                        <p style={valueStyle}>{profile.revenue_status || '—'}</p>
                      </div>
                    </div>
                  </>
                )}

                {profile.startup_description && (
                  <div style={infoBoxStyle}>
                    <label style={labelStyle}>Description</label>
                    <p style={{ ...valueStyle, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{profile.startup_description}</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </section>

      </div>

      <style jsx>{`
        .history-row:hover {
          background: var(--cream-hover) !important;
        }
      `}</style>
    </div>
  )
}

// ── Styles ──────────────────────────────────────────────────────────────────

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: '8px',
  border: '1px solid var(--cream-border)',
  background: 'var(--cream)',
  fontFamily: 'var(--font-sans)',
  fontSize: '14px',
  outline: 'none',
}

const infoBoxStyle = {
  padding: '16px',
  background: 'var(--cream)',
  borderRadius: '12px',
  border: '1px solid var(--cream-border)',
}

const labelStyle = {
  fontSize: '10px',
  color: 'var(--ink-4)',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
  display: 'block',
  marginBottom: '4px'
}

const valueStyle = {
  fontSize: '15px',
  margin: 0,
  fontWeight: 400,
  color: 'var(--ink)'
}
