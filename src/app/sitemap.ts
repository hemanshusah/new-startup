import type { MetadataRoute } from 'next'
import { createServiceClient } from '@/lib/supabase/server'
import { absoluteUrl } from '@/lib/site-url'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createServiceClient()
  const { data: programs } = await supabase
    .from('programs')
    .select('slug, updated_at')
    .eq('published', true)
    .eq('status', 'active')

  const staticUrls: MetadataRoute.Sitemap = [
    '/',
    '/events',
    '/newsletter',
    '/deals',
  ].map((path) => ({
    url: absoluteUrl(path),
    changeFrequency: path === '/' ? 'daily' : 'weekly',
    priority: path === '/' ? 1 : 0.7,
  }))

  const programUrls: MetadataRoute.Sitemap =
    programs?.map((p) => ({
      url: absoluteUrl(`/programs/${p.slug}`),
      lastModified: p.updated_at ? new Date(p.updated_at) : undefined,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })) ?? []

  return [...staticUrls, ...programUrls]
}
