'use client'

interface EmailCaptureProps {
  id: string
  buttonLabel?: string
}

/** Client component for the email capture form on Coming Soon pages.
 *  Extracted so Server Component pages don't contain event handlers. */
export function EmailCapture({ id, buttonLabel = 'Notify me' }: EmailCaptureProps) {
  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      style={{ display: 'flex', gap: '10px', width: '100%', maxWidth: '380px' }}
    >
      <input
        id={id}
        type="email"
        placeholder="you@startup.com"
        style={{
          flex: 1,
          fontFamily: 'DM Sans, sans-serif',
          fontSize: '13px',
          color: 'var(--ink)',
          background: 'var(--white)',
          border: '1px solid var(--cream-border)',
          borderRadius: '6px',
          padding: '9px 14px',
          outline: 'none',
        }}
      />
      <button
        type="submit"
        style={{
          fontFamily: 'DM Sans, sans-serif',
          fontSize: '13px',
          fontWeight: 500,
          color: 'var(--cream)',
          background: 'var(--ink)',
          border: 'none',
          borderRadius: '6px',
          padding: '9px 18px',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}
      >
        {buttonLabel}
      </button>
    </form>
  )
}
