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
