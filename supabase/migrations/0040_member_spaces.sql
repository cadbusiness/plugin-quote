-- Espace membres : mini-site devis côté client (comme la boutique, sans catalogue).
-- URL publique /m/[org]/[slug]. Login email + PIN. Tous les devis du contact.

create table if not exists public.member_spaces (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  slug text not null,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  theme jsonb not null default '{}'::jsonb,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, slug)
);

create index if not exists member_spaces_org_idx
  on public.member_spaces (organization_id, created_at desc);

create table if not exists public.member_space_pages (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  space_id uuid not null references public.member_spaces (id) on delete cascade,
  kind text not null check (kind in ('home', 'quotes', 'documents', 'custom')),
  slug text not null,
  title text not null,
  blocks jsonb not null default '[]'::jsonb,
  is_published boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (space_id, slug)
);

create index if not exists member_space_pages_space_idx
  on public.member_space_pages (space_id, sort_order);

create table if not exists public.member_space_resources (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  space_id uuid not null references public.member_spaces (id) on delete cascade,
  kind text not null check (kind in ('document', 'plugin', 'link')),
  title text not null,
  description text not null default '',
  href text not null default '',
  is_published boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists member_space_resources_space_idx
  on public.member_space_resources (space_id, sort_order);

create table if not exists public.member_space_sessions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  space_id uuid not null references public.member_spaces (id) on delete cascade,
  email text not null,
  token text not null unique,
  expires_at timestamptz not null,
  last_accessed timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists member_space_sessions_space_email_idx
  on public.member_space_sessions (space_id, email);

alter table public.member_spaces enable row level security;
alter table public.member_space_pages enable row level security;
alter table public.member_space_resources enable row level security;
alter table public.member_space_sessions enable row level security;

drop policy if exists member_spaces_member_select on public.member_spaces;
create policy member_spaces_member_select on public.member_spaces
  for select to authenticated
  using (private.is_org_member(organization_id));

drop policy if exists member_spaces_admin_write on public.member_spaces;
create policy member_spaces_admin_write on public.member_spaces
  for all to authenticated
  using (private.is_org_admin(organization_id))
  with check (private.is_org_admin(organization_id));

drop policy if exists member_space_pages_member_select on public.member_space_pages;
create policy member_space_pages_member_select on public.member_space_pages
  for select to authenticated
  using (private.is_org_member(organization_id));

drop policy if exists member_space_pages_admin_write on public.member_space_pages;
create policy member_space_pages_admin_write on public.member_space_pages
  for all to authenticated
  using (private.is_org_admin(organization_id))
  with check (private.is_org_admin(organization_id));

drop policy if exists member_space_resources_member_select on public.member_space_resources;
create policy member_space_resources_member_select on public.member_space_resources
  for select to authenticated
  using (private.is_org_member(organization_id));

drop policy if exists member_space_resources_admin_write on public.member_space_resources;
create policy member_space_resources_admin_write on public.member_space_resources
  for all to authenticated
  using (private.is_org_admin(organization_id))
  with check (private.is_org_admin(organization_id));

-- Sessions prospect : service role only (pas de policy authenticated / anon).

insert into public.product_updates (version, title, items, released_at)
values (
  '1.17.0',
  'Espace membres : un lien pour tous les devis',
  '[
    "Créez un espace membres comme une boutique : constructeur, documents, plugins, lien public.",
    "Après un devis, le client retrouve toutes ses demandes au même endroit (email + PIN).",
    "Ajoutez des documents et des liens (plugin WordPress, notices) visibles une fois connecté."
  ]'::jsonb,
  '2026-09-14'
)
on conflict (version) do nothing;
