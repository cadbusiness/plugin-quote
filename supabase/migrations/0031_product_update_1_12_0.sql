-- In-app changelog: 1.12.0 (notes de version dans le dashboard).
-- Idempotent: prod may already have this row from a manual insert.

insert into public.product_updates (version, title, items, released_at)
values (
  '1.12.0',
  'Funnel devis aux couleurs de la boutique',
  '[
    "Sur /b/…/devis, le parcours de devis reprend l’accent, le fond et le texte de la vitrine.",
    "Boutons (Continuer, Envoyer, Chat, Sauvegarder, Voir le devis) et chrome d’étapes suivent le thème boutique.",
    "Le catalogue intégré utilise aussi les accents de la boutique.",
    "Les parcours /c/, embed et CRM restent inchangés (thème funnel classique)."
  ]'::jsonb,
  '2026-09-11'
)
on conflict (version) do nothing;
