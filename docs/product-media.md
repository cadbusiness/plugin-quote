# Rôles média produit

Les pages Woo mélangent photo produit, plan technique et photo d’usage dans une seule galerie. QuoteBuilder range chaque image pour le devis.

Stockage : `products.images` (jsonb), chaque entrée `{ src, alt, role? }`.

Rôles : `product` (photo), `plan` (schéma, cotation), `usage` (chantier, pose, en situation), `manual` (photo de notice ou de montage).

Un PDF, un lien ou un texte court de mode d’emploi n’entre pas dans cette galerie. Il vit dans `products.sheet` — voir plus bas.

La couverture des cartes (`image_url` à la synchro, et la photo du parcours) est la première image `product`. Sans rôle, l’ordre existant est conservé. Plan et usage restent accessibles en vignettes, à part.

## Lecture Woo

Pour chaque image, dans cet ordre :

1. Meta produit `_qb_media_role` (objet ou JSON) : clé = id d’image, URL, ou nom de fichier. Exemple : `{ "42": "plan", "pose-entrepot.jpg": "usage" }`. Une liste `[{ "id": 42, "role": "plan" }]` est acceptée.
2. Préfixe d’alt ou de titre : `[plan]`, `[usage]`, `[product]`.
3. Mots du alt, du titre et du nom de fichier (`plan`, `schema`, `cote`, `drawing`, `usage`, `chantier`, `pose`, `notice`, `emploi`, `montage`, `installation`, `assembly`, …). `installation` et `montage` classent la photo en notice, pas en usage. En cas d’égalité, la notice l’emporte sur le plan, puis le plan sur l’usage.
4. Sinon `product`, sans écraser un rôle déjà enregistré sur la même URL.

La description HTML n’est pas lue. Un pull sans signal ne remplace pas un rôle saisi dans QuoteBuilder. `sync_lock` (ou une fiche retouchée quand « protéger les modifications locales » est actif) laisse toute la fiche intacte.

## Devis

Catalogue du funnel et étape produit : pastilles / tableau depuis `products.specs`. La carte montre la photo produit. Plan, usage et notice s’ouvrent en petit, seulement s’ils existent. Le mode d’emploi (lien ou texte) est un bloc replié sous les specs, pas dans la grille de cartes.

## Mode d’emploi

Colonne `products.sheet` (jsonb) :

```json
{
  "manualText": "Assembler les échelles avant les lisses.",
  "documents": [
    { "role": "manual", "src": "https://exemple.test/notice.pdf", "label": "Mode d'emploi" },
    { "role": "certificate", "src": "https://exemple.test/ce.pdf", "label": "Conformité" },
    { "role": "warranty", "src": "https://exemple.test/garantie.pdf", "label": "Garantie" }
  ]
}
```

`manual` est le mode d’emploi. `certificate` (déclaration CE, conformité) et `warranty` (garantie) suivent le même lien, sans texte libre.

Lecture Woo, sans reprendre la description HTML :

1. Meta `_qb_manual` : URL, texte court, ou `{ "url", "label", "text" }`. Un HTML long ou le même texte que la description est ignoré.
2. Meta `_qb_certificate` et `_qb_warranty` : URL ou `{ "url", "label" }`.
3. Téléchargements Woo (`downloads`) dont le nom ou le fichier contient `notice`, `mode d'emploi`, `montage`, `installation`, `assembly`, `conformité`, `garantie`, …
4. Fichier PDF / document dans la galerie, avec les mêmes mots. Une photo de montage reste une image `manual`.

Un pull vide ne vide pas `manualText` ni les documents déjà saisis. Un rôle reçu remplace ce rôle et laisse les autres. `sync_lock` laisse toute la fiche intacte. L’export boutique renvoie `_qb_manual`, `_qb_certificate`, `_qb_warranty` et le rôle image `manual` dans `_qb_media_role`. Il ne réécrit pas la liste `downloads`.

## Admin

La fiche produit édite les cinq specs (valeur + unité) sans les perdre à l’enregistrement. Chaque vignette a un rôle Photo / Plan / Usage / Notice. Le mode d’emploi se saisit à part : texte court, lien de notice, conformité, garantie.
