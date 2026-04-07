import { NextRequest, NextResponse } from 'next/server'
import { revalidateCachePath } from '@/lib/revalidate-paths'

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret')
  const path = request.nextUrl.searchParams.get('path')

  if (!path || secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    revalidateCachePath(path)
    return NextResponse.json({ revalidated: true })
  } catch (e) {
    console.error('[revalidate]', e)
    return NextResponse.json({ error: 'Revalidation failed' }, { status: 500 })
  }
}
