-- Parcours canvas : graphe jsonb + exécutions par demande ou session.

create table if not exists public.workflows (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  status text not null default 'draft' check (status in ('draft', 'active', 'archived')),
  trigger_type text not null check (trigger_type in (
    'quote.submitted',
    'session.abandoned',
    'quote.status_changed'
  )),
  trigger_config jsonb not null default '{}'::jsonb,
  definition jsonb not null default '{"nodes":[],"edges":[]}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workflow_runs (
  id uuid primary key default gen_random_uuid(),
  workflow_id uuid not null references public.workflows (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  subject_type text not null check (subject_type in ('quote', 'session')),
  subject_id uuid not null,
  status text not null default 'running' check (status in (
    'running',
    'waiting',
    'completed',
    'failed',
    'exited'
  )),
  wakeup_at timestamptz,
  context jsonb not null default '{}'::jsonb,
  error text,
  started_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workflow_id, subject_type, subject_id)
);

create table if not exists public.workflow_run_steps (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.workflow_runs (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  node_id text not null,
  status text not null check (status in ('ok', 'waiting', 'failed', 'skipped')),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  error text,
  output jsonb not null default '{}'::jsonb
);

create index if not exists workflows_org_idx
  on public.workflows (organization_id, status);

create index if not exists workflow_runs_wakeup_idx
  on public.workflow_runs (status, wakeup_at)
  where status = 'waiting';

create index if not exists workflow_runs_subject_idx
  on public.workflow_runs (organization_id, subject_type, subject_id);

create index if not exists workflow_runs_workflow_idx
  on public.workflow_runs (workflow_id, started_at desc);

create index if not exists workflow_run_steps_run_idx
  on public.workflow_run_steps (run_id, started_at);

alter table public.workflows enable row level security;
alter table public.workflow_runs enable row level security;
alter table public.workflow_run_steps enable row level security;

create policy workflows_select on public.workflows
  for select to authenticated
  using (private.is_org_member(organization_id));
create policy workflows_write on public.workflows
  for all to authenticated
  using (private.is_org_admin(organization_id))
  with check (private.is_org_admin(organization_id));

create policy workflow_runs_select on public.workflow_runs
  for select to authenticated
  using (private.is_org_member(organization_id));

create policy workflow_run_steps_select on public.workflow_run_steps
  for select to authenticated
  using (private.is_org_member(organization_id));
