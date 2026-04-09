-- ============================================================
-- SQL MIGRATION: 010 Unify User Profiles
-- 1. Cleans up existing duplicate profiles by email.
-- 2. Enforces unique email constraint.
-- 3. Updates triggers to gracefully handle multi-provider logins for the same email.
-- ============================================================

-- 1. IDENTIFY AND CLEANUP DUPLICATE PROFILES
-- We keep the record that is either an 'admin' or was created first.
DO $$ 
BEGIN
    -- Create a temporary table of IDs to delete
    CREATE TEMP TABLE to_delete AS
    WITH ranked_profiles AS (
        SELECT id, email, role, created_at,
               ROW_NUMBER() OVER (
                   PARTITION BY email 
                   ORDER BY (role = 'admin') DESC, created_at ASC
               ) as rank
        FROM public.profiles
    )
    SELECT id FROM ranked_profiles WHERE rank > 1;

    -- Update any foreign keys that might point to these IDs before deleting (Optional but recommended)
    -- In this app, program_views is the main one.
    -- We could try to repoint them to the "winner" ID, but for now we just delete for simplicity
    -- as we are in a cleanup phase.
    DELETE FROM public.program_views WHERE user_id IN (SELECT id FROM to_delete);
    DELETE FROM public.profiles WHERE id IN (SELECT id FROM to_delete);

    DROP TABLE to_delete;
END $$;

-- 2. ENFORCE UNIQUE EMAIL
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_email_unique;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_email_unique UNIQUE (email);

-- 3. UNIFIED SUPABASE AUTH TRIGGER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (email) DO UPDATE SET
    -- If a profile exists, we KEEP the existing row and its ID.
    -- We just update the name/avatar if they are missing.
    full_name = COALESCE(profiles.full_name, EXCLUDED.full_name),
    avatar_url = COALESCE(profiles.avatar_url, EXCLUDED.avatar_url);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. UNIFIED NEXTAUTH TRIGGER
CREATE OR REPLACE FUNCTION public.handle_next_auth_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    new.id,
    new.email,
    new.name,
    new.image
  )
  ON CONFLICT (email) DO UPDATE SET
    full_name = COALESCE(profiles.full_name, EXCLUDED.full_name),
    avatar_url = COALESCE(profiles.avatar_url, EXCLUDED.avatar_url);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. RELAX FOREIGN KEYS ON PROGRAM_VIEWS
-- This allows program_views to reference IDs that exist in public.profiles 
-- even if they are not in auth.users (e.g. Google users).
ALTER TABLE public.program_views DROP CONSTRAINT IF EXISTS program_views_user_id_fkey;
ALTER TABLE public.program_views 
  ADD CONSTRAINT program_views_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES public.profiles(id) 
  ON DELETE CASCADE;
