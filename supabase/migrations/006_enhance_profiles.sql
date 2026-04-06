-- ============================================================
-- SQL MIGRATION: Enhance Profiles & Storage
-- Adds startup-related fields to profiles and sets up avatar storage.
-- ============================================================

-- 1. Add new columns to the profiles table
alter table public.profiles
  add column if not exists phone           text,
  add column if not exists startup_name    text,
  add column if not exists startup_website text,
  add column if not exists startup_email   text;

-- 2. Create Storage Bucket for Avatars
-- In Supabase, buckets are managed via the storage schema.
-- Note: This requires the storage extension to be enabled (default in Supabase).
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- 3. Set up Storage RLS Policies
-- Users can upload/update/delete their own avatar file.
-- Everyone can read (public bucket).

-- Policy: Allow public read access to all avatars
drop policy if exists "Public Access" on storage.objects;
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'avatars' );

-- Policy: Allow authenticated users to upload their own avatar
-- We expect the file path to be named after the user's ID: auth.uid() + filename
drop policy if exists "Users can upload their own avatar" on storage.objects;
create policy "Users can upload their own avatar"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'avatars' 
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy: Allow users to update their own avatar
drop policy if exists "Users can update their own avatar" on storage.objects;
create policy "Users can update their own avatar"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'avatars' 
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy: Allow users to delete their own avatar
drop policy if exists "Users can delete their own avatar" on storage.objects;
create policy "Users can delete their own avatar"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'avatars' 
    and (storage.foldername(name))[1] = auth.uid()::text
  );
