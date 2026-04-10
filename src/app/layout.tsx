import type { Metadata } from 'next'
import { Suspense } from 'react'
import './globals.css'
import { getSiteUrl } from '@/lib/site-url'
import { NavWrapper } from '@/components/nav/NavWrapper'
import { NavProgress } from '@/components/nav/NavProgress'
import { PageTransition } from '@/components/ui/PageTransition'
import { AuthProvider } from '@/components/auth/AuthProvider'
import { AuthModal } from '@/components/auth/AuthModal'
import { Analytics } from '@vercel/analytics/next'

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        {/* Google Fonts — DM Serif Display + DM Sans (PROGRESS.md 2.1) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500&display=swap"
        />
      </head>
      <body style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <AuthProvider>
          <Suspense fallback={null}>
            <NavProgress />
          </Suspense>
          <NavWrapper />
          <PageTransition>
            <main style={{ flex: 1 }}>{children}</main>
          </PageTransition>
          <FooterWrapper />
          <Suspense fallback={null}>
            <AuthModal />
          </Suspense>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
