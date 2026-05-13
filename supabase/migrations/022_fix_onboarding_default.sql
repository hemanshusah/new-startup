-- ============================================================
-- SQL MIGRATION: 022 Fix Onboarding Default
-- Removes the default 'founder' intent to force new users to onboard.
-- ============================================================

-- 1. Remove the default value
ALTER TABLE public.profiles 
  ALTER COLUMN account_intent DROP DEFAULT;

-- 2. Update the trigger to NOT set a default intent
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, account_intent)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'account_intent' -- Will be null if not provided in signup metadata
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(profiles.full_name, EXCLUDED.full_name),
    avatar_url = COALESCE(profiles.avatar_url, EXCLUDED.avatar_url),
    account_intent = COALESCE(profiles.account_intent, EXCLUDED.account_intent);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
