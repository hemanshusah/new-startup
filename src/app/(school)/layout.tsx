import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    default: 'Startup School — Pre-Incubation Platform',
    template: '%s | Startup School',
  },
  description: 'A structured, self-paced pre-incubation program for first-time founders in India.',
}

export default function SchoolLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
