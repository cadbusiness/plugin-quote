---
title: "Demande de devis abandonnée en cours de funnel : capter l'email, relancer, faire reprendre"
slug: demande-devis-abandonnee-funnel-reprise
description: "Une demande de devis B2B commencée puis laissée en plan n'est pas perdue si l'email a été laissé. Pourquoi les prospects s'arrêtent, ce qu'on peut récupérer, comment QuoteBuilder sauvegarde la session, la relance après une heure d'inactivité, le lien de reprise, la page Sessions et les limites à connaître."
canonical: /blog/demande-devis-abandonnee-funnel-reprise
locale: fr-FR
word_count_target: 2500
keywords:
  - demande de devis abandonnée
  - abandon formulaire devis
  - relance abandon funnel
  - reprendre une demande de devis
  - session abandonnée devis B2B
  - récupérer formulaire abandonné
  - relance demande de devis non envoyée
author: QuoteBuilder
date: 2026-10-06
updated: 2026-10-06
---

# Demande de devis abandonnée en cours de funnel : capter l'email, relancer, faire reprendre

Mardi, 10 h 12. Un acheteur ouvre votre funnel de devis depuis une recherche Google. Il choisit le type de projet, indique un volume, coche deux contraintes. À l'étape suivante, on lui demande des dimensions qu'il n'a pas sous la main. Il ferme l'onglet pour aller les chercher. Il ne revient pas : un appel, une réunion, un autre fournisseur. De votre côté, rien n'est arrivé dans les demandes. Pour l'équipe commerciale, ce prospect n'existe pas.

C'est la demande abandonnée. Elle diffère du devis envoyé resté sans réponse, que l'on traite par des relances classiques (voir [pourquoi les devis meurent sans relance](https://www.quotebuilder.co/blog/pourquoi-les-devis-meurent-sans-relance)). Ici, le prospect n'a encore rien envoyé. Il a montré une intention réelle, parfois détaillée, puis il s'est arrêté avant le bouton final.

Voici pourquoi une demande s'arrête en route, ce qu'on peut en récupérer, et comment QuoteBuilder gère ce cas : sauvegarde de la session, relance après inactivité, lien de reprise, page Sessions. Avec les limites.

**Voir le parcours côté prospect :** [démo funnel rayonnage](https://www.quotebuilder.co/c/demo/rayonnage), sans compte. Pour l'activer sur votre site : [créer un compte Free](https://www.quotebuilder.co/signup?plan=free).

## Pourquoi une demande de devis s'arrête avant l'envoi

Il n'existe pas, à notre connaissance, de chiffre public fiable sur le taux d'abandon des funnels de devis B2B. Les taux d'abandon de panier souvent cités viennent du commerce en ligne grand public et ne se transposent pas : pas de paiement, un acheteur qui prépare un dossier, un cycle plus long. Vos propres statistiques feront mieux que n'importe quel benchmark.

Les causes, elles, sont connues de tous ceux qui reçoivent des demandes :

- **Une information manque.** Les dimensions, le plan, la quantité exacte, la date de livraison. L'acheteur part la chercher et décroche.
- **Il doit en parler en interne.** Il a commencé pour se faire une idée, il attend l'avis d'un responsable avant d'envoyer quoi que ce soit.
- **Il a été interrompu.** Un appel, une réunion, un changement d'écran sur mobile.
- **Le prix l'a refroidi.** Une fourchette affichée trop haute, ou pas de prix du tout et l'impression que la suite sera longue. Sur ce point, voir notre article sur la [fourchette de prix indicative](https://www.quotebuilder.co/blog/fourchette-prix-indicative-demande-devis-b2b).
- **Le formulaire est trop long** ou demande des choses inutiles à ce stade.

Les trois premières causes sont temporaires. Le prospect avait l'intention d'aller au bout. Ce sont celles qu'une relance bien faite peut récupérer, à une condition : savoir à qui écrire.

## Ce qu'on peut récupérer, et ce qu'on ne peut pas

Sans adresse email, une session abandonnée reste une statistique. Vous savez qu'un visiteur a commencé, jusqu'à quelle étape il est allé, d'où il venait. Vous ne pouvez pas le recontacter. Tout l'enjeu se joue donc sur un point précis : obtenir l'email avant la fin du parcours, sans en faire une barrière.

Deux erreurs opposées existent. La première consiste à demander l'email dès la première étape, en champ obligatoire : le prospect qui voulait seulement explorer s'en va. La seconde consiste à ne le demander qu'à la toute fin : tout abandon intermédiaire est anonyme. La voie médiane est une proposition facultative, en cours de parcours, avec une contrepartie claire pour le prospect : ne pas perdre ce qu'il a déjà saisi.

C'est d'ailleurs un principe d'accessibilité. Le critère 3.3.7 des WCAG 2.2 (« Redundant Entry ») demande de ne pas faire ressaisir, au sein d'un même processus, une information déjà fournie. Le W3C précise qu'il n'impose pas de conserver les données d'une session à l'autre. Une reprise après fermeture de l'onglet va au-delà, mais part du même constat : faire ressaisir pousse à abandonner.

## Dans QuoteBuilder : sauvegarder la configuration en cours de route

Dans un funnel QuoteBuilder, à partir de la deuxième étape et tant que la demande n'est pas envoyée, un bandeau propose au prospect de sauvegarder sa configuration. Il contient deux champs, « Prénom » et « Email pour recevoir le récap », et un bouton « Sauvegarder ». Rien n'est obligatoire : le prospect peut l'ignorer et continuer.

S'il le remplit, le bandeau confirme : « Merci {prénom}, votre configuration est sauvegardée ({email}). Vous pourrez la reprendre même si vous fermez l'onglet. » L'email est enregistré sur la session, avec les réponses déjà données. La session devient relançable.

Ce bandeau ne remplace pas l'étape « Vos coordonnées » de fin de parcours. Il sert seulement à ne pas perdre le contact d'un prospect qui s'arrêterait avant.

## La page Sessions : voir qui s'est arrêté, et où

Les sessions commencées et non envoyées apparaissent dans la page Sessions de l'application. Trois onglets les filtrent :

- **À relancer** : un email a été laissé et la session est inactive depuis le délai de votre parcours d'abandon, une heure par défaut ;
- **Emails** : toutes les sessions avec un email, actives ou non ;
- **Tous** : toutes les sessions non envoyées, y compris anonymes.

Le tableau affiche le prospect, le funnel, l'avancement (étape atteinte sur le nombre d'étapes), la visite, l'activité et un état. L'état prend quatre valeurs : « À relancer », « Relancé », « Récupérable » ou « Sans email ». La liste reprend les 150 sessions les plus récentes et met en tête celles qui ont un email, sont inactives et n'ont encore reçu aucune relance.

Un clic ouvre le détail de la visite : durée, pays, appareil, source, nombre de pages vues, dernière activité, page d'arrivée, référent, les étapes franchies dans l'ordre, les réponses déjà données et, le cas échéant, le nombre de messages échangés dans le chat. C'est souvent là que l'on comprend la cause : un prospect bloqué à l'étape des dimensions ne demande pas la même relance qu'un prospect arrivé jusqu'aux coordonnées.

En tête de page, une phrase résume la situation, par exemple « 12 visiteurs ont quitté le funnel sans devis. », complétée par « Aucun n'a encore été relancé. » si c'est le cas.

## Le parcours abandon : une relance automatique après inactivité

La relance ne repose pas sur la mémoire d'un commercial. QuoteBuilder propose un déclencheur d'automatisation dédié, « Session abandonnée » (libellé court « Abandon »), décrit à la création comme « Quand une session avec email reste inactive ». Il part quand trois conditions sont réunies :

1. la session porte un email ;
2. la demande n'a pas été envoyée ;
3. aucune activité depuis le seuil choisi, réglé dans le champ « Seuil d'inactivité (heures) », une heure par défaut.

Chaque automatisation ne part qu'une fois par session. Si le prospect envoie sa demande entre deux étapes de la séquence, celle-ci s'arrête : on ne relance pas quelqu'un qui vient d'envoyer. Les automatisations sont examinées toutes les quinze minutes, ce qui veut dire qu'une relance réglée à une heure part entre une heure et une heure et quart après la dernière activité.

Pour une organisation qui n'a encore aucune automatisation, QuoteBuilder crée un « Parcours abandon » actif par défaut, en deux temps :

- après « Inactif 1 h », un email « Reprise de session », objet « Votre configuration est sauvegardée », qui dit : « Bonjour {prénom}, vous avez commencé à configurer votre projet. Reprenez ici : » suivi du lien de reprise ;
- après « Inactif 24 h », une « Seconde relance reprise », objet « Votre projet attend », avec le même lien.

Les attentes se comptent depuis la dernière activité du prospect, pas depuis l'étape précédente de la séquence : l'option « Depuis la dernière activité » existe à côté de « Depuis cette étape ». Une automatisation que vous créez vous-même part en brouillon, à activer ensuite.

Une session n'est pas un devis. Sur une automatisation déclenchée par un abandon, les actions qui portent sur un dossier, comme l'assignation ou le changement de statut, sont ignorées. Les conditions sur les réponses du funnel restent utilisables, ce qui permet par exemple de réserver une relance à un type de projet. Joindre le récapitulatif PDF n'a pas d'intérêt ici, et l'éditeur le signale.

Pour aller plus loin sur la logique des séquences, voir notre [générateur de séquence de relances](https://www.quotebuilder.co/outils/generateur-sequence-relances) et la page [Autopilote](https://www.quotebuilder.co/fonctionnalites/autopilote).

## Le lien de reprise : revenir là où l'on s'était arrêté

Le lien envoyé dans la relance pointe vers une page de reprise propre à la session. En l'ouvrant, le prospect retrouve le funnel avec ses réponses déjà saisies, sur la version hébergée du funnel, même s'il avait commencé sur votre site. S'il avait finalement envoyé sa demande entre-temps, le même lien l'amène sur la page de suivi de sa demande au lieu de le faire recommencer.

C'est ce qui distingue une relance de reprise d'une relance commerciale : le message dit « votre projet est là, il vous reste deux étapes », et le prospect n'a rien à réexpliquer.

## Le cas WordPress : le statut Commencée

Si vos demandes arrivent par le plugin WordPress de QuoteBuilder plutôt que par le funnel hébergé, le mécanisme diffère. Dès qu'une adresse email valide est saisie, le plugin crée un dossier au statut « Commencée », le premier des sept statuts du pipeline. Une mention s'affiche : « Nous enregistrons votre adresse pour vous recontacter au sujet de cette demande. »

Le plugin envoie une seule relance, deux heures après la saisie, avec un lien qui rouvre le formulaire, tant que le dossier est encore au statut Commencée. Si le prospect envoie ensuite sa demande, c'est le même dossier qui est complété, pas un doublon. Un dossier Commencée jamais envoyé est supprimé au bout de trente jours. Voir [recevoir des demandes de devis sur WordPress](https://www.quotebuilder.co/blog/recevoir-demandes-devis-wordpress-quotebuilder).

## Mesurer : l'entonnoir et le montant récupérable

Le rapport PDF de la page Statistiques de QuoteBuilder contient un « Tunnel de conversion » en sept marches : Visiteurs, Commencé, Email, Complété, Devis, Rappelé, Signé. À l'écran, l'onglet Vue affiche Visiteurs, Devis, Rappel et Signé, et un encart compte les abandons. L'écart entre Commencé et Complété donne votre volume d'abandons ; l'écart entre Commencé et Email montre combien de ces abandons sont relançables.

Quand des sessions abandonnées portent un email et qu'aucune demande n'attend de rappel, la page Statistiques affiche en haut un lien « Relancer » suivi du nombre de sessions, qui ouvre la page Sessions. L'en-tête du rapport PDF le formule ainsi, par exemple « 8 personnes à rappeler, elles ont laissé leur email. », avec un montant « récupérable ». Ce montant multiplie le nombre d'abandons avec email par votre panier moyen. Lisez-le comme un plafond : il suppose que chaque prospect relancé reprendrait et signerait, ce qui n'arrive jamais.

Pour un ordre de grandeur réaliste, il faut deux hypothèses de plus : la part des relancés qui reprennent et envoient, et la part des demandes envoyées qui deviennent un devis gagné. Notre [estimateur des demandes de devis abandonnées](https://www.quotebuilder.co/outils/estimateur-demandes-devis-abandonnees-funnel) fait ce calcul à partir de vos chiffres, et montre aussi ce que rapporterait une meilleure capture d'email.

## Écrire une relance qui fait reprendre

Si vous écrivez votre propre séquence, ou si un commercial reprend contact depuis sa messagerie, quelques règles tiennent :

- **Parler du projet, pas de vous.** « Votre configuration de rayonnage pour 400 m² est sauvegardée » vaut mieux qu'une présentation de l'entreprise.
- **Mettre le lien de reprise en premier.** C'est la seule action attendue.
- **Lever l'obstacle probable.** Si le détail de la visite montre un arrêt à l'étape des dimensions, proposer d'envoyer un ordre de grandeur et de compléter ensuite.
- **S'arrêter après deux messages.** Au-delà, la relance devient de la prospection.
- **Ne pas relancer ce qui est envoyé.** Avant une relance manuelle, vérifiez la page Demandes.

## Le cadre : informer au moment de la collecte

Enregistrer un email saisi en cours de formulaire, c'est collecter une donnée personnelle. La CNIL propose des exemples de mentions d'information à placer sur un formulaire de collecte : qui traite les données, pour quoi, sur quelle base, combien de temps, et comment exercer ses droits. Le but de la collecte doit être clair au moment où l'email est saisi : ici, recevoir le récapitulatif et pouvoir reprendre la demande.

Pour les messages qui suivent, la CNIL distingue particuliers et professionnels. Envers un professionnel, la prospection par email peut reposer sur l'intérêt légitime si elle porte sur sa profession, à condition qu'il en soit informé et puisse s'y opposer simplement, à la collecte puis à chaque envoi. Pour un cas précis, demandez l'avis d'un professionnel du droit.

## Ce que l'abandon ne change pas

**Le score.** Le score Hot, Warm ou Cold est calculé avec une formule fixe au moment de l'envoi de la demande. Une session abandonnée n'en a pas. Voir [le score d'une demande de devis](https://www.quotebuilder.co/blog/score-demande-devis-b2b).

**Le pipeline.** Une session du funnel hébergé n'est pas un dossier : elle n'a pas de statut, ne s'assigne pas et ne reçoit pas de notes internes. Elle le devient quand le prospect envoie sa demande. Seul le plugin WordPress crée un dossier Commencée en amont.

**Le délai de réponse.** Une demande reprise et envoyée arrive comme les autres dans les demandes, et le prospect qui revient après une relance attend souvent une réponse rapide. Voir le [délai de réponse à une demande de devis](https://www.quotebuilder.co/blog/delai-reponse-demande-devis-b2b).

## Erreurs fréquentes

- **Exiger l'email dès l'écran d'accueil.** Vous obtenez des emails, mais moins de parcours commencés.
- **Relancer trop tôt.** Un prospect parti chercher un plan pendant vingt minutes n'a pas abandonné. Le seuil d'une heure par défaut laisse ce temps.
- **Envoyer plus de deux relances.** Le prospect qui n'a pas repris après la seconde a une autre raison.
- **Confondre abandon et devis sans réponse.** Le premier n'a rien envoyé, le second attend votre chiffrage ou votre relance.
- **Lire le montant « récupérable » comme une prévision.** C'est un plafond.
- **Ne jamais ouvrir le détail des visites.** L'étape où les prospects s'arrêtent dit souvent quelle question retirer ou reformuler.

## FAQ

### Qu'est-ce qu'une demande de devis abandonnée ?

Un parcours commencé dans votre funnel puis laissé en plan avant l'envoi. Le prospect a répondu à une partie des questions sans transmettre sa demande.

### Peut-on relancer un prospect qui n'a laissé aucun email ?

Non. La session reste visible dans la page Sessions, avec son avancement et ses réponses, mais sans moyen de contact.

### Quand QuoteBuilder propose-t-il de sauvegarder la configuration ?

À partir de la deuxième étape du funnel, tant que la demande n'est pas envoyée, avec un bandeau facultatif « Prénom » et « Email pour recevoir le récap ».

### Au bout de combien de temps part la relance ?

Après une heure d'inactivité dans le parcours abandon par défaut, puis une seconde après vingt-quatre heures. Le seuil se règle dans le déclencheur, en heures. Les automatisations sont examinées toutes les quinze minutes.

### Le prospect doit-il tout ressaisir ?

Non. Le lien de reprise rouvre le funnel avec ses réponses déjà données. S'il a envoyé sa demande entre-temps, il arrive sur la page de suivi.

### Que se passe-t-il si le prospect envoie sa demande avant la seconde relance ?

La séquence s'arrête. Une automatisation déclenchée par un abandon ne continue pas sur une session envoyée.

### Une session abandonnée apparaît-elle dans le pipeline ?

Pas pour le funnel hébergé : elle reste dans la page Sessions jusqu'à l'envoi. Avec le plugin WordPress, un email valide crée un dossier au statut Commencée.

### Combien de relances envoie le plugin WordPress ?

Une seule, deux heures après la saisie de l'email, tant que le dossier est au statut Commencée. Un dossier jamais envoyé est supprimé au bout de trente jours.

### Le montant « récupérable » du rapport Statistiques est-il fiable ?

C'est un plafond : abandons avec email multipliés par le panier moyen. Pour une estimation réaliste, appliquez vos taux de reprise et de signature.

### Faut-il un consentement pour relancer un professionnel ?

La CNIL admet l'intérêt légitime pour une prospection en rapport avec la profession, avec information à la collecte et opposition simple. Informez clairement au moment où l'email est saisi.

**Récupérez les demandes qui s'arrêtent en route :** [créer un compte Free](https://www.quotebuilder.co/signup?plan=free) · [voir la démo](https://www.quotebuilder.co/c/demo/rayonnage) · [estimer vos demandes abandonnées](https://www.quotebuilder.co/outils/estimateur-demandes-devis-abandonnees-funnel) · [formulaire de contact ou funnel de devis](https://www.quotebuilder.co/blog/formulaire-contact-vs-funnel-devis-b2b).

## Sources

- W3C, « Understanding Success Criterion 3.3.7: Redundant Entry », WCAG 2.2. https://www.w3.org/WAI/WCAG22/Understanding/redundant-entry.html
- CNIL, « La prospection commerciale par courrier électronique, SMS-MMS et automate d'appel », mise à jour du 10 juin 2026. https://www.cnil.fr/fr/la-prospection-commerciale-par-courrier-electronique
- CNIL, « Exemples de formulaire de collecte de données à caractère personnel », 26 juillet 2019. https://www.cnil.fr/fr/exemples-de-formulaire-de-collecte-de-donnees-caractere-personnel

## Pour aller plus loin

- [Pourquoi les devis meurent sans relance](https://www.quotebuilder.co/blog/pourquoi-les-devis-meurent-sans-relance)
- [Relancer un devis Hot depuis le dossier](https://www.quotebuilder.co/blog/relancer-devis-hot-depuis-dossier)
- [Formulaire de contact ou funnel de devis B2B](https://www.quotebuilder.co/blog/formulaire-contact-vs-funnel-devis-b2b)
- [Recevoir des demandes de devis sur WordPress](https://www.quotebuilder.co/blog/recevoir-demandes-devis-wordpress-quotebuilder)
- [Estimateur des demandes de devis abandonnées](https://www.quotebuilder.co/outils/estimateur-demandes-devis-abandonnees-funnel)
- [Funnel de devis emballage et conditionnement](https://www.quotebuilder.co/secteurs/funnel-devis-emballage-conditionnement)
- [Autopilote](https://www.quotebuilder.co/fonctionnalites/autopilote)
- [Stats](https://www.quotebuilder.co/fonctionnalites/stats)
