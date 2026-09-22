-- Retire les trois SKU inventés par 0043_quickly_catalog_specs.
-- Ne touche aucun produit relié à une connexion Woo (connection_id renseigné).
-- Aucun e-mail.

update public.suggestion_rules as r
set product_ids = (
  select coalesce(array_agg(pid), '{}')
  from unnest(r.product_ids) as pid
  where not exists (
    select 1
    from public.products as handmade
    where handmade.id = pid
      and handmade.organization_id = r.organization_id
      and handmade.connection_id is null
      and handmade.source = 'manual'
      and handmade.sku in ('QB-QCK-UNIRACK', 'QB-QCK-SUPER123', 'QB-QCK-UNISHELF')
  )
)
where r.organization_id in (
  select id from public.organizations where slug = 'quickly'
);

delete from public.products as p
using public.organizations as o
where p.organization_id = o.id
  and o.slug = 'quickly'
  and p.connection_id is null
  and p.source = 'manual'
  and p.sku in ('QB-QCK-UNIRACK', 'QB-QCK-SUPER123', 'QB-QCK-UNISHELF');
