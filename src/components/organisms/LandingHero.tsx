'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Search, Sparkles } from 'lucide-react'
import { Button } from '@/components/atoms/Button'
import { Avatar } from '@/components/atoms/Avatar'

const LEFT_AVATARS = [
  {
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80',
    size: '84px',
    top: '10%',
    left: '20px',
    delay: '0s',
    name: 'Sarah'
  },
  {
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&h=256&q=80',
    size: '96px',
    top: '42%',
    left: '50px',
    delay: '1.5s',
    name: 'David'
  },
  {
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&h=256&q=80',
    size: '76px',
    top: '74%',
    left: '15px',
    delay: '0.8s',
    name: 'Amara'
  }
]

const RIGHT_AVATARS = [
  {
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&h=256&q=80',
    size: '88px',
    top: '8%',
    right: '25px',
    delay: '0.4s',
    name: 'Elena'
  },
  {
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&h=256&q=80',
    size: '92px',
    top: '40%',
    right: '55px',
    delay: '2s',
    name: 'Marcus'
  },
  {
    url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=256&h=256&q=80',
    size: '78px',
    top: '72%',
    right: '20px',
    delay: '1.2s',
    name: 'Vikram'
  }
]

export default function LandingHero() {
  const [view, setView] = useState<'mentee' | 'mentor'>('mentee')
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/mentor-connect/mentors?q=${encodeURIComponent(searchQuery.trim())}`
    } else {
      window.location.href = `/mentor-connect/mentors`
    }
  }

  return (
    <section style={{
      position: 'relative',
      padding: '120px 24px 100px',
      textAlign: 'center',
      background: 'linear-gradient(180deg, var(--white) 0%, var(--bg) 100%)',
      borderBottom: '1px solid var(--cream-border)',
      overflow: 'hidden',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      {/* Subtle Decorative Ambient Lights */}
      <div style={{
        position: 'absolute',
        top: '-20%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '600px',
        height: '400px',
        background: 'radial-gradient(circle, var(--accent-light) 0%, transparent 70%)',
        opacity: 0.6,
        zIndex: 0,
        pointerEvents: 'none'
      }} />

      {/* Flanking Left Column (Floating Avatars) */}
      <div className="hero-headshots hero-headshots-left" style={{
        position: 'absolute',
        left: '40px',
        top: '50%',
        transform: 'translateY(-50%)',
        width: '180px',
        height: '450px',
        pointerEvents: 'none',
        zIndex: 1,
        maskImage: 'radial-gradient(circle at center, black 40%, transparent 95%)',
        WebkitMaskImage: 'radial-gradient(circle at center, black 40%, transparent 95%)',
      }}>
        {LEFT_AVATARS.map((avatar, index) => (
          <div 
            key={index} 
            style={{
              position: 'absolute',
              top: avatar.top,
              left: avatar.left,
              width: avatar.size,
              height: avatar.size,
              animation: `float-${(index % 3) + 1} 6s ease-in-out infinite alternate`,
              animationDelay: avatar.delay,
            }}
          >
            <Avatar 
              src={avatar.url} 
              alt={avatar.name} 
              size="100%" 
              style={{
                borderRadius: '50%',
                border: '3px solid var(--white)',
                boxShadow: '0 12px 30px rgba(28, 26, 22, 0.12)',
              }}
            />
          </div>
        ))}
      </div>

      {/* Centered Main Panel */}
      <div style={{ maxWidth: '680px', width: '100%', margin: '0 auto', position: 'relative', zIndex: 10 }}>
        
        {/* Toggle Switcher */}
        <div style={{
          display: 'inline-flex',
          background: 'var(--cream-dark)',
          borderRadius: '100px',
          padding: '4px',
          border: '1px solid var(--cream-border)',
          position: 'relative',
          marginBottom: '36px',
          gap: '4px',
          boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <Button 
            onClick={() => setView('mentee')}
            variant={view === 'mentee' ? 'primary' : 'ghost'}
            style={{
              padding: '8px 24px',
              borderRadius: '100px',
              fontSize: '13.5px',
              color: view === 'mentee' ? 'var(--white)' : 'var(--ink-2)',
              background: view === 'mentee' ? 'var(--ink)' : 'transparent',
            }}
          >
            Find a Mentor
          </Button>
          <Button 
            onClick={() => setView('mentor')}
            variant={view === 'mentor' ? 'primary' : 'ghost'}
            style={{
              padding: '8px 24px',
              borderRadius: '100px',
              fontSize: '13.5px',
              color: view === 'mentor' ? 'var(--white)' : 'var(--ink-2)',
              background: view === 'mentor' ? 'var(--ink)' : 'transparent',
            }}
          >
            Become a Mentor
          </Button>
        </div>

        {/* View Contents */}
        {view === 'mentee' ? (
          <div>
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
              boxShadow: '0 2px 8px rgba(184, 70, 10, 0.05)'
            }}>
              <Sparkles size={12} />
              EXPERT NETWORK
            </div>

            <h1 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(2.25rem, 5.5vw, 3.85rem)',
              fontWeight: 400,
              color: 'var(--ink)',
              margin: '0 0 20px',
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
            }}>
              Reach your goals faster with{' '}
              <span style={{ color: 'var(--accent)', position: 'relative', display: 'inline-block' }}>
                expert mentors.
              </span>
            </h1>

            <p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 'clamp(15px, 3.2vw, 17px)',
              color: 'var(--ink-3)',
              lineHeight: 1.6,
              maxWidth: '580px',
              margin: '0 auto 40px',
            }}>
              Skip the generic advice. Connect 1:1 with vetted operators and ecosystem leaders who have built real companies, secured massive grants, and executed global operations.
            </p>

            <form onSubmit={handleSearchSubmit} style={{
              display: 'flex',
              alignItems: 'center',
              background: 'var(--white)',
              borderRadius: '9999px',
              padding: '6px 6px 6px 20px',
              border: '1px solid var(--cream-border)',
              boxShadow: '0 10px 30px rgba(28, 26, 22, 0.06)',
              maxWidth: '520px',
              width: '100%',
              margin: '0 auto',
              position: 'relative'
            }}>
              <Search size={18} color="var(--ink-3)" style={{ marginRight: '10px', flexShrink: 0 }} />
              <input 
                type="text" 
                placeholder="What do you want to get better at?" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  flex: 1,
                  fontSize: '15px',
                  color: 'var(--ink)',
                  fontFamily: 'var(--font-sans)',
                  paddingRight: '12px'
                }}
              />
              <Button 
                type="submit"
                variant="primary"
                size="md"
                style={{
                  background: 'var(--ink)',
                  borderColor: 'var(--ink)',
                  borderRadius: '9999px',
                  padding: '12px 28px',
                }}
                className="hero-search-btn"
              >
                Search
              </Button>
            </form>
          </div>
        ) : (
          <div>
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
              boxShadow: '0 2px 8px rgba(184, 70, 10, 0.05)'
            }}>
              <Sparkles size={12} />
              SHARE YOUR WISDOM
            </div>

            <h1 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(2.25rem, 5.5vw, 3.85rem)',
              fontWeight: 400,
              color: 'var(--ink)',
              margin: '0 0 20px',
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
            }}>
              Your next chapter,{' '}
              <span style={{ color: 'var(--accent)', position: 'relative', display: 'inline-block' }}>
                made possible
              </span>{' '}
              by mentoring.
            </h1>

            <p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 'clamp(15px, 3.2vw, 17px)',
              color: 'var(--ink-3)',
              lineHeight: 1.6,
              maxWidth: '580px',
              margin: '0 auto 40px',
            }}>
              Join our invite-only community of ecosystem operators. Help India's most promising founders scale while building your personal operator brand.
            </p>

            <Link
              href="/mentor-connect/apply"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '16px 36px',
                background: 'linear-gradient(135deg, #EC4899 0%, #FB923C 100%)',
                color: 'var(--white)',
                borderRadius: 'var(--radius-lg, 12px)',
                fontFamily: 'var(--font-sans)',
                fontSize: '14.5px',
                fontWeight: 600,
                textDecoration: 'none',
                boxShadow: '0 8px 24px rgba(236, 72, 153, 0.22)',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
              className="mentor-gradient-btn"
            >
              Become a Mentor
              <ArrowRight size={16} />
            </Link>
          </div>
        )}

      </div>

      {/* Flanking Right Column (Floating Avatars) */}
      <div className="hero-headshots hero-headshots-right" style={{
        position: 'absolute',
        right: '40px',
        top: '50%',
        transform: 'translateY(-50%)',
        width: '180px',
        height: '450px',
        pointerEvents: 'none',
        zIndex: 1,
        maskImage: 'radial-gradient(circle at center, black 40%, transparent 95%)',
        WebkitMaskImage: 'radial-gradient(circle at center, black 40%, transparent 95%)',
      }}>
        {RIGHT_AVATARS.map((avatar, index) => (
          <div 
            key={index} 
            style={{
              position: 'absolute',
              top: avatar.top,
              right: avatar.right,
              width: avatar.size,
              height: avatar.size,
              animation: `float-${(index % 3) + 1} 6s ease-in-out infinite alternate`,
              animationDelay: avatar.delay,
            }}
          >
            <Avatar 
              src={avatar.url} 
              alt={avatar.name} 
              size="100%" 
              style={{
                borderRadius: '50%',
                border: '3px solid var(--white)',
                boxShadow: '0 12px 30px rgba(28, 26, 22, 0.12)',
              }}
            />
          </div>
        ))}
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes float-1 {
            0%, 100% { transform: translateY(0px) scale(1); }
            50% { transform: translateY(-12px) scale(1.01); }
          }
          @keyframes float-2 {
            0%, 100% { transform: translateY(0px) scale(1); }
            50% { transform: translateY(-18px) scale(0.99); }
          }
          @keyframes float-3 {
            0%, 100% { transform: translateY(0px) scale(1); }
            50% { transform: translateY(-8px) scale(1.02); }
          }
          .hero-search-btn:hover {
            background: var(--accent) !important;
            transform: translateY(-1px);
          }
          .mentor-gradient-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 28px rgba(236, 72, 153, 0.35) !important;
            opacity: 0.95;
          }
          @media (max-width: 1100px) {
            .hero-headshots-left {
              left: 10px !important;
              transform: translateY(-50%) scale(0.85) !important;
            }
            .hero-headshots-right {
              right: 10px !important;
              transform: translateY(-50%) scale(0.85) !important;
            }
          }
          @media (max-width: 960px) {
            .hero-headshots {
              display: none !important;
            }
          }
        `
      }} />
    </section>
  )
}
