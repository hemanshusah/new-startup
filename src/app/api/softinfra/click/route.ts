import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const siId = searchParams.get('id')
  const redirectUrl = searchParams.get('url')

  if (!siId || !redirectUrl) {
    return NextResponse.json({ error: 'Missing id or url' }, { status: 400 })
  }

  return handleTracking(siId, redirectUrl, request)
}

export async function POST(request: Request) {
  const { siId, url } = await request.json()
  if (!siId || !url) {
    return NextResponse.json({ error: 'Missing id or url' }, { status: 400 })
  }
  return handleTracking(siId, url, request)
}

async function handleTracking(siId: string, redirectUrl: string, request: Request) {
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

    // 1. Increment generic click counter
    await supabase.rpc('increment_softinfra_click', { p_si_id: siId })

    // 2. Log the detailed click
    const { error } = await supabase
      .from('softinfra_click_log')
      .insert({
        softinfra_id: siId,
        user_id: profileId,
        page: request.headers.get('referer') || 'unknown'
      })

    if (error) {
      console.error('Failed to insert into click_log', error)
    }

    // 3. Redirect to the actual CTA URL
    return NextResponse.redirect(redirectUrl)
    
  } catch (error) {
    console.error('Error in click tracking route:', error)
    return NextResponse.redirect(redirectUrl)
  }
}
