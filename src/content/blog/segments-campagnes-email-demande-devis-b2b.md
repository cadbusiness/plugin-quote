---
title: "Segments et campagnes email sur des demandes de devis B2B : écrire à un groupe sans polluer le parcours"
slug: segments-campagnes-email-demande-devis-b2b
description: "Autopilote, campagnes et segments ne font pas le même travail. Champs, opérateurs, consentement marketing, fenêtre de 30 jours, et ce que le bilan d'envoi affiche vraiment."
canonical: /blog/segments-campagnes-email-demande-devis-b2b
locale: fr-FR
word_count_target: 2500
keywords:
  - campagne email demande de devis
  - segmentation contacts devis B2B
  - newsletter segmentée devis
  - consentement marketing devis
  - relance groupe vs parcours
author: QuoteBuilder
date: 2026-10-13
updated: 2026-10-13
---

# Segments et campagnes email sur des demandes de devis B2B : écrire à un groupe sans polluer le parcours

Un commercial envoie « une petite nouvelle » à toute la base. Le message part le mardi. Le jeudi, trois personnes répondent que le chantier est fini, une se plaint d'avoir déjà reçu le rappel de sa demande, et une affaire encore ouverte se tait. Le texte n'était pas mauvais. Il est arrivé au mauvais groupe, au mauvais moment, par-dessus un autre envoi.

QuoteBuilder a deux façons d'écrire à quelqu'un qui a touché un devis. Elles ne se remplacent pas. L'Autopilote suit une demande. Une campagne écrit à un segment de contacts. Cet article dit comment les séparer, ce que les règles savent vraiment lire, et ce que le bilan d'envoi ne vous montrera pas.

**Tester tout de suite :** [créer un compte Free](https://www.quotebuilder.co/signup?plan=free). Pour voir un parcours public, pas une campagne : [démo funnel rayonnage](https://www.quotebuilder.co/c/demo/rayonnage). Pour chiffrer une liste envoyée sans segment : [estimateur coût des campagnes email sans segmentation](https://www.quotebuilder.co/outils/estimateur-cout-campagnes-email-sans-segmentation).

## Trois gestes qui se ressemblent

Dans le menu, trois endroits parlent d'email. Les confondre produit exactement le mail du mardi.

**L'Autopilote** (menu Commercial, Automatisations, réservé aux administrateurs) attache un parcours à une demande. Le déclencheur est une soumission, un abandon, ou un changement de statut. Les étapes sont des emails, des attentes, des conditions, une assignation, un statut. Le parcours livré par défaut confirme, rappelle l'équipe, relance le dossier ouvert, et reprend une session abandonnée. Le détail, déclencheurs, délais et ce que l'outil ne fait pas, est dans [Autopilote et workflows](https://www.quotebuilder.co/blog/autopilote-workflows-relance-demande-devis-b2b). La page produit est [l'Autopilote](https://www.quotebuilder.co/fonctionnalites/autopilote).

**Les campagnes** (menu Commercial, Emails) envoient un message à un groupe. Vous choisissez un segment, un mode personnel ou groupe, une boîte d'envoi, et une fenêtre « ne pas relancer si contacté depuis ». Le builder assemble des blocs. Ce n'est pas un rappel attaché à un dossier. C'est un envoi que vous lancez.

**La segmentation** (menu Commercial, Segmentation) décrit ce groupe. Les règles portent sur les contacts issus des demandes : funnel, score, statut, audience, une réponse du funnel, et la date du dernier email marketing. Une campagne sans segment part vers tous les contacts qui ont un email, dans la limite lue par l'outil.

Le commercial et l'administrateur voient Emails et Segmentation. L'Autopilote, lui, est marqué admin dans la barre latérale. Un commercial peut donc préparer une campagne sans pouvoir modifier le parcours qui relance déjà chaque demande.

La page [Tarifs](https://www.quotebuilder.co/tarifs) range la ligne « Newsletter segmentée » sur les plans Pro et Agency. Elle n'est pas cochée pour Free ni pour Starter. Il n'existe pas de plan nommé « Pro+ ». Les écrans Emails et Segmentation, eux, ne vérifient pas le plan du compte au moment de l'ouverture. La grille commerciale et le code ne disent pas la même chose. Comptez sur la grille pour savoir ce que vous vendez, et vérifiez le compte avant d'annoncer la fonction à un client Starter.

## Ce que l'Autopilote ne fera pas à la place d'une campagne

Un parcours répond à une action de cette demande : elle a été envoyée, la session a un email et reste inactive, le statut a changé. Le message reste lié à ce dossier. L'article Autopilote le dit déjà : ce n'est pas une campagne marketing. Les adresses recueillies pour une demande ne deviennent pas, toutes seules, une liste newsletter.

Conséquence pratique. Si vous désactivez le parcours de soumission, une confirmation peut encore partir, mais les relances du canvas s'arrêtent. Cela ne prépare pas un envoi groupé. Inversement, envoyer une campagne ne coche pas les étapes du parcours, ne change pas le statut, et n'assigne personne.

Les emails du parcours sont du texte. Il n'y a pas de test A/B, pas de SMS, pas de WhatsApp dans l'Autopilote. La campagne non plus n'envoie pas de SMS. Les canaux Instagram, Facebook, WhatsApp et Messenger existent comme types de canal, avec un statut « bientôt » quand ce n'est pas une boîte mail. Le sélecteur d'envoi d'une campagne ne propose que l'adresse QuoteBuilder, ou une boîte Gmail, Outlook ou IMAP. Un message WhatsApp de relance commerciale ne partira pas de cet écran.

Pour le temps que coûte le suivi demande par demande, à la main, l'estimateur séparé est [relances manuelles ou Autopilote](https://www.quotebuilder.co/outils/estimateur-charge-relances-manuelles-vs-autopilote). Il ne mesure pas une newsletter. Il mesure des touches attachées à chaque demande.

## D'où viennent les contacts d'un segment

Un segment ne lit pas un carnet d'adresses séparé. Il lit les demandes.

L'outil charge les devis de l'organisation, les plus récents d'abord, jusqu'à 2 000 lignes. Il charge aussi les envois de campagnes au statut « envoyé », jusqu'à 4 000 lignes, pour retenir la date la plus récente par adresse email. Un devis sans email est ignoré. Le contact obtenu porte le nom, l'email, la société, le score, le statut, le funnel, les réponses, la date de dernière campagne, et le booléen de consentement marketing.

Deux conséquences, à connaître avant de croire le compteur.

Le compteur de la liste Segmentation compte des demandes, pas des personnes. Trois devis avec le même email, s'ils passent les règles, comptent trois. Au moment de l'envoi, la campagne déduplique par email et garde la demande la plus récente. Vous pouvez voir « 120 contacts » sur le segment et envoyer à moins de personnes.

La demande gardée est aussi celle dont on lit le consentement, le score, le funnel et les réponses. Une case cochée sur un ancien devis, et décochée sur le plus récent, exclut l'adresse. L'inverse est vrai aussi : la case du dernier devis l'emporte.

Au-delà de 2 000 demandes, les plus anciennes ne sont pas dans le segment. Au-delà de 4 000 envois de campagnes, une adresse dont le dernier envoi est plus vieux que cette fenêtre peut apparaître comme jamais contactée. Le compteur ne le dit pas.

## Les règles : six champs, et toutes doivent être vraies

Une règle a un champ, un opérateur, une valeur, et parfois une clé de réponse. Le segment garde une liste. Toutes les règles doivent être vraies en même temps. Une liste vide veut dire « tout le monde » : la pastille de la liste affiche alors « Tous ».

Les champs, tels que le code les nomme :

| Champ | Ce qu'il compare |
| --- | --- |
| Funnel | L'identifiant du configurateur de la demande |
| Score | Le libellé enregistré : hot, warm ou cold |
| Statut | Le slug du statut (Nouveau, Contacté, Gagné, etc.) |
| Audience | B2B si la société est renseignée, sinon B2C |
| Réponse funnel | Une clé de question, puis la valeur stockée |
| Dernier email marketing | La date du dernier envoi de campagne, pas un email d'Autopilote |

Les opérateurs prévus dans le moteur sont : est, n'est pas, contient, supérieur ou égal, inférieur ou égal, jamais relancé, il y a plus de (jours). L'éditeur n'en montre pas autant. Pour le funnel, le score, le statut et l'audience, il propose « est » et « n'est pas ». Pour une réponse, il ajoute « contient ». Pour le dernier email, il propose seulement « jamais relancé » et « il y a plus de (jours) ». Les comparaisons numériques supérieur ou égal et inférieur ou égal existent dans le moteur. L'écran de création ne les propose pas.

Quatre départs sont proposés dans le dialog : B2B (une société renseignée), B2C (pas de société), Hot (score chaud), Pas relancés (jamais d'email marketing). Ce sont des règles de départ. Vous pouvez les affiner, en ajouter, en retirer.

### Audience : une société, pas un drapeau

B2B veut dire : le champ société de la demande n'est pas vide. B2C veut dire l'inverse. Un particulier qui tape le nom de son entreprise est classé B2B. Une société qui laisse le champ vide est classée B2C. Il n'y a pas d'autre signal.

Le moteur a un trou sur l'opérateur. Si la valeur est `b2b` ou `b2c`, il ne regarde pas si vous avez choisi « est » ou « n'est pas ». « Audience n'est pas B2B » matche encore les demandes qui ont une société. Pour exclure un groupe, ne comptez pas sur cet opérateur. Faites le segment de ceux que vous voulez, et envoyez-leur.

### Score : une formule fixe, pas un réglage

Le score est calculé une fois, à la soumission, puis stocké. Il n'y a pas d'écran pour changer les points. La formule part de 30. Elle ajoute des points si elle trouve une surface, une charge, une fréquence de prélèvement (`access`), un type de projet parmi entrepôt, cuisine professionnelle ou commerce, une contrainte réelle, ou un texte long dans les clés `need` ou `besoin`. À partir de 70 le libellé est hot, à partir de 45 il est warm, en dessous il est cold.

Un segment « Score est hot » lit ce libellé enregistré, en minuscules. Il ne relit pas les réponses le jour de la campagne. Si le dossier a été scoré cold à l'envoi, il reste cold pour le segment, même si vous avez beaucoup échangé depuis. Le score n'est pas un thermomètre commercial que vous réglez. C'est une photo de la soumission, et sur beaucoup de templates hors rayonnage cette photo vaut 30, donc cold. Le détail de la formule est dans [score d'une demande de devis](https://www.quotebuilder.co/blog/score-demande-devis-b2b).

### Réponse de funnel : la clé, pas le libellé

Vous choisissez une question, puis une valeur. La comparaison se fait sur la valeur stockée (par exemple `design`), pas sur le libellé affiché au prospect (« Conception / PC »), sauf si vous tapez vous-même ce texte dans un champ libre. « Contient » ignore la casse.

Attention aux clés partagées. Beaucoup de templates utilisent la clé `project_type`. L'éditeur enregistre cette clé, pas le couple funnel + clé. Deux questions « Type de mission » et « Type d'espace » peuvent donc se confondre, et la liste des choix affichés est celle de la première question trouvée avec cette clé. Si vous voulez les concepteurs d'un seul funnel, ajoutez une règle Funnel à côté de la règle Réponse.

### Dernier email : campagnes seulement

« Jamais relancé » veut dire : aucune campagne marketing au statut envoyé pour cette adresse. « Il y a plus de N jours » veut dire : pas de campagne, ou la dernière date d'au moins N jours. Les jamais contactés passent donc aussi la règle « il y a plus de 30 jours ». Si la valeur n'est pas un nombre, la règle matche tout le monde.

Ce champ ne voit pas les emails de l'Autopilote, ni les emails de confirmation, ni un appel noté sur la fiche. Le libellé de l'écran dit « déjà relancés » à plusieurs endroits. Le champ, lui, s'appelle « Dernier email marketing ». Un prospect relancé hier par le parcours de sa demande peut encore entrer dans un segment « jamais relancé », et recevoir la campagne.

## Monter la campagne

Le dialog demande trois choses : le type d'email (relance, offre, nurturing, personnel), puis à qui et comment, puis un nom interne. Le type sert surtout à préremplir l'objet et quelques blocs. Vous pouvez tout réécrire.

Le segment est une liste déroulante. La première option est « Tous les contacts avec un email ». C'est une campagne sans segment : les règles vides matchent tout le monde, toujours dans la limite des 2 000 demandes les plus récentes.

Deux modes d'envoi :

- **Personnel.** Chaque email reçoit le nom, la société, le score et le texte des réponses. L'objet peut contenir `{{contact_name}}`.
- **Groupe.** Le même texte part, mais la fusion individuelle est vidée : le nom devient « vous », la société, le score et le récap des réponses sont vides. Ce n'est pas un seul email avec tout le monde en copie cachée. C'est un envoi par adresse, sans les variables de la personne. Le bloc « Récap devis », dans ce mode, n'a plus les réponses : il affiche la phrase de repli.

La variable de lien de suivi existe dans le moteur. L'envoi de campagne ne la remplit pas. Un bouton qui pointe vers `{{suivi_url}}` part avec un lien vide. Le lien d'espace membres, lui, est rempli si un espace membres est publié.

Le pied de page est un bloc de texte. Rien n'ajoute tout seul un lien de désinscription. Si vous en voulez un, vous l'écrivez. La boîte d'envoi est l'adresse QuoteBuilder, ou un canal email connecté, qui sert d'expéditeur et de réponse.

### La fenêtre de 30 jours

À la création, le champ « Ne pas relancer si contacté depuis (jours) » vaut 30. Pendant l'envoi, une adresse dont la dernière campagne envoyée date de moins de ces jours est écartée. Mettre 0 désactive l'exclusion : plus personne n'est écarté pour ce motif. Un champ vidé ou illisible devient aussi 0, pas 30.

Cette fenêtre regarde la même date que le segment : les campagnes au statut envoyé. Elle ne regarde pas l'Autopilote. Vous pouvez donc « protéger » les gens déjà touchés par une newsletter, et quand même écrire à quelqu'un qui a reçu trois relances de parcours la semaine dernière.

Le bouton « Envoyer à N contacts » compte les emails uniques qui passent cette fenêtre. Il ne retire pas ceux qui n'ont pas le consentement marketing. N est souvent plus grand que le nombre de messages qui partiront.

## Le consentement, et ce que le bilan montre

À l'étape coordonnées du funnel, une case est décochée par défaut. Le texte dit que la personne accepte d'être recontactée par email pour des offres liées à sa demande, et que c'est un consentement marketing, facultatif. La demande de devis, elle, peut partir sans cette case. Le booléen est enregistré sur la demande.

À l'envoi, une adresse sans consentement marketing est sautée. La ligne d'envoi est enregistrée avec le motif `no_marketing_consent`. Une adresse dans la fenêtre récente est sautée avec le motif `recently_contacted`. Un échec d'envoi est compté à part, avec le message d'erreur dans le même champ de motif.

Le bandeau qui s'affiche juste après l'envoi ne montre pas ces motifs. Il dit : envoyé, ignorés (déjà relancés), échecs. Les deux motifs d'ignorance sont additionnés sous l'étiquette « déjà relancés ». Quelqu'un sans consentement est donc compté parmi les ignorés, et le libellé laisse croire qu'il avait déjà été relancé. Après avoir quitté la page, la liste des campagnes ne garde que le nombre d'envoyés. Les ignorés et les échecs ne sont pas réaffichés. Les lignes détaillées existent en base. Aucun écran du produit ne les liste aujourd'hui.

Dites « comptés parmi les ignorés ». Ne promettez pas que le commercial verra le motif.

La case n'est pas une base légale rédigée à votre place. Pour les particuliers, la prospection par email demande en principe un consentement préalable. Pour les professionnels, le cadre est souvent celui de l'information et du droit d'opposition, quand le message a un lien avec leur fonction. Chaque message doit identifier l'annonceur et offrir un moyen simple de s'opposer. Le produit coche une case et écarte ceux qui ne l'ont pas cochée. Il n'écrit pas le lien de désinscription, et il n'empêche pas une campagne « tous les contacts » de viser des demandes B2B qui n'ont pas coché. Celles-là seront ignorées à l'envoi, pas empêchées à la création. Le cadre est repris dans [RGPD et demande de devis](https://www.quotebuilder.co/blog/rgpd-demande-devis-b2b-consentement-conservation).

Si vous poussez les demandes vers un CRM, le webhook emporte `consent_marketing`, faux par défaut. Ne transformez pas ce champ en opt-in newsletter de l'autre côté sans le relire. Voir [webhook de demande de devis](https://www.quotebuilder.co/blog/webhook-demande-devis-crm-signature-hmac).

## Un exemple chiffré : la liste brute

Les chiffres qui suivent sont les valeurs par défaut de l'estimateur. Ce ne sont pas des moyennes de marché.

Un cabinet envoie 2 campagnes par mois à une liste de 250 contacts. 75 % partent sans segment utile. Chaque campagne prend 40 minutes à préparer. 3 % des envois produisent une plainte ou un désabonnement, et chaque cas prend 8 minutes. 40 % des contacts sont déjà dans un parcours Autopilote. Le coût horaire est de 45 €. Le panier moyen est de 4 800 €. 1,5 % des contacts mal ciblés étaient une affaire encore ouverte, qui refroidit.

Le calcul donne 500 contacts touchés, 375 mal ciblés, 200 déjà en parcours (affichés à part, pas additionnés), 15 plaintes ou désabonnements, 3,3 heures, 150 € de temps, 5,6 affaires refroidies et 27 000 € d'opportunités. Le coût mensuel, temps plus opportunités, est de 27 150 €. Le temps est petit. Le taux d'affaires refroidies fait presque tout le chiffre. Si ce taux est faux, le total est faux. Refaites-le avec vos dossiers : [estimateur coût des campagnes email sans segmentation](https://www.quotebuilder.co/outils/estimateur-cout-campagnes-email-sans-segmentation).

L'exemple sert à voir l'ordre de grandeur, pas à justifier un abonnement. Sur une petite liste, une affaire de plus change tout. Sur une grande liste envoyée sans règle, le risque n'est pas les 40 minutes d'écriture. C'est d'écrire à des gens qui n'ont pas demandé une offre, ou qui sont déjà dans un autre fil.

## Écrire sans recouvrir le parcours

Quelques règles de bon sens, calées sur ce que l'outil sait faire.

Gardez l'Autopilote pour la vie de la demande : accusé, rappel interne, relance si le dossier est encore ouvert, reprise d'un abandon. Ne recopiez pas ces textes dans une campagne « relance » envoyée à tout le monde.

Réservez la campagne à un message qui n'appartient à aucune demande en particulier : une date de salon, une nouvelle gamme, une information qui concerne un groupe. Le segment dit le groupe. Le funnel, le type de mission, le statut « pas gagné et pas perdu », une réponse précise.

Croisez avec « jamais relancé » ou « il y a plus de 30 jours » si vous voulez espacer vos propres campagnes. Rappelez-vous que cela n'espace pas les emails du parcours. Si la moitié de la liste est en cours de relance automatique, baissez la fréquence, ou acceptez le double message en connaissance de cause.

Ne lancez pas « Tous les contacts » pour aller plus vite. C'est l'option qui pollue le parcours. Le bouton d'envoi affichera un grand N, consentement compris. Le bilan mélangera ensuite les refus et les déjà contactés sous une seule étiquette.

En mode personnel, le récap des réponses peut être utile (« vous aviez parlé d'une conception »). En mode groupe, ce récap est vide. N'annoncez pas un rappel de configuration si vous avez choisi Groupe.

Relisez l'objet. Les modèles disent « on reprend votre projet » ou « votre offre ». Sur une newsletter, cette phrase fait croire à une relance de dossier. Changez-la.

Et n'utilisez pas le score Hot comme seul filtre sur un template qui marque tout le monde cold. Vous enverrez à personne, et vous croirez que la base est vide. Filtrez sur le funnel et sur une réponse, puis triez les dossiers à la main pour le suivi. L'assignation d'une demande à un commercial reste un autre geste : elle ne constitue pas un segment. Voir [assignation et délais](https://www.quotebuilder.co/blog/assignation-sla-demande-devis-equipe) si le sujet est l'équipe, pas la liste.

## Erreurs fréquentes

- **Confondre le parcours et la campagne.** L'un suit une demande. L'autre écrit à un groupe. Les éteindre ou les allumer ensemble ne donne pas le même résultat.
- **Croire que « déjà relancés » inclut l'Autopilote.** La date lue est celle des campagnes envoyées.
- **Lire le bandeau « ignorés (déjà relancés) » comme un motif unique.** Le consentement manquant est dans le même total.
- **Croire le compteur du segment.** Il compte des demandes. L'envoi déduplique les emails et garde la demande la plus récente.
- **Une règle Audience « n'est pas ».** L'opérateur n'est pas appliqué pour B2B et B2C.
- **Une règle Réponse sans règle Funnel**, quand plusieurs parcours partagent la clé `project_type`.
- **Un segment vide**, ou une campagne sans segment. Tout le monde (dans la limite des 2 000 demandes) est dedans.
- **Un pied de page sans moyen de s'opposer**, alors que le bloc n'en ajoute pas un tout seul.
- **Promettre le SMS.** Ce module envoie des emails.

**Écrire au bon groupe :** [créer un compte Free](https://www.quotebuilder.co/signup?plan=free) · [voir la démo](https://www.quotebuilder.co/c/demo/rayonnage) · [chiffrer une liste sans segment](https://www.quotebuilder.co/outils/estimateur-cout-campagnes-email-sans-segmentation).

## FAQ

### Quelle différence entre l'Autopilote et une campagne email ?

L'Autopilote attache un parcours à une demande : confirmation, relances, reprise d'abandon, selon un déclencheur. Une campagne envoie un email à un segment de contacts, quand vous lancez l'envoi. L'un ne remplace pas l'autre.

### Où se règlent les segments et les campagnes ?

Dans le menu Commercial : Segmentation pour les règles, Emails pour le message et l'envoi. L'Autopilote est dans Automatisations, visible par les administrateurs. Un commercial voit Emails et Segmentation.

### Quels critères peut-on combiner ?

Funnel, score, statut, audience, une réponse de funnel, et le dernier email marketing. Toutes les règles du segment doivent être vraies. Une liste de règles vide matche tout le monde.

### Comment QuoteBuilder distingue-t-il le B2B du B2C ?

B2B veut dire qu'une société est renseignée sur la demande. B2C veut dire que le champ est vide. Il n'y a pas d'autre drapeau. L'opérateur « n'est pas » n'est pas appliqué sur ces deux valeurs.

### Le score Hot, Warm ou Cold se configure-t-il ?

Non. Il est calculé à la soumission par une formule fixe, puis stocké. Le segment lit ce libellé. Il ne se recalcule pas le jour de la campagne, et vous ne réglez pas les points.

### Que veut dire « déjà relancés » ?

La fenêtre, 30 jours par défaut, regarde la date du dernier envoi de campagne marketing. Elle ne regarde pas les emails de l'Autopilote. Mettre 0 désactive l'exclusion. Le libellé du bilan après envoi réutilise « déjà relancés » pour tous les ignorés, y compris le défaut de consentement.

### Un contact sans case marketing reçoit-il la campagne ?

Non. Il est écarté de l'envoi. Il est compté parmi les ignorés dans le bilan. Le motif précis n'est pas affiché dans ce bilan.

### Peut-on envoyer la campagne par SMS ou WhatsApp ?

Non. L'envoi est un email, depuis l'adresse QuoteBuilder ou une boîte Gmail, Outlook ou IMAP. Il n'y a pas de SMS dans ce module. WhatsApp n'est pas un mode d'envoi de campagne.

### Une campagne sans segment part-elle quand même ?

Oui, vers les contacts qui ont un email, parmi les demandes lues (les 2 000 plus récentes), sous réserve du consentement et de la fenêtre de jours. L'option s'appelle « Tous les contacts avec un email ».

### La newsletter segmentée est-elle incluse dans tous les plans ?

Sur la page Tarifs, la ligne est cochée pour Pro et Agency, pas pour Free ni Starter. Il n'y a pas de plan « Pro+ ». Les écrans Emails et Segmentation ne vérifient pas le plan à l'ouverture.

## Sources

- CNIL, « La prospection commerciale par courrier électronique, SMS-MMS et automate d'appel » : consentement des particuliers, information et opposition des professionnels, identité de l'annonceur, moyen de s'opposer. https://www.cnil.fr/fr/la-prospection-commerciale-par-courrier-electronique-sms-mms-et-automate-dappel
- CNIL, « Communications par voie électronique aux prospects et clients : quelles règles respecter ? », qui distingue prospection, message transactionnel et message relationnel, et cite l'article L. 34-5 du code des postes et des communications électroniques. https://www.cnil.fr/fr/communication-electronique-quelles-regles
- Règlement (UE) 2016/679, articles 6 et 7 (base du traitement et conditions du consentement). https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=CELEX%3A32016R0679

## Pour aller plus loin

- [Autopilote et workflows de relance](https://www.quotebuilder.co/blog/autopilote-workflows-relance-demande-devis-b2b)
- [RGPD, consentement et conservation](https://www.quotebuilder.co/blog/rgpd-demande-devis-b2b-consentement-conservation)
- [Webhook vers le CRM](https://www.quotebuilder.co/blog/webhook-demande-devis-crm-signature-hmac)
- [Score d'une demande de devis](https://www.quotebuilder.co/blog/score-demande-devis-b2b)
- [Estimateur de charge : relances manuelles ou Autopilote](https://www.quotebuilder.co/outils/estimateur-charge-relances-manuelles-vs-autopilote)
- [Estimateur coût des campagnes email sans segmentation](https://www.quotebuilder.co/outils/estimateur-cout-campagnes-email-sans-segmentation)
- [Funnel de devis architecte et BET](https://www.quotebuilder.co/secteurs/funnel-devis-architecte-bet)
- [Créer un compte Free](https://www.quotebuilder.co/signup?plan=free)
