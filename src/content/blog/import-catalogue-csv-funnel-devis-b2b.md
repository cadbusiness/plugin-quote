---
title: "Importer son catalogue en CSV pour un funnel de devis B2B : colonnes, SKU, prix et pièges d'Excel"
slug: import-catalogue-csv-funnel-devis-b2b
description: "Comment importer un catalogue produits en CSV dans QuoteBuilder : colonnes reconnues, rôle du SKU, prix fixes ou en fourchette, ce que la mise à jour efface, et les pièges d'un fichier Excel français (point-virgule, encodage, zéros perdus). Avec un vérificateur gratuit."
canonical: /blog/import-catalogue-csv-funnel-devis-b2b
locale: fr-FR
word_count_target: 3000
keywords:
  - importer catalogue CSV
  - import produits CSV logiciel devis
  - fichier CSV catalogue B2B
  - CSV point-virgule Excel import
  - SKU mise à jour catalogue
  - catalogue funnel de devis
  - tarif Excel vers configurateur
author: QuoteBuilder
date: 2026-10-14
updated: 2026-10-14
---

# Importer son catalogue en CSV pour un funnel de devis B2B : colonnes, SKU, prix et pièges d'Excel

Le catalogue d'une PME B2B vit presque toujours dans un fichier Excel : un onglet par gamme, une colonne « Désignation », une colonne « Prix HT », et une version « tarif 2026 v3 définitif » envoyée par email au commercial. Le jour où l'on veut mettre ce catalogue derrière un funnel de devis, la tentation est de tout ressaisir. Avec 40 références, ça passe. Avec 400, quelqu'un y passe deux jours, et se trompe dans une dizaine de prix.

QuoteBuilder accepte un import CSV. Ça va vite quand le fichier est propre. Avec un fichier exporté tel quel d'un Excel français, il y a de bonnes chances que l'import refuse le fichier ou laisse de côté la moitié des colonnes. Voici ce que l'import lit vraiment, colonne par colonne, ce que fait le SKU, ce que la mise à jour écrase, et comment préparer un fichier qui passe du premier coup. Les règles décrites sont celles de l'import au 14 octobre 2026.

**Vérifier un fichier avant de l'importer :** le [vérificateur de fichier CSV catalogue](https://www.quotebuilder.co/outils/verificateur-csv-catalogue-devis) applique les mêmes règles, dans votre navigateur, sans rien envoyer. Pour voir un catalogue derrière un funnel côté prospect : [démo funnel rayonnage](https://www.quotebuilder.co/c/demo/rayonnage). Pour importer le vôtre : [créer un compte Free](https://www.quotebuilder.co/signup?plan=free).

## Pourquoi le catalogue passe avant le funnel

Un funnel sans catalogue pose des questions et transmet des réponses. Avec un catalogue, trois choses changent.

- **Les suggestions.** À l'étape « Solutions recommandées », les règles Si/Alors choisissent quels produits montrer selon les réponses. Une règle pointe vers des produits précis du catalogue : sans produits, pas de suggestion. Le détail est dans [les règles de suggestion produits](https://www.quotebuilder.co/blog/regles-suggestion-produits-funnel-devis-b2b).
- **Le prix indicatif.** Chaque produit porte un prix fixe, une fourchette, ou rien (« Sur devis »). Le montant d'une ligne vaut le prix unitaire multiplié par la quantité, et la fourchette affichée au prospect en découle. Voir [la fourchette de prix indicative](https://www.quotebuilder.co/blog/fourchette-prix-indicative-demande-devis-b2b).
- **Le dossier.** La demande arrive avec des lignes produits, pas avec « il voudrait un truc pour son entrepôt ».

Le catalogue est rattaché à un funnel : à l'import, vous choisissez le funnel qui reçoit les produits. Avec deux funnels, vous importez deux fois. S'il n'existe encore aucun funnel, l'import s'arrête avec ce message : « Créez d'abord un funnel : le catalogue s'y rattache. »

## Où se trouve l'import

L'import se fait depuis le menu **Catalogue**, sur l'onglet **Produits** ou sur l'onglet **Importation**, avec le bouton **Importer**. Le menu Catalogue n'apparaît que pour le Propriétaire et les Admins (voir [rôles et permissions d'équipe](https://www.quotebuilder.co/blog/roles-permissions-equipe-demande-devis-b2b)).

La fenêtre d'import compte trois étapes, affichées « Import CSV · 1 / 3 » en haut :

1. **Votre fichier catalogue.** Vous déposez le CSV ou vous cliquez pour le choisir, vous choisissez le « Funnel qui reçoit les produits », et vous pouvez télécharger un modèle CSV.
2. **Contrôle du fichier.** QuoteBuilder lit le fichier et affiche le nombre de produits prêts, les lignes ignorées, les colonnes ignorées, les premiers signalements, et un aperçu du premier produit.
3. **Import en cours, puis Import terminé.** Une jauge, puis le bilan : « 12 créés · 3 mis à jour ».

Le bouton « Importer 15 produits » reste grisé tant que le fichier n'a pas de colonne nom reconnue ou ne contient aucune ligne produit lisible.

## Les colonnes que l'import reconnaît

L'import lit sept champs. Pour chacun, il accepte quelques noms de colonne :

| Champ | Noms de colonne acceptés | Ce que ça devient |
|-------|--------------------------|-------------------|
| Nom | `name`, `nom`, `product_name` | Le nom du produit, obligatoire |
| SKU | `sku`, `reference`, `ref` | La référence, clé de mise à jour |
| Catégorie | `category`, `categorie`, `categories` | Le rayon du catalogue |
| Prix min | `price_min`, `prix_min`, `price`, `regular_price` | Le bas de la fourchette, ou le prix fixe |
| Prix max | `price_max`, `prix_max` | Le haut de la fourchette |
| Tags | `tags`, `etiquettes` | Des étiquettes, séparées par une virgule, un point-virgule ou une barre verticale |
| Description | `description` | Le texte de la fiche |

Avant de comparer, l'import met les en-têtes en minuscules, retire les accents et remplace les espaces et la ponctuation par un tiret bas. « Prix min » devient donc `prix_min`, « Catégorie » devient `categorie`, « Référence » devient `reference`. Vous pouvez garder des en-têtes lisibles en français, tant qu'ils retombent sur un nom de la liste.

Ce qui ne retombe pas sur la liste est ignoré, et la fenêtre de contrôle l'indique (« Colonnes ignorées : … »). Trois cas reviennent souvent dans les fichiers français :

- **« Prix » ou « Prix HT »** tout court n'est pas reconnu. `price` l'est, `prix` non. Renommez la colonne en « Prix min », et ajoutez une colonne « Prix max » avec la même valeur si le prix est fixe.
- **« Désignation » ou « Libellé »** n'est pas reconnu comme nom. Sans colonne nom, l'import refuse le fichier entier.
- **« Code article »** n'est pas reconnu comme SKU. Renommez-le en « Référence » ou « SKU ».

Le modèle téléchargeable depuis la fenêtre d'import montre le format attendu :

```
name,sku,category,price_min,price_max,tags,description
Rayonnage mi-lourd,RAY-ML-2010,Rayonnage,189,420,"entrepot,lourd","Echelles et lisses pour charges moyennes"
Bac gerbable,BAC-600,Bacs de rangement,18.42,18.42,"plastique,alimentaire","Bac blanc gerbable"
```

## Les prix : fixe, fourchette ou sur devis

Le CSV porte deux colonnes de prix, et c'est leur combinaison qui fait le prix affiché :

- **Prix min et prix max identiques** : un prix fixe. Le bac à 18.42 et 18.42 s'affiche comme un seul montant.
- **Prix min et prix max différents** : une fourchette, « 189 € à 420 € ».
- **Les deux vides** : « Sur devis ».
- **Une seule des deux colonnes remplie** : le produit a un seul montant affiché, sans fourchette.

Si le prix min est plus haut que le prix max, l'import remet les deux dans l'ordre. Une erreur de saisie 420 / 189 devient 189 / 420.

Quatre détails comptent pour un fichier français :

1. **La virgule décimale passe**, à condition que la cellule soit entre guillemets dans le fichier (`"18,42"`). L'import remplace la première virgule par un point avant de lire le nombre. Sans guillemets, la virgule coupe la cellule en deux : le prix devient 18 et les colonnes suivantes sont décalées.
2. **Le point des milliers ne passe pas.** `1.234,50` est signalé « Prix min illisible » et le produit est importé sans ce prix. Pire, `1.234` sans décimales est lu 1,234 €, sans aucun signalement. Écrivez 1234 ou 1234,50, sans séparateur de milliers. Une espace entre les milliers est tolérée : elle est retirée.
3. **Un prix écrit en lettres devient 0 €.** « sur demande » ou « NC » dans une colonne de prix ne déclenche aucun signalement : l'import retire tout ce qui n'est pas un chiffre et enregistre 0. Pour un produit sans prix, laissez la cellule vide, il s'affichera « Sur devis ».
4. **Les centimes ne s'affichent pas.** Le prix est enregistré au centime, mais QuoteBuilder écrit les montants d'un euro ou plus sans centimes (funnel, PDF, espace prospect) : 18,42 s'affiche 18 €. Pour de la petite fourniture, pensez à un prix par lot.

Le fichier n'a pas de colonne TVA ni de colonne devise. Le montant est pris tel quel, et un produit créé par l'import est en euros. Mettez le même type de prix partout, HT de préférence en B2B (voir [HT, TTC et TVA sur un devis](https://www.quotebuilder.co/blog/tva-ht-ttc-devis-b2b-france)), et changez la devise sur la fiche si besoin.

## Le SKU décide entre création et mise à jour

C'est la règle la plus importante de l'import, et la moins visible. Pour chaque ligne du fichier :

- **si le SKU existe déjà dans le funnel choisi**, la fiche existante est mise à jour ;
- **sinon**, une nouvelle fiche est créée.

La fenêtre le dit en une phrase : « Un SKU déjà présent met à jour la fiche, les autres sont créés. » Trois conséquences pratiques en découlent.

**Une ligne sans SKU est créée à chaque import.** Si votre fichier n'a pas de colonne SKU, réimporter le même fichier une semaine plus tard double le catalogue. Il n'y a pas de contrôle de doublon sur le nom.

**Le SKU est comparé dans le funnel choisi seulement.** Le même SKU importé dans un autre funnel crée une autre fiche, rattachée à cet autre funnel.

**Un SKU en double dans le fichier pose problème.** S'il existe déjà, la même fiche est réécrite deux fois et la dernière ligne gagne. S'il n'existe pas, l'import crée deux fiches avec le même SKU.

### Ce que la mise à jour efface

Quand une fiche est mise à jour par son SKU, l'import réécrit ses sept champs avec les valeurs du fichier : nom, SKU, description, prix min, prix max, tags et catégorie. Une colonne absente du fichier, ou une cellule vide, ne veut pas dire « ne touche pas ». Elle veut dire « vide ».

Exemple : vous importez seulement « Nom », « Référence » et « Prix min » pour corriger des tarifs. Les prix sont mis à jour, mais la description, la catégorie, les tags et le prix max des fiches concernées sont vidés. Un produit à fourchette perd sa borne haute.

Pour une mise à jour, partez donc toujours d'un fichier complet, avec les sept colonnes, et ne modifiez que ce qui doit changer.

La mise à jour ne touche pas, en revanche, à ce que le CSV ne sait pas porter : photos, documents, options, caractéristiques, devise et statut actif ou non. Ces réglages restent tels quels sur la fiche.

Le verrou « Garder nos modifications » de la page Importation concerne les boutiques WooCommerce et Shopify : il empêche une synchronisation de réécrire une fiche retouchée dans QuoteBuilder. L'import CSV ne le consulte pas. Un SKU présent dans votre fichier met à jour la fiche, verrou ou pas.

## Catégories et tags

La **catégorie** est un texte libre. Dans un funnel de type catalogue, les produits sont regroupés par catégorie, et l'étape de navigation s'appelle « Rayons ». Un produit sans catégorie tombe dans « Autres ». Une faute de frappe crée un rayon de plus : « Rayonnage » et « Rayonnages » font deux rayons. Avant d'importer, triez la colonne et vérifiez qu'une même gamme s'écrit toujours de la même façon.

Les **tags** se mettent dans une seule cellule, séparés par une virgule, un point-virgule ou une barre verticale : `"entrepot,lourd"` ou `entrepot|lourd`. Si vous utilisez la virgule, mettez la cellule entre guillemets. La recherche du catalogue de l'API lit le nom, le SKU, la catégorie et les tags, celle de l'agent de chat lit aussi la description. Des tags qui reprennent les mots du client (« alimentaire », « extérieur », « charge lourde ») aident cette recherche à trouver le bon produit.

## Les pièges d'un fichier Excel français

La plupart des refus viennent de la façon dont Excel enregistre un CSV sur un poste réglé en français.

### Le point-virgule

L'import découpe les colonnes à la virgule, et seulement à la virgule. C'est le format décrit par la [RFC 4180](https://www.rfc-editor.org/rfc/rfc4180), qui sert de référence pour le CSV. Or Excel utilise le séparateur de liste du système. Microsoft l'explique dans sa page [Importer ou exporter des fichiers texte](https://support.microsoft.com/fr-fr/office/importer-ou-exporter-des-fichiers-texte-txt-ou-csv-5250ac4c-663c-47ce-937b-339e391393ba) : quand le séparateur décimal est la virgule, ce qui est le cas en français, Excel prend le point-virgule comme séparateur de liste.

Résultat : un fichier « Nom;Référence;Prix » arrive comme une seule colonne nommée « Nom;Référence;Prix ». L'import ne trouve pas de colonne nom et refuse le fichier. Trois solutions :

- passer le fichier dans le [vérificateur CSV](https://www.quotebuilder.co/outils/verificateur-csv-catalogue-devis), qui le convertit en virgules et met entre guillemets les cellules qui en contiennent ;
- exporter depuis Google Sheets ou LibreOffice, qui laissent choisir la virgule ;
- changer le séparateur de liste du système, comme le décrit la page Microsoft, mais ce réglage touche tous vos fichiers.

### L'encodage

L'import lit le fichier en UTF-8. Un fichier enregistré dans un ancien encodage Windows arrive avec des caractères abîmés : le é de « Catégorie » est remplacé par un symbole, et « Échelle » perd son É. L'en-tête abîmé n'est plus reconnu, et les noms de produits sont importés tels quels, avec leurs symboles. Enregistrez au format « CSV UTF-8 » d'Excel. Microsoft explique aussi comment [ouvrir correctement un CSV UTF-8 dans Excel](https://support.microsoft.com/fr-fr/excel/opening-csv-utf-8-files-correctly-in-excel), utile pour vérifier le fichier avant de l'envoyer.

### Les zéros en tête et les codes longs

Excel traite un code comme 00123 comme un nombre et retire les zéros. Il passe les codes de plus de 15 chiffres en notation scientifique, comme 3,76E+12, et remplace les chiffres au-delà du quinzième par des zéros. C'est documenté par Microsoft dans [Conserver les zéros non significatifs et les grands nombres](https://support.microsoft.com/en-us/excel/keeping-leading-zeros-and-large-numbers). Pour l'import, c'est un problème de SKU : « 00123 » devenu « 123 » ne retrouve plus la fiche existante, et l'import crée un doublon. Formatez la colonne SKU en Texte avant de coller ou de saisir les codes.

### Les retours à la ligne dans une cellule

Une description sur plusieurs lignes est valide en CSV si elle est entre guillemets. L'import de QuoteBuilder, lui, découpe le fichier ligne par ligne avant de lire les guillemets : le produit est coupé en deux, avec une description tronquée et une ligne en trop, souvent ignorée faute de nom. Remplacez les retours à la ligne des descriptions par une espace avant d'exporter.

### Les lignes vides et les lignes de titre

Les lignes vides sont sautées. Une ligne de titre au milieu du fichier (« GAMME LOURDE ») est lue comme un produit sans prix. Ne gardez qu'une ligne d'en-tête, tout en haut.

## Lire l'écran de contrôle

L'étape 2 de la fenêtre d'import est la dernière occasion d'arrêter un mauvais fichier. Ce qu'elle affiche :

- **le nom du fichier et le compte** : « 48 produits prêts · 2 lignes ignorées » ;
- **un bandeau rouge** si la colonne nom est introuvable : « Renommez-la en name ou nom » ;
- **un bandeau vert** sinon : « Fichier reconnu. Un SKU déjà présent met à jour la fiche, les autres sont créés. » ;
- **les colonnes ignorées**, quand il y en a ;
- **les signalements**, ligne par ligne : « Ligne 7 · Ligne ignorée : nom manquant. », « Ligne 12 · Prix min illisible (1.234,50). » ;
- **un aperçu** du premier produit : nom, SKU, catégorie.

Deux limites. La fenêtre n'affiche que les six premiers signalements. Et les numéros de ligne ne comptent que les lignes non vides, en-tête compris : avec des lignes vides, le numéro ne correspond plus à celui d'Excel. Le vérificateur en ligne affiche tous les signalements, avec la même numérotation.

Le bandeau vert dit seulement que la colonne nom a été trouvée. Un fichier dont la colonne « Prix » est ignorée l'affiche aussi. Regardez « Colonnes ignorées » avant de cliquer sur Importer.

## Après l'import

Un catalogue importé est une base. Il reste quelques réglages que le CSV ne porte pas :

1. **Les options.** Coloris, finition, fixation : elles se créent sur la fiche produit. Elles ne changent pas le prix de la ligne, qui reste prix unitaire × quantité. Une option qui doit changer le prix est un autre produit. Voir [options, variantes et alternatives dans un devis](https://www.quotebuilder.co/blog/options-variantes-alternatives-devis-b2b).
2. **Les photos et les documents.** La fiche accepte une galerie, une fiche technique et un mode d'emploi. Voir [la fiche produit B2B](https://www.quotebuilder.co/blog/fiche-produit-b2b-devis-unifie).
3. **Les règles Si/Alors.** Elles pointent vers des produits : écrivez-les après l'import, pas avant.
4. **Le test.** Ouvrez le funnel comme un prospect et regardez les produits suggérés, les prix affichés et la fourchette.

Pour chiffrer le temps gagné face à une saisie à la main : l'[estimateur de gain de temps catalogue](https://www.quotebuilder.co/outils/estimateur-gain-temps-catalogue-devis).

## CSV ou synchronisation de boutique

Si votre catalogue vit déjà dans WooCommerce ou Shopify, le CSV n'est pas le bon outil. La page Importation propose de brancher la boutique, avec une synchronisation, le verrou « Garder nos modifications » et, pour WooCommerce, le renvoi des fiches modifiées. La synchronisation apporte aussi ce que le CSV n'apporte pas : photos, déclinaisons et état du stock. Le détail est dans [synchroniser un catalogue WooCommerce ou Shopify](https://www.quotebuilder.co/blog/sync-catalogue-woocommerce-shopify-parcours-devis).

Le CSV reste le bon choix quand le catalogue vit dans un ERP ou un tableur et bouge quelques fois par an. Gardez alors un fichier maître complet, avec un SKU sur chaque ligne, et réimportez-le à chaque changement.

## Ce que l'import CSV ne fait pas

Pour éviter les mauvaises surprises :

- il ne lit que la virgule comme séparateur ;
- il ne lit pas les photos, les options, les caractéristiques, le stock, la devise ni la TVA ;
- il ne détecte pas les doublons sans SKU ;
- il ne supprime jamais une fiche : un produit retiré du fichier reste dans le catalogue, à désactiver ou supprimer à la main ;
- il n'y a pas d'annulation d'un import : une mise à jour ratée se corrige en réimportant le bon fichier.

## La liste avant de cliquer sur Importer

1. Un seul onglet, une seule ligne d'en-tête, tout en haut.
2. Une colonne nom reconnue : `nom`, `name` ou `product_name`.
3. Un SKU sur chaque ligne, colonne au format Texte dans Excel, sans doublon.
4. Prix min et prix max, sans point des milliers, sans texte, vides pour « Sur devis ».
5. Les sept colonnes présentes si le fichier sert à mettre à jour des fiches existantes.
6. Pas de retour à la ligne dans les descriptions.
7. Enregistrement en CSV UTF-8, séparateur virgule.
8. Le bon funnel choisi à l'étape 1.
9. Un passage dans le [vérificateur CSV catalogue](https://www.quotebuilder.co/outils/verificateur-csv-catalogue-devis).

Côté plans, la page [Tarifs](https://www.quotebuilder.co/tarifs) indique le nombre de produits catalogue de chaque formule. Vérifiez-le avant d'importer un gros fichier.

Exemple appliqué à un métier : [le funnel de devis pour la location de matériel BTP](https://www.quotebuilder.co/secteurs/funnel-devis-location-materiel-btp), où le parc de machines s'importe de la même façon.

## FAQ

### Quelles colonnes l'import CSV de QuoteBuilder reconnaît-il ?

Sept champs : nom, SKU, catégorie, prix min, prix max, tags et description, chacun sous quelques noms de colonne, par exemple `nom`, `reference`, `categorie` ou `prix_min`. Les en-têtes sont comparés sans majuscules ni accents.

### Pourquoi mon fichier Excel est-il refusé ?

Le plus souvent, à cause du point-virgule. L'import ne découpe qu'à la virgule : l'en-tête devient une seule colonne et la colonne nom est introuvable. Convertissez le fichier en virgules.

### Ma colonne « Prix » est ignorée, pourquoi ?

« Prix » ne fait pas partie des noms reconnus. Renommez-la en « Prix min », et ajoutez une colonne « Prix max » avec la même valeur pour un prix fixe.

### Que se passe-t-il si je réimporte le même fichier ?

Les lignes dont le SKU existe déjà dans le funnel mettent à jour leur fiche. Les lignes sans SKU sont créées une seconde fois. Sans colonne SKU, réimporter double le catalogue.

### Une colonne absente garde-t-elle l'ancienne valeur ?

Non. Pour un SKU existant, l'import réécrit nom, description, prix min, prix max, tags et catégorie avec les valeurs du fichier. Une colonne absente ou une cellule vide efface le champ.

### Comment écrire un prix avec des centimes ?

Avec un point (18.42) ou une virgule entre guillemets ("18,42"), sans séparateur de milliers. Le prix est enregistré au centime, mais QuoteBuilder affiche les montants d'un euro ou plus sans centimes.

### Peut-on importer les photos, les options ou le stock ?

Non. Le CSV porte le nom, le SKU, la catégorie, les prix, les tags et la description. Photos, documents et options se règlent sur la fiche produit. Le stock vient seulement d'une boutique synchronisée.

### Qui peut importer un catalogue ?

Le Propriétaire et les Admins. Le menu Catalogue n'apparaît pas pour un Commercial.

### Un produit retiré du fichier est-il supprimé ?

Non. L'import crée et met à jour, il ne supprime rien. Un produit qui ne doit plus être proposé se désactive ou se supprime depuis le catalogue.

### Faut-il un funnel avant d'importer ?

Oui. Les produits sont rattachés au funnel choisi à l'étape 1 de l'import. Sans funnel, l'import s'arrête avec le message « Créez d'abord un funnel : le catalogue s'y rattache. »

## Pour aller plus loin

- [Vérificateur de fichier CSV catalogue](https://www.quotebuilder.co/outils/verificateur-csv-catalogue-devis)
- [Le catalogue dans QuoteBuilder](https://www.quotebuilder.co/fonctionnalites/catalogue)
- [Règles de suggestion produits dans un funnel de devis](https://www.quotebuilder.co/blog/regles-suggestion-produits-funnel-devis-b2b)
- [Synchroniser un catalogue WooCommerce ou Shopify](https://www.quotebuilder.co/blog/sync-catalogue-woocommerce-shopify-parcours-devis)
- [Funnel de devis location de matériel BTP](https://www.quotebuilder.co/secteurs/funnel-devis-location-materiel-btp)
- [Démo funnel rayonnage](https://www.quotebuilder.co/c/demo/rayonnage)
- [Créer un compte Free](https://www.quotebuilder.co/signup?plan=free)
