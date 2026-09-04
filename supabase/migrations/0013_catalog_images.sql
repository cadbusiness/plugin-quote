insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'catalog-images',
  'catalog-images',
  true,
  8388608,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;

create policy catalog_images_public_read on storage.objects
  for select
  using (bucket_id = 'catalog-images');

create policy catalog_images_admin_write on storage.objects
  for all to authenticated
  using (
    bucket_id = 'catalog-images'
    and private.is_org_admin((storage.foldername(name))[1]::uuid)
  )
  with check (
    bucket_id = 'catalog-images'
    and private.is_org_admin((storage.foldername(name))[1]::uuid)
  );
