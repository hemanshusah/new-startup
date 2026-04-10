export function getSiteUrl(): string {
  // 1. Production Shield: If we are on Vercel, always use the Vercel URL
  // This is a system-level fact that is safe on both client and server.
  const vercelUrl = process.env.NEXT_PUBLIC_VERCEL_URL
  if (vercelUrl && !vercelUrl.includes('localhost')) {
    return `https://${vercelUrl.replace(/\/$/, '')}`
  }

  // 2. Browser Detection: If we are in the browser, ground truth is the origin
  if (typeof window !== 'undefined' && window.location.origin) {
    const origin = window.location.origin
    // Poison-Proof: Ignore any explicit 'localhost' settings in production
    const envUrl = process.env.NEXT_PUBLIC_SITE_URL
    if (envUrl && !envUrl.includes('localhost')) return envUrl.replace(/\/$/, '')
    return origin.replace(/\/$/, '')
  }

  // 3. Server Fallback: Manual Env (if not localhost) or Localhost
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL
  if (envUrl && !envUrl.includes('localhost')) return envUrl.replace(/\/$/, '')
  
  return 'http://localhost:3000'
}

export function absoluteUrl(path: string): string {
  const base = getSiteUrl()
  const p = path.startsWith('/') ? path : `/${path}`
  return `${base}${p}`
}
