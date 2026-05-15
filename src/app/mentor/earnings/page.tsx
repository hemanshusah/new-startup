'use client'

import { useState, useEffect, useMemo } from 'react'
import { createBrowserClient } from '@supabase/ssr'

export default function MentorEarningsPage() {
  const [loading, setLoading] = useState(true)
  const [earnings, setEarnings] = useState<any[]>([])

  const supabase = useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ), [])

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: mentor } = await supabase
        .from('mentor_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (mentor) {
        const { data: payments } = await supabase
          .from('sessions')
          .select(`
            id,
            price_at_booking,
            commission_amount,
            payout_amount,
            status,
            scheduled_start,
            founder:profiles(full_name)
          `)
          .eq('mentor_id', mentor.id)
          .eq('status', 'completed')
          .order('scheduled_start', { ascending: false })
        
        if (payments) setEarnings(payments)
      }
      setLoading(false)
    }
    loadData()
  }, [supabase])

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'var(--font-sans)', color: 'var(--ink-3)' }}>Loading earnings...</div>

  const totalPayout = earnings.reduce((acc, p) => acc + (p.payout_amount || 0), 0)

  return (
    <div>
      <div style={{ background: 'var(--white)', padding: '32px', borderRadius: '16px', border: '1px solid var(--cream-border)', marginBottom: '32px' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', margin: '0 0 8px' }}>Revenue Overview</h2>
        <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--ink-3)', fontSize: '15px', margin: '0 0 32px' }}>Track your session payouts and pending balances.</p>
        
        <div style={{ display: 'flex', gap: '40px' }}>
          <div>
            <p style={{ margin: '0 0 4px', fontSize: '12px', fontWeight: 600, color: 'var(--ink-4)', textTransform: 'uppercase' }}>Total Payouts</p>
            <p style={{ margin: 0, fontSize: '36px', fontWeight: 700, color: '#166534' }}>₹{totalPayout.toLocaleString()}</p>
          </div>
          <div style={{ borderLeft: '1px solid var(--cream-border)', paddingLeft: '40px' }}>
            <p style={{ margin: '0 0 4px', fontSize: '12px', fontWeight: 600, color: 'var(--ink-4)', textTransform: 'uppercase' }}>Pending Balance</p>
            <p style={{ margin: 0, fontSize: '36px', fontWeight: 700, color: 'var(--ink)' }}>₹0</p>
          </div>
        </div>
      </div>

      <div style={{ background: 'var(--white)', borderRadius: '16px', border: '1px solid var(--cream-border)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontFamily: 'var(--font-sans)', fontSize: '14px' }}>
          <thead>
            <tr style={{ background: 'var(--cream)', borderBottom: '1px solid var(--cream-border)' }}>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--ink-3)' }}>Date</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--ink-3)' }}>Session / Founder</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--ink-3)' }}>Gross</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--ink-3)' }}>Fee</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--ink-3)' }}>Net Payout</th>
            </tr>
          </thead>
          <tbody>
            {earnings.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: 'var(--ink-4)' }}>No completed sessions with payments found.</td>
              </tr>
            ) : (
              earnings.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid var(--cream-border)' }}>
                  <td style={{ padding: '16px 24px' }}>{new Date(p.scheduled_start).toLocaleDateString()}</td>
                  <td style={{ padding: '16px 24px' }}>{p.founder?.full_name}</td>
                  <td style={{ padding: '16px 24px' }}>₹{p.price_at_booking}</td>
                  <td style={{ padding: '16px 24px', color: '#B91C1C' }}>-₹{p.commission_amount}</td>
                  <td style={{ padding: '16px 24px', fontWeight: 600, color: '#166534' }}>₹{p.payout_amount}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
