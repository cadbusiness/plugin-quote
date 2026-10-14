-- member-docs was created at runtime with public = true and served via getPublicUrl.
-- Keep the bucket private. The app stores the object path and redirects to a
-- short-lived signed URL after a member session or staff check.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'member-docs',
  'member-docs',
  false,
  12582912,
  array[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
on conflict (id) do update
set public = false;

update storage.buckets
set public = false
where id = 'member-docs';
