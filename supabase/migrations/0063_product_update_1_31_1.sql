-- In-app changelog: 1.31.1 (envoi de la demande rétabli sur le Chat IA hébergé).

insert into public.product_updates (version, title, items, released_at)
values (
  '1.31.1',
  'Chat IA : envoi de la demande rétabli',
  '[
    "Sur les funnels en mode Chat IA (page hébergée et intégration sur votre site), le visiteur voit de nouveau ses coordonnées et le bouton « Envoyer ma demande » quand le chat arrive à l''étape contact.",
    "La demande envoyée depuis le chat arrive dans votre tableau de bord comme une demande issue du formulaire par étapes, avec les réponses collectées pendant la conversation.",
    "Les funnels en mode formulaire par étapes ne changent pas."
  ]'::jsonb,
  '2026-10-05'
)
on conflict (version) do nothing;
