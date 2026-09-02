-- Addendum v1.3 + v1.4: catalogue, espace prospect, anti-abandon, WooCommerce

alter table public.products
  add column if not exists sku text,
  add column if not exists category text,
  add column if not exists required_fields jsonb not null default '[]'::jsonb;

create table if not exists public.product_imports (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  source text not null default 'csv',
  status text not null default 'done',
  row_count int not null default 0,
  imported_at timestamptz not null default now()
);

alter table public.quote_sessions
  add column if not exists contact_draft jsonb not null default '{}'::jsonb,
  add column if not exists last_activity_at timestamptz not null default now();

create table if not exists public.prospect_access (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  quote_id uuid not null references public.quotes (id) on delete cascade,
  token text not null unique,
  pin_hash text not null,
  expires_at timestamptz not null,
  last_accessed timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.prospect_messages (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  quote_id uuid not null references public.quotes (id) on delete cascade,
  sender text not null check (sender in ('prospect', 'commercial')),
  content text not null,
  sent_at timestamptz not null default now(),
  read_at timestamptz
);

create table if not exists public.woo_connections (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade unique,
  site_url text not null,
  consumer_key text not null,
  consumer_secret text not null,
  last_sync timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.woo_product_mappings (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  woo_product_id text not null,
  product_id uuid not null references public.products (id) on delete cascade,
  last_synced timestamptz,
  unique (organization_id, woo_product_id)
);

create table if not exists public.woo_orders (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  quote_id uuid not null references public.quotes (id) on delete cascade,
  woo_order_id text not null,
  woo_order_status text,
  synced_at timestamptz not null default now()
);

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
    'prospect_photo'
  ));

alter table public.automation_flows drop constraint if exists automation_flows_trigger_check;
alter table public.automation_flows
  add constraint automation_flows_trigger_check check (trigger in (
    'submitted', 'unprocessed', 'delay', 'abandoned'
  ));

create index if not exists product_imports_org_idx on public.product_imports (organization_id, imported_at desc);
create index if not exists quote_sessions_activity_idx on public.quote_sessions (organization_id, last_activity_at desc);
create index if not exists prospect_access_quote_idx on public.prospect_access (quote_id);
create index if not exists prospect_messages_quote_idx on public.prospect_messages (quote_id, sent_at);

alter table public.product_imports enable row level security;
alter table public.prospect_access enable row level security;
alter table public.prospect_messages enable row level security;
alter table public.woo_connections enable row level security;
alter table public.woo_product_mappings enable row level security;
alter table public.woo_orders enable row level security;

create policy product_imports_all on public.product_imports
  for all to authenticated
  using (private.is_org_admin(organization_id))
  with check (private.is_org_admin(organization_id));

create policy prospect_access_select on public.prospect_access
  for select to authenticated
  using (private.is_org_member(organization_id));

create policy prospect_messages_member on public.prospect_messages
  for all to authenticated
  using (private.is_org_member(organization_id))
  with check (private.is_org_member(organization_id));

create policy woo_connections_admin on public.woo_connections
  for all to authenticated
  using (private.is_org_admin(organization_id))
  with check (private.is_org_admin(organization_id));

create policy woo_mappings_admin on public.woo_product_mappings
  for all to authenticated
  using (private.is_org_admin(organization_id))
  with check (private.is_org_admin(organization_id));

create policy woo_orders_member on public.woo_orders
  for all to authenticated
  using (private.is_org_member(organization_id))
  with check (private.is_org_member(organization_id));

insert into public.email_templates (organization_id, kind, subject, body)
select o.id, v.kind, v.subject, v.body
from public.organizations o
cross join (values
  ('session_resume',
   'Votre configuration est sauvegardée',
   'Bonjour {{contact_name}}, vous avez commencé à configurer votre projet. Il vous reste 2 minutes — reprenez ici : {{resume_url}}'),
  ('session_resume_late',
   'Votre projet attend',
   'Bonjour {{contact_name}}, votre projet attend. Reprenez où vous en étiez : {{resume_url}}'),
  ('prospect_photo',
   'Une photo aiderait à affiner votre devis',
   'Bonjour {{contact_name}}, pour affiner votre devis, une photo de votre local nous aiderait. Ajoutez-la ici : {{suivi_url}} (code {{pin}})')
) as v(kind, subject, body)
on conflict (organization_id, kind) do nothing;

insert into public.automation_flows (organization_id, trigger, delay_hours, recipient, template_kind, active)
select o.id, v.trigger, v.delay_hours, v.recipient, v.template_kind, true
from public.organizations o
cross join (values
  ('abandoned', 1, 'prospect', 'session_resume'),
  ('abandoned', 24, 'prospect', 'session_resume_late'),
  ('delay', 24, 'prospect', 'prospect_photo')
) as v(trigger, delay_hours, recipient, template_kind)
where not exists (
  select 1 from public.automation_flows f
  where f.organization_id = o.id and f.template_kind = v.template_kind
);

update public.email_templates
set body = body || E'\n\nSuivez votre demande : {{suivi_url}}\nCode PIN : {{pin}}'
where kind = 'prospect_confirm'
  and body not like '%suivi_url%';
