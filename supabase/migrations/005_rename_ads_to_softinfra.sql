-- ============================================================
-- SQL MIGRATION: Rename "Ads" to "SoftInfra"
-- Purpose: Bypass ad-blockers by removing "ads" keywords.
-- ============================================================

-- 1. Rename Tables
alter table if exists public.ads rename to softinfra;
alter table if exists public.ad_impressions rename to softinfra_impressions;
alter table if exists public.click_log rename to softinfra_click_log;

-- 2. Rename Columns in softinfra_impressions and softinfra_click_log
alter table if exists public.softinfra_impressions rename column ad_id to softinfra_id;
alter table if exists public.softinfra_click_log rename column ad_id to softinfra_id;

-- 3. Rename site_config columns
alter table if exists public.site_config rename column ad_slot_positions to si_slot_positions;

-- 4. Update/Recreate RPCs
-- Drop old ones first
drop function if exists public.increment_impression(uuid);
drop function if exists public.increment_click(uuid);

-- New increment_impression
create or replace function public.increment_softinfra_impression(p_si_id uuid)
returns void as $$
begin
  update public.softinfra
  set impression_count = impression_count + 1
  where id = p_si_id;
end;
$$ language plpgsql security definer;

-- New increment_click
create or replace function public.increment_softinfra_click(p_si_id uuid)
returns void as $$
begin
  update public.softinfra
  set click_count = click_count + 1
  where id = p_si_id;
end;
$$ language plpgsql security definer;


-- 4. Update Triggers
-- Drop the trigger that used ad_id
drop trigger if exists after_ad_impression_insert on public.softinfra_impressions;
drop function if exists public.refresh_unique_view_count();

-- New refresh_unique_view_count
create or replace function public.refresh_si_unique_view_count()
returns trigger as $$
begin
  update public.softinfra
  set unique_view_count = (
    select count(*) from public.softinfra_impressions where softinfra_id = new.softinfra_id
  )
  where id = new.softinfra_id;
  return new;
end;
$$ language plpgsql;

create trigger after_si_impression_insert
  after insert on public.softinfra_impressions
  for each row execute procedure public.refresh_si_unique_view_count();


-- 5. Update RLS Policies for softinfra
alter table public.softinfra enable row level security;
alter table public.softinfra_impressions enable row level security;

-- (SoftInfra) Anon/Auth Read
drop policy if exists "softinfra_public_select" on public.softinfra;
create policy "softinfra_public_select"
  on public.softinfra for select
  to anon, authenticated
  using (
    is_active = true
    and (start_date is null or start_date <= current_date)
    and (end_date is null or end_date >= current_date)
  );

-- (SoftInfra) Admin Full Access (replaces old ads migration 004 policies)
drop policy if exists "softinfra_admin_all" on public.softinfra;
create policy "softinfra_admin_all"
  on public.softinfra as permissive
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- (SoftInfra Impressions) Auth Insert
drop policy if exists "si_impressions_insert_own" on public.softinfra_impressions;
create policy "si_impressions_insert_own"
  on public.softinfra_impressions for insert
  to authenticated
  with check (user_id = auth.uid());


-- 6. Add Missing settings permissions (Fixing Settings Save Error)
-- Allow admins to INSERT into site_config (Needed for UPSERT)
drop policy if exists "site_config_admin_insert" on public.site_config;
create policy "site_config_admin_insert"
  on public.site_config for insert
  to authenticated
  with check (public.is_admin());

-- Allow admins to INSERT into profiles
drop policy if exists "profiles_admin_insert" on public.profiles;
create policy "profiles_admin_insert"
  on public.profiles for insert
  to authenticated
  with check (public.is_admin());
