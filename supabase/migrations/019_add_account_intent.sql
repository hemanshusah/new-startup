-- ============================================================
-- SQL MIGRATION: 019 Add Account Intent
-- Adds a field to public.profiles to distinguish founders from mentors.
-- ============================================================

-- 1. Add account_intent to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS account_intent text DEFAULT 'founder' CHECK (account_intent IN ('founder', 'mentor', 'explorer'));

-- 2. Add comment for clarity
COMMENT ON COLUMN public.profiles.account_intent IS 'The primary reason the user is using the platform (founder seeking grants, mentor, or explorer).';

-- 3. Update Unified Supabase Auth Trigger to capture account_intent
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, account_intent)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    COALESCE(new.raw_user_meta_data->>'account_intent', 'founder')
  )
  ON CONFLICT (email) DO UPDATE SET
    full_name = COALESCE(profiles.full_name, EXCLUDED.full_name),
    avatar_url = COALESCE(profiles.avatar_url, EXCLUDED.avatar_url),
    account_intent = COALESCE(profiles.account_intent, EXCLUDED.account_intent);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
