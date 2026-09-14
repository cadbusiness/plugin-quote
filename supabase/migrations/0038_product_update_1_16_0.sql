-- In-app changelog: 1.16.0 (MCP distant Claude / ChatGPT).

insert into public.product_updates (version, title, items, released_at)
values (
  '1.16.0',
  'MCP distant : Claude et ChatGPT',
  '[
    "Un serveur MCP hébergé est disponible sur /api/mcp : Claude, ChatGPT et Cursor parlent au même pipeline devis.",
    "ChatGPT (web) se connecte en OAuth (Paramètres → API & webhooks). Claude Desktop garde npx ou la clé Bearer.",
    "Les outils devis (créer, lister, statut) sont actifs sur le serveur distant, sans flag."
  ]'::jsonb,
  '2026-09-14'
)
on conflict (version) do nothing;
