-- Security + GDPR baseline: memberships RLS, invite accept, public catalog scope,
-- org directory lock-down, marketing consent on quotes.

-- ---------------------------------------------------------------------------
-- Quotes: marketing consent (opt-in)
-- ---------------------------------------------------------------------------
alter table public.quotes
  add column if not exists consent_marketing boolean not null default false;

create index if not exists quotes_org_consent_marketing_idx
  on public.quotes (organization_id)
  where consent_marketing = true;

-- ---------------------------------------------------------------------------
-- Memberships RLS: admins manage roles/invites; members cannot self-promote
-- ---------------------------------------------------------------------------
drop policy if exists memberships_select on public.memberships;
drop policy if exists memberships_insert on public.memberships;
drop policy if exists memberships_update on public.memberships;
drop policy if exists memberships_delete on public.memberships;

create policy memberships_select on public.memberships
  for select to authenticated
  using (
    user_id = auth.uid()
    or private.is_org_member(organization_id)
  );

-- Bootstrap first owner, or admin creating a pending invite (user_id null)
create policy memberships_insert on public.memberships
  for insert to authenticated
  with check (
    (
      user_id = auth.uid()
      and role = 'owner'
      and status = 'active'
      and not exists (
        select 1 from public.memberships m where m.organization_id = organization_id
      )
    )
    or (
      private.is_org_admin(organization_id)
      and user_id is null
      and status = 'pending'
      and invited_email is not null
      and invite_token is not null
      and role in ('admin', 'sales')
    )
  );

create policy memberships_update on public.memberships
  for update to authenticated
  using (private.is_org_admin(organization_id))
  with check (private.is_org_admin(organization_id));

create policy memberships_delete on public.memberships
  for delete to authenticated
  using (
    private.is_org_admin(organization_id)
    or user_id = auth.uid()
  );

-- Accept invite: email must match JWT email; service-role callers also OK via definer
create or replace function public.accept_org_invite(p_token text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_email text := lower(coalesce(auth.jwt() ->> 'email', ''));
  v_id uuid;
begin
  if v_uid is null then
    raise exception 'not_authenticated';
  end if;
  if p_token is null or length(trim(p_token)) < 10 then
    raise exception 'invalid_token';
  end if;
  if v_email = '' then
    raise exception 'email_required';
  end if;

  update public.memberships
  set
    user_id = v_uid,
    status = 'active',
    invite_token = null
  where invite_token = p_token
    and status = 'pending'
    and lower(coalesce(invited_email, '')) = v_email
  returning id into v_id;

  if v_id is null then
    raise exception 'invite_not_found_or_email_mismatch';
  end if;

  return v_id;
end;
$$;

revoke all on function public.accept_org_invite(text) from public;
grant execute on function public.accept_org_invite(text) to authenticated;

-- ---------------------------------------------------------------------------
-- Organizations: authenticated users only see orgs they belong to
-- (empty-org claim / slug uniqueness use service role in app code)
-- ---------------------------------------------------------------------------
drop policy if exists organizations_authenticated_read on public.organizations;

create policy organizations_authenticated_read on public.organizations
  for select to authenticated
  using (private.is_org_member(id));

-- ---------------------------------------------------------------------------
-- Anon catalog: only products/rules of active configurators (not all tenants)
-- ---------------------------------------------------------------------------
drop policy if exists products_public_select on public.products;
drop policy if exists suggestion_rules_public_select on public.suggestion_rules;

create policy products_public_select on public.products
  for select to anon
  using (
    is_active = true
    and exists (
      select 1 from public.configurators c
      where c.id = products.configurator_id and c.is_active = true
    )
  );

create policy suggestion_rules_public_select on public.suggestion_rules
  for select to anon
  using (
    is_active = true
    and exists (
      select 1 from public.configurators c
      where c.id = suggestion_rules.configurator_id and c.is_active = true
    )
  );
