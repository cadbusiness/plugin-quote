-- Plusieurs commerciaux par demande, tout en gardant quotes.assigned_to
-- comme assigné principal pour les filtres existants.

create table if not exists public.quote_assignees (
  quote_id uuid not null references public.quotes (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (quote_id, user_id)
);

create index if not exists quote_assignees_org_user_idx
  on public.quote_assignees (organization_id, user_id);

create index if not exists quote_assignees_quote_idx
  on public.quote_assignees (quote_id, created_at);

insert into public.quote_assignees (quote_id, user_id, organization_id)
select id, assigned_to, organization_id
from public.quotes
where assigned_to is not null
on conflict do nothing;

alter table public.quote_assignees enable row level security;

create policy quote_assignees_all on public.quote_assignees
  for all to authenticated
  using (private.is_org_member(organization_id))
  with check (private.is_org_member(organization_id));
