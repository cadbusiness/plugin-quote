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

WordPress : shortcode `[quotebuilder org="quickly" id="rayonnage"]` — zip dans `extensions/quotebuilder-wp.zip`.

App Flutter (iOS / Android) : dossier [`mobile/`](mobile/) — `cd mobile && flutter run`.

## Stack

Next.js 16, Supabase (`spgskgtycqxjziwjpjol`), Claude, Resend, React-PDF.
