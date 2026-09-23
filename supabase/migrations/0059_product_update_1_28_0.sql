-- In-app changelog: 1.28.0 (devis depuis le navigateur, clé site).

insert into public.product_updates (version, title, items, released_at)
values (
  '1.28.0',
  'Devis depuis le navigateur (clé site)',
  '[
    "Sur la fiche boutique, une section « Devis depuis le site » affiche la clé publique (qb_site_…) et l’URL POST pour créer un devis depuis le navigateur, sans exposer le secret du plugin.",
    "Vous pouvez autoriser des domaines de préproduction via « Origines navigateur supplémentaires » (une origine par ligne) ; l’URL de la boutique est toujours autorisée.",
    "Un widget ou le JavaScript de la page peut envoyer la même demande WordPress qu’avant : devis Nouveau, origine Site Web, brief commercial — sans mail au prospect.",
    "Un même envoi n’est pas créé deux fois ; le secret Bearer du plugin reste réservé aux appels serveur."
  ]'::jsonb,
  '2026-09-23'
)
on conflict (version) do nothing;
