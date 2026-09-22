-- In-app changelog: 1.19.0 (specs produit structurées).

insert into public.product_updates (version, title, items, released_at)
values (
  '1.19.0',
  'Specs produit structurées',
  '[
    "Dans le funnel et l’embed, le catalogue public expose des specs structurées (charge, hauteur, profondeur, matériau, délai), séparées des choix du prospect (couleur, largeur, niveaux…).",
    "La synchro WooCommerce écrit ces specs depuis les attributs, dimensions et meta (charge, hauteur, profondeur, matériau, délai), sans mélanger avec les variations/choix.",
    "Les specs déjà enregistrées en base complètent le payload quand la clé n’est pas déjà dans les options.",
    "Un choix « Hauteur » côté Woo peut aussi alimenter la hauteur max affichée en spec."
  ]'::jsonb,
  '2026-09-22'
)
on conflict (version) do nothing;
