-- In-app changelog: 1.29.0 (widget devis dual-mode, catalogue + besoin libre).

insert into public.product_updates (version, title, items, released_at)
values (
  '1.29.0',
  'Widget devis dual-mode (catalogue + besoin libre)',
  '[
    "Sur la fiche boutique, vous choisissez le mode du widget : catalogue (lignes WooCommerce connues) ou besoin libre (texte du visiteur).",
    "Option IA sur le besoin libre : un brief commercial court est ajouté au dossier ; une ligne catalogue n’est attachée que si le modèle existe déjà — pas de faux SKU inventé.",
    "Un snippet d’embed (clé site) est prêt à coller ; le shortcode WordPress est dans le repo pour le prochain zip (version plugin inchangée).",
    "Même réception qu’avant : devis Nouveau, notification et brief commercial, sans mail au prospect ; un même envoi n’est pas créé deux fois."
  ]'::jsonb,
  '2026-09-23'
)
on conflict (version) do nothing;
