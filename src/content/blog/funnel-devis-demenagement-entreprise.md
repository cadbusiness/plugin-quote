---
title: "Funnel de devis déménagement d'entreprise : sites, volume, étages, objets sensibles, date, une demande chiffrable avant la visite technique"
slug: funnel-devis-demenagement-entreprise
description: "Landing SEO pour les déménageurs qui travaillent pour les entreprises (transfert de bureaux, d'ateliers, d'archives, de matériel informatique) : les questions à poser avant la visite technique, le code NAF 49.42Z, l'inscription au registre des transporteurs, l'absence de template déménagement dans QuoteBuilder, et comment monter le funnel à partir du template Aménagement industriel (fitout). Sans template inventé ni fonction inventée."
canonical: /secteurs/funnel-devis-demenagement-entreprise
locale: fr-FR
word_count_target: 5500
keywords:
  - devis déménagement entreprise
  - funnel devis transfert de bureaux
  - déménagement bureaux atelier archives
  - demande de devis déménageur professionnel
  - NAF 49.42Z services de déménagement
  - QuoteBuilder aménagement industriel
author: QuoteBuilder
date: 2026-11-10
updated: 2026-11-10
---

# Funnel de devis déménagement d'entreprise : sites, volume, étages, objets sensibles, date, une demande chiffrable avant la visite technique

Un office manager écrit un mardi : « Nous déménageons nos bureaux en mars, pouvez-vous nous faire un devis ? » Pas d'adresse d'arrivée, pas de nombre de postes, pas d'étage, pas un mot sur la salle serveur ni sur les quarante mètres linéaires d'archives au sous-sol. Le chargé d'affaires rappelle, laisse un message, rappelle, obtient un rendez-vous de visite technique dix jours plus tard. Pendant ce temps, deux concurrents ont déjà envoyé une estimation.

Le déménagement d'entreprise se vend sur la visite technique, c'est normal : on ne chiffre pas un transfert de cent postes sans avoir vu les lieux. Mais la visite se prépare. Un funnel de demande de devis bien construit pose les questions qui permettent d'arriver à la visite avec une première estimation, le bon métreur et le bon créneau.

QuoteBuilder n'a pas de template déménagement. Le plus proche est « Aménagement industriel » (`fitout`), dans la famille « Industrie & fabrication », funnel par défaut « Funnel aménagement », type formulaire. Sa présentation dit : « Site, contraintes, gammes, vous rappelez pour proposer, pas pour découvrir. » C'est exactement ce qu'on veut pour un transfert d'entreprise : décrire le site, ses contraintes, puis proposer des prestations du catalogue.

Cet article explique comment adapter ce template à un déménageur qui travaille pour les entreprises, quelles questions ajouter dans un ordre fixe, ce que le score fait vraiment, et ce que le produit ne fait pas. Aucune statistique inventée. Les volumes, montants et délais cités sont des hypothèses d'exemple.

## À qui s'adresse ce secteur

Aux entreprises de déménagement qui ont une activité « entreprises » : transfert de bureaux, d'agences, de cabinets, d'ateliers légers, de laboratoires, d'archives, de matériel informatique, parfois de mobilier vers un garde-meubles le temps d'un chantier. Certaines font aussi du déménagement de particuliers ; le parcours n'est pas le même et ce funnel ne le vise pas.

La nomenclature de l'Insee range ces entreprises dans la sous-classe 49.42Z « Services de déménagement ». Sa définition comprend explicitement le déménagement de mobilier, de machines et d'équipements professionnels (bureaux, ateliers ou usines), ainsi que le garde-meubles. Le code NAF a une finalité statistique : il ne crée ni droit ni obligation, mais il aide à décrire le métier sur une landing.

Côté réglementation, l'article L3211-1 du code des transports soumet l'exercice des professions de transporteur public routier de marchandises, « y compris de déménagement », à des conditions d'établissement, d'honorabilité professionnelle, de capacité financière et de capacité professionnelle, ainsi qu'à l'inscription à un registre tenu par les autorités de l'État, selon des modalités fixées par décret. Un client entreprise sérieux demandera souvent ce justificatif ; mettez-le en avant sur votre page, pas dans le funnel.

## Il n'y a pas de template déménagement : partir de « Aménagement industriel »

QuoteBuilder n'a pas de template pour le déménagement. Les templates existants couvrent notamment les cuisines, la menuiserie, le rayonnage, les pièces et la sous-traitance, l'événementiel, le paysage et l'aménagement industriel. Le plus proche d'un transfert d'entreprise est « Aménagement industriel » : il parle d'un site, de son usage et de ses contraintes d'implantation.

### Étapes réelles du template fitout (main 4ba2123)

1. **Le site** (sous-titre : « Usage et contraintes d'implantation »)
   - « Type de site », choix visuel requis, clé `site` : Entrepôt / logistique (`warehouse`), Atelier de production (`workshop`), Bureaux / vestiaires (`office`), Autre (`other`).
   - « Contraintes », choix multiple facultatif (« Plusieurs choix possibles »), clé `constraints` : Normes alimentaires (`food`), Hauteur limitée (`height`), Accès / quai (`access`), Aucune particulière (`none`).
2. **Solutions recommandées** : titre « Ensembles adaptés à votre site ». Ce sont des produits du catalogue, choisis par les règles Si/Alors, trois suggestions au plus.
3. **Personnalisation** : sous-titre « Quantités, options et précisions ». Le prospect y règle la quantité et les options, et peut déposer un fichier dans la zone « Plan (PDF ou image) » (PDF, JPEG, PNG, WebP, 10 Mo). Il n'y a pas de champ de texte libre sur cette étape, malgré le mot « précisions » du sous-titre.
4. **Vos coordonnées** : sous-titre « Recevez le récapitulatif de votre projet ».

Pas de branchement conditionnel : vous ne pouvez pas afficher la question « Salle serveur » seulement si le prospect a coché « Informatique ». Toutes les questions ajoutées s'affichent pour tout le monde, dans l'ordre que vous choisissez. Les règles Si/Alors servent seulement à choisir les produits suggérés.

## Renommages proposés (valeurs gardées)

Vous pouvez changer les libellés sans toucher aux valeurs techniques. Les règles de suggestion et les exports continuent de fonctionner.

| Valeur | Libellé d'origine | Libellé suggéré déménagement |
|---|---|---|
| warehouse | Entrepôt / logistique | Entrepôt, stock, logistique |
| workshop | Atelier de production | Atelier, laboratoire, machines |
| office | Bureaux / vestiaires | Bureaux, agence, cabinet |
| other | Autre | Autre (commerce, archives seules, salle serveur seule) |
| food | Normes alimentaires | Matériel sensible (médical, labo, alimentaire) |
| height | Hauteur limitée | Étages sans ascenseur ou monte-charge |
| access | Accès / quai | Accès difficile (rue étroite, stationnement, quai) |
| none | Aucune particulière | Aucune particulière |

Le titre de l'étape peut devenir « Les locaux à déménager », et la question « Type de site » peut devenir « Quels locaux quittez-vous ? ». Le titre des suggestions peut devenir « Prestations adaptées à votre transfert ».

## Questions à ajouter (ordre fixe) pour un brief de transfert

L'éditeur propose six types de questions : Choix visuel, Mesure, Liste, Choix multiple, Texte et Fichier. Il n'y a pas de type date. Voici un ordre qui fonctionne pour un déménageur d'entreprise, à placer après « Le site » :

1. **Ville ou code postal de départ** (Texte).
2. **Ville ou code postal d'arrivée** (Texte). Une adresse précise viendra au téléphone ; ici, il s'agit de situer le trajet.
3. **Nombre de postes de travail à déménager** (Mesure). C'est l'unité la plus parlante pour un client de bureaux.
4. **Surface approximative des locaux de départ, en m²** (Mesure).
5. **Étage de départ et d'arrivée** (Liste) : Rez-de-chaussée des deux côtés · Étages avec ascenseur · Étages sans ascenseur d'un côté au moins · Ne sais pas.
6. **Ce qui part** (Choix multiple) : Mobilier de bureau · Informatique et écrans · Salle serveur ou baie · Archives et cartons · Machines ou matériel lourd · Coffre-fort · Œuvres ou objets fragiles · Plantes.
7. **Prestations souhaitées** (Choix multiple) : Mise en cartons par vos soins · Mise en cartons par nos équipes · Démontage et remontage du mobilier · Débranchement et rebranchement informatique · Garde-meubles · Évacuation du mobilier ancien.
8. **Période souhaitée** (Liste) : Dans le mois · Dans un à trois mois · Dans plus de trois mois · Date imposée par le bail (à préciser au téléphone).
9. **Contraintes horaires** (Choix multiple) : En semaine · Le week-end · De nuit · Sans interruption de l'activité · Aucune.
10. **Votre besoin en quelques lignes** (Texte). Libre, pour ce qui ne rentre dans aucune case.

Dix questions, c'est beaucoup. Regroupez-les sur deux écrans si possible, et retirez celles que vous posez toujours au téléphone de toute façon. Un funnel trop long fait perdre des demandes.

Les clés des questions ajoutées sont générées automatiquement par l'éditeur. La formule de score ne les lit pas, sauf exception décrite plus bas.

N'ajoutez pas de question de type Fichier en comptant dessus pour les photos : la zone « Plan (PDF ou image) » de l'étape Personnalisation fait déjà ce travail, et le prospect peut ajouter des fichiers plus tard depuis son espace prospect, rubrique « Compléter la demande ».

## Score : ce qui se passe vraiment sur fitout

La formule de score (`src/lib/quotes/score.ts`) est fixe. Elle part de 30 points et ne lit que quelques clés :

- `surface` (paliers 400, 100 et plus de 0 m²) ;
- `load` (charge) ;
- `access`, au sens d'un rythme de prélèvement en rayonnage, pas d'un accès chantier ;
- `project_type`, seulement pour les valeurs `entrepot`, `cuisine_pro` ou `commerce` ;
- `constraints`, qui ajoute 5 points si au moins une vraie contrainte est cochée (pas « Aucune particulière ») ;
- la longueur du texte des clés `need` ou `besoin` (8 points dès 20 caractères, 15 dès 80).

Sur le template fitout tel quel, les questions natives sont `site` et `constraints`. La formule ne lit pas `site`. Elle lit `constraints` : si le prospect coche une contrainte réelle, le score passe de 30 à 35. Warm commence à 45 et Hot à 70. Une demande de déménagement sur fitout, sans autre clé lue, reste donc **Cold, à 30 ou 35**.

Les questions ajoutées dans l'éditeur ont des clés générées automatiquement, qui ne s'appellent ni `surface` ni `besoin` : la surface et le besoin en quelques lignes que vous avez ajoutés ne changent pas le score. Ce n'est pas un défaut de votre funnel, c'est la formule.

Ne triez donc pas vos demandes sur la pastille. Triez sur le nombre de postes, la période souhaitée et la présence d'objets sensibles, que vous lisez dans les réponses du dossier. Le détail de la formule : [le score d'une demande de devis](https://www.quotebuilder.co/blog/score-demande-devis-b2b).

## Catalogue et suggestions

Le catalogue sert à proposer des ensembles dès la demande. Pour un déménageur d'entreprise, des lignes du type :

- transfert de bureaux, par poste de travail ;
- mise en cartons et déballage par nos équipes ;
- démontage et remontage de mobilier ;
- transfert d'archives, au mètre linéaire ;
- débranchement et rebranchement informatique ;
- transfert de salle serveur ou de baie ;
- manutention de coffre-fort ;
- garde-meubles, au mois ;
- location de caisses de déménagement ;
- évacuation de mobilier ancien.

Les prix sont en euros entiers. Il n'y a ni HT ni TTC dans le produit, et pas de kits : chaque ligne est un produit, avec ses options et ses variantes. Les règles Si/Alors (opérateurs égal, différent, supérieur ou égal, inférieur ou égal, dans la liste, contient ; conditions combinées en ET ; trois suggestions au plus) choisissent quoi montrer.

Exemples de règles, hypothèses d'exemple :

- si `site` = `office`, suggérer « Transfert de bureaux par poste » et « Démontage et remontage de mobilier » ;
- si `site` = `workshop`, suggérer « Manutention de machines » ;
- si `constraints` contient `height`, suggérer « Monte-meubles ».

Pour l'explication des règles : [règles de suggestion de produits dans un funnel](https://www.quotebuilder.co/blog/regles-suggestion-produits-funnel-devis-b2b). Pour organiser options et variantes : [options, variantes et alternatives dans un devis](https://www.quotebuilder.co/blog/options-variantes-alternatives-devis-b2b).

Le prix affiché dans le funnel est une fourchette indicative. Un déménagement d'entreprise se chiffre définitivement après la visite technique ; dites-le dans le texte d'accueil du funnel.

## Parcours après la soumission

Le dossier arrive avec les réponses, le score, et les éventuels fichiers déposés par le prospect. Votre équipe le prend en charge :

- **Assignation** à un chargé d'affaires.
- **Notes internes** en texte brut, visibles par l'équipe, en ajout seul : une note ne se modifie pas et ne se supprime pas. L'auteur est enregistré mais la timeline affiche seulement « Note interne ». Voir [notes internes d'un dossier](https://www.quotebuilder.co/blog/notes-internes-dossier-devis-equipe-b2b).
- **Autopilote** : le parcours livré par défaut contient une étape « Demande de photo » au bout de deux jours si le dossier est encore ouvert. Pour un déménagement, elle a du sens : une photo du couloir, de l'escalier ou de la salle serveur aide à préparer la visite. Adaptez son texte. Voir [Autopilote et relances](https://www.quotebuilder.co/blog/autopilote-workflows-relance-demande-devis-b2b).
- **Espace prospect** : le client suit sa demande et peut compléter son dossier avec des fichiers. Voir [l'espace prospect](https://www.quotebuilder.co/fonctionnalites/espace-prospect).
- **Relecteurs** : le client peut partager le dossier avec d'autres personnes de son entreprise (direction, services généraux, DSI), chacune avec son propre lien valable 30 jours. Voir [l'approbation par plusieurs décideurs](https://www.quotebuilder.co/blog/approbation-client-multi-decideurs-devis-b2b).
- **PDF récapitulatif** : il porte le pied fixe « Document indicatif, non contractuel. »

Ce que le produit ne fait pas : pas de signature électronique, pas de facturation ni d'encaissement, pas de date de validité sur le devis, pas de planning des équipes ni de gestion des camions. Le devis définitif, la lettre de voiture ou le document de transport, et le contrat se gèrent dans vos outils habituels.

## Tarifs (rappel)

Free pour tester, sans carte. Starter à partir de 39 € par mois et Pro à partir de 79 € par mois en paiement annuel. Le détail est sur la [page des tarifs](https://www.quotebuilder.co/tarifs).

## Mentions et vigilance métier (sans inventer)

Quelques points que la landing peut rappeler, sans entrer dans un cours de droit :

- **L'inscription au registre.** L'article L3211-1 du code des transports subordonne l'exercice du déménagement à l'inscription à un registre tenu par les autorités de l'État, dans les conditions fixées par décret. Indiquez votre numéro sur vos devis et sur votre site.
- **Les mentions du devis.** Elles ne changent pas parce que le funnel existe. Voir les [mentions obligatoires d'un devis](https://www.quotebuilder.co/blog/mentions-obligatoires-devis-france) et la [checklist des mentions](https://www.quotebuilder.co/outils/checklist-mentions-devis-france).
- **L'assurance et les valeurs déclarées.** Les règles de responsabilité, les plafonds et les déclarations de valeur dépendent de votre contrat d'assurance et de vos conditions générales. La landing ne doit pas promettre une couverture que votre contrat ne prévoit pas.
- **Les conditions de paiement.** Acompte, solde à la livraison, pénalités : voir [conditions de paiement et pénalités de retard](https://www.quotebuilder.co/blog/conditions-paiement-penalites-retard-devis-b2b).
- **L'annulation.** Un client qui annule à quinze jours d'un transfert de deux cents postes vous fait perdre une équipe et des camions réservés. Prévoyez arrhes, dédit ou clause pénale : [annulation de commande, arrhes, dédit et clause pénale](https://www.quotebuilder.co/blog/annulation-commande-devis-b2b-arrhes-dedit-clause-penale).

Le déménagement de particuliers relève de règles de consommation différentes. Cette page ne les traite pas.

## Erreurs à éviter dans le montage

1. **Garder « Normes alimentaires » tel quel.** Un office manager ne comprendra pas. Renommez.
2. **Promettre un prix ferme dans le funnel.** C'est une fourchette, la visite technique fixe le prix.
3. **Poser vingt questions.** Gardez ce qui sert à préparer la visite.
4. **Attendre une question conditionnelle.** Il n'y en a pas : formulez les questions pour qu'elles aient du sens pour tout le monde, avec une réponse « Non concerné ».
5. **Trier sur le score.** Il reste Cold sur ce template. Lisez les réponses.
6. **Compter sur l'équipe pour joindre le plan des nouveaux locaux au dossier.** Elle ne peut pas : seuls les fichiers du prospect y entrent. Demandez au client de le déposer.
7. **Oublier de retirer ou d'adapter la « Demande de photo ».** Telle quelle, son texte est générique.
8. **Afficher des prix au centime.** Les prix sont en euros entiers.
9. **Mélanger particuliers et entreprises dans le même funnel.** Faites deux parcours si vous avez les deux activités.
10. **Oublier la date.** Sans période souhaitée, vous ne savez pas si la demande est urgente.

## Exemple de scénario (hypothèse d'exemple)

Un cabinet d'expertise comptable de 42 postes quitte deux étages d'un immeuble ancien pour un plateau neuf de l'autre côté de la ville. Le bail se termine fin mars. La directrice administrative remplit le funnel un lundi soir :

- Locaux quittés : « Bureaux, agence, cabinet ».
- Contraintes : « Étages sans ascenseur ou monte-charge » et « Accès difficile ».
- Départ et arrivée : deux codes postaux de la même ville.
- 42 postes, 650 m².
- Ce qui part : mobilier, informatique, baie serveur, archives.
- Prestations : mise en cartons par ses équipes, démontage et remontage, rebranchement informatique, évacuation du mobilier ancien.
- Période : dans un à trois mois.
- Contraintes horaires : le week-end, sans interruption de l'activité.
- Besoin en quelques lignes : « Archives au sous-sol, environ 40 mètres linéaires, à trier avant. »

À l'étape Personnalisation, elle dépose le plan des nouveaux locaux en PDF.

Le dossier arrive Cold à 35 : seule la contrainte cochée est lue par la formule. Le chargé d'affaires le lit le mardi matin, voit 42 postes, un week-end, une baie serveur et un escalier : c'est un dossier sérieux. Il appelle, propose une visite technique le jeudi, et note dans le dossier : « Visite jeudi 10 h, prévoir métreur et technicien informatique. »

## Parcours détaillé étape par étape (ce que voit le prospect)

### Étape 1 · Les locaux à déménager

Une question en cartes, « Quels locaux quittez-vous ? », puis les contraintes en choix multiple, puis vos questions ajoutées. C'est l'écran le plus long. Gardez des libellés courts.

### Étape 2 · Prestations adaptées à votre transfert

Trois suggestions au plus, issues de votre catalogue. Le prospect voit des prestations qui correspondent à ses réponses, avec une fourchette de prix.

### Étape 3 · Personnalisation

Quantités et options, et la zone « Plan (PDF ou image) ». Indiquez dans le texte d'accueil ce que vous attendez : plan des locaux, photos des accès.

### Étape 4 · Vos coordonnées

Nom, e-mail, société, téléphone. Le prospect reçoit le récapitulatif de son projet.

## Scripts de rappel (hypothèses d'exemple)

**Premier appel, demande complète :** « Bonjour, j'ai bien reçu votre demande pour le transfert de vos 42 postes. J'ai vu la baie serveur et les archives au sous-sol. Je vous propose une visite technique jeudi à 10 h, avec un technicien pour la partie informatique. »

**Premier appel, demande incomplète :** « Bonjour, merci pour votre demande. Il me manque l'étage d'arrivée et la période. Avez-vous déjà une date de fin de bail ? Et si vous avez un plan des nouveaux locaux, vous pouvez le déposer depuis votre espace de suivi. »

**Relance après visite :** « Bonjour, suite à notre visite de jeudi, je vous confirme que le devis détaillé part demain. Il distinguera le transfert, le démontage et la partie informatique. »

## Organisation interne de l'équipe

Assignez les demandes par zone ou par taille : un chargé d'affaires pour les petits transferts, un autre pour les gros. Utilisez les notes internes pour tracer la visite technique, le métré, les points d'attention. Comme elles ne se modifient pas, elles forment un historique fiable si une question se pose plus tard sur ce qui avait été annoncé.

Les réponses de l'équipe dans le fil de discussion avec le prospect n'affichent pas le nom de l'auteur. Signez vos messages si le client doit savoir qui lui parle.

## Contenu catalogue : profondeur utile

Ne mettez pas tout le tarif dans le catalogue. Mettez ce qui aide le prospect à comprendre ce qu'il achète : quelques prestations principales, avec une fourchette réaliste, et des options lisibles. Une ligne « Transfert de bureaux par poste » avec les options « Démontage et remontage », « Mise en cartons par nos équipes » et « Rebranchement informatique » en dit plus qu'une grille de vingt lignes.

## Conformité et assurances : ce que la page peut dire sans inventer

La page peut dire que vous êtes inscrit au registre, que vous êtes assuré, et renvoyer vers vos conditions générales. Elle ne doit pas citer un plafond d'indemnisation, un taux ou une garantie qui ne figurent pas dans vos propres documents. QuoteBuilder n'affiche aucune clause sur le PDF, dont le pied est fixe.

## Maillage avec le blog juridique

Les déménageurs d'entreprise travaillent souvent pour des clients récurrents : un réseau d'agences qui bouge une agence par trimestre, un gestionnaire d'immeubles, un groupe qui réorganise ses sites. Ces relations reposent souvent sur un contrat-cadre et des devis répétés. Trois articles utiles :

- [Contrat-cadre et bordereau de prix unitaires](https://www.quotebuilder.co/blog/contrat-cadre-bordereau-prix-unitaires-devis-b2b), pour organiser les prix d'un client récurrent.
- [Reconduction tacite et préavis de résiliation](https://www.quotebuilder.co/blog/reconduction-tacite-preavis-resiliation-devis-b2b), pour la durée du contrat.
- [Rupture brutale d'une relation commerciale établie](https://www.quotebuilder.co/blog/rupture-brutale-relations-commerciales-devis-b2b), le jour où ce client récurrent annonce qu'il passe chez un concurrent national, avec le [calculateur de préavis de rupture brutale](https://www.quotebuilder.co/outils/calculateur-preavis-rupture-brutale).

## SEO : intention et requêtes

Les recherches de ce secteur sont très concrètes : « devis déménagement bureaux », « déménagement d'entreprise prix », « transfert d'archives », « déménagement salle serveur ». Le visiteur veut un prix et un interlocuteur. La landing doit montrer le funnel tôt, avec un bouton clair, et expliquer en deux phrases ce qui se passe après : rappel, visite technique, devis détaillé.

## Mesurer après publication

Regardez, après trente demandes : combien ont déposé un plan, combien ont répondu à la question sur la période, combien ont abandonné avant les coordonnées. Le tableau des statistiques donne les visites, les devis, la conversion, les abandons et la tendance sur six mois. Le tunnel de conversion détaillé en sept étapes se trouve dans le rapport PDF. Il n'y a pas de test A/B : si vous changez une question, comparez avant et après.

## Cas multi-sites

Un client qui déménage trois agences en même temps : un dossier par agence, ou un seul dossier avec une note qui précise les trois sites ? Les deux fonctionnent. Un dossier par site est plus lisible si les dates diffèrent ; un seul dossier est plus simple si tout se fait le même week-end. Le funnel ne gère pas plusieurs adresses dans une même demande, sauf à poser la question en texte libre.

## Accessibilité du funnel

Des libellés courts, des cartes lisibles, pas de jargon (« monte-meubles » se comprend, « VL » ne se comprend pas). Testez le funnel sur téléphone : beaucoup de demandes sont remplies depuis un mobile, entre deux réunions.

## Ce qu'il ne faut pas promettre sur la landing

- un template déménagement : il n'existe pas ;
- un prix ferme en ligne ;
- une signature du devis en ligne ;
- une facture générée par QuoteBuilder ;
- un planning des équipes ou un suivi des camions ;
- un score qui « détecte les gros clients » : il est fixe et reste Cold sur ce template ;
- des questions qui apparaissent selon les réponses.

## Planning type de déploiement (hypothèse d'exemple)

Jour 1 : création du compte, choix du template fitout, renommages. Jour 2 : questions ajoutées, catalogue de dix lignes, trois règles Si/Alors. Jour 3 : texte d'accueil, adaptation de la « Demande de photo », test sur mobile. Jour 4 : mise en ligne sur la page « Déménagement d'entreprise » de votre site.

## Lien avec la démo publique

Pour voir à quoi ressemble un funnel côté visiteur avant de monter le vôtre : la [démo funnel rayonnage](https://www.quotebuilder.co/c/demo/rayonnage). Ce n'est pas un funnel de déménagement, mais le parcours en étapes est le même.

## Synthèse

Pas de template déménagement, mais « Aménagement industriel » s'adapte bien : on renomme les cartes et les contraintes, on ajoute une dizaine de questions dans un ordre fixe, on construit un catalogue de prestations, et on lit les réponses plutôt que le score. Le funnel ne remplace pas la visite technique ; il la prépare.

## FAQ

### QuoteBuilder a-t-il un template déménagement ?

Non. Le plus proche est « Aménagement industriel » (`fitout`), famille « Industrie & fabrication ». Vous renommez ses libellés et ajoutez vos questions.

### Puis-je renommer « Bureaux / vestiaires » en « Bureaux, agence, cabinet » ?

Oui. Le libellé change, la valeur `office` reste. Les règles de suggestion qui utilisent `office` continuent de fonctionner.

### Pourquoi mes demandes sortent-elles toutes Cold ?

Parce que la formule de score est fixe et ne lit presque rien sur ce template : 30 points de base, 35 si une contrainte réelle est cochée. Les questions que vous ajoutez ont des clés générées automatiquement, que la formule ne lit pas. Triez sur les réponses.

### Puis-je poser la question « salle serveur » seulement si le client a de l'informatique ?

Non. Il n'y a pas de branchement conditionnel : toutes les questions s'affichent pour tout le monde. Proposez une réponse « Non concerné ».

### Le prospect peut-il envoyer des photos de ses locaux ?

Oui, à l'étape Personnalisation, dans la zone « Plan (PDF ou image) » : PDF, JPEG, PNG ou WebP, jusqu'à 10 Mo. Plus tard, il peut ajouter des fichiers depuis « Compléter la demande » sur son espace prospect.

### Mon équipe peut-elle joindre le métré de la visite au dossier ?

Non. Les fichiers d'un dossier viennent seulement du prospect. Notez le métré en note interne, ou demandez au client de déposer son plan.

### Y a-t-il une question de type date ?

Non. Les types disponibles sont Choix visuel, Mesure, Liste, Choix multiple, Texte et Fichier. Posez la période en Liste, ou la date en Texte.

### Le client peut-il faire valider le devis par sa direction ?

Oui. Il peut partager le dossier à des relecteurs, chacun avec son propre lien valable 30 jours. La signature du devis se fait hors de QuoteBuilder.

### Free suffit-il pour tester ?

Oui, Free permet de monter un funnel sans carte. Starter et Pro commencent à 39 € et 79 € par mois en paiement annuel.

### Où voir un funnel en fonctionnement ?

Sur la [démo funnel rayonnage](https://www.quotebuilder.co/c/demo/rayonnage), qui montre le parcours en étapes côté visiteur.

## Annexes pratiques

### Liste courte des libellés à coller dans l'éditeur

Quels locaux quittez-vous ? · Bureaux, agence, cabinet · Atelier, laboratoire, machines · Entrepôt, stock, logistique · Autre · Étages sans ascenseur ou monte-charge · Accès difficile · Matériel sensible · Aucune particulière.

### Message d'accueil du funnel (idée de texte)

« Décrivez votre transfert en deux minutes. Nous vous rappelons sous 24 heures ouvrées pour fixer une visite technique. Le prix affiché est une fourchette ; le devis définitif suit la visite. »

### Quand refuser une demande via le funnel

Si la demande sort de votre zone ou de votre métier (déménagement international, transport de marchandises en flux régulier), dites-le vite et poliment. Une note interne garde la trace de la raison.

### Formation express (45 minutes)

Quinze minutes sur le dossier et les notes internes, quinze minutes sur le catalogue et les règles, quinze minutes sur l'espace prospect et les relecteurs.

### Indicateurs simples après 30 jours

Taux de demandes avec plan déposé, délai moyen entre demande et visite, part des demandes avec période renseignée.

## Détail du brief utile avant la visite technique

Ce que le chargé d'affaires veut savoir avant de se déplacer tient en peu de choses : le trajet, le volume, les accès, les objets qui demandent un savoir-faire particulier, et la date. Le funnel couvre les quatre premiers points en questions fermées et laisse la date en liste. Ce qui reste, le détail des archives, la clé du local technique, le nom du contact sur place, se règle au premier appel.

Pour le volume, beaucoup de déménageurs raisonnent en mètres cubes. Un client entreprise, lui, ne connaît pas son volume ; il connaît son nombre de postes et sa surface. Posez ces deux questions-là, et faites la conversion vous-même. Si vous tenez à une estimation en mètres cubes, ajoutez une Mesure facultative avec une aide : « Si vous la connaissez ».

Pour les accès, une seule question en Liste suffit souvent pour l'étage, et la contrainte « Accès difficile » du template fait le reste. La photo vient ensuite, par la zone « Plan (PDF ou image) » ou par la « Demande de photo » de l'Autopilote.

## Produits catalogue : exemples de lignes

| Produit | Unité | Options possibles |
|---|---|---|
| Transfert de bureaux | par poste | Mise en cartons par nos équipes, démontage et remontage |
| Transfert d'archives | au mètre linéaire | Tri préalable, mise en caisses-archives |
| Informatique | par poste | Débranchement, rebranchement, étiquetage des câbles |
| Salle serveur ou baie | forfait | Intervention de nuit |
| Manutention lourde | forfait | Coffre-fort, machine, monte-meubles |
| Garde-meubles | au mois | Assurance selon vos conditions |
| Évacuation de mobilier | au mètre cube | Tri pour réemploi |

Les montants sont à fixer par vous, en euros entiers. Ils apparaissent dans le funnel sous forme de fourchette indicative.

## Règles Si/Alors : exemples (valeurs gardées)

Les règles portent sur les clés des questions. Sur le template fitout, la clé `site` et la clé `constraints` sont stables et lisibles. Les clés de vos questions ajoutées sont générées par l'éditeur ; pour des règles simples et lisibles, appuyez-vous d'abord sur `site` et `constraints`. Trois suggestions au plus s'affichent ; si aucune règle ne correspond, le prospect voit un message lui proposant de continuer, et il peut passer à l'étape suivante.

## Checklist de mise en route (une demi-journée)

1. Créer le funnel à partir de « Aménagement industriel ».
2. Renommer l'étape, la question « Type de site » et ses quatre cartes.
3. Renommer les quatre contraintes.
4. Ajouter les questions de trajet, de volume, d'étage, de contenu, de prestations, de période et d'horaires.
5. Créer une dizaine de produits au catalogue.
6. Écrire trois règles Si/Alors.
7. Rédiger le texte d'accueil : fourchette indicative, visite technique, délai de rappel.
8. Adapter le texte de la « Demande de photo ».
9. Tester le parcours complet sur mobile, avec un plan en PDF.
10. Publier sur votre page « Déménagement d'entreprise ».

## Pourquoi le template fitout plutôt qu'un autre

Le template rayonnage pose des questions de charge et de hauteur de stockage qui n'ont pas de sens pour un transfert de bureaux. Les templates événementiels parlent de dates, de lieux et de capacités, mais pour une location, pas pour un transfert. « Aménagement industriel » parle d'un site, de son usage et de ses contraintes : c'est la base la plus neutre. Les libellés se renomment ; la structure en quatre étapes reste.

## Mot de la fin

Un déménagement d'entreprise se gagne souvent sur la réactivité et la qualité de la visite technique. Le funnel ne fait ni l'une ni l'autre à votre place, mais il vous donne, dès la demande, ce qu'il faut pour rappeler vite et arriver préparé.

## Sources

- Insee, nomenclature d'activités française NAF rév. 2, sous-classe 49.42Z « Services de déménagement » (déménagement de mobilier, de machines et d'équipements professionnels de bureaux, ateliers ou usines ; garde-meubles), consultée le 10 novembre 2026. https://www.insee.fr/fr/metadonnees/nafr2/sousClasse/49.42Z
- Code des transports, article L3211-1 (conditions d'accès aux professions de transporteur public routier de marchandises, y compris de déménagement, et inscription à un registre), version en vigueur depuis le 24 mars 2012, consultée sur Légifrance. https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000025576860
- QuoteBuilder, code source sur la branche main au commit 4ba2123 : `src/lib/funnels/templates.ts` (template `fitout`), `src/lib/funnels/families.ts` (famille « Industrie & fabrication »), `src/lib/funnels/builder.ts` (types de questions), `src/lib/quotes/score.ts` (formule de score), `src/lib/pdf/quote-pdf.tsx` (pied du PDF).

Aucune statistique de marché n'est citée. Les volumes, surfaces et délais de l'exemple sont des hypothèses.

## Pour aller plus loin

- [Rupture brutale d'une relation commerciale établie](https://www.quotebuilder.co/blog/rupture-brutale-relations-commerciales-devis-b2b)
- [Calculateur de préavis de rupture brutale](https://www.quotebuilder.co/outils/calculateur-preavis-rupture-brutale)
- [Funnel de devis agencement de bureau](https://www.quotebuilder.co/secteurs/funnel-devis-agencement-bureau)
- [Funnel de devis nettoyage et propreté d'entreprise](https://www.quotebuilder.co/secteurs/funnel-devis-nettoyage-proprete-entreprise)
- [Funnel de devis rayonnage et stockage](https://www.quotebuilder.co/secteurs/funnel-devis-rayonnage-stockage)
- [Funnel de devis transport routier de marchandises](https://www.quotebuilder.co/secteurs/funnel-devis-transport-routier-marchandises)
- [Pièces jointes, plans et photos dans une demande de devis](https://www.quotebuilder.co/blog/pieces-jointes-plans-photos-devis-b2b)
- [Qualifier une demande de devis avant de chiffrer](https://www.quotebuilder.co/blog/qualifier-demande-devis-avant-chiffrage)
- [Espace prospect](https://www.quotebuilder.co/fonctionnalites/espace-prospect)
