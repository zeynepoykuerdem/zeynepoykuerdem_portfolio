-- Stop visitors from listing every file in the public "media" bucket.
-- The bucket stays public, so image URLs from getPublicUrl() keep working without a select policy.
-- Admins keep select, which Supabase Storage needs to list, remove, or overwrite files.
-- Run once in Supabase → SQL Editor. Safe to run more than once.

drop policy if exists "media is public" on storage.objects;

drop policy if exists "admins read media" on storage.objects;
create policy "admins read media" on storage.objects
  for select using (bucket_id = 'media' and public.is_admin());
