-- Allow mentors to see profiles of founders who have booked sessions with them
CREATE POLICY "Mentors can view profiles of their founders"
ON public.profiles FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.sessions
    WHERE sessions.founder_id = public.profiles.id
    AND sessions.mentor_id IN (SELECT id FROM public.mentor_profiles WHERE user_id = auth.uid())
  )
);
