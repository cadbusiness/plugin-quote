-- In-app product updates (changelog) for dashboard users.
-- Global notes (not org-scoped). Last-seen is per auth user.
--
-- Add a new version (service role / SQL editor / later migration):
--   insert into public.product_updates (version, title, items, released_at)
--   values (
--     '1.9.0',
--     'Titre court côté utilisateur',
--     '["Puce 1.", "Puce 2."]'::jsonb,
--     '2026-09-20'
--   );
-- See docs/mises-a-jour.md.

create table public.product_updates (
  id uuid primary key default gen_random_uuid(),
  version text not null unique,
  title text not null,
  items jsonb not null default '[]'::jsonb,
  released_at date,
  created_at timestamptz not null default now(),
  constraint product_updates_version_semver
    check (version ~ '^[0-9]+\.[0-9]+\.[0-9]+$'),
  constraint product_updates_items_array
    check (jsonb_typeof(items) = 'array')
);

create table public.product_update_reads (
  user_id uuid primary key references auth.users (id) on delete cascade,
  last_seen_version text not null,
  seen_at timestamptz not null default now(),
  constraint product_update_reads_version_semver
    check (last_seen_version ~ '^[0-9]+\.[0-9]+\.[0-9]+$')
);

create index product_updates_released_idx
  on public.product_updates (released_at desc nulls last, created_at desc);

alter table public.product_updates enable row level security;
alter table public.product_update_reads enable row level security;

-- Notes are product-wide: any signed-in member can read. Writes stay service_role.
create policy product_updates_select on public.product_updates
  for select to authenticated
  using (true);

create policy product_update_reads_select on public.product_update_reads
  for select to authenticated
  using (user_id = auth.uid());

create policy product_update_reads_insert on public.product_update_reads
  for insert to authenticated
  with check (user_id = auth.uid());

create policy product_update_reads_update on public.product_update_reads
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

insert into public.product_updates (version, title, items, released_at)
values
  (
    '1.8.0',
    'Confirmation et brief T+0',
    '[
      "Les templates confirmation prospect et brief commercial sont créés pour chaque espace, y compris les existants.",
      "Le parcours demande envoie l’email T+0 même si ces templates manquaient."
    ]'::jsonb,
    '2026-09-11'
  ),
  (
    '1.7.0',
    'Automatisations plus fiables',
    '[
      "Un changement de statut peut relancer le parcours sur la même demande.",
      "L’abandon tient compte des heures, pas seulement des minutes.",
      "Un devis gagné ou perdu arrête le parcours."
    ]'::jsonb,
    '2026-09-10'
  );
