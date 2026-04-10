/**
 * Dynamically determines the base URL of the application.
 * Priority: Manual env var > Vercel URL > Browser origin > Localhost fallback.
 */
import { headers } from 'next/headers'

export function getSiteUrl(): string {
  // 1. Production Shield: If we are on Vercel, always use the Vercel URL
  // This overrides any accidental 'localhost' settings in .env
  const vercelUrl = process.env.NEXT_PUBLIC_VERCEL_URL
  if (vercelUrl && !vercelUrl.includes('localhost')) {
    return `https://${vercelUrl.replace(/\/$/, '')}`
  }

  // 2. Browser Detection: If we are in the browser, ground truth is the origin
  if (typeof window !== 'undefined' && window.location.origin) {
    const origin = window.location.origin
    // Only use manual env if it's explicitly NOT localhost (v18 Poison-Proof)
    const envUrl = process.env.NEXT_PUBLIC_SITE_URL
    if (envUrl && !envUrl.includes('localhost')) return envUrl.replace(/\/$/, '')
    return origin.replace(/\/$/, '')
  }

  // 3. Request Detection: If we are on the server (Server Actions), check headers
  try {
    const headerList = headers()
    const host = headerList.get('host')
    if (host && !host.includes('localhost')) {
      const protocol = host.includes('vercel.app') || !host.includes(':') ? 'https' : 'http'
      return `${protocol}://${host}`.replace(/\/$/, '')
    }
  } catch (e) {
    // headers() might not be available during static builds
  }

  // 4. Final Fallback: Manual Env (if not localhost) or Localhost
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL
  if (envUrl && !envUrl.includes('localhost')) return envUrl.replace(/\/$/, '')
  
  return 'http://localhost:3000'
}

export function absoluteUrl(path: string): string {
  const base = getSiteUrl()
  const p = path.startsWith('/') ? path : `/${path}`
  return `${base}${p}`
}
