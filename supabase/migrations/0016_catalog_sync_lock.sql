-- Verrou de synchro : une fiche retouchée dans QuoteBuilder
-- n’est plus écrasée par WooCommerce / Shopify.

alter table public.products
  add column if not exists sync_lock boolean not null default false;

create index if not exists products_org_name_idx
  on public.products (organization_id, name);
