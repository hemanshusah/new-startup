-- =============================================================================
-- 018_mentor_connect.sql
-- Mentor Connect — Full Schema
-- Sprint 1 of the Mentor Connect build (May 2026)
-- =============================================================================

-- ── CLEANUP (Ensure a clean state for Sprint 1) ──────────────────────────────
DROP TABLE IF EXISTS public.saved_mentors CASCADE;
DROP TABLE IF EXISTS public.group_session_bookings CASCADE;
DROP TABLE IF EXISTS public.group_sessions CASCADE;
DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TABLE IF EXISTS public.sessions CASCADE;
DROP TABLE IF EXISTS public.blocked_dates CASCADE;
DROP TABLE IF EXISTS public.mentor_availability CASCADE;
DROP TABLE IF EXISTS public.session_types CASCADE;
DROP TABLE IF EXISTS public.mentor_profiles CASCADE;

DROP TYPE IF EXISTS public.group_session_status CASCADE;
DROP TYPE IF EXISTS public.session_status CASCADE;
DROP TYPE IF EXISTS public.session_tier CASCADE;
DROP TYPE IF EXISTS public.mentor_verification_tier CASCADE;
DROP TYPE IF EXISTS public.mentor_status CASCADE;

-- ── ENUM TYPES ────────────────────────────────────────────────────────────────

CREATE TYPE public.mentor_status AS ENUM ('pending', 'active', 'suspended', 'rejected');
CREATE TYPE public.mentor_verification_tier AS ENUM ('community', 'verified', 'credential_verified');
CREATE TYPE public.session_tier AS ENUM ('standard', 'expert', 'advisory');
CREATE TYPE public.session_status AS ENUM ('pending_payment', 'confirmed', 'completed', 'cancelled');
CREATE TYPE public.group_session_status AS ENUM ('scheduled', 'cancelled', 'completed');

-- ── 1. mentor_profiles ────────────────────────────────────────────────────────
-- Core mentor record. One per user. Linked to auth.users via user_id.

CREATE TABLE IF NOT EXISTS public.mentor_profiles (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  slug                  TEXT UNIQUE NOT NULL,             -- URL-safe e.g. 'priya-sharma-fintech'
  status                public.mentor_status NOT NULL DEFAULT 'pending',
  verification_tier     public.mentor_verification_tier NOT NULL DEFAULT 'community',

  -- Public profile fields
  display_name          TEXT NOT NULL,
  headline              TEXT NOT NULL,                    -- One-line description
  bio                   TEXT NOT NULL,                    -- 150–600 words
  avatar_url            TEXT,                             -- CDN URL
  intro_video_url       TEXT,                             -- YouTube or Loom embed URL (no upload)
  languages             TEXT[] NOT NULL DEFAULT '{}',     -- e.g. ['English','Hindi']
  timezone              TEXT NOT NULL DEFAULT 'Asia/Kolkata',
  location_city         TEXT NOT NULL DEFAULT '',
  location_country      TEXT NOT NULL DEFAULT 'India',

  -- Social links
  linkedin_url          TEXT NOT NULL,                    -- Required for all tiers
  twitter_url           TEXT,
  website_url           TEXT,

  -- Expertise
  expertise_areas       TEXT[] NOT NULL DEFAULT '{}',     -- e.g. ['Market Entry','Grant Navigation']
  markets_covered       TEXT[] NOT NULL DEFAULT '{}',     -- Countries e.g. ['India','Singapore']
  industries            TEXT[] NOT NULL DEFAULT '{}',     -- e.g. ['Fintech','SaaS']
  years_experience      INTEGER NOT NULL DEFAULT 0,
  notable_companies     TEXT[] DEFAULT '{}',

  -- Auto-updated aggregate stats (updated via DB trigger or server action)
  total_sessions        INTEGER NOT NULL DEFAULT 0,
  avg_rating            DECIMAL(3,2) NOT NULL DEFAULT 0.00,
  total_reviews         INTEGER NOT NULL DEFAULT 0,

  -- Admin controls
  is_featured           BOOLEAN NOT NULL DEFAULT false,
  featured_until        DATE,
  application_notes     TEXT,                             -- Admin-only internal notes
  approved_by           UUID REFERENCES auth.users(id),
  approved_at           TIMESTAMPTZ,

  -- Google Calendar OAuth (tokens stored encrypted at application level)
  google_access_token   TEXT,                             -- Encrypted before storage
  google_refresh_token  TEXT,                             -- Encrypted before storage
  google_token_expiry   TIMESTAMPTZ,
  google_calendar_id    TEXT DEFAULT 'primary',

  -- Booking rules
  notice_period_hours   INTEGER NOT NULL DEFAULT 24,      -- Min hours before session can be booked
  booking_window_days   INTEGER NOT NULL DEFAULT 14,      -- Max days in advance

  -- Razorpay payout
  razorpay_account_id   TEXT,                             -- Mentor's Razorpay linked account

  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(user_id)                                         -- One mentor profile per user
);

-- ── 2. session_types ─────────────────────────────────────────────────────────
-- Each mentor defines their available session offerings.
-- Paid only. Price set by mentor within ₹2,500–₹25,000 INR per spec.

CREATE TABLE IF NOT EXISTS public.session_types (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id               UUID NOT NULL REFERENCES public.mentor_profiles(id) ON DELETE CASCADE,
  name                    TEXT NOT NULL,                  -- e.g. 'Market Entry Strategy'
  tier                    public.session_tier NOT NULL,
  duration_minutes        INTEGER NOT NULL CHECK (duration_minutes IN (30, 45, 60, 90)),
  price_inr               INTEGER NOT NULL CHECK (price_inr >= 2500 AND price_inr <= 25000),
  description             TEXT NOT NULL,                  -- What this session covers
  max_bookings_per_week   INTEGER,                        -- Optional cap
  is_active               BOOLEAN NOT NULL DEFAULT true,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 3. mentor_availability ───────────────────────────────────────────────────
-- Weekly recurring availability slots. Used to generate the slot picker.

CREATE TABLE IF NOT EXISTS public.mentor_availability (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id     UUID NOT NULL REFERENCES public.mentor_profiles(id) ON DELETE CASCADE,
  day_of_week   INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday, 6=Saturday
  start_time    TIME NOT NULL,
  end_time      TIME NOT NULL,
  timezone      TEXT NOT NULL DEFAULT 'Asia/Kolkata',
  CHECK (end_time > start_time)
);

-- ── 4. blocked_dates ─────────────────────────────────────────────────────────
-- Specific dates the mentor is unavailable (travel, holidays, etc).

CREATE TABLE IF NOT EXISTS public.blocked_dates (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id     UUID NOT NULL REFERENCES public.mentor_profiles(id) ON DELETE CASCADE,
  blocked_date  DATE NOT NULL,
  reason        TEXT,                                     -- Internal only, not shown to founders
  UNIQUE(mentor_id, blocked_date)
);

-- ── 5. sessions ──────────────────────────────────────────────────────────────
-- Every booked 1:1 session (paid only).

CREATE TABLE IF NOT EXISTS public.sessions (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id               UUID NOT NULL REFERENCES public.mentor_profiles(id),
  founder_id              UUID NOT NULL REFERENCES auth.users(id),
  session_type_id         UUID NOT NULL REFERENCES public.session_types(id),

  status                  public.session_status NOT NULL DEFAULT 'pending_payment',
  scheduled_start         TIMESTAMPTZ NOT NULL,
  scheduled_end           TIMESTAMPTZ NOT NULL,
  timezone                TEXT NOT NULL DEFAULT 'Asia/Kolkata',

  -- Google Meet
  google_meet_link        TEXT,
  google_calendar_event_id TEXT,

  -- Payment
  razorpay_order_id       TEXT UNIQUE,
  razorpay_payment_id     TEXT,
  amount_inr              INTEGER NOT NULL,
  platform_commission_inr INTEGER NOT NULL DEFAULT 0,     -- Stored at booking time
  mentor_payout_inr       INTEGER NOT NULL DEFAULT 0,     -- Stored at booking time
  payout_transferred_at   TIMESTAMPTZ,                    -- Set when payout is sent

  -- Session content
  founder_brief           TEXT,                           -- What the founder needs help with (max 500 chars)
  mentor_notes            TEXT,                           -- Mentor adds after session

  cancellation_reason     TEXT,
  cancelled_by            TEXT,                           -- 'founder' or 'mentor'
  cancelled_at            TIMESTAMPTZ,

  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 6. reviews ───────────────────────────────────────────────────────────────
-- Founder reviews submitted after session completion.
-- Mentors can reply to reviews.

CREATE TABLE IF NOT EXISTS public.reviews (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id            UUID NOT NULL UNIQUE REFERENCES public.sessions(id),
  mentor_id             UUID NOT NULL REFERENCES public.mentor_profiles(id),
  founder_id            UUID NOT NULL REFERENCES auth.users(id),

  -- Ratings (1–5)
  rating_overall        INTEGER NOT NULL CHECK (rating_overall BETWEEN 1 AND 5),
  rating_knowledge      INTEGER NOT NULL CHECK (rating_knowledge BETWEEN 1 AND 5),
  rating_clarity        INTEGER NOT NULL CHECK (rating_clarity BETWEEN 1 AND 5),
  rating_actionability  INTEGER NOT NULL CHECK (rating_actionability BETWEEN 1 AND 5),
  would_rebook          BOOLEAN NOT NULL DEFAULT false,

  review_text           TEXT NOT NULL,

  -- Mentor reply (visible on their profile)
  mentor_reply          TEXT,
  mentor_replied_at     TIMESTAMPTZ,

  -- Admin moderation
  is_hidden             BOOLEAN NOT NULL DEFAULT false,

  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 7. group_sessions ────────────────────────────────────────────────────────
-- Group office hours created by mentors.

CREATE TABLE IF NOT EXISTS public.group_sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id       UUID NOT NULL REFERENCES public.mentor_profiles(id),
  slug            TEXT UNIQUE NOT NULL,
  title           TEXT NOT NULL,
  description     TEXT NOT NULL,
  topic_tags      TEXT[] DEFAULT '{}',

  scheduled_start TIMESTAMPTZ NOT NULL,
  scheduled_end   TIMESTAMPTZ NOT NULL,
  timezone        TEXT NOT NULL DEFAULT 'Asia/Kolkata',

  max_seats       INTEGER NOT NULL DEFAULT 20,
  seats_booked    INTEGER NOT NULL DEFAULT 0,
  price_inr       INTEGER NOT NULL CHECK (price_inr >= 2500),

  google_meet_link          TEXT,
  google_calendar_event_id  TEXT,

  status          public.group_session_status NOT NULL DEFAULT 'scheduled',

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 8. group_session_bookings ────────────────────────────────────────────────
-- Junction: which founders have booked which group sessions.

CREATE TABLE IF NOT EXISTS public.group_session_bookings (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_session_id  UUID NOT NULL REFERENCES public.group_sessions(id) ON DELETE CASCADE,
  founder_id        UUID NOT NULL REFERENCES auth.users(id),
  razorpay_order_id TEXT,
  amount_paid_inr   INTEGER NOT NULL,
  waitlisted        BOOLEAN NOT NULL DEFAULT false,
  joined_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(group_session_id, founder_id)
);

-- ── 9. saved_mentors ─────────────────────────────────────────────────────────
-- Founders can bookmark/save mentors. Reuses the same pattern as user_bookmarks.

CREATE TABLE IF NOT EXISTS public.saved_mentors (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mentor_id   UUID NOT NULL REFERENCES public.mentor_profiles(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, mentor_id)
);

-- ── SITE CONFIG — NEW MENTOR CONNECT COLUMNS ─────────────────────────────────
-- Adds the master toggle and commission/pricing config to the existing site_config table.

ALTER TABLE public.site_config
  ADD COLUMN IF NOT EXISTS mentor_connect_enabled    BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS mentor_commission_pct     INTEGER NOT NULL DEFAULT 20,
  ADD COLUMN IF NOT EXISTS price_min_inr             INTEGER NOT NULL DEFAULT 2500,
  ADD COLUMN IF NOT EXISTS price_max_inr             INTEGER NOT NULL DEFAULT 25000;

-- ── INDEXES ───────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_mentor_profiles_status     ON public.mentor_profiles(status);
CREATE INDEX IF NOT EXISTS idx_mentor_profiles_slug       ON public.mentor_profiles(slug);
CREATE INDEX IF NOT EXISTS idx_mentor_profiles_user_id    ON public.mentor_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_session_types_mentor_id    ON public.session_types(mentor_id);
CREATE INDEX IF NOT EXISTS idx_sessions_mentor_id         ON public.sessions(mentor_id);
CREATE INDEX IF NOT EXISTS idx_sessions_founder_id        ON public.sessions(founder_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status            ON public.sessions(status);
CREATE INDEX IF NOT EXISTS idx_reviews_mentor_id          ON public.reviews(mentor_id);
CREATE INDEX IF NOT EXISTS idx_group_sessions_status      ON public.group_sessions(status);
CREATE INDEX IF NOT EXISTS idx_saved_mentors_user_id      ON public.saved_mentors(user_id);

-- ── ROW LEVEL SECURITY ────────────────────────────────────────────────────────

ALTER TABLE public.mentor_profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_types          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_availability    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_dates          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_sessions         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_session_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_mentors          ENABLE ROW LEVEL SECURITY;

-- mentor_profiles: public can read active profiles; mentors manage their own
CREATE POLICY "Public can view active mentor profiles"
  ON public.mentor_profiles FOR SELECT
  USING (status = 'active');

CREATE POLICY "Mentors can update their own profile"
  ON public.mentor_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Mentors can insert their own profile"
  ON public.mentor_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- session_types: public can read active types; mentors manage their own
CREATE POLICY "Public can view active session types"
  ON public.session_types FOR SELECT
  USING (is_active = true);

CREATE POLICY "Mentors can manage their session types"
  ON public.session_types FOR ALL
  USING (mentor_id IN (SELECT id FROM public.mentor_profiles WHERE user_id = auth.uid()));

-- mentor_availability: public can read; mentors manage their own
CREATE POLICY "Public can view mentor availability"
  ON public.mentor_availability FOR SELECT USING (true);

CREATE POLICY "Mentors can manage their availability"
  ON public.mentor_availability FOR ALL
  USING (mentor_id IN (SELECT id FROM public.mentor_profiles WHERE user_id = auth.uid()));

-- blocked_dates: mentors manage their own
CREATE POLICY "Public can view blocked dates"
  ON public.blocked_dates FOR SELECT USING (true);

CREATE POLICY "Mentors can manage their blocked dates"
  ON public.blocked_dates FOR ALL
  USING (mentor_id IN (SELECT id FROM public.mentor_profiles WHERE user_id = auth.uid()));

-- sessions: founders see their own; mentors see sessions assigned to them
CREATE POLICY "Founders can view their own sessions"
  ON public.sessions FOR SELECT
  USING (auth.uid() = founder_id);

CREATE POLICY "Mentors can view their assigned sessions"
  ON public.sessions FOR SELECT
  USING (mentor_id IN (SELECT id FROM public.mentor_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Founders can create sessions"
  ON public.sessions FOR INSERT
  WITH CHECK (auth.uid() = founder_id);

CREATE POLICY "Mentors can update session notes"
  ON public.sessions FOR UPDATE
  USING (mentor_id IN (SELECT id FROM public.mentor_profiles WHERE user_id = auth.uid()));

-- reviews: public can read non-hidden; founders write their own; mentors reply to theirs
CREATE POLICY "Public can view non-hidden reviews"
  ON public.reviews FOR SELECT USING (is_hidden = false);

CREATE POLICY "Founders can submit their own reviews"
  ON public.reviews FOR INSERT
  WITH CHECK (auth.uid() = founder_id);

CREATE POLICY "Mentors can reply to reviews on their profile"
  ON public.reviews FOR UPDATE
  USING (mentor_id IN (SELECT id FROM public.mentor_profiles WHERE user_id = auth.uid()));

-- group_sessions: public can read scheduled ones
CREATE POLICY "Public can view scheduled group sessions"
  ON public.group_sessions FOR SELECT
  USING (status = 'scheduled');

CREATE POLICY "Mentors can manage their group sessions"
  ON public.group_sessions FOR ALL
  USING (mentor_id IN (SELECT id FROM public.mentor_profiles WHERE user_id = auth.uid()));

-- group_session_bookings: founders see their own
CREATE POLICY "Founders can view their group session bookings"
  ON public.group_session_bookings FOR SELECT
  USING (auth.uid() = founder_id);

CREATE POLICY "Founders can book group sessions"
  ON public.group_session_bookings FOR INSERT
  WITH CHECK (auth.uid() = founder_id);

-- saved_mentors: users manage their own
CREATE POLICY "Users can view their saved mentors"
  ON public.saved_mentors FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can save mentors"
  ON public.saved_mentors FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave mentors"
  ON public.saved_mentors FOR DELETE
  USING (auth.uid() = user_id);

-- ── UPDATED_AT TRIGGERS ───────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER mentor_profiles_updated_at
  BEFORE UPDATE ON public.mentor_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER sessions_updated_at
  BEFORE UPDATE ON public.sessions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER group_sessions_updated_at
  BEFORE UPDATE ON public.group_sessions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
