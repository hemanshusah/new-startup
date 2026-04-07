/**
 * Canonical site origin for metadata, sitemap, robots, JSON-LD.
 * Set NEXT_PUBLIC_SITE_URL in env (no trailing slash). Defaults to local dev.
 */
export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim() || 'http://localhost:3000'
  return raw.replace(/\/$/, '')
}

export function absoluteUrl(path: string): string {
  const base = getSiteUrl()
  const p = path.startsWith('/') ? path : `/${path}`
  return `${base}${p}`
}
