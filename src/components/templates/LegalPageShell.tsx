import type { ReactNode } from 'react'

interface LegalPageShellProps {
  title: string
  effectiveDate: string
  children: ReactNode
}

export function LegalPageShell({ title, effectiveDate, children }: LegalPageShellProps) {
  return (
    <main className="legal-page">
      <header className="legal-page__header">
        <p className="legal-page__kicker">Legal</p>
        <h1 className="legal-page__title">{title}</h1>
        <p className="legal-page__date">Effective date: {effectiveDate}</p>
      </header>
      <article className="legal-prose">{children}</article>
    </main>
  )
}
