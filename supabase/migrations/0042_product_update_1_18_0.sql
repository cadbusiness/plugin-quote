-- In-app changelog: 1.18.0 (préremplissage funnel ?besoin= / ?add=).

insert into public.product_updates (version, title, items, released_at)
values (
  '1.18.0',
  'Préremplissage du funnel depuis l’URL',
  '[
    "Sur /c/… et /embed/… (et via le shortcode WordPress), ?besoin= préremplit les chips de gamme dès l’ouverture.",
    "?add= ou ?product= sélectionne une chip ou ajoute un produit du catalogue (id, SKU, id externe ou nom exact) avec quantité 1.",
    "Les réponses déjà saisies sont conservées : les paramètres s’ajoutent sans écraser.",
    "Les boutons « + Ajouter à mon devis » du site (ex. Hostinger) peuvent ouvrir le parcours déjà rempli."
  ]'::jsonb,
  '2026-09-22'
)
on conflict (version) do nothing;
