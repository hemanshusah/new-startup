-- ============================================================
-- Migration: 012 — add_cosmetic_settings_to_site_config
-- ============================================================

-- Add cosmetic_settings column to store branding tokens (colors, fonts, radius)
ALTER TABLE IF EXISTS public.site_config 
ADD COLUMN IF NOT EXISTS cosmetic_settings jsonb DEFAULT '{
  "colors": {
    "accent": "#B8460A",
    "accentLight": "#FDF0EA",
    "bg": "#F5F2EB",
    "text": "#1C1A16",
    "border": "#DAD6CC",
    "white": "#FDFCF9"
  },
  "fonts": {
    "heading": "DM Serif Display",
    "body": "DM Sans"
  },
  "borderRadius": "12px"
}'::jsonb;

-- Update the existing row with defaults if it hasn't been set
UPDATE public.site_config 
SET cosmetic_settings = '{
  "colors": {
    "accent": "#B8460A",
    "accentLight": "#FDF0EA",
    "bg": "#F5F2EB",
    "text": "#1C1A16",
    "border": "#DAD6CC",
    "white": "#FDFCF9"
  },
  "fonts": {
    "heading": "DM Serif Display",
    "body": "DM Sans"
  },
  "borderRadius": "12px"
}'::jsonb
WHERE id = (SELECT id FROM public.site_config LIMIT 1);
