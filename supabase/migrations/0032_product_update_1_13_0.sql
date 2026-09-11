-- In-app changelog: 1.13.0 (notes de version dans le dashboard).
-- Idempotent: prod may already have this row from a manual insert.

insert into public.product_updates (version, title, items, released_at)
values (
  '1.13.0',
  'Catalogue boutique = seule source du devis intégré',
  '[
    "Sur /b/…/devis, produits, suggestions et parcours viennent uniquement du catalogue relié à cette boutique.",
    "Plus de mélange avec le catalogue d’une autre boutique ou d’un funnel org-wide.",
    "Catalogue manquant ou inactif : message clair « Catalogue de cette boutique introuvable. ».",
    "Les parcours /c/ (hors boutique) restent inchangés."
  ]'::jsonb,
  '2026-09-11'
)
on conflict (version) do nothing;
