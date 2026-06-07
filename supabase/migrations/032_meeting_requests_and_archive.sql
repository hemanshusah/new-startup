-- =============================================================================
-- 032_meeting_requests_and_archive.sql
-- Mentor Connect — Custom Meeting Requests & Soft Deletion
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.meeting_requests (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  founder_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mentor_id         UUID NOT NULL REFERENCES public.mentor_profiles(id) ON DELETE CASCADE,
  session_type_id   UUID REFERENCES public.session_types(id) ON DELETE SET NULL,
  proposed_start    TIMESTAMPTZ NOT NULL,
  proposed_end      TIMESTAMPTZ NOT NULL,
  founder_brief     TEXT NOT NULL,
  amount_inr        INTEGER NOT NULL,
  status            TEXT CHECK (status IN ('pending', 'accepted', 'declined')) DEFAULT 'pending',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_meeting_requests_founder_id ON public.meeting_requests(founder_id);
CREATE INDEX IF NOT EXISTS idx_meeting_requests_mentor_id ON public.meeting_requests(mentor_id);
CREATE INDEX IF NOT EXISTS idx_meeting_requests_status ON public.meeting_requests(status);

-- Enable RLS
ALTER TABLE public.meeting_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Founders can manage their own meeting requests"
  ON public.meeting_requests FOR ALL
  TO authenticated
  USING (auth.uid() = founder_id)
  WITH CHECK (auth.uid() = founder_id);

CREATE POLICY "Mentors can view and respond to meeting requests"
  ON public.meeting_requests FOR ALL
  TO authenticated
  USING (
    mentor_id IN (
      SELECT id FROM public.mentor_profiles WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    mentor_id IN (
      SELECT id FROM public.mentor_profiles WHERE user_id = auth.uid()
    )
  );

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_meeting_requests_updated_at
  BEFORE UPDATE ON public.meeting_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();
