---
name: quotebuilder-demo
description: Parcours produit QuoteBuilder sur l’org démo (slug demo). Login, écrans à capturer, re-seed et extension quand une feature ship.
---

# Parcours produit — org démo

Utiliser l’espace **QuoteBuilder Démo** (`slug: demo`), pas Quickly, pas un compte perso. Données FR, ré-ensemençables.

Détail technique : `docs/demo-org.md`. Registre écrans : `src/lib/demo/walkthrough.ts`. Modules : `src/lib/demo/registry.ts`.

## Connexion

Base prod : `https://www.quotebuilder.co` (sinon l’URL Vercel du preview).

1. Ouvrir `/login`.
2. Compte owner pour le dashboard : `demo@quotebuilder.app`.
3. Mot de passe = secret d’environnement `DEMO_PASSWORD` (hors git). Si absent, demander à Robin / le coffre d’équipe — **ne pas inventer ni committer un mot de passe**.
4. Variante sans mot de passe : `npm run seed:demo -- --print-magic-link` (service role) puis ouvrir le lien une fois.
5. Compte commercial (assignation) : `sales@quotebuilder.app`. Super admin : `admin@quotebuilder.app` → `/admin`.

Sur `/login`, « Accès test » remplit l’e-mail. Le one-click n’existe que si `NEXT_PUBLIC_DEMO_PASSWORD` est posé sur ce déploiement.

Après login owner : `/accueil`.

## Écrans à capturer

Parcourir dans cet ordre. Toute la ligne ouvre le détail. Pas d’emoji. Shell flush (`ListPanel`).

| # | Écran | Chemin | Quoi montrer |
|---|---|---|---|
| 1 | Connexion | `/login` | Accès test, e-mails démo |
| 2 | Tableau de bord | `/accueil` | KPI, pipeline, abandons |
| 3 | Demandes | `/devis` | Scores hot/warm/cold, statuts couleur, liste flush |
| 4 | Dossier | `/devis/{id}` | Réponses, lignes, note, activité, message (ex. Claire Martin / Léa Moreau) |
| 5 | Abandons | `/sessions` | Sessions stale avec e-mail (Dock Ouest, Atelier Sud) |
| 6 | Automatisations | `/automations` | Parcours soumission + abandon |
| 7 | Canvas | `/automations/{id}` | E-mails, wait, branches |
| 8 | Catalogue | `/produits` | SKU `QB-DEMO-*`, fourchettes |
| 9 | Si/Alors | `/produits/regles` | Entrepôt / commerce / atelier |
| 10 | Funnels | `/funnels` | Funnel rayonnage, formulaire + chat |
| 11 | Builder | `/funnels/{id}` | Steps, questions |
| 12 | Boutiques | `/integrations` | Vitrine rayonnage publiée |
| 13 | Builder boutique | `/integrations/shop/{id}` | Pages accueil / catalogue / légales |
| 14 | Stats | `/stats` | Tunnel visites → devis |
| 15 | Segments | `/segments` | Chauds, B2B, entrepôt |
| 16 | Équipe | `/equipe` | Owner + commercial |
| 17 | Funnel public | `/c/demo/rayonnage` | Wizard prospect |
| 18 | Boutique publique | `/b/demo/vitrine` | Mini-site devis, pas de paiement |

IDs : première ligne de `/devis`, `/automations`, `/funnels`, `/integrations`.

Captures pour docs/blog : desktop d’abord ; mobile si le layout change. Ne pas montrer de secrets, ni de vraies clés API.

## Re-seed

```bash
export SUPABASE_SERVICE_ROLE_KEY=…   # secret
export DEMO_PASSWORD=…               # secret
npm run seed:demo
```

Idempotent sur l’org `demo` uniquement. `--only=catalog,quotes` pour un module. Tests sans DB : `npm run test:demo-seed`.

## Étendre (feature shipped)

1. Module `src/lib/demo/modules/<feature>.ts` — upsert, pas de wipe.
2. L’ajouter à `SEED_MODULES`.
3. Ajouter une ligne ici **et** dans `WALKTHROUGH_SCREENS`.
4. Bumper `DEMO_SEED_VERSION` si le contrat change.
5. Relancer le seed, capturer le nouvel écran.

Ne pas créer un seed parallèle. Ne pas écrire de mot de passe dans le skill, le blog, ou un commit.
