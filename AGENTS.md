<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Deux surfaces — travailler en parallèle

QuoteBuilder a **deux surfaces dans le même repo**. Dans un même chat, on peut (et on doit) itérer les deux sans tout sérialiser.

| Surface | Routes | Dossier |
|---|---|---|
| Prospect (configurateur) | `/c/[org]/[slug]`, `/embed/...`, `/widget.js` | `src/app/(public)/`, `src/components/configurator/` |
| Dashboard client | `/devis`, `/wizard`, `/produits`, `/templates`, `/webhooks` | `src/app/(app)/`, `src/components/app-shell/`, `src/components/ui/` |
| App Flutter | iOS / Android — devis + configurateur | `mobile/` |

Si la demande touche les deux (ex. une question wizard + la liste devis), **faire les deux dans le même tour**.

## Server Actions — lectures vs mutations

- Server Actions = mutations only.
- Lectures initiales → SSR dans `page.tsx` via `src/lib/...`.
- Lectures client après interaction → `GET` `src/app/api/...`.
- Supabase : pas d’embeds PostgREST fragiles ; requêtes séparées + join JS.
- Logique partagée dans `src/lib/`.

## Shell dashboard

Pages `src/app/(app)/` : `ListPanel` + `ListToolbar` + `DataTable`.

- Bord à bord : listes flush dans `ListPanel` — jamais de carte inset (`p-4` + `rounded-* border`).
- Pas de `<h1>` redondant si la sidebar indique déjà la section.
- Référence : `.cursor/rules/ui-list-pages.mdc` et `.cursor/rules/ui-shell-design.mdc`.
