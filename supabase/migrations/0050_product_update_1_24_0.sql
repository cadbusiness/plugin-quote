-- In-app changelog: 1.24.0 (fiche technique dans le brief et le devis).

insert into public.product_updates (version, title, items, released_at)
values (
  '1.24.0',
  'Fiche technique dans le brief et le devis',
  '[
    "Sur /c/… et /embed/…, les produits déjà au devis affichent leur fiche (charge, hauteur, profondeur, matériau, délai) dans le brief ; l’étape personnaliser montre le même tableau.",
    "Les valeurs et unités sont en police monospace ; un produit sans specs n’affiche rien.",
    "Avec ?add= / ?product=, les specs du produit sont copiées sur le devis (et la chip de gamme est sélectionnée quand le nom ou les tags le permettent).",
    "Le dossier commercial et le PDF reprennent cette fiche sous « Fiche technique »."
  ]'::jsonb,
  '2026-09-22'
)
on conflict (version) do nothing;
