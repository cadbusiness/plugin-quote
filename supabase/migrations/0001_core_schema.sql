-- QuoteBuilder core schema: multi-tenant + RLS + Quickly seed

create extension if not exists pgcrypto;

create schema if not exists private;

revoke all on schema private from public;
grant usage on schema private to postgres, service_role;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  plan text not null default 'pro',
  branding jsonb not null default '{}'::jsonb,
  sales_email text,
  sales_name text,
  sales_phone text,
  allowed_origins text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table public.memberships (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('owner', 'admin', 'sales')),
  created_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

create table public.configurators (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  slug text not null,
  sector text not null default 'rayonnage',
  wizard_enabled boolean not null default true,
  chat_enabled boolean not null default true,
  theme jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (organization_id, slug)
);

create table public.wizard_steps (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  configurator_id uuid not null references public.configurators (id) on delete cascade,
  sort_order int not null default 0,
  title text not null,
  subtitle text,
  screen_type text not null check (screen_type in ('questions', 'suggestions', 'customize', 'contact')),
  created_at timestamptz not null default now()
);

create table public.wizard_questions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  step_id uuid not null references public.wizard_steps (id) on delete cascade,
  key text not null,
  label text not null,
  help_text text,
  type text not null check (type in ('visual_choice', 'number', 'select', 'multi_select', 'text', 'file')),
  required boolean not null default true,
  sort_order int not null default 0,
  options jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  configurator_id uuid not null references public.configurators (id) on delete cascade,
  name text not null,
  description text,
  image_url text,
  price_min numeric,
  price_max numeric,
  currency text not null default 'EUR',
  tags text[] not null default '{}',
  options jsonb not null default '[]'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.suggestion_rules (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  configurator_id uuid not null references public.configurators (id) on delete cascade,
  name text not null,
  priority int not null default 0,
  conditions jsonb not null default '{}'::jsonb,
  product_ids uuid[] not null default '{}',
  price_min numeric,
  price_max numeric,
  headline text,
  description text,
  image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.quote_sessions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  configurator_id uuid not null references public.configurators (id) on delete cascade,
  token text not null unique,
  mode text not null default 'wizard' check (mode in ('wizard', 'chat')),
  current_step int not null default 0,
  answers jsonb not null default '{}'::jsonb,
  extracted_params jsonb not null default '{}'::jsonb,
  chat_messages jsonb not null default '[]'::jsonb,
  selected_suggestion_id uuid,
  customization jsonb not null default '{}'::jsonb,
  submitted_quote_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.quotes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  configurator_id uuid not null references public.configurators (id) on delete cascade,
  session_id uuid references public.quote_sessions (id),
  status text not null default 'new' check (status in ('new', 'contacted', 'won', 'lost')),
  contact_name text not null,
  contact_email text not null,
  contact_phone text,
  contact_company text,
  answers jsonb not null default '{}'::jsonb,
  extracted_params jsonb not null default '{}'::jsonb,
  score int,
  score_label text,
  notes text,
  created_at timestamptz not null default now()
);

alter table public.quote_sessions
  add constraint quote_sessions_submitted_quote_fk
  foreign key (submitted_quote_id) references public.quotes (id);

create table public.quote_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  quote_id uuid not null references public.quotes (id) on delete cascade,
  product_id uuid references public.products (id),
  name text not null,
  quantity int not null default 1,
  options jsonb not null default '{}'::jsonb,
  price_min numeric,
  price_max numeric
);

create table public.quote_files (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  quote_id uuid references public.quotes (id) on delete cascade,
  session_id uuid references public.quote_sessions (id) on delete cascade,
  storage_path text not null,
  file_name text not null,
  mime_type text,
  created_at timestamptz not null default now()
);

create table public.email_templates (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  kind text not null check (kind in ('prospect_confirm', 'sales_brief')),
  subject text not null,
  body text not null,
  unique (organization_id, kind)
);

create table public.pdf_templates (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  title text not null default 'Récapitulatif de votre configuration',
  intro text,
  footer text
);

create table public.webhooks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  url text not null,
  secret text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.webhook_deliveries (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  webhook_id uuid not null references public.webhooks (id) on delete cascade,
  quote_id uuid references public.quotes (id) on delete set null,
  status text not null default 'pending',
  status_code int,
  request_body jsonb,
  response_body text,
  attempts int not null default 0,
  last_error text,
  created_at timestamptz not null default now()
);

create index memberships_user_id_idx on public.memberships (user_id);
create index configurators_org_slug_idx on public.configurators (organization_id, slug);
create index wizard_steps_config_idx on public.wizard_steps (configurator_id, sort_order);
create index wizard_questions_step_idx on public.wizard_questions (step_id, sort_order);
create index products_config_idx on public.products (configurator_id);
create index quotes_org_created_idx on public.quotes (organization_id, created_at desc);
create index quote_sessions_token_idx on public.quote_sessions (token);
create index webhook_deliveries_org_idx on public.webhook_deliveries (organization_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Helpers (private, security definer)
-- ---------------------------------------------------------------------------

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
  );
$$;

revoke all on function private.is_org_member(uuid) from public;
grant execute on function private.is_org_member(uuid) to authenticated;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger quote_sessions_updated_at
  before update on public.quote_sessions
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.organizations enable row level security;
alter table public.memberships enable row level security;
alter table public.configurators enable row level security;
alter table public.wizard_steps enable row level security;
alter table public.wizard_questions enable row level security;
alter table public.products enable row level security;
alter table public.suggestion_rules enable row level security;
alter table public.quote_sessions enable row level security;
alter table public.quotes enable row level security;
alter table public.quote_items enable row level security;
alter table public.quote_files enable row level security;
alter table public.email_templates enable row level security;
alter table public.pdf_templates enable row level security;
alter table public.webhooks enable row level security;
alter table public.webhook_deliveries enable row level security;

-- Organizations
create policy organizations_select on public.organizations
  for select to authenticated
  using (private.is_org_member(id));

create policy organizations_update on public.organizations
  for update to authenticated
  using (private.is_org_member(id))
  with check (private.is_org_member(id));

-- Memberships: read own / org; first user of an org can bootstrap
create policy memberships_select on public.memberships
  for select to authenticated
  using (user_id = auth.uid() or private.is_org_member(organization_id));

create policy memberships_insert on public.memberships
  for insert to authenticated
  with check (
    user_id = auth.uid()
    and (
      private.is_org_member(organization_id)
      or not exists (
        select 1 from public.memberships m where m.organization_id = organization_id
      )
    )
  );

create policy memberships_update on public.memberships
  for update to authenticated
  using (private.is_org_member(organization_id))
  with check (private.is_org_member(organization_id));

create policy memberships_delete on public.memberships
  for delete to authenticated
  using (private.is_org_member(organization_id));

-- Generic org-scoped CRUD for authenticated members
create policy configurators_all on public.configurators
  for all to authenticated
  using (private.is_org_member(organization_id))
  with check (private.is_org_member(organization_id));

create policy wizard_steps_all on public.wizard_steps
  for all to authenticated
  using (private.is_org_member(organization_id))
  with check (private.is_org_member(organization_id));

create policy wizard_questions_all on public.wizard_questions
  for all to authenticated
  using (private.is_org_member(organization_id))
  with check (private.is_org_member(organization_id));

create policy products_all on public.products
  for all to authenticated
  using (private.is_org_member(organization_id))
  with check (private.is_org_member(organization_id));

create policy suggestion_rules_all on public.suggestion_rules
  for all to authenticated
  using (private.is_org_member(organization_id))
  with check (private.is_org_member(organization_id));

create policy quote_sessions_all on public.quote_sessions
  for all to authenticated
  using (private.is_org_member(organization_id))
  with check (private.is_org_member(organization_id));

create policy quotes_all on public.quotes
  for all to authenticated
  using (private.is_org_member(organization_id))
  with check (private.is_org_member(organization_id));

create policy quote_items_all on public.quote_items
  for all to authenticated
  using (private.is_org_member(organization_id))
  with check (private.is_org_member(organization_id));

create policy quote_files_all on public.quote_files
  for all to authenticated
  using (private.is_org_member(organization_id))
  with check (private.is_org_member(organization_id));

create policy email_templates_all on public.email_templates
  for all to authenticated
  using (private.is_org_member(organization_id))
  with check (private.is_org_member(organization_id));

create policy pdf_templates_all on public.pdf_templates
  for all to authenticated
  using (private.is_org_member(organization_id))
  with check (private.is_org_member(organization_id));

create policy webhooks_all on public.webhooks
  for all to authenticated
  using (private.is_org_member(organization_id))
  with check (private.is_org_member(organization_id));

create policy webhook_deliveries_all on public.webhook_deliveries
  for all to authenticated
  using (private.is_org_member(organization_id))
  with check (private.is_org_member(organization_id));

-- Public configurator reads (definition only)
create policy configurators_public_select on public.configurators
  for select to anon
  using (is_active = true);

create policy organizations_public_select on public.organizations
  for select to anon
  using (
    exists (
      select 1 from public.configurators c
      where c.organization_id = organizations.id and c.is_active = true
    )
  );

create policy wizard_steps_public_select on public.wizard_steps
  for select to anon
  using (
    exists (
      select 1 from public.configurators c
      where c.id = wizard_steps.configurator_id and c.is_active = true
    )
  );

create policy wizard_questions_public_select on public.wizard_questions
  for select to anon
  using (
    exists (
      select 1 from public.configurators c
      where c.id = (
        select s.configurator_id from public.wizard_steps s where s.id = wizard_questions.step_id
      ) and c.is_active = true
    )
  );

create policy products_public_select on public.products
  for select to anon
  using (is_active = true);

create policy suggestion_rules_public_select on public.suggestion_rules
  for select to anon
  using (is_active = true);

-- ---------------------------------------------------------------------------
-- Storage
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'quote-uploads',
  'quote-uploads',
  false,
  10485760,
  array['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
);

create policy quote_uploads_member_select on storage.objects
  for select to authenticated
  using (
    bucket_id = 'quote-uploads'
    and private.is_org_member((storage.foldername(name))[1]::uuid)
  );
