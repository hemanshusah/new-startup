'use client'

import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { uploadAvatar } from '@/lib/supabase/storage'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

interface Profile {
  id: string
  email: string
  full_name: string
  avatar_url: string
  phone: string
  startup_name: string
  startup_website: string
  startup_email: string
  role: string
  created_at: string
}

interface HistoryItem {
  viewed_at: string
  program: {
    id: string
    slug: string
    title: string
    type: string
    organisation: string
    amount_display: string
    deadline: string
  }
}

export function ProfileView({ profile: initialProfile, history }: { profile: Profile; history: HistoryItem[] }) {
  const supabase = createClient()
  const [profile, setProfile] = useState<Profile>(initialProfile)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

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
          full_name: profile.full_name,
          phone: profile.phone,
          startup_name: profile.startup_name,
          startup_website: profile.startup_website,
          startup_email: profile.startup_email,
        })
        .eq('id', profile.id)

      if (error) throw error

      if (!emailChanged) {
        setMessage({ type: 'success', text: 'Profile updated successfully.' })
        setIsEditing(false)
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to update profile.' })
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
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Failed to upload avatar.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '40px', alignItems: 'start' }}>

      {/* ── Left Column: Avatar & Overview ── */}
      <aside style={{
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
              {profile.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.avatar_url} alt={profile.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: '36px', fontFamily: 'DM Serif Display', color: 'var(--ink-3)' }}>
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

          <h1 style={{ fontFamily: 'DM Serif Display', fontSize: '24px', margin: '0 0 4px' }}>
            {profile.full_name || 'Anonymous User'}
          </h1>
          <p style={{ fontFamily: 'DM Sans', fontSize: '13px', color: 'var(--ink-3)', margin: '0 0 20px' }}>
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
            <h2 style={{ fontFamily: 'DM Serif Display', fontSize: '22px', margin: 0 }}>Account Information</h2>
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
                </div>

                <div style={{ height: '1px', background: 'var(--cream-border)', margin: '10px 0' }} />

                <h3 style={{ fontFamily: 'DM Serif Display', fontSize: '18px', margin: '0 0 4px' }}>Startup Details</h3>
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

                <div className="form-group">
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 500, marginBottom: '6px' }}>Startup Contact Email</label>
                  <input
                    type="email"
                    className="profile-input"
                    value={profile.startup_email || ''}
                    onChange={e => setProfile(p => ({ ...p, startup_email: e.target.value }))}
                    style={inputStyle}
                  />
                </div>

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
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
                  <div style={infoBoxStyle}>
                    <label style={labelStyle}>Startup Name</label>
                    <p style={valueStyle}>{profile.startup_name || '—'}</p>
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
                    <label style={labelStyle}>Startup Email</label>
                    <p style={valueStyle}>{profile.startup_email || '—'}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Recently Viewed History */}
        <section style={{
          background: 'var(--white)',
          padding: '40px',
          borderRadius: '16px',
          border: '1px solid var(--cream-border)'
        }}>
          <h2 style={{ fontFamily: 'DM Serif Display', fontSize: '22px', marginBottom: '24px' }}>Recently Viewed Programs</h2>

          {history.length === 0 ? (
            <p style={{ color: 'var(--ink-4)', textAlign: 'center', padding: '40px 0' }}>No programs viewed yet. Start exploring our listings!</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--cream-border)', borderRadius: '10px', overflow: 'hidden' }}>
              {history.map((item, idx) => {
                const p = item.program
                return (
                  <Link
                    key={`${p.id}-${idx}`}
                    href={`/programs/${p.slug}`}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr auto',
                      alignItems: 'center',
                      padding: '16px 20px',
                      background: 'var(--white)',
                      textDecoration: 'none',
                      transition: 'background 0.1s ease'
                    }}
                    className="history-row"
                  >
                    <div>
                      <p style={{ fontSize: '10px', color: 'var(--ink-4)', textTransform: 'uppercase', marginBottom: '4px' }}>{p.organisation}</p>
                      <h4 style={{ fontFamily: 'DM Serif Display', fontSize: '16px', color: 'var(--ink)', margin: 0 }}>{p.title}</h4>
                      <p style={{ fontSize: '12px', color: 'var(--ink-3)', marginTop: '2px' }}>
                        {p.type.charAt(0).toUpperCase() + p.type.slice(1)} • {p.amount_display || 'TBA'}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '11px', color: 'var(--ink-4)', margin: 0 }}>
                        Viewed {formatDistanceToNow(new Date(item.viewed_at), { addSuffix: true })}
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
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
  fontFamily: 'DM Sans',
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
