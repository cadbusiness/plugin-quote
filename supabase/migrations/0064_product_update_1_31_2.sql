-- In-app changelog: 1.31.2 (étape Solutions recommandées : fin du chargement sans fin).

insert into public.product_updates (version, title, items, released_at)
values (
  '1.31.2',
  'Solutions recommandées : fin du chargement sans fin',
  '[
    "Quand aucune règle de suggestion ne correspond aux réponses, l''étape « Solutions recommandées » affiche un message clair au lieu de « Calcul des configurations… » en continu.",
    "Le prospect peut continuer : votre équipe lui proposera une solution avec le devis.",
    "Si les recommandations ne se chargent pas, un message court s''affiche et la navigation reste disponible.",
    "Les cartes de recommandation restent identiques quand une règle correspond, en formulaire comme en Chat IA."
  ]'::jsonb,
  '2026-10-06'
)
on conflict (version) do nothing;
