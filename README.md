# QuoteBuilder

SaaS de génération de devis intelligent (wizard + **agent commerce B2B**). Pilote : Quickly International.

Le chat prospect suit les patterns du blueprint Anthropic [`commerce-agents`](https://github.com/anthropics/commerce-agents) (boucle outils, catalogue, gates) adapté au devis PME — pas un fork du repo Python.

## Démarrage

```bash
cp .env.example .env.local
# renseigner SUPABASE_SERVICE_ROLE_KEY, ANTHROPIC_API_KEY, RESEND_API_KEY
npm install
npm run dev
```

- Configurateur public : [http://localhost:3000/c/quickly/rayonnage](http://localhost:3000/c/quickly/rayonnage)
- Dashboard : [http://localhost:3000/signup](http://localhost:3000/signup) puis `/onboarding` pour créer ou rejoindre un espace (Quickly = un client parmi d’autres)
- Org démo agents / docs : slug `demo` — `DEMO_PASSWORD=… npm run seed:demo` puis `/login` (`demo@quotebuilder.app`). Voir `docs/demo-org.md` et `.cursor/skills/quotebuilder-demo/SKILL.md`.
- Embed : `/embed/quickly/rayonnage`
- Widget : `http://localhost:3000/widget.js`

```html
<div data-quotebuilder data-org="quickly" data-id="rayonnage"></div>
<script src="https://VOTRE_DOMAINE/widget.js"></script>
```

WordPress : plugin dans `extensions/quotebuilder-wp/`. Shortcode `[quotebuilder org="quickly" id="rayonnage"]`. Dans WordPress, **Connecter** ouvre QuoteBuilder (login + choix du funnel) puis importe le catalogue WooCommerce. Le zip et la version sont générés au build (`/quotebuilder-wp.zip`, `/api/public/plugin/wordpress`). Les sites en 2.1+ voient les mises à jour dans Extensions.

MCP (Claude Desktop) : package `quotebuilder-mcp/` — voir `docs/mcp.md`. Clés API dans **Paramètres → API & webhooks**.

### Plugin WP — auto-update (pattern BeautyHub)

Le plugin vérifie le manifeste public Supabase (`bucket wp-plugin` → `info.json`) et propose la mise à jour dans **Extensions**, sans passer par wordpress.org.

```bash
# 1. Appliquer la migration 0014_wp_plugin_bucket.sql
# 2. Bumper Version dans extensions/quotebuilder-wp/quotebuilder.php
# 3. Publier zip + manifeste
SUPABASE_SERVICE_ROLE_KEY=… npm run publish:wp-plugin
```

Secours : `GET /api/public/wp-plugin` (Vercel) si le bucket n’est pas encore peuplé.

## Boutique QuoteBuilder + catalogues connectés

`Boutiques` (`/integrations`) gère deux choses : une **boutique native** (mini-site devis, URL `/b/[org]/[slug]`) et les **catalogues Woo / Shopify**.

- Boutique native : template sectoriel ou chat IA, pages (accueil, catalogue, mentions, CGV, confidentialité, cookies), menus, builder drag-and-drop, SEO / GEO. CTA = demander un devis, pas de paiement.
- **WooCommerce** : URL du site + clé API REST en lecture seule (`/wp-json/wc/v3`). Le plugin WordPress se connecte en un clic : il ouvre QuoteBuilder, crée la clé et les webhooks produits, puis importe le catalogue.
- **Shopify** : domaine `*.myshopify.com` + jeton d’une app personnalisée avec la portée `read_products` (Admin GraphQL, version pilotée par `SHOPIFY_API_VERSION`).
- Sync manuelle, planifiée (`/api/cron/catalog-sync`, 4h30) et temps réel par webhook signé (`/api/integrations/<id>/webhook`).
- Les accès boutique connectée sont chiffrés en AES-256-GCM avec `INTEGRATIONS_SECRET_KEY` (à défaut `SUPABASE_SERVICE_ROLE_KEY`).

App Flutter (iOS / Android) : dossier [`mobile/`](mobile/), `cd mobile && flutter run`.

## Stack

Next.js 16, Supabase (`spgskgtycqxjziwjpjol`), Claude (agent devis `src/lib/commerce-agent/`), Resend, React-PDF.
