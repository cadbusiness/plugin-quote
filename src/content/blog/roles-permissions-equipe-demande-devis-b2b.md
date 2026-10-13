---
title: "Rôles et permissions d'équipe : traiter les demandes de devis B2B sans tout ouvrir à tout le monde"
slug: roles-permissions-equipe-demande-devis-b2b
description: "Propriétaire, Admin, Commercial : ce que chaque rôle ouvre dans QuoteBuilder, écran par écran, comment inviter un membre depuis Équipe, changer un rôle ou suspendre un accès, ce que le rôle Commercial ne cache pas, et une répartition simple selon la taille de l'équipe."
canonical: /blog/roles-permissions-equipe-demande-devis-b2b
locale: fr-FR
word_count_target: 2800
keywords:
  - rôles utilisateurs logiciel devis
  - permissions équipe commerciale
  - gestion des accès CRM devis
  - inviter un commercial
  - rôle admin commercial
  - demande de devis B2B équipe
  - compte partagé logiciel
author: QuoteBuilder
date: 2026-10-13
updated: 2026-10-13
---

# Rôles et permissions d'équipe : traiter les demandes de devis B2B sans tout ouvrir à tout le monde

Dans beaucoup de PME, le logiciel de devis commence avec un seul identifiant. Le dirigeant l'a créé, il l'a donné au premier commercial, puis au deuxième, puis à l'assistante qui saisit les demandes reçues par téléphone. Six mois plus tard, quatre personnes utilisent le même mot de passe, personne ne sait qui a modifié le prix d'une option dans le catalogue, et le funnel du site affiche une question supprimée « pour tester » un vendredi soir.

Le problème inverse existe aussi. Un commercial qui n'a pas d'accès attend que quelqu'un lui transfère la demande par email, ou qu'un responsable lui ouvre le dossier. La réponse au prospect part le lendemain au lieu du matin même.

Cet article explique comment QuoteBuilder découpe les accès d'une équipe en trois rôles, ce que chacun ouvre écran par écran, comment inviter et gérer un membre depuis la page Équipe, et ce que les rôles ne font pas. L'objectif est simple : que chacun ait exactement ce qu'il lui faut pour traiter les demandes de devis, et pas plus.

**Voir un funnel côté prospect :** [démo funnel rayonnage](https://www.quotebuilder.co/c/demo/rayonnage), sans compte. Pour inviter votre équipe dans votre propre espace : [créer un compte Free](https://www.quotebuilder.co/signup?plan=free).

## Pourquoi un identifiant partagé finit toujours mal

Un compte partagé paraît pratique tant que l'équipe tient autour d'une table. Il pose trois problèmes dès qu'elle grandit.

**Personne n'est responsable de rien.** Quand une demande est passée au statut Perdu par erreur, le journal indique une action faite par « le compte ». Impossible de savoir qui l'a faite, ni de lui demander pourquoi. Les statistiques par commercial n'ont plus de sens non plus : un seul utilisateur porte toutes les affaires gagnées et perdues.

**Tout le monde peut tout casser.** Le funnel public, le catalogue, les règles de suggestion de produits et les parcours d'Autopilote sont des réglages qui touchent chaque prospect. Une modification faite pour un cas particulier s'applique à toutes les demandes suivantes. Avec un compte partagé, la personne qui traite les demandes a les mêmes droits que celle qui configure l'outil.

**Le départ d'une personne devient un chantier.** Quand un commercial quitte l'entreprise avec le mot de passe commun, il faut le changer et le redonner à tous les autres. Les notifications d'assignation partent vers une adresse qui n'existe plus.

Des comptes nominatifs avec des rôles distincts règlent ces trois points. Chaque action est rattachée à une personne, les réglages sensibles sont réservés à ceux qui les maintiennent, et un départ se traite sur une seule fiche.

## Trois rôles, pas un de plus

QuoteBuilder propose trois rôles d'équipe. Leur description, telle qu'elle apparaît dans l'application :

| Rôle | Description dans l'application |
|------|-------------------------------|
| Propriétaire | « Tout l'espace. Le compte ne peut pas être rétrogradé ni suspendu. » |
| Admin | « Configure funnels, catalogue, équipe et automatisations. Traite aussi les demandes. » |
| Commercial | « Traite les demandes, relance les abandons, envoie des emails. Pas d'accès aux réglages. » |

**Le Propriétaire** est la personne qui a créé l'espace. Ce rôle ne se distribue pas : la fenêtre d'invitation ne propose que Commercial et Admin. Sur la fiche du Propriétaire, la page Équipe indique « Le propriétaire ne peut pas être modifié. » Il n'existe pas, dans l'interface, de bouton pour transférer la propriété à quelqu'un d'autre. Si le dirigeant qui a ouvert le compte n'est pas celui qui l'administrera au quotidien, nommez un Admin plutôt que de partager l'identifiant du Propriétaire.

**L'Admin** a les mêmes accès que le Propriétaire dans les écrans de l'application. Il configure les funnels, le catalogue, les automatisations, les boutiques, l'API et l'équipe. Il traite aussi les demandes. C'est le rôle de la personne qui maintient l'outil : souvent le dirigeant, parfois un responsable commercial ou un assistant de direction à l'aise avec les réglages.

**Le Commercial** traite les demandes. Il voit le tableau de bord, la liste des demandes et leurs fiches, les abandons, les emails marketing, la segmentation, les statistiques et ses propres canaux. Il ne voit pas les écrans de configuration.

Il n'y a pas de rôle personnalisé, pas de rôle « lecture seule » et pas de rôle technique. Trois rôles suffisent pour l'essentiel des équipes qui reçoivent des demandes de devis : quelqu'un qui possède le compte, une ou deux personnes qui le configurent, et des personnes qui vendent.

## Ce que chaque rôle ouvre, écran par écran

Sur la fiche de chaque membre, l'onglet **Accès** affiche la liste « Ce que ce compte peut faire », avec un Oui ou un Non par domaine. Voici cette liste, traduite en usage concret.

| Domaine | Ce qu'il contient | Propriétaire et Admin | Commercial |
|---------|-------------------|-----------------------|------------|
| Tableau de bord | KPI, pipeline, modules d'accueil | Oui | Oui |
| Demandes | Fiches, notes, assignation, statut | Oui | Oui |
| Abandons | Sessions inachevées à relancer | Oui | Oui |
| Emails marketing | Campagnes perso ou groupe | Oui | Oui |
| Segmentation | Listes B2B, hot, relance | Oui | Oui |
| Statistiques | Tunnel, sources, pipeline | Oui | Oui |
| Canaux perso | Boîte mail du commercial | Oui | Oui |
| Espace membres | Portail client, documents, plugins | Oui | Non |
| Funnels | Créer et éditer les parcours devis | Oui | Non |
| Catalogue | Produits, Si/Alors, imports | Oui | Non |
| Google Ads | Connexion, conversions, ROI | Oui | Non |
| Boutiques | Mini-site, Woo, Shopify | Oui | Non |
| Automatisations | Canvas, parcours, exécutions | Oui | Non |
| Équipe | Inviter, rôles, accès, journal | Oui | Non |
| Canaux de l'espace | Boîte partagée de l'organisation | Oui | Non |
| API et webhooks | Clés MCP Claude / ChatGPT, exports | Oui | Non |
| Paramètres | Templates, suivi, RGPD | Oui | Non |

Concrètement, un Commercial ne voit pas les entrées Funnels, Catalogue, Ads, Boutiques, Espace membres, Automatisations et Équipe dans le menu. S'il ouvre directement l'adresse d'un de ces écrans, il est renvoyé vers la liste des Demandes. Dans les Statistiques, il a les onglets Vue, Funnels, Campagnes, Pipeline et Sources, mais pas Suivi Google. Dans les Paramètres, il ne trouve que les Mises à jour : les templates d'emails, l'équipe, l'API, le suivi Google, les boutiques et l'effacement RGPD restent réservés aux Admins. Pour les canaux, il peut brancher sa propre boîte mail, pas la boîte partagée de l'organisation.

Les actions qui modifient ces réglages sont, elles aussi, refusées côté serveur pour un Commercial. Masquer un bouton ne suffirait pas : la vérification est faite à chaque enregistrement.

## Ce que le rôle Commercial ne restreint pas

C'est le point à comprendre avant de répartir les rôles. **Le rôle Commercial limite l'accès aux réglages, pas aux dossiers.** Tous les membres actifs de l'espace voient toutes les demandes de l'espace. Un Commercial peut ouvrir une demande assignée à un collègue, lire ses notes internes, changer son statut, ajouter une note, répondre au prospect ou modifier l'assignation.

Le filtre « Tous assignés » de la liste des Demandes permet à chacun de n'afficher que ses dossiers, mais c'est un filtre d'affichage, pas une barrière. De la même façon, l'export CSV de la liste reprend les demandes de l'espace avec les coordonnées des contacts, quel que soit le rôle de la personne qui l'utilise.

Pour une PME où l'équipe commerciale travaille ensemble, c'est souvent ce qu'on veut : un collègue absent, un autre reprend le dossier sans demander d'accès. Si vous avez besoin de cloisonner des portefeuilles clients entre commerciaux, QuoteBuilder ne le fait pas aujourd'hui. Mieux vaut le savoir avant d'inviter un agent commercial externe.

## Inviter un membre depuis la page Équipe

La page **Équipe** (menu Pilotage, visible des Propriétaires et des Admins) liste les membres avec quatre indicateurs en tête : Actifs, Invitations, Commerciaux et Demandes suivies. Ce dernier indique aussi combien de demandes ne sont assignées à personne.

Pour inviter quelqu'un :

1. Cliquez sur **Inviter**. Une fenêtre « Nouvel accès » s'ouvre, avec la question « Qui rejoignez-vous ? ».
2. Choisissez **Commercial** ou **Admin**. Chaque carte rappelle ce que le rôle permet. Commercial est présélectionné.
3. Saisissez l'email professionnel de la personne.
4. Cliquez sur **Envoyer l'invitation**.

La personne reçoit un email intitulé « Invitation » suivi du nom de votre espace. Il lui indique qu'elle est invitée en tant que commercial ou admin, avec deux liens : un pour créer son accès, un pour se connecter si elle a déjà un compte. Elle doit se connecter avec l'adresse invitée. Si elle utilise une autre adresse, l'invitation est refusée avec le message « Invitation introuvable, déjà utilisée, ou réservée à une autre adresse email ». Une fois l'invitation acceptée, elle arrive sur la liste des Demandes et son statut passe de Invitation à Actif.

Quelques cas utiles à connaître :

- **Adresse déjà membre** : l'application répond « Cet email est déjà membre de l'espace. »
- **Compte suspendu** : « Ce compte est suspendu. Réactivez-le depuis sa fiche. » On ne réinvite pas un compte suspendu, on le réactive.
- **Invitation encore en attente** : inviter à nouveau la même adresse met à jour le rôle choisi et envoie un nouveau lien. L'ancien lien ne fonctionne plus.
- **Renvoyer l'accès** : depuis la fiche d'une invitation en attente, ce bouton génère lui aussi un nouveau lien et invalide le précédent. Pour un membre actif, le bouton s'appelle **Envoyer l'accès** et renvoie simplement un lien de connexion.
- **Révoquer l'invitation** : supprime l'invitation en attente. Utile quand vous vous êtes trompé d'adresse.

La connexion se fait par email et mot de passe. Pour un membre actif qui a perdu le sien, le bouton **Mot de passe** de sa fiche lui envoie un lien pour le définir ou le réinitialiser. Le lien expire après quelques heures.

## Gérer un compte : rôle, suspension, départ

La fiche d'un membre comporte, dans l'onglet Compte, une section **Gestion** avec deux actions.

**Changer le rôle.** Une liste déroulante propose Commercial ou Admin, puis **Enregistrer le rôle**. Le nouveau rôle s'applique au prochain chargement de page de la personne : le menu et les écrans accessibles changent sans qu'elle ait à se reconnecter. Aucun email ne la prévient, pensez à le lui dire.

**Suspendre ou réactiver.** Le bouton **Suspendre** coupe l'accès d'un membre actif sans supprimer sa fiche ni son historique. **Réactiver** le rétablit. Après une suspension, vérifiez sur la fiche que le statut affiché est bien Suspendu.

Trois règles encadrent ces actions :

- le Propriétaire ne peut être ni rétrogradé ni suspendu ;
- personne ne peut modifier son propre compte depuis cette page : la fiche indique « Vous ne pouvez pas modifier votre propre compte ici » ;
- un Admin peut gérer les Commerciaux et les autres Admins, y compris promouvoir un Commercial en Admin.

Ce dernier point mérite attention. Si vous nommez trois Admins, chacun peut changer le rôle des deux autres. Dans une petite équipe, c'est rarement un problème. Mais c'est une raison de plus pour garder le rôle Admin à ceux qui configurent vraiment l'outil.

**Quand quelqu'un quitte l'équipe**, l'ordre qui évite les oublis est le suivant : filtrez la liste des Demandes sur son nom pour voir ses dossiers ouverts, réassignez-les, puis suspendez son compte. La suspension ne réassigne rien d'elle-même : ses dossiers restent à son nom tant que personne ne les reprend.

## Les quatre onglets d'une fiche membre

Chaque fiche membre se lit en quatre onglets, utiles bien au-delà de la gestion des accès.

- **Compte** : nombre de demandes suivies et en cours, gagnées et perdues, taux de conversion, nombre de dossiers Hot, dernière activité et dernière connexion. Puis l'email, le rôle, le statut et la date d'arrivée.
- **Accès** : la liste « Ce que ce compte peut faire » décrite plus haut. C'est le bon écran à montrer à un nouveau venu qui demande pourquoi il ne voit pas le catalogue.
- **Demandes** : les dossiers assignés à ce membre, avec leur statut et leur date de réception.
- **Journal** : les dernières actions de ce membre sur les demandes (statut modifié, note interne, appel, assignation, email au prospect).

Le Journal ne retrace que les actions sur les demandes. Les changements de rôle, les invitations et les suspensions n'y apparaissent pas. Si vous avez besoin d'une trace de qui a donné quel accès et quand, tenez-la à part.

## Rôles et assignation : deux réglages différents

Le rôle dit ce qu'une personne peut ouvrir. L'assignation dit de quels dossiers elle est responsable. Les deux se confondent souvent, à tort.

Depuis la fiche d'une demande, n'importe quel membre actif peut assigner le dossier à un ou plusieurs collègues, Commercial ou Admin. La personne assignée reçoit une notification dans l'application (« Demande assignée : » suivi du nom du contact) et un email sur son adresse d'invitation. Le dossier apparaît dans l'onglet Demandes de sa fiche membre et dans ses statistiques.

Les règles de répartition (qui reçoit quoi, en combien de temps, que faire le week-end) sont un sujet à part, traité dans [assignation et SLA des demandes de devis en équipe](https://www.quotebuilder.co/blog/assignation-sla-demande-devis-equipe). Pour dimensionner l'équipe elle-même, le [calculateur de capacité équipe devis](https://www.quotebuilder.co/outils/calculateur-capacite-equipe-devis) aide à estimer combien de demandes une personne peut traiter par semaine.

Retenez seulement ceci : donner le rôle Admin à un commercial pour qu'il « voie tous les dossiers » ne sert à rien. Il les voit déjà avec le rôle Commercial.

## Directeur financier, Responsable technique : ce ne sont pas des rôles d'équipe

Sur une fiche demande, vous pouvez inviter des relecteurs côté client : Directeur financier, Responsable technique, Acheteur ou Décideur. Ces libellés ressemblent à des rôles, mais ils n'ont rien à voir avec l'équipe.

Un relecteur invité sur un dossier reçoit un lien personnel vers l'espace prospect de cette demande, valable 30 jours. Il peut y lire le dossier et donner son avis. Il n'a pas de compte dans votre espace QuoteBuilder, ne voit aucune autre demande et n'apparaît pas sur la page Équipe.

À l'inverse, si votre propre responsable technique doit relire les dossiers avant chiffrage, invitez-le dans l'équipe avec le rôle Commercial. Il verra les demandes, pourra ajouter des [notes internes](https://www.quotebuilder.co/blog/notes-internes-dossier-devis-equipe-b2b) et être assigné. Pour organiser ce passage de relais, voir [le transfert du brief entre commercial et technique](https://www.quotebuilder.co/blog/transfert-brief-commercial-technique-devis-b2b) et [la validation interne avant envoi](https://www.quotebuilder.co/blog/validation-interne-avant-envoi-devis-b2b). Pour les relecteurs côté client : [approbation client multi-décideurs](https://www.quotebuilder.co/blog/approbation-client-multi-decideurs-devis-b2b).

## Quelle répartition selon la taille de l'équipe

Il n'y a pas de bonne répartition universelle, mais trois situations reviennent souvent. Les effectifs ci-dessous sont des exemples, pas des recommandations chiffrées.

**Seul ou à deux.** Le Propriétaire fait tout. Si un associé travaille aussi sur les réglages, donnez-lui le rôle Admin plutôt que votre mot de passe. Les rôles servent surtout à garder des statistiques et un journal propres par personne.

**Trois à cinq personnes.** Un Propriétaire, un Admin de secours, et des Commerciaux. L'Admin de secours évite qu'un commercial attende le retour de congés du dirigeant pour corriger une question du funnel ou un prix du catalogue. Les autres n'ont pas besoin de toucher aux réglages.

**Six à dix personnes.** Un ou deux Admins au maximum, désignés pour maintenir le funnel, le catalogue et l'Autopilote. Tous les autres en Commercial. Au-delà de deux Admins, les modifications de réglages se croisent et personne ne sait plus qui a changé quoi.

Dans tous les cas, posez-vous la question pour chaque Admin : a-t-il modifié un funnel, le catalogue ou une automatisation ces trois derniers mois ? Si la réponse est non, le rôle Commercial lui suffit.

## Les erreurs qui coûtent du temps

**Tout le monde en Admin « pour être tranquille ».** C'est l'erreur la plus fréquente. Elle supprime la seule protection des réglages qui touchent chaque prospect. Une question supprimée dans un funnel ou une règle Si/Alors modifiée pour un client particulier change ce que voient toutes les demandes suivantes.

**Un seul Admin, absent.** À l'inverse, si seul le Propriétaire peut modifier le catalogue, un prix erroné reste en ligne jusqu'à son retour. Les commerciaux, eux, répondent aux prospects avec une fourchette qu'ils savent fausse.

**Un compte nominatif utilisé par deux personnes.** Les statistiques de la fiche membre, le journal et les notifications d'assignation n'ont alors plus de sens. Une invitation coûte une minute.

**Promouvoir un commercial en Admin pour qu'il voie un dossier.** Inutile : tous les membres voient toutes les demandes. Le rôle Admin ouvre les réglages, pas les dossiers.

**Laisser traîner les invitations.** Une invitation en attente envoyée à une mauvaise adresse ou à un candidat qui n'a finalement pas rejoint l'entreprise reste dans la liste. Filtrez par statut Invitation une fois par mois et révoquez celles qui ne servent plus.

**Oublier les dossiers d'un départ.** Suspendre un compte ne réassigne pas ses demandes. Réassignez d'abord, suspendez ensuite.

## Checklist avant d'inviter l'équipe

- [ ] Chaque personne a son propre compte, avec son adresse professionnelle
- [ ] Le Propriétaire est la personne qui possède réellement le compte, et son mot de passe n'est pas partagé
- [ ] Un ou deux Admins nommés, qui maintiennent funnel, catalogue et Autopilote
- [ ] Un Admin de secours désigné pour les absences du Propriétaire
- [ ] Tous les autres en Commercial
- [ ] Chaque nouveau venu a vu l'onglet Accès de sa fiche
- [ ] L'équipe sait que tous les membres voient toutes les demandes
- [ ] Les relecteurs côté client passent par l'invitation sur le dossier, pas par la page Équipe
- [ ] Une procédure de départ écrite : réassigner, puis suspendre, puis vérifier le statut
- [ ] Une revue mensuelle des invitations en attente et des Admins réellement utiles

## Ce que QuoteBuilder ne fait pas

Pour décider en connaissance de cause, voici les limites constatées à ce jour :

- pas de rôle personnalisé ni de permission écran par écran au-delà des trois rôles ;
- pas de cloisonnement des demandes par commercial : tous les membres actifs voient tout l'espace ;
- pas de permission par funnel : un Admin peut modifier tous les funnels de l'espace ;
- pas de transfert de propriété depuis l'interface ;
- pas de connexion par authentification unique (SSO) : chaque membre se connecte par email et mot de passe ;
- pas de journal des changements de rôle et des suspensions ;
- pas d'email au membre quand son rôle change.

## Estimer ce que vous coûtent des accès mal cadrés

Combien d'heures par mois partent à corriger un réglage modifié par erreur, ou à attendre qu'un Admin soit disponible ? Notre [estimateur du coût des accès mal cadrés](https://www.quotebuilder.co/outils/estimateur-cout-acces-mal-cadres-equipe-devis) fait le calcul avec vos hypothèses : nombre d'Admins en trop, incidents de configuration, blocages, coût horaire et affaires refroidies. Le calcul se fait dans votre navigateur.

Pour voir comment les rôles s'organisent dans l'application : [la page Équipe et rôles](https://www.quotebuilder.co/fonctionnalites/equipe). Pour tester avec votre propre équipe : [créer un compte Free](https://www.quotebuilder.co/signup?plan=free), ou [voir d'abord la démo](https://www.quotebuilder.co/c/demo/rayonnage).

## FAQ

### Quels sont les rôles d'équipe dans QuoteBuilder ?

Trois : Propriétaire, Admin et Commercial. Le Propriétaire a tout l'espace et ne peut être ni rétrogradé ni suspendu. L'Admin configure funnels, catalogue, équipe et automatisations, et traite aussi les demandes. Le Commercial traite les demandes, relance les abandons et envoie des emails, sans accès aux réglages.

### Un Commercial peut-il voir les demandes assignées à ses collègues ?

Oui. Le rôle Commercial limite l'accès aux réglages, pas aux dossiers. Tous les membres actifs voient toutes les demandes de l'espace. Le filtre par assigné de la liste des Demandes sert à n'afficher que ses dossiers, mais ce n'est pas une restriction d'accès.

### Peut-on inviter quelqu'un comme Propriétaire ?

Non. La fenêtre d'invitation propose uniquement Commercial et Admin. Le Propriétaire est la personne qui a créé l'espace, et l'interface ne propose pas de transfert de propriété.

### Comment inviter un commercial ?

Page Équipe, bouton Inviter, choix du rôle Commercial, saisie de son email, puis Envoyer l'invitation. Il reçoit un email avec un lien pour créer son accès ou se connecter. Il doit utiliser l'adresse invitée, sinon l'invitation est refusée.

### Le lien d'invitation ne fonctionne plus, que faire ?

Si vous avez réinvité la même adresse ou cliqué sur Renvoyer l'accès, un nouveau lien a été généré et l'ancien ne fonctionne plus. Demandez à la personne d'utiliser le dernier email reçu. Vérifiez aussi qu'elle se connecte avec l'adresse invitée.

### Un Admin peut-il modifier le rôle d'un autre Admin ?

Oui. Un Admin peut changer le rôle d'un Commercial ou d'un autre Admin, et les suspendre. Il ne peut modifier ni le Propriétaire ni son propre compte.

### Que se passe-t-il quand on change le rôle d'un membre ?

Le nouveau rôle s'applique à son prochain chargement de page : le menu et les écrans accessibles changent sans reconnexion. Aucun email ne le prévient automatiquement, prévenez-le vous-même.

### Comment gérer le départ d'un commercial ?

Filtrez la liste des Demandes sur son nom, réassignez ses dossiers ouverts, puis cliquez sur Suspendre dans la section Gestion de sa fiche. Vérifiez ensuite que la fiche affiche bien le statut Suspendu. Son historique reste consultable.

### Le Directeur financier ou le Responsable technique invité sur un dossier fait-il partie de l'équipe ?

Non. Ce sont des relecteurs côté client, invités sur une demande précise avec un lien personnel valable 30 jours. Ils n'ont pas de compte dans votre espace et n'apparaissent pas sur la page Équipe.

### Faut-il donner le rôle Admin à tous les commerciaux pour gagner du temps ?

Non. Le rôle Admin ouvre les réglages qui touchent chaque prospect : funnels, catalogue, automatisations. Un commercial traite ses demandes avec le rôle Commercial. Gardez un ou deux Admins qui maintiennent réellement l'outil, dont un de secours.

## Pour aller plus loin

- [Assignation et SLA des demandes de devis en équipe](https://www.quotebuilder.co/blog/assignation-sla-demande-devis-equipe)
- [Notes internes sur un dossier de devis en équipe](https://www.quotebuilder.co/blog/notes-internes-dossier-devis-equipe-b2b)
- [Transfert du brief entre commercial et technique](https://www.quotebuilder.co/blog/transfert-brief-commercial-technique-devis-b2b)
- [Validation interne avant envoi du devis](https://www.quotebuilder.co/blog/validation-interne-avant-envoi-devis-b2b)
- [Statuts du pipeline de devis B2B](https://www.quotebuilder.co/blog/statuts-pipeline-devis-b2b)
- [Calculateur de capacité équipe devis](https://www.quotebuilder.co/outils/calculateur-capacite-equipe-devis)
- [Estimateur du coût des accès mal cadrés](https://www.quotebuilder.co/outils/estimateur-cout-acces-mal-cadres-equipe-devis)
- [Équipe et rôles dans QuoteBuilder](https://www.quotebuilder.co/fonctionnalites/equipe)
- [Le traitement des demandes dans QuoteBuilder](https://www.quotebuilder.co/fonctionnalites/demandes)
