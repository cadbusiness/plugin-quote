-- Releases du plugin WordPress (zip + info.json). Lecture publique ;
-- écriture via service role (script publish-wp-plugin.mjs).

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'wp-plugin',
  'wp-plugin',
  true,
  20971520,
  array['application/zip', 'application/json', 'text/plain', 'application/octet-stream']
)
on conflict (id) do nothing;

create policy wp_plugin_public_read on storage.objects
  for select
  using (bucket_id = 'wp-plugin');
