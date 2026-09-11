-- In-app changelog: 1.9.1 (notes de version dans le dashboard).
-- Idempotent: prod may already have this row from a manual insert.

insert into public.product_updates (version, title, items, released_at)
values (
  '1.9.1',
  'Boutiques Chat IA : lien public dès la création',
  '[
    "Après le premier échange avec le Chat IA, la boutique est publiée automatiquement.",
    "L’URL publique /b/… fonctionne tout de suite (plus de page introuvable en brouillon).",
    "Création depuis un modèle : reste en brouillon jusqu’au bouton Publier.",
    "La vitrine publique est rafraîchie à chaque sauvegarde, publication ou message Chat IA."
  ]'::jsonb,
  '2026-09-11'
)
on conflict (version) do nothing;
