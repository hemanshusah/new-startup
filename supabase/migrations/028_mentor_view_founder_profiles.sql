-- Ensure mentors can see the profiles of founders who have booked sessions with them
-- This is a more direct policy to bypass any previous complexity.
CREATE POLICY "Mentors can view founder profiles of their bookings"
ON public.profiles FOR SELECT
TO authenticated
USING (
  id IN (
    SELECT founder_id 
    FROM public.sessions 
    WHERE mentor_id IN (
      SELECT id 
      FROM public.mentor_profiles 
      WHERE user_id = auth.uid()
    )
  )
);
