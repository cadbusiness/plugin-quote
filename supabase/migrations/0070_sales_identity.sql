-- Merchant reply address and signature were never editable, so sales_email
-- and sales_name stay null. Team briefs then fail ("Destinataire introuvable")
-- and prospect replies hit the platform sender.
-- Apply in production. Do not assume this has already been run.

-- Email templates: members may read, only owner/admin may write.
drop policy if exists email_templates_all on public.email_templates;

drop policy if exists email_templates_select on public.email_templates;
create policy email_templates_select on public.email_templates
  for select to authenticated
  using (private.is_org_member(organization_id));

drop policy if exists email_templates_insert on public.email_templates;
create policy email_templates_insert on public.email_templates
  for insert to authenticated
  with check (private.is_org_admin(organization_id));

drop policy if exists email_templates_update on public.email_templates;
create policy email_templates_update on public.email_templates
  for update to authenticated
  using (private.is_org_admin(organization_id))
  with check (private.is_org_admin(organization_id));

drop policy if exists email_templates_delete on public.email_templates;
create policy email_templates_delete on public.email_templates
  for delete to authenticated
  using (private.is_org_admin(organization_id));

-- Signature: empty sales_name becomes the organization name.
update public.organizations
set sales_name = name
where sales_name is null
   or btrim(sales_name) = '';

-- Inbox: empty sales_email becomes the earliest active owner's email.
update public.organizations as org
set sales_email = owner.email
from (
  select distinct on (membership.organization_id)
    membership.organization_id,
    lower(btrim(coalesce(nullif(btrim(membership.invited_email), ''), auth_user.email))) as email
  from public.memberships as membership
  left join auth.users as auth_user on auth_user.id = membership.user_id
  where membership.role = 'owner'
  order by
    membership.organization_id,
    case when membership.status = 'active' then 0 else 1 end,
    membership.created_at asc
) as owner
where org.id = owner.organization_id
  and (org.sales_email is null or btrim(org.sales_email) = '')
  and owner.email is not null
  and owner.email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$';
