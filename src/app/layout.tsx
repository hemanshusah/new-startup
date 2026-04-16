import type { Metadata } from 'next'
import { Suspense } from 'react'
import './globals.css'
import { getSiteUrl } from '@/lib/site-url'
import { NavWrapper } from '@/components/nav/NavWrapper'
import { NavProgress } from '@/components/nav/NavProgress'
import { PageTransition } from '@/components/ui/PageTransition'
import { AuthProvider } from '@/components/auth/AuthProvider'
import { DM_Sans, DM_Serif_Display } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AuthModalLazy } from '@/components/auth/AuthModalLazy'
import { ThemeInjection } from '@/components/theme/ThemeInjection'

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: 'GrantsIndia — Top 2026 Grants & Funding for Indian Startups',
    template: '%s — GrantsIndia',
  },
  description:
    'Discover government and private sector grants, incubation programs, accelerators, and contests for Indian founders. Updated weekly.',
}

import { FooterWrapper } from '@/components/nav/FooterWrapper'

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  display: 'swap',
  variable: '--font-sans',
})

const dmSerif = DM_Serif_Display({
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
  variable: '--font-serif',
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Suspense fallback={null}>
          <ThemeInjection />
        </Suspense>
      </head>
      <body
        className={`${dmSans.variable} ${dmSerif.variable}`}
        style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}
      >
        <AuthProvider>
          <Suspense fallback={null}>
            <NavProgress />
          </Suspense>
          <NavWrapper />
          <PageTransition>
            <main style={{ flex: 1 }}>{children}</main>
          </PageTransition>
          <FooterWrapper />
          <AuthModalLazy />
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
