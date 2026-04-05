-- ============================================================
-- GRANTSINDIA — Initial Database Schema
-- Run this entire file in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ============================================================
-- TABLES
-- ============================================================

-- Table: programs
-- Core table — every grant, incubation, accelerator, contest, or funding opportunity is one row.
create table if not exists public.programs (
  id               uuid        primary key default gen_random_uuid(),
  slug             text        unique not null,
  title            text        not null,
  organisation     text        not null,
  type             text        not null check (type in ('grant', 'incubation', 'accelerator', 'contest', 'funding', 'seed')),
  status           text        not null default 'active' check (status in ('active', 'closed', 'upcoming')),
  deadline         date        not null,
  amount_min       bigint,
  amount_max       bigint,
  amount_display   text,
  equity           text,
  mode             text,
  stage            text,
  duration         text,
  cohort_size      text,
  description_short text       not null,
  about            text,
  what_you_get     text[],
  eligibility      text[],
  how_to_apply     text,
  apply_url        text,
  sectors          text[],
  state            text,
  is_india         boolean     not null default true,
  is_featured      boolean     default false,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  published        boolean     not null default false
);

-- Table: ads
-- All advertisements — fetched dynamically according to placement rules.
create table if not exists public.ads (
  id               uuid        primary key default gen_random_uuid(),
  advertiser       text        not null,
  headline         text        not null,
  subtext          text        not null,
  cta_text         text        not null,
  cta_url          text        not null,
  icon_emoji       text,
  image_url        text,
  format           text        not null check (format in ('card-sm', 'card-dark', 'card-wide', 'inline', 'sidebar', 'newsletter')),
  placement        text[]      not null,
  slot_index       int,
  priority         int         not null default 50,
  is_active        boolean     not null default true,
  start_date       date,
  end_date         date,
  click_count      int         default 0,
  impression_count int         default 0,
  unique_view_count int        default 0,
  created_at       timestamptz not null default now()
);

-- Table: ad_impressions
-- Tracks which authenticated user has seen which ad.
-- One row per (user, ad) pair — duplicates blocked by unique constraint.
create table if not exists public.ad_impressions (
  id         uuid        primary key default gen_random_uuid(),
  ad_id      uuid        not null references public.ads(id) on delete cascade,
  user_id    uuid        not null references auth.users(id) on delete cascade,
  first_seen timestamptz not null default now(),
  constraint uq_ad_user unique (ad_id, user_id)
);

-- Table: profiles
-- Auto-created when a user signs up via the on_auth_user_created trigger.
create table if not exists public.profiles (
  id         uuid        primary key references auth.users(id) on delete cascade,
  email      text,
  full_name  text,
  avatar_url text,
  role       text        not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

-- Table: program_views
-- Tracks which users viewed which program detail pages.
-- Records every visit including repeat visits (no unique constraint).
create table if not exists public.program_views (
  id         uuid        primary key default gen_random_uuid(),
  program_id uuid        not null references public.programs(id) on delete cascade,
  user_id    uuid        not null references auth.users(id) on delete cascade,
  viewed_at  timestamptz not null default now()
);

-- Table: program_audit_log
-- Append-only log of every create, update, publish, or delete action on programs.
-- program_id is NOT a foreign key — it intentionally survives program deletion.
create table if not exists public.program_audit_log (
  id            uuid        primary key default gen_random_uuid(),
  program_id    uuid,       -- no FK: survives deletion
  program_title text,
  action        text        check (action in ('created', 'updated', 'published', 'unpublished', 'deleted')),
  changed_by    uuid        references auth.users(id),
  changed_at    timestamptz not null default now(),
  diff          jsonb
);

-- Table: click_log
-- Time-windowed ad click data for 7-day / 30-day CTR queries.
-- ads.click_count is a running total; this enables windowed analytics.
create table if not exists public.click_log (
  id         uuid        primary key default gen_random_uuid(),
  ad_id      uuid        not null references public.ads(id) on delete cascade,
  user_id    uuid,       -- nullable: anonymous clicks are also logged
  clicked_at timestamptz not null default now(),
  page       text
);

-- Table: site_config
-- Single-row table for site-wide configuration managed from /admin/settings.
create table if not exists public.site_config (
  id                   uuid     primary key default gen_random_uuid(),
  site_name            text     default 'GrantsIndia',
  default_og_image_url text,
  programs_per_page    integer  default 12,
  ad_slot_positions    jsonb    default '[6, 14, 20]'::jsonb,
  maintenance_mode     boolean  default false
);

-- Seed one default site_config row
insert into public.site_config (site_name, programs_per_page, ad_slot_positions, maintenance_mode)
values ('GrantsIndia', 12, '[6, 14, 20]'::jsonb, false)
on conflict do nothing;


-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Trigger 1: Auto-create a profile row when a user signs up.
-- Runs AFTER INSERT on auth.users.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- Trigger 2: Auto-update programs.updated_at whenever a program row is updated.
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists programs_updated_at on public.programs;
create trigger programs_updated_at
  before update on public.programs
  for each row execute procedure public.update_updated_at();


-- Trigger 3: After each new ad impression, refresh ads.unique_view_count.
-- This keeps unique_view_count in sync without a separate scheduled job.
create or replace function public.refresh_unique_view_count()
returns trigger as $$
begin
  update public.ads
  set unique_view_count = (
    select count(*) from public.ad_impressions where ad_id = new.ad_id
  )
  where id = new.ad_id;
  return new;
end;
$$ language plpgsql;

drop trigger if exists after_ad_impression_insert on public.ad_impressions;
create trigger after_ad_impression_insert
  after insert on public.ad_impressions
  for each row execute procedure public.refresh_unique_view_count();


-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all public tables
alter table public.programs         enable row level security;
alter table public.ads              enable row level security;
alter table public.ad_impressions   enable row level security;
alter table public.profiles         enable row level security;
alter table public.program_views    enable row level security;
alter table public.program_audit_log enable row level security;
alter table public.click_log        enable row level security;
alter table public.site_config      enable row level security;


-- programs: anon users can read only published + active rows
-- (service_role bypasses RLS by default in Supabase)
drop policy if exists "programs_anon_select" on public.programs;
create policy "programs_anon_select"
  on public.programs for select
  to anon
  using (published = true and status = 'active');

-- programs: authenticated users can read all published rows
-- (active + closed + upcoming — needed for detail page on closed programs)
drop policy if exists "programs_authed_select" on public.programs;
create policy "programs_authed_select"
  on public.programs for select
  to authenticated
  using (published = true);


-- ads: anon + authenticated can read active ads within campaign dates
drop policy if exists "ads_public_select" on public.ads;
create policy "ads_public_select"
  on public.ads for select
  to anon, authenticated
  using (
    is_active = true
    and (start_date is null or start_date <= current_date)
    and (end_date is null or end_date >= current_date)
  );


-- profiles: users can read their own profile row only
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using (id = auth.uid());

-- profiles: users can update their own profile row only
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (id = auth.uid());


-- ad_impressions: authenticated users can insert their own impression records
drop policy if exists "ad_impressions_insert_own" on public.ad_impressions;
create policy "ad_impressions_insert_own"
  on public.ad_impressions for insert
  to authenticated
  with check (user_id = auth.uid());

-- ad_impressions: authenticated users can read their own records
drop policy if exists "ad_impressions_select_own" on public.ad_impressions;
create policy "ad_impressions_select_own"
  on public.ad_impressions for select
  to authenticated
  using (user_id = auth.uid());


-- program_views: authenticated users can insert view records
drop policy if exists "program_views_insert" on public.program_views;
create policy "program_views_insert"
  on public.program_views for insert
  to authenticated
  with check (user_id = auth.uid());

-- program_views: authenticated users can read their own view records
drop policy if exists "program_views_select_own" on public.program_views;
create policy "program_views_select_own"
  on public.program_views for select
  to authenticated
  using (user_id = auth.uid());


-- click_log: anyone (anon + authenticated) can insert click records
drop policy if exists "click_log_insert" on public.click_log;
create policy "click_log_insert"
  on public.click_log for insert
  to anon, authenticated
  with check (true);


-- site_config: anyone can read (used by public site for config)
drop policy if exists "site_config_select" on public.site_config;
create policy "site_config_select"
  on public.site_config for select
  to anon, authenticated
  using (true);


-- program_audit_log: authenticated users can read (admin panel reads this)
drop policy if exists "audit_log_select" on public.program_audit_log;
create policy "audit_log_select"
  on public.program_audit_log for select
  to authenticated
  using (true);


-- ============================================================
-- RPC HELPER FUNCTION: increment_impression
-- Used by server-side ad tracking to bump impression_count.
-- ============================================================
create or replace function public.increment_impression(p_ad_id uuid)
returns void as $$
begin
  update public.ads
  set impression_count = impression_count + 1
  where id = p_ad_id;
end;
$$ language plpgsql security definer;
