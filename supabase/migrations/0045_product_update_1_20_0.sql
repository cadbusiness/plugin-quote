-- In-app changelog: 1.20.0 (sync Woo : catégories plus précises).

insert into public.product_updates (version, title, items, released_at)
values (
  '1.20.0',
  'Sync Woo : catégories plus précises',
  '[
    "À la synchro WooCommerce, chaque produit prend sa catégorie la plus précise (la feuille), plus le parent générique.",
    "Les libellés trop vagues (« Divers », « Non classé ») sont ignorés s’il existe une catégorie métier.",
    "Les unités de dimensions et de poids suivent les réglages produits de la boutique."
  ]'::jsonb,
  '2026-09-22'
)
on conflict (version) do nothing;
