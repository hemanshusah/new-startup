import type { Program } from '@/types/program'

function daysUntil(dateStr: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.ceil((new Date(dateStr).getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

function formatDeadline(dateStr: string): { label: string; color: string } {
  const days = daysUntil(dateStr)
  const formatted = new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
  if (days <= 1) return { label: formatted, color: '#E03E2D' }
  if (days <= 7) return { label: formatted, color: '#D4820E' }
  return { label: formatted, color: 'var(--ink)' }
}

interface MetaItem {
  label: string
  value: string
  color?: string
}

interface MetaStripProps {
  program: Program
}

/**
 * MetaStrip — PROGRESS.md 4.3
 * Single-row panel with 5 meta items: Deadline, Funding, Equity, Mode, Stage.
 * 1px dividers between items. Rounded border container.
 */
export function MetaStrip({ program }: MetaStripProps) {
  const deadline = formatDeadline(program.deadline)

  const items: MetaItem[] = [
    {
      label: 'Deadline',
      value: deadline.label,
      color: deadline.color,
    },
    {
      label: 'Funding',
      value: program.amount_display ?? '—',
    },
    {
      label: 'Equity',
      value: program.equity ?? '—',
    },
    {
      label: 'Mode',
      value: program.mode ?? '—',
    },
    {
      label: 'Stage',
      value: program.stage ?? '—',
    },
  ]

  return (
    <div
      className="meta-strip-container"
      style={{
        display: 'flex',
        border: '1px solid var(--cream-border)',
        borderRadius: '10px',
        overflow: 'hidden',
        background: 'var(--white)',
        marginBottom: '36px',
      }}
      role="list"
      aria-label="Program details"
    >
      {items.map((item, i) => (
        <div
          key={item.label}
          role="listitem"
          className="meta-strip-item"
          style={{
            flex: 1,
            padding: '10px 16px',
            borderLeft: i === 0 ? 'none' : '1px solid var(--cream-border)',
            minWidth: 0,
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-sans), sans-serif',
              fontSize: '10px',
              fontWeight: 500,
              color: 'var(--ink-4)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              margin: '0 0 4px',
            }}
          >
            {item.label}
          </p>
          <p
            className="meta-strip-value"
            style={{
              fontFamily: 'var(--font-sans), sans-serif',
              fontSize: '13.5px',
              fontWeight: 400,
              color: item.color ?? 'var(--ink)',
              margin: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {item.value}
          </p>
        </div>
      ))}
    </div>
  )
}
