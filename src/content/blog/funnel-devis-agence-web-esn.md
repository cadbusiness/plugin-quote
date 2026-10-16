---
title: "Funnel de devis agence web et ESN : site, renfort, data, une demande cadrée avant le premier rendez-vous"
slug: funnel-devis-agence-web-esn
description: "Landing SEO agences web, ESN et studios de développement : template Agence / ESN de QuoteBuilder, questions à ajouter (budget, existant, forfait ou régie, décideurs), catalogue d'offres et de jours, règles Si/Alors par type de besoin, score Cold, cahier des charges en PDF, relecteurs DSI et achats. Sans fonction inventée."
canonical: /secteurs/funnel-devis-agence-web-esn
locale: fr-FR
word_count_target: 2600
keywords:
  - devis agence web
  - demande de devis site internet B2B
  - devis ESN
  - devis développement application
  - devis TMA régie forfait
  - funnel devis agence
author: QuoteBuilder
date: 2026-10-16
updated: 2026-10-16
sector: agence-web-esn
---

# Funnel de devis agence web et ESN : site, renfort, data, une demande cadrée avant le premier rendez-vous

« Bonjour, nous voudrions refaire notre site, pouvez-vous nous faire un devis ? » Pas d'adresse du site actuel, pas de budget, pas de date, pas un mot sur qui décide. L'agence propose un rendez-vous. Une heure de visio plus tard, elle apprend que le client veut un site e-commerce relié à son ERP, qu'il a déjà consulté trois agences, que le budget validé est la moitié de ce qu'il faudrait, et que la DSI n'a pas encore été mise dans la boucle. Le devis aurait pu être cadré dès le premier message si la demande avait contenu ces informations.

Une agence web ou une ESN chiffre quand elle sait ce qu'on lui demande, sur quel existant, avec quel budget, sous quel format de contrat, et qui signe. Voici ce que pose le template « Agence / ESN » de QuoteBuilder, tel qu'il existe, ce qu'il faut lui ajouter, et ce qu'il ne fera pas à votre place.

**Essayer le template Agence / ESN :** [créer un compte Free](https://www.quotebuilder.co/signup?plan=free), puis créer un funnel et choisir « Agence / ESN » dans la famille Tech et services. L'identifiant du template est `tech_agency`. Le funnel créé s'appelle par défaut « Funnel agence », en type formulaire. Pour voir d'abord un parcours public complet, sur un autre métier : [démo funnel rayonnage](https://www.quotebuilder.co/c/demo/rayonnage).

## Ce qu'une demande d'agence ou d'ESN doit contenir

Avant l'outil, la liste des informations sans lesquelles un devis d'agence repose sur une supposition :

1. **Le type de besoin.** Un site ou un produit à construire, un renfort d'équipe ou de la maintenance (TMA), un projet data ou système d'information. Ce ne sont ni les mêmes équipes, ni les mêmes contrats.
2. **L'existant.** Rien, un site à refaire, une application à faire évoluer, un outil interne à relier. Avec l'adresse du site ou le nom de l'outil, si elle existe.
3. **Le budget.** Même une tranche large. C'est la question la plus gênante à poser au téléphone, et la plus utile.
4. **Le format attendu.** Un forfait avec un périmètre et un prix, ou de la régie au jour. Le client ne connaît pas toujours la différence. Il sait s'il veut un prix fermé ou du temps.
5. **L'échéance.** Une date de lancement, un salon, la fin d'un contrat avec le prestataire actuel.
6. **Les décideurs.** Direction, métier, DSI, achats. Plus il y en a, plus le cycle est long.
7. **Le contexte d'achat.** Une seule agence consultée, plusieurs, ou un appel d'offres formel avec un cahier des charges.
8. **Les documents.** Cahier des charges, maquettes, export de l'arborescence actuelle.

Ce n'est pas une liste à imposer en entier. C'est la liste de ce qui manque le plus souvent au premier appel.

## Forfait, régie, cession de droits : ce qui change dans le devis

Trois sujets reviennent dans presque tous les devis d'agence ou d'ESN. Ils ne sont pas réglés par l'outil de demande, mais ils changent ce qu'il faut demander au client.

**Forfait ou régie.** Au forfait, vous vous engagez sur un résultat, un périmètre et un prix. En régie, vous facturez du temps passé, au jour, sur une mission que vous encadrez. Le Code du travail interdit toute opération à but lucratif ayant pour objet exclusif le prêt de main-d'œuvre, hors cas prévus (travail temporaire, notamment). C'est pourquoi un devis de régie décrit une prestation : un objet, des livrables ou des objectifs, et l'encadrement par votre équipe, pas seulement « un développeur pendant six mois ». Faites valider vos modèles par votre conseil.

**Cession de droits.** Le code, les maquettes, les textes et les visuels produits pour le client sont des créations. Le Code de la propriété intellectuelle subordonne la transmission des droits d'auteur à une mention distincte de chaque droit cédé, avec un domaine d'exploitation délimité quant à son étendue, sa destination, son lieu et sa durée. Une phrase vague du type « le client devient propriétaire du site » ne suffit pas toujours. Cela s'écrit dans votre contrat ou vos conditions, pas dans le formulaire de demande.

**Le périmètre.** Un devis au forfait tient si le périmètre est écrit. Une demande qui dit seulement « un site moderne » donnera un devis qui ne tiendra pas. C'est là que le funnel aide le plus : faire écrire au client, avant le premier rendez-vous, ce qu'il a vraiment en tête.

## Le template Agence / ESN dans QuoteBuilder

Le template est dans la famille « Tech et services », à côté de « Conseil » et « Logiciel sur mesure ». Le funnel créé est un formulaire en quatre étapes.

**1. Votre projet** (« Besoin, volume et échéance »). Trois questions :

- « Type de besoin », choix visuel obligatoire : Site / produit, Renfort / TMA, Data / SI, Autre. Les valeurs stockées sont `web`, `staff`, `data`, `other`.
- « Contexte », champ texte facultatif, avec l'exemple « Décrivez en une phrase » affiché dans le champ. La clé stockée est `notes`.
- « Échéance », liste facultative : Dès que possible, Dans le mois, Ce trimestre, Je me renseigne. La clé est `timeline`.

Le sous-titre de l'étape parle de volume, mais le template ne pose aucune question de volume. C'est la première chose à ajouter.

**2. Solutions recommandées** (« Offres adaptées »). Le client voit les offres que vos règles lui proposent, trois au maximum. Le template ne crée ni offre ni règle. Tant que le catalogue et les règles sont vides, l'étape affiche un message qui invite à continuer, et la demande peut toujours être envoyée.

**3. Personnalisation** (« Quantités, options et précisions »). Pour chaque offre retenue, une quantité (Qté) et les options que vous avez définies sur le produit, plus une zone de dépôt libellée « Plan (PDF ou image) ». Le sélecteur propose PDF, JPEG, PNG et WebP, jusqu'à 10 Mo. Cette étape n'a pas de champ texte libre, malgré le mot « précisions » dans le sous-titre.

**4. Vos coordonnées** (« Recevez le récapitulatif de votre projet »). Nom et email obligatoires, téléphone et société facultatifs, et une case de consentement marketing, décochée, qui n'est pas nécessaire pour envoyer la demande.

Ce que le template ne demande pas : le budget, l'existant, le format de contrat, le nombre de jours ou de profils, les décideurs, le contexte d'achat. Tout cela s'ajoute.

Le funnel avance en ordre fixe. Chaque client voit les mêmes étapes, dans le même ordre. Il n'existe pas de branchement : une question « Profils recherchés » pensée pour le renfort apparaît aussi pour un projet de site. Les règles Si/Alors choisissent les offres suggérées. Elles ne sautent pas une étape et n'en affichent pas une autre.

**Voir un parcours public complet :** la [démo funnel rayonnage](https://www.quotebuilder.co/c/demo/rayonnage) montre les mêmes quatre types d'écran (questions, suggestions, personnalisation, coordonnées) sur un autre métier, sans compte.

## Adapter le template à l'agence

Les questions se modifient dans le constructeur de parcours : libellé, texte d'aide, caractère obligatoire, ordre, choix. Le sous-titre de chaque étape se modifie aussi. Trois détails du constructeur à connaître avant de commencer :

- **Une question ajoutée est obligatoire par défaut.** Décochez « Requis » sur tout ce qui n'est pas indispensable.
- **Le texte d'aide ne s'affiche aujourd'hui que sous les choix visuels.** Pour une liste, un nombre ou un texte, mettez la consigne dans le libellé lui-même, ou dans le sous-titre de l'étape.
- **N'ajoutez pas de question de type « Fichier » pour le cahier des charges.** Dans le funnel public, ce type s'affiche aujourd'hui comme un simple champ texte. Le dépôt de fichiers passe par la zone « Plan (PDF ou image) » de l'étape Personnalisation.

Voici ce qu'une agence ou une ESN ajoute en général à la première étape.

**Budget envisagé**, liste : Moins de 10 000 €, 10 000 à 30 000 €, 30 000 à 80 000 €, Plus de 80 000 €, Pas encore défini. Ajustez les tranches à votre activité. Gardez « Pas encore défini » : un client qui n'a pas de budget le dit, et c'est une information.

**Votre existant**, liste : Rien pour l'instant, Un site ou un outil à refaire, Une application à faire évoluer, Un outil à relier à un autre.

**Adresse du site ou nom de l'outil actuel**, texte, facultatif. Dans le libellé, précisez « si vous en avez un ».

**Format souhaité**, liste : Prix forfaitaire, Régie au jour, Je ne sais pas, conseillez-moi. Un client qui coche « Je ne sais pas » vous dit qu'il faudra expliquer la différence au premier appel.

**Volume**, nombre, facultatif, avec l'unité dans le libellé : « Nombre de jours ou de profils, si vous le savez ». Pour un projet de site, ce champ restera vide, et ce n'est pas grave.

**Qui décide ?**, choix multiple : Direction, Équipe métier, DSI, Achats, Je décide seul. Plusieurs cases possibles.

**Contexte d'achat**, liste : Vous êtes notre seul contact, Nous consultons quelques prestataires, Appel d'offres avec cahier des charges.

Changez aussi le libellé « Contexte ». Pour une agence, « Votre projet en quelques lignes : objectif, utilisateurs, ce qui ne marche pas aujourd'hui » parle mieux que « Contexte ». C'est la question qui remplace la première heure de rendez-vous.

Gardez la liste courte. Chaque question ajoutée fait partir quelques clients avant la fin. Une demande à moitié remplie reste une demande abandonnée, avec une relance si l'email a été saisi. Rendez obligatoires le type de besoin et le budget, et laissez le reste facultatif.

## Catalogue : des offres et des jours, pas un barème caché

Chaque offre est un produit du [catalogue](https://www.quotebuilder.co/fonctionnalites/catalogue). Un produit a trois façons d'afficher un prix : un prix fixe (minimum et maximum identiques), une fourchette (deux montants), ou « Sur devis » (les deux vides). Il n'y a pas de TVA dans QuoteBuilder. Indiquez dans la description si vos montants sont HT.

Une base de catalogue pour une agence web ou une ESN, sans prix de référence :

| Offre | Affichage conseillé | Ce que la description doit dire |
|---|---|---|
| Atelier de cadrage | Prix fixe | Durée, participants, livrable (note de cadrage, arborescence) |
| Site vitrine | Fourchette | Ce qui fait varier le prix : nombre de pages, contenus fournis ou non, langues |
| Site e-commerce | Fourchette | Catalogue, paiement, connexions à l'ERP ou à la logistique |
| Application métier | Sur devis | Ce dont vous avez besoin pour chiffrer : utilisateurs, écrans, connexions |
| Refonte | Fourchette | Reprise des contenus, redirections, ce qui est conservé |
| Journée de développement, en régie | Prix fixe par jour | Profil, encadrement, lieu d'intervention |
| TMA mensuelle | Fourchette | Volume d'heures, délai de prise en charge, périmètre |
| Audit technique ou data | Prix fixe ou fourchette | Ce qui est audité, le rapport remis |

Le montant d'une ligne est le prix unitaire multiplié par la quantité. C'est pratique pour la régie : un produit « Journée de développement » à prix fixe, et la quantité en jours. Le client qui choisit 20 jours voit le montant correspondant. Une option ne change pas le prix. Si une journée de développeur senior coûte plus qu'une journée de développeur confirmé, créez deux produits.

Une fourchette n'engage pas l'agence. Elle aide le client à savoir s'il est dans le bon ordre de grandeur avant le premier rendez-vous. Un client qui pensait payer 3 000 € une application métier préfère le savoir avant la visio. La logique est détaillée dans [la fourchette de prix indicative](https://www.quotebuilder.co/blog/fourchette-prix-indicative-demande-devis-b2b).

Si vous facturez l'atelier de cadrage, et qu'il est déduit de la commande, écrivez-le dans la description du produit. QuoteBuilder n'encaisse rien. Le sujet est traité dans [le devis payant et l'étude préalable](https://www.quotebuilder.co/blog/devis-payant-etude-prealable-b2b).

## Règles Si/Alors : la bonne offre selon le type de besoin

Les [règles de suggestion](https://www.quotebuilder.co/blog/regles-suggestion-produits-funnel-devis-b2b) choisissent les produits montrés à l'étape « Solutions recommandées ». Les conditions d'une règle se combinent en ET. Le client voit trois suggestions au plus.

Trois règles suffisent pour démarrer :

- Si « Type de besoin » est « Site / produit », Alors proposer Atelier de cadrage, Site vitrine et Site e-commerce.
- Si « Type de besoin » est « Renfort / TMA », Alors proposer Journée de développement en régie et TMA mensuelle.
- Si « Type de besoin » est « Data / SI », Alors proposer Audit technique ou data et Atelier de cadrage.

Vous pouvez affiner avec vos questions ajoutées. Par exemple : Si « Type de besoin » est « Site / produit » et « Budget envisagé » est « Plus de 80 000 € », Alors proposer Application métier en premier. Ou : Si « Votre existant » est « Un site ou un outil à refaire », Alors proposer Refonte.

Si aucune règle ne correspond, le client voit un message qui l'invite à continuer, et il peut toujours envoyer sa demande. Pour « Autre », ce n'est pas un problème : la demande arrive quand même, avec le contexte.

## Pourquoi ces dossiers sortent Cold

Le score part de 30 points. Il devient warm à 45 et hot à 70. Il lit une surface (`surface`), une charge (`load`), une fréquence de prélèvement (`access`, pensée pour le rayonnage), un type de projet seulement s'il vaut `entrepot`, `cuisine_pro` ou `commerce`, une contrainte réelle, et la longueur d'un texte `need` ou `besoin`.

Le template Agence / ESN ne pose aucune de ces questions. Son type de projet vaut `web`, `staff`, `data` ou `other`, que la formule ignore. Son champ Contexte a pour clé `notes`, que le score ne lit pas. Résultat, tel que le template est livré : chaque demande sort à 30 points, libellé cold. Ce n'est pas un jugement sur la demande. C'est la formule, fixe et non réglable, appliquée à des réponses qu'elle ne connaît pas.

Les questions que vous ajoutez dans le constructeur reçoivent une clé automatique, que la formule ne lit pas non plus. Un projet à 150 000 € avec une DSI impliquée et une date de lancement sortira donc à 30, comme une demande vague. Triez sur le budget, le format, l'échéance et les décideurs, pas sur la pastille. Le détail du calcul est dans [le score d'une demande de devis](https://www.quotebuilder.co/blog/score-demande-devis-b2b).

Le score est calculé à l'envoi et stocké. Un segment ou une campagne filtré sur « hot » ne verra pas ces demandes.

## Le cahier des charges : PDF, 10 Mo, une zone de dépôt

À l'étape Personnalisation, la zone s'appelle « Plan (PDF ou image) ». Le libellé parle de plan, mais un cahier des charges en PDF passe très bien. Le sélecteur accepte PDF, JPEG, PNG et WebP, jusqu'à 10 Mo.

Ce qui ne passe pas : un document Word ou un tableur, une archive zip, un fichier de maquette. Si vos clients travaillent avec ces formats, demandez un export PDF dans le libellé de la question Contexte, ou un lien de partage écrit dans le champ.

Pour ajouter un document plus tard, le contact principal peut revenir sur son espace prospect, rubrique « Compléter la demande » : une note facultative et un fichier, dans les mêmes formats (PDF, JPEG, PNG, WebP) et la même limite de 10 Mo. Le sujet des fichiers est développé dans [pièces jointes, plans et photos](https://www.quotebuilder.co/blog/pieces-jointes-plans-photos-devis-b2b).

## Après l'envoi : dossier, notes, relecteurs

La demande arrive dans la liste avec le statut Nouveau. Les sept statuts prévus sont : Commencée, Nouveau, Contacté, En cours, Gagné, Perdu, En attente. Vous pouvez assigner un ou plusieurs collaborateurs, par exemple le directeur de projet et la personne d'avant-vente. L'assignation ne se déduit pas du type de besoin : vous la faites, ou un parcours d'Autopilote la fait si vous l'avez dessiné.

Les notes internes s'ajoutent sur la fiche, en texte brut, visibles par l'équipe et pas par le client. « Appel du 14 : budget validé en comité, DSI à convaincre sur l'hébergement. » « Deux autres agences consultées. » On ajoute une note, on ne la modifie pas ensuite. La transmission entre l'avant-vente et l'équipe technique est traitée dans [le transfert du brief commercial au technique](https://www.quotebuilder.co/blog/transfert-brief-commercial-technique-devis-b2b).

Le client reçoit un lien vers son [espace prospect](https://www.quotebuilder.co/fonctionnalites/espace-prospect), avec un code PIN. Il peut y inviter des relecteurs : la DSI, les achats, un directeur financier. Chaque relecteur reçoit son propre lien, valable 30 jours, vers la même page. Il peut consulter le récapitulatif, commenter, indiquer un budget maximum, valider le dossier ou demander des modifications. Ce n'est pas une signature de devis ni un bon de commande. Le passage à Gagné reste un geste de votre côté. Le sujet est développé dans [l'approbation par plusieurs décideurs](https://www.quotebuilder.co/blog/approbation-client-multi-decideurs-devis-b2b).

L'Autopilote envoie la confirmation au client, le brief à votre équipe, et peut relancer si le dossier reste ouvert. Le parcours livré par défaut contient une étape « Demande de photo » au bout de 2 jours. Pour une agence, elle n'a pas de sens : retirez-la du parcours. Le texte de l'email de confirmation se modifie dans les modèles d'emails, réservés aux Admins, et l'adresse qui reçoit le brief se règle dans les Paramètres, rubrique « Identité commerciale ».

## Parcours type : du premier message au statut Gagné

Hypothèse d'illustration, sans chiffre de référence :

1. Le responsable marketing d'un fabricant cherche « devis refonte site B2B » et arrive sur votre page. Il ouvre le funnel.
2. Il choisit « Site / produit ». Dans les questions ajoutées : budget « 30 000 à 80 000 € », existant « Un site ou un outil à refaire », adresse du site actuel, format « Prix forfaitaire », décideurs « Direction » et « DSI », contexte d'achat « Nous consultons quelques prestataires ». Dans le champ projet : « refonte du site, catalogue de 400 références à relier à l'ERP, lancement avant le salon de mars ». Échéance « Ce trimestre ».
3. La règle lui propose Atelier de cadrage, Refonte et Site e-commerce. Il garde l'atelier et la refonte, et dépose son cahier des charges en PDF.
4. Il laisse ses coordonnées et envoie. La demande arrive au statut Nouveau, à 30 points, cold.
5. Le directeur de projet lit le budget, l'échéance et la mention de l'ERP, et sait qu'il faut un profil intégration au premier rendez-vous. Il passe le dossier en Contacté et ajoute une note interne.
6. Le client invite sa DSI comme relectrice, avec un lien de 30 jours. Elle commente : « hébergement chez nous, pas de cloud public ».
7. L'agence rédige le devis et le contrat dans ses outils habituels, avec le périmètre et la cession de droits.
8. Une fois le devis accepté en dehors de QuoteBuilder, le dossier passe Gagné.

## Agence, conseil ou logiciel sur mesure

Les trois templates de la famille Tech et services partagent la même ossature : un choix visuel, un contexte, une échéance, puis les suggestions, la personnalisation et les coordonnées. Partez d'« Agence / ESN » si vous vendez à la fois des projets et du temps (site, renfort, TMA). Partez de « Logiciel sur mesure » si vous ne vendez que des produits développés au forfait : nouveau produit, refonte, intégration. Partez de « Conseil » si votre livrable est un audit, un accompagnement ou du management de transition. La duplication d'un funnel entier n'est pas une fonction livrée : vous modifiez celui que le template a créé, ou vous en créez un autre.

Une agence qui fait à la fois du site et du renfort peut garder un seul funnel, avec des règles par type de besoin. Deux funnels se justifient si les publics sont trop différents : un funnel « projets » pour les directions marketing, un funnel « renfort et TMA » pour les DSI. Le plan Free n'inclut qu'un funnel. Le plan Starter en inclut trois. Voir [Tarifs](https://www.quotebuilder.co/tarifs).

Si vous rencontrez vos clients sur des salons, un QR code vers ce funnel, tagué au nom du salon, fait arriver les demandes du stand dans la même liste, avec la source. Le sujet est traité dans [le salon professionnel et les demandes de devis](https://www.quotebuilder.co/blog/salon-professionnel-demandes-devis-b2b), et le [calculateur ROI salon professionnel](https://www.quotebuilder.co/outils/calculateur-roi-salon-professionnel-devis) dit ce qu'un stand doit produire pour se rembourser.

## Erreurs fréquentes

- **Ne pas demander le budget.** C'est la question qui évite le plus de rendez-vous inutiles. Proposez des tranches, avec « Pas encore défini ».
- **Mélanger forfait et régie dans la même offre.** Deux produits, deux descriptions, deux façons de compter.
- **Un devis de régie qui ne décrit que du temps.** Décrivez la prestation, ce qu'elle produit et qui l'encadre.
- **Compter sur le score.** Tel quel, il vaut 30, cold, pour toutes les demandes de ce template.
- **Ajouter une question « Fichier » pour le cahier des charges.** Elle s'affiche comme un champ texte. Utilisez la zone de dépôt de l'étape Personnalisation, en PDF.
- **Mettre la consigne dans le texte d'aide d'un champ texte.** Elle ne s'affiche pas. Mettez-la dans le libellé.
- **Garder la demande de photo dans les relances.** Elle n'a pas de sens pour un projet numérique.
- **Écrire la cession de droits dans le funnel.** Elle va dans le contrat. Le récapitulatif PDF de QuoteBuilder se termine par une mention fixe, « Document indicatif, non contractuel ».

## FAQ

### Existe-t-il un template agence web ou ESN dans QuoteBuilder ?

Oui. Le template « Agence / ESN », identifiant tech_agency, dans la famille Tech et services. Il crée un formulaire nommé « Funnel agence », en quatre étapes.

### Quels types de besoin le template propose-t-il ?

Site / produit, Renfort / TMA, Data / SI et Autre, en choix visuel obligatoire. Viennent ensuite un champ Contexte facultatif et une Échéance. Les offres elles-mêmes viennent de votre catalogue, via des règles que vous écrivez.

### Peut-on poser des questions différentes pour un site et pour un renfort ?

Non. Les étapes sont en ordre fixe, sans branchement. Les règles choisissent seulement les offres suggérées. Posez des questions compréhensibles dans tous les cas, laissez facultatives celles qui ne concernent qu'un type de besoin, ou faites deux funnels.

### Pourquoi les demandes sont-elles Cold ?

La formule part de 30 et ne lit ni le type de besoin, ni le champ Contexte (clé notes), ni l'échéance, ni les questions ajoutées dans le constructeur. Tel quel, chaque demande vaut 30 points, donc cold. Ce n'est pas un réglage.

### Le client peut-il joindre un cahier des charges ?

Oui, à l'étape Personnalisation, zone « Plan (PDF ou image) », en PDF, JPEG, PNG ou WebP, jusqu'à 10 Mo. Pas de Word ni de zip. Plus tard, le contact principal peut ajouter un fichier, dans les mêmes formats, depuis « Compléter la demande » sur son espace prospect.

### Peut-on chiffrer de la régie au jour ?

Oui, avec un produit à prix fixe par jour et la quantité en jours. Le montant de la ligne est le prix unitaire multiplié par la quantité. Le contrat de régie lui-même, avec la description de la prestation, se rédige hors de QuoteBuilder.

### La DSI ou les achats peuvent-ils voir la demande ?

Oui, si le client les invite comme relecteurs depuis son espace prospect. Chacun reçoit un lien de 30 jours. Ils peuvent consulter, commenter, indiquer un budget maximum, valider ou demander des modifications. Ce n'est pas une signature.

### QuoteBuilder gère-t-il la cession de droits ou le contrat ?

Non. QuoteBuilder recueille la demande et produit un récapitulatif indicatif. La cession de droits, le périmètre et les conditions vont dans votre contrat et vos conditions générales.

### Les options changent-elles le prix ?

Non. Le montant d'une ligne est le prix unitaire multiplié par la quantité. Une variante qui coûte plus cher, par exemple un profil senior, est un autre produit.

### Faut-il un plan payant pour ce funnel ?

Le template se choisit à la création du funnel. Le plan Free permet de voir l'interface, avec un funnel et un plafond de demandes. Le détail des plans est sur la page Tarifs.

## Sources

- Code du travail, article L8241-1 : toute opération à but lucratif ayant pour objet exclusif le prêt de main-d'œuvre est interdite, hors cas prévus (travail temporaire notamment). https://code.travail.gouv.fr/code-du-travail/l8241-1
- Code de la propriété intellectuelle, article L131-3 : la transmission des droits de l'auteur suppose une mention distincte de chaque droit cédé et un domaine d'exploitation délimité quant à son étendue, sa destination, son lieu et sa durée. https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006278958/

## Pour aller plus loin

- [Salon professionnel et demandes de devis](https://www.quotebuilder.co/blog/salon-professionnel-demandes-devis-b2b)
- [Calculateur ROI salon professionnel](https://www.quotebuilder.co/outils/calculateur-roi-salon-professionnel-devis)
- [Qualifier une demande avant chiffrage](https://www.quotebuilder.co/blog/qualifier-demande-devis-avant-chiffrage)
- [Règles de suggestion de produits](https://www.quotebuilder.co/blog/regles-suggestion-produits-funnel-devis-b2b)
- [Approbation et relecteurs](https://www.quotebuilder.co/blog/approbation-client-multi-decideurs-devis-b2b)
- [Autopilote et relances](https://www.quotebuilder.co/blog/autopilote-workflows-relance-demande-devis-b2b)
- [Estimateur du temps de chiffrage](https://www.quotebuilder.co/outils/estimateur-temps-chiffrage-devis)
- [Créer un compte Free](https://www.quotebuilder.co/signup?plan=free)
