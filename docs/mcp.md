# MCP Server QuoteBuilder

> Guide d’installation pour marchands et agences (Claude, ChatGPT, Cursor, clé API, exemples de prompts) : [mcp-installation.md](./mcp-installation.md).
> URL à donner aux clients : `https://www.quotebuilder.co/api/mcp` (l’hôte `quotebuilder-weld.vercel.app` répond aussi).

Deux portes, les mêmes outils (leads / devis, stats, funnels, relances, Google Ads, attribution, catalogue, notes, assignation) :

| Porte | Client | Auth |
|---|---|---|
| **HTTP distant** `GET/POST /api/mcp` | ChatGPT (web + Desktop), Claude distant, Cursor, Codex | OAuth 2.1 (ChatGPT web) ou Bearer `qb_live_…` |
| **stdio** package `quotebuilder-mcp/` | Claude Desktop local | env `QB_API_KEY` |

## Côté app (ce repo)

- Migration `0019_api_keys.sql` : table `api_keys` + template `prospect_reactivation`
- Migration `0037_mcp_oauth.sql` : clients / codes / jetons OAuth MCP (hashés, RLS fermé)
- Auth Bearer `qb_live_…` : `src/lib/api/keys.ts` ; jetons OAuth `qb_mcp_…` : `src/lib/mcp/auth.ts`
- Routes REST : `/api/leads`, `/api/leads/:id/{timeline,notes,assign}`, `/api/team`, `/api/stats`, `/api/funnels`, `/api/automation/*`, `/api/insights/{ads-performance,attribution,conversion-uploads}`, `/api/catalog/search`
- Helpers : `src/lib/api/insights.ts` (+ pur `insights-core.ts`), `catalog.ts` (+ `catalog-search.ts`), `crm.ts` (+ `crm-core.ts`) ; tests `npx tsx src/lib/api/insights.test.ts`, `npx tsx src/lib/mcp/oauth.test.ts`
- MCP Streamable HTTP : `/api/mcp` — outils `src/lib/mcp/tools.ts` (annotations `readOnlyHint` / `destructiveHint` / `idempotentHint` / `openWorldHint`), prompts `src/lib/mcp/prompts.ts`
- Découverte OAuth : `/.well-known/oauth-protected-resource` et `/.well-known/oauth-protected-resource/api/mcp` (RFC 9728, cible du `WWW-Authenticate`), `/.well-known/oauth-authorization-server`
- Les URLs de découverte suivent l’hôte appelé s’il est dans la liste blanche `MCP_PUBLIC_HOSTS` (`src/lib/mcp/urls.ts` : www.quotebuilder.co, quotebuilder.co, quotebuilder-weld.vercel.app, localhost) ; sinon `NEXT_PUBLIC_APP_URL`. Le `resource` annoncé = l’URL saisie par le client, condition pour Claude / ChatGPT.
- Consentement : `/oauth/authorize` (admin org) ; DCR : `POST /oauth/register` ; tokens : `POST /oauth/token`
- UI : **Paramètres → API & webhooks**

Sur le serveur hébergé, `create_quote` / `list_quotes` / `get_quote_status` sont **toujours exposés**.

## Côté package stdio

Voir `quotebuilder-mcp/README.md` pour Claude Desktop en local.

Flag **`MCP_DEVIS_V0=1`** : n’existe que sur le process stdio (historique). Le serveur HTTP n’en a pas besoin.
