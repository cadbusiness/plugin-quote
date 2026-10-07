---
title: "Règles de suggestion produits dans un funnel de devis B2B : proposer le bon produit sans alourdir le formulaire"
slug: regles-suggestion-produits-funnel-devis-b2b
description: "Comment écrire les règles Si/Alors qui choisissent les produits suggérés dans un funnel de devis B2B : conditions, priorité, limite de 3 blocs, options et produits liés. Ce que les règles font, et ce qu'elles ne font pas."
canonical: /blog/regles-suggestion-produits-funnel-devis-b2b
locale: fr-FR
word_count_target: 2600
keywords:
  - règles suggestion produits funnel
  - suggestion produits devis B2B
  - règles si alors funnel devis
  - produits recommandés formulaire devis
  - upsell cross-sell devis B2B
  - options variantes produits liés
  - configurateur devis catalogue
author: QuoteBuilder
date: 2026-10-05
updated: 2026-10-05
---

# Règles de suggestion produits dans un funnel de devis B2B : proposer le bon produit sans alourdir le formulaire

Un responsable logistique remplit votre funnel. Il coche « Entrepôt », tape 600 m², choisit « Charge lourde ». Écran suivant : on lui propose des étagères pour archives. Ou alors onze produits d'un coup, dans l'ordre du catalogue. Il ferme l'onglet, ou il coche au hasard pour en finir. Dans les deux cas, votre commercial reçoit un dossier qu'il va devoir reprendre au téléphone.

Le catalogue n'est pas en cause. Ce qui manque, c'est la règle qui décide quoi montrer à qui.

Ce guide explique comment écrire des règles de suggestion dans un funnel de devis B2B, avec des exemples concrets. On reste précis sur ce que fait QuoteBuilder : les règles Si/Alors choisissent les produits proposés à l'écran « Solutions recommandées ». Elles ne font pas sauter d'étape, ne changent pas l'ordre du parcours, ne calculent pas de prix et ne fabriquent pas de kits.


**Voir un écran de suggestions en vrai :** [ouvrir la démo funnel rayonnage](https://www.quotebuilder.co/c/demo/rayonnage) (sans compte) ou [créer un compte Free](https://www.quotebuilder.co/signup?plan=free) pour écrire vos premières règles.


## Ce qu'une règle de suggestion fait, et ce qu'elle ne fait pas

Dans QuoteBuilder, un funnel de type formulaire suit des étapes dans un ordre fixe. Pour la plupart des templates : des questions de cadrage, puis l'écran « Solutions recommandées », puis « Personnalisation » (quantités, options et précisions), puis les coordonnées. Tout le monde voit les mêmes étapes, dans le même ordre.

Les règles n'agissent qu'à un seul endroit : l'écran des suggestions. Leur logique tient en une phrase. Si le prospect a répondu ceci, alors on lui propose ces produits.

| Ce que la règle décide | Ce que la règle ne décide pas |
|------------------------|-------------------------------|
| Quels produits apparaissent à l'écran « Solutions recommandées » | Quelles étapes le prospect voit (pas de branchement conditionnel) |
| Le titre et la description du bloc vus par le prospect | Le prix du devis (il reste une fourchette indicative) |
| L'ordre des blocs (via la priorité) | Le score Hot / Warm / Cold |
| Une fourchette min-max indicative attachée au bloc, si vous la renseignez | Un kit ou un bundle (ça n'existe pas dans le produit) |

Si vous voulez qu'un prospect « atelier » ne voie jamais la question sur la hauteur sous plafond, une règle ne le fera pas. Soit la question sert à tout le monde, soit vous faites deux funnels distincts.

## Anatomie d'une règle dans QuoteBuilder

Les règles se gèrent dans Produits, onglet Règles, par un administrateur de l'espace. La création se fait en deux écrans : « Quand proposer ces produits ? » puis « Qu'est-ce qu'on propose ? ».

**Le funnel concerné.** Une règle appartient à un funnel : elle lit ses questions et ne propose que des produits de son catalogue.

**Les conditions.** Chaque condition associe une question, un opérateur et une valeur. Les opérateurs disponibles : « est », « n'est pas », « est au moins », « est au plus », « inclut », « est parmi ». Quand une règle a plusieurs conditions, elles doivent toutes être vraies. Il n'y a pas de OU dans une même règle : pour un OU, on crée deux règles, ou on utilise « est parmi » sur une seule question.

**Sans condition.** Une case permet de « Proposer à tout le monde, sans condition ». Une règle sans condition s'applique à chaque prospect. Si le funnel n'a aucune question, la règle s'applique aussi à tout le monde.

**Les produits proposés.** On coche au moins un produit du catalogue du funnel. Un produit désactivé n'apparaît pas dans les suggestions, même s'il est coché dans la règle.

**Le nom interne, la priorité, le titre et la description.** Le nom interne sert à l'équipe (« Entrepôt charge lourde »). Le titre et la description sont ce que lit le prospect (« Pour vos palettes en charge lourde »). La priorité est un nombre : plus il est élevé, plus le bloc passe devant.

**La limite.** C'est le détail qui change tout : le prospect voit au maximum trois règles, celles qui correspondent à ses réponses et qui ont la priorité la plus haute. Chaque bloc peut contenir plusieurs produits, mais il n'y a jamais plus de trois blocs.

## Pourquoi « montrer tout le catalogue » ne marche pas

On cite souvent l'étude des confitures d'Iyengar et Lepper (2000) : plus de choix sur le stand, moins d'achats. Il faut la citer avec prudence. Une méta-analyse de Scheibehenne, Greifeneder et Todd (2010), sur 50 expériences, trouve un effet moyen proche de zéro, avec de grosses différences d'une étude à l'autre. Autrement dit, « moins de choix » n'est pas une loi.

En devis B2B, la question est ailleurs. Votre prospect ne flâne pas : il veut savoir si vous avez la solution pour son cas. Trois propositions qui collent à ses réponses lui disent « on a compris ». Onze produits en vrac lui disent « débrouillez-vous », et votre commercial récupère un choix produit à refaire.

## Méthode en cinq étapes pour écrire vos règles

### 1. Partir des questions qui changent vraiment la proposition

Prenez vos questions de cadrage une par une et posez-vous une seule question : est-ce que la réponse change le produit que je proposerais ? Dans le template rayonnage, le type d'espace, la surface, la hauteur et la charge changent tout. Une question qui ne change ni la proposition ni le chiffrage mérite d'être remise en cause. Voir aussi [formulaire contact vs funnel de devis](https://www.quotebuilder.co/blog/formulaire-contact-vs-funnel-devis-b2b).

### 2. Écrire la matrice sur papier avant d'ouvrir l'outil

Deux colonnes : à gauche les combinaisons de réponses, à droite les produits que vous proposeriez au téléphone. Si deux personnes de l'équipe ne remplissent pas la même ligne pareil, réglez le désaccord ici, pas dans l'outil.

### 3. Une règle égale un cas lisible

Évitez la règle fourre-tout avec six conditions. Préférez trois règles courtes avec un nom interne parlant. Le jour où un produit sort du catalogue, vous saurez quelles règles revoir.

### 4. Régler la priorité : du spécifique au général

Comme seules trois règles s'affichent, la priorité n'est pas un détail. Une pratique simple : les règles très ciblées en priorité haute (20), les règles par grand segment au milieu (10), une règle filet « pour tout le monde » en priorité 0. Le filet garantit que l'écran n'est jamais vide, et il passe derrière dès qu'une règle plus précise correspond.

### 5. Tester avec cinq vrais briefs

Reprenez cinq demandes récentes, gagnées ou perdues, et remplissez le funnel public avec leurs réponses. Si votre meilleur commercial aurait proposé autre chose que ce qui s'affiche, la règle est à revoir. Vingt minutes, et des semaines de suggestions à côté évitées.

<!-- PLACEHOLDER IMAGE: matrice réponses vers produits suggérés, rayonnage (shoot Content) -->

## Exemples de règles par métier

Les questions reprennent celles des templates QuoteBuilder. Les produits sont des exemples : le catalogue reste le vôtre.

### Rayonnage (template « Configurateur projet »)

| Nom interne | Si | Alors proposer | Priorité |
|-------------|----|----------------|----------|
| Entrepôt charge lourde | Type d'espace est Entrepôt, et Charge par niveau est Lourde | Palettier, lisses renforcées, protections d'échelles | 20 |
| Grande surface | Surface est au moins 1000 | Palettier, étude d'implantation | 10 |
| Archives | Type d'espace est Archives | Rayonnage léger, rayonnage mobile | 10 |
| Filet | Pour tout le monde | Rayonnage polyvalent | 0 |

### Paysagiste (template « Paysagiste »)

Ici, l'usage principal est un choix multiple (« Terrasse / salon d'été », « Pelouse / massifs », « Tour de piscine », « Jardin complet »). On utilise donc « inclut ».

| Nom interne | Si | Alors proposer | Priorité |
|-------------|----|----------------|----------|
| Terrasse | Usage inclut Terrasse / salon d'été | Terrasse bois, dallage, éclairage extérieur | 20 |
| Piscine | Usage inclut Tour de piscine | Plage de piscine, haie brise-vue | 20 |
| Peu d'entretien | Niveau d'entretien est Minimal | Massifs faible entretien, paillage, arrosage goutte à goutte | 10 |
| Grand terrain | Surface est au moins 500 | Engazonnement, arrosage automatique | 10 |

La page [funnel de devis paysagiste](https://www.quotebuilder.co/secteurs/funnel-devis-paysagiste-amenagement-jardin) détaille ce parcours.

**« Inclut » ou « est parmi » ?** « Inclut » sert quand la question accepte plusieurs réponses : la condition est vraie si la valeur fait partie des cases cochées. « Est parmi » sert quand la question n'a qu'une réponse : la condition est vraie si cette réponse fait partie de votre liste.


**Écrire vos trois premières règles ce matin :** [compte Free](https://www.quotebuilder.co/signup?plan=free), puis Produits, onglet Règles. Pour chiffrer l'enjeu avant de vous lancer : [estimateur valeur des produits suggérés](https://www.quotebuilder.co/outils/estimateur-valeur-produits-suggeres-devis).


## Options, variantes, produits liés : qui fait quoi

**Les règles** choisissent quels produits suggérer, selon les réponses du prospect. C'est ce qui précède.

**Les options et variantes** sont portées par le produit lui-même : finition, dimension, essence, couleur. Le prospect les ajuste à l'étape « Personnalisation », avec les quantités. Une règle ne crée pas d'option. Pour structurer ce que le prospect compare, voir [options, variantes et alternatives sur un devis B2B](https://www.quotebuilder.co/blog/options-variantes-alternatives-devis-b2b).

**Les produits liés** concernent surtout les boutiques WooCommerce reliées par le plugin WordPress. Sur la fiche produit, un bloc « Souvent demandé avec » (titre modifiable) peut afficher des compléments. Ils sont classés à partir de vos réglages Woo : les montées en gamme (up-sells) d'abord, puis les ventes croisées (cross-sells), puis les produits de même catégorie. On peut en afficher de 1 à 8, 4 par défaut. Ces liens se configurent dans l'onglet « Produits liés » de WooCommerce ([documentation WooCommerce](https://woocommerce.com/document/related-products-up-sells-and-cross-sells/)). Pour le lien entre boutique et devis : [synchroniser le catalogue WooCommerce / Shopify](https://www.quotebuilder.co/blog/sync-catalogue-woocommerce-shopify-parcours-devis).

**Et les kits ?** Il n'y a pas de kits ni de bundles dans QuoteBuilder. Si vous vendez souvent A et B ensemble, mettez les deux produits dans la même règle, ou faites de B une option de A. Le prospect garde la main sur ce qu'il retient.

## Les erreurs qui rendent l'écran de suggestions confus

1. **Trop de règles « pour tout le monde ».** Avec la limite de trois blocs, le prospect voit toujours les mêmes produits, quelles que soient ses réponses. Une seule règle filet suffit.
2. **Toutes les règles à priorité 0.** Vous ne maîtrisez plus l'ordre. Donnez aux cas précis une priorité plus haute.
3. **Une question modifiée sans revoir les règles.** Changez la clé d'une question ou ses valeurs de réponse, et les conditions liées ne correspondent plus. Relisez l'onglet Règles après chaque retouche du funnel.
4. **Un produit désactivé oublié.** Il disparaît des suggestions sans prévenir. Si la règle ne contenait que lui, le bloc s'affiche sans produit à retenir.
5. **Vouloir faire du branchement avec des règles.** Les étapes restent en ordre fixe. Une règle ne masque pas une question.
6. **Le nom interne affiché au prospect.** « Règle B2 lourde » n'a rien à faire à l'écran. Remplissez le titre vu par le prospect.
7. **Promettre un prix ferme.** La fourchette affichée est indicative, en euros entiers, sans détail HT / TVA / TTC. Le devis reste le vôtre.
8. **Confondre suggestion et score.** Le score Hot / Warm / Cold est une formule fixe calculée à la soumission (surface, load, access, project_type, constraints, longueur du besoin). Les règles ne le modifient pas. Photos, zone et urgence n'y entrent pas. Voir [score d'une demande de devis](https://www.quotebuilder.co/blog/score-demande-devis-b2b).

## Ce que des suggestions bien réglées changent pour le commercial

Le premier appel change. Au lieu de « vous cherchez quoi exactement ? », le commercial part de ce que le prospect a retenu et discute variantes et contraintes.

Ça ne remplace pas la qualification : un prospect peut cocher un palettier sans budget ni décideur ([qualifier une demande avant chiffrage](https://www.quotebuilder.co/blog/qualifier-demande-devis-avant-chiffrage)). La règle propose, le commercial ajuste ensuite avec le prospect.

Rappel : un dossier naît du funnel public, de `/api/leads`, d'un plugin, de l'agent chat ou d'un lien préfill envoyé par un commercial ([préremplir via URL](https://www.quotebuilder.co/blog/preremplir-devis-url-parametres)). Il n'y a pas de saisie manuelle de devis. Les suggestions jouent là où le prospect remplit lui-même le parcours.

## Mesurer si vos règles servent

Une revue mensuelle de 30 minutes, quatre chiffres :

1. **Part des dossiers où le prospect a retenu au moins un produit suggéré.** Si elle est très basse, vos règles proposent à côté.
2. **Questions de clarification sur le choix produit** au premier appel. Elles doivent baisser.
3. **Écart entre ce qui est suggéré et ce qui part au devis final.** Un écart systématique sur un segment signale une règle à réécrire.
4. **Gagné / (Gagné + Perdu)** sur les dossiers avec et sans produit suggéré retenu. À lire avec prudence sur de petits volumes.

Pour mettre un ordre de grandeur en euros sur l'amélioration de vos règles, l'[estimateur valeur des produits suggérés](https://www.quotebuilder.co/outils/estimateur-valeur-produits-suggeres-devis) part de vos propres chiffres : demandes par mois, part actuelle et part visée de suggestions retenues, valeur moyenne ajoutée, taux de transformation. Calcul local, indicatif. Si le sujet est plutôt le temps passé à composer les devis, voir aussi l'[estimateur gain de temps catalogue](https://www.quotebuilder.co/outils/estimateur-gain-temps-catalogue-devis).

## Mise en place en une semaine

- **Lundi :** listez les questions qui changent la proposition.
- **Mardi :** remplissez la matrice avec le commercial qui vend le mieux.
- **Mercredi :** créez trois à six règles, plus une règle filet en priorité 0, avec de vrais titres pour le prospect.
- **Jeudi :** testez cinq vrais briefs, corrigez les priorités.
- **Vendredi :** mettez en ligne et notez la part de dossiers avec suggestion retenue.

Ensuite, relisez les règles à chaque changement de catalogue ou de questions.

## FAQ

### 1. Une règle de suggestion peut-elle faire sauter une étape du funnel ?

Non. Les étapes et les questions suivent un ordre fixe. Les règles Si/Alors choisissent seulement les produits proposés à l'écran « Solutions recommandées ».

### 2. Peut-on combiner plusieurs conditions dans une règle ?

Oui, et elles doivent toutes être vraies. Pour exprimer un OU, créez deux règles ou utilisez « est parmi » sur une même question.

### 3. Combien de suggestions le prospect voit-il ?

Au maximum trois blocs, c'est-à-dire trois règles : celles qui correspondent à ses réponses, triées par priorité décroissante. Chaque bloc peut contenir plusieurs produits.

### 4. Quelle différence entre « inclut » et « est parmi » ?

« Inclut » pour une question à choix multiples : la valeur doit faire partie des réponses cochées. « Est parmi » pour une question à réponse unique : la réponse doit faire partie de votre liste.

### 5. Que se passe-t-il si aucune règle ne correspond ?

L'écran n'a rien à proposer pour ce prospect. C'est pour ça qu'on garde une règle filet « pour tout le monde » en priorité 0.

### 6. Les règles modifient-elles le prix ou le score ?

Non. Le prix reste une fourchette indicative min-max en euros entiers. Le score Hot / Warm / Cold est une formule fixe calculée à la soumission, non configurable.

### 7. Peut-on proposer un kit ou un pack ?

Il n'y a pas de kits ni de bundles dans QuoteBuilder. Mettez plusieurs produits dans la même règle, ou faites d'un complément une option du produit principal.

### 8. D'où viennent les produits liés ?

Pour une boutique WooCommerce reliée par le plugin WordPress, des up-sells, cross-sells et produits de même catégorie définis dans Woo. Le bloc « Souvent demandé avec » en affiche de 1 à 8, 4 par défaut.

### 9. Qui peut créer ou modifier les règles ?

Un administrateur de l'espace, dans Produits, onglet Règles. Les autres membres ne gèrent pas les règles.

### 10. Le mode chat utilise-t-il les mêmes règles ?

Oui pour l'évaluation : les réponses extraites de la conversation comptent. Si une réponse existe aussi dans le formulaire, c'est celle du formulaire qui prime.


**Passer d'un catalogue en vrac à trois propositions qui collent :** [créer un compte Free](https://www.quotebuilder.co/signup?plan=free) · [voir la démo rayonnage](https://www.quotebuilder.co/c/demo/rayonnage) · [fonctionnalité catalogue](https://www.quotebuilder.co/fonctionnalites/catalogue).


## Sources

- Iyengar, S. S. et Lepper, M. R. (2000). When choice is demotivating: Can one desire too much of a good thing? *Journal of Personality and Social Psychology*, 79(6), 995-1006. https://doi.org/10.1037/0022-3514.79.6.995
- Scheibehenne, B., Greifeneder, R. et Todd, P. M. (2010). Can there ever be too many options? A meta-analytic review of choice overload. *Journal of Consumer Research*, 37(3), 409-425. https://doi.org/10.1086/651235
- WooCommerce, « Set up Related Products, Up-Sells and Cross-Sells ». https://woocommerce.com/document/related-products-up-sells-and-cross-sells/

## Pour aller plus loin

- [Options, variantes et alternatives sur un devis B2B](https://www.quotebuilder.co/blog/options-variantes-alternatives-devis-b2b)
- [Formulaire contact vs funnel de devis B2B](https://www.quotebuilder.co/blog/formulaire-contact-vs-funnel-devis-b2b)
- [Fiche produit B2B et devis unifié](https://www.quotebuilder.co/blog/fiche-produit-b2b-devis-unifie)
- [Funnel de devis paysagiste](https://www.quotebuilder.co/secteurs/funnel-devis-paysagiste-amenagement-jardin)
- [Funnel de devis rayonnage et stockage](https://www.quotebuilder.co/secteurs/funnel-devis-rayonnage-stockage)
- [Fonctionnalité funnel](https://www.quotebuilder.co/fonctionnalites/funnel)
