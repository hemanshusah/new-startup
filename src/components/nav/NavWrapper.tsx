'use client'

import { usePathname } from 'next/navigation'
import { Navbar } from '@/components/nav/Navbar'

export function NavWrapper() {
  const pathname = usePathname()
  const isAdmin = pathname?.startsWith('/admin')

  if (isAdmin) return null

  return <Navbar />
}
