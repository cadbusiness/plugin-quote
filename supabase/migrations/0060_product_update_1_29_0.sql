-- In-app changelog: 1.29.0 (widget devis dual, catalogue + besoin libre).

insert into public.product_updates (version, title, items, released_at)
values (
  '1.29.0',
  'Widget devis dual (catalogue + besoin libre)',
  '[
    "Sur la fiche connexion, « Devis depuis le site » règle le widget : catalogue, besoin libre, ou les deux.",
    "En catalogue, le visiteur envoie des produits déjà connus (identifiant, variation, quantité). En besoin libre, son texte est enregistré sur le devis — sans e-mail au prospect.",
    "L’option « Structurer le besoin libre (IA) » prépare un brief et n’ajoute une ligne que si le produit existe déjà au catalogue.",
    "La fiche affiche le bloc à coller sur la boutique. Le shortcode WordPress [quotebuilder_widget] reprend ces réglages ; le zip publié reste en 2.3.20."
  ]'::jsonb,
  '2026-09-23'
)
on conflict (version) do nothing;
