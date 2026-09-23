-- Idempotence for POST /api/integrations/plugin/quotes.
-- The WordPress site retries the same externalId hourly (up to 24 times).
-- One receipt per (connection, external id) points at the quote already created.
-- Numbered 0054: 0053 is quote_form_when_list_empty. Safe to re-run if the table already exists.

create table if not exists public.plugin_quote_receipts (
  id uuid primary key default gen_random_uuid(),
  connection_id uuid not null references public.catalog_connections (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  external_id text not null,
  quote_id uuid not null references public.quotes (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint plugin_quote_receipts_connection_external unique (connection_id, external_id)
);

create index if not exists plugin_quote_receipts_quote_idx
  on public.plugin_quote_receipts (quote_id);

alter table public.plugin_quote_receipts enable row level security;

drop policy if exists plugin_quote_receipts_select on public.plugin_quote_receipts;
create policy plugin_quote_receipts_select on public.plugin_quote_receipts
  for select to authenticated
  using (private.is_org_member(organization_id));
