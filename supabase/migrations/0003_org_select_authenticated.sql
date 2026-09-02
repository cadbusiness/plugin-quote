create policy organizations_authenticated_read on public.organizations
  for select to authenticated
  using (true);
