# Organisation démo QuoteBuilder

Espace dédié, namespacé, ré-ensemençable. Sert aux agents (captures, docs, blog) et aux tests manuels sur le produit réel.

| | |
|---|---|
| Slug | `demo` |
| Nom | QuoteBuilder Démo |
| Version seed | `DEMO_SEED_VERSION` dans `src/lib/demo/constants.ts` |
| Prod | https://www.quotebuilder.co |
| Funnel public | `/c/demo/rayonnage` |
| Boutique | `/b/demo/vitrine` |

L’org `quickly` (migration SQL) reste le pilote métier. Ne pas y mélanger ce seed.

## Comptes

Les e-mails sont publics (raccourcis sur `/login`). **Le mot de passe n’est pas dans le repo.**

| Rôle | E-mail |
|---|---|
| Super admin plateforme | `admin@quotebuilder.app` |
| Owner de l’espace | `demo@quotebuilder.app` |
| Commercial | `sales@quotebuilder.app` |

### Mot de passe

1. Choisir un mot de passe fort.
2. Le stocker hors git : secret Cursor / Vercel (`DEMO_PASSWORD`), gestionnaire d’équipe.
3. Lancer le seed (crée ou met à jour les utilisateurs Auth + memberships).

```bash
# Une fois, en local ou CI admin — service role requis
export NEXT_PUBLIC_SUPABASE_URL=https://spgskgtycqxjziwjpjol.supabase.co
export SUPABASE_SERVICE_ROLE_KEY=…          # jamais dans git
export DEMO_PASSWORD=…                      # jamais dans git
npm run seed:demo
```

Le script lit aussi `.env.local` s’il existe. Il n’affiche jamais le mot de passe.

One-click sur `/login` : uniquement si `NEXT_PUBLIC_DEMO_PASSWORD` est défini sur le déploiement (la valeur part dans le JS). À éviter en production publique ; OK sur un preview démo.

### Lien magique (sans taper le mot de passe)

```bash
npm run seed:demo -- --print-magic-link
# ou
npm run seed:demo -- --print-magic-link --email=sales@quotebuilder.app
```

Ouvre une session owner (ou l’e-mail demandé) via `auth.admin.generateLink`. Le lien expire ; ne pas le committer.

Connexion manuelle : https://www.quotebuilder.co/login — e-mail ci-dessus + `DEMO_PASSWORD`.

## Lancer le seed

Idempotent : upsert par slug / SKU / e-mail / token. Relancer après un merge est sûr sur l’org `demo` seulement.

```bash
npm run seed:demo
npm run seed:demo -- --only=catalog,quotes
npm run test:demo-seed
```

Modules (ordre, `src/lib/demo/registry.ts`) :

| Module | Contenu |
|---|---|
| `org` | Organisation, branding, PDF |
| `accounts` | Users Auth + memberships |
| `crm` | `seedOrgCrm` : statuts, templates mail, workflows |
| `funnel` | Funnel `rayonnage` (template racking, wizard + chat) |
| `catalog` | Produits `QB-DEMO-*` + règles Si/Alors |
| `quotes` | Demandes FR, scores, pipeline, notes, activité |
| `sessions` | Abandons `qb-demo-abandon-*` |
| `shop` | Boutique native `vitrine` |
| `segments` | Hot, B2B, entrepôt |
| `analytics` | Événements 21 jours (skip si déjà là) |

`crm` réutilise `seedOrgCrm` / `ensureDefaultEmailTemplates` / `ensureDefaultWorkflows` (insert-if-missing). `shop` passe par `insertShopFromTemplate`.

## Étendre (nouvelle feature)

1. Ajouter un module `src/lib/demo/modules/<feature>.ts` qui upsert, jamais un delete global.
2. L’enregistrer dans `SEED_MODULES` (`registry.ts`).
3. Ajouter l’écran dans `WALKTHROUGH_SCREENS` (`walkthrough.ts`) **et** dans `.cursor/skills/quotebuilder-demo/SKILL.md`.
4. Incrémenter `DEMO_SEED_VERSION` si le contrat de données change.
5. Couvrir SKU / e-mails / slugs uniques dans `src/lib/demo/seed.test.ts`.

Ne pas inventer un second seed parallèle. Ne pas toucher l’org `quickly` depuis ces modules.

## Première fois en prod

1. Secrets Vercel / Cursor : `SUPABASE_SERVICE_ROLE_KEY`, `DEMO_PASSWORD`.
2. `npm run seed:demo` depuis une machine qui a ces secrets (pas une Action publique).
3. Vérifier https://www.quotebuilder.co/login avec `demo@quotebuilder.app`.
4. Partager le mot de passe aux agents via le coffre d’équipe, pas Slack en clair.

`scripts/seed-demo-users.mjs` délègue à ce CLI (rétrocompat).

## URLs publiques cassées (`/c/demo/rayonnage`, `/b/demo/vitrine`)

Les résolveurs publics honorent les alias de l’org `demo` uniquement
(`principal` / `funnel-rayonnage` → funnel, `espace-demo` / `vitrine-rayonnage` → boutique).
Le seed v2 remap ces slugs vers `rayonnage` et `vitrine`.

Si la prod a encore les slugs hérités **et** que le seed ne peut pas tourner tout de suite :

1. Ouvrir le SQL editor du projet Supabase `spgskgtycqxjziwjpjol`.
2. Exécuter `scripts/fix-demo-public-slugs.sql` (idempotent, org `demo` seulement).
3. Dès que les secrets sont dispo : `npm run seed:demo` pour aligner nom, chat, catalogue et boutique.

Vérifier :

```bash
curl -sS "https://www.quotebuilder.co/api/public/configurator/demo/rayonnage" | jq '.configurator.slug,.configurator.chatEnabled'
curl -sS -o /dev/null -w "%{http_code}\n" "https://www.quotebuilder.co/b/demo/vitrine"
```
