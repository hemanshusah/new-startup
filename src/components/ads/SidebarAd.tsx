import type { Ad } from '@/types/ad'

interface SidebarAdProps {
  ad: Ad
}

/**
 * SidebarAd — vertical stacked ad in the detail page sidebar.
 * Format: sponsored label | emoji | headline | description | CTA button
 * CONTEXT.md §8 → format: `sidebar`
 */
export function SidebarAd({ ad }: SidebarAdProps) {
  return (
    <a
      href={`/api/ads/click?id=${ad.id}&url=${encodeURIComponent(ad.cta_url)}`}
      target="_blank"
      rel="noopener noreferrer sponsored"
      style={{
        display: 'block',
        background: 'var(--cream-dark)',
        border: '1px solid var(--cream-border)',
        borderRadius: '12px',
        padding: '18px',
        textDecoration: 'none',
      }}
      aria-label={`Sponsored: ${ad.headline}`}
    >
      {/* Sponsored label */}
      <p
        style={{
          fontFamily: 'DM Sans, sans-serif',
          fontSize: '9.5px',
          fontWeight: 500,
          color: 'var(--ink-4)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          margin: '0 0 12px',
        }}
      >
        Sponsored · {ad.advertiser}
      </p>

      {/* Icon / image */}
      {(ad.icon_emoji || ad.image_url) && (
        <div
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '9px',
            background: 'var(--white)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            border: '1px solid var(--cream-border)',
            overflow: 'hidden',
            marginBottom: '12px',
          }}
        >
          {ad.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={ad.image_url} alt={ad.advertiser} style={{ width: '100%', objectFit: 'cover' }} />
          ) : (
            ad.icon_emoji
          )}
        </div>
      )}

      {/* Headline */}
      <p
        style={{
          fontFamily: 'DM Serif Display, serif',
          fontSize: '14.5px',
          fontWeight: 400,
          color: 'var(--ink)',
          margin: '0 0 6px',
          lineHeight: 1.3,
        }}
      >
        {ad.headline}
      </p>

      {/* Sub-text */}
      <p
        style={{
          fontFamily: 'DM Sans, sans-serif',
          fontSize: '12px',
          fontWeight: 300,
          color: 'var(--ink-2)',
          margin: '0 0 14px',
          lineHeight: 1.55,
        }}
      >
        {ad.subtext}
      </p>

      {/* CTA button */}
      <div
        style={{
          display: 'inline-block',
          fontFamily: 'DM Sans, sans-serif',
          fontSize: '12px',
          fontWeight: 500,
          color: 'var(--cream)',
          background: 'var(--ink)',
          borderRadius: '6px',
          padding: '7px 14px',
        }}
      >
        {ad.cta_text}
      </div>
    </a>
  )
}
