-- In-app changelog: 1.9.0 (notes de version dans le dashboard).
-- Idempotent: prod may already have this row from a manual insert.

insert into public.product_updates (version, title, items, released_at)
values (
  '1.9.0',
  'Notes de version dans le dashboard',
  '[
    "Nouvelle page Support → Mises à jour pour parcourir les nouveautés produit.",
    "Un badge non lu apparaît dans le menu Support jusqu’à l’ouverture.",
    "Accès aussi depuis Paramètres.",
    "Les versions non lues affichent une pastille « Nouveau »."
  ]'::jsonb,
  '2026-09-11'
)
on conflict (version) do nothing;
