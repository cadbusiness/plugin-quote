---
title: "Webhook de demande de devis : envoyer chaque demande vers votre CRM, signée et vérifiable"
slug: webhook-demande-devis-crm-signature-hmac
description: "Comment brancher un webhook sortant sur vos demandes de devis : ce que QuoteBuilder envoie (événement quote.submitted, contenu du JSON), la signature HMAC SHA-256 de l'en-tête X-QuoteBuilder-Signature, la vérification côté serveur, la fiabilité (une seule tentative), le retour des statuts par l'API et les erreurs qui font perdre des demandes."
canonical: /blog/webhook-demande-devis-crm-signature-hmac
locale: fr-FR
word_count_target: 2600
keywords:
  - webhook demande de devis
  - envoyer demande de devis vers CRM
  - webhook signature HMAC SHA-256
  - vérifier signature webhook
  - intégration CRM formulaire devis
  - webhook formulaire devis B2B
  - synchroniser devis CRM
author: QuoteBuilder
date: 2026-10-07
updated: 2026-10-07
---

# Webhook de demande de devis : envoyer chaque demande vers votre CRM, signée et vérifiable

Les demandes de devis arrivent dans un outil, les commerciaux travaillent dans un autre. Quelqu'un recopie le nom, l'email et le besoin dans le CRM, souvent le soir. Entre les deux, une demande se perd ou un téléphone est mal recopié.

Un webhook sortant règle la partie mécanique : à chaque nouvelle demande, l'outil qui la reçoit l'envoie lui-même à une adresse que vous choisissez, et votre CRM crée la fiche. Encore faut-il savoir ce qui part, quand, sous quelle forme, et comment être sûr que la requête vient bien de chez vous. Ce guide décrit le webhook de QuoteBuilder tel qu'il fonctionne aujourd'hui, ce qu'il ne fait pas, et comment l'exploiter sans perdre de demandes.

**Voir d'abord ce que remplit le prospect :** [démo funnel rayonnage](https://www.quotebuilder.co/c/demo/rayonnage), sans compte. Pour brancher votre propre webhook : [créer un compte Free](https://www.quotebuilder.co/signup?plan=free).

## Webhook sortant ou API : deux sens différents

- **Le webhook sortant** part de QuoteBuilder vers vous, au moment où la demande arrive. Vous recevez sans rien demander.
- **L'API** est une porte que vous appelez : lire les dossiers, changer un statut, créer une demande depuis un autre outil. C'est vous qui décidez quand.

Pour un CRM, le schéma sain combine les deux : le webhook crée la fiche dès que la demande arrive, l'API sert à rapprocher et à faire remonter les statuts. Le détail des portes d'entrée (funnel, `/api/leads`, plugins, lien prérempli) est dans [l'article sur les sources d'une demande de devis](https://www.quotebuilder.co/blog/sources-demande-devis-b2b-funnel-api).

## Où se configure le webhook dans QuoteBuilder

La page s'ouvre depuis le menu **Support**, en bas de la barre latérale, entrée **« API & webhooks »**. Elle n'apparaît qu'aux administrateurs du compte.

On y trouve trois blocs :

1. **Clés API** (« MCP / Claude / ChatGPT ») : création d'une clé `qb_live_…`, affichée une seule fois, et révocation. C'est la clé qui servira plus loin pour l'API.
2. **Le formulaire d'ajout** : une URL de réception (l'exemple affiché est `https://crm.example.com/hooks/quotes`), un champ **« Secret HMAC »**, et le bouton « Ajouter ». Les deux champs sont obligatoires.
3. **« Webhooks sortants »** : la liste des URL enregistrées, avec un lien « Désactiver » ou « Activer » pour chacune. En dessous, un tableau des 50 derniers envois, avec la date, le statut (`success` ou `failed`), le code HTTP renvoyé par votre serveur et, en cas d'échec réseau, le message d'erreur.

Ce que la page ne propose pas, et qu'il vaut mieux savoir avant de commencer : on ne peut pas modifier l'URL ou le secret d'un webhook existant, ni le supprimer, ni envoyer une requête de test. Pour changer de secret, on ajoute un nouveau webhook et on désactive l'ancien. Pour tester, on envoie une vraie demande depuis le funnel, par exemple avec un lien prérempli et une adresse interne.

Vous pouvez enregistrer plusieurs webhooks. Chacun de ceux qui sont actifs reçoit chaque envoi, signé avec son propre secret.

## Quand le webhook part, et quand il ne part pas

Un seul événement existe : **`quote.submitted`**, une demande envoyée.

Il part quand un prospect envoie sa demande depuis un funnel QuoteBuilder, que la page soit hébergée par QuoteBuilder ou intégrée sur votre site par le widget. Il part aussi pour une demande transmise par le plugin WordPress en envoi direct, qui passe par le même circuit. Si le plugin WordPress avait déjà créé la demande au statut « Commencée », l'envoi a lieu quand elle est complétée, une fois.

L'ordre compte. Le webhook part en dernier, une fois le dossier complet : lignes de produits, fichiers rattachés, fourchette indicative enregistrée, PDF généré, emails ou automatisations lancés. Votre CRM reçoit donc un dossier fini, pas un brouillon.

Il ne part pas dans les cas suivants :

- une demande créée par l'API `/api/leads`, y compris par un assistant connecté en MCP qui s'en sert ;
- un changement de statut, une assignation, une note interne ;
- un parcours abandonné avant l'envoi : une session n'est pas une demande ;
- une relance ou un email d'automatisation.

Pour les statuts, il faut passer par l'API (voir plus bas).

## Ce que contient la requête

QuoteBuilder envoie une requête `POST` avec l'en-tête `Content-Type: application/json` et un corps JSON compact, sans indentation, construit ainsi :

```json
{
  "event": "quote.submitted",
  "quote": { "id": "…", "contact_name": "…", "status": "new", "score_label": "cold", "…": "…" },
  "answers": { "project_type": "intra", "timeline": "quarter" },
  "items": [ { "name": "…", "quantity": 8, "product_id": "…", "options": {}, "price_min": 350, "price_max": 450 } ],
  "files": [ { "id": "…", "fileName": "plan.pdf", "storagePath": "…" } ],
  "suggestion": { "id": "…", "name": "…", "headline": "…" }
}
```

L'exemple est indenté pour la lecture ; la vraie requête tient sur une ligne.

**`quote`** reprend le dossier tel qu'il est enregistré au moment de l'envoi : son identifiant, le funnel d'origine, les coordonnées (`contact_name`, `contact_email`, `contact_phone`, `contact_company`), le consentement marketing (`consent_marketing`), les réponses, les paramètres extraits (où figure la fourchette indicative figée à l'envoi), le score et son étiquette, le statut, les paramètres UTM, le référent, les identifiants de clic publicitaire s'ils existent, et la date de création. Le statut est le code technique du statut par défaut, en général `new` (Nouveau). L'étiquette de score vaut `hot`, `warm` ou `cold`.

**`answers`** contient les réponses du prospect, rangées par clé de question. Point qui surprend souvent : pour une question à choix, c'est la **valeur** de l'option qui est envoyée, pas son libellé. Le prospect a cliqué « Ce trimestre », votre CRM reçoit `quarter`. Prévoyez une table de correspondance entre valeurs et libellés, ou choisissez des valeurs lisibles quand vous créez vos questions.

**`items`** liste les lignes du dossier : nom, quantité, produit, options choisies, prix minimum et maximum. Ces prix sont **unitaires**. Le montant d'une ligne est le prix multiplié par la quantité, comme sur la fiche et dans l'espace prospect. Une ligne venue d'une boutique externe par le plugin peut n'avoir ni produit ni prix.

**`files`** donne, pour chaque fichier joint (le plan déposé à l'étape Personnalisation, par exemple), un identifiant, le nom du fichier et son chemin de stockage. Ce chemin n'est pas un lien de téléchargement : le stockage est privé. Le fichier se consulte dans le dossier, côté QuoteBuilder.

**`suggestion`** indique la solution recommandée retenue (identifiant, nom, titre) si une règle de suggestion a joué, sinon `null`.

Ce qui n'y figure pas : le lien de l'espace prospect, son code d'accès, le PDF, une adresse vers le dossier. Le CRM garde `quote.id`, et l'équipe ouvre le dossier dans **Demandes** pour voir le reste.

## La signature : pourquoi et comment

N'importe qui peut envoyer une requête `POST` à une URL. Sans contrôle, connaître l'adresse suffit pour remplir votre CRM de fausses demandes. La signature prouve que la requête vient de QuoteBuilder et que son contenu n'a pas été modifié.

QuoteBuilder calcule un **HMAC SHA-256** du corps de la requête avec le secret que vous avez saisi, et l'envoie en hexadécimal minuscule dans l'en-tête **`X-QuoteBuilder-Signature`**. Pas de préfixe du type `sha256=`, pas d'horodatage, pas d'identifiant d'envoi séparé. Seuls QuoteBuilder et vous connaissez le secret : si votre calcul donne la même valeur, la requête est authentique et intacte.

Le HMAC est décrit par la RFC 2104. Deux de ses recommandations s'appliquent directement à votre secret : il doit être choisi au hasard, et une clé plus courte que la sortie de la fonction de hachage est fortement déconseillée. Pour SHA-256, cela fait 32 octets au minimum. La RFC conseille aussi de renouveler la clé périodiquement.

### Vérifier côté serveur, en quatre étapes

1. **Lire le corps brut**, avant de le transformer en objet. Beaucoup de frameworks parsent le JSON automatiquement, et le JSON reconstruit n'a plus les mêmes octets.
2. **Calculer** le HMAC SHA-256 de ce corps brut avec le secret, en hexadécimal.
3. **Comparer** le résultat à l'en-tête reçu avec une fonction à temps constant. En Node.js, c'est `crypto.timingSafeEqual`, que la documentation présente comme adaptée à la comparaison de condensats HMAC ; elle exige deux valeurs de même longueur. En PHP, `hash_equals`.
4. **Refuser** la requête (réponse 401) si l'en-tête manque ou ne correspond pas, sans créer de fiche.

En Node.js, le cœur tient en quelques lignes :

```js
const attendue = crypto.createHmac("sha256", secret).update(corpsBrut).digest("hex");
const recue = String(req.headers["x-quotebuilder-signature"] || "").trim().toLowerCase();
const ok = /^[0-9a-f]{64}$/.test(recue)
  && crypto.timingSafeEqual(Buffer.from(attendue, "hex"), Buffer.from(recue, "hex"));
```

Si la vérification échoue alors que tout semble correct, collez le corps reçu, le secret de test et l'en-tête dans le [vérificateur de signature webhook](https://www.quotebuilder.co/outils/verificateur-signature-webhook-devis). Il recalcule la signature dans votre navigateur et repère les causes courantes : JSON réindenté, saut de ligne ajouté, espace dans le secret, préfixe inutile.

## Fiabilité : une seule tentative

C'est le point à intégrer avant de compter sur le webhook comme seule source de vérité. Pour chaque demande et chaque webhook actif, QuoteBuilder fait **un seul envoi**. Si votre serveur répond par une erreur, ou ne répond pas, l'envoi est noté « failed » dans le tableau de la page, et il n'est pas renvoyé automatiquement. Il n'y a pas non plus de bouton pour le rejouer.

Trois conséquences pratiques.

**Répondez vite, traitez ensuite.** Le webhook part pendant l'envoi de la demande. Un récepteur qui met longtemps à répondre retarde toute la chaîne. Le bon réflexe : vérifier la signature, enregistrer le corps dans une file ou une table, répondre 200 tout de suite, puis créer la fiche CRM dans un second temps. Tout code 2xx est compté comme un succès.

**Rapprochez chaque jour.** Une tâche planifiée appelle `GET /api/leads?days=2` avec la clé API et compare la liste aux fiches du CRM. Ce qui manque est récupéré par `GET /api/leads/{id}`. La liste renvoie jusqu'à 100 dossiers, avec identifiant, contact, statut, score, assignation, date et fourchette.

**Dédoublonnez sur `quote.id`.** Si vous faites tourner deux webhooks en même temps, par exemple pendant un changement de secret, votre récepteur reçoit la même demande deux fois. Une contrainte d'unicité sur l'identifiant du dossier suffit.

Dans le tableau des envois, un `failed` avec un code 401 signale presque toujours un problème de corps brut ou de secret ; un 404 ou 405, une mauvaise URL ; un message d'erreur sans code, un serveur injoignable.

## Faire remonter les statuts vers le CRM, ou l'inverse

Le webhook ne prévient pas quand un dossier passe Contacté, En cours, En attente, Gagné ou Perdu. Deux façons de garder les deux outils d'accord.

**Le CRM lit QuoteBuilder.** `GET /api/leads?status=won` renvoie les dossiers gagnés, `?status=lost` les perdus. Les codes de statut sont `new`, `contacted`, `in_progress`, `waiting`, `won` et `lost`. On peut aussi filtrer par score (`hot`, `warm`, `cold`) et par ancienneté en jours.

**Le CRM écrit dans QuoteBuilder.** Si l'équipe vit dans le CRM, faites-le pousser le statut : `PATCH /api/leads/{id}` avec un corps `{"status": "won"}`, et éventuellement une `note`. Le changement est tracé dans l'historique du dossier, la note devient une note interne, et les automatisations « Statut modifié » se déclenchent comme si le changement avait été fait à la main. Si Google Ads est connecté, le passage en Gagné envoie aussi la conversion « affaire gagnée ».

Choisissez un seul sens par information : si les deux outils changent le statut, décidez lequel fait foi.

## Faire correspondre les champs

Avant d'écrire du code, faites le tableau de correspondance.

| Donnée QuoteBuilder | Où la trouver dans le JSON | Champ CRM habituel |
|---|---|---|
| Identifiant du dossier | `quote.id` | Identifiant externe, clé de dédoublonnage |
| Nom, email, téléphone, société | `quote.contact_name`, `contact_email`, `contact_phone`, `contact_company` | Contact et compte |
| Consentement marketing | `quote.consent_marketing` | Case d'opt-in |
| Funnel d'origine | `quote.configurator_id` | Source ou campagne interne |
| Score | `quote.score`, `quote.score_label` | Priorité, étiquette |
| Campagne | `quote.utm_source`, `utm_medium`, `utm_campaign` | Origine marketing |
| Réponses | `answers` (valeurs, pas libellés) | Champs personnalisés ou description |
| Lignes | `items` (prix unitaires × quantité) | Produits de l'opportunité |
| Solution retenue | `suggestion.name` | Titre de l'opportunité |
| Fichiers | `files` (noms seulement) | Note « voir le dossier QuoteBuilder » |

`consent_marketing` est faux par défaut : ne cochez pas l'opt-in newsletter d'un contact qui n'a fait qu'une demande de devis.

## Sécurité et données personnelles

La requête contient des données personnelles (nom, email, téléphone) : le récepteur fait partie de votre traitement, comme le CRM. La fiche de la CNIL consacrée aux API, dans son guide de la sécurité des données personnelles, donne une base raisonnable :

- **ne partager que le nécessaire** : si le CRM n'a pas besoin des identifiants de clic publicitaire, ne les stockez pas ;
- **tenir des journaux** des échanges, pour retrouver une demande et repérer un comportement anormal ;
- **documenter** le format des requêtes, pour éviter les erreurs d'interprétation quand quelqu'un reprend le code ;
- **protéger les secrets** dans un coffre-fort ou un gestionnaire de secrets plutôt que dans le code.

Utilisez une URL en `https`. Si une clé API ou un secret a circulé (ticket, capture d'écran, dépôt Git), révoquez la clé et remplacez le webhook par un nouveau, avec un nouveau secret.

## Changer de secret sans perdre de demandes

Comme le secret d'un webhook ne se modifie pas, la rotation se fait en quatre temps :

1. côté récepteur, accepter **deux** secrets : l'ancien et le nouveau ;
2. dans QuoteBuilder, ajouter un webhook avec la même URL et le nouveau secret ;
3. après une demande de contrôle reçue deux fois et vérifiée avec chacun des secrets, désactiver l'ancien webhook ;
4. retirer l'ancien secret du récepteur.

Pendant l'étape 3, chaque demande arrive en double : la contrainte d'unicité sur `quote.id` fait le tri.

## Sans serveur : outils d'automatisation

Un outil d'automatisation qui fournit une URL de réception convient s'il sait lire le corps brut et calculer un HMAC SHA-256. Sinon, intercalez une petite fonction qui vérifie la signature, ou appelez `/api/leads` à intervalle régulier : moins immédiat, mais sans URL publique à protéger. Pour chiffrer ce que coûte aujourd'hui la recopie manuelle, l'[estimateur du coût de la double saisie](https://www.quotebuilder.co/outils/estimateur-cout-double-saisie-devis) part de vos propres volumes.

## Un exemple de bout en bout

Prenons un organisme de formation qui utilise le template Formation (le détail est dans la [landing funnel de devis formation professionnelle](https://www.quotebuilder.co/secteurs/funnel-devis-formation-professionnelle)). Les chiffres qui suivent sont des hypothèses d'illustration.

Une responsable RH choisit « Intra-entreprise » et « Ce trimestre », indique huit participants sur un programme de deux jours affiché 350 à 450 € par personne, et envoie. QuoteBuilder enregistre le dossier (fourchette de 2 800 à 3 600 €, soit 8 × 350 à 8 × 450), génère le PDF, envoie les emails, puis poste le webhook. Le récepteur vérifie la signature, stocke le corps, répond 200, puis crée contact, société et opportunité, avec `intra` traduit en « Intra-entreprise ». Le jour où le commercial passe l'opportunité en gagnée, le CRM appelle `PATCH /api/leads/{id}` avec `won`, et le dossier passe Gagné dans QuoteBuilder.

## Erreurs fréquentes

- **Vérifier la signature sur le JSON reparsé.** Le corps reconstruit diffère d'un espace ou d'un ordre de clés, et rien ne passe. Gardez le corps brut.
- **Chercher un préfixe `sha256=`.** QuoteBuilder envoie l'hexadécimal seul.
- **Créer la fiche CRM avant de répondre.** Un CRM lent fait échouer l'envoi, qui ne sera pas renvoyé.
- **Compter sur le webhook pour les demandes API.** Une demande créée par `/api/leads` ne déclenche pas de webhook.
- **Afficher les valeurs brutes.** `quarter` dans une fiche CRM, personne ne le lit. Traduisez.
- **Un secret court ou réutilisé.** Prenez 32 octets aléatoires, un secret par webhook.

## Checklist avant de passer en production

1. URL en `https`, qui répond 2xx en moins d'une seconde.
2. Secret aléatoire d'au moins 32 octets, stocké hors du code.
3. Vérification HMAC sur le corps brut, comparaison à temps constant, refus en 401.
4. Corps enregistré avant tout traitement, réponse immédiate.
5. Contrainte d'unicité sur `quote.id`.
6. Table de correspondance des valeurs de réponses et des statuts.
7. Rapprochement quotidien avec `GET /api/leads`.
8. Demande de test envoyée depuis le funnel, ligne `success` dans le tableau des envois.

**Branchez votre CRM sur vos demandes de devis :** [créer un compte Free](https://www.quotebuilder.co/signup?plan=free) · [voir la démo](https://www.quotebuilder.co/c/demo/rayonnage) · [tester une signature](https://www.quotebuilder.co/outils/verificateur-signature-webhook-devis).

## FAQ

### Quel événement le webhook de QuoteBuilder envoie-t-il ?

Un seul : `quote.submitted`, quand une demande est envoyée depuis un funnel ou transmise par le plugin WordPress en envoi direct. Il n'y a pas d'événement pour les changements de statut.

### Comment vérifier la signature d'un webhook QuoteBuilder ?

Calculez le HMAC SHA-256 du corps brut avec votre secret, en hexadécimal, et comparez-le à l'en-tête `X-QuoteBuilder-Signature` avec une fonction à temps constant. S'ils diffèrent, refusez la requête.

### Pourquoi ma signature ne correspond-elle jamais ?

Le plus souvent, le corps a été parsé puis reconstruit avant le calcul. Signez les octets reçus, sans les transformer. Vérifiez ensuite le secret, sans espace en trop.

### QuoteBuilder renvoie-t-il un webhook en échec ?

Non. Chaque webhook actif reçoit un seul envoi par demande. Un échec apparaît dans le tableau des envois, et se rattrape par l'API `/api/leads`.

### Peut-on tester un webhook sans vraie demande ?

Il n'y a pas de bouton de test. Envoyez une demande depuis votre funnel avec une adresse interne, puis regardez la ligne correspondante dans le tableau des envois.

### Les fichiers joints sont-ils envoyés au CRM ?

Non. Le JSON donne leur nom et leur chemin de stockage, qui n'est pas un lien public. Les fichiers se consultent dans le dossier QuoteBuilder.

### Les réponses arrivent-elles avec leurs libellés ?

Non, avec les valeurs des options. « Ce trimestre » arrive sous la forme `quarter`. Prévoyez une table de correspondance côté CRM.

### Une demande créée par l'API déclenche-t-elle le webhook ?

Non. Seuls les envois de funnel et du plugin WordPress en envoi direct déclenchent `quote.submitted`. Ce que vous créez par `/api/leads`, vous le connaissez déjà.

### Comment faire remonter un statut gagné du CRM vers QuoteBuilder ?

Appelez `PATCH /api/leads/{id}` avec `{"status": "won"}` et votre clé API. Le dossier change de statut et les automatisations « Statut modifié » se déclenchent.

### Peut-on changer l'URL ou le secret d'un webhook ?

Pas directement. Ajoutez un nouveau webhook, vérifiez qu'il reçoit bien, puis désactivez l'ancien.

## Sources

- H. Krawczyk, M. Bellare, R. Canetti, « HMAC: Keyed-Hashing for Message Authentication », RFC 2104, février 1997 (sections 2 et 3 : définition, longueur et renouvellement des clés). https://www.rfc-editor.org/rfc/rfc2104
- Node.js, documentation de l'API Crypto, `crypto.timingSafeEqual(a, b)` (comparaison à temps constant, adaptée aux condensats HMAC). https://nodejs.org/docs/latest-v22.x/api/crypto.html
- CNIL, Guide de la sécurité des données personnelles, fiche « Sécurité : API, interfaces de programmation applicative ». https://www.cnil.fr/fr/securite-api-interfaces-de-programmation-applicative

## Pour aller plus loin

- [Sources d'une demande de devis : funnel, API, plugins](https://www.quotebuilder.co/blog/sources-demande-devis-b2b-funnel-api)
- [Créer un devis avec Claude et MCP](https://www.quotebuilder.co/blog/creer-devis-avec-claude-mcp)
- [Centraliser les demandes de devis multi-canaux](https://www.quotebuilder.co/blog/centraliser-demandes-devis-multi-canaux)
- [Les statuts du pipeline de devis](https://www.quotebuilder.co/blog/statuts-pipeline-devis-b2b)
- [Vérificateur de signature webhook](https://www.quotebuilder.co/outils/verificateur-signature-webhook-devis)
- [Funnel de devis formation professionnelle](https://www.quotebuilder.co/secteurs/funnel-devis-formation-professionnelle)
- [Intégrations](https://www.quotebuilder.co/fonctionnalites/integrations)
