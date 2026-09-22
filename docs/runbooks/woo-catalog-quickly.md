# Catalogue Woo → org `quickly`

La connexion catalogue n’est pas le badge « Connecté » du plugin. Ce badge veut dire que WordPress a un `connection_id` et un jeton. L’import des produits passe par `catalog_connections` et `POST` `/api/integrations/pair`, puis `runCatalogSync`.

État relevé le 22 septembre 2026 sur le projet Supabase `spgskgtycqxjziwjpjol` :

- Org `quickly` (`6449ca2d-9556-42fc-9ac6-b9de0bf5b6f6`) : 1 connexion WooCommerce, pas 0.
- Domaine enregistré : `https://quickly-int.com`.
- 96 produits WooCommerce actifs (identifiants Woo 8969, 8966, 8952, …) et 30 catégories distinctes. Les 8 fiches manuelles du seed sont inactives.
- Catégorie principale dans `products.category`, les autres dans `products.tags` (ex. BAC PLIABLE 600X400X215 : Bacs de rangement, Bacs pliable, Divers).
- Le site Hostinger `https://mintcream-mosquito-831101.hostingersite.com` expose les mêmes 96 produits et les mêmes identifiants. Le plugin y est actif. `quickly-int.com` ne charge pas le plugin en vitrine.
- Dernière synchro : 22 septembre 2026 04:55 UTC, connexion active, 96 produits. La passe de 04:49 UTC était `done` (96 ignorés, 0 échec). Aucun e-mail.

Le cron `GET /api/cron/catalog-sync` (4 h 30 UTC) répond 401 en production : `CRON_SECRET` n’est pas défini sur le projet Vercel `quotebuilder`. Vercel n’envoie le Bearer que si cette variable existe. La synchro manuelle et le bouton du plugin ne passent pas par ce cron.

## Lier l’URL Hostinger sans dupliquer le catalogue

Après déploiement de cette branche :

1. Ouvrir QuoteBuilder, org Quickly, **Boutiques**, ligne WooCommerce `https://quickly-int.com`.
2. Dans **URL WooCommerce**, coller `https://mintcream-mosquito-831101.hostingersite.com`.
3. Enregistrer. Le serveur teste les clés REST déjà stockées. Si elles répondent, l’URL change et l’import repart sur la même connexion (`external_id` inchangé). Les fiches manuelles inactives ne sont pas réactivées.
4. Si le bandeau d’erreur dit que les clés ne marchent pas sur cette URL : dans l’admin WordPress du site Hostinger, QuoteBuilder → reconnecter la boutique (compte admin Quickly). L’appairage met à jour cette unique connexion Woo au lieu d’en créer une seconde. Puis **Synchroniser maintenant**.

Ne pas créer une deuxième connexion pour le même catalogue : les produits seraient doublés (unicité `connection_id + external_id`).

Plugin 2.3.11 envoie `site_url` au rafraîchissement et à la synchro. Tant que le site est en 2.3.10, utiliser le champ URL ci-dessus. Publier le zip ensuite : `SUPABASE_SERVICE_ROLE_KEY=… npm run publish:wp-plugin`.

## Script service role

Aucun e-mail. Réservé à l’org `quickly`.

```bash
export NEXT_PUBLIC_SUPABASE_URL=https://spgskgtycqxjziwjpjol.supabase.co
export SUPABASE_SERVICE_ROLE_KEY=…   # secret, hors git
npm run sync:quickly-woo -- --site=https://mintcream-mosquito-831101.hostingersite.com
```

Sans `--site`, la synchro rejoue l’URL déjà enregistrée. Si les clés ne marchent pas sur la nouvelle URL, le script s’arrête et ne change pas le domaine.
