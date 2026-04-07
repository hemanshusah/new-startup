'use client'

import { usePathname } from 'next/navigation'
import { Footer } from './Footer'

/** Mirrors NavWrapper — suppresses footer on all /admin/* routes */
export function FooterWrapper() {
  const pathname = usePathname()
  if (pathname?.startsWith('/admin')) return null
  return <Footer />
}
