-- In-app changelog: 1.13.1 (notes de version dans le dashboard).
-- Idempotent: prod may already have this row from a manual insert.

insert into public.product_updates (version, title, items, released_at)
values (
  '1.13.1',
  'Liens boutique vers le devis restent dans la vitrine',
  '[
    "Les anciens liens vers le funnel /c/… avec indication boutique redirigent vers le devis intégré /b/…/devis (boutique publiée et liée).",
    "Les paramètres utiles (produit, UTM, etc.) sont conservés.",
    "Sans boutique (ou boutique inconnue / non publiée / non liée), le funnel /c/ reste inchangé."
  ]'::jsonb,
  '2026-09-11'
)
on conflict (version) do nothing;
