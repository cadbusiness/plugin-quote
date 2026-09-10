-- QuoteBuilder: pending migrations 0013 → 0020
-- Project: spgskgtycqxjziwjpjol
-- Generated: 2026-09-10T02:25:09Z
-- Safe to re-run where migrations use IF NOT EXISTS / OR REPLACE


-- ============================================================================
-- BEGIN supabase/migrations/0013_catalog_images.sql
-- ============================================================================
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

-- END supabase/migrations/0013_catalog_images.sql

-- ============================================================================
-- BEGIN supabase/migrations/0014_comm_channels.sql
-- ============================================================================
-- Canaux de communication (boîtes mail, staff, réseaux) + email marketing + segments

alter table public.quote_activities drop constraint if exists quote_activities_type_check;
alter table public.quote_activities
  add constraint quote_activities_type_check check (type in (
    'submitted',
    'status_changed',
    'assigned',
    'note_added',
    'email_sent',
    'message_sent',
    'call_logged',
    'campaign_sent'
  ));

-- ---------------------------------------------------------------------------
-- Boîtes et réseaux
-- ---------------------------------------------------------------------------

create table public.comm_channels (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid references auth.users (id) on delete set null,
  provider text not null check (provider in (
    'gmail', 'outlook', 'imap', 'instagram', 'facebook', 'whatsapp', 'messenger'
  )),
  scope text not null default 'org' check (scope in ('org', 'staff')),
  label text not null,
  address text not null,
  status text not null default 'pending' check (status in ('connected', 'pending', 'error', 'coming_soon')),
  credentials jsonb not null default '{}'::jsonb,
  credentials_hint text,
  settings jsonb not null default '{}'::jsonb,
  inbound_token text not null unique default encode(gen_random_bytes(24), 'hex'),
  last_sync_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index comm_channels_address_uidx
  on public.comm_channels (
    organization_id,
    provider,
    lower(address),
    coalesce(user_id, '00000000-0000-0000-0000-000000000000'::uuid)
  );

create index comm_channels_org_idx on public.comm_channels (organization_id, created_at desc);
create index comm_channels_user_idx on public.comm_channels (user_id) where user_id is not null;

create table public.comm_messages (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  channel_id uuid not null references public.comm_channels (id) on delete cascade,
  quote_id uuid references public.quotes (id) on delete set null,
  direction text not null check (direction in ('inbound', 'outbound')),
  from_address text not null,
  from_name text,
  to_address text,
  subject text,
  body_text text,
  body_html text,
  external_id text,
  received_at timestamptz not null default now(),
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create unique index comm_messages_external_uidx
  on public.comm_messages (channel_id, external_id)
  where external_id is not null;

create index comm_messages_channel_idx on public.comm_messages (channel_id, received_at desc);
create index comm_messages_quote_idx on public.comm_messages (quote_id, received_at desc)
  where quote_id is not null;
create index comm_messages_unread_idx
  on public.comm_messages (organization_id, received_at desc)
  where read_at is null and direction = 'inbound';

-- ---------------------------------------------------------------------------
-- Segments commerciaux
-- ---------------------------------------------------------------------------

create table public.contact_segments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  description text,
  rules jsonb not null default '{"all":[]}'::jsonb,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index contact_segments_org_idx on public.contact_segments (organization_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Campagnes email
-- ---------------------------------------------------------------------------

create table public.email_campaigns (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  subject text not null default '',
  preview_text text,
  design jsonb not null default '{"blocks":[]}'::jsonb,
  html text,
  segment_id uuid references public.contact_segments (id) on delete set null,
  channel_id uuid references public.comm_channels (id) on delete set null,
  send_mode text not null default 'personal' check (send_mode in ('personal', 'group')),
  status text not null default 'draft' check (status in ('draft', 'sending', 'sent', 'scheduled')),
  scheduled_at timestamptz,
  sent_at timestamptz,
  sent_count int not null default 0,
  skip_recent_days int not null default 30,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index email_campaigns_org_idx on public.email_campaigns (organization_id, created_at desc);

create table public.email_campaign_sends (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  campaign_id uuid not null references public.email_campaigns (id) on delete cascade,
  quote_id uuid references public.quotes (id) on delete set null,
  contact_email text not null,
  contact_name text,
  status text not null default 'queued' check (status in ('queued', 'sent', 'skipped', 'failed')),
  skip_reason text,
  sent_at timestamptz,
  opened_at timestamptz,
  created_at timestamptz not null default now()
);

create index email_campaign_sends_campaign_idx
  on public.email_campaign_sends (campaign_id, status);
create index email_campaign_sends_email_idx
  on public.email_campaign_sends (organization_id, lower(contact_email), sent_at desc);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.comm_channels enable row level security;
alter table public.comm_messages enable row level security;
alter table public.contact_segments enable row level security;
alter table public.email_campaigns enable row level security;
alter table public.email_campaign_sends enable row level security;

create or replace function private.can_see_channel(org_id uuid, owner_id uuid, scope text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select private.is_org_member(org_id)
    and (
      scope = 'org'
      or owner_id = auth.uid()
      or private.is_org_admin(org_id)
    );
$$;

revoke all on function private.can_see_channel(uuid, uuid, text) from public;
grant execute on function private.can_see_channel(uuid, uuid, text) to authenticated;

create policy comm_channels_select on public.comm_channels
  for select to authenticated
  using (private.can_see_channel(organization_id, user_id, scope));

create policy comm_channels_insert on public.comm_channels
  for insert to authenticated
  with check (
    private.is_org_member(organization_id)
    and (
      (scope = 'org' and private.is_org_admin(organization_id) and user_id is null)
      or (scope = 'staff' and user_id = auth.uid())
    )
  );

create policy comm_channels_update on public.comm_channels
  for update to authenticated
  using (private.can_see_channel(organization_id, user_id, scope))
  with check (private.can_see_channel(organization_id, user_id, scope));

create policy comm_channels_delete on public.comm_channels
  for delete to authenticated
  using (
    (scope = 'org' and private.is_org_admin(organization_id))
    or (scope = 'staff' and user_id = auth.uid())
    or private.is_org_admin(organization_id)
  );

create policy comm_messages_select on public.comm_messages
  for select to authenticated
  using (
    private.is_org_member(organization_id)
    and exists (
      select 1 from public.comm_channels c
      where c.id = channel_id
        and private.can_see_channel(c.organization_id, c.user_id, c.scope)
    )
  );

create policy comm_messages_write on public.comm_messages
  for all to authenticated
  using (private.is_org_member(organization_id))
  with check (private.is_org_member(organization_id));

create policy contact_segments_member on public.contact_segments
  for all to authenticated
  using (private.is_org_member(organization_id))
  with check (private.is_org_member(organization_id));

create policy email_campaigns_member on public.email_campaigns
  for all to authenticated
  using (private.is_org_member(organization_id))
  with check (private.is_org_member(organization_id));

create policy email_campaign_sends_member on public.email_campaign_sends
  for all to authenticated
  using (private.is_org_member(organization_id))
  with check (private.is_org_member(organization_id));

-- END supabase/migrations/0014_comm_channels.sql

-- ============================================================================
-- BEGIN supabase/migrations/0015_ads_acquisition.sql
-- ============================================================================
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

-- END supabase/migrations/0015_ads_acquisition.sql

-- ============================================================================
-- BEGIN supabase/migrations/0016_catalog_sync_lock.sql
-- ============================================================================
-- Verrou de synchro : une fiche retouchée dans QuoteBuilder
-- n’est plus écrasée par WooCommerce / Shopify.

alter table public.products
  add column if not exists sync_lock boolean not null default false;

create index if not exists products_org_name_idx
  on public.products (organization_id, name);

-- END supabase/migrations/0016_catalog_sync_lock.sql

-- ============================================================================
-- BEGIN supabase/migrations/0017_quote_collaborators.sql
-- ============================================================================
-- Devis collaboratif : multi-décideurs (DF, technique, acheteur) sur l'espace prospect

alter table public.quotes
  add column if not exists validation_status text not null default 'none'
    check (validation_status in ('none', 'pending', 'partial', 'approved', 'changes_requested')),
  add column if not exists validation_approved_count int not null default 0,
  add column if not exists validation_total_count int not null default 0;

create table if not exists public.quote_collaborators (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  quote_id uuid not null references public.quotes (id) on delete cascade,
  email text not null,
  name text not null,
  role text not null default 'finance'
    check (role in ('finance', 'technical', 'buyer', 'other')),
  token text not null unique,
  status text not null default 'pending'
    check (status in ('pending', 'viewed', 'approved', 'changes_requested')),
  budget_max numeric,
  comment text,
  invited_by text not null default 'prospect'
    check (invited_by in ('prospect', 'sales')),
  invited_by_user_id uuid references auth.users (id) on delete set null,
  decided_at timestamptz,
  last_accessed timestamptz,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  unique (quote_id, email)
);

create index if not exists quote_collaborators_quote_idx
  on public.quote_collaborators (quote_id, created_at);
create index if not exists quote_collaborators_org_idx
  on public.quote_collaborators (organization_id, status);
create index if not exists quotes_validation_status_idx
  on public.quotes (organization_id, validation_status);

alter table public.quote_activities drop constraint if exists quote_activities_type_check;
alter table public.quote_activities
  add constraint quote_activities_type_check check (type in (
    'submitted',
    'status_changed',
    'assigned',
    'note_added',
    'email_sent',
    'message_sent',
    'call_logged',
    'campaign_sent',
    'collaborator_invited',
    'collaborator_approved',
    'collaborator_changes_requested',
    'validation_complete'
  ));

alter table public.quote_collaborators enable row level security;

create policy quote_collaborators_member on public.quote_collaborators
  for all to authenticated
  using (private.is_org_member(organization_id))
  with check (private.is_org_member(organization_id));

-- END supabase/migrations/0017_quote_collaborators.sql

-- ============================================================================
-- BEGIN supabase/migrations/0018_wp_plugin_bucket.sql
-- ============================================================================
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

-- END supabase/migrations/0018_wp_plugin_bucket.sql

-- ============================================================================
-- BEGIN supabase/migrations/0019_api_keys.sql
-- ============================================================================
-- Clés API org pour MCP / intégrations externes (Bearer qb_live_…)

create table if not exists public.api_keys (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  key_prefix text not null,
  key_hash text not null unique,
  created_by uuid references auth.users (id) on delete set null,
  last_used_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists api_keys_org_idx
  on public.api_keys (organization_id, created_at desc);

create index if not exists api_keys_prefix_idx
  on public.api_keys (key_prefix)
  where revoked_at is null;

alter table public.api_keys enable row level security;

create policy api_keys_select on public.api_keys
  for select using (private.is_org_admin(organization_id));

create policy api_keys_insert on public.api_keys
  for insert with check (private.is_org_admin(organization_id));

create policy api_keys_update on public.api_keys
  for update
  using (private.is_org_admin(organization_id))
  with check (private.is_org_admin(organization_id));

-- Relance T+30 j (template MCP reactivation_30d)
alter table public.email_templates drop constraint if exists email_templates_kind_check;
alter table public.email_templates
  add constraint email_templates_kind_check check (kind in (
    'prospect_confirm',
    'sales_brief',
    'sales_unprocessed',
    'prospect_reassure',
    'prospect_followup',
    'session_resume',
    'session_resume_late',
    'prospect_photo',
    'prospect_reactivation'
  ));

insert into public.email_templates (organization_id, kind, subject, body)
select
  o.id,
  'prospect_reactivation',
  'On reprend votre projet ?',
  'Bonjour {{contact_name}}, cela fait un moment. Votre projet est-il toujours d’actualité ? Répondez ou reprenez ici : {{suivi_url}}'
from public.organizations o
where not exists (
  select 1
  from public.email_templates t
  where t.organization_id = o.id
    and t.kind = 'prospect_reactivation'
);

-- END supabase/migrations/0019_api_keys.sql

-- ============================================================================
-- BEGIN supabase/migrations/0020_security_gdpr_baseline.sql
-- ============================================================================
-- Security + GDPR baseline: memberships RLS, invite accept, public catalog scope,
-- org directory lock-down, marketing consent on quotes.

-- ---------------------------------------------------------------------------
-- Quotes: marketing consent (opt-in)
-- ---------------------------------------------------------------------------
alter table public.quotes
  add column if not exists consent_marketing boolean not null default false;

create index if not exists quotes_org_consent_marketing_idx
  on public.quotes (organization_id)
  where consent_marketing = true;

-- ---------------------------------------------------------------------------
-- Memberships RLS: admins manage roles/invites; members cannot self-promote
-- ---------------------------------------------------------------------------
drop policy if exists memberships_select on public.memberships;
drop policy if exists memberships_insert on public.memberships;
drop policy if exists memberships_update on public.memberships;
drop policy if exists memberships_delete on public.memberships;

create policy memberships_select on public.memberships
  for select to authenticated
  using (
    user_id = auth.uid()
    or private.is_org_member(organization_id)
  );

-- Bootstrap first owner, or admin creating a pending invite (user_id null)
create policy memberships_insert on public.memberships
  for insert to authenticated
  with check (
    (
      user_id = auth.uid()
      and role = 'owner'
      and status = 'active'
      and not exists (
        select 1 from public.memberships m where m.organization_id = organization_id
      )
    )
    or (
      private.is_org_admin(organization_id)
      and user_id is null
      and status = 'pending'
      and invited_email is not null
      and invite_token is not null
      and role in ('admin', 'sales')
    )
  );

create policy memberships_update on public.memberships
  for update to authenticated
  using (private.is_org_admin(organization_id))
  with check (private.is_org_admin(organization_id));

create policy memberships_delete on public.memberships
  for delete to authenticated
  using (
    private.is_org_admin(organization_id)
    or user_id = auth.uid()
  );

-- Accept invite: email must match JWT email; service-role callers also OK via definer
create or replace function public.accept_org_invite(p_token text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_email text := lower(coalesce(auth.jwt() ->> 'email', ''));
  v_id uuid;
begin
  if v_uid is null then
    raise exception 'not_authenticated';
  end if;
  if p_token is null or length(trim(p_token)) < 10 then
    raise exception 'invalid_token';
  end if;
  if v_email = '' then
    raise exception 'email_required';
  end if;

  update public.memberships
  set
    user_id = v_uid,
    status = 'active',
    invite_token = null
  where invite_token = p_token
    and status = 'pending'
    and lower(coalesce(invited_email, '')) = v_email
  returning id into v_id;

  if v_id is null then
    raise exception 'invite_not_found_or_email_mismatch';
  end if;

  return v_id;
end;
$$;

revoke all on function public.accept_org_invite(text) from public;
grant execute on function public.accept_org_invite(text) to authenticated;

-- ---------------------------------------------------------------------------
-- Organizations: authenticated users only see orgs they belong to
-- (empty-org claim / slug uniqueness use service role in app code)
-- ---------------------------------------------------------------------------
drop policy if exists organizations_authenticated_read on public.organizations;

create policy organizations_authenticated_read on public.organizations
  for select to authenticated
  using (private.is_org_member(id));

-- ---------------------------------------------------------------------------
-- Anon catalog: only products/rules of active configurators (not all tenants)
-- ---------------------------------------------------------------------------
drop policy if exists products_public_select on public.products;
drop policy if exists suggestion_rules_public_select on public.suggestion_rules;

create policy products_public_select on public.products
  for select to anon
  using (
    is_active = true
    and exists (
      select 1 from public.configurators c
      where c.id = products.configurator_id and c.is_active = true
    )
  );

create policy suggestion_rules_public_select on public.suggestion_rules
  for select to anon
  using (
    is_active = true
    and exists (
      select 1 from public.configurators c
      where c.id = suggestion_rules.configurator_id and c.is_active = true
    )
  );

-- END supabase/migrations/0020_security_gdpr_baseline.sql
