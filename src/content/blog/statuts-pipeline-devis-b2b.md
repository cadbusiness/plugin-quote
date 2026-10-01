---
title: "Les 7 statuts d'un pipeline devis B2B (et pourquoi « Accepté » / « Signé » ne sont pas des statuts)"
slug: statuts-pipeline-devis-b2b
description: "Process métier pour nommer et faire vivre les 7 statuts CRM d'un pipeline devis (Commencée → Gagné/Perdu) : playbook, anti-patterns, sans confondre Accepté / Signé."
canonical: /blog/statuts-pipeline-devis-b2b
locale: fr-FR
word_count_target: 2550
keywords:
  - statuts pipeline devis
  - CRM devis B2B
  - statut devis Gagné Perdu
  - pipeline commercial devis
  - Accepté Signé devis
  - En attente vs En cours
  - revue pipeline devis
author: QuoteBuilder
date: 2026-09-30
updated: 2026-09-30
---

# Les 7 statuts d'un pipeline devis B2B (et pourquoi « Accepté » / « Signé » ne sont pas des statuts)

Vendredi 17 h 20. Le directeur commercial ouvre le pipeline. 92 dossiers « En cours ». Dont un depuis six mois. Dont trois sans propriétaire. Dont une colonne Excel « Accepté » ajoutée par un stagiaire l'an dernier, jamais définie. Personne n'ose marquer **Perdu** : ça casse le moral, et le CA « ouvert » a l'air plus beau.

Ce n'est pas un problème de motivation. C'est un problème de **vocabulaire**. Tant que l'équipe n'a pas la même liste de statuts, la même règle de passage, et le même courage de sortir les morts, le pipeline ment.

Ce guide décrit les **7 statuts CRM** d'un pipeline devis B2B tels qu'ils existent dans QuoteBuilder (liste fixe), le playbook pour chacun, la différence entre statut et score Hot / Warm / Cold, et pourquoi les libellés « Accepté » et « Signé » ne doivent jamais être présentés comme des statuts. Public : PME B2B, industrielles, menuiserie, stores, rayonnage, agencement, services configurables. Pas de théorie CRM abstraite. Un process métier + logiciel.


**Clarifier les statuts avant la prochaine revue :** [créer un compte Free](https://www.quotebuilder.co/signup?plan=free) ou [ouvrir la démo funnel rayonnage](https://www.quotebuilder.co/c/demo/rayonnage) (sans compte).


## Le problème : un pipeline gonflé n'est pas un pipeline riche

Un pipeline « riche » en lignes est souvent **pauvre en décisions**.

1. **« En cours » trop longtemps** : parking. Ballon chez vous ou chez le client ? Personne ne sait.
2. **Colonnes inventées** : Accepté, Signé, Quasi gagné, En attente signature… chacun sa définition.
3. **Peur du Perdu** : du faux espoir qui mange relances et réunions.
4. **Gagné non closé** : le client a dit oui, le CRM reste En cours. Les stats mentent.
5. **Score et statut mélangés** : Hot n'est pas un statut ; En attente n'est pas Cold par magie.

Coût des fantômes : [estimateur pipeline fantôme](https://www.quotebuilder.co/outils/estimateur-cout-pipeline-fantome-devis). Rituel de sortie : [revue de pipeline](https://www.quotebuilder.co/blog/revue-pipeline-devis-b2b).

<!-- PLACEHOLDER IMAGE: schéma des 7 statuts CRM pipeline devis + sorties Gagné/Perdu (shoot Content) -->

## Les 7 statuts CRM réels (liste fixe)

Dans QuoteBuilder, les statuts CRM sont une **liste fixe** :

1. **Commencée**
2. **Nouveau**
3. **Contacté**
4. **En cours**
5. **Gagné**
6. **Perdu**
7. **En attente**

Pas de huitième statut « Accepté ». Pas de neuvième « Signé ». Ces deux mots existent ailleurs (libellé d'espace prospect, libellé de graphique), pas dans la liste CRM. On y revient plus bas.

Chaque statut a une règle de passage, une prochaine action typique, et des anti-patterns. Sans ça, la liste reste du décor.

### 1. Commencée

**Quand :** le parcours a démarré (funnel commencé, brouillon de parcours), sans être encore une opportunité propre. Souvent : abandon mid-funnel, ou dossier ouvert sans brief minimum. Pas de saisie manuelle de devis.

**Prochaine action typique :** compléter le brief ou abandonner proprement. Voir [qualifier une demande avant chiffrage](https://www.quotebuilder.co/blog/qualifier-demande-devis-avant-chiffrage).

**Anti-patterns :** laisser pourrir sans owner ; compter dans le CA ouvert ; traiter comme Hot parce que « ils ont commencé le formulaire ».

### 2. Nouveau

**Quand :** demande entrée dans le CRM (funnel, API, intégrations), assez d'info pour qu'un commercial la prenne. Pas encore de premier contact qualifiant. Les devis ne se saisissent pas à la main et ne s'importent pas : ils naissent du funnel (y compris par lien prérempli), de /api/leads, des intégrations plugin ou du chat agent.

**Prochaine action typique :** owner, lecture du brief, rappel / mail / abandon. Le [score Hot / Warm / Cold](https://www.quotebuilder.co/blog/score-demande-devis-b2b) **ordonne** la file ; il ne remplace pas le statut.

**Anti-patterns :** Nouveau invisible 10 jours ; sauter en En cours sans contact ; un Nouveau par e-mail vague sans brief.

### 3. Contacté

**Quand :** un premier échange réel a eu lieu. Le prospect sait que vous avez le dossier. Vous êtes encore en cadrage, devis pas encore « chez le client » comme étape stable.

**Prochaine action typique :** clarifier le besoin, pièces manquantes, visite si besoin, ou préparer le chiffrage. Voir [pièces jointes, plans et photos](https://www.quotebuilder.co/blog/pieces-jointes-plans-photos-devis-b2b).

**Anti-patterns :** Contacté après un mail auto sans suite humaine ; rester Contacté alors que le devis est parti depuis des semaines (passez En cours ou En attente selon le ballon).

### 4. En cours

**Quand :** le travail (chiffrage, validation interne, option, relance active) **est chez vous**.

**Prochaine action typique :** une action datée. Voir [validation interne](https://www.quotebuilder.co/blog/validation-interne-avant-envoi-devis-b2b) et [lien sécurisé vs PDF](https://www.quotebuilder.co/blog/envoyer-devis-lien-securise-vs-pdf-email).

**Anti-patterns :** « on verra » ; En cours alors que le ballon est chez Achats / le décideur (**En attente**) ; 90 jours sans prochaine action.

### 5. En attente

**Quand :** le ballon est **chez le client ou un tiers** (décideur, Achats, architecte…). Vous avez fait votre part. Ce n'est pas un parking sans owner.

**Prochaine action typique :** date de revue / relance. Multi-décideurs : [approbation multi-décideurs](https://www.quotebuilder.co/blog/approbation-client-multi-decideurs-devis-b2b). Surveillez la [validité / expiration](https://www.quotebuilder.co/blog/validite-expiration-devis-b2b).

**Anti-patterns :** pas de date de rappel ; confondre avec En cours ; empiler des En attente « pour ne pas perdre espoir ».

### 6. Gagné

**Quand :** le commercial (ou le process interne) **décide** que c'est gagné (commande, accord clair, passage prod / factu). Ce n'est **pas** une signature électronique automatique du prospect, ni un clic « Accepté » qui pousse le CRM tout seul.

**Prochaine action typique :** handoff atelier / admin / facturation ; sortir du stock ouvert.

**Anti-patterns :** rester En cours « le temps du bon de commande » ; colonne Accepté à la place ; Gagné sans owner ni date.

### 7. Perdu

**Quand :** le commercial tranche (hors budget, concurrent, annulé, silence trop long, hors zone). **Perdu libère de la capacité.** Ce n'est pas une punition.

**Prochaine action typique :** motif court ; rappel long terme seulement si le projet peut revenir.

**Anti-patterns :** ne jamais marquer Perdu ; recycler sans nouvel événement ; poubelle sans motif.

## « Accepté » et « Signé » : libellés, pas statuts

C'est le point où beaucoup d'équipes se trompent.

- **« Accepté »** : **libellé d'espace prospect** quand le devis est déjà **Gagné** côté CRM. Pas un statut que le prospect pose en cliquant. Pas une étape entre En cours et Gagné.
- **« Signé »** : **libellé de graphique de stats**. Pas une colonne CRM. Pas une preuve de signature électronique.

Conséquence produit : **pas d'acceptation / signature en ligne du prospect** qui change le CRM toute seule. Le commercial pose **Gagné** ou **Perdu**. L'[espace prospect](https://www.quotebuilder.co/blog/espace-prospect-devis-en-ligne) et les relecteurs aident à lire et se coordonner ; ils ne remplacent pas le jugement commercial.

Relecteurs (DF, responsable technique…) : **Valider le dossier** ou **Modifications**, avec commentaire et budget max, badges vu / approuvé / modifs. Pas de signature prospect, pas de commentaires ancrés aux lignes (fil plat).

Si Excel a encore une colonne Accepté / Signé, renommez-la ou supprimez-la. Sinon la revue passera son temps à traduire.

<!-- PLACEHOLDER IMAGE: capture espace prospect libellé Accepté vs statut CRM Gagné (shoot Content) -->

## Score Hot / Warm / Cold : triage, pas statut

Le [score de demande](https://www.quotebuilder.co/blog/score-demande-devis-b2b) (Hot / Warm / Cold) **n'est pas un statut CRM**.

Dans QuoteBuilder, c'est une étiquette automatique issue d'une **formule fixe** : surface, load, access, project_type (entrepôt / cuisine pro / commerce), constraints, longueur du besoin. Il **ignore** photos, zone, urgence. **Pas configurable**. **Pas de SLA produit** : urgence, zone et délais restent du triage d'équipe.

Ça sert à **ordonner** la file, doser la [relance Hot](https://www.quotebuilder.co/blog/relancer-devis-hot-depuis-dossier), et préparer la [revue pipeline](https://www.quotebuilder.co/blog/revue-pipeline-devis-b2b). Un Hot En attente depuis 45 jours sans prochaine action n'est pas « plus gagné ».

## En cours vs En attente : où est le ballon ?

Règle simple :

| Question | Statut |
|----------|--------|
| C'est à **nous** de jouer ? | **En cours** |
| C'est au **client / tiers**, avec date de revue ? | **En attente** |
| Deal tranché ? | **Gagné** ou **Perdu** |

Exemples : devis chez Achats → **En attente** + date de relance ; retour client à recalculer → **En cours** ; relecteur en Modifications → souvent **En cours** ; silence après validité dépassée → relance courte ou **Perdu**. Sans cette distinction, tout le monde dit « c'est en cours » et personne ne sait qui doit bouger.

## Ce que le suivi de lecture donne (et ne donne pas)

Sur l'espace prospect / suivi, QuoteBuilder affiche surtout une **dernière consultation** en texte relatif. Pas de première ouverture, pas de compteur, pas d'historique détaillé, pas d'alertes à chaque consultation, pas de pixel e-mail. Badges relecteurs et notifications (invitation, approbation, modifs, validation) sont souvent plus actionnables qu'un fantasme d'open-tracking.

Ne créez pas un statut « Vu ». Gardez la dernière consultation comme **indice**, puis une prochaine action. Cadre : [suivi d'ouverture / lecture](https://www.quotebuilder.co/blog/suivi-ouverture-lecture-devis-en-ligne-b2b).


**Mettre les 7 statuts au travail sur vos vrais dossiers :** [essai Free](https://www.quotebuilder.co/signup?plan=free) · [démo rayonnage](https://www.quotebuilder.co/c/demo/rayonnage) · [estimateur pipeline fantôme](https://www.quotebuilder.co/outils/estimateur-cout-pipeline-fantome-devis).


## Playbook de passage (mini-matrice)

Voici une matrice courte que vous pouvez coller dans votre wiki interne.

| De → Vers | Déclencheur | Ne pas faire |
|-----------|-------------|--------------|
| → Nouveau | Demande exploitable entrée | Créer un Nouveau par e-mail « tarif ? » sans brief |
| Nouveau → Contacté | Premier échange humain utile | Mail auto sans suite |
| Contacté → En cours | Chiffrage / cadrage actif chez vous | Passer En cours sans owner |
| En cours → En attente | Devis / question chez le client | En attente sans date de revue |
| En attente → En cours | Retour client / travail à refaire | Rester En attente par habitude |
| * → Gagné | Décision commerciale claire | Attendre un clic « signature » produit |
| * → Perdu | Décision d'abandon | Recycler sans nouvel événement |

Les étoiles `*` : depuis Contacté, En cours ou En attente, selon votre réalité. Un Nouveau peut aussi passer Perdu (hors zone, spam, doublon) sans traverser tout le pipeline.

## KPIs utiles (sans tableau de bord magique)

1. **% d'ouverts sans maj de statut depuis X jours** (ex. 30) : stock fantôme.
2. **Âge moyen En cours / En attente**.
3. **Ratio Gagné / (Gagné + Perdu)** : sans Perdu, le ratio ment.
4. **Stock En attente** sans date de prochaine action.
5. **Délai Nouveau → Contacté** (règle d'équipe, pas un SLA produit).

L'[estimateur coût pipeline fantôme](https://www.quotebuilder.co/outils/estimateur-cout-pipeline-fantome-devis) convertit une partie de ça en heures et euros indicatifs.

## Ritual : la revue hebdo force les sorties

Sans [revue pipeline](https://www.quotebuilder.co/blog/revue-pipeline-devis-b2b), même la meilleure liste pourrit. Agenda type 35 minutes : Hot à risque ; Warm bloqués ; Nouveau / Contacté en retard ; sorties forcées **Gagné** / **Perdu** ; capacité de chiffrage de la semaine. On ne quitte pas avec un « on verra » : statut à jour + prochaine action datée.

## Mise en place en 2 semaines

### Semaine 1 : vocabulaire et ménage

- Afficher les 7 statuts. Interdire Accepté / Signé comme colonnes CRM.
- 15 minutes sur En cours vs En attente (où est le ballon).
- Filtrer les dossiers > 45 jours sans maj : viser ~30 % traités (sortie ou prochaine action datée).
- Owner sur chaque ouvert sans owner.

### Semaine 2 : rituel et mesure

- Première revue hebdo score + statut (pas Excel alphabétique).
- Relecteurs sur les multi-décideurs (Valider / Modifications), sans croire que ça « signe ».
- 3 KPIs simples : fantômes 30 j, âge En cours, ratio Gagné/(Gagné+Perdu).
- Relancer les Hot En attente avec une question métier. Voir [pourquoi les devis meurent sans relance](https://www.quotebuilder.co/blog/pourquoi-les-devis-meurent-sans-relance).

<!-- PLACEHOLDER IMAGE: checklist 2 semaines ménage pipeline + première revue (shoot Content) -->

## Erreurs fréquentes (et comment les couper)

1. **Ajouter des statuts « pour coller à notre métier »** : vous recréez Excel. Gardez les 7 ; encodez la nuance dans la prochaine action et le commentaire.
2. **Confondre score et statut** : Hot n'est pas En cours. Cold n'est pas Perdu.
3. **Attendre une signature produit** pour poser Gagné : le commercial pose Gagné quand le deal est clair.
4. **Inventer un statut Vu / Ouvert** à partir de la dernière consultation : indice, pas statut.
5. **Ne jamais marquer Perdu** : vous payez des relances et des réunions sur du mort. Le [coût](https://www.quotebuilder.co/outils/estimateur-cout-pipeline-fantome-devis) se voit vite.
6. **Gagné sans handoff** : le statut bouge, l'ops non. Le client vit un trou.
7. **En attente sans date** : c'est un En cours déguisé, en pire.
8. **Croire aux versions Vn ou à une signature prospect magique** : ce n'est pas le modèle produit. Devis clair, relecteurs, statut CRM tenu à jour.
9. **Mélanger validation interne et statut client** : la validation protège l'envoi ; restez **En cours** avec une prochaine action « validation », sans inventer un 8e statut.
10. **Promettre un SLA logiciel lié au score** : score fixe, non configurable ; vos délais restent des règles d'équipe.

## Exemple de journée qui fonctionne

Matin : les **Nouveau** Hot / Warm passent en **Contacté** (ou **Perdu** hors zone en quelques minutes). Un chiffrage rayonnage reste **En cours** le temps d'une validation interne. Après envoi du lien prospect : **En attente** avec relance J+3 et relecteurs invités (badges, pas de signature magique). En revue : un silence de 52 jours devient **Perdu** ; un accord mail clair devient **Gagné** avec handoff atelier le jour même. Rien de spectaculaire. Juste un pipeline qui dit la vérité.


**Moins de fantômes, plus de sorties claires :** [créer un compte Free](https://www.quotebuilder.co/signup?plan=free) · [voir la démo](https://www.quotebuilder.co/c/demo/rayonnage) · [estimer le coût des dossiers fantômes](https://www.quotebuilder.co/outils/estimateur-cout-pipeline-fantome-devis).


## FAQ

### Combien de statuts faut-il dans un pipeline devis B2B ?

Sept suffisent si chacun a une règle claire : Commencée, Nouveau, Contacté, En cours, En attente, Gagné, Perdu. Au-delà, vous recréez souvent des nuances qui devraient vivre dans la prochaine action.

### Pourquoi « Accepté » n'est pas un statut CRM ?

Parce que c'est un libellé d'espace prospect quand le devis est déjà Gagné. Ce n'est pas une étape intermédiaire que le prospect active pour pousser le CRM.

### Et « Signé » ?

Un libellé de graphique de stats, pas une colonne CRM, pas une preuve de signature électronique prospect dans le produit.

### Qui pose Gagné et Perdu ?

Le commercial (ou le process interne). Pas une acceptation en ligne automatique du prospect. Les relecteurs valident le dossier ou demandent des Modifications ; ils ne remplacent pas la décision commerciale.

### Quelle différence entre En cours et En attente ?

En cours : le ballon est chez vous. En attente : chez le client ou un tiers, avec une date de revue. Sans cette distinction, tout devient un parking.

### Le score Hot / Warm / Cold remplace-t-il le statut ?

Non. Le score trie et priorise. Le statut dit où en est le deal dans le cycle. Dans QuoteBuilder le score suit une formule fixe (surface, load, access, project_type, constraints, longueur du besoin) ; il ignore photos, zone, urgence ; il n'est pas configurable et n'embarque pas de SLA produit.

### Faut-il un statut « Vu » quand le prospect ouvre le devis ?

Non. Une dernière consultation relative est un indice utile, pas un statut. Posez plutôt En attente / En cours avec une prochaine action.

### Comment forcer les sorties Perdu sans casser le moral ?

Ritualisez : revue hebdo, âge max, motif court, et rappel que Perdu libère du temps pour les Hot. Montrez le coût des fantômes avec l'estimateur.

### Les relecteurs changent-ils le statut CRM ?

Ils aident le circuit client (Valider / Modifications, badges, notifications). Le passage Gagné / Perdu reste une décision commerciale. Pas de signature prospect, pas de commentaires ancrés aux lignes.

### Combien de temps pour assainir un pipeline gonflé ?

Souvent deux semaines pour le vocabulaire, le ménage des plus vieux, et la première vraie revue. Le maintien est hebdomadaire : sans rituel, les fantômes reviennent.


## Pour aller plus loin

- [Revue de pipeline devis B2B](https://www.quotebuilder.co/blog/revue-pipeline-devis-b2b)
- [Score d'une demande de devis B2B](https://www.quotebuilder.co/blog/score-demande-devis-b2b)
- [Relancer un devis Hot depuis le dossier](https://www.quotebuilder.co/blog/relancer-devis-hot-depuis-dossier)
- [Espace prospect devis en ligne](https://www.quotebuilder.co/blog/espace-prospect-devis-en-ligne)
- [Validation interne avant envoi](https://www.quotebuilder.co/blog/validation-interne-avant-envoi-devis-b2b)
- [Suivi d'ouverture / lecture devis en ligne](https://www.quotebuilder.co/blog/suivi-ouverture-lecture-devis-en-ligne-b2b)
- [Approbation client multi-décideurs](https://www.quotebuilder.co/blog/approbation-client-multi-decideurs-devis-b2b)
- [Validité et expiration d'un devis B2B](https://www.quotebuilder.co/blog/validite-expiration-devis-b2b)
- [Pourquoi les devis meurent sans relance](https://www.quotebuilder.co/blog/pourquoi-les-devis-meurent-sans-relance)
- [Qualifier une demande avant chiffrage](https://www.quotebuilder.co/blog/qualifier-demande-devis-avant-chiffrage)
- [Estimateur coût pipeline fantôme devis](https://www.quotebuilder.co/outils/estimateur-cout-pipeline-fantome-devis)
