'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import NProgress from 'nprogress'
import './nprogress.css'

export function NavProgress() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    NProgress.configure({ 
      showSpinner: false,
      trickleSpeed: 200,
      minimum: 0.08
    })

    // Handle initial link clicks to start progress
    const handleAnchorClick = (event: MouseEvent) => {
      const target = event.target as HTMLAnchorElement
      const anchor = target.closest('a')

      if (anchor && 
          anchor.href && 
          anchor.href.startsWith(window.location.origin) && 
          anchor.target !== '_blank' &&
          !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey
      ) {
        // Only start for internal links
        if (anchor.href !== window.location.href) {
          NProgress.start()
        }
      }
    }

    document.addEventListener('click', handleAnchorClick)
    return () => document.removeEventListener('click', handleAnchorClick)
  }, [])

  useEffect(() => {
    // Finish NProgress when route change completes
    NProgress.done()
  }, [pathname, searchParams])

  return null
}
