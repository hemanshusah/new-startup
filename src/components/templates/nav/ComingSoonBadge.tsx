import React from 'react'

interface ComingSoonBadgeProps {
  label?: string
}

/** Small pill badge used in the Navbar beside "Coming Soon" / "Launching Soon" nav items.
 *  Styled per CONTEXT.md §10: --accent-light bg, --accent text, 9.5px, uppercase, 0.1em letter-spacing */
export function ComingSoonBadge({ label = 'Coming Soon' }: ComingSoonBadgeProps) {
  return <span className="coming-soon-badge">{label}</span>
}
