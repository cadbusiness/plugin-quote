-- Connecteurs catalogue : WooCommerce + Shopify
-- Produits enrichis (images, variantes, provenance), connexions chiffrées,
-- journal de synchronisation et appairage du plugin WordPress.

-- ---------------------------------------------------------------------------
-- Connexions boutique
-- ---------------------------------------------------------------------------

create table if not exists public.catalog_connections (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  configurator_id uuid references public.configurators (id) on delete set null,
  provider text not null check (provider in ('woocommerce', 'shopify')),
  label text not null,
  store_domain text not null,
  credentials jsonb not null default '{}'::jsonb,
  credentials_hint text,
  settings jsonb not null default '{}'::jsonb,
  webhook_secret text,
  status text not null default 'active' check (status in ('active', 'error', 'disabled')),
  currency text not null default 'EUR',
  last_sync_at timestamptz,
  last_error text,
  product_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, provider, store_domain)
);

create index if not exists catalog_connections_org_idx
  on public.catalog_connections (organization_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Produits : provenance externe, médias, variantes
-- ---------------------------------------------------------------------------

alter table public.products
  add column if not exists source text not null default 'manual',
  add column if not exists connection_id uuid references public.catalog_connections (id) on delete set null,
  add column if not exists external_id text,
  add column if not exists external_url text,
  add column if not exists external_updated_at timestamptz,
  add column if not exists content_hash text,
  add column if not exists synced_at timestamptz,
  add column if not exists images jsonb not null default '[]'::jsonb,
  add column if not exists variants jsonb not null default '[]'::jsonb,
  add column if not exists stock_status text,
  -- Distingue « retiré de la boutique » de « désactivé à la main » :
  -- seuls les produits archivés par la sync sont réactivés s'ils réapparaissent.
  add column if not exists archived_by_sync boolean not null default false,
  add column if not exists updated_at timestamptz not null default now();

-- Arbitre du `upsert` de synchronisation. Les produits manuels ont
-- (connection_id, external_id) = (null, null) : NULLS DISTINCT les laisse passer.
create unique index if not exists products_connection_external_key
  on public.products (connection_id, external_id);

create index if not exists products_org_source_idx
  on public.products (organization_id, source);

-- ---------------------------------------------------------------------------
-- Journal des synchronisations
-- ---------------------------------------------------------------------------

create table if not exists public.catalog_sync_runs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  connection_id uuid not null references public.catalog_connections (id) on delete cascade,
  trigger text not null default 'manual' check (trigger in ('manual', 'cron', 'webhook', 'pairing')),
  status text not null default 'running' check (status in ('running', 'done', 'error')),
  created_count int not null default 0,
  updated_count int not null default 0,
  skipped_count int not null default 0,
  archived_count int not null default 0,
  failed_count int not null default 0,
  error text,
  started_at timestamptz not null default now(),
  finished_at timestamptz
);

create index if not exists catalog_sync_runs_connection_idx
  on public.catalog_sync_runs (connection_id, started_at desc);

-- ---------------------------------------------------------------------------
-- Appairage du plugin WordPress (le site pousse ses clés lui-même)
-- ---------------------------------------------------------------------------

create table if not exists public.catalog_pairings (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  configurator_id uuid references public.configurators (id) on delete set null,
  provider text not null default 'woocommerce' check (provider in ('woocommerce', 'shopify')),
  code text not null unique,
  status text not null default 'pending' check (status in ('pending', 'used', 'expired')),
  connection_id uuid references public.catalog_connections (id) on delete set null,
  paired_site text,
  expires_at timestamptz not null default (now() + interval '30 minutes'),
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists catalog_pairings_org_idx
  on public.catalog_pairings (organization_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Reprise de l'ancienne connexion WooCommerce
-- ---------------------------------------------------------------------------

insert into public.catalog_connections (
  organization_id, configurator_id, provider, label, store_domain,
  credentials, credentials_hint, settings, last_sync_at
)
select
  w.organization_id,
  (
    select c.id from public.configurators c
    where c.organization_id = w.organization_id
    order by c.created_at
    limit 1
  ),
  'woocommerce',
  coalesce(nullif(regexp_replace(w.site_url, '^https?://', ''), ''), 'WooCommerce'),
  w.site_url,
  jsonb_build_object('consumer_key', w.consumer_key, 'consumer_secret', w.consumer_secret),
  right(w.consumer_key, 4),
  '{}'::jsonb,
  w.last_sync
from public.woo_connections w
on conflict (organization_id, provider, store_domain) do nothing;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.catalog_connections enable row level security;
alter table public.catalog_sync_runs enable row level security;
alter table public.catalog_pairings enable row level security;

drop policy if exists catalog_connections_admin on public.catalog_connections;
create policy catalog_connections_admin on public.catalog_connections
  for all to authenticated
  using (private.is_org_admin(organization_id))
  with check (private.is_org_admin(organization_id));

drop policy if exists catalog_sync_runs_member on public.catalog_sync_runs;
create policy catalog_sync_runs_member on public.catalog_sync_runs
  for all to authenticated
  using (private.is_org_member(organization_id))
  with check (private.is_org_admin(organization_id));

drop policy if exists catalog_pairings_admin on public.catalog_pairings;
create policy catalog_pairings_admin on public.catalog_pairings
  for all to authenticated
  using (private.is_org_admin(organization_id))
  with check (private.is_org_admin(organization_id));

-- Sources d'import connues côté historique catalogue
alter table public.product_imports drop constraint if exists product_imports_source_check;
alter table public.product_imports
  add constraint product_imports_source_check check (source in ('csv', 'woocommerce', 'shopify', 'manual'));
