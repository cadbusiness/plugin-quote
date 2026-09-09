# Agent commerce QuoteBuilder (B2B devis)

Référence produit : Anthropic a publié le 2 sept. 2026 le blueprint Apache 2.0 [`anthropics/commerce-agents`](https://github.com/anthropics/commerce-agents) — shopping agent + merchant agent, verticals retail / travel / telecom / entertainment. Claude y est explicitement la **couche d’intelligence**, pas le storefront ni le checkout.

QuoteBuilder applique le même pattern au **devis B2B sur mesure PME**, vertical absent du blueprint.

## Ce qui vit dans ce repo

| Module | Rôle |
|---|---|
| `src/lib/commerce-agent/` | Harness TypeScript : boucle Messages API, tools, gates, fencing, search catalogue |
| `src/lib/chat/claude.ts` | Adaptateur vers la route publique |
| `POST /api/public/sessions/[id]/chat` | Hôte session (identité déjà liée au token) |

On **n’embarque pas** le monorepo Python Anthropic. Les contrats (StorefrontBackend, skills, approval) sont réimplémentés sur Next + Supabase.

## Outils prospect

1. `update_brief` — paramètres wizard
2. `search_catalog` — ranking local sur `definition.products`
3. `match_configurations` — Si/Alors existants (`evaluateSuggestions`)
4. `collect_contact` — email validé côté serveur
5. `present_configurations` — gated : catalogue touché
6. `handoff_quote` — gated : email présent ; **aucun paiement**

## Suite

- Streaming + UI composants typés (carousel configs)
- Suite d’évals (scénarios Quickly)
- Merchant agent dashboard (NL + approval) — Phase 2 carte produit
