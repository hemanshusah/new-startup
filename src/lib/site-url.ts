/**
 * Dynamically determines the base URL of the application.
 * Priority: Manual env var > Vercel URL > Browser origin > Localhost fallback.
 */
export function getSiteUrl(): string {
  let url =
    process.env.NEXT_PUBLIC_SITE_URL ?? // Production domain
    process.env.NEXT_PUBLIC_VERCEL_URL ?? // Automatically set by Vercel for previews
    (typeof window !== 'undefined' ? window.location.origin : '') ?? // Browser-side detection
    'http://localhost:3000'

  // Ensure 'https://' prefix for non-localhost Vercel URLs
  if (url.includes('vercel.app') && !url.startsWith('http')) {
    url = `https://${url}`
  }

  // Remove trailing slashes
  return url.replace(/\/$/, '')
}

export function absoluteUrl(path: string): string {
  const base = getSiteUrl()
  const p = path.startsWith('/') ? path : `/${path}`
  return `${base}${p}`
}
