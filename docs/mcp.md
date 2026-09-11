# MCP Server QuoteBuilder

Package npm : `quotebuilder-mcp/` dans ce monorepo.

## Côté app (ce repo)

- Migration `0019_api_keys.sql` : table `api_keys` + template `prospect_reactivation`
- Auth Bearer `qb_live_…` : `src/lib/api/keys.ts`
- Routes REST :
  - `/api/leads`, `/api/leads/[id]` (`GET ?view=status` = slice statut)
  - `/api/stats`
  - `/api/funnels`, `/api/funnels/[id]/performance`
  - `/api/automation/trigger`, `/api/automation/pending`
- `POST /api/leads` : `company` + `run_autopilot` (défaut `false` — pas de workflows `quote.submitted`)
- UI création / révocation de clés : **Paramètres → API & webhooks**

## Côté MCP

Voir `quotebuilder-mcp/README.md` pour Claude Desktop et la publication npm.

Flag **`MCP_DEVIS_V0=1`** (ou `true` / `on` / `yes`) : expose `create_quote`, `list_quotes`, `get_quote_status` (aliases des routes `/api/leads`). Sans le flag, les outils `*_lead` restent seuls.
