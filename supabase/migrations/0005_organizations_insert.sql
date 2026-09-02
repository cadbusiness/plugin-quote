create policy organizations_insert on public.organizations
  for insert to authenticated
  with check (true);
