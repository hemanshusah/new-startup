-- ============================================================
-- SQL MIGRATION: 016 Advanced Startup Profiles
-- Adds detailed startup metrics for personalized recommendations.
-- ============================================================

-- 1. Add advanced fields to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS startup_sectors    text[]      DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS startup_stage      text        CHECK (startup_stage IN ('idea', 'mvp', 'early-traction', 'scaling', 'mature')),
  ADD COLUMN IF NOT EXISTS startup_state      text,
  ADD COLUMN IF NOT EXISTS startup_city       text,
  ADD COLUMN IF NOT EXISTS startup_description text,
  ADD COLUMN IF NOT EXISTS founding_date      date,
  ADD COLUMN IF NOT EXISTS team_size          integer     DEFAULT 1,
  ADD COLUMN IF NOT EXISTS revenue_status     text        CHECK (revenue_status IN ('pre-revenue', 'revenue-generating', 'profitable')),
  ADD COLUMN IF NOT EXISTS funding_status     text        CHECK (funding_status IN ('bootstrapped', 'angel-funded', 'seed-funded', 'series-a', 'series-b+'));

-- 2. Add comments for clarity
COMMENT ON COLUMN public.profiles.startup_sectors IS 'Array of sectors the startup operates in (e.g., Fintech, EdTech)';
COMMENT ON COLUMN public.profiles.startup_stage IS 'Current development stage of the startup';
COMMENT ON COLUMN public.profiles.startup_state IS 'Indian state where the startup is based (matches programs.state)';

-- 3. Update RLS (already enabled in 001, but ensuring users can update these fields)
-- The existing "profiles_update_own" policy covers these new columns.
