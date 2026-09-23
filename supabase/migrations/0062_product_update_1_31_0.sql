-- In-app changelog: 1.31.0 (chat catalogue sur le site et escalade commerciale).

insert into public.product_updates (version, title, items, released_at)
values (
  '1.31.0',
  'Chat catalogue sur le site et escalade commerciale',
  '[
    "Sur le widget embed (clé site), le visiteur peut poser des questions produit : les réponses viennent du catalogue, des specs et des modes d''emploi — sans inventer un prix ou un délai.",
    "Demande humaine, exception tarifaire, hors catalogue ou affirmation ferme refusée : un e-mail part au commercial assigné, sinon sales_email, sinon la boîte de l''organisation (template brief si disponible). Le visiteur et Quickly ne sont jamais destinataires.",
    "Si le visiteur a déjà un dossier, le transcript s''ajoute à ce dossier et au devis lié — sans créer de nouveau dossier.",
    "L''assistant se présente comme une IA et ne reprend que ce que le serveur a déjà autorisé."
  ]'::jsonb,
  '2026-09-23'
)
on conflict (version) do nothing;
