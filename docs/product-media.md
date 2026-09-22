# Rôles média produit

Les pages Woo mélangent photo produit, plan technique et photo d’usage dans une seule galerie. QuoteBuilder range chaque image pour le devis.

Stockage : `products.images` (jsonb), chaque entrée `{ src, alt, role? }`.

Rôles : `product` (photo), `plan` (schéma, cotation), `usage` (chantier, pose, en situation).

La couverture des cartes (`image_url` à la synchro, et la photo du parcours) est la première image `product`. Sans rôle, l’ordre existant est conservé. Plan et usage restent accessibles en vignettes, à part.

## Lecture Woo

Pour chaque image, dans cet ordre :

1. Meta produit `_qb_media_role` (objet ou JSON) : clé = id d’image, URL, ou nom de fichier. Exemple : `{ "42": "plan", "pose-entrepot.jpg": "usage" }`. Une liste `[{ "id": 42, "role": "plan" }]` est acceptée.
2. Préfixe d’alt ou de titre : `[plan]`, `[usage]`, `[product]`.
3. Mots du alt, du titre et du nom de fichier (`plan`, `schema`, `cote`, `drawing`, `usage`, `chantier`, `installation`, `pose`, …).
4. Sinon `product`, sans écraser un rôle déjà enregistré sur la même URL.

La description HTML n’est pas lue. Un pull sans signal ne remplace pas un rôle saisi dans QuoteBuilder. `sync_lock` (ou une fiche retouchée quand « protéger les modifications locales » est actif) laisse toute la fiche intacte.

## Devis

Catalogue du funnel et étape produit : pastilles / tableau depuis `products.specs`. La carte montre la photo produit. Plan et usage s’ouvrent en petit, seulement s’ils existent.

## Admin

La fiche produit édite les cinq specs (valeur + unité) sans les perdre à l’enregistrement. Chaque vignette a un rôle Photo / Plan / Usage.
