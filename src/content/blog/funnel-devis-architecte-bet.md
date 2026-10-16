---
title: "Funnel de devis architecte et BET : une demande avec le type de mission, pas un appel à vide"
slug: funnel-devis-architecte-bet
description: "Landing SEO architectes et bureaux d'études : template Architecte / BET de QuoteBuilder, questions à ajouter, catalogue de missions, règles Si/Alors, score Cold, plan PDF, relecteurs. Sans fonction inventée."
canonical: /secteurs/funnel-devis-architecte-bet
locale: fr-FR
word_count_target: 2500
keywords:
  - devis architecte
  - demande de devis BET
  - funnel devis architecte
  - formulaire mission architecte
  - devis bureau d'études
author: QuoteBuilder
date: 2026-10-13
updated: 2026-10-13
sector: architecte-bet
---

# Funnel de devis architecte et BET : une demande avec le type de mission, pas un appel à vide

« Bonjour, on a un terrain, vous pouvez passer ? » Pas de type de mission, pas de surface, pas de maître d'ouvrage, pas un plan. L'agence rappelle, tombe sur un chantier, renvoie trois questions par email, et reçoit un PDF de 40 Mo que la boîte refuse. Pendant ce temps, le maître d'ouvrage a écrit à deux autres cabinets.

Un architecte ou un bureau d'études chiffre quand il sait quelle mission on lui demande, sur quoi, pour qui, et pour quand. Le problème n'est pas le barème d'honoraires. C'est la demande qui arrive vide. Voici ce que pose le template « Architecte / BET » de QuoteBuilder, tel qu'il existe, ce qu'il faut lui ajouter, et ce qu'il ne fera pas à votre place.

**Essayer le template Architecte / BET :** [créer un compte Free](https://www.quotebuilder.co/signup?plan=free), puis créer un funnel et choisir « Architecte / BET » dans la famille Immobilier et construction. L'identifiant du template est `property_architect`. Le funnel créé s'appelle par défaut « Funnel architecte », en type formulaire. Pour voir d'abord un parcours public complet, sur un autre métier : [démo funnel rayonnage](https://www.quotebuilder.co/c/demo/rayonnage).

## Ce qu'une demande de mission doit contenir

Avant l'outil, la liste des informations sans lesquelles une proposition d'honoraires se fait sur une hypothèse :

- **Le type de mission.** Conception et permis, suivi de chantier, étude technique, ou un mélange. Ce n'est pas le même travail, ni le même contrat.
- **L'objet.** Construction neuve, extension, réhabilitation, local tertiaire, logement, ERP. « Une maison » ne dit pas si le permis est déjà déposé.
- **La surface.** Surface de plancher, emprise, ou au moins un ordre de grandeur. Elle change le temps d'étude, et parfois l'obligation de recourir à un architecte.
- **Le lieu.** Commune, règles locales, accès. Un terrain en zone tendue et une grange isolée ne se chiffrent pas pareil.
- **Le maître d'ouvrage.** Particulier, société, collectivité. Celui qui écrit n'est pas toujours celui qui signe.
- **L'existant.** Un plan, un relevé, des photos, un diagnostic. Sans pièce, la première visite sert à mesurer.
- **L'échéance.** Dépôt de permis, début de travaux, simple renseignement.
- **Le périmètre des autres intervenants.** Un BET structure déjà désigné, un géomètre à prévoir, une mission limitée au permis.
- **Le budget du projet**, quand il existe. Ce n'est pas vos honoraires. C'est l'enveloppe de travaux, et elle évite de dessiner hors sol.

Aucune de ces questions n'est compliquée. On ne les pose pas toutes au premier coup de fil, et on les pose dans le désordre.

La loi du 3 janvier 1977 sur l'architecture impose, pour les travaux soumis à autorisation de construire, le recours à un architecte pour établir le projet architectural, avec des dérogations. L'article 4 plafonne à 150 m² de surface de plancher le décret qui définit les constructions de faible importance pour les particuliers, hors agricole. Le seuil applicable est celui du décret en vigueur, pas une case du template. Un funnel ne vérifie pas si le recours est obligatoire. Il peut seulement demander la surface et la qualité du maître d'ouvrage, pour que vous le voyiez avant le rendez-vous.

## Le template Architecte / BET dans QuoteBuilder

Le template est dans la famille « Immobilier et construction », à côté de « Promoteur » et « Géomètre ». Le funnel créé est un formulaire en quatre étapes. Le sous-titre du template, dans le code, parle d'un brief de mission plutôt que d'un appel à vide. Les questions, elles, sont plus courtes que cette promesse.

**1. Votre mission** (« Type de mission et échéance »). Trois questions :

- « Type de mission », choix visuel obligatoire : Conception / PC, Suivi de chantier, Étude / BET, Autre. Les valeurs stockées sont `design`, `site`, `study`, `other`.
- « Contexte », champ texte facultatif, avec l'aide « Objectif, contraintes, déjà en place » et l'exemple « Décrivez en une phrase ». La clé stockée est `notes`.
- « Échéance », liste facultative : Dès que possible, Dans le mois, Ce trimestre, Je me renseigne. La clé est `timeline`.

**2. Solutions recommandées** (« Missions types »). Le prospect voit les missions que vos règles lui proposent, trois au maximum. Le template ne crée ni mission ni règle. Tant que le catalogue et les règles sont vides, cette étape ne propose rien.

**3. Personnalisation** (« Quantités, options et précisions »). Pour chaque mission retenue, une quantité (Qté) et les options que vous avez définies sur le produit, plus une zone de dépôt libellée « Plan (PDF ou image) ». Le sélecteur propose PDF, JPEG, PNG et WebP, jusqu'à 10 Mo. Malgré le sous-titre « précisions », cette étape n'a pas de champ texte libre.

**4. Vos coordonnées** (« Recevez le récapitulatif de votre projet »). Nom, email, téléphone, société, et une case de consentement marketing, décochée. La case concerne des offres ultérieures. Elle n'est pas nécessaire pour envoyer la demande.

Ce que le template ne demande pas : la surface, l'adresse, le maître d'ouvrage, le budget de travaux, la nature neuve ou réhabilitation, la liste des lots techniques. Le mot « volume » n'apparaît pas dans les questions. Tout cela s'ajoute.

Le funnel avance en ordre fixe. Chaque prospect voit les mêmes étapes, dans le même ordre. Il n'existe pas de branchement d'étapes. Une question « surface de plancher » apparaît aussi pour un suivi de chantier. Les règles Si/Alors choisissent les missions suggérées. Elles ne sautent pas une étape et n'en affichent pas une autre. Le branchement entre étapes est une évolution prévue plus tard, pas une option du template.

## Adapter le template à l'agence ou au BET

Le template est un point de départ. Les ajouts qui changent le plus la qualité des demandes :

**Surface approximative**, question de type nombre. Ajoutée dans le constructeur, elle reçoit une clé automatique (par exemple `number_x7k2p9`) que la formule de score ne lit pas : le score ne bougera pas (voir plus bas). Demandez une surface de plancher ou une emprise, avec l'unité dans le libellé. Rendez-la facultative si beaucoup de prospects ne la connaissent pas encore : un champ obligatoire vide fait abandonner.

**Nature de l'opération**, liste : Neuf, Extension, Réhabilitation, Aménagement intérieur, Autre. Le template n'a pas cette question. « Conception / PC » ne dit pas si le bâtiment existe.

**Maître d'ouvrage**, liste : Particulier, Société, Collectivité, Autre. Utile pour savoir qui décide, et pour ne pas mélanger un permis de maison et une consultation de marché public. QuoteBuilder ne produit pas un dossier de consultation, ni un acte d'engagement.

**Commune ou adresse**, texte court. Une phrase suffit pour préparer le rendez-vous. Le funnel n'a pas de carte.

**Budget travaux indicatif**, liste de fourchettes que vous rédigez, ou texte libre. Ce n'est pas le prix de votre mission. Ne le rendez pas obligatoire : beaucoup de maîtres d'ouvrage ne veulent pas le dire au premier contact, ou ne l'ont pas.

**Lots ou disciplines**, pour un BET : Structure, Fluides, Thermique, Acoustique, Électricité, VRD, Autre. Le choix unique « Étude / BET » du template ne distingue pas un bureau de structure d'un bureau fluides. Une question à choix multiples, si vous en ajoutez une, se stocke comme une liste. Une règle « contient » pourra chercher une valeur.

**Mission déjà engagée ailleurs**, texte court ou oui / non. « On a déjà l'architecte, on cherche le BET structure » évite de proposer une mission complète de conception.

Gardez obligatoires seulement les questions sans lesquelles vous ne savez pas rappeler : le type de mission, et un moyen de vous joindre. Le reste peut être facultatif. Une demande incomplète mais envoyée vaut mieux qu'un abandon à la troisième question.

## Catalogue : des missions, pas un barème caché

Le template ne crée aucun produit. Vous ajoutez vos missions dans le catalogue : esquisse, permis de construire, mission complète, suivi de chantier, étude de structure, note thermique, visa d'exécution. Chaque produit a un nom, un prix, des options.

Trois façons de mettre un prix, et pas plus. Un prix fixe : minimum et maximum identiques. Une fourchette : deux montants. « Sur devis » : les deux montants vides. Il n'y a pas de TVA dans QuoteBuilder, pas de HT, pas de TTC. La fourchette affichée est indicative, en euros entiers (un montant inférieur à 1 € garde les centimes). Le pied de page du PDF est un texte libre, à vous de l'écrire.

La quantité choisie par le prospect multiplie le prix unitaire de la ligne. Pour une mission forfaitaire, laissez la quantité à 1, ou expliquez dans le libellé ce que la quantité veut dire (un bâtiment, une phase). Il n'y a pas de prix dégressif selon la surface. Si vous voulez deux niveaux d'honoraires, faites deux produits, ou une fourchette large, et une règle qui propose l'un ou l'autre.

Les options (par exemple « rendu : esquisse / permis ») sont des listes sur le produit. Elles ne changent pas le montant de la ligne. Le calcul lit le prix unitaire et la quantité. Si une option doit changer le prix, ce n'est pas une option : c'est un autre produit, ou une fourchette qui couvre les deux cas. Le prospect peut retirer une ligne. Il ne peut pas inventer une mission absente du catalogue : il ajuste la quantité et les options des lignes proposées. Ce template est un formulaire.

Le récapitulatif n'est pas un contrat de maîtrise d'œuvre. Il n'a pas de signature en ligne, pas de date de validité, pas de clause de propriété intellectuelle, pas de répartition des missions entre architecte et BET. Vous rédigez le contrat dans votre outil habituel, avec les réponses sous les yeux. La loi de 1977 décrit le projet architectural (implantation, composition, volume, matériaux). Elle ne dit pas qu'un récapitulatif de funnel en tient lieu.

## Règles Si/Alors : suggérer une mission, pas changer le parcours

Une règle a des conditions sur les réponses, une priorité, et une liste de produits. Le prospect en voit trois au plus, les plus prioritaires parmi celles qui matchent. Une règle sans condition matche tout le monde : à éviter si vous voulez distinguer les missions.

Exemples que vous pouvez créer, ce ne sont pas des règles livrées avec le template :

- Type de mission est Conception / PC (`project_type` égal à `design`) : proposer la mission permis et, si vous l'avez, une mission partielle esquisse.
- Type de mission est Suivi de chantier (`site`) : proposer le suivi, pas la mission complète de conception.
- Type de mission est Étude / BET (`study`) : proposer les études que vous vendez vraiment (structure, fluides), pas une mission d'architecte.
- Type de mission est Autre : ne rien forcer, ou proposer un échange. « Autre » est une réponse honnête, pas un défaut à punir.

Les opérateurs des règles de suggestion sont : égal, différent, supérieur ou égal, inférieur ou égal, dans une liste, contient. « Contient » s'applique à une réponse qui est une liste (plusieurs cases), pas à un texte libre. Si vous ajoutez une question de surface (type Mesure), une règle « surface supérieure ou égale à 150 » peut proposer une mission plus longue. Cela ne cache pas l'étape suivante.

Le template n'a pas de branche entre étapes. Vous ne pouvez pas montrer « lots techniques » seulement quand la mission est Étude / BET. Posez la question à tout le monde, ou acceptez qu'un suivi de chantier voie aussi cette question. Formulez-la pour qu'elle reste compréhensible dans les quatre cas (« des études techniques sont-elles déjà prévues ? »).

## Pourquoi ces dossiers sortent Cold

Le score part de 30 points. Il devient warm à 45 et hot à 70. Il lit la surface (`surface`), la charge (`load`), une fréquence de prélèvement (`access`, pensée pour le rayonnage, pas pour l'accès chantier), un type de projet seulement s'il vaut `entrepot`, `cuisine_pro` ou `commerce`, une contrainte réelle, et la longueur d'un texte `need` ou `besoin`.

Le template Architecte / BET n'a aucune de ces clés. Son type de mission est `design`, `site`, `study` ou `other` : aucun n'ajoute les 10 points réservés à l'entrepôt, à la cuisine pro ou au commerce. Le contexte est stocké dans `notes`, pas dans `need`. Même un long paragraphe ne compte pas. L'échéance ne compte pas.

Résultat, tel que le template est livré : chaque demande sort à 30 points, libellé cold. Ce n'est pas un jugement sur la mission. C'est la formule, fixe, non réglable, appliquée à des réponses qu'elle ne connaît pas. Triez sur le type de mission et l'échéance, pas sur la pastille.

Seule une question de clé exactement `surface`, créée par l'API ou les outils MCP (le constructeur ne permet pas de choisir la clé), fait bouger le score : un peu dès que la surface est supérieure à 0, davantage à partir de 100, encore plus à partir de 400. Ce n'est pas un barème d'honoraires. C'est le même barème que pour un entrepôt. À 400 m² vous gagnez 25 points, ce qui peut faire passer le dossier en warm (30 + 25 = 55), toujours pas en hot. N'ajoutez pas cette clé seulement pour « réveiller » le score. Ajoutez-la si la surface vous sert, et lisez la pastille en sachant d'où elle vient.

Le score est calculé à la soumission et stocké. Un segment ou une campagne qui filtre « hot » ne verra pas ces dossiers. Ce n'est pas le sujet de cette page, mais c'est la raison pour laquelle un envoi groupé aux « chauds » rate une agence qui n'a que ce template. Le détail des campagnes est dans [segments et campagnes email](https://www.quotebuilder.co/blog/segments-campagnes-email-demande-devis-b2b).

## Le plan : 10 Mo, pas un champ texte

À l'étape Personnalisation, la zone s'appelle « Plan (PDF ou image) ». Le prospect dépose un fichier. Le sélecteur du navigateur est limité à PDF, JPEG, PNG et WebP. L'envoi refuse au-delà de 10 Mo. Il n'y a pas, sur cette étape, de zone pour écrire « le mur mitoyen est à reprendre » ou coller un lien vers un dossier WeTransfer. Le sous-titre « précisions » ne crée pas ce champ.

Pour un texte, il reste le champ Contexte de la première étape, facultatif, prévu pour une phrase. Pour un fichier plus tard, le contact principal peut revenir sur son espace prospect, rubrique « Compléter la demande » : une note optionnelle et un fichier, toujours dans la limite de 10 Mo. Un relecteur invité ne dépose pas ce fichier. L'espace est réservé au contact principal pour cet envoi.

Un DWG, un IFC ou une archive zip ne font pas partie des types proposés dans le sélecteur de l'étape Personnalisation. Si vos clients n'ont que ça, demandez un PDF d'export, ou un lien dans le champ Contexte. N'annoncez pas un dépôt de maquette numérique.

Les photos de l'existant passent par la même zone, une à la fois, dans les types image acceptés. Ce n'est pas une galerie illimitée.

## Après l'envoi : dossier, notes, relecteurs

La demande arrive dans la liste, avec un statut. Les sept statuts prévus sont : Commencée, Nouveau, Contacté, En cours, Gagné, Perdu, En attente. Nouveau est le statut par défaut d'une demande envoyée. Vous pouvez assigner un collaborateur. L'assignation ne se déduit pas du type de mission : vous la faites, ou un parcours d'Autopilote la fait si vous l'avez dessinée.

Les notes internes sont un texte ajouté sur le dossier, visible par l'équipe, séparé du fil que voit le prospect. On ajoute une note. On ne la réédite pas dans l'écran : elle s'affiche telle qu'elle a été écrite. Ce n'est pas un fil de discussion, et ce n'est pas un compte-rendu de chantier.

L'espace prospect donne au contact un lien vers le récapitulatif. Il peut inviter des relecteurs (un associé, un maître d'ouvrage, un économiste). Chaque relecteur reçoit son lien, valable 30 jours, vers la même page. Il peut consulter, commenter, indiquer un budget maximum, valider ou demander des modifications. Ce n'est pas une signature de contrat. Le passage à Gagné reste un geste de votre côté, sur le statut du dossier.

Il n'y a pas de validité produit sur la mission : pas de date « offre valable 30 jours » posée par le catalogue. Si vous voulez une durée, écrivez-la dans le contrat : le pied de page du PDF est fixe. Le PDF du funnel est un récapitulatif de configuration, pas un devis d'honoraires au sens de votre ordre ou de votre assureur.

L'Autopilote peut confirmer la demande et relancer si le dossier reste ouvert. Ce n'est pas une relance d'honoraires impayés, et ce n'est pas une newsletter. Pour un envoi groupé aux maîtres d'ouvrage qui ont déjà une demande, passez par les segments, avec leur consentement marketing. Le cadre est dans l'article sur les [segments et campagnes](https://www.quotebuilder.co/blog/segments-campagnes-email-demande-devis-b2b).

## Parcours type : du premier message au statut Gagné

Hypothèse d'illustration, sans chiffre de référence et sans barème d'honoraires :

1. Un maître d'ouvrage arrive sur votre page « permis de construire » et ouvre le funnel.
2. Il choisit « Conception / PC », écrit dans Contexte « extension, maison des années 70, PLU en zone UC », échéance « Dans le mois ». Vous avez ajouté une surface (180) et « Réhabilitation / extension ».
3. La règle « Type de mission est Conception / PC » lui propose deux missions. Il en garde une, quantité 1, et dépose un plan de l'existant en PDF, sous 10 Mo.
4. Il laisse ses coordonnées, ne coche pas la case marketing, et envoie. Le dossier arrive au statut Nouveau, à 30 points, sauf si une question de clé `surface` a été créée par l'API. Il n'est pas hot pour autant.
5. L'architecte ouvre la fiche, voit le type de mission et le plan, passe le dossier en Contacté, ajoute une note interne « vérifier le recul en limite ».
6. Il rédige la proposition d'honoraires dans son outil habituel.
7. Le maître d'ouvrage invite son conjoint ou son associé comme relecteur, lien 30 jours.
8. Une fois l'accord obtenu en dehors de QuoteBuilder, le dossier passe Gagné.

La case marketing non cochée n'empêche pas ce parcours. Elle empêche une campagne ultérieure vers cette adresse. C'est le comportement voulu.

## Architecte, promoteur ou géomètre

Les trois templates de la famille Immobilier et construction partagent la même ossature : un choix visuel, un contexte, une échéance, puis les suggestions, la personnalisation et les coordonnées. Choisissez Architecte / BET si vous vendez une mission de conception, de suivi ou d'étude. Le template Promoteur parle de programme neuf, d'investissement et de résidence principale. Le template Géomètre parle de bornage, de topographie et de copropriété. Si votre activité principale est le relevé de terrain, partez du géomètre. Si vous vendez des logements, partez du promoteur. Vous pouvez dupliquer les questions ensuite. La duplication d'un funnel entier n'est pas une fonction livrée : vous recréez, ou vous modifiez celui que le template a créé.

Un cabinet qui fait à la fois le permis et le suivi peut rester sur un seul funnel, avec les quatre types de mission, et des règles qui proposent la bonne mission. Deux funnels (un public « permis », un autre « BET structure ») sont utiles si les questions à ajouter divergent trop. Le plan Free n'en inclut qu'un. Les plans payants en incluent davantage. Voir [Tarifs](https://www.quotebuilder.co/tarifs).

## Erreurs fréquentes

- **Garder le template tel quel.** Sans surface, sans lieu et sans nature d'opération, vous rappellerez chaque demandeur pour les mêmes questions.
- **Compter sur le score.** Tel quel, il vaut 30, cold, pour toutes les demandes de ce template.
- **Croire que le sous-titre « précisions » ajoute un texte.** La personnalisation a la quantité, les options et le plan. Pas de champ libre.
- **Mettre les honoraires dans une option.** L'option ne change pas le montant. Deux niveaux de mission, deux produits.
- **Envoyer le récapitulatif comme contrat.** Il n'a ni signature, ni validité, ni TVA, ni mission détaillée au sens de votre contrat type.
- **Annoncer un dépôt DWG ou un fichier de 30 Mo.** Le sélecteur parle de PDF et d'images, et la limite est 10 Mo.
- **Filtrer les campagnes sur Hot.** Ces dossiers n'y seront pas, sauf si vous avez ajouté des clés que la formule lit, et encore rarement au-dessus de 70.
- **Brancher une étape « seulement si BET ».** Les étapes ne se branchent pas. Les règles choisissent les produits suggérés.

**Recevoir des demandes de mission plus complètes :** [créer un compte Free](https://www.quotebuilder.co/signup?plan=free) · [voir la démo](https://www.quotebuilder.co/c/demo/rayonnage) · [lire les règles de suggestion](https://www.quotebuilder.co/blog/regles-suggestion-produits-funnel-devis-b2b).

## FAQ

### Existe-t-il un template architecte dans QuoteBuilder ?

Oui. Le template « Architecte / BET », identifiant `property_architect`, dans la famille Immobilier et construction. Il crée un formulaire nommé « Funnel architecte », en quatre étapes.

### Quelles missions le template propose-t-il ?

Aucune. Il pose le type de mission (Conception / PC, Suivi de chantier, Étude / BET, Autre), un contexte et une échéance. Les missions viennent de votre catalogue, via des règles que vous écrivez.

### Peut-on afficher des questions différentes pour le permis et pour le BET ?

Non. Les étapes sont en ordre fixe, sans branchement. Les règles choisissent seulement les missions suggérées. Posez des questions compréhensibles dans les quatre cas, ou faites deux funnels.

### Pourquoi les dossiers sont-ils Cold ?

La formule part de 30 et ne lit pas le type de mission, ni le champ Contexte (clé `notes`), ni l'échéance. Tel quel, chaque demande vaut 30 points, donc cold. Une question dont la clé est `surface` peut faire bouger le score. Ce n'est pas un réglage.

### Le client peut-il joindre un plan ?

Oui, à l'étape Personnalisation, zone « Plan (PDF ou image) », en PDF, JPEG, PNG ou WebP, jusqu'à 10 Mo. Il n'y a pas de champ texte libre sur cette étape. Plus tard, le contact principal peut ajouter un fichier depuis « Compléter la demande ».

### Les options changent-elles le prix ?

Non. Le montant d'une ligne est le prix unitaire multiplié par la quantité. Une option qui doit changer les honoraires est un autre produit, ou une fourchette.

### Le récapitulatif peut-il servir de contrat de maîtrise d'œuvre ?

Non. Il n'a ni signature en ligne, ni date de validité, ni TVA. Le contrat se rédige à part. Les relecteurs ont un lien de 30 jours pour consulter et commenter, pas pour signer à votre place.

### QuoteBuilder vérifie-t-il l'obligation de recourir à un architecte ?

Non. La loi du 3 janvier 1977 et son décret fixent les cas et les seuils. Le funnel peut demander une surface et la qualité du maître d'ouvrage. Il ne conclut pas à votre place.

### Les notes internes sont-elles modifiables ?

On ajoute une note en texte brut. L'écran l'affiche ensuite telle qu'elle a été écrite, sans édition. Elles restent internes à l'équipe.

### Faut-il un plan Pro pour ce funnel ?

Le template se choisit à la création du funnel. Le plan Free permet de voir l'interface, avec un funnel et un plafond de soumissions. Le détail des plans est sur la page Tarifs. Le template lui-même n'est pas réservé à un métier payant.

## Sources

- Loi n° 77-2 du 3 janvier 1977 sur l'architecture, notamment les articles 3 et 4 (recours à l'architecte, dérogations, plafond de 150 m² pour le décret visant les particuliers hors agricole). https://www.legifrance.gouv.fr/loda/id/JORFTEXT000000522423
- Ordre des architectes, « Dans quel cas le recours à l'architecte est-il obligatoire ? », qui renvoie à la loi de 1977 et au code de l'urbanisme. https://www.architectes.org/actualites/dans-quel-cas-le-recours-larchitecte-est-il-obligatoire-91255
- Loi n° 85-704 du 12 juillet 1985 (maîtrise d'ouvrage publique), citée par l'article 3 de la loi de 1977. Elle a été pour l'essentiel abrogée en 2018 et reprise dans le code de la commande publique. Le funnel ne produit pas les pièces de ce contrat. https://www.legifrance.gouv.fr/loda/id/JORFTEXT000000693683

## Pour aller plus loin

- [Règles de suggestion de produits](https://www.quotebuilder.co/blog/regles-suggestion-produits-funnel-devis-b2b)
- [Segments et campagnes email](https://www.quotebuilder.co/blog/segments-campagnes-email-demande-devis-b2b)
- [Score d'une demande de devis](https://www.quotebuilder.co/blog/score-demande-devis-b2b)
- [Pièces jointes, plans et photos](https://www.quotebuilder.co/blog/pieces-jointes-plans-photos-devis-b2b)
- [Approbation et relecteurs](https://www.quotebuilder.co/blog/approbation-client-multi-decideurs-devis-b2b)
- [Notes internes](https://www.quotebuilder.co/blog/notes-internes-dossier-devis-equipe-b2b)
- [Fourchette de prix indicative](https://www.quotebuilder.co/blog/fourchette-prix-indicative-demande-devis-b2b)
- [Créer un compte Free](https://www.quotebuilder.co/signup?plan=free)
