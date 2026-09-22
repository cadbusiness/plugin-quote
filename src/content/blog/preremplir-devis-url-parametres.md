---
title: "Préremplir un devis via l’URL : paramètres query, CTA WordPress et funnel embarqué"
slug: preremplir-devis-url-parametres
description: "Comment préremplir un funnel devis avec ?besoin=, ?add= et ?product= sur /c/ et /embed/, y compris depuis un shortcode WordPress. Tableau des params, règles de session, cas e-commerce et checklist QA."
canonical: /blog/preremplir-devis-url-parametres
locale: fr-FR
word_count_target: 2400
keywords:
  - préremplir devis URL
  - paramètres query funnel devis
  - CTA WordPress ajouter au devis
  - besoin add product query string
  - funnel devis prérempli
author: QuoteBuilder
date: 2026-09-22
updated: 2026-09-22
---

# Préremplir un devis via l’URL : paramètres query, CTA WordPress et funnel embarqué

Un prospect clique « Ajouter à mon devis » sur une fiche rayonnage. Il atterrit sur un funnel vide. Il re-coche les mêmes gammes, retape le SKU, et abandonne au bout de deux écrans. Ce n’est pas un problème de prix. C’est un trou entre la page catalogue et le parcours de devis.

Préremplir le funnel depuis l’URL comble ce trou. Vous passez des paramètres dans la query string (`?besoin=`, `?add=`, `?product=`). Le parcours ouvre déjà les bonnes chips, ajoute le produit pertinent, et laisse le prospect préciser le reste. Sur WordPress, le widget copie déjà la query de la page hôte dans l’iframe : un CTA sur une URL riche préremplit le même funnel embarqué.

Ce guide détaille le contrat réel (PR #92), le tableau des paramètres, les règles de session, des exemples concrets (rayonnage Quickly, e-commerce Hostinger), une checklist QA et les pièges classiques. Public : responsables e-commerce, intégrateurs WordPress, commerciaux B2B qui veulent moins de briefs vides.

**Testez un funnel déjà prérempli :** [ouvrir la démo rayonnage avec besoin=rayonnages](https://www.quotebuilder.co/c/quickly/rayonnage?besoin=rayonnages), ou [créer un compte Free](https://www.quotebuilder.co/signup?plan=free) pour brancher le vôtre.

## Pourquoi préremplir depuis l’URL change le taux de brief complet

Sans préremplissage, chaque clic catalogue → devis est une rupture. Le prospect a déjà choisi une gamme ou un SKU sur la boutique. Le funnel lui redemande tout. Résultat typique : abandon, message « je vous rappelle », ou brief trop vague pour chiffrer.

Avec des paramètres URL :

- la **gamme** est déjà cochée (moins de friction en entrée) ;
- le **produit** est déjà dans le panier devis (qty 1 + note lisible) ;
- le commercial reçoit un dossier moins vide, plus proche de ce que le prospect a vu en boutique.

C’est le même logique que [qualifier avant de chiffrer](https://www.quotebuilder.co/blog/qualifier-demande-devis-avant-chiffrage) : moins d’allers-retours, plus de signal métier dès la première soumission. Pour le contraste formulaire contact vs parcours structuré, voir aussi [formulaire contact vs funnel devis B2B](https://www.quotebuilder.co/blog/formulaire-contact-vs-funnel-devis-b2b).

![Schéma : clic boutique → URL avec query → funnel prérempli](/blog/preremplir-devis-url-parametres/img-1.png)

## Où ça marche : `/c/` et `/embed/`

Le préremplissage fonctionne sur deux surfaces :

| Surface | Exemple | Usage |
|---------|---------|--------|
| Funnel public | `/c/:org/:slug` | Lien direct, pub, QR, email, bouton boutique |
| Embed iframe | `/embed/:org/:slug` | Widget site, shortcode WordPress, landing Hostinger |

Exemple réel (org démo Quickly, funnel rayonnage) :

`https://www.quotebuilder.co/c/quickly/rayonnage?besoin=rayonnages`

Même logique en embed :

`https://www.quotebuilder.co/embed/quickly/rayonnage?besoin=rayonnages,cantilever`

Le slug et l’org sont les vôtres une fois le funnel publié. La query string reste le levier.

## WordPress : la query de la page hôte passe dans l’iframe

Point important pour les sites Woo / Hostinger : le widget JavaScript QuoteBuilder **copie déjà la query string** de la page hôte vers l’iframe. Vous n’avez pas à bricoler l’URL d’embed à la main si le CTA pointe vers une page WordPress qui porte déjà `?besoin=` ou `?add=`.

Exemple de shortcode :

```
[quotebuilder org="quickly" id="rayonnage"]
```

Sur une URL du type :

`https://votre-boutique.fr/rayonnage-industriel/?besoin=rayonnages&add=SKU-RAY-200`

…le funnel embarqué reçoit les mêmes paramètres. Le CTA « Ajouter à mon devis » peut donc être un simple lien vers la page qui contient le shortcode, enrichie des bons params.

Pour l’installation du widget et du shortcode, voir [installer le widget devis WordPress / JavaScript](https://www.quotebuilder.co/blog/installer-widget-devis-wordpress-javascript). Pour l’intégration boutique plus large : [devis en ligne intégré à la boutique](https://www.quotebuilder.co/blog/devis-en-ligne-integre-boutique).

![Page WordPress avec query + iframe qui reprend ?besoin= et ?add=](/blog/preremplir-devis-url-parametres/img-2.png)

## Tableau des paramètres

| Paramètre | Rôle | Format | Exemple |
|-----------|------|--------|---------|
| `besoin` | Chips de gamme / besoin | Tokens séparés par virgule ; value ou label ; casse et accents ignorés ; répétables | `?besoin=rayonnages` ou `?besoin=rayonnages,cantilever` |
| `add` | Chips **ou** produit catalogue | Même logique chips ; sinon id produit / sku / external id / nom exact | `?add=SKU-RAY-200` |
| `product` | Alias d’un token `add` | Un token traité comme un `add` | `?product=SKU-RAY-200` |

### Comportement de `besoin`

- Chaque token tente de **sélectionner une chip** de gamme / besoin.
- Match sur **value** ou **label**, sans tenir compte de la casse ni des accents.
- Tokens **répétables** et combinables (union).
- Token inconnu : **ignoré** (pas d’erreur bloquante).

### Comportement de `add` (et `product`)

Pour chaque token :

1. Si ça matche une **chip**, la chip est sélectionnée.
2. Sinon, si ça matche un **produit catalogue** (id, sku, external id, ou nom exact), le produit est ajouté en **quantité 1**, avec un texte du type « Ajouté au devis : {nom} » dans le champ précision / notes / besoin selon le design du funnel.
3. Sinon, le token part dans `answers.added` (trace pour le brief), sans casser le parcours.

Règle de priorité : **un match choix (chip) gagne sur un match produit**. Si le même token pourrait être les deux, la chip l’emporte.

![Tableau mental : besoin = chips ; add = chips ou produit ; product = alias add](/blog/preremplir-devis-url-parametres/img-3.png)

## Règles de session (à connaître avant de tester)

Ces règles évitent les mauvaises surprises en QA et en prod :

1. **Union, pas replace.** Les tokens s’ajoutent à la session en cours. Ils n’écrasent pas ce que le prospect a déjà coché.
2. **Tokens inconnus ignorés.** Une typo n’explose pas le funnel ; elle ne fait rien.
3. **Nouvelle gamme → retour à l’étape.** Si le préremplissage change la gamme active, le parcours ramène à l’étape concernée pour que le prospect voie le contexte.
4. **Session déjà soumise inchangée.** Si le dossier est déjà soumis, les params URL ne réécrivent pas la session. Relancer un test = nouvelle session / nouvel onglet privé.
5. **Match choix > produit.** Voir ci-dessus.

Ces détails comptent autant que la syntaxe. Un commercial qui « teste » sur une session déjà soumise croira que ça ne marche pas.

## Exemples concrets (Quickly / rayonnage)

### 1. Une seule gamme

```
https://www.quotebuilder.co/c/quickly/rayonnage?besoin=rayonnages
```

Ouvre le funnel avec la chip rayonnages sélectionnée.

### 2. Plusieurs gammes

```
https://www.quotebuilder.co/c/quickly/rayonnage?besoin=rayonnages,cantilever
```

Union des deux chips (si elles existent dans le funnel).

### 3. Produit par SKU

```
https://www.quotebuilder.co/c/quickly/rayonnage?add=VOTRE-SKU
```

Remplacez `VOTRE-SKU` par un sku / id / external id / nom exact présent dans le catalogue lié. Qty 1 + texte d’ajout dans les notes.

### 4. Combinaison besoin + produit

```
https://www.quotebuilder.co/c/quickly/rayonnage?besoin=rayonnages&add=VOTRE-SKU
```

Gamme cochée + produit ajouté. Utile pour un CTA fiche produit qui veut aussi contextualiser la famille.

### 5. Alias `product`

```
https://www.quotebuilder.co/c/quickly/rayonnage?product=VOTRE-SKU
```

Équivalent à un token `add`. Pratique si votre boutique génère déjà des liens `?product=`.

Pour générer ces URLs sans erreur d’encodage, utilisez le [générateur d’URL de préremplissage devis](https://www.quotebuilder.co/outils/generateur-url-prefill-devis) (calcul 100 % local).

**Vous voulez brancher ça sur votre catalogue :** [essai Free](https://www.quotebuilder.co/signup?plan=free) (1 funnel, wizard) ou [démo rayonnage](https://www.quotebuilder.co/c/demo/rayonnage).

## Cas d’usage e-commerce et Hostinger

### Bouton « Ajouter à mon devis » sur une fiche produit

Sur WooCommerce (Hostinger ou ailleurs) :

1. La fiche produit connaît le SKU (ou l’external id synchronisé).
2. Le bouton pointe vers la page qui embarque le funnel, avec `?add={sku}` (et éventuellement `?besoin=` pour la famille).
3. Le widget reprend la query → le prospect arrive avec le produit déjà dans le brief.

Aligné avec la [sync catalogue WooCommerce / Shopify → parcours devis](https://www.quotebuilder.co/blog/sync-catalogue-woocommerce-shopify-parcours-devis) : le même identifiant catalogue sert au prefill.

### Landing campagne ads / Meta

URL unique par audience :

- campagne « cantilever » → `?besoin=cantilever`
- campagne « pack rack 200 » → `?add=SKU-PACK-200`

Le tracking UTM peut cohabiter avec `besoin` / `add` (query classique). Le préremplissage lit ses clés ; le reste reste disponible pour Analytics.

### QR code atelier / salon

QR → `/c/votre-org/votre-funnel?besoin=rayonnages`. Moins de friction qu’un formulaire papier, et le commercial récupère un brief déjà amorcé dans l’[espace prospect](https://www.quotebuilder.co/blog/espace-prospect-devis-en-ligne).

### Menuiserie / boutique sur mesure

Même pattern que pour le [template boutique menuiserie + devis](https://www.quotebuilder.co/blog/template-boutique-en-ligne-menuiserie-devis) : CTA fiche → page funnel avec `add` = référence bois / finition, `besoin` = typologie (porte, placard, plan de travail).

![Parcours Hostinger : fiche Woo → CTA → page shortcode avec query → brief prérempli](/blog/preremplir-devis-url-parametres/img-4.png)

## Process commercial côté équipe

1. **Marketing / web** : mappe chaque CTA boutique vers une URL préremplie (ou une page WP + query).
2. **Estimateur** : ouvre le dossier ; lit la note « Ajouté au devis : … » et les chips ; complète le chiffrage.
3. **Commercial** : relance depuis le dossier, pas depuis un mail flou « vous vouliez un devis ? ».

Le préremplissage ne remplace pas la [qualification](https://www.quotebuilder.co/blog/qualifier-demande-devis-avant-chiffrage). Il réduit le vide en entrée. Pour un secteur rayonnage, la landing dédiée reste utile : [funnel devis rayonnage & stockage](https://www.quotebuilder.co/secteurs/funnel-devis-rayonnage-stockage).

## Checklist QA (à cocher avant mise en prod)

- [ ] Funnel public `/c/:org/:slug` avec `?besoin=` (1 token connu) : chip sélectionnée.
- [ ] Même test avec 2 tokens `besoin=a,b` : union visible.
- [ ] Token `besoin` inconnu : ignoré, funnel utilisable.
- [ ] `?add=` avec SKU catalogue : qty 1 + texte « Ajouté au devis : … ».
- [ ] `?add=` avec label de chip : chip sélectionnée (priorité choix).
- [ ] `?product=` équivalent à `?add=` pour le même token.
- [ ] Accents / casse : `Rayonnages` et `rayonnages` matchent la même chip.
- [ ] Session déjà remplie : union (pas d’écrasement des choix précédents).
- [ ] Session **déjà soumise** : params sans effet (tester en navigation privée).
- [ ] Page WordPress + shortcode + query hôte : iframe reçoit les params.
- [ ] Embed direct `/embed/...?...` : même comportement que `/c/`.
- [ ] Encodage URL : espaces / caractères spéciaux correctement percent-encodés.

![Checklist QA affichée à côté d’une URL de test](/blog/preremplir-devis-url-parametres/img-5.png)

## Pièges fréquents

### « Ça ne marche pas » alors que la session est déjà soumise

Rouvrir le même onglet après soumission ne réapplique pas les params. Nouvelle fenêtre privée, ou nouveau parcours.

### Tokens faux (SKU pas sync, label inventé)

Ignorés silencieusement. Vérifiez le catalogue et les values de chips dans le builder, pas seulement le libellé marketing de la boutique.

### Accents et typos

Le match ignore accents et casse, pas les fautes d’orthographe. `rayonage` (un n) ne matchera pas `rayonnages`.

### Remplacer toute la session

Le système fait une **union**. Si vous voulez un parcours « propre », partez d’une session neuve, ne comptez pas sur les params pour tout remettre à zéro.

### CTA qui pointe vers `/c/` sans query, alors que la fiche a le SKU

Le SKU doit voyager dans l’URL (ou dans la page WP qui porte le shortcode). Un bouton générique « Demander un devis » sans params revient au funnel vide.

### Confondre `product` boutique et `product` query

Le param query `product` est un **alias de `add`**. Ce n’est pas un ID Woo magique tant que cet ID n’est pas synchronisé dans le catalogue QuoteBuilder.

![Illustration des pièges : session soumise, token faux, accent / typo](/blog/preremplir-devis-url-parametres/img-6.png)

## FAQ

### 1. Est-ce que ça marche seulement sur la démo Quickly ?

Non. Quickly / rayonnage sert d’exemple public. Dès que votre org et votre funnel sont publiés, les mêmes paramètres s’appliquent sur `/c/votre-org/votre-slug` et `/embed/...`.

### 2. Le shortcode WordPress doit-il inclure les paramètres ?

Pas forcément. Si la **page hôte** a déjà la query, le widget la recopie dans l’iframe. Vous pouvez aussi construire une URL d’embed complète si vous contrôlez le HTML.

### 3. Puis-je cumuler UTM et `besoin` / `add` ?

Oui. Ce sont des clés de query indépendantes. Gardez des noms stables pour le préremplissage ; laissez les UTM pour l’analytics.

### 4. Que se passe-t-il si j’ajoute deux fois le même produit ?

Chaque token `add` qui matche un produit suit la logique d’ajout (qty / note). En doute, testez avec un seul SKU clair, puis documentez le comportement attendu pour votre équipe.

### 5. `besoin` peut-il cibler autre chose qu’une chip ?

Le contrat décrit le match sur chips (value ou label). Pour un produit catalogue, utilisez `add` ou `product`.

### 6. Comment lier ça à mon catalogue Woo ?

Synchronisez d’abord le catalogue (sku / external id alignés), puis utilisez ces identifiants dans `add`. Voir la [sync Woo / Shopify](https://www.quotebuilder.co/blog/sync-catalogue-woocommerce-shopify-parcours-devis).

### 7. L’embed change-t-il les règles ?

Non. Mêmes paramètres, mêmes règles de session, sur `/embed/` comme sur `/c/`.

### 8. Puis-je préremplir après qu’un devis a été soumis ?

Non pour cette session. La session soumise reste inchangée. Nouveau parcours pour un nouveau test.

### 9. Y a-t-il un outil pour construire l’URL ?

Oui : [générateur d’URL de préremplissage devis](https://www.quotebuilder.co/outils/generateur-url-prefill-devis). Il sort l’URL complète, la query seule, et un exemple de shortcode.

### 10. Ça remplace un configurateur complet ?

Non. C’est un **amorçage** du brief (chips + produit). Le reste du funnel (dimensions, options, contact) reste à remplir. Pour le débat configurateur vs Excel : [configurateur vs Excel + PDF](https://www.quotebuilder.co/blog/configurateur-devis-vs-excel-pdf).

## Mettre en place en une demi-journée

1. Lister 5 CTA boutique prioritaires (fiches à fort trafic).
2. Pour chacun, décider `besoin` et/ou `add` (SKU sync).
3. Générer les URLs avec le [générateur](https://www.quotebuilder.co/outils/generateur-url-prefill-devis).
4. Brancher les boutons (lien page WP + query, ou URL `/c/` directe).
5. Passer la checklist QA ci-dessus.
6. Former l’équipe à lire la note « Ajouté au devis » dans le dossier.

![Roadmap demi-journée : CTA → URL → QA → brief plus riche](/blog/preremplir-devis-url-parametres/img-7.png)

## Conclusion

Préremplir un devis via l’URL, ce n’est pas un gadget technique. C’est coller le **dernier clic catalogue** au **premier écran funnel**. Les paramètres `besoin`, `add` et `product` fonctionnent sur `/c/` et `/embed/`, y compris quand WordPress recopie la query de la page hôte. Les règles (union, ignore des inconnus, session soumise figée, priorité chip) évitent les surprises si vous les connaissez avant la mise en prod.

**Prochaine étape :** [créer un compte Free](https://www.quotebuilder.co/signup?plan=free), publier un funnel, puis tester [l’exemple rayonnage prérempli](https://www.quotebuilder.co/c/quickly/rayonnage?besoin=rayonnages) ou la [démo publique](https://www.quotebuilder.co/c/demo/rayonnage). Pour la fiche produit riche côté catalogue (specs, plans, notices), enchaînez avec [fiche produit B2B unifiée pour le devis](https://www.quotebuilder.co/blog/fiche-produit-b2b-devis-unifie).
