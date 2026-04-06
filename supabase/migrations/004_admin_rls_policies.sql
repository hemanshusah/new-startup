-- ============================================================
-- SQL MIGRATION: Admin RLS Policies
-- Grants admin users (profiles.role = 'admin') full write access
-- while maintaining restricted read-only access for others.
-- ============================================================

-- Function: is_admin()
-- Checks if the current authenticated user has the 'admin' role.
create or replace function public.is_admin()
returns boolean as $$
begin
  return (
    select (role = 'admin')
    from public.profiles
    where id = auth.uid()
  );
end;
$$ language plpgsql security definer;


-- ============================================================
-- 1. PUBLIC.PROGRAMS
-- ============================================================

-- Allow admins to insert, update, delete anything
drop policy if exists "programs_admin_all" on public.programs;
create policy "programs_admin_all"
  on public.programs as permissive
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- (Optional) Update anon/auth select to ensure admins can see everything too
drop policy if exists "programs_admin_select" on public.programs;
create policy "programs_admin_select"
  on public.programs for select
  to authenticated
  using (public.is_admin());


-- ============================================================
-- 2. PUBLIC.ADS
-- ============================================================

-- Allow admins to insert, update, delete anything
drop policy if exists "ads_admin_all" on public.ads;
create policy "ads_admin_all"
  on public.ads as permissive
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Allow admins to see all ads regardless of campaign dates/status
drop policy if exists "ads_admin_select" on public.ads;
create policy "ads_admin_select"
  on public.ads for select
  to authenticated
  using (public.is_admin());


-- ============================================================
-- 3. PUBLIC.PROFILES
-- ============================================================

-- Allow admins full control over all profiles (manage roles, etc.)
drop policy if exists "profiles_admin_all" on public.profiles;
create policy "profiles_admin_all"
  on public.profiles as permissive
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Ensure admins can read all profiles
drop policy if exists "profiles_admin_select" on public.profiles;
create policy "profiles_admin_select"
  on public.profiles for select
  to authenticated
  using (public.is_admin());


-- ============================================================
-- 4. PUBLIC.SITE_CONFIG
-- ============================================================

-- Allow admins to update site configuration
drop policy if exists "site_config_admin_update" on public.site_config;
create policy "site_config_admin_update"
  on public.site_config for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());


-- ============================================================
-- 5. ADMIN PROMOTION (Helper)
-- SQL to manually promote a user to admin:
-- UPDATE public.profiles SET role = 'admin' WHERE email = '...';
-- ============================================================
