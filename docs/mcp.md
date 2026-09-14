# MCP Server QuoteBuilder

Deux portes, les mêmes outils (leads / devis, stats, funnels, relances) :

| Porte | Client | Auth |
|---|---|---|
| **HTTP distant** `GET/POST /api/mcp` | ChatGPT (web + Desktop), Claude distant, Cursor, Codex | OAuth 2.1 (ChatGPT web) ou Bearer `qb_live_…` |
| **stdio** package `quotebuilder-mcp/` | Claude Desktop local | env `QB_API_KEY` |

## Côté app (ce repo)

- Migration `0019_api_keys.sql` : table `api_keys` + template `prospect_reactivation`
- Migration `0037_mcp_oauth.sql` : clients / codes / jetons OAuth MCP (hashés, RLS fermé)
- Auth Bearer `qb_live_…` : `src/lib/api/keys.ts` ; jetons OAuth `qb_mcp_…` : `src/lib/mcp/auth.ts`
- Routes REST : `/api/leads`, `/api/stats`, `/api/funnels`, `/api/automation/*`
- MCP Streamable HTTP : `/api/mcp`
- Découverte OAuth : `/.well-known/oauth-protected-resource`, `/.well-known/oauth-authorization-server`
- Consentement : `/oauth/authorize` (admin org) ; DCR : `POST /oauth/register` ; tokens : `POST /oauth/token`
- UI : **Paramètres → API & webhooks**

Sur le serveur hébergé, `create_quote` / `list_quotes` / `get_quote_status` sont **toujours exposés**.

## Côté package stdio

Voir `quotebuilder-mcp/README.md` pour Claude Desktop en local.

Flag **`MCP_DEVIS_V0=1`** : n’existe que sur le process stdio (historique). Le serveur HTTP n’en a pas besoin.
