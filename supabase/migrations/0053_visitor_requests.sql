-- Visitor-owned draft « demande ».
-- One open request per visitor identity (org, and catalog connection when present).
-- Draft lines stay off the CRM until the first submit. After submit, the same
-- visitor can append lines without sending another contact channel.
-- contact_email / contact_phone / contact_channel are stored on the draft so a
-- later job can read them. Abandoned-draft reminders are not sent by this
-- migration. A later org setting abandoned_request_email (default off) will
-- gate that mail. While the setting is off, Quickly sends nothing to the
-- visitor. No reminder cron here. Sales brief only, on first submit.

alter table public.quotes alter column contact_email drop not null;

do $$
begin
  if not exists (
    select 1
    from public.quotes
    where (contact_email is null or btrim(contact_email) = '')
      and (contact_phone is null or btrim(contact_phone) = '')
  ) then
    alter table public.quotes
      drop constraint if exists quotes_contact_channel_check;
    alter table public.quotes
      add constraint quotes_contact_channel_check
      check (
        (contact_email is not null and btrim(contact_email) <> '')
        or (contact_phone is not null and btrim(contact_phone) <> '')
      );
  end if;
end $$;

create table public.visitor_identities (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  connection_id uuid references public.catalog_connections (id) on delete set null,
  token_hash text not null,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

create unique index visitor_identities_token_idx
  on public.visitor_identities (organization_id, token_hash);

create index visitor_identities_connection_idx
  on public.visitor_identities (organization_id, connection_id);

create table public.visitor_requests (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  identity_id uuid not null references public.visitor_identities (id) on delete cascade,
  configurator_id uuid not null references public.configurators (id) on delete cascade,
  connection_id uuid references public.catalog_connections (id) on delete set null,
  status text not null default 'draft' check (status in ('draft', 'submitted')),
  quote_id uuid references public.quotes (id) on delete set null,
  contact_name text,
  contact_email text,
  contact_phone text,
  contact_company text,
  contact_channel text check (contact_channel is null or contact_channel in ('email', 'phone')),
  answers jsonb not null default '{}'::jsonb,
  sales_notified_at timestamptz,
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (identity_id),
  constraint visitor_requests_channel_check check (
    status = 'draft'
    or (contact_email is not null and btrim(contact_email) <> '')
    or (contact_phone is not null and btrim(contact_phone) <> '')
  )
);

create index visitor_requests_org_idx
  on public.visitor_requests (organization_id, updated_at desc);

create index visitor_requests_quote_idx
  on public.visitor_requests (quote_id);

create table public.visitor_request_lines (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  request_id uuid not null references public.visitor_requests (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  name text not null,
  quantity int not null check (quantity > 0 and quantity <= 999),
  options jsonb not null default '{}'::jsonb,
  price_min numeric,
  price_max numeric,
  created_at timestamptz not null default now(),
  unique (request_id, product_id)
);

create index visitor_request_lines_request_idx
  on public.visitor_request_lines (request_id);

create trigger visitor_requests_updated_at
  before update on public.visitor_requests
  for each row execute function public.set_updated_at();

alter table public.visitor_identities enable row level security;
alter table public.visitor_requests enable row level security;
alter table public.visitor_request_lines enable row level security;

create policy visitor_identities_all on public.visitor_identities
  for all to authenticated
  using (private.is_org_member(organization_id))
  with check (private.is_org_member(organization_id));

create policy visitor_requests_all on public.visitor_requests
  for all to authenticated
  using (private.is_org_member(organization_id))
  with check (private.is_org_member(organization_id));

create policy visitor_request_lines_all on public.visitor_request_lines
  for all to authenticated
  using (private.is_org_member(organization_id))
  with check (private.is_org_member(organization_id));
