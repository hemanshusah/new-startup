import type { Ad } from '@/types/ad'

interface InlineAdProps {
  ad: Ad
}

/**
 * InlineAd — full-width horizontal detail-page ad card.
 * Format: icon/emoji | headline (DM Serif) | description | CTA link
 * Background: `--cream-dark`
 * CONTEXT.md §8 → format: `inline`
 */
export function InlineAd({ ad }: InlineAdProps) {
  return (
    <a
      href={`/api/ads/click?id=${ad.id}&url=${encodeURIComponent(ad.cta_url)}`}
      target="_blank"
      rel="noopener noreferrer sponsored"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        background: 'var(--cream-dark)',
        border: '1px solid var(--cream-border)',
        borderRadius: '12px',
        padding: '18px 22px',
        textDecoration: 'none',
        transition: 'background 0.15s ease',
      }}
      className="inline-ad-link"
      aria-label={`Sponsored: ${ad.headline}`}
    >
      {/* Icon / emoji */}
      {(ad.icon_emoji || ad.image_url) && (
        <div
          style={{
            flexShrink: 0,
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: 'var(--white)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '22px',
            border: '1px solid var(--cream-border)',
            overflow: 'hidden',
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

      {/* Text block */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '10px',
            fontWeight: 500,
            color: 'var(--ink-4)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            margin: '0 0 3px',
          }}
        >
          Sponsored · {ad.advertiser}
        </p>
        <p
          style={{
            fontFamily: 'DM Serif Display, serif',
            fontSize: '15.5px',
            fontWeight: 400,
            color: 'var(--ink)',
            margin: '0 0 3px',
            lineHeight: 1.3,
          }}
        >
          {ad.headline}
        </p>
        <p
          style={{
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '12.5px',
            fontWeight: 300,
            color: 'var(--ink-2)',
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          {ad.subtext}
        </p>
      </div>

      {/* CTA */}
      <div
        style={{
          flexShrink: 0,
          fontFamily: 'DM Sans, sans-serif',
          fontSize: '12px',
          fontWeight: 500,
          color: 'var(--accent)',
          whiteSpace: 'nowrap',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
        }}
      >
        {ad.cta_text} →
      </div>
    </a>
  )
}
