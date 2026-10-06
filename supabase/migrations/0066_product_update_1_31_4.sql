-- In-app changelog: 1.31.4 (relances d'abandon et parcours plus fiables).

insert into public.product_updates (version, title, items, released_at)
values (
  '1.31.4',
  'Relances d''abandon et parcours plus fiables',
  '[
    "Les relances d''abandon sans prénom disent simplement « Bonjour, » au lieu de « Bonjour bonjour ».",
    "« Voir le parcours » ouvre une vue en lecture seule de la session (réponses, étapes, chat) sans toucher à la reprise du prospect.",
    "Un visiteur n''est marqué « Relancé » que si un e-mail est vraiment parti, et le seuil d''inactivité suit le délai de votre parcours d''abandon (1 h par défaut).",
    "Les montants sous 1 € affichent leurs centimes (0,90 €).",
    "Répondre « aucune » à une question de contrainte n''augmente plus le score du lead."
  ]'::jsonb,
  '2026-10-06'
)
on conflict (version) do nothing;
