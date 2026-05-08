-- Add product tracking to core tables
ALTER TABLE public.site_config ADD COLUMN IF NOT EXISTS product_slug TEXT UNIQUE;
ALTER TABLE public.programs ADD COLUMN IF NOT EXISTS product_slug TEXT DEFAULT 'grants';
ALTER TABLE public.ads ADD COLUMN IF NOT EXISTS product_slug TEXT DEFAULT 'grants';

-- Initialize existing data as 'grants'
-- Note: Using 'id' for site_config if site_name isn't exact
UPDATE public.site_config SET product_slug = 'grants';
UPDATE public.programs SET product_slug = 'grants';
UPDATE public.ads SET product_slug = 'grants';
