-- In-app changelog: 1.14.0 (notes de version dans le dashboard).
-- Idempotent: prod may already have this row from a manual insert.

insert into public.product_updates (version, title, items, released_at)
values (
  '1.14.0',
  'Devis depuis Claude (MCP)',
  '[
    "Avec Claude Desktop et le flag MCP devis, tu peux créer un devis, lister les demandes et lire le statut sans ouvrir le dashboard.",
    "La création depuis Claude n’envoie pas les emails d’autopilote par défaut ; active-les seulement si tu veux les relances.",
    "Le statut renvoyé reste allégé : score, assignation et funnel, sans notes ni réponses internes.",
    "Documenté côté API / MCP (Paramètres → API & webhooks et docs MCP)."
  ]'::jsonb,
  '2026-09-12'
)
on conflict (version) do nothing;
