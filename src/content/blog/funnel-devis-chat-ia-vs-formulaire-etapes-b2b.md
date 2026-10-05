---
title: "Funnel de devis en chat IA ou formulaire par étapes : lequel choisir en B2B"
slug: funnel-devis-chat-ia-vs-formulaire-etapes-b2b
description: "Chat IA ou formulaire par étapes pour vos demandes de devis B2B : ce que chaque mode capte, comment les réponses du chat alimentent le dossier (et pourquoi les réponses de formulaire priment), quand choisir l'un ou l'autre."
canonical: /blog/funnel-devis-chat-ia-vs-formulaire-etapes-b2b
locale: fr-FR
word_count_target: 2600
keywords:
  - funnel devis chat IA
  - formulaire de devis conversationnel
  - chatbot devis B2B
  - formulaire devis par étapes
  - agent IA demande de devis
  - brief devis structuré
  - qualification demande devis chat
author: QuoteBuilder
date: 2026-10-05
updated: 2026-10-05
---

# Funnel de devis en chat IA ou formulaire par étapes : lequel choisir en B2B

Deux prospects arrivent le même matin. Le premier est acheteur dans une PME logistique. Il sait ce qu'il veut : entrepôt, 600 m², charge lourde, livraison avant la fin du trimestre. Il clique quatre cartes, tape deux nombres, et c'est fini en une minute. Le second dirige un atelier qui déménage. Il ne sait pas encore s'il lui faut du rayonnage, des établis ou les deux. Il a envie de raconter son problème, pas de cocher des cases dont il ne comprend pas la moitié.

Le même formulaire ne sert pas aussi bien ces deux personnes. Un chat non plus. La question n'est pas « quel mode est moderne », mais « quel mode produit un brief chiffrable pour le type de demande que je reçois le plus souvent ».

Ce guide compare les deux approches sur le terrain du devis B2B, puis décrit précisément ce que fait le mode Chat IA de QuoteBuilder : comment il remplit le dossier, comment il cohabite avec les réponses de formulaire, et ce qu'il ne fait pas.

**Comparer sur un vrai parcours :** [ouvrir la démo funnel rayonnage](https://www.quotebuilder.co/c/demo/rayonnage) (formulaire par étapes, sans compte) ou [créer un compte Free](https://www.quotebuilder.co/signup?plan=free) pour monter votre premier funnel.

## Deux façons de recueillir un besoin

### Le formulaire par étapes

Un formulaire par étapes découpe la demande en écrans de questions typées : choix visuel, mesure, liste, choix multiple, texte libre. Les champs obligatoires bloquent le passage tant qu'ils sont vides.

Sa force, c'est la structure : « Charge lourde » est la même valeur pour tous les prospects, ce qui rend les règles de suggestion fiables et la lecture rapide. Sa limite, c'est la rigidité : le prospect qui ne se reconnaît dans aucune carte choisit « Autre » ou abandonne.

### Le chat

Un chat laisse le prospect décrire son projet avec ses mots ; un agent relance et propose des produits. Sa force, c'est l'entrée : écrire « on déménage l'atelier, environ 200 m², beaucoup d'outillage lourd » demande moins d'effort que comprendre une grille. Sa limite, c'est la sortie : ce qui est dit doit devenir des valeurs structurées, et la conversion peut être incomplète.

Une étude qualitative de Nielsen Norman Group (huit participants, 2018) observait que les chatbots tenaient bien les flux simples et linéaires, et se perdaient dès que l'utilisateur sortait du script. Les participants préféraient cliquer une option plutôt que la taper, voulaient savoir qu'ils parlaient à un bot et attendaient une porte de sortie vers un humain. Ce n'est pas un verdict sur les agents actuels, mais une bonne liste de pièges.

## Ce que propose QuoteBuilder : trois types de funnel

À la création d'un funnel, QuoteBuilder propose trois types :

- **Formulaire** : « Le prospect répond à vos questions, puis voit les produits adaptés. »
- **Chat IA** : « Le prospect décrit le projet ; l'IA s'appuie sur le catalogue. »
- **Catalogue** : « Le prospect parcourt les gammes d'abord, puis envoie une demande unique. »

Le type se choisit au moment de la création. Dans la famille rayonnage, il existe un template dédié au chat, nommé « Brief chat » : le prospect décrit l'espace et l'IA cadre le besoin. Il crée un funnel appelé par défaut « Chat rayonnage ». Ses blocs reprennent un brief d'équipement :

1. **Votre stockage** (« Décrivez l'espace à équiper ») : type d'espace en choix visuel (Entrepôt, Commerce, Atelier, Archives), surface ou volume en texte libre (« Ex. 80 m², 12 box »), contraintes en choix multiple (Accès / livraison, Norme ou agrément, Hauteur limitée, Aucune particulière).
2. **Solutions recommandées** : « Gammes adaptées à votre brief ».
3. **Personnalisation** : quantités, options et précisions.
4. **Vos coordonnées**.

Dans un funnel de type Chat IA, ces questions ne s'affichent pas comme des écrans à remplir. Elles servent de liste de clés que l'agent doit compléter au fil de la conversation. C'est le point le plus important à comprendre : en mode chat, vous écrivez toujours des questions, mais c'est l'agent qui les pose, dans l'ordre que la conversation impose.

## Comment le chat remplit le dossier

Le fonctionnement de l'agent de QuoteBuilder tient en quelques règles, visibles dans son code.

**Une liste de clés à remplir.** L'agent reçoit les questions du funnel (clé, type, libellé). Sans question, il se rabat sur une liste par défaut : surface, charge, hauteur, budget, délai, contraintes.

**Extraire, pas rejouer le formulaire.** Il enregistre tout ce qui est dit en une phrase, sans reposer les questions une par une, et pose au plus une clarification à la fois. Accueil type : « Bonjour, décrivez-moi votre projet ».

**Le catalogue avant les noms et les prix.** Il ne cite un produit ou un prix qu'après avoir consulté votre catalogue, et les prix sont les fourchettes min et max de vos fiches. Une recherche renvoie au plus huit produits.

**Les mêmes règles de suggestion.** Pour proposer des configurations, il évalue les règles Si/Alors du funnel sur le brief en cours, comme l'écran « Solutions recommandées » : trois blocs au maximum, par priorité, conditions toutes vraies.

**L'email avant les coordonnées.** Il collecte prénom, email, téléphone et société une fois une proposition crédible sur la table. Un email invalide est refusé, et sans email valide il ne passe pas à l'étape coordonnées.

**Pas de paiement, pas de commande.** Il prépare un brief de devis, sans envoyer le devis ni demander de moyen de paiement.

## Formulaire et chat dans le même dossier : qui gagne ?

Un dossier peut contenir à la fois des réponses de formulaire et des paramètres extraits par l'agent. C'est le cas, par exemple, quand un commercial envoie un lien prérempli : les paramètres de l'URL deviennent des réponses de formulaire, puis le prospect discute avec l'agent.

QuoteBuilder fusionne les deux avec une règle simple : **pour une même clé, la réponse de formulaire prime sur la valeur extraite du chat.** Concrètement, si le lien prérempli indique `project_type=entrepot` et que le prospect écrit ensuite « c'est plutôt pour l'atelier », le dossier garde « Entrepôt ». Les clés que seul le chat a remplies sont conservées telles quelles.

Cette fusion sert partout : pour évaluer les règles de suggestion, pour calculer le score et pour enregistrer les réponses du dossier à la soumission. Deux conséquences pratiques :

- **Ne préremplissez que ce dont vous êtes sûr.** Une valeur préremplie par erreur ne sera pas corrigée par la conversation.
- **Gardez les mêmes clés partout.** Si votre lien utilise `surface` et que votre question s'appelle autrement, vous aurez deux lignes dans le dossier au lieu d'une.

## Ce que voit le commercial sur la fiche devis

Sur la fiche devis, le commercial voit les réponses du dossier avec leurs libellés, les produits retenus, les fichiers du prospect et la fourchette indicative. Une clé ajoutée par l'agent sans question correspondante apparaît aussi, avec un libellé déduit de son nom.

La conversation reste attachée à la session du prospect : elle n'est pas reprise sur la fiche. Le commercial lit un brief, pas trente messages, mais **la qualité d'un dossier issu du chat dépend de ce que l'agent a extrait.** Une information absente des clés n'arrive pas jusqu'à lui.

D'où l'intérêt de questions précises même en mode chat. Une clé « délai » avec des choix clairs (« Dès que possible », « Dans le mois », « Ce trimestre », « Je me renseigne ») donne une cible à l'agent. Un champ « Autres informations » ne lui en donne aucune.

**Avant de trancher entre chat et formulaire :** [créer un compte Free](https://www.quotebuilder.co/signup?plan=free) pour tester les deux types sur votre catalogue, puis chiffrer le temps de reprise avec l'[estimateur requalification chat vs formulaire](https://www.quotebuilder.co/outils/estimateur-requalification-chat-vs-formulaire-devis).

## Le score Hot / Warm / Cold ne change pas avec le chat

Le score est calculé une fois, à la soumission, sur les réponses fusionnées, avec la même formule fixe pour tous les types de funnel : surface, charge, accès, type de projet (entrepôt, cuisine professionnelle ou commerce), contraintes et longueur du texte de besoin. Il ignore photos, zone, urgence et contexte, et n'est pas configurable.

Deux détails comptent en mode chat :

- **La surface doit être un nombre.** Si elle reste un texte avec unité (« 80 m² »), la formule ne la lit pas comme un nombre et le critère surface ne compte pas. Une question de type mesure, avec l'unité à part, évite ce problème.
- **Le chat ne rend pas un dossier plus chaud par lui-même.** Un échange long ne pèse rien dans le score s'il n'a pas rempli les clés que la formule lit.

Le score reste un premier tri. Urgence, zone géographique et délai de rappel relèvent de votre organisation d'équipe, pas d'un réglage du produit.

## Quand choisir le formulaire par étapes

Le formulaire est le bon choix par défaut dans la plupart des activités B2B à catalogue. Choisissez-le quand :

- **Vos besoins tiennent dans une grille.** Si vos commerciaux posent toujours les mêmes cinq questions, écrivez-les.
- **Vous avez besoin de mesures exactes.** Un champ mesure donne un nombre exploitable, une phrase donne une estimation à interpréter.
- **Vos règles de suggestion reposent sur des valeurs précises.** « Si charge est Lourde et type est Entrepôt » fonctionne bien avec des cartes.
- **Le prospect est pressé et sur mobile.** Cliquer quatre cartes va plus vite que taper trois phrases au pouce.
- **Vous voulez des dossiers comparables** pour la revue de pipeline.

## Quand le chat a du sens

Le chat devient intéressant quand :

- **Les demandes sont hétérogènes**, et une grille unique obligerait à multiplier les « Autre ».
- **Le prospect ne connaît pas votre vocabulaire.** Il ne sait pas ce qu'est une « travée », mais il sait décrire ce qu'il stocke.
- **Le besoin se clarifie en parlant.** Une relance bien posée fait émerger la contrainte qui change tout (une hauteur sous poutre, un accès par monte-charge).
- **Certains visiteurs préfèrent écrire une phrase** plutôt que parcourir quatre écrans.

Même dans ces cas, gardez des clés bien définies. Le chat change la manière de poser les questions, pas la nécessité d'avoir des réponses structurées à l'arrivée.

## Tableau de décision

| Critère | Formulaire par étapes | Chat IA |
|---|---|---|
| Demandes répétitives, vocabulaire connu | Très adapté | Possible, plus lent |
| Besoins flous ou hétérogènes | Beaucoup de « Autre » | Plus naturel |
| Mesures précises (m², kg, m) | Champ mesure fiable | Dépend de l'extraction |
| Règles de suggestion sur valeurs exactes | Fiable | Dépend des clés remplies |
| Saisie sur mobile | Rapide (clics) | Plus de frappe |
| Lecture par le commercial | Réponses homogènes | Réponses extraites, conversation non reprise sur la fiche |
| Score Hot / Warm / Cold | Même formule | Même formule |

## Une architecture qui marche : le formulaire d'abord, la discussion en complément

Pour une PME qui reçoit surtout des demandes comparables, une organisation simple fonctionne bien :

1. **Un funnel Formulaire comme parcours principal**, avec quatre à six questions bien choisies, des règles de suggestion propres et l'étape Personnalisation pour les quantités et le plan.
2. **Un module de discussion en complément.** Le module « Discuter de votre projet » fait parler l'agent sur un funnel de type Formulaire, sans changer son type. Le prospect discute, clique « Passer aux coordonnées », renseigne nom et prénom, téléphone, e-mail (entreprise en option) et envoie sa demande. Son premier message devient le besoin du dossier ; les paramètres extraits s'ajoutent aux réponses.
3. **Le type Chat IA pour un funnel dédié** quand vos demandes sont vraiment hétérogènes, en partant du template « Brief chat » si vous êtes dans le rayonnage.

Comme le premier message devient le besoin, sa longueur compte dans le score. Trois lignes précises valent mieux qu'un « bonjour ».

## Écrire des questions qui servent aussi au chat

Formulaire ou Chat IA, les questions restent la colonne vertébrale du brief :

- **Des clés courtes et stables** (`surface`, `project_type`, `constraints`, `timeline`), qui sont aussi celles que lisent le score et les règles.
- **Des choix explicites.** L'agent peut associer une phrase à une valeur prévue ; il ne peut pas deviner une valeur que vous n'avez pas définie.
- **Des mesures en type mesure**, avec unité et bornes, pas en texte libre.
- **Un seul champ texte de précisions.** Plusieurs champs libres se recoupent.
- **Le plan à l'étape Personnalisation** : PDF ou image, 10 Mo au maximum. D'autres fichiers peuvent s'ajouter ensuite depuis la page prospect.

## Erreurs fréquentes

- **Passer en chat pour « faire moderne ».** Si vos demandes tiennent dans une grille, le chat ajoute de la frappe sans ajouter d'information.
- **Un funnel Chat IA sans questions.** L'agent se rabat sur une liste générique (surface, charge, hauteur, budget, délai, contraintes) qui ne correspond peut-être pas à votre métier.
- **Attendre du chat qu'il chiffre.** L'agent cite les fourchettes de votre catalogue et évalue vos règles. Il ne calcule pas de devis, ne pose pas de remise et ne gère pas de TVA : les prix restent des fourchettes indicatives en euros.
- **Croire que le chat crée des étapes.** Les étapes d'un funnel restent dans un ordre fixe. Les règles Si/Alors choisissent seulement les produits proposés. Le chat ne fait pas apparaître de nouveaux écrans selon les réponses.
- **Compter sur la conversation pour transmettre le contexte.** Elle n'est pas reprise sur la fiche devis : ce qui n'est ni dans une clé, ni dans le besoin, ni dans une note interne de l'équipe est perdu pour le commercial suivant.

## FAQ

### 1. Quels types de funnel existent dans QuoteBuilder ?

Trois : Formulaire, Chat IA et Catalogue. Le type se choisit à la création du funnel.

### 2. Existe-t-il un template pensé pour le chat ?

Oui, « Brief chat » dans la famille rayonnage. Il crée un funnel « Chat rayonnage » avec un bloc type d'espace, surface ou volume, contraintes, puis suggestions, personnalisation et coordonnées.

### 3. L'agent invente-t-il des produits ou des prix ?

Il ne doit citer que ce que renvoie votre catalogue. Les prix sont les fourchettes min et max de vos fiches. Il ne peut pas présenter de configuration sans avoir consulté le catalogue ou les règles.

### 4. Les règles de suggestion fonctionnent-elles en mode chat ?

Oui. L'agent évalue les mêmes règles Si/Alors sur le brief en cours : trois blocs au maximum, par priorité, conditions toutes vraies.

### 5. Si une réponse existe à la fois dans le formulaire et dans le chat, laquelle compte ?

Celle du formulaire, pour une même clé. Les valeurs extraites du chat complètent les clés que le formulaire n'a pas remplies.

### 6. Le commercial peut-il relire la conversation sur la fiche devis ?

Non. La fiche affiche les réponses structurées du dossier, les produits, les fichiers et la fourchette indicative. La conversation reste attachée à la session du prospect.

### 7. Le chat améliore-t-il le score Hot / Warm / Cold ?

Pas en soi. Le score est une formule fixe calculée à la soumission sur les réponses fusionnées. Il compte si les bonnes clés sont remplies (surface en nombre, type de projet, contraintes, longueur du besoin).

### 8. Peut-on faire parler l'agent sur un funnel de type Formulaire ?

Oui, avec le module « Discuter de votre projet ». Le funnel garde son type Formulaire ; le prospect discute, puis renseigne ses coordonnées et envoie sa demande.

### 9. L'agent peut-il prendre une commande ou un paiement ?

Non. Il prépare un brief de devis et collecte les coordonnées. Pas de commande, pas de paiement, pas d'envoi de devis à sa place.

### 10. Le prospect peut-il envoyer un plan pendant le chat ?

Pas dans la conversation. Le plan se joint à l'étape Personnalisation (PDF ou image, 10 Mo au maximum) ou depuis la page prospect après l'envoi de la demande.

**Choisir le bon mode sur vos vraies demandes :** [créer un compte Free](https://www.quotebuilder.co/signup?plan=free) · [voir la démo rayonnage](https://www.quotebuilder.co/c/demo/rayonnage) · [règles de suggestion produits](https://www.quotebuilder.co/blog/regles-suggestion-produits-funnel-devis-b2b).

## Sources

- Budiu, R. (2018). « The User Experience of Chatbots ». Nielsen Norman Group. https://www.nngroup.com/articles/chatbots/

## Pour aller plus loin

- [Formulaire contact vs funnel de devis B2B](https://www.quotebuilder.co/blog/formulaire-contact-vs-funnel-devis-b2b)
- [Règles de suggestion produits dans un funnel de devis B2B](https://www.quotebuilder.co/blog/regles-suggestion-produits-funnel-devis-b2b)
- [Préremplir un devis avec des paramètres d'URL](https://www.quotebuilder.co/blog/preremplir-devis-url-parametres)
- [Score d'une demande de devis B2B](https://www.quotebuilder.co/blog/score-demande-devis-b2b)
- [Qualifier une demande de devis avant chiffrage](https://www.quotebuilder.co/blog/qualifier-demande-devis-avant-chiffrage)
- [Funnel de devis rayonnage et stockage](https://www.quotebuilder.co/secteurs/funnel-devis-rayonnage-stockage)
- [Estimateur requalification chat vs formulaire](https://www.quotebuilder.co/outils/estimateur-requalification-chat-vs-formulaire-devis)
- [Fonctionnalité funnel](https://www.quotebuilder.co/fonctionnalites/funnel)
