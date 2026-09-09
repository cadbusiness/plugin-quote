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
