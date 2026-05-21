'use client'

import React, { useEffect, useState } from 'react'

interface PaymentLoadingOverlayProps {
  isOpen: boolean
  message?: string
}

export function PaymentLoadingOverlay({ isOpen, message = 'Securing your checkout...' }: PaymentLoadingOverlayProps) {
  const [dots, setDots] = useState('')

  // Animated loading dots
  useEffect(() => {
    if (!isOpen) return
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'))
    }, 450)
    return () => clearInterval(interval)
  }, [isOpen])

  // Lock body scroll when overlay is active
  useEffect(() => {
    if (isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = originalStyle
      }
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(26, 24, 20, 0.85)', // Premium dark warm backdrop
      backdropFilter: 'blur(8px)', // Glassmorphism
      WebkitBackdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 99999, // Render on top of everything including Razorpay/modals
      animation: 'fadeIn 0.3s ease-out',
    }}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.9; }
          50% { transform: scale(1.05); opacity: 1; }
        }
      `}</style>

      <div style={{
        background: 'var(--white)',
        border: '1px solid var(--cream-border)',
        borderRadius: '24px',
        padding: '40px 32px',
        maxWidth: '420px',
        width: '90%',
        textAlign: 'center',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
        animation: 'pulse 2s infinite ease-in-out',
      }}>
        {/* Animated Secure Loading Ring */}
        <div style={{ position: 'relative', width: '80px', height: '80px', margin: '0 auto 24px' }}>
          {/* Inner Lock Icon */}
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '32px',
            color: 'var(--accent)',
            zIndex: 2,
          }}>
            🔒
          </div>
          {/* Rotating Outer Ring */}
          <div style={{
            position: 'absolute',
            inset: 0,
            border: '3px solid var(--cream)',
            borderTop: '3px solid var(--accent)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            zIndex: 1,
          }} />
        </div>

        {/* Dynamic Premium Header */}
        <h3 style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '20px',
          color: 'var(--ink)',
          margin: '0 0 12px',
          fontWeight: 400,
        }}>
          Payment Processing
        </h3>

        {/* Animated Loading Message */}
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '14px',
          color: 'var(--ink-3)',
          lineHeight: 1.6,
          margin: '0 0 24px',
          minHeight: '44px',
        }}>
          {message}{dots}
          <span style={{ display: 'block', fontSize: '12px', color: 'var(--ink-4)', marginTop: '8px' }}>
            Please do not refresh, close this window, or click back.
          </span>
        </p>

        {/* Secure Transaction Badges */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          paddingTop: '20px',
          borderTop: '1px solid var(--cream-border)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--ink-4)', fontWeight: 500 }}>
            <span style={{ fontSize: '12px' }}>🛡️</span> SSL Secured
          </div>
          <div style={{ width: '1px', height: '12px', background: 'var(--cream-border)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--ink-4)', fontWeight: 500 }}>
            <span style={{ fontSize: '12px' }}>⚡</span> Razorpay Verified
          </div>
        </div>
      </div>
    </div>
  )
}
