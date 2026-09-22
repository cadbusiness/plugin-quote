---
title: "Fiche produit B2B unifiée pour le devis : specs, médias, mode d’emploi et sync Woo non destructive"
slug: fiche-produit-b2b-devis-unifie
description: "Structurer une fiche produit B2B pour le parcours devis : specs éditables, médias photo/plan/usage, notice et PDF (manuel, conformité, garantie), sync WooCommerce qui n’écrase pas le vide. Process commercial et checklist."
canonical: /blog/fiche-produit-b2b-devis-unifie
locale: fr-FR
word_count_target: 2500
keywords:
  - fiche produit B2B devis
  - specs éditables catalogue devis
  - mode d’emploi notice PDF produit
  - sync WooCommerce non destructive
  - médias plan usage produit B2B
author: QuoteBuilder
date: 2026-09-22
updated: 2026-09-22
---

# Fiche produit B2B unifiée pour le devis : specs, médias, mode d’emploi et sync Woo non destructive

Le commercial ouvre un dossier Hot. Le prospect a choisi un cantilever 4 m. Dans le brief : un nom de produit et une photo catalogue. Pas de charge utile. Pas de plan. Pas de notice. L’estimateur relance pour la hauteur, la conformité, le délai. Trois mails plus tard, le concurrent a déjà envoyé un PDF.

En B2B configurable (rayonnage, menuiserie, cuisine, stores, clôtures), la **fiche produit** n’est pas une vitrine e-commerce. C’est la matière première du devis. Specs structurées, médias utiles (photo, plan, usage), mode d’emploi (notice courte + PDF manuels / certificats / garantie) : tout ça doit vivre au même endroit, et survivre à une sync WooCommerce sans se faire écraser par un champ vide.

Ce guide décrit le contrat réel côté QuoteBuilder (PR #95, #101, #109) : où vivent les specs, comment sont typés les médias, comment fonctionne le bloc Mode d’emploi, pourquoi la sync est **non destructive**, et comment en faire un process commercial plus rapide. Public : responsables catalogue, estimateurs, e-commerçants Woo / Hostinger, dirigeants PME pose / fabrication.

**Voir le parcours côté prospect :** [démo funnel rayonnage](https://www.quotebuilder.co/c/demo/rayonnage) (sans compte), ou [créer un compte Free](https://www.quotebuilder.co/signup?plan=free) pour centraliser catalogue + devis.

## Le problème : catalogue e-commerce ≠ brief devis

WooCommerce (ou Shopify) stocke souvent un titre, un prix, une galerie, une description HTML longue. Le devis B2B a besoin d’autre chose :

- **charge, hauteur, profondeur, matériau, délai** (et d’autres clés métier) ;
- une **photo produit** claire pour la card, plus des **plans** et photos **d’usage** ;
- une **notice** courte + des **PDF** (manuel, certificat, garantie) hors galerie marketing.

Sans structure, chaque demande redevient un interrogatoire. Avec une fiche unifiée, le funnel, l’embed, le brief devis et la page boutique montrent les mêmes infos. Moins de « vous pouvez m’envoyer la notice ? » après coup.

C’est le prolongement naturel de la [sync catalogue → parcours devis](https://www.quotebuilder.co/blog/sync-catalogue-woocommerce-shopify-parcours-devis) et du [devis intégré à la boutique](https://www.quotebuilder.co/blog/devis-en-ligne-integre-boutique).

![Écart : fiche Woo marketing vs fiche B2B prête pour le devis](/blog/fiche-produit-b2b-devis-unifie/img-1.png)

## Specs structurées : `products.specs` comme source de vérité

Les specs ne sont plus un pavé texte. Elles sont structurées. Clés prévues (et clés libres possibles) :

| Clé | Exemple métier | Intérêt devis |
|-----|----------------|---------------|
| `charge` | 500 kg / niveau | Dimensionne le besoin, évite le sous-dimensionnement |
| `hauteur` | 3000 mm | Filtre options et variantes |
| `profondeur` | 800 mm | Compatibilité allées / racks |
| `materiau` | Acier galvanisé | Prix, délai, conformité |
| `delai` | 10 jours ouvrés | Engagement commercial réaliste |
| *(clés libres)* | ex. `entraxe`, `norme` | Adaptation secteur sans tout refondre |

**Source de vérité :** `products.specs` côté QuoteBuilder. C’est ce que le parcours devis et les vues publiques lisent en priorité.

### Sync Woo : écriture sans écrasement stupide

Lors de la sync WooCommerce :

- les attributs / dimensions / meta côté Woo peuvent être **écrits** à partir des specs ;
- si le pull Woo est **vide** ou **identique**, on **n’écrase pas** une valeur déjà propre dans QuoteBuilder.

Autrement dit : une fiche enrichie dans QuoteBuilder ne se fait pas « nettoyer » par un attribut Woo oublié. C’est le cœur de la sync **non destructive**.

Pour le débat outils : rester sur Excel + PDF multiplie les versions divergentes de ces mêmes specs. Voir [configurateur vs Excel + PDF](https://www.quotebuilder.co/blog/configurateur-devis-vs-excel-pdf).

![Écran specs : charge, hauteur, profondeur, matériau, délai](/blog/fiche-produit-b2b-devis-unifie/img-2.png)

## Médias : rôles `product`, `plan`, `usage`

Une galerie plate mélange tout. Ici, chaque image a un **rôle** :

| Rôle | Usage UI | Contenu typique |
|------|----------|-----------------|
| `product` | **Card** produit (visuel principal) | Photo catalogue nette |
| `plan` | Vignette / thumb plan | Schéma coté, implantation |
| `usage` | Vignette / thumb usage | Produit en situation (entrepôt, cuisine, etc.) |

Conséquence concrète :

- la **card** reste lisible (une photo produit, pas un plan illisible en 120 px) ;
- plan et usage restent **accessibles** sans polluer la première impression ;
- le commercial peut joindre le bon visuel au devis sans fouiller un Drive.

Les PDF de notice / certificat / garantie ne sont **pas** des images de galerie. Ils vivent dans le bloc Mode d’emploi (ci-dessous).

![Cards photo produit + thumbs plan et usage](/blog/fiche-produit-b2b-devis-unifie/img-3.png)

## Mode d’emploi (PR #109) : notice + docs + photos instruction

Le bloc Mode d’emploi repose sur `products.sheet` :

### Notice courte (`manualText`)

Texte court, éditable, pensé pour le brief et la page publique. Ce n’est **pas** la description HTML Woo collée telle quelle.

Règle importante : la **description HTML Woo n’est jamais copiée** dans la notice. Et un **pull vide n’efface pas** une notice déjà sauvegardée. Encore une fois : non destructif.

### Documents (rôles)

| Rôle doc | Contenu typique | Sync meta Woo (indicatif) |
|----------|-----------------|---------------------------|
| `manual` | Manuel PDF, notice longue | `_qb_manual` |
| `certificate` | Certificat, conformité, norme | `_qb_certificate` |
| `warranty` | Garantie constructeur / extension | `_qb_warranty` |

Ces PDF restent **hors galerie** images. Ils s’affichent dans le bloc Mode d’emploi quand présents.

### Photo instruction (rôle image `manual`)

En plus des docs PDF, une image peut avoir le rôle `manual` : photo d’instruction (schéma de montage, repère de sécurité). Visible dans le contexte Mode d’emploi, distincte de la card `product`.

![Bloc Mode d’emploi : notice, PDF manuels / certificats / garantie, photo instruction](/blog/fiche-produit-b2b-devis-unifie/img-4.png)

## Où ça s’affiche côté public

Quand la fiche est renseignée, les surfaces suivantes peuvent montrer **specs + bloc Mode d’emploi** (si présent) :

- **funnel** devis (parcours `/c/...`) ;
- **embed** (iframe / widget) ;
- **brief** devis (dossier côté équipe / récap) ;
- **page boutique** (parcours boutique QuoteBuilder).

Le prospect voit plus qu’un titre. L’estimateur ouvre un dossier déjà documenté. Moins de « pièce jointe manquante ».

Pour amorcer le funnel depuis une fiche boutique (SKU dans l’URL), enchaînez avec [préremplir un devis via l’URL](https://www.quotebuilder.co/blog/preremplir-devis-url-parametres).

**Tester sans config longue :** [démo rayonnage](https://www.quotebuilder.co/c/demo/rayonnage) ou [essai Free](https://www.quotebuilder.co/signup?plan=free).

## Sync non destructive : le thème central

Trois situations où une sync « naïve » casse le travail catalogue :

1. **Champ Woo vide** → écrase une spec déjà saisie dans QuoteBuilder.
2. **Description HTML Woo** → pollue la notice courte (pavé SEO inutile au chiffrage).
3. **Re-sync après enrichissement** → perd notice, PDF, rôles médias.

Le contrat actuel évite ça :

- specs : pas d’écrasement si pull vide / identique ;
- notice : jamais remplie depuis la description HTML Woo ; pull vide ne l’efface pas ;
- docs : meta dédiées (`_qb_manual`, `_qb_certificate`, `_qb_warranty`) plutôt qu’un fourre-tout galerie.

Vous pouvez enrichir dans QuoteBuilder **après** une sync initiale Woo, puis re-synchroniser sans tout perdre. C’est ce qui rend la fiche « unifiée » viable au quotidien.

![Schéma sync : Woo ↔ QuoteBuilder, flèches qui n’écrasent pas le vide](/blog/fiche-produit-b2b-devis-unifie/img-5.png)

## Process commercial : chiffrage plus rapide, moins d’allers-retours

### Avant (fiche pauvre)

1. Prospect choisit un produit sur la boutique.
2. Brief arrive avec un nom + photo.
3. Estimateur demande charge / délai / notice.
4. Commercial cherche le PDF dans un dossier partagé.
5. 2 à 4 échanges avant un premier montant crédible.

### Après (fiche unifiée)

1. Prospect choisit le même produit (éventuellement via [URL préremplie](https://www.quotebuilder.co/blog/preremplir-devis-url-parametres)).
2. Brief affiche specs + notice + liens PDF.
3. Estimateur chiffre avec les contraintes visibles.
4. Options / variantes restent gérables (voir [options et variantes devis B2B](https://www.quotebuilder.co/blog/options-variantes-alternatives-devis-b2b)).
5. Moins de mails « vous pouvez confirmer la hauteur ? ».

La [qualification avant chiffrage](https://www.quotebuilder.co/blog/qualifier-demande-devis-avant-chiffrage) reste utile (budget, délai chantier, contraintes site). La fiche unifiée réduit surtout le **vide produit**.

### Menuiserie / boutique sur mesure

Même logique que le [template boutique menuiserie](https://www.quotebuilder.co/blog/template-boutique-en-ligne-menuiserie-devis) : essence, finition, épaisseur en specs ; plan de coupe en rôle `plan` ; notice d’entretien en `manualText` + PDF `manual`.

## Checklist fiche produit B2B complète

À cocher produit par produit (ou par famille) :

**Identité & sync**

- [ ] Nom clair, SKU / external id alignés Woo ↔ QuoteBuilder
- [ ] Prix / règles catalogue à jour (selon votre plan)

**Specs**

- [ ] `charge`, `hauteur`, `profondeur`, `materiau`, `delai` renseignés quand pertinents
- [ ] Clés libres métier ajoutées si besoin (norme, entraxe, etc.)
- [ ] Vérifié qu’un pull Woo vide n’a pas écrasé une valeur

**Médias**

- [ ] Au moins une image rôle `product` (card)
- [ ] Plan en rôle `plan` si le produit est dimensionnel
- [ ] Photo `usage` si ça aide le prospect à se projeter

**Mode d’emploi**

- [ ] `manualText` court et utile (pas un pavé SEO)
- [ ] PDF `manual` / `certificate` / `warranty` selon le produit
- [ ] Photo instruction rôle `manual` si montage / sécurité
- [ ] Confirmé : description HTML Woo ≠ notice

**Surfaces**

- [ ] Visible correctement en funnel / embed / brief / boutique
- [ ] CTA devis testé (lien ou [préremplissage URL](https://www.quotebuilder.co/blog/preremplir-devis-url-parametres))

![Checklist fiche B2B à côté d’une card produit](/blog/fiche-produit-b2b-devis-unifie/img-6.png)

## Cas pratique : famille rayonnage

1. Sync initiale Woo → titres, SKU, quelques attributs.
2. Enrichissement QuoteBuilder : specs charge / hauteur / profondeur, délai fournisseur.
3. Upload plan coté (`plan`) + photo entrepôt (`usage`).
4. Notice courte (montage niveaux, charge max par niveau) + PDF certificat + garantie.
5. Page boutique et funnel affichent le bloc.
6. CTA fiche → URL `?add={sku}` pour préremplir le devis.
7. Re-sync Woo plus tard : notice et specs enrichies restent.

Le commercial reçoit un dossier où le prospect a déjà vu les contraintes. L’estimateur ne repart pas de zéro.

## Pièges à éviter

### Coller la description Woo dans la notice

La description boutique sert au SEO et au storytelling. La notice sert au chiffrage et à l’usage. Le produit refuse le copier-coller automatique pour une bonne raison.

### Tout mettre en galerie

Un certificat PDF n’a rien à faire entre deux photos lifestyle. Utilisez les rôles docs.

### Croire qu’une sync = miroir parfait dans les deux sens

La sync non destructive privilégie la **préservation** des enrichissements QuoteBuilder. C’est voulu. Documentez pour l’équipe qui « nettoie » Woo en pensant tout réaligner.

### Specs en texte libre uniquement

Un pavé « charge 500 kg hauteur 3 m » dans la description reste difficile à afficher et à filtrer. Passez par `products.specs`.

### Ignorer le préremplissage URL

Une fiche riche sans CTA qui passe le SKU, c’est encore un funnel vide. Reliez les deux sujets.

![Pièges : description Woo ≠ notice, PDF hors galerie, sync qui préserve](/blog/fiche-produit-b2b-devis-unifie/img-7.png)

## FAQ

### 1. Est-ce que je dois tout ressaisir si j’ai déjà Woo ?

Non. Partez d’une sync, puis enrichissez specs / médias / sheet dans QuoteBuilder. Les règles non destructives protègent cet enrichissement.

### 2. Les clés de specs sont-elles figées ?

Les clés listées (charge, hauteur, profondeur, materiau, delai) sont le socle. Des **clés libres** permettent d’étendre sans attendre une refonte.

### 3. Où apparaissent plan et usage ?

En thumbs / vignettes, pendant que la card utilise surtout le rôle `product`. Le détail d’UI peut varier selon funnel, embed, boutique, mais le typage reste le même.

### 4. La notice peut-elle être longue ?

`manualText` est pensé **court**. Pour le détail, ajoutez un PDF rôle `manual`.

### 5. Que synchronisent `_qb_manual`, `_qb_certificate`, `_qb_warranty` ?

Ce sont les meta Woo associées aux documents Mode d’emploi (manuel, certificat, garantie). Elles évitent de noyer les PDF dans la galerie classique.

### 6. Un pull Woo vide peut-il effacer ma notice ?

Non. Un pull vide n’efface pas une notice déjà sauvegardée. Et la description HTML Woo n’est pas copiée dans la notice.

### 7. Ça marche aussi en embed et en brief devis ?

Oui : funnel, embed, brief devis et page boutique peuvent afficher specs + Mode d’emploi si présents.

### 8. Lien avec les options / variantes ?

La fiche unifiée documente le produit de référence. Les alternatives sur le devis restent un sujet voisin : [options, variantes, alternatives](https://www.quotebuilder.co/blog/options-variantes-alternatives-devis-b2b).

### 9. Shopify est-il couvert pareil ?

L’article met l’accent sur le contrat Woo (meta `_qb_*`, attributs). La sync catalogue multi-plateforme est traitée dans [sync Woo / Shopify](https://www.quotebuilder.co/blog/sync-catalogue-woocommerce-shopify-parcours-devis). Pour les détails shell Shopify, restez sur ce qui est réellement branché sur votre plan.

### 10. Par où commencer sur 50 produits ?

Par les 10 SKU qui génèrent le plus de demandes Hot. Specs + une image `product` + notice courte. Puis plans / PDF sur les familles à fort contentieux technique.

## Plan d’action en une semaine

**Jour 1-2 :** aligner SKU / external id, sync initiale, lister les 10 SKU prioritaires.

**Jour 3-4 :** renseigner specs + médias `product` / `plan` sur ces 10.

**Jour 5 :** notices + PDF manuels / certificats sur les 5 plus techniques.

**Jour 6 :** vérifier affichage funnel / boutique / brief ; brancher CTA [préremplissage URL](https://www.quotebuilder.co/blog/preremplir-devis-url-parametres).

**Jour 7 :** former estimateurs à lire le bloc Mode d’emploi avant de relancer le prospect.

## Conclusion

Une fiche produit B2B utile au devis, ce n’est pas une galerie marketing enrichie. C’est un objet structuré : **specs** (`products.specs`), **médias typés** (product / plan / usage), **mode d’emploi** (notice + PDF + photo instruction), et une **sync Woo non destructive** qui refuse d’écraser le travail catalogue avec du vide ou une description HTML. Le funnel, l’embed, le brief et la boutique peuvent alors montrer la même vérité produit.

**Prochaine étape :** [ouvrir un compte Free](https://www.quotebuilder.co/signup?plan=free), synchroniser une famille courte, enrichir une fiche, puis tester le [parcours démo rayonnage](https://www.quotebuilder.co/c/demo/rayonnage). Pour coller le clic boutique au funnel : [préremplir le devis via l’URL](https://www.quotebuilder.co/blog/preremplir-devis-url-parametres).
