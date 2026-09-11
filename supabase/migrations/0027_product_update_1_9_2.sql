-- In-app changelog: 1.9.2 (notes de version dans le dashboard).
-- Idempotent: prod may already have this row from a manual insert.

insert into public.product_updates (version, title, items, released_at)
values (
  '1.9.2',
  'Menu mobile boutique publique réparé',
  '[
    "Sur téléphone, le menu hamburger de la vitrine s’ouvre en plein écran (plus de tiroir coupé).",
    "Tous les liens (Accueil, Catalogue, etc.) restent visibles et utilisables, y compris avec encoche.",
    "Zones de tap plus confortables sur les liens empilés.",
    "Moins de défilement latéral accidentel sur la page boutique."
  ]'::jsonb,
  '2026-09-11'
)
on conflict (version) do nothing;
