-- In-app changelog: 1.9.3 (notes de version dans le dashboard).
-- Idempotent: prod may already have this row from a manual insert.

insert into public.product_updates (version, title, items, released_at)
values (
  '1.9.3',
  'Inspecteur boutique : padding et marges appliqués',
  '[
    "Padding et marge saisis dans l’inspecteur s’appliquent enfin sur le canvas (les nombres sans unité deviennent des px).",
    "Steppers +/− pour padding, marge, taille, graisse, top, left, z-index, arrondi, hauteur min et gutter.",
    "Les styles de l’inspecteur passent devant les presets vitrine (police, couleur, graisse).",
    "Saisie au clavier inchangée ; les steppers ajustent au clic."
  ]'::jsonb,
  '2026-09-11'
)
on conflict (version) do nothing;
