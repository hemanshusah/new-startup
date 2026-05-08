import { NextResponse } from 'next/server'
import { getAllPublishedLessons } from '@/lib/school/content'

/**
 * GET /api/school/search-index
 * Returns all published lessons as a JSON array for Fuse.js client-side search.
 */
export async function GET() {
  try {
    const lessons = await getAllPublishedLessons()
    return NextResponse.json(lessons, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    })
  } catch (error) {
    console.error('[search-index]', error)
    return NextResponse.json([], { status: 500 })
  }
}
