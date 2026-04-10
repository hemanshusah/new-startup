/**
 * Public site origin for metadata, auth redirects, and absolute URLs.
 *
 * Set `NEXT_PUBLIC_SITE_URL` to your production origin (e.g. https://example.com) on Vercel
 * so server-side auth emails never fall back to localhost. Also configure Supabase:
 * Authentication → URL Configuration → Site URL = same origin, and add that origin under
 * Redirect URLs (e.g. https://example.com/**).
 */
export function getSiteUrl(): string {
  // Client: prefer non-localhost env (canonical prod) when set; else current origin
  if (typeof window !== 'undefined' && window.location.origin) {
    const origin = window.location.origin
    const envUrl = process.env.NEXT_PUBLIC_SITE_URL
    if (envUrl && !envUrl.includes('localhost')) return envUrl.replace(/\/$/, '')
    return origin.replace(/\/$/, '')
  }

  // Server / SSR: canonical URL from env first (custom domain), then Vercel deployment host
  const siteFromEnv = process.env.NEXT_PUBLIC_SITE_URL
  if (siteFromEnv && !siteFromEnv.includes('localhost')) {
    return siteFromEnv.replace(/\/$/, '')
  }

  const vercelHost = process.env.VERCEL_URL || process.env.NEXT_PUBLIC_VERCEL_URL
  if (vercelHost && !vercelHost.includes('localhost')) {
    return `https://${vercelHost.replace(/\/$/, '')}`
  }

  return 'http://localhost:3000'
}

export function absoluteUrl(path: string): string {
  const base = getSiteUrl()
  const p = path.startsWith('/') ? path : `/${path}`
  return `${base}${p}`
}
