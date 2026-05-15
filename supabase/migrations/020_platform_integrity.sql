-- ============================================================
-- SQL MIGRATION: 020 Platform Integrity & Cleanup (Corrected)
-- 1. Cascading deletions for all user-related tables.
-- 2. Nullable account_intent for onboarding detection.
-- ============================================================

-- 1. CASCADING DELETIONS
-- We drop and recreate foreign keys with ON DELETE CASCADE

-- Profiles (from Auth)
ALTER TABLE public.profiles 
  DROP CONSTRAINT IF EXISTS profiles_id_fkey,
  ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- User Bookmarks (Grants/Programs)
ALTER TABLE public.user_bookmarks
  DROP CONSTRAINT IF EXISTS user_bookmarks_user_id_fkey,
  DROP CONSTRAINT IF EXISTS bookmarks_user_id_fkey,
  ADD CONSTRAINT user_bookmarks_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Program Views
ALTER TABLE public.program_views
  DROP CONSTRAINT IF EXISTS program_views_user_id_fkey,
  ADD CONSTRAINT program_views_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Mentor Profiles
ALTER TABLE public.mentor_profiles
  DROP CONSTRAINT IF EXISTS mentor_profiles_user_id_fkey,
  ADD CONSTRAINT mentor_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Saved Mentors (Mentor Bookmarks)
ALTER TABLE public.saved_mentors
  DROP CONSTRAINT IF EXISTS saved_mentors_user_id_fkey,
  ADD CONSTRAINT saved_mentors_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Session Types
ALTER TABLE public.session_types
  DROP CONSTRAINT IF EXISTS session_types_mentor_id_fkey,
  ADD CONSTRAINT session_types_mentor_id_fkey FOREIGN KEY (mentor_id) REFERENCES public.mentor_profiles(id) ON DELETE CASCADE;

-- 1:1 Sessions
ALTER TABLE public.sessions
  DROP CONSTRAINT IF EXISTS sessions_mentor_id_fkey,
  DROP CONSTRAINT IF EXISTS sessions_founder_id_fkey,
  ADD CONSTRAINT sessions_mentor_id_fkey FOREIGN KEY (mentor_id) REFERENCES public.mentor_profiles(id) ON DELETE CASCADE,
  ADD CONSTRAINT sessions_founder_id_fkey FOREIGN KEY (founder_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Reviews
ALTER TABLE public.reviews
  DROP CONSTRAINT IF EXISTS reviews_session_id_fkey,
  DROP CONSTRAINT IF EXISTS reviews_mentor_id_fkey,
  DROP CONSTRAINT IF EXISTS reviews_founder_id_fkey,
  ADD CONSTRAINT reviews_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.sessions(id) ON DELETE CASCADE,
  ADD CONSTRAINT reviews_mentor_id_fkey FOREIGN KEY (mentor_id) REFERENCES public.mentor_profiles(id) ON DELETE CASCADE,
  ADD CONSTRAINT reviews_founder_id_fkey FOREIGN KEY (founder_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Group Sessions
ALTER TABLE public.group_sessions
  DROP CONSTRAINT IF EXISTS group_sessions_mentor_id_fkey,
  ADD CONSTRAINT group_sessions_mentor_id_fkey FOREIGN KEY (mentor_id) REFERENCES public.mentor_profiles(id) ON DELETE CASCADE;

-- Group Session Bookings
ALTER TABLE public.group_session_bookings
  DROP CONSTRAINT IF EXISTS group_session_bookings_group_session_id_fkey,
  DROP CONSTRAINT IF EXISTS group_session_bookings_founder_id_fkey,
  ADD CONSTRAINT group_session_bookings_group_session_id_fkey FOREIGN KEY (group_session_id) REFERENCES public.group_sessions(id) ON DELETE CASCADE,
  ADD CONSTRAINT group_session_bookings_founder_id_fkey FOREIGN KEY (founder_id) REFERENCES auth.users(id) ON DELETE CASCADE;


-- 2. ONBOARDING DETECTION
-- Allow account_intent to be NULL initially for Google sign-ins
ALTER TABLE public.profiles ALTER COLUMN account_intent DROP NOT NULL;

-- Create an index to quickly find users needing onboarding
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding_needed ON public.profiles(id) WHERE account_intent IS NULL;


-- 3. TRIGGER UPDATE
-- Ensure the handle_new_user trigger doesn't force a default intent if we want to detect missing ones
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, role, account_intent)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url',
    'user',
    NULL -- Explicitly set to NULL to trigger onboarding redirect
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
