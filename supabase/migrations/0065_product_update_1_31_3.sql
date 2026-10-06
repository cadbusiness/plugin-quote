-- In-app changelog: 1.31.3 (fourchettes de prix identiques partout).

insert into public.product_updates (version, title, items, released_at)
values (
  '1.31.3',
  'Fourchettes de prix identiques partout',
  '[
    "La même fourchette indicative s''affiche désormais sur la carte solution, le PDF, l''email commercial, la fiche devis et l''espace prospect.",
    "La fourchette de la règle de suggestion est prioritaire ; sinon c''est le total des lignes (prix unitaire × quantité), et « Sur devis » si rien n''est renseigné.",
    "Un prix fixe s''affiche une seule fois, les fourchettes utilisent « à » et sont toujours rangées du plus bas au plus haut.",
    "Le PDF reprend les libellés des questions au lieu des clés techniques.",
    "La devise suit le catalogue au lieu d''être forcée en euros, et l''import CSV remet dans l''ordre un prix min/max inversé."
  ]'::jsonb,
  '2026-10-06'
)
on conflict (version) do nothing;
