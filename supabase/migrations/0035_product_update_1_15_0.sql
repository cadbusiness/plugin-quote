-- In-app changelog: 1.15.0 (notes de version dans le dashboard).
-- Idempotent: prod may already have this row from a manual insert.

insert into public.product_updates (version, title, items, released_at)
values (
  '1.15.0',
  'Chat boutique : la conversation reste ouverte',
  '[
    "Entrée envoie le message (Maj+Entrée pour une nouvelle ligne).",
    "Le fil et l’onglet Chat restent ouverts après chaque réponse IA ; le canvas se met à jour sans tout remonter.",
    "Clique un bloc, l’en-tête ou le pied : le Chat cible cette zone (plus de réécriture de toute la boutique).",
    "Inspecteur dédié pour le nom et les liens du menu depuis l’en-tête ou le pied, avec raccourci Chat.",
    "Aperçu en direct des étapes IA, image en pièce jointe, et annulation du dernier tour."
  ]'::jsonb,
  '2026-09-12'
)
on conflict (version) do nothing;
