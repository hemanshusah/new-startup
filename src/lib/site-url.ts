/**
 * Dynamically determines the base URL of the application.
 * Priority: Manual env var > Vercel URL > Browser origin > Localhost fallback.
 */
export function getSiteUrl(): string {
  // If we are in the browser, window.location.origin is the most reliable
  if (typeof window !== 'undefined' && window.location.origin) {
    const origin = window.location.origin
    // Only use hardcoded env var if it's NOT localhost OR if the current origin IS localhost
    const envUrl = process.env.NEXT_PUBLIC_SITE_URL
    if (envUrl && !envUrl.includes('localhost')) return envUrl.replace(/\/$/, '')
    return origin.replace(/\/$/, '')
  }

  // Server-side logic (e.g. for Metadata or server-side redirects)
  let url =
    process.env.NEXT_PUBLIC_SITE_URL ?? 
    process.env.NEXT_PUBLIC_VERCEL_URL ?? 
    'http://localhost:3000'

  // If we're on Vercel, ensuring https
  if (url.includes('vercel.app') && !url.startsWith('http')) {
    url = `https://${url}`
  }

  return url.replace(/\/$/, '')
}

export function absoluteUrl(path: string): string {
  const base = getSiteUrl()
  const p = path.startsWith('/') ? path : `/${path}`
  return `${base}${p}`
}
