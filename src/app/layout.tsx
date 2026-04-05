import type { Metadata } from 'next'
import './globals.css'
import { Navbar } from '@/components/nav/Navbar'
import { AuthProvider } from '@/components/auth/AuthProvider'
import { AuthModal } from '@/components/auth/AuthModal'

export const metadata: Metadata = {
  title: {
    default: 'GrantsIndia — Top 2026 Grants & Funding for Indian Startups',
    template: '%s — GrantsIndia',
  },
  description:
    'Discover government and private sector grants, incubation programs, accelerators, and contests for Indian founders. Updated weekly.',
}

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
      <body>
        {/*
          AuthProvider must wrap everything so that:
          1. Navbar can read the current user and show avatar/login button
          2. GrantsGrid can open the modal via AuthGate
          3. AuthModal can perform sign-in and redirect after login
        */}
        <AuthProvider>
          <Navbar />
          <main>{children}</main>
          {/* AuthModal renders as a portal-like overlay on top of everything */}
          <AuthModal />
        </AuthProvider>
      </body>
    </html>
  )
}
