-- Allow mentors to see their own profile row
-- This is critical because many other policies depend on selecting the mentor's own ID from this table.
CREATE POLICY "Mentors can view their own profile row"
ON public.mentor_profiles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);
