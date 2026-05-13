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
  const body = await request.json()
  const siId = body.siId || body.si_id
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

    // 1. Increment generic impression counter (Split by guest/user)
    await supabase.rpc('increment_softinfra_impression', { 
      p_si_id: siId, 
      p_is_guest: !profileId 
    })
    
    // 2. Log detailed impression ONLY for users (since user_id is NOT NULL)
    if (profileId) {
      const { error } = await supabase
        .from('softinfra_impressions')
        .insert({
          softinfra_id: siId,
          user_id: profileId,
          page: request.headers.get('referer') || 'unknown'
        })
      
      if (error) {
        console.error('Failed to insert into softinfra_impressions', error)
      }
    }

    return NextResponse.json({ ok: true })
    
  } catch (error) {
    console.error('Error in impression tracking route:', error)
    return NextResponse.json({ error: 'Tracking failed' }, { status: 500 })
  }
}
