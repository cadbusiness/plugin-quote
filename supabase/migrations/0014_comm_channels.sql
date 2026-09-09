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
