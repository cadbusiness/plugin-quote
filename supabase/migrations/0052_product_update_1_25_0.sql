-- In-app changelog: 1.25.0 (mode d'emploi sur la fiche produit B2B).

insert into public.product_updates (version, title, items, released_at)
values (
  '1.25.0',
  'Mode d''emploi sur la fiche produit B2B',
  '[
    "La fiche produit a un emplacement dédié mode d''emploi : notice courte, documents (manuel, conformité, garantie) et photos d''instruction, à côté des rôles photo / plan / usage.",
    "Sync Woo intelligente : métas _qb_manual / certificat / garantie, téléchargements et indices de nom de fichier — sans copier la description HTML, sans effacer une notice déjà saisie.",
    "Dans l''admin produit, vous éditez la notice, les liens et le rôle Notice sur chaque image.",
    "Le funnel public, l''embed, le brief devis et la page boutique affichent un bloc « Mode d''emploi » compact dès qu''il y a quelque chose à montrer."
  ]'::jsonb,
  '2026-09-22'
)
on conflict (version) do nothing;
