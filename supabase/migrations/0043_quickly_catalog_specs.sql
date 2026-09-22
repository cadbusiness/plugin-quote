-- Catalogue Quickly : gammes publiées, specs structurées dans products.options.
-- 0041 ajoute products.specs, 0042 est le changelog 1.18.0 ; ce fichier est 0043.
-- N’efface aucun produit Woo : upsert de 3 SKU (sync_lock) et désactivation
-- des seules fiches sans SKU listées plus bas. Aucun e-mail.

create temporary table quickly_catalog_seed (
  sku text primary key,
  name text not null,
  description text not null,
  category text not null,
  tags text[] not null,
  url text not null,
  options jsonb not null
) on commit drop;

insert into quickly_catalog_seed (sku, name, description, category, tags, url, options)
values
  (
    'QB-QCK-UNIRACK',
    'Rayonnage Unirack',
    'Étagère autoportante, assemblage sans vis ni boulons. Tablettes pleines, perforées 50 % ou polypropylène.',
    'Rayonnage léger',
    array['leger','commerce','garage','archives'],
    'https://quickly-int.com/produit/unirack/',
    '[
      {"key":"largeur","label":"Largeur","kind":"choices","values":[{"value":"900-mm","label":"900 mm"},{"value":"1050-mm","label":"1050 mm"},{"value":"1200-mm","label":"1200 mm"},{"value":"1350-mm","label":"1350 mm"},{"value":"1500-mm","label":"1500 mm"},{"value":"1650-mm","label":"1650 mm"},{"value":"1800-mm","label":"1800 mm"}]},
      {"key":"profondeur-utile","label":"Profondeur","kind":"choices","values":[{"value":"300-mm","label":"300 mm"},{"value":"400-mm","label":"400 mm"},{"value":"500-mm","label":"500 mm"},{"value":"600-mm","label":"600 mm"},{"value":"700-mm","label":"700 mm"},{"value":"800-mm","label":"800 mm"}]},
      {"key":"hauteur-utile","label":"Hauteur","kind":"choices","values":[{"value":"1570-mm","label":"1570 mm"},{"value":"1840-mm","label":"1840 mm"},{"value":"1972-mm","label":"1972 mm"},{"value":"2500-mm","label":"2500 mm"}]},
      {"key":"niveaux","label":"Niveaux","kind":"choices","values":[{"value":"3","label":"3"},{"value":"4","label":"4"},{"value":"5","label":"5"},{"value":"6","label":"6"},{"value":"7","label":"7"}]},
      {"key":"charge","label":"Charge","kind":"number","value":"280","unit":"kg"},
      {"key":"hauteur","label":"Hauteur max","kind":"number","value":"2500","unit":"mm"},
      {"key":"profondeur","label":"Profondeur lisse","kind":"text","value":"300–800","unit":"mm"},
      {"key":"materiau","label":"Matériau","kind":"text","value":"Acier galvanisé certifié EN10204"},
      {"key":"delai","label":"Délai livraison","kind":"text","value":"Stock entrepôt 2500 m²"}
    ]'::jsonb
  ),
  (
    'QB-QCK-SUPER123',
    'Rayonnage Super 1/2/3',
    'Rayonnage à prise manuelle, assemblage sans vis. Tablettes pleines, perforées ou polypropylène haute densité.',
    'Rayonnage léger',
    array['leger','commerce','garage','alimentaire','archives'],
    'https://quickly-int.com/produit/super-1-2-3/',
    '[
      {"key":"largeur","label":"Largeur","kind":"choices","values":[{"value":"900-mm","label":"900 mm"},{"value":"1050-mm","label":"1050 mm"},{"value":"1200-mm","label":"1200 mm"},{"value":"1350-mm","label":"1350 mm"},{"value":"1500-mm","label":"1500 mm"},{"value":"1650-mm","label":"1650 mm"},{"value":"1800-mm","label":"1800 mm"}]},
      {"key":"profondeur-utile","label":"Profondeur","kind":"choices","values":[{"value":"300-mm","label":"300 mm"},{"value":"400-mm","label":"400 mm"},{"value":"500-mm","label":"500 mm"},{"value":"600-mm","label":"600 mm"},{"value":"700-mm","label":"700 mm"},{"value":"800-mm","label":"800 mm"}]},
      {"key":"hauteur-utile","label":"Hauteur","kind":"choices","values":[{"value":"1570-mm","label":"1570 mm"},{"value":"1840-mm","label":"1840 mm"},{"value":"1972-mm","label":"1972 mm"},{"value":"2500-mm","label":"2500 mm"}]},
      {"key":"niveaux","label":"Niveaux","kind":"choices","values":[{"value":"3","label":"3"},{"value":"4","label":"4"},{"value":"5","label":"5"},{"value":"6","label":"6"},{"value":"7","label":"7"}]},
      {"key":"charge","label":"Charge","kind":"number","value":"280","unit":"kg"},
      {"key":"hauteur","label":"Hauteur max","kind":"number","value":"2500","unit":"mm"},
      {"key":"profondeur","label":"Profondeur lisse","kind":"text","value":"300–800","unit":"mm"},
      {"key":"materiau","label":"Matériau","kind":"text","value":"Acier galvanisé certifié EN10204"},
      {"key":"delai","label":"Délai livraison","kind":"text","value":"Stock entrepôt 2500 m²"}
    ]'::jsonb
  ),
  (
    'QB-QCK-UNISHELF',
    'Unishelf',
    'Rack mi-lourd de picking. Lisse rivetée, niveaux réglables. Accessoires sur les profondeurs courantes.',
    'Rayonnage mi-lourd',
    array['moyen','entrepot','picking','commerce'],
    'https://quickly-int.com/produit/unishelf/',
    '[
      {"key":"largeur","label":"Largeur","kind":"choices","values":[{"value":"1800-mm","label":"1800 mm"},{"value":"2100-mm","label":"2100 mm"},{"value":"2400-mm","label":"2400 mm"},{"value":"2700-mm","label":"2700 mm"},{"value":"3000-mm","label":"3000 mm"}]},
      {"key":"profondeur-utile","label":"Profondeur","kind":"choices","values":[{"value":"400-mm","label":"400 mm"},{"value":"500-mm","label":"500 mm"},{"value":"600-mm","label":"600 mm"},{"value":"700-mm","label":"700 mm"},{"value":"800-mm","label":"800 mm"},{"value":"1000-mm","label":"1000 mm"},{"value":"1100-mm","label":"1100 mm"},{"value":"1200-mm","label":"1200 mm"}]},
      {"key":"hauteur-utile","label":"Hauteur","kind":"choices","values":[{"value":"2000-mm","label":"2000 mm"},{"value":"2500-mm","label":"2500 mm"},{"value":"3000-mm","label":"3000 mm"},{"value":"3500-mm","label":"3500 mm"},{"value":"4000-mm","label":"4000 mm"},{"value":"4500-mm","label":"4500 mm"},{"value":"5000-mm","label":"5000 mm"}]},
      {"key":"niveaux","label":"Niveaux","kind":"choices","values":[{"value":"3","label":"3"},{"value":"4","label":"4"},{"value":"5","label":"5"},{"value":"6","label":"6"},{"value":"7","label":"7"}]},
      {"key":"charge","label":"Charge","kind":"text","value":"240–800","unit":"kg"},
      {"key":"hauteur","label":"Hauteur max","kind":"number","value":"5000","unit":"mm"},
      {"key":"profondeur","label":"Profondeur lisse","kind":"text","value":"400–1200","unit":"mm"},
      {"key":"hauteur-lisse","label":"Hauteur de lisse","kind":"number","value":"70","unit":"mm"},
      {"key":"materiau","label":"Matériau","kind":"text","value":"Acier galvanisé"},
      {"key":"delai","label":"Délai livraison","kind":"text","value":"Stock entrepôt 2500 m²"}
    ]'::jsonb
  );

update public.products as p
set
  name = s.name,
  description = s.description,
  category = s.category,
  tags = s.tags,
  external_url = s.url,
  options = s.options,
  source = 'manual',
  sync_lock = true,
  is_active = true,
  currency = 'EUR',
  updated_at = now()
from quickly_catalog_seed as s
join public.organizations as o on o.slug = 'quickly'
where p.organization_id = o.id
  and p.sku = s.sku;

insert into public.products (
  organization_id, configurator_id, name, description, category, tags, sku,
  external_url, options, source, sync_lock, is_active, currency
)
select
  o.id,
  c.id,
  s.name,
  s.description,
  s.category,
  s.tags,
  s.sku,
  s.url,
  s.options,
  'manual',
  true,
  true,
  'EUR'
from quickly_catalog_seed as s
join public.organizations as o on o.slug = 'quickly'
join public.configurators as c on c.organization_id = o.id and c.slug = 'rayonnage'
where not exists (
  select 1
  from public.products as p
  where p.organization_id = o.id
    and p.sku = s.sku
);

update public.products as p
set is_active = false
from public.organizations as o
where p.organization_id = o.id
  and o.slug = 'quickly'
  and p.sku is null
  and p.name in (
    'Rayonnage palettes lourd',
    'Rayonnage mi-lourd',
    'Rayonnage picking / léger',
    'Rayonnage alimentaire inox',
    'Cantilever'
  );

update public.suggestion_rules as r
set product_ids = ids.product_ids
from public.organizations as o
join lateral (
  select coalesce(array_agg(p.id), '{}') as product_ids
  from public.products as p
  where p.organization_id = o.id
    and p.sku = 'QB-QCK-UNISHELF'
) as ids on true
where r.organization_id = o.id
  and o.slug = 'quickly'
  and r.name = 'Entrepôt palettes';

update public.suggestion_rules as r
set product_ids = ids.product_ids
from public.organizations as o
join lateral (
  select coalesce(array_agg(p.id), '{}') as product_ids
  from public.products as p
  where p.organization_id = o.id
    and p.sku in ('QB-QCK-UNIRACK', 'QB-QCK-SUPER123', 'QB-QCK-UNISHELF')
) as ids on true
where r.organization_id = o.id
  and o.slug = 'quickly'
  and r.name in ('Commerce / réserve', 'Solution mixte');

update public.suggestion_rules as r
set product_ids = ids.product_ids
from public.organizations as o
join lateral (
  select coalesce(array_agg(p.id), '{}') as product_ids
  from public.products as p
  where p.organization_id = o.id
    and p.sku = 'QB-QCK-SUPER123'
) as ids on true
where r.organization_id = o.id
  and o.slug = 'quickly'
  and r.name = 'Cuisine professionnelle';

update public.suggestion_rules as r
set product_ids = ids.product_ids
from public.organizations as o
join lateral (
  select coalesce(array_agg(p.id), '{}') as product_ids
  from public.products as p
  where p.organization_id = o.id
    and p.sku in ('QB-QCK-SUPER123', 'QB-QCK-UNIRACK')
) as ids on true
where r.organization_id = o.id
  and o.slug = 'quickly'
  and r.name = 'Garage / atelier';
