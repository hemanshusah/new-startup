'use client'

import { Navbar } from '@/components/nav/Navbar'

interface Props {
  mentorConnectEnabled: boolean
}

/**
 * Thin client wrapper — receives server-fetched props and passes them to Navbar.
 * Keeps Navbar as a pure client component while allowing server-side prop injection.
 */
export function NavbarClient({ mentorConnectEnabled }: Props) {
  return <Navbar mentorConnectEnabled={mentorConnectEnabled} />
}
