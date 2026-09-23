-- Publishable site key for POST /api/public/sites/{key}/quotes.
-- Distinct from webhook_secret (plugin Bearer on /api/integrations/plugin/quotes).
-- allowed_origins: extra browser origins. The shop URL origin is always allowed in app code.
-- Numbered 0058: 0057 is product_update_1_27_0.

alter table public.catalog_connections
  add column if not exists public_key text;

alter table public.catalog_connections
  add column if not exists allowed_origins text[] not null default '{}';

update public.catalog_connections
set public_key = 'qb_site_' || replace(gen_random_uuid()::text, '-', '')
where public_key is null;

alter table public.catalog_connections
  alter column public_key set default ('qb_site_' || replace(gen_random_uuid()::text, '-', ''));

alter table public.catalog_connections
  alter column public_key set not null;

create unique index if not exists catalog_connections_public_key_idx
  on public.catalog_connections (public_key);
