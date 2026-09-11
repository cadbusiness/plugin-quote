---
title: "Relancer un devis Hot depuis le dossier : SLA, owner et automations"
slug: relancer-devis-hot-depuis-dossier
description: "Process métier : relancer un devis Hot depuis le dossier QuoteBuilder. Score, owner, SLA, actions Écrire/Appeler/Relancer, automations vs jugement commercial, checklist équipe."
canonical: /blog/relancer-devis-hot-depuis-dossier
locale: fr-FR
word_count_target: 2200
keywords:
  - relancer devis Hot
  - SLA devis B2B
  - owner devis commercial
  - automation relance devis
  - dossier devis QuoteBuilder
author: QuoteBuilder
date: 2026-09-11
updated: 2026-09-11
---

# Relancer un devis Hot depuis le dossier : SLA, owner et automations

Un devis marqué **Hot** n’est pas une médaille. C’est une alerte. Score élevé, brief déjà riche, signal d’urgence ou de fit. Si personne n’est owner, si le SLA n’est pas écrit, et si la prochaine action n’existe que dans la tête du commercial, ce dossier chaud meurt exactement comme un Cold : dans le silence.

Ce guide décrit le **vrai process** : lire la file Demandes filtrée Hot, ouvrir le dossier, comprendre pourquoi le score est haut, choisir Écrire / Appeler / Relancer, puis séparer ce que l’automation porte de ce que le jugement commercial doit décider. Captures issues de l’espace démo QuoteBuilder. Pas de cover abstraite : des écrans de travail.

Public : responsables commerciaux, fondateurs solo, PME et agences qui chiffrent des offres configurables et qui ont déjà (ou veulent) une notion de score Hot / Warm / Cold.


**Commencer tout de suite :** [créer un compte Free](https://www.quotebuilder.co/signup?plan=free) pour voir pipeline et dossiers, ou [ouvrir la démo funnel rayonnage](https://www.quotebuilder.co/c/demo/rayonnage) (sans compte) pour voir d’où naît une demande scorée.


## Pourquoi un Hot sans owner ni SLA meurt

Le score ne vend pas. Il **priorise**. Dans [comment scorer une demande de devis B2B](/blog/score-demande-devis-b2b), on pose une grille simple (fit, urgence, complétude, budget, comportement). Hot signifie en pratique : répondre vite, chiffrer en priorité, ne pas laisser le dossier dormir sous une pile de Warm.

Trois raisons fréquentes de mort d’un Hot :

1. **Pas d’owner nommé.** « L’équipe » n’appelle personne. Deux commerciaux pensent que l’autre s’en occupe. Personne ne note l’échange.
2. **Pas de SLA écrit.** « On traite les urgents en priorité » n’est pas un SLA. Un SLA dit : Hot le jour même (souvent sous 1 à 2 h ouvrées pour le premier contact humain), Warm sous 24 à 48 h, Cold en cadence automatisée.
3. **Relance sans matière.** Un mail « je me permets de revenir » sur un Hot qui a demandé une visite sur site ou joint un plan, c’est du bruit. Le dossier contient déjà les raisons du score : il faut s’en servir.

Les ordres de grandeur de suivi B2B (plusieurs touches utiles avant close, abandon fréquent après une ou deux relances) sont détaillés dans [pourquoi les devis meurent sans relance](/blog/pourquoi-les-devis-meurent-sans-relance). Ici, on se concentre sur l’exécution **depuis le dossier**, pas depuis la boîte mail personnelle.

> Attention. Un Hot 90+ qui attend huit jours n’est plus un Hot opérationnel. C’est un dossier brûlé avec un label trompeur. Le score doit déclencher un comportement d’équipe, pas décorer une colonne.

## D’où vient le Hot : le funnel crée le brief

Avant la file vendeur, le prospect a (idéalement) passé un parcours structuré. Dans la démo rayonnage, le funnel public commence par une question métier simple : type d’espace à équiper. Chaque étape ajoute des tags utiles au score et à la relance.

![Funnel public rayonnage, étape type de projet](/images/blog/relancer-devis-hot-depuis-dossier/09-public-funnel.png)
*Funnel public `/c/demo/rayonnage` : étape 1 sur 5, choix du type d’espace. C’est la matière du brief qui alimentera le score Hot.*

Sans cette entrée, le commercial reçoit « devis svp » et invente le fit. Avec cette entrée, Léa Moreau n’arrive pas comme un ticket : elle arrive avec surface, charge, accès, urgence. Le score Hot devient explicable. La relance devient précise.

Pour la visite complète entrée → dossier, voir [visite guidée du parcours devis B2B](/blog/visite-guidee-parcours-devis-b2b).

## L’accueil : le Hot apparaît dans le pipeline

Côté vendeur, le premier réflexe du matin n’est pas d’ouvrir Gmail. C’est l’**accueil** : KPIs, demandes prioritaires, abandons, tendance. Les Hot et Warm sont visibles sans ouvrir vingt onglets.

![Accueil QuoteBuilder, KPIs et demandes scorées Hot/Warm](/images/blog/relancer-devis-hot-depuis-dossier/02-accueil.png)
*Accueil `/accueil` : pipeline à traiter, demandes Hot/Warm scorées, signaux d’abandons. La priorisation commence ici.*

Dans la capture démo, Léa Moreau (Hôtel Rivage) arrive en **HOT 91** : projet multi-produits, grande surface, charge lourde. Claire Martin en **HOT 86**. Thomas Berger en **WARM 64**. Le commercial sait où poser son temps avant même d’ouvrir la liste complète.

Ce que l’accueil ne fait pas à votre place : **assigner un owner** et **tenir le SLA**. Si Léa est Hot depuis huit jours sans réponse, l’écran vous le dira. L’équipe doit encore exécuter.

> Astuce. Faites de l’accueil le point de départ de la stand-up commerciale (5 minutes). Une question suffit : « Qui traite les Hot sans réponse aujourd’hui ? » Si la réponse est floue, le SLA n’existe pas encore.

## Lire la liste Demandes filtrée Hot

La vue Demandes est la file de travail. Filtres par statut, assigné, score, dates. Export CSV si besoin. Chaque ligne montre le dossier, le projet (fourchette estimée, tags), le score, la source, et l’âge ou l’alerte de suivi.

![Liste des demandes devis avec scores Hot et alertes](/images/blog/relancer-devis-hot-depuis-dossier/03-devis.png)
*Liste `/devis` : dossiers, fourchettes, tags de qualification, scores, source, alertes « sans réponse ». Filtrez Hot pour la session de relance.*

Process type d’une session « Hot » (20 à 40 minutes) :

1. Filtrer **score Hot** (et éventuellement « sans réponse » / non assigné).
2. Trier par âge décroissant ou par score : les plus vieux Hot d’abord si le SLA est déjà cassé, sinon les plus chauds du jour.
3. Ouvrir le dossier **dans l’outil**, pas reconstruire le brief depuis le mail.
4. Décider en 30 secondes : Écrire, Appeler, ou Relancer (séquence).
5. Noter l’action et la prochaine date. Clore proprement si perdu / hors cible.

Exemple lu sur l’écran : Léa Moreau, Google Ads, ligne de cuisson pro estimée 22 580 € à 29 600 €, tags « Grande surface », « Charge lourde », « Accès difficile », score 91, alerte « sans réponse depuis 8 jours ». Ce n’est plus une priorité théorique. C’est une urgence de process.

Vous priorisez sans Excel parallèle. Le **dossier devis** est déjà là. Pour tester la qualité d’un brief hors outil, le [score brief devis](/outils/score-brief-devis) reste utile en amont.

## Ouvrir le dossier : raisons du score, alerte, actions

Le cœur du métier, c’est la fiche dossier. Identité, score, statut, source, funnel d’origine, onglets (Dossier, Projet, Client, Échanges, Automatisations), et surtout le bandeau d’action : ce qu’il faut faire **maintenant**.

![Dossier devis détail, score 91 et actions Écrire Appeler Relancer](/images/blog/relancer-devis-hot-depuis-dossier/04-devis-detail.png)
*Détail demande : score expliqué, alerte « à faire maintenant », actions Écrire / Appeler / Relancer. C’est le poste de travail de la relance Hot.*

Dans la démo, le bandeau ne laisse pas d’ambiguïté : Léa a demandé une **visite sur site**, pas seulement un PDF. « Sans réponse depuis 8 jours. Aucun flux automatique ne couvre ce cas. » Boutons : répondre par e-mail, appeler et noter, lancer une relance. Le score 91 est justifié par des raisons visibles (grande surface, charge lourde, accès difficile, projet pro, contraintes techniques). Source : Google Ads. Funnel : Configurateur principal.

Trois gestes métier, distincts :

| Action | Quand l’utiliser | Ce que vous notez |
|--------|------------------|-------------------|
| **Écrire** | Question claire, besoin d’un créneau, envoi d’un complément (plan, option) | Objet, contenu, prochaine étape |
| **Appeler** | Hot avec demande de visite, multi-décideurs, objection, délai critique | Compte-rendu court, qui a dit quoi |
| **Relancer** | Cadence écrite déjà définie, ou reprise après silence sans question ouverte urgente | Canal, template/séquence, date suivante |

Le jugement commercial commence ici. Si le bandeau dit « visite sur site » et « aucun flux auto », **Appeler** ou **Écrire** prime sur une relance générique. L’automation n’a pas « raté » : elle a correctement laissé le cas hors cadence, parce qu’un humain doit trancher.

La suggestion d’inviter un décideur (hôtel = rarement une seule personne) est un détail B2B utile. Beaucoup de Hot meurent parce que le bon interlocuteur n’a jamais vu le récap, pas parce que le devis était mauvais.


**Passer du guide à l’outil :** si ce dossier (score expliqué + alerte + actions) ressemble à ce que vous voulez sur chaque Hot, [créez un compte Free](https://www.quotebuilder.co/signup?plan=free) ou rejouez le [parcours démo rayonnage](https://www.quotebuilder.co/c/demo/rayonnage) avec un cas réel de votre catalogue.


## Automation vs jugement commercial

L’écran Automatisations liste les parcours (demande, abandon), le déclencheur, les funnels couverts, et les compteurs en cours / en attente / échecs.

![Automatisations : parcours demande et abandon, cadence](/images/blog/relancer-devis-hot-depuis-dossier/05-automations.png)
*Automatisations `/automations` : parcours actifs sur soumission et abandon. La cadence porte le calendrier ; le Hot complexe reste humain.*

Deux familles utiles dès le jour 1 :

1. **Parcours demande** (déclencheur soumission) : confirmation immédiate au prospect, notification owner, éventuellement première relance T+1 ou T+2 selon le score et le canal.
2. **Parcours abandon** (déclencheur abandon) : récupérer ceux qui ont commencé le funnel sans finir, avec un message lié au brief partiel.

Ce que l’automation **doit** porter :

- l’accusé de réception et le récap du brief ;
- la notification interne (owner + SLA) ;
- les rappels calendaires sur Warm / Cold / post-devis standard ;
- l’arrêt de séquence dès qu’une réponse humaine arrive.

Ce que l’automation **ne doit pas** remplacer :

- le premier contact sur un Hot avec question ouverte (visite, appel décideur, contrainte technique) ;
- la négociation prix / délai / options ;
- la décision de clôturer perdu / hors cible ;
- le choix du canal le jour J (mail vs téléphone) quand le signal change.

> Astuce. Automatisez le calendrier et la confirmation, pas le jugement. Les Hot avec une demande de visite restent en action manuelle. Les Warm et les abandons supportent mieux une cadence écrite. Pour bâtir une base de séquence, utilisez le [générateur de séquence de relances](/outils/generateur-sequence-relances).

Sans matière (brief, tags, fourchette), toute relance reste générique. Avec un dossier, vous rappelez le projet en deux lignes et vous posez une question utile. C’est la différence entre spam et suivi. Pour le contexte système, voir aussi [pourquoi les devis meurent sans relance](/blog/pourquoi-les-devis-meurent-sans-relance).

## Calendrier type d’une séquence post-devis (Hot)

Voici un calendrier réaliste pour un **Hot** une fois le devis envoyé (ou dès la soumission si le chiffrage est immédiat). Adaptez les délais à votre cycle (industrie lourde ≠ services digitaux).

| Jour | Canal | Objectif | Owner |
|------|-------|----------|-------|
| J0 | Auto + humain | Confirmation / envoi devis + « prochaine étape » claire | Automation + owner |
| J0–J1 | Téléphone ou mail | Si visite ou décideur demandé : appeler ; sinon mail court lié au brief | Owner |
| J2–J3 | Mail | Relance valeur : option, créneau, précision technique (pas « just checking ») | Owner ou auto si template validé |
| J5–J7 | Téléphone | Point d’étape : toujours en cours ? Qui décide ? Date cible ? | Owner |
| J10–J14 | Mail | Relance fermée douce : « on garde le dossier ouvert jusqu’au … » | Auto + validation owner |
| Sortie | décision | Réponse, RDV, perdu, ou nurture Cold | Owner décide |

Remplacez la ligne « Sortie » mentale par une règle écrite. Sans critère de sortie, la file Hot pourrit.

Pour générer une variante (nombre d’étapes, ton, canaux) à coller dans votre process : [générateur de séquence de relances](/outils/generateur-sequence-relances). Puis branchez ce qui est répétitif dans `/automations`, et gardez les étapes à jugement dans le dossier.

> Attention. Ne copiez pas une séquence Cold sur un Hot. Un Hot sans appel humain dans les premières heures, alors que le brief demande une visite, casse la confiance plus vite qu’un Warm en autopilote.

## Checklist SLA équipe (à coller dans le playbook)

Imprimez ou pavez ça dans Notion / le wiki commercial. Une page, pas un roman.

**Avant la journée**

- [ ] Accueil ouvert : combien de Hot sans réponse ?
- [ ] Chaque Hot a un **owner** nommé (pas « commercial »)
- [ ] Les nouveaux Hot du jour sont visibles (filtre liste Demandes)

**SLA de réponse**

- [ ] Hot : premier contact humain sous **1–2 h ouvrées** (mail ou appel)
- [ ] Warm : qualif ou réponse sous **24–48 h**
- [ ] Cold : confirmation auto + cadence, pas de monopolisation senior
- [ ] Si SLA cassé (ex. Hot > 48 h) : traitement prioritaire en stand-up, cause notée (vacances, brief incomplet, bug notif)

**Dans le dossier**

- [ ] Lire les **raisons du score** avant d’écrire
- [ ] Choisir Écrire / Appeler / Relancer selon le bandeau (visite ? décideur ? silence simple ?)
- [ ] Noter l’échange dans le dossier (pas seulement dans la boîte mail perso)
- [ ] Poser la **prochaine date** avant de quitter la fiche

**Automations**

- [ ] Confirmation soumission active sur les funnels concernés
- [ ] Notification owner active
- [ ] Parcours abandon actif si vous avez du trafic funnel
- [ ] Hot « question ouverte » exclus de la relance générique (jugement humain)

**Fin de semaine**

- [ ] Revue des Hot encore ouverts : close, nurture, ou re-priorisation
- [ ] % de Hot touchés dans le SLA (métrique d’équipe, pas vanity)

Cette checklist ne remplace pas le scoring. Elle **exécute** le scoring. Détails de grille : [score demande devis B2B](/blog/score-demande-devis-b2b).

## Ce que change le process « depuis le dossier »

| Avant | Après |
|-------|-------|
| Hot = label dans un CRM oublié | Hot = file filtrée + alerte âge |
| Relance depuis la boîte mail | Relance depuis le dossier (contexte + actions) |
| « On verra lundi » | SLA écrit + owner nommé |
| Automation = spam calendaire | Automation = confirmation + cadence ; Hot complexe = humain |
| Stats de volume envoyé | Stats de touches dans le SLA + dossiers clos proprement |

Vous ne remplacez pas le commercial. Vous lui évitez de reconstruire le brief à chaque relance, et vous réduisez les Hot oubliés faute de file claire. Les outils gratuits ([générateur de séquence](/outils/generateur-sequence-relances), [score brief](/outils/score-brief-devis), [coût d’un devis non relancé](/outils/cout-devis-non-relance)) aident à calibrer avant même de brancher le produit.

## FAQ

### Qu’est-ce qu’un devis Hot concrètement ?

Un devis (ou une demande) Hot, c’est un dossier dont le score dépasse un seuil écrit (souvent 80/100) : fit, urgence, brief complet, signal budget, engagement. Ce n’est pas « le commercial a un bon feeling ». Voir [score demande devis B2B](/blog/score-demande-devis-b2b).

### Faut-il toujours appeler un Hot ?

Pas toujours, mais souvent oui quand le brief demande une visite, un décideur, ou une contrainte site. Si le Hot est un complément catalogue simple avec fourchette claire, un mail précis le jour même peut suffire. Le dossier (bandeau + raisons) doit guider le canal, pas une règle aveugle.

### Que faire si le Hot n’a pas d’owner ?

Assigner immédiatement, même temporairement. Un Hot sans owner est un défaut de process, pas un détail CRM. Tant que « l’équipe » est owner, le SLA est fictif.

### Les automations peuvent-elles relancer les Hot toutes seules ?

Elles peuvent confirmer, notifier, et porter une partie de la cadence post-devis. Elles ne doivent pas masquer un Hot avec question ouverte non traitée. Dans la démo, le bandeau le dit : aucun flux auto ne couvre certains cas. C’est voulu.

### Combien de relances avant de classer perdu ?

Assez pour couvrir votre calendrier écrit (souvent 4 à 6 touches utiles sur un cycle court), puis une sortie claire : perdu, nurture Cold, ou report avec date. Sans critère de sortie, le pipeline ment. Méthode et sources : [pourquoi les devis meurent sans relance](/blog/pourquoi-les-devis-meurent-sans-relance).

### Comment construire la séquence sans partir de zéro ?

Utilisez le [générateur de séquence de relances](/outils/generateur-sequence-relances), validez le ton en équipe, branchez le répétitif dans les automations, gardez les étapes à jugement dans le dossier (Écrire / Appeler).

### Par où tester le process dans QuoteBuilder ?

Côté prospect : [démo funnel rayonnage](https://www.quotebuilder.co/c/demo/rayonnage). Côté vendeur : [essai Free](https://www.quotebuilder.co/signup?plan=free) pour voir accueil, liste Demandes, détail dossier, automations. Visite complète : [visite guidée parcours devis B2B](/blog/visite-guidee-parcours-devis-b2b).

## Conclusion

Relancer un devis Hot depuis le dossier, ce n’est pas « envoyer plus de mails ». C’est une chaîne courte et visible :

1. le funnel (ou la boutique) crée un **brief scorable** ;
2. l’accueil et la liste Demandes **filtrent Hot** et exposent l’âge / l’alerte ;
3. le dossier montre **pourquoi** c’est Hot et propose Écrire / Appeler / Relancer ;
4. l’**owner** exécute le **SLA** ;
5. les **automations** portent confirmation et cadence, sans remplacer le jugement sur les cas ouverts.

Si vous voulez voir cette chaîne sur des écrans réels : [démo funnel rayonnage](https://www.quotebuilder.co/c/demo/rayonnage) (entrée prospect) et [essai gratuit Free](https://www.quotebuilder.co/signup?plan=free) (pipeline, dossiers, automations). Puis posez la seule question d’équipe qui compte : qui est owner du prochain Hot, et dans combien d’heures il est touché ?

**Prochaine étape :** [Essayer gratuitement](https://www.quotebuilder.co/signup?plan=free) ou [générer une séquence de relances](/outils/generateur-sequence-relances).

Pour aller plus loin : [visite guidée](/blog/visite-guidee-parcours-devis-b2b), [score demande](/blog/score-demande-devis-b2b), [devis sans relance](/blog/pourquoi-les-devis-meurent-sans-relance), [outils](/outils).
