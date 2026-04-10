 'use client'
 
 import dynamic from 'next/dynamic'
 
 export const AuthModalLazy = dynamic(
   () => import('./AuthModal').then((m) => m.AuthModal),
   { ssr: false, loading: () => null }
 )

