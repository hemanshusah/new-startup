-- ============================================================
-- SQL MIGRATION: 031 Cascade Delete Audit & Approvals (Security & Integrity)
-- 1. Sets up ON DELETE SET NULL for admin fields (approved_by, changed_by)
--    so admin deletions do not fail due to audit logs or past approvals.
-- 2. Sets up ON DELETE CASCADE for sessions.session_type_id so session types
--    can be safely cleaned up without violating foreign key constraints.
-- ============================================================

-- 1. Program Audit Log
ALTER TABLE public.program_audit_log
  DROP CONSTRAINT IF EXISTS program_audit_log_changed_by_fkey,
  ADD CONSTRAINT program_audit_log_changed_by_fkey FOREIGN KEY (changed_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- 2. Mentor Profiles Approval
ALTER TABLE public.mentor_profiles
  DROP CONSTRAINT IF EXISTS mentor_profiles_approved_by_fkey,
  ADD CONSTRAINT mentor_profiles_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- 3. Sessions referencing Session Types
ALTER TABLE public.sessions
  DROP CONSTRAINT IF EXISTS sessions_session_type_id_fkey,
  ADD CONSTRAINT sessions_session_type_id_fkey FOREIGN KEY (session_type_id) REFERENCES public.session_types(id) ON DELETE CASCADE;
