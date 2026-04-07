-- Idempotent: add JSON columns if missing, then ensure one row exists.
-- Requires migrations 001–005 (si_slot_positions rename, etc.).

ALTER TABLE public.site_config
  ADD COLUMN IF NOT EXISTS field_schema jsonb,
  ADD COLUMN IF NOT EXISTS sectors jsonb;

INSERT INTO public.site_config (
  site_name,
  programs_per_page,
  si_slot_positions,
  maintenance_mode,
  field_schema,
  sectors
)
SELECT
  'GrantsIndia',
  12,
  '[6, 14, 20]'::jsonb,
  false,
  '{}'::jsonb,
  '[]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.site_config LIMIT 1);
