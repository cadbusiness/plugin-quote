# MCP Server QuoteBuilder

Package npm : `quotebuilder-mcp/` dans ce monorepo.

## Côté app (ce repo)

- Migration `0019_api_keys.sql` : table `api_keys` + template `prospect_reactivation`
- Auth Bearer `qb_live_…` : `src/lib/api/keys.ts`
- Routes REST :
  - `/api/leads`, `/api/leads/[id]`
  - `/api/stats`
  - `/api/funnels`, `/api/funnels/[id]/performance`
  - `/api/automation/trigger`, `/api/automation/pending`
- UI création / révocation de clés : **Paramètres → API & webhooks**

## Côté MCP

Voir `quotebuilder-mcp/README.md` pour Claude Desktop et la publication npm.
