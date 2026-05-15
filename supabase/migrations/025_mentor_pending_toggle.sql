-- Add toggle for showing pending sessions to mentors
ALTER TABLE public.site_config
  ADD COLUMN IF NOT EXISTS mentor_show_pending_sessions BOOLEAN NOT NULL DEFAULT true;
