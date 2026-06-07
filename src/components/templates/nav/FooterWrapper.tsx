'use client'

import { usePathname } from 'next/navigation'
import { Footer } from './Footer'

/** Mirrors NavWrapper — suppresses footer on all /admin/* and /school/* routes */
export function FooterWrapper() {
  const pathname = usePathname()
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/school')) return null
  return <Footer />
}
