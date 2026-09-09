-- Acquisition : gclid (conversions Google Ads) + connexion Ads + spend campagnes.
-- Le pont, pas un gestionnaire de campagnes : mesurer le ROI devis → gagné.

-- ---------------------------------------------------------------------------
-- Click IDs Google Ads (gclid / gbraid / wbraid) pour l’upload de conversions
-- ---------------------------------------------------------------------------

alter table public.quote_sessions
  add column if not exists gclid text,
  add column if not exists gbraid text,
  add column if not exists wbraid text;

alter table public.quotes
  add column if not exists gclid text,
  add column if not exists gbraid text,
  add column if not exists wbraid text;

create index if not exists quote_sessions_gclid_idx
  on public.quote_sessions (organization_id, gclid)
  where gclid is not null;

create index if not exists quotes_campaign_idx
  on public.quotes (organization_id, utm_campaign);

create index if not exists quotes_configurator_created_idx
  on public.quotes (organization_id, configurator_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Connexion Google Ads (un compte Ads par organisation)
-- ---------------------------------------------------------------------------

create table if not exists public.ads_connections (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  provider text not null default 'google_ads' check (provider in ('google_ads')),
  customer_id text,
  customer_name text,
  credentials jsonb not null default '{}'::jsonb,
  credentials_hint text,
  settings jsonb not null default '{}'::jsonb,
  status text not null default 'pending' check (status in ('pending', 'active', 'error', 'disabled')),
  last_sync_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, provider)
);

create index if not exists ads_connections_org_idx
  on public.ads_connections (organization_id);

-- Spend / clics Google Ads, un snapshot par campagne et par jour
create table if not exists public.ads_campaign_stats (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  connection_id uuid not null references public.ads_connections (id) on delete cascade,
  campaign_id text not null,
  campaign_name text not null,
  date date not null,
  impressions int not null default 0,
  clicks int not null default 0,
  cost_micros bigint not null default 0,
  unique (connection_id, campaign_id, date)
);

create index if not exists ads_campaign_stats_org_date_idx
  on public.ads_campaign_stats (organization_id, date desc);

create table if not exists public.ads_conversion_uploads (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  quote_id uuid not null references public.quotes (id) on delete cascade,
  kind text not null check (kind in ('quote', 'won')),
  gclid text,
  status text not null default 'pending' check (status in ('pending', 'uploaded', 'skipped', 'error')),
  error text,
  uploaded_at timestamptz,
  created_at timestamptz not null default now(),
  unique (quote_id, kind)
);

create index if not exists ads_conversion_uploads_org_idx
  on public.ads_conversion_uploads (organization_id, created_at desc);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.ads_connections enable row level security;
alter table public.ads_campaign_stats enable row level security;
alter table public.ads_conversion_uploads enable row level security;

drop policy if exists ads_connections_select on public.ads_connections;
create policy ads_connections_select on public.ads_connections
  for select to authenticated
  using (private.is_org_member(organization_id));

drop policy if exists ads_connections_admin on public.ads_connections;
create policy ads_connections_admin on public.ads_connections
  for all to authenticated
  using (private.is_org_admin(organization_id))
  with check (private.is_org_admin(organization_id));

drop policy if exists ads_campaign_stats_select on public.ads_campaign_stats;
create policy ads_campaign_stats_select on public.ads_campaign_stats
  for select to authenticated
  using (private.is_org_member(organization_id));

drop policy if exists ads_campaign_stats_admin on public.ads_campaign_stats;
create policy ads_campaign_stats_admin on public.ads_campaign_stats
  for all to authenticated
  using (private.is_org_admin(organization_id))
  with check (private.is_org_admin(organization_id));

drop policy if exists ads_conversion_uploads_select on public.ads_conversion_uploads;
create policy ads_conversion_uploads_select on public.ads_conversion_uploads
  for select to authenticated
  using (private.is_org_member(organization_id));

drop policy if exists ads_conversion_uploads_admin on public.ads_conversion_uploads;
create policy ads_conversion_uploads_admin on public.ads_conversion_uploads
  for all to authenticated
  using (private.is_org_admin(organization_id))
  with check (private.is_org_admin(organization_id));
