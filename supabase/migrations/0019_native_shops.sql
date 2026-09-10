-- Boutique native QuoteBuilder : mini-site devis (pas un checkout).
-- Pages, menus, SEO. Le catalogue reste sur le funnel lié.
-- WooCommerce / Shopify restent des connexions catalogue (catalog_connections).

create table if not exists public.shops (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  configurator_id uuid references public.configurators (id) on delete set null,
  name text not null,
  slug text not null,
  sector text not null default 'custom',
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  theme jsonb not null default '{}'::jsonb,
  seo jsonb not null default '{}'::jsonb,
  legal jsonb not null default '{}'::jsonb,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, slug)
);

create index if not exists shops_org_idx
  on public.shops (organization_id, created_at desc);

create table if not exists public.shop_pages (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  shop_id uuid not null references public.shops (id) on delete cascade,
  kind text not null check (kind in ('home', 'catalog', 'legal', 'custom')),
  slug text not null,
  title text not null,
  seo jsonb not null default '{}'::jsonb,
  blocks jsonb not null default '[]'::jsonb,
  is_published boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (shop_id, slug)
);

create index if not exists shop_pages_shop_idx
  on public.shop_pages (shop_id, sort_order);

create table if not exists public.shop_nav_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  shop_id uuid not null references public.shops (id) on delete cascade,
  location text not null check (location in ('header', 'footer')),
  label text not null,
  href text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists shop_nav_items_shop_idx
  on public.shop_nav_items (shop_id, location, sort_order);

alter table public.shops enable row level security;
alter table public.shop_pages enable row level security;
alter table public.shop_nav_items enable row level security;

drop policy if exists shops_member_select on public.shops;
create policy shops_member_select on public.shops
  for select to authenticated
  using (private.is_org_member(organization_id));

drop policy if exists shops_admin_write on public.shops;
create policy shops_admin_write on public.shops
  for all to authenticated
  using (private.is_org_admin(organization_id))
  with check (private.is_org_admin(organization_id));

drop policy if exists shop_pages_member_select on public.shop_pages;
create policy shop_pages_member_select on public.shop_pages
  for select to authenticated
  using (private.is_org_member(organization_id));

drop policy if exists shop_pages_admin_write on public.shop_pages;
create policy shop_pages_admin_write on public.shop_pages
  for all to authenticated
  using (private.is_org_admin(organization_id))
  with check (private.is_org_admin(organization_id));

drop policy if exists shop_nav_items_member_select on public.shop_nav_items;
create policy shop_nav_items_member_select on public.shop_nav_items
  for select to authenticated
  using (private.is_org_member(organization_id));

drop policy if exists shop_nav_items_admin_write on public.shop_nav_items;
create policy shop_nav_items_admin_write on public.shop_nav_items
  for all to authenticated
  using (private.is_org_admin(organization_id))
  with check (private.is_org_admin(organization_id));
