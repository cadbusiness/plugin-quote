-- In-app changelog: 1.10.0 (notes de version dans le dashboard).
-- Idempotent: prod may already have this row from a manual insert.

insert into public.product_updates (version, title, items, released_at)
values (
  '1.10.0',
  'Templates boutique par secteur',
  '[
    "Trois bases prêtes à l’emploi : menuiserie, soins (skincare) et stock B2B.",
    "Chaque template a son thème, son rythme de page et ses textes métier.",
    "Choix du modèle dans la boîte de création de boutique (cartes dédiées + autres secteurs).",
    "Le Chat IA reprend le vocabulaire et les images du template choisi.",
    "La boutique reste en demande de devis (pas de checkout)."
  ]'::jsonb,
  '2026-09-11'
)
on conflict (version) do nothing;
