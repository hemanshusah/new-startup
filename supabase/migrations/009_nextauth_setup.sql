-- ============================================================
-- SQL MIGRATION: 009 NextAuth Setup
-- 1. Creates next_auth schema and tables for the Supabase Adapter.
-- 2. Integrates with the existing public.profiles system.
-- 3. Provides RLS helper for Auth.js users.
-- ============================================================

-- 1. Create the dedicated schema
CREATE SCHEMA IF NOT EXISTS next_auth;

-- 2. Grant permissions
GRANT USAGE ON SCHEMA next_auth TO service_role;
GRANT ALL ON SCHEMA next_auth TO postgres;

-- 3. Create Required Tables for Auth.js
CREATE TABLE IF NOT EXISTS next_auth.users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text,
  email text,
  "emailVerified" timestamp with time zone,
  image text,
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT email_unique UNIQUE (email)
);

CREATE TABLE IF NOT EXISTS next_auth.accounts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  "userId" uuid NOT NULL,
  type text NOT NULL,
  provider text NOT NULL,
  "providerAccountId" text NOT NULL,
  refresh_token text,
  access_token text,
  expires_at bigint,
  token_type text,
  scope text,
  id_token text,
  session_state text,
  CONSTRAINT accounts_pkey PRIMARY KEY (id),
  CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES next_auth.users(id) ON DELETE CASCADE,
  CONSTRAINT "provider_providerAccountId_unique" UNIQUE (provider, "providerAccountId")
);

CREATE TABLE IF NOT EXISTS next_auth.sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  expires timestamp with time zone NOT NULL,
  "sessionToken" text NOT NULL,
  "userId" uuid NOT NULL,
  CONSTRAINT sessions_pkey PRIMARY KEY (id),
  CONSTRAINT "sessionToken_unique" UNIQUE ("sessionToken"),
  CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES next_auth.users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS next_auth.verification_tokens (
  identifier text NOT NULL,
  token text NOT NULL,
  expires timestamp with time zone NOT NULL,
  CONSTRAINT verification_tokens_pkey PRIMARY KEY (identifier, token)
);

-- Grant All on tables to service_role (needed for the adapter)
GRANT ALL ON ALL TABLES IN SCHEMA next_auth TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA next_auth TO postgres;

-- 4. Relax public.profiles foreign key
-- We remove the strict reference to auth.users(id) so it can accept IDs from next_auth.users.
ALTER TABLE IF EXISTS public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- 5. Trigger to sync NextAuth users to public.profiles
CREATE OR REPLACE FUNCTION public.handle_next_auth_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.name,
    NEW.image
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    avatar_url = EXCLUDED.avatar_url;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_next_auth_user_created ON next_auth.users;
CREATE TRIGGER on_next_auth_user_created
  AFTER INSERT ON next_auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_next_auth_user();

-- 6. Helper function for RLS (Auth.js compatible)
-- This allows policies to identify the user when using NextAuth JWTs.
CREATE OR REPLACE FUNCTION next_auth.uid() 
RETURNS uuid 
LANGUAGE sql 
STABLE 
AS $$ 
  SELECT COALESCE(
    NULLIF(current_setting('request.jwt.claim.sub', true), ''),
    (NULLIF(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid 
$$;
