import { getFirestoreDb } from '@/lib/firebase-admin'
import { AdminEmailsList } from '@/components/organisms/admin/mentor-connect/AdminEmailsList'

export const dynamic = 'force-dynamic'

export default async function AdminMentorConnectEmailsPage() {
  const db = getFirestoreDb()
  let emailLogs: any[] = []
  let debugInfo = ''

  if (!db) {
    debugInfo = 'Firebase Admin was not initialized. Please verify that your environment variables (FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY) are configured correctly on your server.'
  } else {
    try {
      // Fetch the last 100 emails triggered via Firestore mail collection
      const snapshot = await db.collection('mail').limit(100).get()

      emailLogs = snapshot.docs.map(doc => {
        const data = doc.data()
        const delivery = data.delivery || {}
        
        let state: 'SUCCESS' | 'PENDING' | 'ERROR' | 'UNKNOWN' = 'PENDING'
        if (delivery.state === 'SUCCESS') state = 'SUCCESS'
        else if (delivery.state === 'ERROR') state = 'ERROR'
        else if (delivery.state === 'PENDING') state = 'PENDING'

        // Parse Firestore timestamps safely
        const endTimeStr = delivery.endTime ? new Date(delivery.endTime.toDate()).toISOString() : undefined
        const createdAtStr = delivery.startTime ? new Date(delivery.startTime.toDate()).toISOString() : doc.createTime ? doc.createTime.toDate().toISOString() : new Date().toISOString()

        return {
          id: doc.id,
          to: typeof data.to === 'string' ? data.to : Array.isArray(data.to) ? data.to.join(', ') : '—',
          subject: data.message?.subject || '—',
          text: data.message?.text || '',
          html: data.message?.html || '',
          state,
          error: delivery.error || undefined,
          attempts: delivery.attempts || 0,
          endTime: endTimeStr,
          createdAt: createdAtStr
        }
      })

      // Sort by creation time desc in memory safely
      emailLogs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    } catch (e: any) {
      console.error('Failed to read Firestore mail triggers:', e)
      debugInfo = `Failed to query Firebase mail logs: ${e.message}. Make sure your Firestore collection 'mail' exists or trigger your first booking payment to automatically initialize it.`
    }
  }

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '26px', fontWeight: 400, color: 'var(--ink)', marginBottom: '4px' }}>
          Firebase SMTP Email Delivery Monitor
        </h1>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--ink-3)' }}>
          Monitor the real-time status of transactional emails sent to Founders and Mentors via Firebase Firestore SMTP Relay.
        </p>
      </div>

      {debugInfo && (
        <div style={{ padding: '16px', background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '12px', color: '#991B1B', marginBottom: '24px', fontSize: '13px', fontFamily: 'var(--font-sans)' }}>
          💡 <strong>Staging Status Warning:</strong> {debugInfo}
        </div>
      )}

      <AdminEmailsList initialEmails={emailLogs} />
    </div>
  )
}
