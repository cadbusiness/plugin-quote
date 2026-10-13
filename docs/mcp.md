# MCP Server QuoteBuilder

> Guide d’installation pour marchands et agences (Claude, ChatGPT, Cursor, clé API, exemples de prompts) : [mcp-installation.md](./mcp-installation.md).
> URL à donner aux clients : `https://www.quotebuilder.co/api/mcp` (l’hôte `quotebuilder-weld.vercel.app` répond aussi).

Deux portes, les mêmes outils (leads / devis, stats, funnels, configuration de funnel, relances, Google Ads, attribution, catalogue, notes, assignation) :

| Porte | Client | Auth |
|---|---|---|
| **HTTP distant** `GET/POST /api/mcp` | ChatGPT (web + Desktop), Claude distant, Cursor, Codex | OAuth 2.1 (ChatGPT web) ou Bearer `qb_live_…` |
| **stdio** package `quotebuilder-mcp/` | Claude Desktop local | env `QB_API_KEY` |

## Côté app (ce repo)

- Migration `0019_api_keys.sql` : table `api_keys` + template `prospect_reactivation`
- Migration `0037_mcp_oauth.sql` : clients / codes / jetons OAuth MCP (hashés, RLS fermé)
- Auth Bearer `qb_live_…` : `src/lib/api/keys.ts` ; jetons OAuth `qb_mcp_…` : `src/lib/mcp/auth.ts`
- Routes REST : `/api/leads`, `/api/leads/:id/{timeline,notes,assign}`, `/api/team`, `/api/stats`, `/api/funnels` (GET liste, POST création non publiée), `/api/funnels/templates`, `/api/funnels/:id` (GET détail), `/api/funnels/:id/{steps,rules,chat-agent,tracking}` (PUT), `/api/funnels/:id/embed` (GET), `/api/funnels/:id/publish` (POST), `/api/automation/*`, `/api/insights/{ads-performance,attribution,conversion-uploads}`, `/api/catalog/search`
- Helpers : `src/lib/api/insights.ts` (+ pur `insights-core.ts`), `catalog.ts` (+ `catalog-search.ts`), `crm.ts` (+ `crm-core.ts`), `funnel-config.ts` (+ pur `funnel-config-core.ts`) ; tests `npx tsx src/lib/api/insights.test.ts`, `npx tsx src/lib/api/funnel-config.test.ts`, `npx tsx src/lib/mcp/funnel-tools.test.ts`, `npx tsx src/lib/mcp/oauth.test.ts`
- MCP Streamable HTTP : `/api/mcp` — outils `src/lib/mcp/tools.ts` (annotations `readOnlyHint` / `destructiveHint` / `idempotentHint` / `openWorldHint`), prompts `src/lib/mcp/prompts.ts`
- Découverte OAuth : `/.well-known/oauth-protected-resource` et `/.well-known/oauth-protected-resource/api/mcp` (RFC 9728, cible du `WWW-Authenticate`), `/.well-known/oauth-authorization-server`
- Les URLs de découverte suivent l’hôte appelé s’il est dans la liste blanche `MCP_PUBLIC_HOSTS` (`src/lib/mcp/urls.ts` : www.quotebuilder.co, quotebuilder.co, quotebuilder-weld.vercel.app, localhost) ; sinon `NEXT_PUBLIC_APP_URL`. Le `resource` annoncé = l’URL saisie par le client, condition pour Claude / ChatGPT.
- Consentement : `/oauth/authorize` (admin org) ; DCR : `POST /oauth/register` ; tokens : `POST /oauth/token`
- UI : **Paramètres → API & webhooks**

Sur le serveur hébergé, `create_quote` / `list_quotes` / `get_quote_status` sont **toujours exposés**.

## Outils

| Domaine | Outils |
|---|---|
| Devis / leads | `list_quotes` / `get_leads`, `get_lead_detail`, `get_lead_timeline`, `get_quote_status`, `create_quote` / `create_lead`, `update_lead_status`, `add_lead_note`, `assign_lead`, `list_team` |
| Pilotage | `get_stats`, `list_funnels`, `get_funnel_performance`, `get_pending_followups`, `trigger_followup` |
| Google Ads | `get_ads_performance`, `get_attribution_breakdown`, `get_conversion_uploads` |
| Catalogue | `search_catalog` |
| Configuration de funnel | `get_funnel`, `list_funnel_templates`, `get_embed_code` (lecture) ; `create_funnel`, `update_funnel_steps`, `set_suggestion_rules`, `set_chat_agent`, `set_funnel_tracking`, `publish_funnel` (écriture) |

Prompts : `rapport_hebdo_ads`, `leads_a_relancer`, `preparer_devis`, `configurer_mon_funnel`.

### Configuration de funnel : sémantique

- **Brouillon = `configurators.is_active = false`**. L’app n’a pas d’autre statut : le bouton « Publier » de l’éditeur bascule `is_active`, et un funnel inactif n’est servi ni par `/c/…`, ni par le widget, ni par `/embed`. `create_funnel` insère directement `is_active=false` (chemin `parseCreateFunnelForm` + `insertFunnelFromTemplate`, comme le dialogue « Nouveau funnel »).
- **Funnel publié** : l’éditeur écrit en direct (pas de copie brouillon). Les outils d’écriture (`update_funnel_steps`, `set_suggestion_rules`, `set_chat_agent`) refusent donc un funnel publié sans `confirm_published=true`. `set_funnel_tracking` n’en a pas besoin (ne casse pas le parcours).
- **`publish_funnel`** exige `confirm=true` (publier et dépublier) et refuse la publication si `publish_check.blockers` n’est pas vide : une seule étape contact, en dernier ; étapes questions non vides ; options présentes ; étapes suggestions + customize pour un catalogue. L’app ne vérifiait rien à la publication : ces contrôles sont propres au MCP.
- **`update_funnel_steps`** : remplacement déclaratif ; `id` d’étape / de question = ligne conservée (clé de réponse inchangée), le reste est supprimé ; avertit si des règles utilisent une clé supprimée. Pas de transaction Supabase : en cas d’erreur d’écriture, l’outil le dit et il faut relire `get_funnel`.
- **`set_suggestion_rules`** : conditions normalisées pour `evaluateSuggestions` (libellé d’option → valeur, `contains` réservé au choix multiple…) ; produits résolus par ID, SKU, SKU de variation ou nom exact **dans le catalogue du funnel** (seul catalogue lu par le funnel), sinon erreur avec candidats.
- **Agent chat** : `configurators.theme.agent = { instructions, greeting }` (jsonb existant, pas de migration). `instructions` est injecté dans le prompt de l’agent commerce (`src/lib/commerce-agent/prompt.ts`) avant le bloc Safety et retiré des définitions publiques ; `greeting` remplace l’accueil du chat. Pas encore éditable dans l’UI.
- **Rôle** : jeton OAuth avec utilisateur → membre actif owner/admin requis au moment de l’écriture ; clé API → niveau organisation (comme les autres outils d’écriture).
- **Liens** : page publique sur `https://www.quotebuilder.co` quand l’app tourne sur l’hôte vercel.app ; `widget.js`, `/embed` et le téléchargement du plugin WordPress restent sur l’hôte de l’app (`funnelEmbedCodes`, partagé avec l’onglet « Lien & embed »).

## Côté package stdio

Voir `quotebuilder-mcp/README.md` pour Claude Desktop en local.

Flag **`MCP_DEVIS_V0=1`** : n’existe que sur le process stdio (historique). Le serveur HTTP n’en a pas besoin.
