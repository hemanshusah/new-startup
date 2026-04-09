import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const siId = searchParams.get('id')
  if (!siId) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  return handleTracking(siId, request)
}

export async function POST(request: Request) {
  const { siId } = await request.json()
  if (!siId) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  return handleTracking(siId, request)
}

async function handleTracking(siId: string, request: Request) {
  try {
    const supabase = createServiceClient()
    const session = await auth()
    const user = session?.user

    let profileId = null
    if (user?.email) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', user.email)
        .single()
      profileId = profile?.id
    }

    // 1. Increment generic impression counter
    await supabase.rpc('increment_softinfra_impression', { p_si_id: siId })

    // 2. Log the detailed impression
    const { error } = await supabase
      .from('softinfra_impression_log')
      .insert({
        softinfra_id: siId,
        user_id: profileId,
        page: request.headers.get('referer') || 'unknown'
      })

    if (error) {
      console.error('Failed to insert into impression_log', error)
    }

    return NextResponse.json({ ok: true })
    
  } catch (error) {
    console.error('Error in impression tracking route:', error)
    return NextResponse.json({ error: 'Tracking failed' }, { status: 500 })
  }
}
