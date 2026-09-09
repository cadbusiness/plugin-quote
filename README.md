# QuoteBuilder

SaaS de génération de devis intelligent (wizard + chat IA). Pilote : Quickly International.

## Démarrage

```bash
cp .env.example .env.local
# renseigner SUPABASE_SERVICE_ROLE_KEY, ANTHROPIC_API_KEY, RESEND_API_KEY
npm install
npm run dev
```

- Configurateur public : [http://localhost:3000/c/quickly/rayonnage](http://localhost:3000/c/quickly/rayonnage)
- Dashboard : [http://localhost:3000/signup](http://localhost:3000/signup) puis `/onboarding` pour créer ou rejoindre un espace (Quickly = un client parmi d’autres)
- Embed : `/embed/quickly/rayonnage`
- Widget : `http://localhost:3000/widget.js`

```html
<div data-quotebuilder data-org="quickly" data-id="rayonnage"></div>
<script src="https://VOTRE_DOMAINE/widget.js"></script>
```

WordPress : plugin dans `extensions/quotebuilder-wp/`. Shortcode `[quotebuilder org="quickly" id="rayonnage"]`. Dans WordPress, **Connecter** ouvre QuoteBuilder (login + choix du funnel) puis importe le catalogue WooCommerce. Le zip et la version sont générés au build (`/quotebuilder-wp.zip`, `/api/public/plugin/wordpress`). Les sites en 2.1+ voient les mises à jour dans Extensions.

## Catalogue connecté (WooCommerce / Shopify)

`Boutiques` (`/integrations`) branche le catalogue d’une boutique sur un funnel : produits, descriptions, photos, prix, déclinaisons.

- **WooCommerce** : URL du site + clé API REST en lecture seule (`/wp-json/wc/v3`). Le plugin WordPress se connecte en un clic : il ouvre QuoteBuilder, crée la clé et les webhooks produits, puis importe le catalogue.
- **Shopify** : domaine `*.myshopify.com` + jeton d’une app personnalisée avec la portée `read_products` (Admin GraphQL, version pilotée par `SHOPIFY_API_VERSION`).
- Sync manuelle, planifiée (`/api/cron/catalog-sync`, 4h30) et temps réel par webhook signé (`/api/integrations/<id>/webhook`).
- Les accès boutique sont chiffrés en AES-256-GCM avec `INTEGRATIONS_SECRET_KEY` (à défaut `SUPABASE_SERVICE_ROLE_KEY`).

App Flutter (iOS / Android) : dossier [`mobile/`](mobile/), `cd mobile && flutter run`.

## Stack

Next.js 16, Supabase (`spgskgtycqxjziwjpjol`), Claude, Resend, React-PDF.
