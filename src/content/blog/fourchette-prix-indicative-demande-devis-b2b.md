---
title: "Fourchette de prix indicative dans une demande de devis B2B : donner un ordre de grandeur sans s'engager"
slug: fourchette-prix-indicative-demande-devis-b2b
description: "Afficher une fourchette de prix (prix min, prix max) avant le devis B2B : pourquoi les acheteurs la cherchent, prix fixe, fourchette ou sur devis, où elle apparaît dans QuoteBuilder (parcours, fiche devis, espace prospect, PDF), comment la calculer et ce qu'elle ne remplace pas."
canonical: /blog/fourchette-prix-indicative-demande-devis-b2b
locale: fr-FR
word_count_target: 2500
keywords:
  - fourchette de prix devis
  - prix indicatif demande de devis
  - afficher prix site B2B
  - prix min prix max devis
  - estimation budget avant devis
  - fourchette indicative devis B2B
  - prix sur devis ou fourchette
author: QuoteBuilder
date: 2026-10-06
updated: 2026-10-06
---

# Fourchette de prix indicative dans une demande de devis B2B : donner un ordre de grandeur sans s'engager

Jeudi, 16 h 40. Le commercial raccroche après vingt minutes d'échange avec une responsable des services généraux. Le besoin est clair, le planning tient, la visite est presque calée. Puis vient la question qu'elle n'avait pas posée au début : « Et ça coûterait combien, à peu près ? » La réponse tombe à trois fois son budget. Le dossier s'arrête là, après une demande en ligne, un rappel, une préqualification et une heure de préparation.

L'acheteur B2B veut un ordre de grandeur avant d'engager son temps. Le vendeur hésite à l'afficher, parce que chaque projet est différent. Entre « prix public » et « sur devis », il existe une troisième voie : la fourchette indicative.

Cet article explique ce qu'elle apporte, comment la construire à partir de vos propres chiffres, et où elle apparaît dans un parcours QuoteBuilder : écran de solutions, fiche devis, espace prospect, PDF récapitulatif. Avec ses limites.

**Tester une fourchette sur votre catalogue :** [créer un compte Free](https://www.quotebuilder.co/signup?plan=free), puis renseigner un prix minimum et un prix maximum sur vos produits. Pour voir un parcours complet côté prospect avant de vous lancer : [démo funnel rayonnage](https://www.quotebuilder.co/c/demo/rayonnage) (sans compte).

## Pourquoi les acheteurs B2B cherchent un prix avant le devis

Dans son article de 2013 sur l'affichage des prix, Hoa Loranger (Nielsen Norman Group) rapporte que l'absence de prix fait partie des frustrations les plus citées par les utilisateurs de sites B2B, qui partent souvent chercher ailleurs. Quand le prix exact dépend du projet, une estimation ou une fourchette vaut mieux que rien.

Jakob Nielsen proposait dès 2006 de publier le prix de quelques scénarios courants, même pour des offres complexes. Et Page Laubheimer (2016) rappelle qu'en B2B, l'acheteur doit souvent faire valider un budget en interne avant même de demander un devis. Sans ordre de grandeur, il ne peut pas préparer cette validation.

Ces sources ne donnent pas de pourcentage, et nous n'en inventerons pas. Elles décrivent un comportement : le prix est une information de qualification, pour l'acheteur comme pour vous. Un prospect qui voit « entre 3 000 et 4 500 € pour 120 personnes » et continue sa demande a accepté un ordre de grandeur. Celui qui s'arrête vous évite un rappel inutile.

## Prix fixe, fourchette ou sur devis : trois façons d'annoncer un prix

Pour chaque produit ou prestation, vous avez trois options honnêtes.

**Le prix fixe.** Un montant unique, quand la prestation est standard : une location à la journée, un forfait de déplacement.

**La fourchette.** Un minimum et un maximum, quand le prix dépend du projet mais reste prévisible : une formule par convive selon le menu, un mètre linéaire selon la finition.

**Sur devis.** Aucun montant affiché, quand l'écart possible est trop grand ou que le prix dépend d'une étude. Ce choix reste légitime s'il est expliqué.

Un même catalogue peut mélanger les trois.

Dans QuoteBuilder, c'est exactement le choix proposé à la création d'un produit, à l'étape « Prix et présentation », sous la question « Comment annoncer le prix ? » : Prix fixe (« Un montant unique affiché au prospect »), Fourchette (« De … à …, quand ça dépend du projet ») ou Sur devis (« Aucun montant affiché »). En base, tout se résume à deux champs, prix minimum et prix maximum. Un prix fixe enregistre le même montant dans les deux. Une fourchette saisie à l'envers est remise dans le bon ordre. Sur devis laisse les deux vides.

## Ce qu'une fourchette n'est pas

Une fourchette indicative n'est pas un devis. Service Public Entreprendre rappelle que le devis est un document précontractuel qui décrit précisément les prestations et leur prix. Il n'est pas systématiquement obligatoire, mais quand il est accepté, il engage. Une fourchette affichée dans un parcours en ligne reste une indication, et elle doit le dire.

C'est pourquoi le PDF généré par QuoteBuilder s'intitule « Récapitulatif de configuration » et se termine par la mention « Document indicatif, non contractuel ».

Ce n'est pas non plus un tarif : entre professionnels, vos CGV doivent comporter votre barème de prix unitaires, selon la même fiche Service Public.

Enfin, une fourchette n'indique pas d'elle-même si elle est hors taxes ou toutes taxes comprises. QuoteBuilder ne gère pas la TVA : les produits n'ont qu'un prix minimum et un prix maximum, sans taux, et les écrans affichent des montants dans la devise du produit (l'euro par défaut), sans mention HT ou TTC. Si vos prix sont hors taxes, écrivez-le vous-même dans la description du produit, dans le titre de la règle ou dans le texte d'aide de la question. Notre article sur la [TVA, le HT et le TTC dans un devis B2B](https://www.quotebuilder.co/blog/tva-ht-ttc-devis-b2b-france) détaille les mentions à prévoir dans le vrai devis.

## Où la fourchette apparaît dans un parcours QuoteBuilder

Deux sources de prix coexistent : la fourchette de chaque produit et, en option, celle d'une règle de suggestion. QuoteBuilder en tire une seule « Fourchette indicative » par dossier, la même sur tous les écrans.

### La fourchette du produit

Vous la saisissez sur la fiche produit, dans les champs « Prix min », « Prix max » et « Devise », ou par import CSV : les colonnes reconnues sont `price_min` et `price_max` (ou `prix_min` et `prix_max`). Un maximum inférieur au minimum est remis dans l'ordre. Un produit synchronisé depuis WooCommerce avec des déclinaisons prend le prix exact de la déclinaison quand la combinaison choisie par le prospect existe.

Cette fourchette produit est unitaire. Elle apparaît telle quelle à l'étape « Personnalisation » du parcours, à côté de chaque produit, avec le champ de quantité. Ailleurs, chaque ligne affiche son montant, c'est-à-dire le prix unitaire multiplié par la quantité :

- sur la fiche devis, dans le tableau « Configuration demandée » (colonnes Produit, Qté, Options, Montant) ;
- dans l'espace prospect, dans la section « Configuration », ligne par ligne ;
- dans le PDF récapitulatif, sous chaque ligne « quantité × produit ».

Un prix fixe s'affiche une seule fois, une fourchette sous la forme « 1 000 € à 2 400 € ».

### La fourchette de la règle de suggestion

Une règle de suggestion décide quels produits proposer selon les réponses du prospect (voir notre article sur les [règles de suggestion produits](https://www.quotebuilder.co/blog/regles-suggestion-produits-funnel-devis-b2b)). Chaque règle peut porter sa propre fourchette, avec les champs « Prix min » et « Prix max » du formulaire d'édition, sur la page Règles. Ces champs n'existent pas dans la fenêtre de création : on crée la règle, puis on l'édite.

Cette fourchette de règle est une estimation de lot pour une configuration type. Quand elle est renseignée, elle passe avant le calcul des lignes.

### La fourchette indicative du dossier

La règle de calcul est simple :

- si la solution choisie porte une fourchette de règle, c'est elle ;
- sinon, c'est la somme des lignes : prix minimum × quantité d'un côté, prix maximum × quantité de l'autre. Si une ligne n'a qu'un prix minimum, il sert aussi de maximum.

Elle est figée au moment où la demande est envoyée, puis reprise :

- sur la carte de la solution, à l'étape « Solutions recommandées » (sans fourchette de règle et avant la saisie des quantités, la carte compte une unité par produit) ;
- dans le PDF récapitulatif, sous la forme « Fourchette indicative : » suivie des montants ;
- dans l'email de brief envoyé à votre équipe, à la ligne « Fourchette » ;
- sur la fiche devis et dans l'espace prospect, sous le libellé « Fourchette indicative ».

Sans aucun prix, ni sur la règle ni sur les produits, ces endroits affichent « Sur devis ».

### Ce que cela implique

Une fourchette de règle remplace le calcul des lignes, elle ne s'y ajoute pas. Quand la quantité fait le prix (convives, mètres, pièces), laissez la règle sans fourchette : la fourchette du dossier suivra les quantités. Sinon, gardez-la cohérente avec les montants de ligne, visibles juste en dessous : « 2 500 à 4 000 € » au-dessus de lignes qui totalisent 6 000 € demande une explication.

## Exemple chiffré : une formule cocktail facturée par convive

Prenons un traiteur qui vend une formule cocktail entre 28 et 38 € par personne, selon le nombre de pièces et les options de service. Dans son catalogue, le produit « Cocktail déjeunatoire » porte un prix minimum de 28 € et un prix maximum de 38 €. Une règle le propose quand le prospect choisit « Cocktail / standing ».

Le prospect sélectionne la formule, puis indique 120 à l'étape Personnalisation. Côté QuoteBuilder :

- l'étape Personnalisation affiche la fourchette unitaire, 28 à 38 € ;
- la ligne « 120 × Cocktail déjeunatoire » porte un montant de 3 360 à 4 560 € (28 × 120 et 38 × 120), sur la fiche devis, dans l'espace prospect et dans le PDF ;
- sans fourchette de règle, la fourchette indicative du dossier est la même ; avec, c'est celle de la règle qui s'affiche en tête.

Les options du produit n'ajoutent rien au montant. Si une option change fortement le prix, faites-en un produit séparé. Pour un exemple complet dans ce métier, voir notre page [funnel de devis traiteur événementiel](https://www.quotebuilder.co/secteurs/funnel-devis-traiteur-evenementiel).

## Comment construire une fourchette crédible

Une bonne fourchette vient de vos propres devis, pas d'un benchmark sectoriel.

1. **Reprenez vos derniers devis signés** pour une même prestation. Vingt suffisent pour commencer, dix si l'activité est plus rare.
2. **Ramenez-les à la même unité** : par personne, par mètre carré, par jour, par pièce. Une fourchette sans unité ne veut rien dire.
3. **Écartez les cas extrêmes**, le chantier hors norme ou le client avec une remise exceptionnelle. Gardez la zone où se trouve la grande majorité des devis.
4. **Arrondissez.** Le parcours, la fiche devis et le PDF arrondissent à l'euro : inutile de saisir 27,85 €.
5. **Écrivez ce qui fait varier le prix** dans la description du produit : nombre de pièces, distance, finition, saison. Le prospect comprend pourquoi la fourchette est large.
6. **Révisez tous les trimestres**, ou dès que vos prix d'achat changent.

La largeur compte. Une fourchette de 1 à 10 ne filtre rien ; une fourchette trop serrée crée une attente que le devis risque de décevoir. Si l'écart reste énorme, découpez l'offre en plusieurs produits, ou restez sur devis.

**Mesurer ce que coûtent les demandes hors budget :** notre [estimateur des demandes hors budget](https://www.quotebuilder.co/outils/estimateur-demandes-hors-budget-fourchette-devis) calcule, à partir de vos propres hypothèses, le temps passé sur des dossiers qui s'arrêtent au prix, et ce qu'une fourchette affichée plus tôt pourrait éviter. Pour tester sur vos produits : [compte Free](https://www.quotebuilder.co/signup?plan=free).

## La fourchette face au budget du décideur

En B2B, la personne qui remplit la demande n'est pas toujours celle qui signe. Dans l'espace prospect de QuoteBuilder, le client peut cliquer sur « Partager pour validation » et inviter un directeur financier, un responsable technique, un acheteur ou un autre décideur. Chaque relecteur reçoit son propre lien, valable 30 jours, vers la même page.

Le relecteur voit la configuration. Il peut renseigner une « Contrainte budgétaire (€) », ajouter un commentaire, puis « Valider le dossier » ou « Demander des modifications ». Votre équipe est notifiée de la décision.

Si la fourchette indicative est de 3 360 à 4 560 € et que le directeur financier indique 3 500 €, vous savez avant de chiffrer qu'il faudra viser le bas de la fourchette ou proposer une formule plus légère. Sans fourchette, cette information arrive après l'envoi du devis, sous la forme d'un silence. Notre article sur l'[approbation client multi-décideurs](https://www.quotebuilder.co/blog/approbation-client-multi-decideurs-devis-b2b) détaille ce circuit.

## Ce que la fourchette ne change pas

**Le score.** Le score Hot, Warm ou Cold de QuoteBuilder repose sur une formule fixe qui lit certaines réponses (surface, charge, accès, type de projet, contraintes, longueur de la description du besoin). Il ne lit ni les prix ni la fourchette indicative. Un dossier à 50 000 € n'est pas « plus chaud » qu'un dossier à 2 000 € aux yeux du score. Voir notre article sur le [score d'une demande de devis](https://www.quotebuilder.co/blog/score-demande-devis-b2b).

**Le statut.** Les statuts du pipeline restent les vôtres : Commencée, Nouveau, Contacté, En cours, Gagné, Perdu, En attente. Une fourchette acceptée par le prospect ne fait pas passer le dossier en Gagné.

**Le devis lui-même.** Le chiffrage définitif, avec vos mentions obligatoires, se fait dans votre outil de devis ou de facturation habituel.

## Erreurs fréquentes

- **Afficher une fourchette sans unité.** « 2 000 à 6 000 € » pour une formule traiteur ne dit pas si c'est par personne ou au total. Mettez l'unité dans le nom du produit ou sa description.
- **Oublier de préciser HT.** Un acheteur professionnel raisonne souvent hors taxes, un particulier en TTC. Écrivez-le.
- **Poser une fourchette de règle qui contredit les lignes.** Elle s'affiche en tête, les montants de ligne en dessous : si les deux divergent, le prospect le voit. Choisissez une logique et tenez-la.
- **Ne jamais mettre à jour** une fourchette de l'an dernier.
- **Compter sur la fourchette pour remplacer la qualification.** Elle filtre les écarts de budget, pas les besoins mal décrits. Les bonnes questions restent nécessaires : voir [qualifier une demande de devis avant chiffrage](https://www.quotebuilder.co/blog/qualifier-demande-devis-avant-chiffrage).

## FAQ

### Faut-il afficher un prix sur un site B2B ?

Ce n'est pas obligatoire, mais les tests du Nielsen Norman Group montrent que l'absence totale de prix frustre les acheteurs B2B. Une fourchette ou quelques scénarios chiffrés donnent un ordre de grandeur.

### Une fourchette affichée m'engage-t-elle ?

Elle n'a pas la valeur d'un devis accepté. Présentez-la comme indicative, comme le fait le PDF de QuoteBuilder. Pour une question juridique précise, consultez un professionnel du droit.

### Quelle différence entre fourchette produit et fourchette de règle ?

La fourchette produit est unitaire : multipliée par la quantité, elle donne le montant de chaque ligne. La fourchette de règle, si vous la saisissez, devient la fourchette indicative du dossier ; sinon, c'est la somme des lignes.

### Où saisir la fourchette d'une règle ?

Sur la page Règles, dans le formulaire d'édition de la règle, avec les champs « Prix min » et « Prix max », puis « Enregistrer la règle ». La fenêtre de création ne propose pas ces champs.

### Le prospect voit-il le total multiplié par la quantité ?

Oui. Dans son espace prospect et dans le PDF, chaque ligne affiche prix × quantité. À l'étape Personnalisation, il voit le prix unitaire.

### Peut-on afficher un prix fixe plutôt qu'une fourchette ?

Oui. À la création du produit, choisissez « Prix fixe » : le même montant est enregistré en minimum et en maximum. En import CSV, mettez la même valeur dans `price_min` et `price_max`.

### Les prix sont-ils HT ou TTC ?

QuoteBuilder ne gère pas la TVA et n'affiche ni HT ni TTC. Les montants sont ceux que vous saisissez. Indiquez vous-même « HT » dans la description du produit ou de la règle si c'est le cas.

### Les options d'un produit modifient-elles la fourchette ?

Non. Le calcul ne repose que sur le prix minimum, le prix maximum et la quantité. Pour une option qui change vraiment le prix, créez un produit séparé.

### La fourchette influence-t-elle le score Hot, Warm ou Cold ?

Non. Le score suit une formule fixe qui ne lit pas les prix.

### Que voit le prospect si je ne mets aucun prix ?

« Sur devis », partout où la fourchette indicative apparaît. Expliquez alors dans la description ce qui détermine le prix.

**Donnez un ordre de grandeur dès la demande :** [créer un compte Free](https://www.quotebuilder.co/signup?plan=free) · [voir la démo](https://www.quotebuilder.co/c/demo/rayonnage) · [estimer vos demandes hors budget](https://www.quotebuilder.co/outils/estimateur-demandes-hors-budget-fourchette-devis) · [options, variantes et alternatives dans un devis](https://www.quotebuilder.co/blog/options-variantes-alternatives-devis-b2b).

## Sources

- Hoa Loranger, « Pricing information gives B2B sites a competitive advantage », Nielsen Norman Group, 2013. https://www.nngroup.com/articles/show-price/
- Jakob Nielsen, « Show Prices for Common Scenarios », Nielsen Norman Group, 2006. https://www.nngroup.com/articles/show-prices-for-common-scenarios/
- Page Laubheimer, « B2B vs. B2C Websites: Key UX Differences », Nielsen Norman Group, 2016. https://www.nngroup.com/articles/b2b-vs-b2c/
- Service Public Entreprendre, « Documents commerciaux d'une société (facture, devis, bon de commande...) ». https://entreprendre.service-public.gouv.fr/vosdroits/F37371

## Pour aller plus loin

- [Règles de suggestion produits dans un funnel de devis](https://www.quotebuilder.co/blog/regles-suggestion-produits-funnel-devis-b2b)
- [TVA, HT et TTC dans un devis B2B](https://www.quotebuilder.co/blog/tva-ht-ttc-devis-b2b-france)
- [Remise commerciale et marge dans un devis](https://www.quotebuilder.co/blog/remise-commerciale-marge-devis-b2b)
- [Fiche produit B2B et devis unifié](https://www.quotebuilder.co/blog/fiche-produit-b2b-devis-unifie)
- [Funnel de devis traiteur événementiel](https://www.quotebuilder.co/secteurs/funnel-devis-traiteur-evenementiel)
- [Estimateur des demandes hors budget](https://www.quotebuilder.co/outils/estimateur-demandes-hors-budget-fourchette-devis)
- [Espace prospect](https://www.quotebuilder.co/fonctionnalites/espace-prospect)
- [Catalogue](https://www.quotebuilder.co/fonctionnalites/catalogue)
