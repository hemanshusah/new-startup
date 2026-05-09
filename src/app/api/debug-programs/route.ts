import { createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = createServiceClient()
  
  // Fetch all programs with key fields
  const { data: allPrograms } = await supabase
    .from('programs')
    .select('id, title, published, status, product_slug, deadline')

  if (!allPrograms) return NextResponse.json({ error: 'No data' })

  const stats = {
    total: allPrograms.length,
    published_true: allPrograms.filter(p => p.published).length,
    published_and_active: allPrograms.filter(p => p.published && p.status === 'active').length,
    published_active_grants: allPrograms.filter(p => p.published && p.status === 'active' && p.product_slug === 'grants').length,
    published_active_grants_future: allPrograms.filter(p => {
      const today = new Date().toISOString().split('T')[0]
      return p.published && p.status === 'active' && p.product_slug === 'grants' && (!p.deadline || p.deadline >= today)
    }).length,
    by_product: allPrograms.reduce((acc: any, p) => {
      acc[p.product_slug || 'null'] = (acc[p.product_slug || 'null'] || 0) + 1
      return acc
    }, {}),
    sample_published_but_not_grants: allPrograms
      .filter(p => p.published && p.product_slug !== 'grants')
      .map(p => ({ title: p.title, product_slug: p.product_slug })),
    sample_published_grants_but_past_deadline: allPrograms
      .filter(p => p.published && p.product_slug === 'grants' && p.deadline && p.deadline < new Date().toISOString().split('T')[0])
      .map(p => ({ title: p.title, deadline: p.deadline }))
  }

  return NextResponse.json(stats)
}
