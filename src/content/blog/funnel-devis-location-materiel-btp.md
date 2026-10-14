---
title: "Funnel de devis location de matériel BTP : famille d'engin, durée et chantier avant le premier appel"
slug: funnel-devis-location-materiel-btp
description: "Landing SEO loueurs de matériel BTP : template Location matériel de QuoteBuilder (levage, terrassement, énergie), questions à ajouter, parc importé en CSV, règles Si/Alors par durée, score Cold, photo d'accès. Ce que l'outil ne fait pas : planning, caution, contrat."
canonical: /secteurs/funnel-devis-location-materiel-btp
locale: fr-FR
word_count_target: 2800
keywords:
  - devis location matériel BTP
  - demande de devis location nacelle
  - funnel devis location engin
  - formulaire location mini-pelle
  - devis location groupe électrogène
author: QuoteBuilder
date: 2026-10-14
updated: 2026-10-14
sector: location-materiel-btp
---

# Funnel de devis location de matériel BTP : famille d'engin, durée et chantier avant le premier appel

« Bonjour, il me faudrait une nacelle la semaine prochaine, c'est combien ? » Pas de hauteur de travail, pas d'adresse de chantier, pas de date précise, pas un mot sur l'accès ni sur le conducteur. L'agence rappelle, tombe sur la messagerie, rappelle en fin de journée. Le client a déjà loué ailleurs, chez le premier qui a répondu.

En location de matériel, le devis se joue sur deux choses : la vitesse de réponse et la justesse de la machine proposée. Une nacelle trop courte, une mini-pelle qui ne passe pas le portail, un groupe électrogène sous-dimensionné, et la location tourne au litige. Le problème n'est pas votre grille de tarifs. C'est la demande qui arrive sans les informations qui permettent de choisir la bonne machine.

Cette page décrit ce que pose le template « Location matériel » de QuoteBuilder, tel qu'il existe dans le code, comment l'adapter à un parc BTP, et ce qu'il ne fera pas à votre place.

**Essayer le template Location matériel :** [créer un compte Free](https://www.quotebuilder.co/signup?plan=free), puis créer un funnel et choisir « Location matériel » dans la famille Location & événementiel. L'identifiant du template est `rental`. Le funnel créé s'appelle par défaut « Funnel location », en type formulaire. Pour voir d'abord un parcours public complet, sur un autre métier : [démo funnel rayonnage](https://www.quotebuilder.co/c/demo/rayonnage).

## Ce qu'une demande de location doit contenir

Avant l'outil, la liste des informations sans lesquelles vous proposez une machine au hasard :

- **La famille de matériel**, puis la capacité. Une nacelle se choisit sur la hauteur de travail et le déport, une mini-pelle sur le tonnage et la profondeur de fouille, un groupe électrogène sur la puissance.
- **La durée et les dates.** Une journée, une semaine, un mois. Le tarif change, et le planning du parc aussi.
- **Le lieu du chantier.** La commune suffit pour la livraison. L'adresse complète viendra au moment de la commande.
- **L'accès.** Largeur de passage, nature du sol, pente, hauteur sous plafond pour une nacelle en intérieur.
- **Livraison ou enlèvement en agence.** Le transport pèse parfois autant que la location d'une journée.
- **Avec ou sans conducteur.** Sans conducteur, le client doit avoir quelqu'un d'autorisé à conduire.
- **La quantité.** Deux nacelles identiques ou une seule.
- **Le client.** Entreprise, artisan, collectivité ou particulier : les conditions de paiement et de caution ne sont pas les mêmes.
- **Un contact sur place**, quand ce n'est pas la personne qui demande.

L'INRS rappelle d'ailleurs, dans sa page sur [la location de machines](https://www.inrs.fr/risques/utilisation-machines/acquisition-revente-location.html), que le contrat de location devrait préciser au minimum la désignation du matériel, son identification, le lieu d'emploi et la durée prévisionnelle de location. Ce sont les informations qu'une demande de devis bien faite apporte dès le départ.

## Le template « Location matériel » dans QuoteBuilder

Le template est rangé dans la famille **Location & événementiel**, avec les templates Traiteur, Chapiteaux & agence et Catalogue événementiel. Son texte de présentation : « Durée, capacité, options, une demande complète, pas un appel à vide. » Il crée un funnel de type formulaire, en quatre étapes, dans un ordre fixe :

| Étape | Titre | Contenu |
|-------|-------|---------|
| 1 | Votre location | « Matériel, durée et conditions de chantier » : trois questions |
| 2 | Solutions recommandées | « Matériel disponible dans votre parc » : les produits choisis par vos règles |
| 3 | Personnalisation | Quantité, options et zone « Plan (PDF ou image) » |
| 4 | Vos coordonnées | Nom, email, téléphone, société, case de consentement marketing facultative |

Les trois questions de l'étape 1 :

- **Famille de matériel**, en choix visuel, obligatoire : Levage / Nacelle, Terrassement, Énergie / Groupe, Autre.
- **Durée**, en liste, obligatoire : 1 jour, 1 semaine, 1 mois et +.
- **Date souhaitée**, en texte, facultative, avec l'aide « Approximative si besoin » et l'exemple « Ex. semaine du 14 ».

C'est une bonne base pour un loueur généraliste : les trois familles couvrent une grande partie des demandes d'un parc BTP. Le template ne crée en revanche aucun produit et aucune règle. Sans catalogue, l'étape 2 n'a rien à montrer.

Un point de vocabulaire : le sous-titre de l'étape 2 dit « Matériel disponible dans votre parc ». QuoteBuilder ne connaît pas votre planning. Il montre les produits choisis par vos règles, pas des machines libres aux dates demandées. Si cette phrase vous gêne, modifiez le sous-titre dans l'éditeur.

## Adapter le template à un parc BTP

L'éditeur de funnel permet d'ajouter des questions à l'étape 1, de modifier les libellés et d'ajouter des choix aux listes (« + Ajouter une option »). Les types de question proposés : Choix visuel, Mesure, Liste, Choix multiple et Texte. Voici ce que nous ajouterions pour un loueur BTP, dans cet ordre :

1. **Hauteur de travail ou capacité**, en Mesure, avec une unité. Une seule question « Capacité souhaitée » sert à toutes les familles si l'aide précise « mètres pour une nacelle, tonnes pour une pelle, kVA pour un groupe ».
2. **Commune du chantier**, en Texte.
3. **Livraison**, en Liste : « Livraison et reprise sur chantier », « Enlèvement et retour en agence ».
4. **Conducteur**, en Choix visuel : « Avec conducteur », « Sans conducteur ».
5. **Accès**, en Choix multiple : « Passage étroit », « Terrain meuble ou en pente », « Intérieur », « Aucune contrainte particulière ».

Ajoutez aussi des choix à la liste Durée si votre grille les prévoit, par exemple « Week-end » ou « Demi-journée ».

Évitez le type **Fichier** dans l'étape de questions. Dans le funnel public, il s'affiche aujourd'hui comme un simple champ texte, sans bouton d'envoi de fichier. Pour une photo de l'accès, comptez sur la zone « Plan (PDF ou image) » de l'étape Personnalisation : elle accepte le PDF, le JPEG, le PNG et le WebP, jusqu'à 10 Mo. Après l'envoi, le client peut encore ajouter un fichier depuis son espace prospect, rubrique « Compléter la demande ».

Deux limites à garder en tête :

- **Pas de branchement.** Les étapes et les questions passent dans un ordre fixe pour tout le monde. Le client qui loue un groupe électrogène verra aussi la question sur la hauteur, et celui qui loue une nacelle la question sur la puissance. D'où l'intérêt d'une question « Capacité » rédigée pour toutes les familles. Si vos métiers sont trop différents, faites deux funnels, en vérifiant le nombre de funnels de votre plan sur la page [Tarifs](https://www.quotebuilder.co/tarifs).
- **Pas de champ texte libre à l'étape Personnalisation.** Les précisions passent par vos questions de l'étape 1, ou par le fichier.

## Le catalogue : votre parc, importé en CSV

Le catalogue, c'est votre parc tel que vous le louez : une fiche par modèle, avec un nom, une référence, une catégorie, un prix et une description. Pour un parc de 80 ou 300 machines, inutile de tout saisir. L'import CSV du catalogue lit sept colonnes (nom, SKU, catégorie, prix min, prix max, tags, description) et rattache les produits au funnel choisi. Le mode d'emploi complet, avec les pièges d'un fichier Excel français, est dans [importer son catalogue en CSV](https://www.quotebuilder.co/blog/import-catalogue-csv-funnel-devis-b2b), et le [vérificateur CSV catalogue](https://www.quotebuilder.co/outils/verificateur-csv-catalogue-devis) contrôle votre fichier avant l'import.

Pour un loueur, trois conseils :

- **La catégorie reprend les familles du funnel** : Levage, Terrassement, Énergie. Ça facilite l'écriture des règles et la lecture du catalogue.
- **Un SKU stable par modèle**, celui de votre logiciel de gestion de parc. C'est lui qui permet de mettre à jour les tarifs en réimportant le fichier, sans créer de doublons.
- **Le prix suit la durée, pas l'inverse.** Dans QuoteBuilder, le montant d'une ligne vaut le prix unitaire multiplié par la quantité. La durée choisie par le client ne multiplie rien. Si votre tarif change entre la journée et la semaine, créez une fiche par tarif (« Nacelle ciseaux 8 m, journée », « Nacelle ciseaux 8 m, semaine »), avec deux SKU distincts, et laissez les règles choisir la bonne.

Les options d'une fiche (« Livraison », « Assurance casse ») ne changent pas le prix de la ligne. Une prestation qui doit apparaître avec un montant est un produit à part.

## Règles Si/Alors : la bonne machine pour la bonne durée

À l'étape « Solutions recommandées », chaque règle active dont toutes les conditions sont vraies devient une carte de solution, avec ses produits. Au plus trois solutions s'affichent, dans l'ordre de priorité des règles. Dans l'éditeur de règle, vous choisissez une question, un opérateur (est, n'est pas, est au moins, est au plus, inclut, est parmi) et une réponse.

Exemple pour le levage :

| Si | Et | Alors suggérer |
|----|----|----------------|
| Famille de matériel est Levage / Nacelle | Durée est 1 jour | Nacelle ciseaux 8 m, journée ; Nacelle articulée 12 m, journée |
| Famille de matériel est Levage / Nacelle | Durée est 1 semaine | Nacelle ciseaux 8 m, semaine ; Nacelle articulée 12 m, semaine |
| Famille de matériel est Levage / Nacelle | Capacité est au moins 14 | Nacelle articulée 16 m, sur devis |

Quatre familles et trois durées font douze règles, plus quelques règles de capacité. C'est un après-midi de travail, une fois le parc importé.

Une règle peut aussi porter sa propre fourchette, utile pour annoncer un ordre de grandeur « location et transport » sans détailler chaque ligne. Le fonctionnement complet est décrit dans [les règles de suggestion produits](https://www.quotebuilder.co/blog/regles-suggestion-produits-funnel-devis-b2b).

Quand aucune règle ne correspond, le funnel ne bloque pas. Il affiche : « Aucune solution ne correspond à vos réponses. Vous pouvez continuer. L'équipe vous proposera une solution avec le devis. » Le choix « Autre » de la famille de matériel tombe souvent dans ce cas, et c'est normal : la demande arrive quand même, avec la durée et la date.

Les règles Si/Alors ne sont pas incluses dans le plan Free, d'après la grille de la page Tarifs.

## Ce que la fourchette affichée dit, et ne dit pas

Le client voit une fourchette calculée à partir des lignes, ou celle de la règle si vous l'avez renseignée. Elle reste indicative. Elle ne comprend pas :

- le transport, sauf si vous l'avez mis dans la fourchette de la règle ou en produit ;
- la caution, l'assurance ou la franchise ;
- le carburant, le nettoyage ou la casse ;
- une remise de durée que vous n'avez pas traduite en fiche.

Elle ne dit pas non plus si la machine est libre. QuoteBuilder n'a ni planning de parc, ni réservation, ni blocage de dates. La disponibilité se vérifie dans votre logiciel de location, au moment de répondre. Pour savoir comment présenter un prix indicatif sans le transformer en promesse, voir [la fourchette de prix indicative](https://www.quotebuilder.co/blog/fourchette-prix-indicative-demande-devis-b2b).

## Pourquoi ces dossiers sortent Cold

Chaque demande reçoit une étiquette Hot, Warm ou Cold, calculée à l'envoi par une formule fixe. Cette formule part de 30 points et lit seulement des réponses précises : surface, charge, fréquence d'accès, type de projet, contraintes et longueur d'un champ de besoin, chacune sous une clé technique précise. Elle ne lit ni la famille de matériel, ni la durée, ni la date souhaitée du template Location matériel. Les questions que vous ajoutez dans l'éditeur reçoivent une clé technique automatique, que la formule ne lit pas non plus.

Résultat : tel quel, chaque demande de location vaut 30 points, donc Cold. Ce n'est pas un réglage, et ce n'est pas un jugement sur la demande. Le score n'est simplement pas fait pour ce métier. Le détail de la formule est dans [le score d'une demande de devis B2B](https://www.quotebuilder.co/blog/score-demande-devis-b2b).

En location, la priorité vient de la date. Une demande « demain matin » passe avant une demande « dans trois semaines », quel que soit le score. Triez donc à la main, en lisant la date souhaitée dans le dossier, et assignez tout de suite la demande à l'agence ou au commercial concerné.

## Après l'envoi : dossier, assignation, relances

La demande arrive dans la liste des Demandes, avec les réponses, les produits choisis, la quantité, le fichier éventuel et les coordonnées. À partir de là, rien de spécifique à la location :

- **Assignation.** Le dossier s'assigne à un membre de l'équipe, qui reçoit une notification. Le partage des demandes entre agences est décrit dans [l'assignation des demandes de devis](https://www.quotebuilder.co/blog/assignation-sla-demande-devis-equipe).
- **Notes internes.** Disponibilité vérifiée, machine réservée dans le logiciel de parc, transporteur à prévenir : une note en texte brut, visible par l'équipe, non modifiable une fois écrite.
- **Relances.** L'Autopilote envoie la confirmation au client et peut relancer une demande restée sans réponse. Voir [l'Autopilote](https://www.quotebuilder.co/fonctionnalites/autopilote).
- **Relecteurs côté client.** Sur un chantier, la personne qui demande n'est pas toujours celle qui valide. Depuis le dossier, vous pouvez inviter un relecteur côté client, par exemple l'acheteur de l'entreprise ou le conducteur de travaux comme Responsable technique. Chacun reçoit un lien valable 30 jours vers l'[espace prospect](https://www.quotebuilder.co/fonctionnalites/espace-prospect).

Le contrat de location, les conditions générales, la caution, l'état des lieux au départ et au retour se gèrent hors de QuoteBuilder. Le récapitulatif de la demande n'est pas un contrat.

## Parcours type : de la demande au retour de la machine

1. Lundi 7 h 40, un chef de chantier remplit le funnel depuis son téléphone : Levage / Nacelle, 1 semaine, « semaine du 21 », capacité 10 m, commune de Pessac, livraison et reprise, sans conducteur, accès intérieur. Il joint une photo de la porte d'entrée.
2. La règle « Levage, 1 semaine » lui propose deux nacelles à la semaine. Il choisit l'articulée 12 m, quantité 1, et laisse ses coordonnées.
3. Le dossier arrive Cold, comme tous les autres. L'agence le lit à 8 h, voit la date et la photo, et l'assigne au commercial de Bordeaux.
4. Le commercial vérifie la disponibilité dans le logiciel de parc, note « 12 m réservée du 21 au 25, transport mardi 7 h » dans le dossier, et appelle le client avec une proposition ferme.
5. Le contrat et la caution partent depuis le logiciel de location. Le dossier QuoteBuilder passe au statut Gagné.

Le gain n'est pas dans le logiciel lui-même. Il est dans l'appel de l'étape 4 : le commercial appelle avec une machine et un prix, pas pour poser des questions.

## Ce que QuoteBuilder ne fait pas pour un loueur

- Pas de planning de parc, de disponibilité ni de réservation de dates.
- Pas de tarif qui se multiplie par la durée : la ligne vaut prix unitaire × quantité.
- Pas de calcul de transport selon la distance.
- Pas de caution, d'acompte ni de paiement en ligne.
- Pas d'état des lieux, de bon de livraison ni de contrat de location.
- Pas de vérification de l'autorisation de conduite du client.
- Pas de questions conditionnelles selon la famille de matériel.
- Pas de score adapté à la location : tout sort Cold.

Sur l'autorisation de conduite : l'article [R4323-56 du Code du travail](https://code.travail.gouv.fr/code-du-travail/r4323-56) subordonne la conduite de certains équipements à une autorisation délivrée par l'employeur, et l'INRS détaille [les familles d'engins concernées par les recommandations Caces](https://www.inrs.fr/publications/juridique/focus-juridiques/focus-dispositions-caces.html), dont les engins de chantier et les plates-formes élévatrices mobiles de personnel. Une question « Avec ou sans conducteur » dans le funnel vous permet d'en parler dès la réponse, pas de vérifier à la place du client.

## Erreurs fréquentes

- **Garder « Autre » sans question de capacité.** La demande arrive avec « Autre, 1 semaine » et rien d'autre. Ajoutez la question Capacité et la commune.
- **Un seul prix par machine pour toutes les durées.** Le client voit le tarif journée pour une location d'un mois. Faites une fiche par tarif.
- **Importer le parc sans SKU.** Le prochain import de tarifs double le catalogue.
- **Promettre la disponibilité.** Le sous-titre « Matériel disponible dans votre parc » n'est pas une vérification. Répondez avec une disponibilité confirmée.
- **Trier par score.** Tout est Cold. Triez par date souhaitée.
- **Ajouter une question Fichier.** Elle s'affiche comme un champ texte. Utilisez la zone « Plan (PDF ou image) ».

## Location BTP ou location événementielle

Le même template de famille couvre aussi l'événementiel, mais les questions n'ont rien à voir : jauge, date de l'événement, montage. Si vous louez du matériel de réception, de la sonorisation ou des structures, voir plutôt [le funnel de devis location événementielle](https://www.quotebuilder.co/secteurs/funnel-devis-location-evenementiel). Un loueur qui fait les deux gagne à faire deux funnels, un par clientèle.

## FAQ

### Existe-t-il un template location de matériel dans QuoteBuilder ?

Oui. Le template « Location matériel », identifiant rental, dans la famille Location & événementiel. Il crée un formulaire nommé « Funnel location », en quatre étapes : Votre location, Solutions recommandées, Personnalisation, Vos coordonnées.

### Quelles familles de matériel le template propose-t-il ?

Levage / Nacelle, Terrassement, Énergie / Groupe et Autre, en choix visuel. Vous pouvez modifier les libellés et ajouter des choix dans l'éditeur.

### Le prix se calcule-t-il selon la durée ?

Non. Le montant d'une ligne vaut le prix unitaire multiplié par la quantité. La durée est une réponse. Pour un tarif par durée, créez une fiche par tarif et laissez les règles Si/Alors choisir selon la durée.

### QuoteBuilder vérifie-t-il la disponibilité des machines ?

Non. Il n'y a ni planning, ni réservation, ni blocage de dates. Les produits suggérés sont ceux de vos règles. La disponibilité se vérifie dans votre logiciel de parc avant de répondre.

### Peut-on poser des questions différentes pour une nacelle et pour une mini-pelle ?

Non. Les questions passent dans un ordre fixe pour tout le monde. Les règles choisissent seulement les produits suggérés. Rédigez des questions valables pour toutes les familles, ou faites deux funnels.

### Pourquoi toutes les demandes sont-elles Cold ?

La formule du score part de 30 et ne lit ni la famille de matériel, ni la durée, ni la date. Les questions ajoutées dans l'éditeur ne sont pas lues non plus. Chaque demande vaut 30 points, donc Cold. Triez par date souhaitée.

### Le client peut-il envoyer une photo de l'accès au chantier ?

Oui, à l'étape Personnalisation, zone « Plan (PDF ou image) », en PDF, JPEG, PNG ou WebP, jusqu'à 10 Mo. Après l'envoi, il peut ajouter un fichier depuis « Compléter la demande » dans son espace prospect.

### Comment importer tout le parc d'un coup ?

Avec l'import CSV du catalogue : nom, SKU, catégorie, prix min, prix max, tags et description. Le fichier doit utiliser la virgule comme séparateur. Le vérificateur CSV catalogue contrôle le fichier avant l'import.

### QuoteBuilder gère-t-il la caution et le contrat de location ?

Non. QuoteBuilder n'encaisse rien et ne produit pas de contrat. Caution, conditions générales et état des lieux se gèrent dans votre logiciel de location ou sur papier.

### Faut-il un plan payant pour ce funnel ?

Le template se choisit à la création du funnel, plan Free compris, avec un funnel et un plafond de soumissions. D'après la page Tarifs, le catalogue de produits et les règles Si/Alors demandent un plan payant. Le détail est sur la page Tarifs.

## Sources

- INRS, [Acquisition, revente, location, prêt, mise à disposition de machines](https://www.inrs.fr/risques/utilisation-machines/acquisition-revente-location.html) : contenu minimal d'un contrat de location.
- Code du travail, [article R4323-56](https://code.travail.gouv.fr/code-du-travail/r4323-56) : autorisation de conduite délivrée par l'employeur.
- INRS, [Quelles sont les principales dispositions du Caces ?](https://www.inrs.fr/publications/juridique/focus-juridiques/focus-dispositions-caces.html) : familles d'équipements concernées.

## Pour aller plus loin

- [Importer son catalogue en CSV](https://www.quotebuilder.co/blog/import-catalogue-csv-funnel-devis-b2b)
- [Vérificateur de fichier CSV catalogue](https://www.quotebuilder.co/outils/verificateur-csv-catalogue-devis)
- [Le funnel dans QuoteBuilder](https://www.quotebuilder.co/fonctionnalites/funnel)
- [Le catalogue dans QuoteBuilder](https://www.quotebuilder.co/fonctionnalites/catalogue)
- [Délai de réponse à une demande de devis](https://www.quotebuilder.co/blog/delai-reponse-demande-devis-b2b)
- [Démo funnel rayonnage](https://www.quotebuilder.co/c/demo/rayonnage)
- [Créer un compte Free](https://www.quotebuilder.co/signup?plan=free)
