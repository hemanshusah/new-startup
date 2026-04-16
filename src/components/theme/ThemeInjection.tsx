import { createServiceClient } from '@/lib/supabase/server'

export const revalidate = 0

/**
 * Server component that injects dynamic CSS variables and Google Fonts
 * based on the config stored in the database.
 */
export async function ThemeInjection() {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('site_config')
    .select('cosmetic_settings')
    .limit(1)
    .maybeSingle()

  const settings = data?.cosmetic_settings as any
  
  // Robust Defaults
  const colors = settings?.colors || {
    accent: '#B8460A',
    accentLight: '#FDF0EA',
    bg: '#F5F2EB', // cream
    text: '#1C1A16', // ink
    border: '#DAD6CC', // cream-border
    white: '#FDFCF9'
  }
  
  const fonts = settings?.fonts || {}
  const borderRadius = settings?.borderRadius || '12px'
  
  // Resolve structured settings or fallback to legacy
  const h = typeof fonts.heading === 'object' 
    ? fonts.heading 
    : { family: fonts.heading || 'DM Serif Display', size: fonts.headingSize || '32px', weight: '400', style: 'normal' }
  const s = typeof fonts.section === 'object' 
    ? fonts.section 
    : { family: fonts.section || h.family, size: '15.5px', weight: '400', style: 'normal' }
  const b = typeof fonts.body === 'object' 
    ? fonts.body 
    : { family: fonts.body || 'DM Sans', size: fonts.bodySize || '14px', weight: '400', style: 'normal' }

  // Prepare Google Font links for all active fonts
  const headingFamily = h.family.replace(/ /g, '+')
  const bodyFamily = b.family.replace(/ /g, '+')
  const sectionFamily = s.family.replace(/ /g, '+')
  
  // Combine all fonts into one request with weights
  const googleFontsUrl = `https://fonts.googleapis.com/css2?family=${headingFamily}:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=${bodyFamily}:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=${sectionFamily}:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap`

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="stylesheet" href={googleFontsUrl} />
      
      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --accent: ${colors.accent};
          --accent-light: ${colors.accentLight};
          --bg: ${colors.bg};
          --ink: ${colors.text};
          --ink-border: ${colors.border};
          --white: ${colors.white};
          
          --font-serif: "${h.family}", serif;
          --font-sans: "${b.family}", sans-serif;
          --font-section: "${s.family}", sans-serif;
          
          --radius-lg: ${borderRadius};

          --font-size-heading: ${h.size};
          --font-weight-heading: ${h.weight};
          --font-style-heading: ${h.style};

          --font-size-section: ${s.size};
          --font-weight-section: ${s.weight};
          --font-style-section: ${s.style};

          --font-size-body: ${b.size};
          --font-weight-body: ${b.weight};
          --font-style-body: ${b.style};
        }

        /* Global Overrides - Force dynamic fonts onto EVERY text element */
        html, body, span, button, input, select, textarea, .sans, .font-body {
          font-family: var(--font-sans) !important;
          font-weight: var(--font-weight-body) !important;
          font-style: var(--font-style-body) !important;
        }

        /* Main Headings (H1 specifically for Program Page) */
        h1, .font-heading {
          font-family: var(--font-section) !important;
          font-weight: var(--font-weight-heading) !important;
          font-style: var(--font-style-heading) !important;
          font-size: var(--font-size-heading) !important;
        }

        /* Section Headings & Card Titles - Targeting Footer headers, Program section headers */
        h2, h3, h4, .section-title, .footer-header, .grant-card h3 {
          font-family: var(--font-section) !important;
          font-weight: var(--font-weight-section) !important;
          font-style: var(--font-style-section) !important;
        }

        /* Standard Sizing Overrides */
        h2 { font-size: calc(var(--font-size-heading) * 0.8) !important; }
        h3 { font-size: calc(var(--font-size-heading) * 0.7) !important; }

        /* Exception for cards - restore title size and enforce hierarchy */
        .grant-card h3 {
          font-size: var(--font-size-section) !important;
          margin-top: 4px !important;
        }
        .grant-card .org-name {
          font-size: calc(var(--font-size-section) * 0.7) !important;
          opacity: 0.7 !important;
          font-weight: 500 !important;
          font-family: var(--font-sans) !important;
        }
        .grant-card .amount-display {
          font-family: var(--font-section) !important;
          font-weight: var(--font-weight-section) !important;
        }
        .grant-card .meta-text {
          font-family: var(--font-sans) !important;
          font-size: 11px !important;
        }

        p, li, .font-body {
          font-size: var(--font-size-body) !important;
        }

        /* Exception for monospace elements */
        code, kbd, pre, samp, .mono {
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace !important;
        }

        .card, [style*="borderRadius"] {
          border-radius: var(--radius-lg) !important;
        }
      `}} />
    </>
  )
}
