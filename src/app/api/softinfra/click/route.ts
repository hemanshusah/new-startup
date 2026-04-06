import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const siId = searchParams.get('id')
  const redirectUrl = searchParams.get('url')

  if (!siId || !redirectUrl) {
    return NextResponse.json({ error: 'Missing id or url' }, { status: 400 })
  }

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // 1. Increment generic click counter
    await supabase.rpc('increment_softinfra_click', { p_si_id: siId })

    // 2. Log the detailed click
    const { error } = await supabase
      .from('softinfra_click_log')
      .insert({
        softinfra_id: siId,
        user_id: user?.id || null,
        page: request.headers.get('referer') || 'unknown'
      })

    if (error) {
      console.error('Failed to insert into click_log', error)
    }

    // 3. Redirect to the actual CTA URL
    return NextResponse.redirect(redirectUrl)
    
  } catch (error) {
    console.error('Error in click tracking route:', error)
    // Fallback to redirecting even if tracking fails, so the user experience isn't broken
    return NextResponse.redirect(redirectUrl)
  }
}
