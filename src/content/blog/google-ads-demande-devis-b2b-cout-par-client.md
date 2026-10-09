---
title: "Google Ads et demande de devis B2B : mesurer le coût par devis et le coût par client"
slug: google-ads-demande-devis-b2b-cout-par-client
description: "Google Ads pour la demande de devis B2B : calculer le coût par devis et le coût par client, fixer un coût maximum à partir de la marge, rattacher chaque demande à son clic (gclid, UTM), renvoyer la demande et l'affaire gagnée à Google Ads, et lire les chiffres sans se tromper."
canonical: /blog/google-ads-demande-devis-b2b-cout-par-client
locale: fr-FR
word_count_target: 2500
keywords:
  - Google Ads demande de devis
  - coût par devis
  - coût par client B2B
  - coût par lead B2B
  - conversions hors connexion Google Ads
  - gclid demande de devis
  - ROI Google Ads B2B
author: QuoteBuilder
date: 2026-10-09
updated: 2026-10-09
---

# Google Ads et demande de devis B2B : mesurer le coût par devis et le coût par client

Une campagne Google Ads qui vend des prestations sur devis se juge mal depuis Google Ads seul. Le compte voit des clics, parfois des formulaires envoyés, puis plus rien : la signature arrive trois semaines plus tard, par email ou au téléphone, loin de l'annonce. Résultat, on coupe une campagne qui ramenait des clients et on garde celle qui ramenait des demandes sans suite.

Voici deux chiffres simples, le coût par devis et le coût par client, le maximum à payer pour chacun, et la façon dont une demande reste rattachée à son clic jusqu'à l'affaire gagnée, avec ce que fait QuoteBuilder dans cette chaîne et ce qu'il ne fait pas.

**Voir un funnel côté prospect :** [démo funnel rayonnage](https://www.quotebuilder.co/c/demo/rayonnage), sans compte. Pour suivre vos campagnes jusqu'au devis signé : [créer un compte Free](https://www.quotebuilder.co/signup?plan=free).

## Ce que Google Ads voit, et ce qu'il ne voit pas

Google Ads voit l'annonce, le clic, le coût et, avec une balise de conversion, le formulaire envoyé. Tout ce qui suit lui échappe : qualification, rappel, chiffrage, négociation, signature. Or c'est là que se décide la rentabilité. Une campagne peut produire beaucoup de demandes hors cible (particuliers sur une offre professionnelle, petites quantités, zone non desservie) et peu de clients, une autre moitié moins de demandes mais des demandes qui se signent. À ne regarder que les formulaires, on favorise la première.

L'« importation des conversions hors connexion » comble ce trou : on renvoie à Google Ads, après coup, les ventes conclues hors du site, rattachées au clic d'origine. C'est la boucle fermée décrite sur la page [Google Ads de QuoteBuilder](https://www.quotebuilder.co/fonctionnalites/ads).

## Coût par devis et coût par client : deux chiffres, deux usages

Le **coût par devis** est la dépense publicitaire divisée par le nombre de demandes de devis reçues depuis les annonces. Il répond à la question : combien me coûte un dossier à rappeler ?

Le **coût par client** est la même dépense divisée par le nombre de dossiers passés au statut Gagné. C'est le vrai coût d'acquisition : combien me coûte une affaire signée ?

Le coût par devis réagit vite et sert à piloter mots-clés, annonces et page d'arrivée. Le coût par client suit le rythme des signatures et sert à décider où mettre le budget.

Exemple, avec des hypothèses à remplacer par les vôtres. Une campagne dépense 1 500 € dans le mois, pour un coût moyen de 2,50 € par clic : 600 clics. Si 4 % des visiteurs envoient une demande, cela fait 24 demandes, soit un coût par devis de 62,50 €. Si 20 % de ces demandes passent Gagné, cela fait 4,8 clients, soit un coût par client de 312,50 €.

Reste à savoir si c'est cher, en le comparant à ce que rapporte un client.

## Le coût par client maximum : partir de la marge

Le bon plafond ne vient pas du budget, il vient de la marge. Si un client signé vous laisse en moyenne 1 800 € de marge brute, vous pouvez payer jusqu'à 1 800 € pour l'acquérir avant de perdre de l'argent sur la première affaire. C'est le coût par client à l'équilibre.

On en déduit les autres plafonds en remontant l'entonnoir :

- **Coût par devis maximum** = coût par client maximum × taux de demandes gagnées. Avec 1 800 € et 20 %, une demande ne doit pas coûter plus de 360 €.
- **Coût par clic maximum** = coût par devis maximum × taux de clics qui deviennent des demandes. Avec 360 € et 4 %, le clic ne doit pas dépasser 14,40 €.

Dans l'exemple ci-dessus, 312,50 € par client pour 1 800 € de marge laisse de la place. Sur 4,8 clients à 6 000 € de panier moyen et 30 % de marge, la campagne dégage 8 640 € de marge brute pour 1 500 € dépensés, soit 5,76 € de marge par euro investi.

Prenez la marge de la première affaire, pas une valeur client sur plusieurs années que vous ne connaissez pas vraiment, et un panier moyen calculé sur les affaires signées. L'équilibre n'est pas un objectif : il faut aussi payer le temps passé à chiffrer les demandes perdues.

Notre [calculateur de coût par devis et par client Google Ads](https://www.quotebuilder.co/outils/calculateur-cout-par-client-google-ads-devis) fait ces calculs à partir de vos sept hypothèses, et signale quand le volume est trop faible pour juger.

## Comment une demande reste rattachée à son clic

Le rattachement repose sur ce que Google ajoute à l'adresse de la page quand quelqu'un clique sur une annonce. Avec le marquage automatique activé dans Google Ads, l'URL reçoit un paramètre `gclid`, l'identifiant du clic. Google précise que ce paramètre est obligatoire pour le suivi des conversions sur un site et qu'il sert aussi aux conversions hors connexion. Selon l'appareil et le parcours, Google peut transmettre à la place `gbraid` ou `wbraid`.

QuoteBuilder lit ces paramètres à l'arrivée du visiteur, avec les UTM, le référent et la page d'arrivée, les garde sur la session du funnel et les copie sur la demande à l'envoi. Une demande avec un `gclid`, un `gbraid` ou un `wbraid` est classée en source « Google Ads », même sans UTM. Sans identifiant de clic, `utm_source=google` avec `utm_medium=cpc` donne aussi « Google Ads ».

Avec le widget intégré à votre site, le script lit ces paramètres dans l'adresse de la page hôte et les garde le temps de la visite, même si le prospect visite deux ou trois pages avant d'ouvrir le funnel. Voir [installer le widget de devis sur WordPress ou en JavaScript](https://www.quotebuilder.co/blog/installer-widget-devis-wordpress-javascript).

La limite est celle de tout suivi au clic : un prospect qui revient une semaine plus tard en tapant votre adresse et démarre un nouveau parcours sera classé selon ce nouveau chemin. S'il reprend le parcours commencé, la session d'origine garde son attribution.

## Nommer ses campagnes pour que la dépense retombe au bon endroit

Pour calculer un coût par devis, il faut relier deux mondes : les demandes, qui portent un `utm_campaign`, et les dépenses, qui portent un nom de campagne Google Ads. QuoteBuilder fait ce lien par le nom. Il compare les deux après normalisation : minuscules, accents retirés, espaces et ponctuation remplacés par des tirets. « Search Rayonnage » côté Google Ads et `search-rayonnage` dans l'URL tombent donc ensemble.

Le plus simple est de partir du lien que prépare QuoteBuilder. Sur la page Acquisition, « Préparer une campagne » propose trois gestes : choisir la page d'arrivée (funnel, boutique ou site WordPress), copier le lien qui contient déjà `utm_source=google`, `utm_medium=cpc` et le nom de campagne, puis nommer la campagne Google Ads comme indiqué. En option, une liste de mots-clés par métier (rayonnage, cuisine, menuiserie, paysage, location, aménagement, sur mesure) est prête à coller.

Trois règles évitent les mauvaises surprises :

1. **Un nom distinct par campagne.** Le nom proposé dépend du métier : deux funnels du même métier reçoivent le même. Donnez-leur alors deux noms différents, à l'identique dans le lien et dans Google Ads.
2. **Pas de noms contenus l'un dans l'autre.** Le rapprochement accepte qu'un nom contienne l'autre, pour tolérer les préfixes. « rayonnage » et « rayonnage-idf » risquent de se mélanger : préférez « rayonnage-nord » et « rayonnage-idf ».
3. **Pas de faute de frappe.** Un `utm_campaign` mal tapé crée une campagne fantôme côté demandes, sans dépense en face.

Pour pré-remplir certaines réponses du funnel depuis l'annonce, voir [pré-remplir un devis par l'URL](https://www.quotebuilder.co/blog/preremplir-devis-url-parametres).

## Ce que QuoteBuilder renvoie à Google Ads

Un administrateur connecte un compte Google Ads par la page Acquisition. Un seul compte par organisation : c'est celui qui paie les annonces et qui reçoit les conversions. À la connexion, QuoteBuilder crée dans ce compte deux actions de conversion de type importation : « Devis soumis » (catégorie envoi de formulaire de prospect) et « Affaire gagnée » (catégorie prospect converti). Leur fenêtre de suivi après clic est réglée sur 90 jours.

Ensuite, deux envois :

- **À l'envoi de la demande**, si la session porte un identifiant de clic, QuoteBuilder envoie la conversion « Devis soumis », datée de la création de la demande.
- **Au passage au statut Gagné**, posé dans l'application ou par l'API, QuoteBuilder envoie « Affaire gagnée », datée du moment où le statut change.

Les demandes sans identifiant de clic ne sont pas envoyées. Les conversions partent sans montant : Google Ads compte les demandes et les affaires gagnées, pas leur valeur, ce qui permet de viser un coût par conversion, pas un retour sur dépense en valeur. Côté dépenses, QuoteBuilder relit chaque jour impressions, clics et coût des 30 derniers jours, et un administrateur peut relancer la synchronisation à la main.

Le statut Gagné fait foi. Une affaire signée sans mise à jour du dossier n'existe ni pour Google Ads ni pour votre coût par client. Voir [les statuts du pipeline de devis](https://www.quotebuilder.co/blog/statuts-pipeline-devis-b2b).

## Vérifier côté Google avant de faire confiance aux chiffres

Une conversion envoyée n'est pas toujours une conversion comptée. Google le dit lui-même dans sa documentation développeur : une réponse positive à l'envoi ne garantit pas que la conversion sera attribuée. Les statistiques importées peuvent mettre jusqu'à trois heures à apparaître, et elles sont rattachées à la date d'impression du clic d'origine, pas à la date de l'envoi.

Google a aussi annoncé qu'à partir du 15 juin 2026, l'importation des conversions hors ligne passe par l'API Data Manager, les anciennes requêtes pouvant être refusées pour les comptes techniques qui ne les utilisaient pas déjà. Raison de plus pour contrôler.

Le contrôle prend cinq minutes : dans Google Ads, Objectifs puis Conversions, comparez sur un mois les « Devis soumis » aux demandes classées Google Ads dans vos Statistiques. Un petit écart est normal. Si Google Ads affiche zéro alors que vous avez des demandes issues des annonces, signalez-le au support avant de piloter vos enchères sur ces conversions.

Côté réglages Google Ads, décidez quelle action sert à l'optimisation : tant que les affaires gagnées sont rares, une stratégie d'enchères qui vise « Affaire gagnée » manque de données.

## Délai de signature et fenêtre de 90 jours

Google Ads ne compte une conversion que si elle arrive dans la fenêtre de suivi de l'action. Par défaut, Google applique 30 jours aux campagnes Display et Réseau de Recherche, et la fenêtre peut aller jusqu'à 90 jours selon la source. Google donne l'exemple inverse : avec une fenêtre de sept jours, une conversion survenue au huitième jour n'apparaît pas dans les rapports.

Les deux actions de QuoteBuilder sont créées avec 90 jours. Si votre délai entre clic et signature dépasse trois mois (appels d'offres, chantiers planifiés de loin), une partie des affaires gagnées ne remontera jamais dans Google Ads, tout en restant visible dans QuoteBuilder.

Le délai joue aussi sur la lecture. Avec 45 jours entre clic et signature, les clients d'un mois de dépense arrivent surtout le mois suivant : le coût par client paraît trop élevé au lancement d'une campagne, trop bas après son arrêt. Jugez-le sur une période au moins égale à votre délai de signature, arrondie au mois.

## Lire l'onglet Campagnes des Statistiques

Dans QuoteBuilder, l'onglet Campagnes des [Statistiques](https://www.quotebuilder.co/fonctionnalites/stats) affiche quatre repères en haut : « Dépensé » (ce que Google Ads a facturé sur la période, visible une fois le compte branché), « Devis des pubs » (demandes dont le visiteur est arrivé par une annonce), « Un devis coûte » et « Un client coûte ». Le tableau détaille ensuite, ligne par ligne : campagne, source, funnel, devis, gagnés, coût d'un devis, coût d'un client.

La page Acquisition classe les campagnes par coût par client, la plus rentable en haut. Sans compte branché, les campagnes apparaissent quand même dès les premières demandes taguées, avec devis et gagnés : il manque seulement la dépense, donc les coûts.

Pour la lecture marche par marche du funnel lui-même, de la visite à l'affaire gagnée, voir [mesurer un funnel de devis B2B](https://www.quotebuilder.co/blog/mesurer-funnel-devis-b2b-entonnoir-statistiques) et l'[estimateur des fuites de l'entonnoir](https://www.quotebuilder.co/outils/estimateur-fuites-entonnoir-funnel-devis).

## Quand le volume est trop faible pour juger

Avec deux à cinq signatures par mois, le coût par client saute pour une affaire de plus ou de moins : sur 1 500 € de dépense, deux clients donnent 750 € par client, trois clients 500 €. La campagne n'a pas changé, le hasard si. Pilotez alors au coût par devis pour les décisions de la semaine, jugez le coût par client sur un cumul de trois mois, et ne coupez pas une campagne sur un mois sans signature si ses demandes sont bonnes.

La qualité des demandes se lit aussi dans le score Hot, Warm ou Cold que QuoteBuilder calcule à l'envoi. Une campagne qui ne ramène que des demandes Cold mérite d'être revue avant même la première signature. Voir [le score d'une demande de devis](https://www.quotebuilder.co/blog/score-demande-devis-b2b).

## Ce que QuoteBuilder ne fait pas

- **Pas de gestion de campagnes.** Annonces, budgets et enchères se règlent dans Google Ads. QuoteBuilder mesure, il ne pilote pas.
- **Pas de test A/B de funnel.** Pour comparer deux pages d'arrivée, utilisez deux campagnes distinctes et comparez leurs lignes.
- **Pas de bandeau de consentement sur le funnel.** Si vous branchez aussi GA4 ou Tag Manager, le consentement des visiteurs reste à votre charge. Voir [RGPD et demande de devis B2B](https://www.quotebuilder.co/blog/rgpd-demande-devis-b2b-consentement-conservation).

## Une routine mensuelle en vingt minutes

1. **Mettre à jour les statuts** : chaque dossier signé au statut Gagné, chaque dossier perdu au statut Perdu.
2. **Contrôler l'envoi** : « Devis soumis » côté Google Ads contre demandes issues des annonces côté QuoteBuilder.
3. **Lire le coût par devis par campagne** et relire dix demandes de la plus chère : sont-elles dans la cible ?
4. **Lire le coût par client sur trois mois** face au maximum calculé avec votre marge.
5. **Décider une seule chose** : budget, mots-clés ou page d'arrivée. Pas les trois à la fois, sinon vous ne saurez pas ce qui a marché.

Le [simulateur de taux de conversion](https://www.quotebuilder.co/outils/simulateur-taux-conversion-devis) aide à chiffrer l'effet d'un gain de quelques points sur le taux de demandes gagnées.

**Passez de la demande au client signé :** [créer un compte Free](https://www.quotebuilder.co/signup?plan=free) · [voir la démo](https://www.quotebuilder.co/c/demo/rayonnage) · [calculer votre coût par client](https://www.quotebuilder.co/outils/calculateur-cout-par-client-google-ads-devis)

## FAQ

### Quelle différence entre coût par devis et coût par client ?

Le coût par devis divise la dépense publicitaire par le nombre de demandes reçues depuis les annonces. Le coût par client la divise par le nombre de dossiers passés au statut Gagné. 

### Comment calculer le coût par client maximum acceptable ?

Partez de la marge brute moyenne d'une affaire signée : c'est le coût par client à l'équilibre. Multipliez-le par votre taux de demandes gagnées pour obtenir le coût par devis maximum, puis par votre taux de clics transformés en demandes pour obtenir le coût par clic maximum.

### Comment Google Ads sait-il qu'une demande de devis a été signée ?

Il ne le sait que si vous le lui renvoyez. Avec Google Ads connecté, QuoteBuilder envoie la conversion « Affaire gagnée » quand un dossier passe au statut Gagné, à condition que la demande d'origine porte un identifiant de clic Google.

### Qu'est-ce que le gclid et pourquoi est-il indispensable ?

C'est l'identifiant de clic que Google ajoute à l'URL quand le marquage automatique est activé. Sans lui, la demande ne peut pas être rattachée à l'annonce, ni la conversion renvoyée.

### Faut-il des UTM si le gclid est présent ?

Oui pour le coût par devis. Le `gclid` suffit à classer la demande en source Google Ads et à renvoyer les conversions, mais c'est le `utm_campaign` qui permet de rapprocher la demande du nom de campagne Google Ads et donc de sa dépense.

### QuoteBuilder envoie-t-il le montant du devis à Google Ads ?

Non. Les conversions « Devis soumis » et « Affaire gagnée » partent sans valeur : on peut viser un coût par conversion, pas un retour sur dépense en valeur.

### Que se passe-t-il si la signature arrive plus de 90 jours après le clic ?

Les actions créées par QuoteBuilder ont une fenêtre de 90 jours après clic. Une signature plus tardive reste visible dans QuoteBuilder, mais Google Ads ne la rattachera pas à l'annonce.

### Pourquoi mon coût par client change-t-il autant d'un mois à l'autre ?

Parce que le nombre de clients est petit : avec deux ou trois signatures par mois, une affaire de plus ou de moins change tout. Jugez-le sur trois mois et pilotez au coût par devis entre-temps.

### Peut-on voir les campagnes sans connecter Google Ads ?

Oui. Les demandes arrivées avec des UTM apparaissent dans l'onglet Campagnes des Statistiques, avec les devis et les gagnés. Il manque seulement la dépense, donc le coût par devis et le coût par client.

### QuoteBuilder peut-il créer ou optimiser mes campagnes Google Ads ?

Non. Annonces, budgets et enchères se gèrent dans Google Ads. QuoteBuilder prépare le lien suivi et des mots-clés par métier, crée les deux actions de conversion et mesure les coûts.

## Sources

- Google, Aide Google Ads, « Identifiant de clic Google (GCLID) : définition ». https://support.google.com/google-ads/answer/9744275?hl=fr
- Google, Aide Google Ads, « À propos des périodes de suivi des conversions ». https://support.google.com/google-ads/answer/3123169?hl=fr
- Google, Aide Google Ads, « À propos de l'importation des conversions hors connexion » (note sur la migration du 15 juin 2026). https://support.google.com/google-ads/answer/2998031?hl=fr
- Google for Developers, Google Ads API, « Manage offline conversions » (mise à jour du 6 octobre 2026). https://developers.google.com/google-ads/api/docs/conversions/upload-offline

## Pour aller plus loin

- [Mesurer un funnel de devis B2B](https://www.quotebuilder.co/blog/mesurer-funnel-devis-b2b-entonnoir-statistiques)
- [Les statuts du pipeline de devis](https://www.quotebuilder.co/blog/statuts-pipeline-devis-b2b)
- [Sources d'une demande de devis B2B](https://www.quotebuilder.co/blog/sources-demande-devis-b2b-funnel-api)
- [Pré-remplir un devis par l'URL](https://www.quotebuilder.co/blog/preremplir-devis-url-parametres)
- [Calculateur de coût par devis et par client Google Ads](https://www.quotebuilder.co/outils/calculateur-cout-par-client-google-ads-devis)
- [Funnel de devis rayonnage et stockage](https://www.quotebuilder.co/secteurs/funnel-devis-rayonnage-stockage)
- [Google Ads](https://www.quotebuilder.co/fonctionnalites/ads)
