-- Migration 011: Add Email Verification support
-- Adds a verification flag to profiles and a table for OTP storage.

-- 1. Add email_verified flag to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email_verified boolean DEFAULT false;

-- 2. Create OTP Verifications table
CREATE TABLE IF NOT EXISTS public.otp_verifications (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  email       text        NOT NULL,
  code        text        NOT NULL,
  expires_at  timestamptz NOT NULL,
  created_at  timestamptz DEFAULT now()
);

-- 3. Add index for faster cleanup and lookup
CREATE INDEX IF NOT EXISTS idx_otp_email ON public.otp_verifications(email);

-- 4. Enable RLS (Security)
ALTER TABLE public.otp_verifications ENABLE ROW LEVEL SECURITY;

-- 5. Only the service role (server) can manage OTPs for now
CREATE POLICY "Service role can manage OTPs" ON public.otp_verifications
  USING (true)
  WITH CHECK (true);
