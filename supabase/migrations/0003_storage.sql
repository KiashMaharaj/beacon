-- Beacon - Storage bucket for pet photos & RLS on objects.

insert into storage.buckets (id, name, public)
values ('pet-photos', 'pet-photos', true)
on conflict (id) do nothing;

-- Public read (photos appear in the community feed).
drop policy if exists "pet_photos_public_read" on storage.objects;
create policy "pet_photos_public_read" on storage.objects
  for select using (bucket_id = 'pet-photos');

-- Authenticated users may upload into their own folder: <uid>/<file>.
drop policy if exists "pet_photos_insert_own" on storage.objects;
create policy "pet_photos_insert_own" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'pet-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "pet_photos_delete_own" on storage.objects;
create policy "pet_photos_delete_own" on storage.objects
  for delete to authenticated using (
    bucket_id = 'pet-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
