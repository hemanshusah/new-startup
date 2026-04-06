import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { recordSIImpression } from '@/lib/softinfra'

export async function POST(request: Request) {
  try {
    const { si_id } = await request.json()
    if (!si_id) {
      return NextResponse.json({ error: 'Missing si_id' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    await recordSIImpression(si_id, user?.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in impression route:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
