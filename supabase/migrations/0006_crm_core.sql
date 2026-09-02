-- Mini CRM: configurable statuses, notes, activity, automations, analytics, invites

alter table public.organizations
  add column if not exists ga_measurement_id text;

-- Memberships: pending invites (user_id nullable until accepted)
alter table public.memberships
  alter column user_id drop not null;

alter table public.memberships
  drop constraint if exists memberships_organization_id_user_id_key;

alter table public.memberships
  add column if not exists invited_email text,
  add column if not exists invite_token text,
  add column if not exists status text not null default 'active';

update public.memberships set status = 'active' where status is null or status = '';

alter table public.memberships
  drop constraint if exists memberships_status_check;
alter table public.memberships
  add constraint memberships_status_check check (status in ('pending', 'active'));

create unique index if not exists memberships_org_user_uidx
  on public.memberships (organization_id, user_id)
  where user_id is not null;

create unique index if not exists memberships_invite_token_uidx
  on public.memberships (invite_token)
  where invite_token is not null;

-- Statuses
create table if not exists public.quote_statuses (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  slug text not null,
  label text not null,
  color text not null default '#64748b',
  position int not null default 0,
  is_default boolean not null default false,
  is_closed boolean not null default false,
  unique (organization_id, slug)
);

-- Quotes CRM fields
alter table public.quotes drop constraint if exists quotes_status_check;
alter table public.quotes
  add column if not exists status_id uuid references public.quote_statuses (id),
  add column if not exists assigned_to uuid references auth.users (id) on delete set null;

create table if not exists public.quote_notes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  quote_id uuid not null references public.quotes (id) on delete cascade,
  author_id uuid references auth.users (id) on delete set null,
  content text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.quote_activities (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  quote_id uuid not null references public.quotes (id) on delete cascade,
  actor_id uuid references auth.users (id) on delete set null,
  type text not null check (type in (
    'submitted', 'status_changed', 'assigned', 'note_added', 'email_sent'
  )),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  quote_id uuid references public.quotes (id) on delete cascade,
  type text not null,
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.automation_flows (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  trigger text not null check (trigger in ('submitted', 'unprocessed', 'delay')),
  delay_hours int not null default 0,
  recipient text not null check (recipient in ('prospect', 'assignee')),
  template_kind text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  configurator_id uuid references public.configurators (id) on delete set null,
  session_id uuid references public.quote_sessions (id) on delete set null,
  event_type text not null,
  step int,
  created_at timestamptz not null default now()
);

alter table public.email_templates drop constraint if exists email_templates_kind_check;
alter table public.email_templates
  add constraint email_templates_kind_check check (kind in (
    'prospect_confirm',
    'sales_brief',
    'sales_unprocessed',
    'prospect_reassure',
    'prospect_followup'
  ));

create index if not exists quote_statuses_org_idx on public.quote_statuses (organization_id, position);
create index if not exists quotes_status_id_idx on public.quotes (organization_id, status_id);
create index if not exists quotes_assigned_idx on public.quotes (organization_id, assigned_to);
create index if not exists quote_notes_quote_idx on public.quote_notes (quote_id, created_at);
create index if not exists quote_activities_quote_idx on public.quote_activities (quote_id, created_at);
create index if not exists notifications_user_idx on public.notifications (user_id, created_at desc);
create index if not exists analytics_events_org_idx on public.analytics_events (organization_id, created_at desc);

create or replace function private.is_org_member(org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.memberships
    where organization_id = org_id
      and user_id = auth.uid()
      and status = 'active'
  );
$$;

create or replace function private.is_org_admin(org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.memberships
    where organization_id = org_id
      and user_id = auth.uid()
      and status = 'active'
      and role in ('owner', 'admin')
  );
$$;

revoke all on function private.is_org_admin(uuid) from public;
grant execute on function private.is_org_admin(uuid) to authenticated;

create or replace function private.seed_org_crm(org_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.quote_statuses (organization_id, slug, label, color, position, is_default, is_closed)
  values
    (org_id, 'new', 'Nouveau', '#2563eb', 0, true, false),
    (org_id, 'contacted', 'Contacté', '#d97706', 1, false, false),
    (org_id, 'in_progress', 'En cours', '#7c3aed', 2, false, false),
    (org_id, 'won', 'Gagné', '#16a34a', 3, false, true),
    (org_id, 'lost', 'Perdu', '#dc2626', 4, false, true),
    (org_id, 'waiting', 'En attente', '#64748b', 5, false, false)
  on conflict (organization_id, slug) do nothing;

  insert into public.automation_flows (organization_id, trigger, delay_hours, recipient, template_kind, active)
  select org_id, v.trigger, v.delay_hours, v.recipient, v.template_kind, true
  from (values
    ('submitted', 0, 'prospect', 'prospect_confirm'),
    ('submitted', 0, 'assignee', 'sales_brief'),
    ('unprocessed', 4, 'assignee', 'sales_unprocessed'),
    ('delay', 24, 'prospect', 'prospect_reassure'),
    ('delay', 72, 'prospect', 'prospect_followup')
  ) as v(trigger, delay_hours, recipient, template_kind)
  where not exists (
    select 1 from public.automation_flows f
    where f.organization_id = org_id and f.template_kind = v.template_kind
  );

  insert into public.email_templates (organization_id, kind, subject, body)
  values
    (org_id, 'sales_unprocessed', 'Rappel — demande non traitée',
     'Demande de {{contact_name}} ({{contact_company}}) encore au statut Nouveau.'),
    (org_id, 'prospect_reassure', 'Votre demande est bien prise en compte',
     'Bonjour {{contact_name}}, votre demande est bien prise en compte. Retour sous 48h.'),
    (org_id, 'prospect_followup', 'Avez-vous eu le temps de réfléchir ?',
     'Bonjour {{contact_name}}, votre projet est-il toujours d’actualité ?')
  on conflict (organization_id, kind) do nothing;
end;
$$;

revoke all on function private.seed_org_crm(uuid) from public;
grant execute on function private.seed_org_crm(uuid) to authenticated, service_role;

do $$
declare
  r record;
  default_id uuid;
begin
  for r in select id from public.organizations
  loop
    perform private.seed_org_crm(r.id);
    select id into default_id
    from public.quote_statuses
    where organization_id = r.id and is_default = true
    limit 1;
    update public.quotes q
    set status_id = coalesce(
      (select s.id from public.quote_statuses s where s.organization_id = r.id and s.slug = q.status),
      default_id
    )
    where q.organization_id = r.id and q.status_id is null;
  end loop;
end;
$$;

alter table public.quote_statuses enable row level security;
alter table public.quote_notes enable row level security;
alter table public.quote_activities enable row level security;
alter table public.notifications enable row level security;
alter table public.automation_flows enable row level security;
alter table public.analytics_events enable row level security;

create policy quote_statuses_select on public.quote_statuses
  for select to authenticated
  using (private.is_org_member(organization_id));
create policy quote_statuses_write on public.quote_statuses
  for all to authenticated
  using (private.is_org_admin(organization_id))
  with check (private.is_org_admin(organization_id));

create policy quote_notes_all on public.quote_notes
  for all to authenticated
  using (private.is_org_member(organization_id))
  with check (private.is_org_member(organization_id));

create policy quote_activities_all on public.quote_activities
  for all to authenticated
  using (private.is_org_member(organization_id))
  with check (private.is_org_member(organization_id));

create policy notifications_own on public.notifications
  for all to authenticated
  using (user_id = auth.uid() and private.is_org_member(organization_id))
  with check (user_id = auth.uid() and private.is_org_member(organization_id));

create policy automation_flows_select on public.automation_flows
  for select to authenticated
  using (private.is_org_admin(organization_id));
create policy automation_flows_write on public.automation_flows
  for all to authenticated
  using (private.is_org_admin(organization_id))
  with check (private.is_org_admin(organization_id));

create policy analytics_events_select on public.analytics_events
  for select to authenticated
  using (private.is_org_member(organization_id));
create policy analytics_events_insert on public.analytics_events
  for insert to authenticated
  with check (private.is_org_member(organization_id));
