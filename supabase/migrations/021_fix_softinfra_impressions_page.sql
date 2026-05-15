-- Add page column to softinfra_impressions and remove unique constraint to allow page-level tracking
alter table if exists public.softinfra_impressions add column if not exists page text;

-- Drop the old unique constraint that prevented multiple impressions from the same user
alter table if exists public.softinfra_impressions drop constraint if exists uq_ad_user;
