-- =============================================================================
-- 034_negotiation_timeline.sql
-- Mentor Connect — Proposal Discussion Logs & Chronological Negotiation Timelines
-- =============================================================================

-- Add negotiation_timeline to meeting_requests
ALTER TABLE public.meeting_requests
  ADD COLUMN IF NOT EXISTS negotiation_timeline JSONB NOT NULL DEFAULT '[]'::jsonb;

-- Add negotiation_timeline to sessions
ALTER TABLE public.sessions
  ADD COLUMN IF NOT EXISTS negotiation_timeline JSONB NOT NULL DEFAULT '[]'::jsonb;
