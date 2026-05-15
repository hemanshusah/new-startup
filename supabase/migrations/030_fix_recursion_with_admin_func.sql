-- 1. Create a security definer function to check admin status
-- This bypasses RLS and prevents infinite recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Update the session policy to use the function
DROP POLICY IF EXISTS "Admins can update any session" ON public.sessions;

CREATE POLICY "Admins can update any session"
ON public.sessions FOR UPDATE
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());
