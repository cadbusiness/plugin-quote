-- In-app changelog: 1.23.0 (fiche produit B2B : specs et médias classés).

insert into public.product_updates (version, title, items, released_at)
values (
  '1.23.0',
  'Fiche produit B2B : specs et médias classés',
  '[
    "Sur la fiche produit du catalogue, charge, hauteur, profondeur, matériau et délai s’éditent en champs dédiés.",
    "Les images de la galerie se classent en photo produit, plan ou usage ; la carte garde la photo produit, plan et usage apparaissent en miniatures.",
    "Dans le funnel public, l’embed et la page boutique, le tableau ou les puces de specs s’affichent depuis la fiche produit.",
    "La sync WooCommerce lit le rôle de chaque média (_qb_media_role, sinon alt / titre / nom de fichier) sans écraser un rôle déjà enregistré."
  ]'::jsonb,
  '2026-09-22'
)
on conflict (version) do nothing;
