import type { Metadata } from 'next'
import { PRODUCTS } from '@/config/products'

export const metadata: Metadata = {
  title: {
    default: PRODUCTS.grants.title,
    template: `%s — ${PRODUCTS.grants.name}`,
  },
  description: PRODUCTS.grants.description,
}

export default function GrantsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
