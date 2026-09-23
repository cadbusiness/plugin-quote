-- In-app changelog: 1.27.0 (demande brouillon : e-mail ou téléphone).

insert into public.product_updates (version, title, items, released_at)
values (
  '1.27.0',
  'Demande brouillon : e-mail ou téléphone',
  '[
    "Sur le funnel public (/c et /embed), le visiteur choisit « Par e-mail » ou le téléphone pour envoyer sa demande.",
    "Après le premier envoi, il peut ajouter d’autres lignes au même dossier sans resaisir le contact.",
    "Une seule notification brief arrive dans la boîte commerciale au premier envoi — pas de mail au prospect, pas de second brief si on ajoute encore des lignes.",
    "Un dossier téléphone seul (sans e-mail) reste visible côté commercial ; la confirmation prospect n’est pas envoyée s’il n’y a pas d’e-mail."
  ]'::jsonb,
  '2026-09-23'
)
on conflict (version) do nothing;
