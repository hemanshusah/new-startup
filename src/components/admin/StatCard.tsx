interface StatCardProps {
  label: string
  value: string | number
  sub?: string
}

/**
 * StatCard — used on the admin dashboard for the 6 metric cards.
 * PROGRESS.md 5.3
 */
export function StatCard({ label, value, sub }: StatCardProps) {
  return (
    <div
      style={{
        background: 'var(--white)',
        border: '1px solid var(--cream-border)',
        borderRadius: '12px',
        padding: '20px 22px',
      }}
    >
      <p
        style={{
          fontFamily: 'var(--font-sans), sans-serif',
          fontSize: '11px',
          fontWeight: 500,
          color: 'var(--ink-4)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          margin: '0 0 8px',
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontFamily: 'var(--font-serif), serif',
          fontSize: '28px',
          fontWeight: 400,
          color: 'var(--ink)',
          margin: '0 0 4px',
          lineHeight: 1,
        }}
      >
        {value}
      </p>
      {sub && (
        <p
          style={{
            fontFamily: 'var(--font-sans), sans-serif',
            fontSize: '11.5px',
            color: 'var(--ink-4)',
            margin: 0,
          }}
        >
          {sub}
        </p>
      )}
    </div>
  )
}
