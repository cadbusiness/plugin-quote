-- Fiche technique du funnel rayonnage Quickly. Ne remplace pas une fiche déjà saisie.
-- `products.options` reste la liste de choix (couleur, niveaux). Les specs vivent dans products.specs.

update public.products as p
set specs = seed.specs
from public.organizations as o
join public.configurators as c on c.organization_id = o.id and c.slug = 'rayonnage'
join (
  values
    (
      'Rayonnage palettes lourd',
      '{"charge":{"label":"Charge","value":"1000","unit":"kg/niveau"},"hauteur":{"label":"Hauteur max","value":"12","unit":"m"},"profondeur":{"label":"Profondeur","value":"1100","unit":"mm"},"materiau":{"label":"Matériau","value":"Acier peint / galva"},"delai":{"label":"Délai indicatif","value":"2–4","unit":"semaines"}}'::jsonb
    ),
    (
      'Cantilever',
      '{"charge":{"label":"Charge bras","value":"500","unit":"kg","valueAlt":"par bras"},"hauteur":{"label":"Hauteur colonne","value":"6","unit":"m"},"profondeur":{"label":"Portée bras","value":"1200","unit":"mm"},"materiau":{"label":"Matériau","value":"Acier / galva"},"delai":{"label":"Délai indicatif","value":"3–5","unit":"semaines"}}'::jsonb
    ),
    (
      'Rayonnage alimentaire inox',
      '{"charge":{"label":"Charge","value":"200","unit":"kg/niveau"},"hauteur":{"label":"Hauteur max","value":"2.5","unit":"m"},"profondeur":{"label":"Profondeur","value":"500","unit":"mm"},"materiau":{"label":"Matériau","value":"Inox 304"},"delai":{"label":"Délai indicatif","value":"2–4","unit":"semaines"}}'::jsonb
    ),
    (
      'Rayonnage mi-lourd',
      '{"charge":{"label":"Charge","value":"400","unit":"kg/niveau"},"hauteur":{"label":"Hauteur max","value":"6","unit":"m"},"profondeur":{"label":"Profondeur","value":"600","unit":"mm"},"materiau":{"label":"Matériau","value":"Acier époxy"},"delai":{"label":"Délai indicatif","value":"1–3","unit":"semaines"}}'::jsonb
    ),
    (
      'Rayonnage picking / léger',
      '{"charge":{"label":"Charge","value":"150","unit":"kg/niveau"},"hauteur":{"label":"Hauteur max","value":"3","unit":"m"},"profondeur":{"label":"Profondeur","value":"400","unit":"mm"},"materiau":{"label":"Matériau","value":"Acier époxy"},"delai":{"label":"Délai indicatif","value":"1–2","unit":"semaines"}}'::jsonb
    )
) as seed(name, specs) on true
where o.slug = 'quickly'
  and p.organization_id = o.id
  and p.configurator_id = c.id
  and p.name = seed.name
  and (p.specs is null or p.specs = '{}'::jsonb);
