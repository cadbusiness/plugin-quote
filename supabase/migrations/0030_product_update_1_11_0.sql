-- In-app changelog: 1.11.0 (notes de version dans le dashboard).
-- Idempotent: prod may already have this row from a manual insert.

insert into public.product_updates (version, title, items, released_at)
values (
  '1.11.0',
  'Devis intégré dans la boutique',
  '[
    "Sur la vitrine publique, « Devis » et « Ajouter au devis » restent dans la boutique (/b/…/devis) au lieu d’ouvrir le funnel /c/….",
    "La page devis garde le chrome boutique (nav, thème --shop-*).",
    "Sans configurateur relié : message clair + lien vers le catalogue (plus de crash).",
    "Sitemap, JSON-LD produit et llms.txt pointent vers l’URL devis de la boutique."
  ]'::jsonb,
  '2026-09-11'
)
on conflict (version) do nothing;
