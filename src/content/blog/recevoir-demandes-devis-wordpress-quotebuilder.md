---
title: "Recevoir des demandes de devis WordPress dans QuoteBuilder"
slug: recevoir-demandes-devis-wordpress-quotebuilder
description: "Plugin WordPress devis B2B : créer un devis QuoteBuilder depuis le site (clé site + CORS), lignes Woo, variantes, widget dual-mode, chat ancré catalogue, notif commerciale. Pipeline, pas un simple formulaire."
canonical: /blog/recevoir-demandes-devis-wordpress-quotebuilder
locale: fr-FR
word_count_target: 2400
keywords:
  - plugin WordPress devis B2B
  - demandes devis WordPress
  - WooCommerce devis QuoteBuilder
  - widget devis site
  - clé site CORS devis
  - recevoir devis WordPress
author: QuoteBuilder
date: 2026-09-23
updated: 2026-09-23
---

# Recevoir des demandes de devis WordPress dans QuoteBuilder

Mardi 11 h 20. Un prospect remplit le formulaire Contact Form 7 de votre site WordPress. Le mail arrive dans une boîte générique. Personne ne sait si c’est un panier rayonnage à 18 000 € ou une demande de brochure. Le commercial rappelle à 16 h. Le lead a déjà envoyé le même brief à deux concurrents. Vous avez un site. Vous n’avez pas encore un **pipeline de devis**.

Ce guide ne reprend pas le coller-coller du snippet. Pour l’installation technique du widget (page, shortcode, CSP), voir [installer un widget devis WordPress / JavaScript](https://www.quotebuilder.co/blog/installer-widget-devis-wordpress-javascript). Ici, l’angle est autre : **comment les demandes nées sur WordPress arrivent dans QuoteBuilder**, deviennent un dossier « Nouveau » utilisable, avec lignes catalogue, variantes Woo, notif commerciale, et éventuellement un chat ancré sur vos specs.

Public : dirigeants PME, responsables e-commerce WooCommerce, commerciaux B2B, agences qui branchent un site sur un vrai outil de devis (pas une boîte mail).


**Testez le parcours bout en bout :** [créer un compte Free](https://www.quotebuilder.co/signup?plan=free) ou [ouvrir la démo funnel rayonnage](https://www.quotebuilder.co/c/demo/rayonnage) (sans compte).


## Le vrai problème : WordPress envoie un message, pas un dossier

Un formulaire de contact classique livre un texte libre. Parfois un téléphone. Rarement un SKU. Presque jamais une quantité fiable, une variante Woo réelle, ou une origine traçable pour le pipeline.

Conséquences typiques :

- ressaisie manuelle dans Excel ou dans un CRM ;
- doublons (même prospect, trois canaux) ;
- délai de première réponse trop long (voir [délai de réponse](https://www.quotebuilder.co/blog/delai-reponse-demande-devis-b2b)) ;
- commercial qui invente un prix « à la louche » parce que le brief est vide.

Le contraste [formulaire contact vs funnel devis B2B](https://www.quotebuilder.co/blog/formulaire-contact-vs-funnel-devis-b2b) reste valable. Ce qui change depuis septembre 2026 côté produit : le pont WordPress → QuoteBuilder ne se limite plus à « coller un iframe ». Il crée un **devis** côté QuoteBuilder, avec règles métier (origine Site Web, lignes Woo, idempotence, notif commerciale).

Pour estimer ce que vous perdez encore avec un formulaire brut, utilisez l’[estimateur leads formulaire vs funnel WP](https://www.quotebuilder.co/outils/estimateur-leads-formulaire-vs-funnel-wp).

## Ce que le pont WordPress → QuoteBuilder fait concrètement

Voici le périmètre live (build 23/09/2026), sans inventer de payload API.

### 1. Le plugin crée un devis dans QuoteBuilder (PR #112)

Quand une demande valide part depuis WordPress (plugin serveur), QuoteBuilder ouvre un devis :

- statut **Nouveau** ;
- origine **Site Web** ;
- lignes basées sur le **catalogue Woo synchronisé** quand c’est possible ;
- **notification commerciale** (équipe / assigné), **pas** un email de nurture au prospect ;
- **idempotence** via un `externalId` : un double envoi du même événement ne duplique pas le dossier ;
- quantité OK sur **produit simple** Woo.

Autrement dit : le site n’envoie plus seulement un mail. Il crée une **entrée pipeline**. Pour la sync catalogue en amont, voir [sync WooCommerce / Shopify → parcours devis](https://www.quotebuilder.co/blog/sync-catalogue-woocommerce-shopify-parcours-devis).

Endpoint conceptuel côté intégrations : `POST /api/integrations/plugin/quotes`. Ne pas coller de payload « magique » trouvé au hasard : suivez la doc plugin / zip du moment.

### 2. Clé site publique + CORS (PR #119)

Avant, créer un devis depuis le navigateur exigeait souvent un Bearer (secret serveur). Pour un widget embarqué sur le site public, ce modèle casse : vous ne mettez pas un secret long-lived dans le HTML.

La clé **site** publique, avec **CORS** correctement borné à vos domaines, permet de créer un devis **depuis le navigateur / le widget**, sans Bearer. Ça ouvre le dual-mode widget et le chat embed, tout en restant dans un périmètre de domaines autorisés.

Règle d’équipe : la clé site n’est pas une clé admin. Elle sert le parcours public. Les secrets serveur restent serveur.

### 3. Widget embed dual-mode (PR #122)

Le widget (snippet / shortcode WordPress, zip plugin autour de **2.3.20**, bump produit **1.29.0**) propose deux modes :

| Mode | Quand l’utiliser | Ce qui arrive dans QuoteBuilder |
|------|------------------|---------------------------------|
| **Catalogue Woo** | Le prospect choisit parmi vos SKU sync | Lignes catalogue réelles |
| **Besoin libre** | Le besoin n’est pas encore un panier clair | Brief structuré, puis chiffrage humain |

IA optionnelle : si vous l’activez, elle ne doit proposer que des **SKU réels** du catalogue. Pas d’invention de références. Clé site + CORS restent le couple d’accès navigateur.

Shortcodes utiles côté WordPress :

- `[quotebuilder]` : funnel / parcours ;
- `[quotebuilder_quote]` : liste / affichage lié au devis.

Détail d’installation (Gutenberg, Elementor, CSP) : guide [installer widget](https://www.quotebuilder.co/blog/installer-widget-devis-wordpress-javascript). Ici on s’arrête au **résultat métier** : un devis créé, pas un mail orphelin.

### 4. Variantes Woo : attributs → variation réelle (PR #125)

Sur Woo, « Bois / 120 cm » n’est pas un SKU. C’est une combinaison d’attributs qui doit résoudre une **variation id** (et son SKU) existante.

Depuis le bump **1.30.0** :

- le widget et le funnel mappent attributs → **variation id / SKU réelle** ;
- une **combinaison inexistante** est **refusée** (pas de ligne fantôme, pas de prix inventé).

Ça évite le classique « le commercial reçoit Chêne 90 cm alors que cette combo n’existe pas en boutique ». Pour le vocabulaire options / variantes côté devis, voir [options, variantes et alternatives](https://www.quotebuilder.co/blog/options-variantes-alternatives-devis-b2b).

### 5. Chat retrieval ancré catalogue (PR #127)

Le chat embed (clé site, bump **1.31.0**) répond à partir de ce que vous avez branché : **catalogue, specs, modes d’emploi**. Il refuse les **prix** et **délais inventés**.

Si le prospect dépasse le périmètre du retrieval, l’escalade part vers un **email commercial** selon la chaîne :

1. commercial **assigné** ;
2. sinon `sales_email` ;
3. sinon **boîte org**.

Jamais d’escalade « magique » vers le prospect lui-même (pas de boucle auto qui se répond). Le chat qualifie et oriente. Le commercial garde la main sur le prix et le planning.

![Schéma : site WP → clé site / plugin → devis Nouveau dans QuoteBuilder](/blog/recevoir-demandes-devis-wordpress-quotebuilder/img-1.png)

## Pipeline après réception : ce qui change pour l’équipe

Recevoir n’est utile que si quelqu’un **traite** vite.

### Statut Nouveau + origine Site Web

Dans QuoteBuilder, le dossier apparaît comme les autres demandes, avec une origine claire. Vous pouvez :

- scorer Hot / Warm / Cold ;
- assigner avec un SLA (voir [assignation et SLA](https://www.quotebuilder.co/blog/assignation-sla-demande-devis-equipe)) ;
- [centraliser multi-canaux](https://www.quotebuilder.co/blog/centraliser-demandes-devis-multi-canaux) (site, ads, boutique) sans mélanger les boîtes mail.

### Notif commerciale, pas nurture prospect

Point important du PR #112 : la création côté plugin **notifie le commercial**. Elle ne déclenche pas automatiquement une séquence nurture au prospect comme si c’était déjà un lead « chaud email ». Vous gardez le contrôle du premier message humain (ou de l’autopilote que vous activez ensuite, consciemment).

### Idempotence : un double clic ≠ deux devis

Les widgets et les plugins retentent. Sans `externalId`, vous multipliez les dossiers jumeaux. Avec idempotence, le second POST du même événement ne crée pas un second Nouveau. Moins de bruit en revue pipeline.

### Préremplir quand vous avez déjà le contexte

Si le prospect arrive depuis une fiche produit, une campagne ou un email, le [préremplissage via URL](https://www.quotebuilder.co/blog/preremplir-devis-url-parametres) réduit encore la friction. Le pont WordPress + préfill = moins de champs vides, plus de lignes catalogue correctes.


**Cadrez réception et traitement sur un vrai compte :** [essai Free](https://www.quotebuilder.co/signup?plan=free) · [démo rayonnage](https://www.quotebuilder.co/c/demo/rayonnage).


## Parcours type (à coller en runbook interne)

1. **Sync catalogue Woo** à jour (SKU, variantes, prix HT de référence).
2. **Domaines autorisés** + clé site (CORS) pour le front.
3. **Plugin / shortcodes** : `[quotebuilder]` sur les pages devis, `[quotebuilder_quote]` si besoin de liste.
4. **Mode widget** : catalogue Woo sur fiches produit ; besoin libre sur pages « projet » / contact avancé.
5. **Variantes** : tester 3 combos valides + 1 combo inexistante (doit refuser).
6. **Chat** (optionnel) : brancher specs / modes d’emploi ; vérifier qu’un prix inventé est refusé.
7. **QA réception** : un devis Nouveau, origine Site Web, lignes cohérentes, notif commerciale reçue, pas de doublon au double envoi.
8. **SLA** : qui prend les Nouveaux Site Web sous X minutes.
9. **Mesure** : délai première réponse, % dossiers exploitables sans rappel, heures de ressaisie évitées.

![Checklist QA : sync, clé site, shortcode, variante, devis Nouveau](/blog/recevoir-demandes-devis-wordpress-quotebuilder/img-2.png)


## Qui fait quoi (rôles)

Sans rôles clairs, le pont technique marche et le process humain casse.

| Rôle | Responsabilité typique |
|------|------------------------|
| **E-commerce / WP** | Plugin à jour, shortcodes, CORS, pages cibles |
| **Catalogue** | Sync Woo, variantes complètes, prix HT de référence |
| **Commercial** | Prise en charge des Nouveaux Site Web, premier message |
| **Manager** | SLA, file d'attente, revue des dossiers morts |
| **Support / SAV** | Contenu specs / modes d'emploi pour le chat retrieval |

Une réunion de 20 minutes suffit pour figer : qui reçoit la notif, qui répond sous 1 h, qui corrige une variante refusée. Sinon chacun croit que « le site gère ».

## Indicateurs à suivre après branchement

Ne jugez pas le succès au nombre de mails reçus. Suivez :

1. **Nombre de devis créés** depuis Site Web (pas de messages contact).
2. **% exploitables** sans rappel (brief + lignes ou besoin libre lisible).
3. **Délai médian** première action commerciale.
4. **Taux de refus variante** (signale un catalogue sale).
5. **Doublons évités** (idempotence visible en QA).
6. **Escalades chat** traitées sous SLA.

Si le volume Site Web monte mais le délai de réponse aussi, vous avez un problème de capacité, pas d'acquisition. Croisez avec votre [délai de réponse](https://www.quotebuilder.co/blog/delai-reponse-demande-devis-b2b) et la charge équipe.

## Cas métier

### Boutique Woo + pose (rayonnage, menuiserie, stores)

Le prospect configure sur la fiche. Le widget catalogue envoie des lignes réelles. Le commercial ouvre un Nouveau déjà partiellement chiffrable. La pose reste humaine ; le catalogue ne l’est plus.

### Site vitrine sans panier clair

Mode besoin libre : dimensions, usage, budget indicatif, photos. Le devis arrive quand même en pipeline. Vous évitez le mail « bonjour je voudrais un devis » sans pièce jointe.

### Agence multi-sites

Clé site par domaine, CORS strict, shortcodes identiques. Les demandes remontent dans l’org QuoteBuilder avec origine Site Web, puis assignation par marque ou par commercial.

## Erreurs fréquentes

1. Coller le widget sans sync Woo : lignes vides ou fausses.
2. Mettre un secret Bearer dans le HTML public.
3. Autoriser CORS à `*` « pour tester » et oublier de resserrer.
4. Confondre shortcode funnel et shortcode liste.
5. Laisser le chat inventer un délai de pose (il doit refuser).
6. Croire que la notif plugin = email nurture prospect.
7. Ignorer l’idempotence : double devis à chaque refresh.
8. Accepter une combo variante qui n’existe pas en Woo.
9. Ne pas assigner les Nouveaux Site Web (file d’attente morte).
10. Mesurer les « leads mail » au lieu des devis créés exploitables.

## Checklist équipe (une page)

1. Catalogue Woo sync OK (produits simples + variantes).
2. Clé site + domaines CORS documentés.
3. Plugin à jour (zip shortcode ~2.3.20 / bumps 1.29 → 1.31 selon lot).
4. `[quotebuilder]` sur pages cibles ; mode catalogue vs besoin libre choisi.
5. Test variante inexistante = refus.
6. Test double envoi = un seul devis (`externalId`).
7. Notif commerciale reçue ; pas d’email nurture auto non voulu.
8. Chat (si actif) ancré specs ; escalade vers assigné / sales_email / boîte org.
9. SLA première prise en charge Site Web.
10. KPI mensuel : % demandes exploitables, heures évitées, délai réponse.

![Flux commercial : Nouveau Site Web → assignation → chiffrage → relance](/blog/recevoir-demandes-devis-wordpress-quotebuilder/img-3.png)

## FAQ

### Le plugin WordPress envoie-t-il un email au prospect à la création du devis ?

Non pour le flux PR #112 décrit ici : la création notifie le **commercial**. Le nurture / confirmation prospect se configure à part (autopilote, message manuel), ce n’est pas le même événement.

### Faut-il un Bearer pour créer un devis depuis le widget navigateur ?

Non. Avec la **clé site** et le **CORS** (PR #119), le navigateur peut créer un devis sans Bearer. Gardez les secrets serveur hors du front.

### Quelle différence entre `[quotebuilder]` et `[quotebuilder_quote]` ?

`[quotebuilder]` porte le funnel / parcours. `[quotebuilder_quote]` sert la liste / vue liée au devis. Ne les intervertissez pas sur une landings « demander un devis ».

### Que se passe-t-il si la variante Woo n’existe pas ?

Depuis le PR #125, la combo inexistante est **refusée**. Pas de ligne fantôme. Corrigez le catalogue ou le mapping attributs.

### L’IA du widget peut-elle inventer un SKU ?

Non dans le cadre prévu : SKU **réels** uniquement. Si le catalogue est vide ou désync, réparez la sync avant d’activer l’IA.

### Le chat peut-il donner un prix ou un délai de pose ?

Il doit **refuser** les prix et délais inventés (PR #127). Il s’appuie sur catalogue / specs / modes d’emploi. Pour le reste : escalade email commercial.

### Comment éviter les doublons quand le prospect clique deux fois ?

L’idempotence via `externalId` (PR #112) fusionne / ignore le second événement identique. Vérifiez en QA avec un double submit volontaire.

### Où landent les demandes par rapport aux autres canaux ?

Dans le même pipeline QuoteBuilder, avec origine **Site Web**. Utile pour [centraliser multi-canaux](https://www.quotebuilder.co/blog/centraliser-demandes-devis-multi-canaux) sans boîtes concurrentes.

### Comment mesurer si le formulaire contact me coûte encore trop cher ?

Comptez demandes/mois, % exploitables sans rappel, minutes de ressaisie, taux de réponse sous 24 h. L’[estimateur formulaire vs funnel WP](https://www.quotebuilder.co/outils/estimateur-leads-formulaire-vs-funnel-wp) donne un ordre de grandeur (heures perdues, demandes mortes, score maturité).

### Ce guide remplace-t-il la doc d’installation du widget ?

Non. Pour CSP, domaines, Gutenberg, Elementor : [installer le widget](https://www.quotebuilder.co/blog/installer-widget-devis-wordpress-javascript). Ici : réception, pipeline, règles produit live.

## Conclusion

WordPress peut rester votre vitrine. Ce qui change, c’est la **destination** des demandes : un devis QuoteBuilder (Nouveau, origine Site Web), des lignes Woo réelles, des variantes qui existent vraiment, une clé site pour le navigateur, un widget dual-mode, un chat qui ne invente pas les prix, et une notif qui réveille le commercial, pas une boîte noire.

Sans ce pont, vous collectez des messages. Avec ce pont, vous alimentez un pipeline. Le reste (SLA, score, relances, préfill) s’accroche dessus.

Pour brancher réception et traitement : [essai Free](https://www.quotebuilder.co/signup?plan=free) ou [démo rayonnage](https://www.quotebuilder.co/c/demo/rayonnage).
