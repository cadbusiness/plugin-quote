---
title: "Funnel de devis géomètre-expert : bornage, division, topographie, une demande avec la parcelle avant le premier appel"
slug: funnel-devis-geometre-expert-bornage
description: "Landing SEO géomètres-experts et cabinets de topographie : template Géomètre de QuoteBuilder, questions à ajouter (parcelle, motif, bornes, voisins), catalogue de prestations, règles Si/Alors par type de levé, score Cold, extrait cadastral en PDF, relecteurs. Sans fonction inventée."
canonical: /secteurs/funnel-devis-geometre-expert-bornage
locale: fr-FR
word_count_target: 2600
keywords:
  - devis géomètre
  - devis bornage
  - demande de devis géomètre-expert
  - devis division parcellaire
  - devis plan topographique
  - funnel devis géomètre
author: QuoteBuilder
date: 2026-10-15
updated: 2026-10-15
sector: geometre-expert
---

# Funnel de devis géomètre-expert : bornage, division, topographie, une demande avec la parcelle avant le premier appel

« Bonjour, c'est pour un bornage, vous pouvez me rappeler ? » Pas d'adresse, pas de référence cadastrale, pas de motif, pas un mot sur le voisin. Le cabinet rappelle, laisse un message, rappelle encore. Quand il obtient enfin la personne, il apprend que le terrain est en indivision, que le notaire attend un plan de division pour une vente dans trois semaines, et que le voisin conteste la limite depuis dix ans. Le devis aurait pu partir le premier jour si la demande avait contenu ces quatre informations.

Un géomètre-expert chiffre quand il sait quelle prestation on lui demande, sur quelle parcelle, pourquoi, et pour quand. Voici ce que pose le template « Géomètre » de QuoteBuilder, tel qu'il existe, ce qu'il faut lui ajouter pour un cabinet de géomètre-expert ou de topographie, et ce qu'il ne fera pas à votre place.

**Essayer le template Géomètre :** [créer un compte Free](https://www.quotebuilder.co/signup?plan=free), puis créer un funnel et choisir « Géomètre » dans la famille Immobilier et construction. L'identifiant du template est `property_surveyor`. Le funnel créé s'appelle par défaut « Funnel géomètre », en type formulaire. Pour voir d'abord un parcours public complet, sur un autre métier : [démo funnel rayonnage](https://www.quotebuilder.co/c/demo/rayonnage).

## Ce qu'une demande de géomètre doit contenir

Avant l'outil, la liste des informations sans lesquelles un devis de géomètre repose sur une hypothèse :

1. **La prestation.** Bornage, division, plan topographique, relevé de bâtiment, copropriété, implantation. Le client ne connaît pas toujours le mot juste. Il sait pourquoi il appelle.
2. **La parcelle.** Commune, adresse, et si possible la section et le numéro cadastral. Sans elle, impossible de regarder le plan cadastral, l'historique ou la présence d'un ancien bornage.
3. **Le motif.** Vente, construction, division pour vendre un lot, désaccord avec un voisin, projet d'aménagement. Le motif change la prestation et souvent l'urgence.
4. **La surface approximative.** Elle pèse sur le temps de terrain d'un plan topographique.
5. **Les voisins concernés.** Un bornage concerne des propriétés contiguës. Le nombre de voisins à convoquer change le travail.
6. **Les bornes existantes.** Présentes, disparues, inconnues.
7. **Le demandeur.** Propriétaire, notaire, agent immobilier, syndic, promoteur. Il n'a pas les mêmes attentes ni les mêmes délais.
8. **L'échéance.** Une signature chez le notaire, un dépôt de permis, une simple curiosité.
9. **Les documents.** Extrait cadastral, acte de propriété, ancien plan de bornage, plan du projet.

Chaque information manquante, c'est un appel ou un email de plus. Le sujet est développé dans l'article sur [qualifier une demande avant chiffrage](https://www.quotebuilder.co/blog/qualifier-demande-devis-avant-chiffrage).

## Ce que la loi réserve au géomètre-expert

Un point de vocabulaire qui compte pour votre funnel. L'article 1er de la loi n° 46-942 du 7 mai 1946 distingue deux types de travaux. Le 1° vise les études et travaux topographiques qui fixent les limites des biens fonciers : plans de division, de partage, de vente et d'échange, plans de bornage ou de délimitation. L'article 2 de la même loi réserve ces travaux aux géomètres-experts inscrits à l'Ordre. Le 2° vise les autres études et documents topographiques, qui ne relèvent pas de ce monopole.

Le Conseil d'État l'a rappelé dans une décision du 28 septembre 2016 (n° 394065) : le monopole concerne exclusivement les travaux qui ont directement pour objet la délimitation des biens fonciers.

Concrètement, pour votre funnel :

- un cabinet de géomètre-expert peut proposer toutes les prestations ;
- un cabinet de topographie qui n'est pas inscrit à l'Ordre ne doit pas proposer de bornage ni de plan de division dans son catalogue ;
- le choix « Bornage / division » du template est donc à garder seulement si vous êtes géomètre-expert.

Côté client, le Code civil pose le principe à l'article 646 : tout propriétaire peut obliger son voisin au bornage de leurs propriétés contiguës, et le bornage se fait à frais communs. Cette phrase explique beaucoup de demandes : le client veut savoir combien ça coûte, et qui paie. Votre funnel peut poser la question.

QuoteBuilder ne vérifie rien de tout cela. Il ne sait pas si vous êtes inscrit à l'Ordre, ne contrôle pas le cadastre, et ne sait pas si le demandeur est propriétaire. Il collecte une demande. Le reste est votre métier.

## Le template Géomètre dans QuoteBuilder

Le template est dans la famille « Immobilier et construction », à côté de « Promoteur » et « Architecte / BET ». Le funnel créé est un formulaire en quatre étapes.

**1. Votre levé** (« Type de mission et échéance »). Trois questions :

- « Type de levé », choix visuel obligatoire : Bornage / division, Topographie, Copropriété, Autre. Les valeurs stockées sont `boundary`, `topo`, `copro`, `other`.
- « Contexte », champ texte facultatif, avec l'aide « Objectif, contraintes, déjà en place » et l'exemple « Décrivez en une phrase ». La clé stockée est `notes`.
- « Échéance », liste facultative : Dès que possible, Dans le mois, Ce trimestre, Je me renseigne. La clé est `timeline`.

**2. Solutions recommandées** (« Prestations adaptées »). Le client voit les prestations que vos règles lui proposent, trois au maximum. Le template ne crée ni prestation ni règle. Tant que le catalogue et les règles sont vides, cette étape ne propose rien.

**3. Personnalisation** (« Quantités, options et précisions »). Pour chaque prestation retenue, une quantité (Qté) et les options que vous avez définies sur le produit, plus une zone de dépôt libellée « Plan (PDF ou image) ». Le sélecteur propose PDF, JPEG, PNG et WebP, jusqu'à 10 Mo. Cette étape n'a pas de champ texte libre, malgré le mot « précisions » dans le sous-titre.

**4. Vos coordonnées** (« Recevez le récapitulatif de votre projet »). Nom, email, téléphone, société, et une case de consentement marketing, décochée. Elle n'est pas nécessaire pour envoyer la demande.

Ce que le template ne demande pas : la parcelle, l'adresse, la surface, le motif, les voisins, les bornes existantes, la qualité du demandeur. Tout cela s'ajoute.

Le funnel avance en ordre fixe. Chaque client voit les mêmes étapes, dans le même ordre. Il n'existe pas de branchement : une question « nombre de lots » destinée à la copropriété apparaît aussi pour un bornage. Les règles Si/Alors choisissent les prestations suggérées. Elles ne sautent pas une étape et n'en affichent pas une autre.

**Voir un parcours public complet :** la [démo funnel rayonnage](https://www.quotebuilder.co/c/demo/rayonnage) montre les mêmes quatre types d'écran (questions, suggestions, personnalisation, coordonnées) sur un autre métier, sans compte.

## Adapter le template au cabinet

Les questions se modifient dans le constructeur de parcours : libellé, texte d'aide, caractère obligatoire, ordre. Le sous-titre de chaque étape se modifie aussi. Voici ce qu'un cabinet de géomètre-expert ajoute en général, à la première étape.

**Commune et parcelle**, champ texte, avec l'aide « Section et numéro cadastral si vous les avez, par exemple AB 123. Sinon l'adresse. » Rendez-la obligatoire. C'est l'information qui vous fait gagner le plus de temps.

**Motif de la demande**, liste : Vente, Construction ou permis, Division pour vendre un terrain, Désaccord avec un voisin, Aménagement ou travaux, Autre. Le motif ne change pas le parcours. Il change la façon dont vous lisez la demande.

**Vous êtes**, liste : Propriétaire, Notaire, Agent immobilier, Syndic de copropriété, Promoteur ou aménageur, Autre. Un notaire qui demande un plan de division pour une vente a souvent une date de signature. Un propriétaire seul a souvent une question avant tout.

**Surface approximative du terrain (m²)**, nombre, facultatif. Ajoutée dans le constructeur, elle reçoit une clé automatique (par exemple `number_x7k2p9`) que la formule de score ne lit pas : le score ne bougera pas (voir plus bas).

**Bornes existantes**, liste : Oui, visibles ; Non ; Je ne sais pas.

**Nombre de voisins concernés**, nombre, facultatif, avec l'aide « Pour un bornage : les propriétaires des terrains qui touchent la limite. »

**Partage des frais**, liste, utile pour le bornage : Oui, le voisin est d'accord ; Pas encore abordé ; Non. Le principe des frais communs de l'article 646 rend cette question naturelle. Elle ne dit rien du résultat du bornage.

Gardez la liste courte. Chaque question ajoutée fait partir quelques clients avant la fin. Une demande à moitié remplie reste une demande abandonnée, et le sujet est traité dans [la reprise des demandes abandonnées](https://www.quotebuilder.co/blog/demande-devis-abandonnee-funnel-reprise). Rendez obligatoire la parcelle, et laissez le reste facultatif.

Enfin, si vous n'êtes pas géomètre-expert inscrit à l'Ordre, modifiez les choix du type de levé : retirez « Bornage / division » et remplacez-le, par exemple, par « Plan d'intérieur » ou « Implantation ».

## Catalogue : des prestations, pas un barème caché

Chaque prestation est un produit du [catalogue](https://www.quotebuilder.co/fonctionnalites/catalogue). Un produit a trois façons d'afficher un prix : un prix fixe (minimum et maximum identiques), une fourchette (deux montants), ou « Sur devis » (les deux vides). Il n'y a pas de TVA dans QuoteBuilder. Indiquez dans la description si vos montants sont HT.

Une base de catalogue pour un cabinet de géomètre-expert, sans prix de référence :

| Prestation | Affichage conseillé | Ce que la description doit dire |
|---|---|---|
| Bornage amiable | Fourchette | Ce qui fait varier le prix : nombre de limites, de voisins, recherches d'archives |
| Division parcellaire et document d'arpentage | Fourchette | Les pièces remises, le lien avec le notaire |
| Plan topographique | Fourchette | La surface, la densité de détails, le format remis |
| Relevé de bâtiment ou d'intérieur | Fourchette | Plans remis, niveaux, façades |
| Implantation de construction | Fourchette | Lien avec le permis, nombre de points |
| Mise en copropriété, état descriptif de division | Sur devis | Ce dont vous avez besoin pour chiffrer |
| Mesurage de superficie privative (loi Carrez) | Prix fixe ou fourchette | Ce qui est mesuré, le document remis |

Le montant d'une ligne est le prix unitaire multiplié par la quantité. Une option ne change pas le prix. Si un bornage avec recherche d'archives coûte plus qu'un bornage simple, créez deux produits, ou utilisez une fourchette assez large et expliquez-la. La logique est détaillée dans [la fourchette de prix indicative](https://www.quotebuilder.co/blog/fourchette-prix-indicative-demande-devis-b2b).

Une fourchette n'engage pas le cabinet. Elle aide le client à savoir s'il est dans le bon ordre de grandeur avant que vous passiez du temps à étudier la parcelle. Un propriétaire qui pensait payer 150 € un bornage et découvre une fourchette bien plus haute préfère le savoir avant l'appel.

## Règles Si/Alors : la bonne prestation selon le type de levé

Les [règles de suggestion](https://www.quotebuilder.co/blog/regles-suggestion-produits-funnel-devis-b2b) choisissent les produits montrés à l'étape « Solutions recommandées ». Les conditions d'une règle se combinent en ET. Le client voit trois suggestions au plus.

Trois règles suffisent pour démarrer :

- Si « Type de levé » est « Bornage / division », Alors proposer Bornage amiable et Division parcellaire.
- Si « Type de levé » est « Topographie », Alors proposer Plan topographique et Implantation de construction.
- Si « Type de levé » est « Copropriété », Alors proposer Mise en copropriété et Mesurage loi Carrez.

Vous pouvez affiner avec vos questions ajoutées. Par exemple : Si « Type de levé » est « Topographie » et « Surface approximative » vaut au moins 5 000, Alors proposer un plan topographique grande surface, avec une fourchette adaptée. Ou : Si « Motif » est « Vente » et « Type de levé » est « Bornage / division », Alors proposer la division en premier.

Si aucune règle ne correspond, le client voit un message qui l'invite à continuer, et il peut toujours envoyer sa demande. Pour « Autre », ce n'est pas un problème : la demande arrive quand même, avec le contexte.

## Pourquoi ces dossiers sortent Cold

Le score part de 30 points. Il devient warm à 45 et hot à 70. Il lit la surface (`surface`), une charge (`load`), une fréquence de prélèvement (`access`, pensée pour le rayonnage), un type de projet seulement s'il vaut `entrepot`, `cuisine_pro` ou `commerce`, une contrainte réelle, et la longueur d'un texte `need` ou `besoin`.

Le template Géomètre ne pose aucune de ces questions. Son champ Contexte a pour clé `notes`, que le score ne lit pas. Résultat, tel que le template est livré : chaque demande sort à 30 points, libellé cold. Ce n'est pas un jugement sur la demande. C'est la formule, fixe et non réglable, appliquée à des réponses qu'elle ne connaît pas.

Seule une question de clé exactement `surface`, créée par l'API ou les outils MCP (le constructeur ne permet pas de choisir la clé), fait bouger le score : 8 points dès que la surface dépasse 0, 15 à partir de 100, 25 à partir de 400. Un terrain de 600 m² ferait passer la demande à 55, donc warm. Ce n'est pas un indicateur de priorité pour un géomètre : la surface ne dit pas si le notaire attend pour la semaine prochaine. Triez sur l'échéance, le motif et le demandeur, pas sur la pastille.

Le score est calculé à l'envoi et stocké. Un segment ou une campagne filtré sur « hot » ne verra pas ces demandes. Le détail du calcul est dans [le score d'une demande de devis](https://www.quotebuilder.co/blog/score-demande-devis-b2b).

## L'extrait cadastral : 10 Mo, une zone de dépôt

À l'étape Personnalisation, la zone s'appelle « Plan (PDF ou image) ». Le client y dépose un fichier : extrait cadastral, ancien plan de bornage, page d'acte, plan du projet de construction. Le sélecteur accepte PDF, JPEG, PNG et WebP, jusqu'à 10 Mo.

Ce qui ne passe pas : un fichier DWG ou DXF, une archive zip, un nuage de points. Si vos clients professionnels (architectes, promoteurs) travaillent dans ces formats, demandez un export PDF dans le texte d'aide, ou un lien de téléchargement dans le champ Contexte.

Pour ajouter un document plus tard, le contact principal peut revenir sur son espace prospect, rubrique « Compléter la demande » : une note facultative et un fichier, toujours dans la limite de 10 Mo. Le sujet des fichiers est développé dans [pièces jointes, plans et photos](https://www.quotebuilder.co/blog/pieces-jointes-plans-photos-devis-b2b).

## Après l'envoi : dossier, notes, relecteurs

La demande arrive dans la liste avec le statut Nouveau. Les sept statuts prévus sont : Commencée, Nouveau, Contacté, En cours, Gagné, Perdu, En attente. Vous pouvez assigner un collaborateur, par exemple le géomètre qui couvre le secteur de la commune. L'assignation ne se déduit pas de la parcelle : vous la faites, ou un parcours d'Autopilote la fait si vous l'avez dessiné.

Les notes internes s'ajoutent sur la fiche, en texte brut, visibles par l'équipe et pas par le client. « Ancien bornage de 1987 retrouvé aux archives du cabinet. » « Voisin nord injoignable, prévoir courrier. » On ajoute une note, on ne la modifie pas ensuite.

Le client reçoit un lien vers son [espace prospect](https://www.quotebuilder.co/fonctionnalites/espace-prospect), avec un code PIN. Il peut y inviter des relecteurs : un frère ou une sœur en indivision, un notaire, un associé. Chaque relecteur reçoit son propre lien, valable 30 jours, vers la même page. Il peut consulter le récapitulatif, commenter, indiquer un budget maximum, valider le dossier ou demander des modifications. Ce n'est pas une signature de devis. Le passage à Gagné reste un geste de votre côté.

Les voisins d'un bornage ne sont pas des relecteurs. La convocation des propriétaires voisins, le procès-verbal de bornage et sa signature se font en dehors de QuoteBuilder, selon vos procédures.

L'Autopilote envoie la confirmation au client et peut relancer si le dossier reste ouvert. Le texte de l'email de confirmation se modifie dans les modèles d'emails, réservés aux Admins.

## Parcours type : du premier message au statut Gagné

Hypothèse d'illustration, sans chiffre de référence :

1. Une propriétaire cherche « devis bornage » et arrive sur votre page bornage. Elle ouvre le funnel.
2. Elle choisit « Bornage / division ». Dans les questions ajoutées : commune et parcelle « Saint-Jean, AB 214 », motif « Vente », « Propriétaire », bornes « Je ne sais pas », deux voisins, partage des frais « Pas encore abordé ». Contexte : « vente de la maison, compromis signé, le notaire demande un bornage ». Échéance « Dans le mois ».
3. La règle lui propose Bornage amiable et Division parcellaire. Elle garde le bornage, quantité 1, et dépose l'extrait cadastral en PDF.
4. Elle laisse ses coordonnées et envoie. La demande arrive au statut Nouveau, à 30 points, cold.
5. Le géomètre ouvre la fiche, lit le motif et l'échéance, et sait que le notaire attend. Il passe le dossier en Contacté et ajoute une note interne.
6. Il rédige le devis dans son outil habituel et l'envoie.
7. La propriétaire invite son notaire comme relecteur, avec un lien de 30 jours, pour qu'il voie la demande et les pièces.
8. Une fois le devis accepté en dehors de QuoteBuilder, le dossier passe Gagné.

## Géomètre, architecte ou promoteur

Les trois templates de la famille Immobilier et construction partagent la même ossature : un choix visuel, un contexte, une échéance, puis les suggestions, la personnalisation et les coordonnées. Partez du template Géomètre si votre activité principale est le terrain : limites, division, levés, copropriété. Partez d'[Architecte / BET](https://www.quotebuilder.co/secteurs/funnel-devis-architecte-bet) si vous vendez surtout de la conception ou des études. La duplication d'un funnel entier n'est pas une fonction livrée : vous modifiez celui que le template a créé, ou vous en créez un autre.

Un cabinet qui fait à la fois du foncier et de la topographie pour des entreprises peut garder un seul funnel, avec des règles par type de levé. Deux funnels se justifient si les publics sont trop différents, par exemple un funnel « particuliers et notaires » et un funnel « promoteurs et maîtres d'œuvre ». Le plan Free n'inclut qu'un funnel. Les plans payants en incluent davantage. Voir [Tarifs](https://www.quotebuilder.co/tarifs).

## Erreurs fréquentes

- **Ne pas demander la parcelle.** C'est l'information qui évite le plus d'allers-retours. Rendez-la obligatoire.
- **Proposer un bornage sans être géomètre-expert.** Le monopole de la loi de 1946 s'applique. Adaptez les choix du template.
- **Compter sur le score.** Tel quel, il vaut 30, cold, pour toutes les demandes de ce template.
- **Annoncer un dépôt de fichiers DWG.** La zone accepte PDF et images, 10 Mo.
- **Mettre des prix fixes sur des prestations très variables.** Une fourchette avec une explication est plus honnête qu'un prix qui changera au premier appel.
- **Traiter les voisins comme des relecteurs.** Le bornage contradictoire suit votre procédure, pas l'espace prospect.
- **Oublier la question des frais.** Le client pense souvent à qui paie avant de penser à la prestation.

## FAQ

### Existe-t-il un template géomètre dans QuoteBuilder ?

Oui. Le template « Géomètre », identifiant property_surveyor, dans la famille Immobilier et construction. Il crée un formulaire nommé « Funnel géomètre », en quatre étapes.

### Quels types de levé le template propose-t-il ?

Bornage / division, Topographie, Copropriété et Autre, en choix visuel obligatoire. Viennent ensuite un champ Contexte facultatif et une Échéance. Les prestations elles-mêmes viennent de votre catalogue, via des règles que vous écrivez.

### Peut-on poser des questions différentes pour un bornage et pour un plan topographique ?

Non. Les étapes sont en ordre fixe, sans branchement. Les règles choisissent seulement les prestations suggérées. Posez des questions compréhensibles dans tous les cas, ou faites deux funnels.

### Pourquoi les demandes sont-elles Cold ?

La formule part de 30 et ne lit pas le type de levé, ni le champ Contexte (clé notes), ni l'échéance. Tel quel, chaque demande vaut 30 points, donc cold. Une question dont la clé est surface peut faire bouger le score. Ce n'est pas un réglage.

### Le client peut-il joindre un extrait cadastral ?

Oui, à l'étape Personnalisation, zone « Plan (PDF ou image) », en PDF, JPEG, PNG ou WebP, jusqu'à 10 Mo. Plus tard, le contact principal peut ajouter un fichier depuis « Compléter la demande » sur son espace prospect.

### Un cabinet de topographie peut-il utiliser ce template ?

Oui, mais les plans de bornage et de division sont réservés aux géomètres-experts inscrits à l'Ordre par la loi du 7 mai 1946. Un cabinet qui n'est pas inscrit retire le choix Bornage / division et le remplace par ses propres prestations.

### QuoteBuilder vérifie-t-il la parcelle ou le cadastre ?

Non. Il enregistre ce que le client écrit. Il ne consulte pas le cadastre, ne vérifie pas que le demandeur est propriétaire et ne retrouve pas d'ancien bornage.

### Les voisins peuvent-ils être invités sur la demande ?

Le client peut inviter des relecteurs, avec un lien de 30 jours. Mais la convocation des voisins et le procès-verbal de bornage se font hors de QuoteBuilder, selon vos procédures. Ce ne sont pas des relecteurs.

### Les options changent-elles le prix ?

Non. Le montant d'une ligne est le prix unitaire multiplié par la quantité. Une variante qui coûte plus cher est un autre produit, ou une fourchette plus large.

### Faut-il un plan payant pour ce funnel ?

Le template se choisit à la création du funnel. Le plan Free permet de voir l'interface, avec un funnel et un plafond de demandes. Le détail des plans est sur la page Tarifs.

## Sources

- Loi n° 46-942 du 7 mai 1946 instituant l'Ordre des géomètres-experts, article 1er (1° travaux fixant les limites des biens fonciers, 2° autres études topographiques) et article 2 (travaux du 1° réservés aux géomètres-experts inscrits). https://librejustice.fr/norm/fr/loi-n-46-942-du-7-mai-1946-instituant-l-ordre-des-geometres-experts/1
- Conseil d'État, 28 septembre 2016, n° 394065 : le monopole concerne exclusivement les travaux ayant directement pour objet la délimitation des biens fonciers. https://librejustice.fr/decision/fr/YNgkTrSIjVJE
- Code civil, article 646 : tout propriétaire peut obliger son voisin au bornage de leurs propriétés contiguës, le bornage se fait à frais communs.

## Pour aller plus loin

- [Devis payant et étude préalable en B2B](https://www.quotebuilder.co/blog/devis-payant-etude-prealable-b2b)
- [Calculateur devis payant et étude préalable](https://www.quotebuilder.co/outils/calculateur-devis-payant-etude-prealable)
- [Règles de suggestion de produits](https://www.quotebuilder.co/blog/regles-suggestion-produits-funnel-devis-b2b)
- [Score d'une demande de devis](https://www.quotebuilder.co/blog/score-demande-devis-b2b)
- [Pièces jointes, plans et photos](https://www.quotebuilder.co/blog/pieces-jointes-plans-photos-devis-b2b)
- [Approbation et relecteurs](https://www.quotebuilder.co/blog/approbation-client-multi-decideurs-devis-b2b)
- [Funnel de devis architecte et BET](https://www.quotebuilder.co/secteurs/funnel-devis-architecte-bet)
- [Créer un compte Free](https://www.quotebuilder.co/signup?plan=free)
