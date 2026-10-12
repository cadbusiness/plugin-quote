---
title: "Autopilote et workflows : relancer chaque demande de devis B2B sans y penser"
slug: autopilote-workflows-relance-demande-devis-b2b
description: "Confirmation, rappel interne, relances et reprise des abandons : comment fonctionne l'Autopilote de QuoteBuilder (canvas, trois déclencheurs, sept étapes, huit emails fournis, exécutions), les deux parcours livrés par défaut, leurs réglages utiles et ce que l'outil ne fait pas."
canonical: /blog/autopilote-workflows-relance-demande-devis-b2b
locale: fr-FR
word_count_target: 2500
keywords:
  - automatisation relance devis
  - workflow demande de devis B2B
  - relance automatique devis
  - email de confirmation demande de devis
  - nurturing devis B2B
  - relance abandon formulaire devis
  - autopilote QuoteBuilder
author: QuoteBuilder
date: 2026-10-12
updated: 2026-10-12
---

# Autopilote et workflows : relancer chaque demande de devis B2B sans y penser

Une demande de devis B2B se perd rarement à cause du prix. Elle se perd parce qu'une touche prévue n'est jamais partie : la confirmation que le prospect attendait, le rappel au commercial qui n'a pas vu passer le dossier, la relance du troisième jour que personne n'a eu le temps d'écrire. Chacune de ces touches prend quelques minutes. Ensemble, sur quarante demandes par mois, elles prennent deux journées de travail, et ce sont justement ces deux journées qui manquent.

Cet article explique comment l'Autopilote de QuoteBuilder envoie ces touches à votre place : le canvas, les trois déclencheurs, les sept types d'étapes, les huit emails fournis, les deux parcours livrés à la création du compte et la façon de lire leurs exécutions. Il dit aussi ce que l'outil ne fait pas, pour que vous sachiez ce qui reste à la main.

**Voir un funnel côté prospect :** [démo funnel rayonnage](https://www.quotebuilder.co/c/demo/rayonnage), sans compte. Pour brancher vos propres parcours : [créer un compte Free](https://www.quotebuilder.co/signup?plan=free).

## Pourquoi une demande de devis meurt sans suite automatique

Prenons une entreprise qui reçoit 40 demandes de devis par mois. Ce chiffre, comme tous ceux de cet article, est une hypothèse d'exemple : remplacez-le par le vôtre. Pour chaque demande, l'équipe prévoit quatre touches simples :

1. une confirmation au prospect, avec le récapitulatif de sa demande ;
2. un rappel interne si personne n'a ouvert le dossier dans la demi-journée ;
3. un premier message de suivi le lendemain ;
4. une relance quelques jours plus tard si le dossier est toujours ouvert.

À six minutes par touche, cela fait 40 × 4 × 6 = 960 minutes, soit 16 heures par mois. À 45 € de l'heure chargée, ce temps vaut 720 € par mois. Ce n'est pas énorme, et c'est bien le piège : comme chaque touche est petite, elle passe après tout le reste.

Le vrai coût apparaît quand une touche saute. Supposons que sur 35 % des demandes, au moins une touche prévue ne part pas : le commercial est en rendez-vous, la confirmation attend le soir, la relance du troisième jour est oubliée. Cela fait 14 demandes par mois qui n'ont pas eu la suite prévue. Si, dans votre historique, une demande suivie se signe à 22 % et une demande sans suite à 10 %, l'écart de 12 points sur 14 demandes représente 1,68 affaire perdue par mois. Avec un panier moyen de 4 500 €, cela fait 7 560 € de chiffre d'affaires manqué chaque mois.

Ces taux de 22 % et 10 % sont des hypothèses, pas des moyennes de marché. Le seul chiffre qui compte est l'écart mesuré sur vos propres dossiers. L'idée de fond tient pourtant sans statistique : une demande qui reçoit une réponse rapide et régulière a plus de chances d'aboutir qu'une demande laissée sans nouvelles pendant une semaine. Le pourquoi est détaillé dans [pourquoi les devis meurent sans relance](https://www.quotebuilder.co/blog/pourquoi-les-devis-meurent-sans-relance).

Ce que l'automatisation change, c'est la régularité. Les quatre touches partent à l'heure prévue, même le vendredi soir, même quand le commercial est sur un chantier. Le commercial garde son temps pour ce qui ne s'automatise pas : l'appel, la visite, la négociation.

## Ce qu'est l'Autopilote dans QuoteBuilder

Sur le site, le module s'appelle Autopilote. Dans l'application, il se trouve dans le menu **Automatisations**, réservé aux administrateurs. On y trouve la liste des **parcours** de votre organisation. Un parcours est un enchaînement d'étapes dessiné sur un canvas : un déclencheur en haut, puis des emails, des attentes, des conditions et des actions reliés par des flèches.

Chaque parcours a un état parmi trois :

- **Brouillon** : le parcours existe, mais rien ne part. Un parcours créé à la main démarre dans cet état.
- **Actif** : les emails partent. Dans l'éditeur, l'interrupteur affiche « Actif » et, juste en dessous, « Les emails partent ».
- **Archivé** : le parcours sort de la liste des Automatisations.

L'interrupteur de l'éditeur bascule entre Actif et Inactif, qui correspond au brouillon et affiche « Aucun envoi ». Rien n'est envoyé tant que vous n'avez pas activé un parcours que vous venez de créer.

Chaque parcours a deux onglets. **Parcours** montre le canvas, avec pour chaque étape le nombre de passages réussis, en attente et en échec. **Exécutions** liste les derniers passages : qui est entré dans le parcours (une demande ou une session), où il en est et quand il a bougé. Une exécution, c'est le passage d'une demande ou d'une session dans un parcours, du déclencheur jusqu'à la fin.

Le même suivi existe sur chaque dossier. Dans une demande, l'onglet **Automatisations** affiche « Parcours de cette demande » : chaque parcours lancé pour ce prospect, son état et la liste des étapes avec leur statut (Fait, En attente, Échec ou Ignoré). Vous savez donc, avant d'appeler, si le prospect a déjà reçu la relance du troisième jour.

Enfin, l'onglet Automatisations de chaque funnel indique si les parcours qui le couvrent tournent vraiment : « Tourne », « Ne part pas » ou « En pause », avec le nombre d'envois et d'entrées sur 30 jours.

Le moteur passe toutes les 15 minutes : c'est une tâche planifiée qui appelle `/api/cron/automations` sur le rythme `*/15 * * * *`. À chaque passage, il repère les nouveaux abandons, interrompt les exécutions des dossiers clos et réveille les attentes arrivées à échéance. Les attentes se déclenchent donc à un quart d'heure près, pas à la minute. Pour la présentation du module, voyez la page [Autopilote et workflows](https://www.quotebuilder.co/fonctionnalites/autopilote).

## Les trois déclencheurs

Un parcours démarre sur un seul déclencheur, choisi à sa création. Il y en a trois.

| Déclencheur | Ce qui le lance | Sujet suivi | À savoir |
|-------------|-----------------|-------------|----------|
| **Soumission** (`quote.submitted`) | Le prospect envoie sa demande depuis un funnel, ou une demande arrive par l'API avec l'option `run_autopilot` | La demande | Une seule exécution par demande et par parcours |
| **Abandon** (`session.abandoned`) | Une session avec email reste inactive le temps fixé (1 heure par défaut) | La session | Une seule exécution par session et par parcours ; s'arrête si le prospect finit sa demande |
| **Changement de statut** (`quote.status_changed`) | Le statut d'une demande change, éventuellement vers un statut précis | La demande | Un nouveau changement relance le parcours et interrompt l'exécution précédente |

Trois précisions comptent en pratique.

**L'abandon suppose un email.** Une session sans adresse ne peut pas être relancée : il n'y a personne à qui écrire. C'est pour cela que le funnel demande l'email tôt, comme expliqué dans [demande de devis abandonnée : capter l'email, relancer, faire reprendre](https://www.quotebuilder.co/blog/demande-devis-abandonnee-funnel-reprise). Sur un funnel en mode chat, une session expire au bout de 30 minutes : si votre délai d'abandon est plus long, l'onglet Automatisations du funnel l'indique et propose de passer à 20 minutes.

**Un parcours peut viser certains funnels.** À la création, vous choisissez tous les funnels ou une sélection. C'est utile si un métier demande un ton ou un rythme différent.

**Le changement de statut sert aux suites de dossier.** Par exemple un message de remerciement quand un dossier passe en Gagné, ou une relance quand il passe au statut En attente. Tout parcours que vous créez part d'un canvas presque vide : un déclencheur relié à une fin. Seuls les deux parcours installés au départ arrivent déjà remplis. Les statuts eux-mêmes sont expliqués dans [les statuts du pipeline de devis](https://www.quotebuilder.co/blog/statuts-pipeline-devis-b2b).

## Les sept étapes du canvas

Le canvas assemble sept types d'étapes.

| Étape | Rôle | Réglages |
|-------|------|----------|
| **Déclencheur** | Point de départ, une seule par parcours | Aucun |
| **Envoyer un email** | Envoie un des emails de votre organisation | Template, destinataire, option « Joindre le récapitulatif » |
| **Attendre** | Met l'exécution en pause | Délai en heures ; référence « Depuis cette étape » ou « Depuis la dernière activité » |
| **Condition** | Oriente vers une branche selon le dossier | Une ou plusieurs conditions, plus une branche « sinon » |
| **Assigner** | Attribue la demande à un membre | Un commercial précis, ou le premier administrateur |
| **Changer le statut** | Passe la demande à un statut | Le statut cible |
| **Fin** | Termine la branche | Aucun |

**Les destinataires** d'un email sont au nombre de trois : le prospect, le commercial assigné (s'il n'y en a pas, l'adresse commerciale de l'organisation prend le relais) et l'adresse commerciale elle-même.

**L'option « Joindre le récapitulatif »** ajoute un PDF de la demande : produits, fourchette de prix, réponses. Elle a du sens sur la confirmation. Sur une relance d'abandon, elle ne sert à rien : il n'y a pas encore de demande envoyée.

**La référence d'une attente** change tout pour les abandons. « Depuis cette étape » (`now`) compte à partir du moment où l'exécution arrive sur l'attente. « Depuis la dernière activité » (`last_activity`) compte à partir du dernier geste du prospect dans le funnel : s'il revient, le compteur repart.

**Les conditions** portent sur huit critères :

- le score (Hot, Warm ou Cold) ;
- un score minimum ;
- le statut de la demande ;
- une réponse donnée dans le funnel, par sa clé ;
- un produit suggéré ;
- le fait que la demande soit assignée ;
- le fait que la société soit renseignée ;
- le fait que le dossier soit clos.

Le score n'est pas un réglage : c'est une étiquette calculée à l'envoi de la demande, détaillée dans [le score d'une demande de devis B2B](https://www.quotebuilder.co/blog/score-demande-devis-b2b). Une condition sur le score permet par exemple d'assigner tout de suite les demandes Hot et de laisser les autres suivre le rythme normal.

## Les huit emails fournis

Chaque organisation reçoit une série d'emails prêts à l'emploi. Vous modifiez leur objet et leur texte dans Paramètres, rubrique Emails.

| Email | Pour qui | Contenu de départ |
|-------|----------|-------------------|
| **Confirmation prospect** | Prospect | Remerciement, récapitulatif en pièce jointe, lien de suivi, lien vers tous ses devis, code PIN |
| **Brief commercial** | Équipe | Contact, société, score, réponses, configuration et fourchette |
| **Rappel interne si non traité** | Équipe | La demande est encore au statut Nouveau |
| **Email rassurant** | Prospect | « Votre demande est bien prise en compte » |
| **Relance douce** | Prospect | « Avez-vous eu le temps de réfléchir ? » |
| **Demande de photo** | Prospect | « Une photo aiderait à affiner votre devis », avec le lien de suivi |
| **Reprise de session** | Prospect | « Votre configuration est sauvegardée », avec le lien de reprise |
| **Seconde relance reprise** | Prospect | « Votre projet attend », avec le même lien |

La liste contient aussi un neuvième email, de réactivation (« On reprend votre projet ? »), prévu pour les relances lancées par l'API.

Les textes utilisent des variables remplies à l'envoi : le nom du contact, sa société, son score, le nom du commercial, les réponses, la fourchette de prix, le lien de suivi, le lien de reprise et le code PIN. Le lien de suivi ouvre l'[espace prospect](https://www.quotebuilder.co/fonctionnalites/espace-prospect), où le prospect voit l'avancement de sa demande et peut ajouter une photo ou un plan. C'est ce qui rend la demande de photo utile : le prospect n'a pas à chercher où l'envoyer.

Les emails partent en texte simple. Gardez-les courts, avec une seule question par message. Le contenu de départ est volontairement sobre : relisez-le avec vos mots avant d'activer quoi que ce soit, en particulier les délais promis (« sous 24h ouvrées » dans la confirmation, « Retour sous 48h » dans l'email rassurant), qui doivent correspondre à ce que votre équipe tient vraiment.

## Le parcours demande, étape par étape

À la création de votre organisation, QuoteBuilder installe deux parcours actifs. Le premier, **Parcours demande**, se déclenche à la soumission. Voici ce qu'il fait.

| Moment | Condition | Envoi |
|--------|-----------|-------|
| T+0 | Aucune | Confirmation prospect avec le récapitulatif en PDF |
| T+0 | Aucune | Brief commercial à l'adresse commerciale |
| T+4 h | Statut encore Nouveau | Rappel interne au commercial assigné |
| T+24 h | Dossier ouvert | Email rassurant au prospect |
| T+24 h | Dossier ouvert | Demande de photo au prospect |
| T+72 h | Dossier ouvert | Relance douce au prospect |

Les deux premiers emails partent au moment même où la demande est envoyée. Les quatre attentes partent toutes du déclencheur, en parallèle, et se réveillent au passage du moteur. Chaque branche vérifie sa condition au réveil : si le dossier a changé de statut avant 4 heures, le rappel interne ne part pas ; si le dossier est clos, Gagné ou Perdu par exemple, les messages au prospect ne partent plus. Passer un dossier à un statut clos interrompt d'ailleurs tout de suite ses exécutions en attente.

Un réglage mérite votre attention dès le premier jour. Telles que livrées, les attentes de l'email rassurant et de la demande de photo durent toutes les deux 24 heures : le prospect reçoit donc deux messages le lendemain de sa demande. Si vous préférez les espacer, ouvrez le canvas, passez l'attente de la demande de photo à 48 heures, puis enregistrez. Vous obtenez un rythme plus lisible : confirmation le jour même, message rassurant le lendemain, photo le surlendemain, relance douce au troisième jour.

Deuxième point : les délais sont comptés en heures pleines, sans calendrier ouvré. Une demande arrivée le vendredi à 18 h déclenche le rappel interne à 22 h et la relance douce le lundi à 18 h. Si votre équipe ne travaille pas le week-end, adaptez le texte du rappel interne plutôt que de promettre une réponse immédiate.

Troisième point : si vous désactivez ce parcours et qu'aucun autre parcours de soumission n'est actif, une demande envoyée depuis un funnel déclenche quand même la confirmation au prospect et le brief à l'adresse commerciale. Vous perdez les rappels et les relances, pas l'accusé de réception.

## Le parcours abandon

Le second parcours installé, **Parcours abandon**, suit les sessions commencées mais jamais envoyées, à condition que le prospect ait donné son email.

| Moment | Référence | Envoi |
|--------|-----------|-------|
| 1 h après la dernière activité | Dernière activité | Reprise de session, avec le lien pour reprendre là où il s'était arrêté |
| 24 h après la dernière activité | Dernière activité | Seconde relance reprise |

La session est repérée au passage du moteur, une fois l'heure d'inactivité écoulée : la reprise de session part donc entre 1 heure et 1 heure 15 après le dernier geste du prospect. Les deux attentes comptent depuis la dernière activité. Si le prospect revient dans le funnel sans terminer, le compteur repart de son nouveau passage. S'il termine sa demande, l'exécution d'abandon s'arrête et c'est le parcours demande qui prend le relais. Le prospect ne reçoit donc pas de relance d'abandon après avoir envoyé sa demande.

Pour estimer ce que valent ces sessions dans votre cas, l'[estimateur des demandes de devis abandonnées](https://www.quotebuilder.co/outils/estimateur-demandes-devis-abandonnees-funnel) donne un ordre de grandeur. Les sessions elles-mêmes sont visibles dans la page Abandons.

## Personnaliser sans tout casser

Les parcours fournis sont un point de départ. Trois modifications couvrent la plupart des besoins.

**Assigner les demandes Hot tout de suite.** Ajoutez, juste après le déclencheur du parcours demande, une condition sur le score égale à hot, suivie d'une étape Assigner vers le commercial de votre choix. Si le dossier est encore au statut Nouveau 4 heures plus tard, le rappel interne part alors vers lui. La méthode de relance à la main depuis le dossier est décrite dans [relancer un devis Hot depuis son dossier](https://www.quotebuilder.co/blog/relancer-devis-hot-depuis-dossier).

**Séparer les demandes sans société.** Une condition « Société renseignée » permet de ne pas relancer automatiquement les demandes de particuliers, ou de les assigner à une autre personne.

**Ajouter une suite après Gagné.** Créez un parcours sur Changement de statut, filtré sur Gagné, avec une étape Assigner vers la personne qui prépare la commande : elle reçoit une notification et retrouve le dossier dans ses demandes. Un email ajouté dans un parcours reprend un des emails de votre organisation ; la rubrique Emails modifie ces textes, elle n'en crée pas de nouveaux.

Avant d'écrire une nouvelle séquence, posez son rythme sur papier : le [générateur de séquence de relances](https://www.quotebuilder.co/outils/generateur-sequence-relances) propose un calendrier de messages que vous recopiez ensuite dans le canvas. Gardez une règle simple : chaque relance doit apporter une information ou poser une question, jamais seulement « avez-vous vu mon devis ? ».

Après chaque modification, cliquez sur Enregistrer. Les nouvelles exécutions suivent la nouvelle version. Une exécution déjà en attente sur une étape « Depuis cette étape » garde l'heure de réveil calculée au départ ; une fois réveillée, elle suit le canvas tel qu'il est enregistré. Évitez donc de supprimer une étape sur laquelle des demandes sont en attente.

## Lire les exécutions sans se tromper

Un parcours actif ne prouve pas que les emails arrivent. Prenez dix minutes par semaine pour trois vérifications.

1. **Le canvas** affiche sous chaque étape ses compteurs sur les 80 dernières exécutions : « ok », « attente » et, en rouge, « erreur ». Un compteur « erreur » sous un email est le premier signal à surveiller.
2. **L'onglet Exécutions** d'un parcours montre la dernière étape atteinte par chaque personne et, tant que l'exécution n'a pas repris, l'erreur rencontrée. Une ligne « Destinataire introuvable » veut dire que ni commercial assigné ni adresse commerciale ne sont renseignés.
3. **L'onglet Automatisations d'un dossier** confirme ce que le prospect a reçu avant de l'appeler : chaque email y apparaît en « Fait » ou en « Échec ».

Les messages d'erreur les plus fréquents sont simples à corriger : « Pas d’email prospect » (la demande est arrivée sans adresse, par l'API par exemple), « Template email manquant » (aucun email choisi dans l'étape), « Destinataire introuvable » (ni commercial assigné ni adresse commerciale).

Pour relier ces envois à vos résultats, regardez ensuite les statuts : combien de dossiers passent de Nouveau à un statut traité, et en combien de temps. Le pipeline est décrit dans la page [Demandes et pipeline](https://www.quotebuilder.co/fonctionnalites/demandes).

## Ce que l'Autopilote ne fait pas

Mieux vaut le savoir avant de construire vos parcours.

- **Pas de test A/B** : un parcours envoie un seul texte par étape. Pour comparer deux versions, il faut deux parcours sur deux funnels différents, et un volume suffisant pour conclure.
- **Pas de SMS, pas de WhatsApp, pas de LinkedIn** : les envois sont des emails. Les appels restent à la main, notés dans le dossier.
- **Pas d'éditeur HTML libre** dans les parcours : les étapes utilisent les emails de votre organisation, en texte simple, dont vous modifiez l'objet et le corps.
- **Pas de calendrier ouvré** : les délais sont des heures pleines.
- **Pas de suppression automatique des données** : les parcours n'effacent ni les dossiers ni les sessions au bout d'une durée donnée. La conservation reste à gérer de votre côté, comme expliqué dans [RGPD et demande de devis B2B](https://www.quotebuilder.co/blog/rgpd-demande-devis-b2b-consentement-conservation).
- **Pas de campagne marketing** : un parcours suit une demande précise. Les envois groupés à un segment passent par le module Emails, qui écarte les contacts sans consentement marketing.

## Chiffrer votre propre cas

Reprenons l'exemple du début avec une dernière hypothèse : deux heures pour relire les deux parcours, ajuster les textes et l'attente de la photo. Amorties sur douze mois, elles coûtent 2 ÷ 12 heure par mois, soit 7,50 € à 45 € de l'heure.

| Poste | Calcul | Résultat mensuel |
|-------|--------|------------------|
| Temps des touches manuelles | 40 × 4 × 6 min | 16 h, soit 720 € |
| Demandes sans suite complète | 40 × 35 % | 14 demandes |
| Affaires perdues | 14 × (22 % moins 10 %) | 1,68 affaire |
| Chiffre d'affaires manqué | 1,68 × 4 500 € | 7 560 € |
| Mise en place amortie | 2 h ÷ 12 × 45 € | 7,50 € |
| **Coût mensuel évité** | 720 € + 7 560 € moins 7,50 € | **8 272,50 €** |

Sur ces hypothèses, les heures rendues à l'équipe sont d'environ 15,8 heures par mois. Le chiffre d'affaires manqué pèse dix fois plus que le temps : si votre écart de signature entre demandes suivies et non suivies est faible, le gain se réduit vite à quelques heures. C'est pourquoi l'outil vous demande vos propres taux.

L'[estimateur de charge des relances manuelles face à l'Autopilote](https://www.quotebuilder.co/outils/estimateur-charge-relances-manuelles-vs-autopilote) refait ce calcul avec vos chiffres, dans votre navigateur, et produit un récapitulatif à copier. Pour chiffrer plutôt les devis déjà envoyés et jamais relancés, voyez le calculateur du [coût d'un devis non relancé](https://www.quotebuilder.co/outils/cout-devis-non-relance).

**Tester sur votre activité :** [créer un compte Free](https://www.quotebuilder.co/signup?plan=free). Les deux parcours sont installés et actifs dès la création de l'organisation ; relisez leurs textes avant votre première demande.

## Une mise en route en trente minutes

1. Renseignez l'adresse commerciale de l'organisation, sinon le brief échoue, et le rappel interne aussi quand la demande n'est assignée à personne.
2. Ouvrez Paramètres, rubrique Emails, et réécrivez la confirmation, l'email rassurant et la relance douce avec vos délais réels.
3. Dans Automatisations, ouvrez le Parcours demande et passez l'attente de la demande de photo à 48 heures si vous voulez espacer les messages.
4. Ajoutez, si besoin, une condition sur le score Hot avec une assignation.
5. Vérifiez que le Parcours abandon est actif, et que vos funnels demandent l'email assez tôt.
6. Envoyez une demande de test depuis votre funnel, puis ouvrez le dossier : l'onglet Automatisations doit montrer la confirmation et le brief en « Fait », et les attentes en « En attente ».
7. Une semaine plus tard, relisez les compteurs « erreur » sous chaque email du canvas.

**Voir le parcours prospect avant de configurer :** [démo funnel rayonnage](https://www.quotebuilder.co/c/demo/rayonnage).

## FAQ

### Qu'est-ce que l'Autopilote de QuoteBuilder ?

C'est le module de parcours automatiques, accessible dans le menu Automatisations par les administrateurs. Un parcours enchaîne sur un canvas des emails, des attentes, des conditions, des assignations et des changements de statut, à partir d'un déclencheur.

### Quels déclencheurs peut-on utiliser ?

Trois : Soumission (une demande est envoyée), Abandon (une session avec email reste inactive le temps fixé, 1 heure par défaut) et Changement de statut (le statut d'une demande change, éventuellement vers un statut précis).

### Que contient le parcours installé par défaut ?

Le Parcours demande envoie la confirmation avec le PDF et le brief commercial tout de suite, un rappel interne à 4 heures si la demande est encore au statut Nouveau, un email rassurant et une demande de photo à 24 heures et une relance douce à 72 heures si le dossier est toujours ouvert. Le Parcours abandon envoie une reprise de session 1 heure après la dernière activité, puis une seconde relance à 24 heures.

### Le prospect reçoit-il des relances après avoir signé ?

Non, si le dossier passe à un statut clos comme Gagné ou Perdu. Les branches vérifient que le dossier est ouvert avant chaque message, et passer un dossier à un statut clos interrompt ses exécutions en attente.

### Peut-on modifier le texte des emails ?

Oui. L'objet et le corps de chaque email se modifient dans Paramètres, rubrique Emails. Les variables comme le nom du contact, le lien de suivi ou le code PIN sont remplies à l'envoi.

### Les délais tiennent-ils compte des week-ends ?

Non. Les attentes sont comptées en heures pleines, et le moteur passe toutes les 15 minutes. Une attente de 4 heures après une demande envoyée le vendredi à 18 h se termine le vendredi vers 22 h.

### Comment savoir si un email est bien parti ?

Ouvrez le dossier, onglet Automatisations : chaque étape affiche Fait, En attente, Échec ou Ignoré. Sur le canvas du parcours, chaque email affiche aussi ses compteurs « ok » et « erreur ».

### Que se passe-t-il si je désactive le Parcours demande ?

Si aucun parcours de soumission n'est actif, une demande envoyée depuis un funnel déclenche quand même la confirmation au prospect et le brief à l'adresse commerciale. Les rappels internes et les relances ne partent plus.

### L'Autopilote envoie-t-il des SMS ou fait-il des tests A/B ?

Non. Les envois sont des emails en texte simple, avec un seul texte par étape. Il n'y a ni SMS, ni WhatsApp, ni LinkedIn, ni test A/B.

### Les relances d'abandon respectent-elles le RGPD ?

Elles répondent à une action du prospect, qui a commencé une demande et donné son email, et restent liées à cette demande. Ne réutilisez pas ces adresses pour une campagne commerciale sans consentement marketing. La conservation des données reste à définir de votre côté.

## Pour aller plus loin

- [Autopilote et workflows](https://www.quotebuilder.co/fonctionnalites/autopilote)
- [Pourquoi les devis meurent sans relance](https://www.quotebuilder.co/blog/pourquoi-les-devis-meurent-sans-relance)
- [Demande de devis abandonnée : capter l'email, relancer, faire reprendre](https://www.quotebuilder.co/blog/demande-devis-abandonnee-funnel-reprise)
- [Relancer un devis Hot depuis son dossier](https://www.quotebuilder.co/blog/relancer-devis-hot-depuis-dossier)
- [Les statuts du pipeline de devis](https://www.quotebuilder.co/blog/statuts-pipeline-devis-b2b)
- [Le score d'une demande de devis B2B](https://www.quotebuilder.co/blog/score-demande-devis-b2b)
- [Estimateur de charge : relances manuelles ou Autopilote](https://www.quotebuilder.co/outils/estimateur-charge-relances-manuelles-vs-autopilote)
- [Générateur de séquence de relances](https://www.quotebuilder.co/outils/generateur-sequence-relances)
- [Espace prospect](https://www.quotebuilder.co/fonctionnalites/espace-prospect)
