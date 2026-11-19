---
title: "Funnel de devis peinture entreprise : site, supports, surface, contraintes chantier, une demande chiffrable avant la visite"
slug: funnel-devis-peinture-entreprise
description: "Landing SEO pour les entreprises de peinture professionnelle (bureaux, entrepôts, ateliers, façades d'établissements) : les questions à poser avant la visite, le code NAF 43.34Z, l'absence de template peinture dans QuoteBuilder, et comment monter le funnel à partir du template Aménagement industriel (fitout). Sans template inventé ni fonction inventée."
canonical: /secteurs/funnel-devis-peinture-entreprise
locale: fr-FR
word_count_target: 5500
keywords:
  - devis peinture entreprise
  - funnel devis peintre professionnel
  - peinture industrielle bureaux entrepôt
  - QuoteBuilder aménagement industriel
  - NAF 43.34Z peinture
  - devis peinture intérieure extérieure pro
author: QuoteBuilder
date: 2026-11-06
updated: 2026-11-06
---

# Funnel de devis peinture entreprise : site, supports, surface, contraintes chantier, une demande chiffrable avant la visite

Un responsable de site écrit : « Besoin de peindre les bureaux et le hall, urgent. » Sans surface, sans support, sans savoir si le site reste en activité, sans accès camion, sans délai réel. Le commercial se déplace, mesure, revient, rappelle, et découvre que le client voulait aussi la façade et un sol antidérapant en atelier. Deux semaines perdues, un devis refait, un concurrent déjà en place.

Un funnel de demande de devis bien monté pose les bonnes questions avant la visite. QuoteBuilder n'a pas de template peinture. Le plus proche est « Aménagement industriel » (`fitout`), dans la famille Industrie & fabrication, funnel par défaut « Funnel aménagement », type formulaire. C'est la même base que pour l'alarme, la sécurité incendie ou la dératisation : on décrit le site et ses contraintes, puis on suggère des ensembles du catalogue, on personnalise, on prend les coordonnées.

Cet article explique comment renommer ce template pour un peintre d'entreprise, quelles questions ajouter en ordre fixe, ce que le score fait vraiment, et ce que le produit ne fait pas. Aucune statistique inventée. Les montants et délais cités sont des hypothèses d'exemple.

## À qui s'adresse ce secteur

Aux entreprises de peinture professionnelle qui travaillent surtout pour d'autres entreprises : sièges, agences, entrepôts, ateliers, commerces, ERP, parfois façades d'établissements. Pas le particulier qui veut repeindre une chambre : le parcours et les mentions ne sont pas les mêmes, et la rétractation hors établissement peut s'appliquer selon les cas.

Le code APE / NAF actuel pour les travaux de peinture et vitrerie est 43.34Z (Insee, sous-classe « Travaux de peinture et vitrerie »). Il couvre notamment la peinture intérieure et extérieure des bâtiments et les travaux de peinture sur des ouvrages de génie civil. À partir du 1er janvier 2027, la NAF 2025 prévoit notamment 43.34G « Travaux de peinture » pour l'activité de peintre en bâtiment (Insee ; Service Public Entreprendre F39038). Le code APE a une valeur statistique : il ne crée pas à lui seul de droits ou d'obligations (rappel Insee / décret 2007-1888). Vérifiez le code réellement attribué à votre SIREN.

L'activité de peintre en bâtiment est réglementée : qualifications, immatriculation, et selon les travaux une assurance adaptée (dont la décennale quand elle est due). Cet article ne remplace pas vos obligations professionnelles. Il parle du funnel de demande.

## Il n'y a pas de template peinture : partir de « Aménagement industriel »

QuoteBuilder n'a pas de template pour la peinture. Le plus proche est « Aménagement industriel », famille « Industrie & fabrication », identifiant `fitout`, funnel par défaut « Funnel aménagement », type formulaire (`form`). Sa présentation dit : « Site, contraintes, gammes, vous rappelez pour proposer, pas pour découvrir. » C'est exactement la logique d'une demande de peinture pro : on décrit le site avant de parler de teintes RAL.

### Étapes réelles du template fitout (main 4ba2123)

1. **Le site** (sous-titre : « Usage et contraintes d'implantation »)
   - « Type de site », choix visuel requis, clé `site` : Entrepôt / logistique (`warehouse`), Atelier de production (`workshop`), Bureaux / vestiaires (`office`), Autre (`other`).
   - « Contraintes », choix multiple facultatif, clé `constraints` : Normes alimentaires (`food`), Hauteur limitée (`height`), Accès / quai (`access`), Aucune particulière (`none`).
2. **Suggestions** : titre « Solutions recommandées », sous-titre « Ensembles adaptés à votre site » (produits du catalogue selon règles Si/Alors, conditions en ET, trois suggestions au plus).
3. **Personnalisation** : quantité, options, zone « Plan (PDF ou image) » (PDF, JPEG, PNG, WebP, 10 Mo). Pas de champ texte libre « précisions » dans cette étape.
4. **Coordonnées** : contact du prospect.

Pas de branchement conditionnel : vous ne pouvez pas masquer une question « façade » seulement si le site est extérieur. Les questions ajoutées s'enchaînent en ordre fixe. Les règles Si/Alors choisissent seulement les produits suggérés.

## Renommages proposés (valeurs gardées)

Vous pouvez renommer les libellés sans changer les valeurs techniques.

| Valeur | Libellé d'origine | Libellé suggéré peinture |
|---|---|---|
| warehouse | Entrepôt / logistique | Entrepôt / zones de stockage |
| workshop | Atelier de production | Atelier / production |
| office | Bureaux / vestiaires | Bureaux / parties communes |
| other | Autre | Autre (commerce, ERP, façade…) |
| food | Normes alimentaires | Locaux agroalimentaires / hygiène |
| height | Hauteur limitée | Hauteur / nacelle nécessaire |
| access | Accès / quai | Accès chantier / stationnement |
| none | Aucune particulière | Aucune particulière |

Le titre de l'étape peut devenir « Le site à peindre ». Le titre des suggestions peut devenir « Prestations et options de votre catalogue ». Les valeurs (`warehouse`, etc.) restent : les règles de suggestion et les exports ne cassent pas.

## Questions à ajouter (ordre fixe) pour un brief peinture pro

Ajoutez des questions après « Le site », avant les suggestions, ou après selon votre habitude d'équipe. Ordre fixe recommandé :

1. **Intérieur / extérieur** (choix unique) : Intérieur seulement · Extérieur seulement · Les deux.
2. **Support principal** (choix unique ou multiple) : Plâtre / plaques · Béton · Métal · Bois · Ancien revêtement à reprendre · Autre.
3. **Surface approximative (m²)** (nombre) : même si le score ne lit pas cette clé telle quelle, votre équipe en a besoin pour chiffrer.
4. **État du support** (choix) : Bon état · À lessiver · À poncer / gratter · Dégradé / humidité · Ne sais pas.
5. **Contraintes de chantier** (multiple) : Site occupé · Horaires nuit / week-end · Locaux alimentaires · COV / produits à faible émission · Protection des stocks · Aucune.
6. **Délai souhaité** (choix) : Moins de 2 semaines · 2 à 6 semaines · Plus de 6 semaines · Date imposée (à préciser au contact).
7. **Accès** (choix) : Ascenseur / monte-charge · Escalier seulement · Nacelle possible · Quai poids lourd · Autre.

Les clés générées automatiquement pour les questions ajoutées ne sont en général pas lues par la formule de score. C'est voulu : le score n'est pas configurable.

Dans Personnalisation, le prospect peut joindre un plan ou des photos (PDF ou image, 10 Mo). Demandez-lui un plan des zones à peindre ou des photos des supports. L'équipe ne peut pas joindre de fichier de son côté.

## Score : ce qui se passe vraiment sur fitout

La formule (`src/lib/quotes/score.ts`) part de 30 points. Elle lit :

- `surface` (seuils 400 / 100 / >0) ;
- `load` (charge) ;
- `access` au sens picking (faible / moyenne / haute), pas l'accès chantier ;
- `project_type` seulement s'il vaut `entrepot`, `cuisine_pro` ou `commerce` ;
- `constraints` si au moins une vraie contrainte (pas `none`) : +5 ;
- longueur de `need` / `besoin` (+8 dès 20 caractères, +15 dès 80).

Sur le template fitout tel quel, les questions natives sont `site` et `constraints`. La formule ne lit pas `site`. Elle lit `constraints` : si le prospect coche Normes alimentaires, Hauteur limitée ou Accès / quai, le score passe à 35. Sinon il reste à 30. Warm commence à 45, Hot à 70. Donc un cas type fitout reste **Cold à 30 ou 35**.

Ce n'est pas un jugement sur la demande. Triez sur la surface saisie dans vos questions ajoutées, le délai, l'occupation du site et le type intérieur/extérieur, pas sur la pastille. Le détail de la formule est dans [le score d'une demande de devis](https://www.quotebuilder.co/blog/score-demande-devis-b2b).

## Catalogue et suggestions

Créez dans le catalogue des lignes du type : peinture intérieure bureaux (forfait ou au m²), peinture atelier, ravalement façade, sol antidérapant, lessivage, protection au sol, location nacelle. Les prix se saisissent au centime et s'affichent arrondis à l'euro dès 1 € (sous 1 €, les centimes restent). Pas de HT/TTC dans le produit. Pas de kits. Les options et variantes existent ; les règles Si/Alors (eq, neq, gte, lte, in, contains, en ET, trois suggestions max) choisissent quoi montrer selon `site` ou selon vos questions ajoutées si vous alignez les clés.

Exemple de règle (hypothèse) : si `site` = `office`, suggérer « Pack bureaux » ; si `site` = `warehouse`, suggérer « Pack entrepôt ». Ce ne sont pas des kits : ce sont des produits du catalogue.

## Parcours après la soumission

Le dossier arrive avec le score, les réponses, éventuellement un plan. Sept statuts. Notes internes en ajout seul (pas d'édition, pas de suppression, auteur stocké mais non affiché dans la timeline). Autopilote « Demande de photo » à J+2, active par défaut. Espace prospect : [fonctionnalites/espace-prospect](https://www.quotebuilder.co/fonctionnalites/espace-prospect). Relecteurs : lien 30 jours. PDF : pied « Document indicatif, non contractuel. »

Pas de signature électronique. Pas de facturation ni d'encaissement. Pas de date de validité de devis dans le produit. Les CGV et la [clause résolutoire](https://www.quotebuilder.co/blog/clause-resolutoire-devis-b2b) se gèrent hors QuoteBuilder.

## Tarifs (rappel)

Consultés sur /tarifs (même grille que les packs récents) : Free (1 funnel, 10 soumissions), Starter 39 € (3 funnels), Pro 79 € (illimité). Vérifiez la page /tarifs pour l'état à jour.

## Mentions et vigilance métier (sans inventer)

- Qualifications et immatriculation : voir Service Public Entreprendre F39038 (peintre en bâtiment).
- NAF 43.34Z / bascule 43.34G en 2027 : Insee.
- Travaux en site occupé, ERP, locaux alimentaires : vos procédures chantier et vos assurances priment sur le funnel.
- Ne promettez pas dans le funnel une certification ou un label que vous n'avez pas.

## Erreurs à éviter dans le montage

- Inventer un template « peinture » qui n'existe pas.
- Changer les valeurs (`warehouse` → autre chose) au lieu de renommer les libellés.
- Compter sur le score pour prioriser : il restera Cold.
- Ajouter vingt questions d'un coup : le prospect abandonne.
- Oublier le plan / les photos dans Personnalisation.
- Promettre signature électronique ou paiement dans QuoteBuilder.
- L'espace prospect se lie en `/fonctionnalites/espace-prospect`.

## Exemple de scénario (hypothèse d'exemple)

Société de peinture « Couleurs Logistique » (hypothèse). Client : entrepôt alimentaire de 2 400 m² à repeindre en zones de circulation + bureaux attenants. Dans le funnel fitout renommé : site = warehouse, contraintes = food + access. Questions ajoutées : intérieur, support béton + plaques, 2 400 m², état à lessiver, site occupé + locaux alimentaires, délai 2 à 6 semaines, accès quai. Score : 35 Cold (contraintes +5). Le commercial rappelle avec un brief déjà utile, demande le plan des zones et les plages horaires nuit.


## Parcours détaillé étape par étape (ce que voit le prospect)

### Étape 1 · Le site à peindre

Le prospect arrive sur une page claire. Titre renommé : « Le site à peindre ». Première question en cartes : type de site. Quatre choix visuels. Il en choisit un. Deuxième question : contraintes, cases à cocher. Il peut tout laisser vide ou cocher « Aucune particulière ». S'il coche hauteur et accès, vous savez déjà qu'il faudra parler nacelle et stationnement.

Temps passé cible : moins de deux minutes. Si vous avez ajouté sept questions juste après, le total de l'étape questions peut monter à quatre ou cinq minutes. Au-delà, le taux d'abandon grimpe. Préférez sept questions utiles à quinze questions « au cas où ».

### Étape 2 · Suggestions

Titre : « Prestations et options de votre catalogue ». Le prospect voit jusqu'à trois lignes suggérées selon vos règles. Il peut en choisir, ou passer. Les suggestions ne sont pas un devis : ce sont des points d'entrée catalogue. Le commercial corrigera après visite.

### Étape 3 · Personnalisation

Quantité, options, upload « Plan (PDF ou image) ». C'est ici que vous récupérez le plan des zones ou trois photos de murs. Formats PDF, JPEG, PNG, WebP. Limite 10 Mo. Pas de champ texte libre « précisions » dans cette étape sur le produit actuel : si vous voulez un commentaire, ajoutez une question texte plus haut ou utilisez le besoin éventuel côté contact.

### Étape 4 · Coordonnées

Nom, e-mail, téléphone, société selon votre configuration. Soumission. Le dossier apparaît dans l'équipe avec le score Cold typique.

## Scripts de rappel (hypothèses d'exemple)

**Script A · Bureaux sains, petite surface.** « Bonjour, j'ai votre demande QuoteBuilder pour les bureaux, environ 180 m², bon état, délai sous six semaines. On peut vous envoyer un ordre de grandeur sous 48 h à partir des photos. Une visite reste possible si vous préférez. »

**Script B · Entrepôt alimentaire occupé.** « Bonjour, j'ai le brief : entrepôt, contraintes hygiène et accès, site occupé. On ne chiffre pas sans visite. Je vous propose mardi 5 h ou mercredi 21 h pour ne pas bloquer l'exploitation. Déposez le plan des zones dans votre espace prospect. »

**Script C · Façade / extérieur.** « Bonjour, pour l'extérieur je vais avoir besoin d'une visite en journée pour juger le support et les accès nacelle. Avez-vous une contrainte de date liée à un événement ou à une inspection ? »

Ces scripts sont des hypothèses d'exemple, pas des textes obligatoires.

## Organisation interne de l'équipe

Désignez un responsable de la file peinture. Règle simple : toute demande avec contrainte alimentaire ou hauteur limitée est rappelée dans l'heure ouvrée. Les autres sous 24 h. Le score Cold ne change rien à cette règle. Notez dans la note interne le créneau de visite promis. Les notes ne s'éditent pas : écrivez juste du premier coup, ou ajoutez une seconde note « Visite reportée à vendredi ».

Les relecteurs (responsable technique, associé) reçoivent un lien 30 jours. Ils voient une version réduite de l'espace prospect, sans les fichiers ni les messages. Ils ne remplacent pas un outil GED pour vos CCTP et vos plans internes.

## Contenu catalogue : profondeur utile

Évitez un catalogue à une seule ligne « Peinture diverse ». Préférez une dizaine de lignes lisibles. Le prospect comprend ce qu'il coche. Le commercial retrouve le même vocabulaire au téléphone. Les options portent les surcoûts fréquents (nuit, week-end, deux teintes, protection renforcée). Les prix se saisissent au centime et s'affichent arrondis à l'euro dès 1 € (sous 1 €, les centimes restent) : arrondissez vos barèmes au m².

Pas de HT/TTC affiché par le produit. Votre devis contractuel, lui, respectera les règles fiscales hors QuoteBuilder.

## Conformité et assurances : ce que la page peut dire sans inventer

Vous pouvez rappeler que l'activité est réglementée et renvoyer vers Service Public Entreprendre. Vous pouvez citer le code NAF 43.34Z et la bascule 43.34G en 2027. Vous ne devez pas inventer un pourcentage d'entreprises assurées, ni un délai légal de devis peinture, ni un prix moyen national. Si vous citez une obligation d'assurance, restez factuel et invitez le lecteur à vérifier sa situation. Pour la décennale quand elle s'applique, vous avez déjà des articles et outils QuoteBuilder sur l'attestation : renvoyez-y sans refaire le sujet ici.

## Maillage avec le blog juridique

Une demande de peinture pro finit souvent en devis signé avec acompte et planning. Les litiges classiques : retard de chantier, impayé de solde, non-conformité de teinte, accès refusé. D'où le maillage vers la [clause résolutoire](https://www.quotebuilder.co/blog/clause-resolutoire-devis-b2b), les [délais et pénalités](https://www.quotebuilder.co/blog/delai-livraison-penalites-retard-execution-devis-b2b), la [force majeure](https://www.quotebuilder.co/blog/force-majeure-imprevision-devis-b2b), et l'[annulation arrhes dédit](https://www.quotebuilder.co/blog/annulation-commande-devis-b2b-arrhes-dedit-clause-penale). Le funnel collecte ; le contrat protège.

## SEO : intention et requêtes

La page vise l'intention « comment recevoir des demandes de devis peinture entreprise structurées » et « funnel devis peintre professionnel ». Elle doit répondre dès l'introduction : pas de template peinture, base fitout, questions à ajouter, score Cold. Les H2 reprennent site, renommages, questions, score, catalogue, tarifs, erreurs. FAQ en dix questions minimum (déjà présentes) plus les complémentaires terrain.

Évitez le ton vendeur « révolutionnez votre prise de devis ». Préférez : voici ce qui existe, voici ce qui manque, voici comment faire avec.

## Mesurer après publication

Sur /stats (rappel produit) : visites, devis, conversion, CA, rappel. Pas d'A/B test natif. Pas de duplication de funnel pour tester deux versions automatiquement. Si vous voulez comparer deux formulations de question, faites-le à la main sur une période, ou acceptez de changer puis observer. Le tunnel de conversion détaillé à sept étapes apparaît dans le rapport PDF, pas comme doublon dans l'écran Vue.

## Cas multi-intervenants

Peinture + sol + petite signalétique : soit vous vendez tout, soit vous co-traitez. Le funnel peut offrir une option « Nous coordonnons les autres lots » sans promettre un pilotage de chantier que vous n'assurez pas. Les fichiers du prospect (plans) serviront aussi aux co-traitants, via votre propre partage, pas via un rôle « co-traitant » dans QuoteBuilder (il n'existe pas de rôle technique dédié ; les relecteurs existent).

## Accessibilité du funnel

Gardez des libellés courts. Évitez le jargon « COV » sans explication : écrivez « Produits à faible émission / COV ». Pour « nacelle », ajoutez une aide sous le choix si le produit le permet (texte d'aide sous les choix visuels selon règles produit). Les questions ajoutées sont requises par défaut : passez en facultatif celles qui font fuir (surface exacte si le prospect ne la connaît pas : demandez une fourchette).

## Ce qu'il ne faut pas promettre sur la landing

- Un template peinture natif.
- Un chiffrage automatique au m² magique.
- Une signature électronique du devis.
- Un paiement d'acompte dans QuoteBuilder.
- Un score Hot pour les gros chantiers (la formule ne le fera pas sur fitout).
- Un branchement qui adapte les questions à l'intérieur / extérieur.

Dites ce qui est vrai : brief structuré, catalogue, suivi, espace prospect, PDF indicatif.

## Planning type de déploiement (hypothèse d'exemple)

Jour 1 : funnel + renommages + questions. Jour 2 : catalogue + règles. Jour 3 : tests internes + formation 45 minutes. Jour 4 : mise en ligne sur le site (lien ou embed selon votre setup). Jour 5 à 15 : ajustement des libellés selon les dix premières demandes. Cette chronologie est une hypothèse d'exemple, pas un engagement de résultat.

## Lien avec la démo publique

La démo rayonnage montre le parcours visiteur sur un autre métier. Elle reste utile pour voir le rythme des étapes, l'upload, les suggestions. Montrez-la à un peintre qui découvre QuoteBuilder, puis ouvrez votre funnel peinture en compte Free pour le travail réel : [démo](https://www.quotebuilder.co/c/demo/rayonnage), [signup Free](https://www.quotebuilder.co/signup?plan=free).

## Synthèse

QuoteBuilder n'a pas de template peinture. Le template Aménagement industriel donne le site et les contraintes. Vous renommez, vous ajoutez les questions peinture en ordre fixe, vous peupler le catalogue, vous ignorez la pastille Cold pour le tri, vous gardez CGV et clauses hors produit. C'est suffisant pour transformer « Besoin de peindre, urgent » en brief exploitable avant la première visite.


## FAQ

### QuoteBuilder a-t-il un template peinture ?

Non. Il n'y a pas de template peinture. On part de « Aménagement industriel » (`fitout`).

### Puis-je renommer « Entrepôt / logistique » en « Entrepôt à peindre » ?

Oui. Gardez la valeur `warehouse`. Changez seulement le libellé.

### Pourquoi toutes les demandes sortent Cold ?

Parce que la formule ne lit presque rien du questionnaire fitout : au mieux +5 pour une vraie contrainte, soit 35, sous le seuil warm de 45. Aucun champ des coordonnées ne compte, et les questions ajoutées n'entrent pas dans le score : ignorez la pastille et triez à la main.

### Puis-je poser la question façade seulement pour l'extérieur ?

Non. Pas de branchement conditionnel. Posez la question à tout le monde, ou acceptez qu'elle apparaisse toujours.

### Le prospect peut-il envoyer des photos des murs ?

Oui, via « Plan (PDF ou image) » en personnalisation, ou plus tard dans l'espace prospect. Formats PDF, JPEG, PNG, WebP, 10 Mo.

### L'équipe peut-elle joindre le CCTP au dossier ?

Non. Seuls les fichiers du prospect apparaissent. Gardez le CCTP dans votre GED et référencez-le en note interne.

### Quel lien pour l'espace prospect ?

https://www.quotebuilder.co/fonctionnalites/espace-prospect

### Les prix peuvent-ils être au m² avec décimales ?

Les prix du catalogue se saisissent au centime et s'affichent arrondis à l'euro dès 1 € (sous 1 €, les centimes restent). Structurez vos lignes (forfait zone, prix au m² arrondi) en conséquence.

### Free suffit-il pour tester ?

Oui : 1 funnel, 10 soumissions. Ensuite Starter ou Pro selon le volume.

### Où voir une démo de funnel ?

https://www.quotebuilder.co/c/demo/rayonnage (démo rayonnage, pour voir le parcours visiteur). Compte : https://www.quotebuilder.co/signup?plan=free


## Annexes pratiques

### Liste courte des libellés à coller dans l'éditeur

Étape : Le site à peindre. Sous-titre : Type de local et contraintes de chantier. Question 1 : Type de site (cartes). Question 2 : Contraintes (cases). Puis questions ajoutées : Intérieur ou extérieur ; Support principal ; Surface approximative en m² ; État du support ; Contraintes de chantier ; Délai souhaité ; Accès au chantier. Suggestions : Prestations et options de votre catalogue. Personnalisation : laissez l'upload plan/photo visible. Coordonnées : inchangées.

### Message d'accueil du funnel (idée de texte)

« Décrivez le site à peindre. Nous revenons vers vous avec les bonnes questions techniques, puis une visite si besoin. Devis indicatif ensuite. » Pas de promesse de délai de réponse légal. Si vous annoncez « réponse sous 24 h », tenez-le côté équipe.

### Quand refuser une demande via le funnel

Le funnel recueille. Le refus se fait après, par message humain : hors zone, hors compétence (amiante non géré, patrimoine classé sans agrément), délai impossible, budget annoncé dérisoire. QuoteBuilder n'a pas de statut « refus automatique par règle ». Changez le statut à la main et écrivez au prospect.

### Formation express (45 minutes)

0-10 min : parcours prospect en navigation privée. 10-20 min : lecture d'un dossier type Cold 35. 20-30 min : où sont les notes, l'espace prospect, le PDF indicatif. 30-40 min : ce qu'on ne fait pas dans l'outil (signature, facture, CGV). 40-45 min : règles de rappel interne. Une seule session suffit pour démarrer ; le reste s'apprend sur les vraies demandes.

### Indicateurs simples après 30 jours

Nombre de soumissions. Nombre de visites réellement planifiées. Nombre de devis contractuels envoyés hors outil. Taux de plans/photos joints. Taux d'abandons à l'étape suggestions. Si les photos manquent souvent, renforcez l'Autopilote « Demande de photo » et le rappel humain. Si les soumissions sont nombreuses mais vides, raccourcissez le questionnaire.

### Relier peinture et clause résolutoire dans la vente

Quand le devis contractuel part, joignez les CGV avec une clause résolutoire lisible. Le funnel a fait son travail en amont. Le contrat fait le sien en aval. Pour contrôler la clause : [vérificateur de clause résolutoire](https://www.quotebuilder.co/outils/verificateur-clause-resolutoire). Pour comprendre le formalisme : [article clause résolutoire](https://www.quotebuilder.co/blog/clause-resolutoire-devis-b2b).

### Dernier rappel produit (main 4ba2123)

Pas de signature électronique. Pas de facturation. Pas de HT/TTC. Les prix se saisissent au centime et s'affichent arrondis à l'euro dès 1 € (sous 1 €, les centimes restent). Pas de date de validité. Pas de branchement conditionnel. Pas de kits. Pas d'A/B. Score fixe. Notes en ajout seul. Fichiers prospect seulement. Espace prospect sur `/fonctionnalites/espace-prospect`. Relecteurs 30 jours. PDF « Document indicatif, non contractuel. ». Template peinture : inexistant. Base : `fitout`.



## Mot de la fin

Un funnel peinture dans QuoteBuilder, c'est un Aménagement industriel renommé, sept questions métier, un catalogue lisible, et une équipe qui rappelle sans regarder la pastille Cold. Ce n'est pas un logiciel de chiffrage au m², ni un outil de planning chantier. C'est le premier filtre qui évite d'envoyer un peintre sur site pour découvrir que le client voulait seulement un devis « pour voir » sur 80 m² de couloir déjà refait. Mettez le lien sur votre site, testez en Free, puis montez en Starter ou Pro quand le volume le justifie. Gardez vos CGV et votre clause résolutoire à jour : le brief arrive mieux, le contrat reste le contrat.

Si vous peignez surtout des bureaux tertiaires, commencez par les renommages office et les options nuit. Si vous peignez surtout des entrepôts, commencez par warehouse, hauteur, accès et option nacelle. Le template est le même ; le catalogue et les règles font la différence. Et si un jour un template peinture natif apparaît dans QuoteBuilder, cet article sera mis à jour : jusqu'ici, main 4ba2123, il n'existe pas.


## Sources

- Insee, sous-classe 43.34Z Travaux de peinture et vitrerie ; NAF 2025 43.34G Travaux de peinture.
- Service Public Entreprendre, fiche peintre en bâtiment F39038 (qualifications, APE).
- Code QuoteBuilder main 4ba2123 : `src/lib/funnels/templates.ts` (fitout), `src/lib/quotes/score.ts`.
- /tarifs QuoteBuilder (Free / Starter 39 € / Pro 79 € ; rappel packs 5 novembre 2026).

## Pour aller plus loin

- [Clause résolutoire dans un devis B2B](https://www.quotebuilder.co/blog/clause-resolutoire-devis-b2b)
- [Vérificateur de clause résolutoire](https://www.quotebuilder.co/outils/verificateur-clause-resolutoire)
- [Score d'une demande de devis](https://www.quotebuilder.co/blog/score-demande-devis-b2b)
- [Funnel alarme et vidéosurveillance](https://www.quotebuilder.co/secteurs/funnel-devis-alarme-videosurveillance-entreprise) (même base fitout)
- [Espace prospect](https://www.quotebuilder.co/fonctionnalites/espace-prospect)
- [Démo rayonnage](https://www.quotebuilder.co/c/demo/rayonnage)
- [Créer un compte Free](https://www.quotebuilder.co/signup?plan=free)


## Détail du brief utile avant visite

Un peintre d'entreprise ne chiffre pas comme un peintre logement. Le coût dépend du site occupé ou non, des protections, des horaires, de la hauteur, du lessivage, du nombre de teintes, des reprises de fissures, des contraintes alimentaires ou COV, de la location de nacelle, du temps de séchage imposé par le client. Le funnel ne remplace pas la visite. Il évite la visite à l'aveugle.

Demandez assez pour savoir si la demande est chiffrable à distance (petit plateau de bureaux, photos claires) ou si elle exige un déplacement (façade complexe, support dégradé, site classé). Vos questions ajoutées doivent servir ce tri. Si vous ajoutez « Surface approximative » et « État du support », un commercial peut déjà dire : « En dessous de 200 m² bureaux sains, on envoie un ordre de grandeur ; au-delà ou support dégradé, on visite. » (Seuils d'organisation internes : hypothèses d'exemple, pas des normes.)

## Produits catalogue : exemples de lignes

Sans inventer de prix magiques, structurez des lignes claires :

- Peinture intérieure bureaux, préparation légère (unité : forfait zone ou m² entier).
- Peinture atelier / zones de circulation.
- Lessivage et dégraissage.
- Reprise de supports (forfait journée).
- Protection sols et stocks.
- Location nacelle (journée).
- Peinture façade (à définir après visite).

Les options peuvent porter « deux teintes », « travail de nuit », « week-end ». Pas de kits. Trois suggestions max à l'écran suggestions.

## Règles Si/Alors : exemples (valeurs gardées)

- Si `site` eq `office` → suggérer produit « Pack bureaux ».
- Si `site` eq `warehouse` → suggérer « Pack entrepôt ».
- Si `constraints` contains `food` → suggérer « Option produits faibles émissions / hygiène ».
- Si `constraints` contains `height` → suggérer « Option nacelle ».

Conditions en ET seulement. Pas de OU. Pas de branchement qui cache une étape.

## Ce que le commercial dit au téléphone (après soumission)

« J'ai votre demande : entrepôt, contraintes alimentaires et accès, intérieur, environ [surface] m², support béton, site occupé, délai [X]. Je vous propose une visite le [date] entre [heures], avec un technicien. Pouvez-vous laisser le plan des zones dans votre espace prospect et nous dire si le quai est libre ? » Le prospect complète dans l'[espace prospect](https://www.quotebuilder.co/fonctionnalites/espace-prospect). Vous ajoutez une note interne « Visite jeudi 9h, contact sécurité M. X ».

## Comparaison avec les autres secteurs fitout

Alarme / vidéosurveillance, sécurité incendie, dératisation : même base `fitout`, autres questions ajoutées, autres contraintes réglementaires. La peinture partage le besoin de décrire le site avant le matériel ou le produit. Ne copiez pas les questions CNAPS ou CNIL dans un funnel peinture. Copiez la méthode : renommer, ajouter, rester honnête sur ce que le produit ne fait pas.

## Limites produit à assumer dès la page de vente

Dites-le sur votre site si besoin : QuoteBuilder recueille la demande et organise le dossier. Le devis contractuel, les CGV, la clause résolutoire, la planification chantier et la facturation restent dans vos outils habituels. Le PDF QuoteBuilder est indicatif et non contractuel. Cette clarté évite les mauvaises surprises et les tickets support.

## Checklist de mise en route (une demi-journée)

1. Créer un funnel depuis Aménagement industriel.
2. Renommer l'étape et les choix (valeurs intactes).
3. Ajouter les 7 questions peinture en ordre fixe.
4. Créer 5 à 10 produits catalogue.
5. Écrire 2 ou 3 règles de suggestion.
6. Tester le parcours en navigation privée.
7. Brancher l'Autopilote photo si utile.
8. Former l'équipe au tri manuel (ignorer Cold).
9. Préparer le modèle de CGV + clause résolutoire hors outil.
10. Publier et suivre les 10 premières soumissions Free.

## FAQ complémentaire terrain

### Peut-on exiger le plan avant de rappeler ?

Vous pouvez le demander dans le funnel (upload) et relancer via l'espace prospect. Vous ne pouvez pas bloquer la soumission sur une règle du type « si pas de plan, étape suivante cachée » : pas de branchement conditionnel.

### Comment gérer multi-sites ?

Une demande = un brief. Pour plusieurs sites, soit le prospect envoie plusieurs demandes, soit vous ajoutez une question texte « Liste des sites » (clés non lues par le score) et vous découpez en dossiers à la main.

### Les relecteurs voient-ils les photos ?

Non. Leur lien 30 jours ouvre une vue réduite : les fichiers déposés et les messages n'y figurent pas. Partagez les photos utiles en interne.



## Pourquoi le template fitout plutôt qu'un autre

« Pièces & sous-traitance », « Chapiteaux & agence », « Rayonnage » : chacun a ses questions. Fitout est le seul qui ouvre sur le type de site industriel et des contraintes d'implantation. La peinture d'entreprise se joue d'abord sur le lieu (entrepôt, atelier, bureaux) et sur ce qui complique le chantier (hauteur, accès, hygiène). Les autres templates orientent vers une pièce mécanique, un événement ou une charge de stockage. Fitout reste le moins mauvais point de départ, et c'est celui déjà documenté pour alarme et incendie.

## Ton de la page et SEO

La page secteur doit dire clairement « pas de template peinture », montrer les étapes réelles, proposer les renommages, lister les questions ajoutées, expliquer le score Cold, renvoyer vers l'outil et le blog clause résolutoire pour le contrat, et vers la démo pour le parcours. Pas de promesse de signature, de paiement ou de calcul HT/TTC. Français simple. Pas de tiret long.

## Boucle d'amélioration après 30 demandes

Regardez les abandons, les champs vides, les photos manquantes. Si personne ne remplit la surface, reformulez l'aide. Si tout le monde coche « Autre » sur le type de site, vos libellés sont mauvais. Si les commerciaux ignorent encore le brief, le problème n'est pas le funnel, c'est l'adoption. QuoteBuilder livre le dossier ; l'équipe doit ouvrir le dossier avant d'appeler.
