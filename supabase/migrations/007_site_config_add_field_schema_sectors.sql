-- Adds JSONB columns expected by /admin/settings (see 002_add_site_config_fields.sql).
-- Safe to run if columns already exist.
-- After applying: Supabase Dashboard → Project Settings → Data API → "Reload schema"
--   (or wait a minute) so PostgREST picks up the new columns — fixes PGRST204.

ALTER TABLE public.site_config
  ADD COLUMN IF NOT EXISTS field_schema jsonb,
  ADD COLUMN IF NOT EXISTS sectors jsonb;
