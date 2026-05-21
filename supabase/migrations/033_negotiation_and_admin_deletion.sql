-- =============================================================================
-- 033_negotiation_and_admin_deletion.sql
-- Mentor Connect — Directory Availability, Negotiation Slots & Admin Delete Controls
-- =============================================================================

-- Add availability control to mentor profiles
ALTER TABLE public.mentor_profiles 
  ADD COLUMN IF NOT EXISTS is_available BOOLEAN NOT NULL DEFAULT true;

-- Add proposed slot option 2 and negotiation counter-offer fields to meeting requests
ALTER TABLE public.meeting_requests
  ADD COLUMN IF NOT EXISTS proposed_start_2 TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS proposed_end_2 TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS offered_start TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS offered_end TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS offered_amount_inr INTEGER;

-- Relax / Update meeting request status check constraint to include 'offered' state
ALTER TABLE public.meeting_requests 
  DROP CONSTRAINT IF EXISTS meeting_requests_status_check;

ALTER TABLE public.meeting_requests 
  ADD CONSTRAINT meeting_requests_status_check 
  CHECK (status IN ('pending', 'offered', 'accepted', 'declined'));
