---
title: "Devis en ligne intégré boutique : le configurateur reste dans votre vitrine"
slug: devis-en-ligne-integre-boutique
description: "Comment intégrer un devis en ligne et un configurateur dans la boutique publique : même chrome, CTA Ajouter au devis, route /devis, dossier vendeur. Process, 3 démos, checklist."
canonical: /blog/devis-en-ligne-integre-boutique
locale: fr-FR
word_count_target: 2200
keywords:
  - devis en ligne intégré boutique
  - configurateur devis dans boutique en ligne
  - demande de devis storefront
  - devis embarqué vitrine
  - Ajouter au devis boutique
author: QuoteBuilder
date: 2026-09-11
updated: 2026-09-11
---

# Devis en ligne intégré boutique : le configurateur reste dans votre vitrine

Vous avez une **vitrine publique**. Le prospect parcourt le catalogue, lit les fourchettes, se reconnaît dans le vocabulaire métier. Puis, au clic « Devis », il change de site : autre URL, autre header, autre ton. La confiance construite sur la boutique se casse au moment où vous aviez le plus besoin qu’elle tienne.

Le sujet de cet article : un **devis en ligne intégré boutique**. Autrement dit, un **configurateur devis dans boutique en ligne** qui garde le chrome de la vitrine (logo, navigation, footer, CTA Devis) pendant toute la **demande de devis storefront**. Pas un discours marketing « Unify ». Un comportement produit concret : la route `/b/{org}/{shop}/devis` reste dans la boutique ; le CTA produit **Ajouter au devis** est shop-local ; la soumission crée un dossier côté vendeur.

Public : PME et ateliers qui chiffrent (soins, menuiserie, stock B2B, services configurables), responsables e-commerce qui veulent une sortie devis sans panier, agences qui livrent des vitrines quote-request only.


**Tester le parcours live :** [devis skincare Atelier Peau Claire](https://www.quotebuilder.co/b/demo/atelier-peau-claire/devis), [devis menuiserie Atelier Bois Nord](https://www.quotebuilder.co/b/demo/atelier-bois-nord/devis), ou [créer un compte Free](https://www.quotebuilder.co/signup?plan=free) pour publier votre propre boutique.


## Avant / maintenant : ce qui cassait le parcours

### Avant : vitrine, puis funnel séparé

Le schéma classique côté QuoteBuilder (et chez beaucoup d’outils) était :

1. le prospect navigue sur `/b/...` (boutique publique, SEO, catalogue) ;
2. il clique Devis ;
3. il est renvoyé vers un parcours `/c/...` (funnel) avec un chrome différent.

Résultat fréquent :

- le logo et la nav boutique disparaissent ;
- le prospect se demande s’il est encore « chez vous » ;
- le retour catalogue n’est plus un clic de header, c’est une sortie mentale ;
- vous mesurez deux tunnels au lieu d’un.

Le funnel `/c/...` reste utile pour un projet cadrage (wizard métier, Ads, landing dédiée). Il n’est pas le problème. Le problème, c’est de **forcer** la sortie hors boutique quand le prospect était déjà dans une **demande de devis storefront** initiée depuis le catalogue.

### Maintenant : même chrome boutique, devis embarqué

Comportement live (PR produit) :

- route **`/b/{org}/{shop}/devis`** : le configurateur s’affiche **sous** le header boutique et **au-dessus** du footer ;
- le bouton header **Devis** pointe vers ce parcours shop-local ;
- sur une fiche produit, **Ajouter au devis** prépare le brief sans basculer vers une autre marque visuelle ;
- l’envoi crée un dossier dans le pipeline vendeur (comme avant), mais l’entrée visuelle reste cohérente.

![Accueil boutique Atelier Peau Claire avec CTA Devis dans le chrome](/images/blog/devis-en-ligne-integre-boutique/unify-shop-home.png)
*Vitrine publique : Accueil, Rituels, bouton **Devis** dans le header. La promesse est quote-request only (fourchettes, pas de paiement en ligne). Live : [/b/demo/atelier-peau-claire](https://www.quotebuilder.co/b/demo/atelier-peau-claire).*

Vous ne « fusionnez » pas magiquement boutique et funnel. Vous **arrêtez d’expulser** le prospect hors du chrome qu’il vient d’accepter.

> Attention. Un iframe collé sur un thème Shopify n’est pas la même chose. Ici, la boutique QuoteBuilder et le devis partagent la même publication `/b/...` : mêmes pages légales, même navigation, même source catalogue. Si votre besoin est un sync depuis Woo/Shopify existant, voyez plutôt le [sync catalogue vers parcours devis](https://www.quotebuilder.co/blog/sync-catalogue-woocommerce-shopify-parcours-devis).

## Process prospect : d’Ajouter au devis à l’envoi

Voici le process métier + logiciel, dans l’ordre où le prospect le vit.

### 1. Arrivée sur la vitrine

Le prospect atterrit sur l’accueil ou une page SEO. Hero clair, CTA **Demander un devis** / **Devis**, catalogue avec fourchettes. Pas de panier payant. C’est une **vitrine de devis**, pas une caisse.

Les templates secteur (skincare, menuiserie, stock) posent déjà ce cadre. Voir [template boutique menuiserie / skincare / stock](https://www.quotebuilder.co/blog/template-boutique-en-ligne-menuiserie-devis).

### 2. Parcours catalogue et fiche

Il ouvre une catégorie, puis une fiche. Sur la fiche, le CTA principal n’est plus « Acheter » : c’est **Ajouter au devis**.

![Fiche produit boutique avec bouton Ajouter au devis](/images/blog/devis-en-ligne-integre-boutique/unify-add-or-catalog.png)
*Fiche shop-local (ex. Bilan peau express) : fourchette catalogue + CTA **Ajouter au devis**. Le header garde Accueil / Rituels / **Devis**. Même chrome que l’accueil.*

Ce geste ancre le besoin dans le brief. Le prospect ne réécrit pas « je voudrais le bilan express » dans un message libre : la référence catalogue voyage avec la demande.

> Astuce. Placez **Ajouter au devis** au-dessus de la description longue. Si le premier clic utile est « lire 800 mots », beaucoup abandonnent avant d’exprimer l’intérêt.

### 3. Ouverture du configurateur `/devis` (chrome boutique)

Deux entrées courantes :

- header **Devis** → `/b/.../devis` ;
- **Ajouter au devis** depuis une fiche → même route, avec le contexte produit si disponible.

Sur skincare, l’étape 1 cadre le projet (type d’acte, objectif, budget indicatif) **sans quitter** Atelier Peau Claire.

![Configurateur devis embarqué skincare, chrome Atelier Peau Claire](/images/blog/devis-en-ligne-integre-boutique/unify-devis-skincare.png)
*Route `/b/demo/atelier-peau-claire/devis` : header boutique intact, bandeau démo, étape 1/4 « Votre projet ». Live : [ouvrir le devis skincare](https://www.quotebuilder.co/b/demo/atelier-peau-claire/devis).*

Sur menuiserie et stock, l’étape catalogue charge les configurations. Sur certaines captures live, vous verrez brièvement **Calcul des configurations…** : c’est l’état produit pendant le chargement des gammes, pas une erreur.

![Devis menuiserie embarqué, état Calcul des configurations](/images/blog/devis-en-ligne-integre-boutique/unify-devis-menuiserie.png)
*Atelier Bois Nord : chrome boutique (Accueil, Ouvrages, Devis) + étape Catalogue. Message live « Calcul des configurations… » pendant le chargement. [/b/demo/atelier-bois-nord/devis](https://www.quotebuilder.co/b/demo/atelier-bois-nord/devis).*

![Devis stock B2B embarqué, état Calcul des configurations](/images/blog/devis-en-ligne-integre-boutique/unify-devis-stock.png)
*Stock Pro B2B : même pattern (Gammes + Devis dans le header), étape Catalogue. [/b/demo/stock-pro-b2b/devis](https://www.quotebuilder.co/b/demo/stock-pro-b2b/devis).*

### 4. Compléter le brief et envoyer

Le prospect enchaîne les étapes (projet, catalogue / options, coordonnées, récap selon le template). Il envoie. Confirmation côté storefront. Pas de paiement. Pas de compte obligatoire pour composer.

### 5. Côté vendeur : un dossier, pas un mail flou

La soumission crée un **dossier** dans le pipeline : brief structuré, références catalogue si ajoutées, score, owner, historique. Vous ne reconstruisez pas le besoin depuis « Bonjour, devis svp ».

Pour la suite opérationnelle (SLA, relances, visite complète) :

- [visite guidée parcours devis B2B](https://www.quotebuilder.co/blog/visite-guidee-parcours-devis-b2b) ;
- [délai de réponse demande de devis](https://www.quotebuilder.co/blog/delai-reponse-demande-devis-b2b) ;
- [relancer un devis hot depuis le dossier](https://www.quotebuilder.co/blog/relancer-devis-hot-depuis-dossier).

> Astuce. Assignez un owner et une notif dès le publish de la boutique. Un devis embarqué qui tombe dans une boîte partagée sans responsable reproduit le même goulot qu’un formulaire contact.

**Mettre en place votre parcours :** [compte Free](https://www.quotebuilder.co/signup?plan=free), puis publiez une boutique et testez `/devis` avec le chrome réel. Ou rejouez d’abord [la démo stock](https://www.quotebuilder.co/b/demo/stock-pro-b2b/devis).


## Trois secteurs, un même comportement storefront

Le moteur est commun. Le vocabulaire et le nombre d’étapes varient.

### Skincare / health (Atelier Peau Claire)

- Accueil + Rituels + **Devis**
- Fiches protocoles avec fourchettes
- **Ajouter au devis** sur fiche
- Configurateur multi-étapes (projet → suite)

Idéal quand le prospect doit poser un cadre (visage / silhouette, objectif, budget) avant le bilan. Live : [boutique](https://www.quotebuilder.co/b/demo/atelier-peau-claire) · [devis](https://www.quotebuilder.co/b/demo/atelier-peau-claire/devis).

### Menuiserie habitat (Atelier Bois Nord)

- Accueil + Ouvrages + **Devis**
- Catalogue d’ouvrages (fenêtres, portes, etc.)
- Étape Catalogue dans `/devis` (chargement configs possible)

Idéal quand le brief part des gammes. Live : [boutique](https://www.quotebuilder.co/b/demo/atelier-bois-nord) · [devis](https://www.quotebuilder.co/b/demo/atelier-bois-nord/devis).

### Stock / rayonnage B2B (Stock Pro B2B)

- Accueil + Gammes + **Devis**
- Catalogue industriel
- Même embarquement chrome + étape Catalogue

Idéal pour l’acheteur qui navigue par référence puis compose. Live : [boutique](https://www.quotebuilder.co/b/demo/stock-pro-b2b) · [devis](https://www.quotebuilder.co/b/demo/stock-pro-b2b/devis).

**Comparer les trois `/devis` maintenant :** [peau claire](https://www.quotebuilder.co/b/demo/atelier-peau-claire/devis), [bois nord](https://www.quotebuilder.co/b/demo/atelier-bois-nord/devis), [stock pro](https://www.quotebuilder.co/b/demo/stock-pro-b2b/devis). Pour démarrer sur votre catalogue : [signup Free](https://www.quotebuilder.co/signup?plan=free).

## Boutique intégrée vs funnel `/c` vs formulaire contact

| Entrée | Quand l’utiliser | Chrome | Sortie |
|--------|------------------|--------|--------|
| **Boutique `/b/.../devis`** | Prospect déjà dans le catalogue / SEO vitrine | Identique à la boutique | Brief + dossier |
| **Funnel `/c/...`** | Campagne Ads, landing projet, cadrage sans catalogue | Funnel dédié | Brief + dossier |
| **Formulaire contact** | Support, presse, hors devis | Site corporate | Message libre |

Le formulaire contact reste utile hors chiffrage. Dès que l’offre est configurable, il coûte cher en clarification. Détail : [formulaire contact vs funnel devis](https://www.quotebuilder.co/blog/formulaire-contact-vs-funnel-devis-b2b).

Le funnel `/c` et la boutique `/b` ne s’excluent pas. Beaucoup d’équipes gardent un funnel rayonnage ou menuiserie pour l’acquisition payante, et la boutique pour le SEO + navigation catalogue. Les deux alimentent le même type de dossier.

> Attention. N’envoyez pas le trafic Ads catalogue vers un formulaire « Message ». Vous payez pour un clic, puis vous détruisez le brief. Boutique `/devis` ou funnel métier, pas le champ libre.

## Checklist : devis en ligne intégré boutique

Cochez avant d’annoncer l’URL en signature mail ou en Ads :

1. **Header Devis** visible sur toutes les pages boutique (accueil, catalogue, fiche).
2. **Route `/devis`** sous le même chrome (logo, nav, footer, mentions).
3. **Ajouter au devis** sur les fiches qui représentent 80 % des demandes.
4. **Aucun checkout** (pas de panier payant, libellés cohérents).
5. **Fourchettes** + phrase « le devis écrit reste la référence ».
6. **Test prospect** : Accueil → fiche → Ajouter au devis → étapes → envoi, sans aide.
7. **Test vendeur** : dossier reçu avec références / champs utiles.
8. **Owner + notif** pour les premières 48 h.
9. **FAQ** : « Puis-je commander en ligne ? » → non, vous composez un devis.
10. **Lien funnel `/c`** seulement s’il sert un canal distinct (Ads), pas comme sortie forcée depuis la boutique.

Si le point 2 échoue (sortie visuelle hors marque), vous n’avez pas encore un **configurateur devis dans boutique en ligne** : vous avez deux sites collés.

## FAQ

### Qu’est-ce qu’un devis en ligne intégré boutique concrètement ?

C’est un parcours de **demande de devis storefront** servi sous l’URL boutique (`/b/.../devis`), avec le même header/footer que le catalogue, et des CTA shop-local (**Devis**, **Ajouter au devis**). La soumission crée un dossier commercial.

### Est-ce que le funnel `/c` disparaît ?

Non. Il reste pertinent pour les landings projet et l’acquisition où le catalogue n’est pas le point d’entrée. Ce qui change : depuis la boutique publique, vous n’êtes plus forcé de sortir vers `/c` pour composer.

### « Ajouter au devis » remplace-t-il le panier e-commerce ?

Oui, dans une logique quote-request only. Le prospect assemble un brief, pas une commande à encaisser. Les prix affichés sont des fourchettes catalogue ; le devis écrit tranche.

### Pourquoi certaines démos affichent « Calcul des configurations… » ?

Sur les templates catalogue-first (menuiserie, stock), l’étape Catalogue charge les gammes et règles. Le message est un état de chargement live. Attendez quelques secondes puis continuez ; ce n’est pas un blocage du chrome boutique.

### Puis-je garder mon site WordPress et n’utiliser que la boutique devis ?

Oui. Beaucoup d’équipes gardent le site corporate et publient la vitrine QuoteBuilder pour le catalogue + devis. L’important est que le clic « Demander un devis » mène à un brief structuré, pas à un mailto.

### Combien de temps pour tester en démo ?

Zéro compte pour les trois URLs `/devis` listées plus haut. Pour votre propre boutique : [compte Free](https://www.quotebuilder.co/signup?plan=free), choix d’un template secteur, publish, test du chrome sur `/devis`.

## Maillage et suite

- [Template boutique menuiserie / skincare / stock](https://www.quotebuilder.co/blog/template-boutique-en-ligne-menuiserie-devis)
- [Visite guidée du parcours devis B2B](https://www.quotebuilder.co/blog/visite-guidee-parcours-devis-b2b)
- [Formulaire contact vs funnel devis](https://www.quotebuilder.co/blog/formulaire-contact-vs-funnel-devis-b2b)
- [Sync catalogue WooCommerce / Shopify](https://www.quotebuilder.co/blog/sync-catalogue-woocommerce-shopify-parcours-devis)
- [Scorer une demande de devis](https://www.quotebuilder.co/blog/score-demande-devis-b2b)
- Secteurs : [menuiserie](https://www.quotebuilder.co/secteurs/funnel-devis-menuiserie-sur-mesure), [rayonnage](https://www.quotebuilder.co/secteurs/funnel-devis-rayonnage-stockage)

## En résumé

Un **devis en ligne intégré boutique**, c’est un **configurateur devis dans boutique en ligne** qui refuse de casser le chrome au moment de la conversion. Le prospect fait : catalogue → **Ajouter au devis** → `/b/.../devis` → envoi. Vous recevez un dossier. La **demande de devis storefront** reste « chez vous » visuellement, de la première impression jusqu’au brief.

Avant : vitrine puis sortie forcée vers un autre parcours. Maintenant : même boutique, devis embarqué, funnel `/c` réservé aux cas où il apporte vraiment quelque chose.

**Prochaine étape :** [ouvrir le devis Peau Claire](https://www.quotebuilder.co/b/demo/atelier-peau-claire/devis), [ouvrir le devis Bois Nord](https://www.quotebuilder.co/b/demo/atelier-bois-nord/devis), [ouvrir le devis Stock Pro](https://www.quotebuilder.co/b/demo/stock-pro-b2b/devis), ou [créer un compte Free](https://www.quotebuilder.co/signup?plan=free) pour publier votre vitrine avec `/devis` intégré.
