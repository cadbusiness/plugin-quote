import type { FaqItem } from "@/components/marketing/marketing-faq";

export const BLOG_FAQ: Record<string, FaqItem[]> = {
  "pret-main-oeuvre-illicite-marchandage-devis-regie-b2b": [
    {
      q: "Une régie au temps passé, c'est forcément du prêt de main-d'œuvre ?",
      a: "Non. Le temps passé est une façon de compter le prix. Ce qui compte, c'est ce que paie ce prix : une prestation définie, que vous dirigez avec vos moyens, ou des personnes que le client dirige. La Cour de cassation a écarté le prêt illicite pour un ingénieur facturé au jour pendant plus de trois ans, parce que son employeur l'affectait, l'évaluait, contrôlait son temps et gérait ses congés et ses frais.",
    },
    {
      q: "Mes salariés travaillent dans les locaux du client. Est-ce un problème ?",
      a: "Pas en soi. Beaucoup de prestations s'exécutent chez le client par nature (maintenance, nettoyage, informatique). Le risque vient de l'ensemble : ordres donnés par le client, matériel du client, tâches identiques à celles de ses salariés, absence d'objet défini.",
    },
    {
      q: "Puis-je prêter un salarié à une entreprise amie ?",
      a: "Oui, sans but lucratif : vous refacturez seulement le salaire, les charges sociales et les frais professionnels remboursés, avec l'accord du salarié, une convention de mise à disposition, un avenant à son contrat et la consultation du CSE s'il existe (article L8241-2).",
    },
    {
      q: "Puis-je ajouter une petite marge pour mes frais de gestion ?",
      a: "Non, dans une mise à disposition. Le texte limite la refacturation au salaire, aux charges sociales afférentes et aux frais professionnels remboursés au salarié. Tout supplément rend l'opération lucrative.",
    },
    {
      q: "Quelle est la différence entre prêt illicite et marchandage ?",
      a: "Le prêt illicite vise la fourniture de personnel comme objet exclusif, à but lucratif. Le marchandage vise toute fourniture de main-d'œuvre à but lucratif qui cause un préjudice au salarié ou contourne une règle légale ou conventionnelle, même si elle n'est pas exclusive. Les deux sont punis de deux ans et 30 000 €.",
    },
    {
      q: "Le titre « assistance technique » sur le devis suffit-il à me protéger ?",
      a: "Non. Les juges regardent ce qui se passe réellement : qui dirige, qui fournit les moyens, ce qui est livré. Le titre ne change rien.",
    },
    {
      q: "Mon client est-il aussi exposé ?",
      a: "Oui. Dans deux des affaires citées dans cet article, c'est le dirigeant de l'entreprise qui utilisait la main-d'œuvre qui a été condamné. C'est un bon argument pour lui proposer une prestation définie plutôt que deux personnes à l'heure.",
    },
    {
      q: "Combien de temps peut durer une mise à disposition ?",
      a: "L'article L8241-2 ne fixe pas de durée maximale pour un prêt sans but lucratif, mais la convention doit en définir une. Le dispositif dérogatoire de l'article L8241-3 est limité à trois ans. Dans une prestation, la durée n'est pas interdite, mais une mission très longue avec des salariés intégrés aux équipes du client attire l'attention.",
    },
    {
      q: "Que risque-t-on si le prêt illicite est retenu ?",
      a: "Deux ans d'emprisonnement et 30 000 € d'amende pour une personne physique, jusqu'à cinq ans et 75 000 € si l'infraction vise plusieurs personnes, le quintuple de l'amende pour une société, une interdiction possible de sous-traiter de la main-d'œuvre, la nullité du contrat et des demandes du salarié.",
    },
    {
      q: "QuoteBuilder peut-il détecter une demande de personnel ?",
      a: "Non. Le funnel peut poser les bonnes questions (résultat attendu, livrables, qui organise sur place), et les notes internes gardent votre analyse. Mais le score Hot, Warm ou Cold suit une formule fixe qui ne lit pas ces réponses, et QuoteBuilder ne vérifie pas vos devis au regard du code du travail.",
    },
  ],
  "client-procedure-collective-declaration-creance-devis-b2b": [
    {
      q: "Quel est le délai pour déclarer une créance quand le client est en redressement judiciaire ?",
      a: "Deux mois à compter de la publication du jugement d'ouverture au BODACC (article R622-24 du code de commerce). Le délai passe à quatre mois si vous ne demeurez pas sur le territoire de la juridiction qui a ouvert la procédure (métropole, ou département ou collectivité d'outre-mer). Le même délai s'applique en sauvegarde et en liquidation.",
    },
    {
      q: "Comment compter les deux mois ?",
      a: "De quantième à quantième : une publication le 17 novembre donne une fin de délai le 17 janvier. S'il n'y a pas de même quantième, le délai finit le dernier jour du mois. Un délai qui expire un samedi, un dimanche ou un jour férié est prorogé au premier jour ouvrable suivant (articles 641 et 642 du code de procédure civile). Par prudence, envoyez avant le dernier jour ouvré.",
    },
    {
      q: "À qui envoyer la déclaration de créance ?",
      a: "Au mandataire judiciaire en sauvegarde et en redressement, au liquidateur en liquidation. Ses coordonnées figurent dans l'annonce du BODACC. Ni à l'administrateur, ni au client, ni au greffe.",
    },
    {
      q: "Que doit contenir la déclaration ?",
      a: "Le montant dû au jour du jugement, les sommes à échoir et leurs dates, la nature de la sûreté s'il y en a une, les éléments qui prouvent la créance, la mention du litige s'il y en a un, les pièces sous bordereau, et la certification de sincérité (articles L622-25 et R622-23).",
    },
    {
      q: "Mon client m'a mis sur sa liste de créanciers : dois-je quand même déclarer ?",
      a: "Oui. Le client est présumé avoir déclaré pour vous, mais seulement dans la limite de ce qu'il a indiqué, et vous ne savez pas ce qu'il a écrit. Votre propre déclaration fixe le montant que vous réclamez.",
    },
    {
      q: "Qui peut signer la déclaration ?",
      a: "Le représentant légal de votre entreprise, ou toute personne qu'il a désignée : un salarié, un avocat, un autre mandataire. Si ce n'est pas le représentant légal, joignez le pouvoir (article L622-24 et recommandations du CNAJMJ).",
    },
    {
      q: "Dois-je continuer à livrer un client en redressement qui ne m'a pas payé ?",
      a: "Si l'administrateur, ou le client avec l'avis conforme du mandataire, demande la poursuite du contrat, oui, même si la facture antérieure reste impayée. En redressement et en liquidation, la suite se paie au comptant, sauf délai que vous acceptez. Pour sortir de l'incertitude, mettez l'administrateur en demeure de prendre parti : sans réponse dans le mois, le contrat est résilié de plein droit.",
    },
    {
      q: "Que devient l'acompte que j'ai reçu ?",
      a: "Il reste acquis à hauteur de ce qui a été exécuté et se déduit de la créance à déclarer. Si le contrat est résilié et que l'acompte dépasse la valeur de ce que vous avez fait, vous pouvez différer la restitution de l'excédent jusqu'à ce que votre indemnité soit fixée (article L622-13 V).",
    },
    {
      q: "J'ai laissé passer le délai : est-ce que tout est perdu ?",
      a: "Pas forcément. Vous pouvez demander au juge-commissaire un relevé de forclusion dans les six mois de la publication du jugement, en montrant que la défaillance n'est pas de votre fait ou qu'elle vient d'une omission du client sur sa liste. Même relevé, vous ne participez qu'aux distributions postérieures à votre demande. Déclarez en même temps.",
    },
    {
      q: "QuoteBuilder déclare-t-il les créances ou surveille-t-il le BODACC ?",
      a: "Non. QuoteBuilder recueille les demandes de devis et les suit en équipe. Il ne fait ni facturation, ni recouvrement, ni veille des procédures collectives. Les notes internes du dossier servent à garder la chronologie, et le calculateur gratuit aide à fixer les dates et le montant.",
    },
  ],
  "mention-dechets-devis-travaux-bordereau-depot-b2b": [
    {
      q: "La mention déchets est-elle obligatoire sur un devis de travaux ?",
      a: "Oui, pour les devis de travaux de construction, de rénovation ou de démolition de bâtiments et pour les devis de jardinage, depuis le 1er juillet 2021 (article L541-21-2-3 du code de l'environnement et décret n° 2020-1817). Le devis doit indiquer la quantité estimée de déchets, le tri et l'enlèvement prévus, le ou les points de collecte et le coût estimé.",
    },
    {
      q: "Quelles sont les quatre informations à écrire ?",
      a: "L'article D541-45-1 demande une estimation de la quantité totale de déchets, les modalités de gestion et d'enlèvement (tri sur le chantier, flux en collecte séparée, broyage pour le jardinage), le ou les points de collecte identifiés par leur raison sociale, leur adresse et leur type, et une estimation des coûts.",
    },
    {
      q: "La règle s'applique-t-elle à un devis pour une entreprise ?",
      a: "Oui. L'article ne distingue pas selon le client. Un devis adressé à une PME, à une collectivité, à une copropriété ou à un particulier doit porter la même mention.",
    },
    {
      q: "Y a-t-il un montant minimum de devis ?",
      a: "Non. Aucun seuil n'est prévu. Un petit devis peut avoir une ligne courte, mais elle doit contenir les quatre informations.",
    },
    {
      q: "« Évacuation des gravats comprise » suffit-il ?",
      a: "Non. Cette phrase ne donne ni quantité, ni tri, ni point de collecte, ni coût. Vous pouvez garder un prix tout compris, à condition d'écrire le montant estimé de la gestion des déchets et les autres informations.",
    },
    {
      q: "Quels chantiers sont exemptés ?",
      a: "Les travaux soumis au diagnostic PEMD (IV de l'article). Selon l'article R126-8 du code de la construction et de l'habitation, il s'agit des démolitions et rénovations significatives de plus de 1 000 m² de surface de plancher cumulée, ou portant sur un bâtiment qui a accueilli une activité agricole, industrielle ou commerciale avec des substances dangereuses.",
    },
    {
      q: "Qu'est-ce que le bordereau de dépôt ?",
      a: "Un document gratuit que l'installation de collecte remet à l'entreprise qui dépose les déchets. Il indique notamment la date, l'installation, la nature et la quantité des déchets, le maître d'ouvrage et l'entreprise. L'entreprise le conserve et le transmet au client ou à l'administration sur demande.",
    },
    {
      q: "Quelle amende en cas d'oubli ?",
      a: "Une amende administrative de 3 000 € au plus pour une personne physique et de 15 000 € au plus pour une personne morale (III de l'article L541-21-2-3), prononcée selon la procédure du code de la consommation.",
    },
    {
      q: "Faut-il facturer les déchets sur une ligne à part ?",
      a: "Non. Le texte demande une estimation des coûts, pas une ligne facturée à part. Une ligne chiffrée est la présentation la plus claire. Vous pouvez aussi écrire le montant estimé à l'intérieur d'une ligne existante.",
    },
    {
      q: "QuoteBuilder calcule-t-il la ligne déchets de mes devis ?",
      a: "Non. QuoteBuilder reçoit et organise les demandes de devis : un funnel peut poser des questions utiles à l'estimation, et le prospect peut envoyer des photos par la zone « Plan (PDF ou image) ». Le calcul se fait dans le vérificateur gratuit, à part, et la ligne déchets se met dans votre outil de devis. Le PDF de QuoteBuilder porte le pied fixe « Document indicatif, non contractuel. ».",
    },
  ],
  "pouvoir-signataire-devis-delegation-mandat-apparent-b2b": [
    {
      q: "Un salarié peut-il signer un devis au nom de son entreprise ?",
      a: "Oui, s'il a reçu le pouvoir de le faire, en général par une délégation du représentant légal. Sans pouvoir, ou au-delà de son pouvoir, l'acte est inopposable à l'entreprise (article 1156 du code civil), sauf mandat apparent ou ratification. Demandez la copie de la délégation, ou la confirmation du dirigeant.",
    },
    {
      q: "Comment savoir qui est le représentant légal d'une société ?",
      a: "Cherchez la société sur l'Annuaire des entreprises, qui affiche ses dirigeants et permet de télécharger un justificatif d'immatriculation au registre national des entreprises. Gardez une capture datée ou le justificatif dans le dossier. Un changement de dirigeant non publié au registre ne vous est pas opposable (article L123-9 du code de commerce), sauf si vous le connaissiez.",
    },
    {
      q: "Les statuts du client limitent les pouvoirs de son président : le devis est-il valable ?",
      a: "À votre égard, oui. Les clauses des statuts qui limitent les pouvoirs du président d'une SAS, du gérant d'une SARL ou du directeur général d'une SA sont inopposables aux tiers (articles L227-6, L223-18 et L225-56 du code de commerce). Elles jouent à l'intérieur de la société. Cette protection ne vaut que pour le représentant légal, pas pour un salarié.",
    },
    {
      q: "Qu'est-ce que le mandat apparent ?",
      a: "C'est la situation où vous avez légitimement cru au pouvoir du signataire, notamment en raison du comportement ou des déclarations du client lui-même (article 1156 du code civil). L'acte reste alors opposable au client. C'est un argument à faire valoir en cas de litige, apprécié au cas par cas, pas une méthode pour sécuriser un devis.",
    },
    {
      q: "Qu'est-ce que l'action interrogatoire de l'article 1158 ?",
      a: "C'est une demande écrite que vous adressez au client, quand vous doutez du pouvoir de son représentant conventionnel pour un acte que vous vous apprêtez à conclure. Vous lui demandez de confirmer, dans un délai raisonnable que vous fixez, que le représentant est habilité. L'écrit doit mentionner qu'à défaut de réponse dans ce délai, le représentant est réputé habilité.",
    },
    {
      q: "Quel délai fixer dans la demande de confirmation ?",
      a: "Le code civil ne fixe pas de durée : le délai doit être raisonnable. Laissez au client le temps réel de répondre, en tenant compte des jours fériés et de la taille de l'enjeu, et écrivez une date précise de réponse. Ne lancez aucune commande avant cette date, sauf confirmation reçue plus tôt.",
    },
    {
      q: "Le silence du client vaut-il acceptation de mon devis ?",
      a: "En principe non : l'article 1120 du code civil dit que le silence ne vaut pas acceptation, sauf si la loi, les usages, les relations d'affaires ou des circonstances particulières en décident autrement. L'article 1158 est un de ces cas, mais il porte sur le pouvoir du signataire, pas sur l'acceptation du devis elle-même.",
    },
    {
      q: "Le client a payé l'acompte : le devis est-il ratifié ?",
      a: "Un acompte payé depuis un compte du client, après la signature, est un indice sérieux de ratification tacite (articles 1156 et 1998 du code civil). Ce n'est pas une certitude, et c'est à vous de la prouver. Faites confirmer l'accord par écrit dès que vous avez un doute.",
    },
    {
      q: "Un maître d'œuvre peut-il signer le devis à la place du client ?",
      a: "Seulement si le client lui a donné ce pouvoir par un mandat. Son visa sur le devis est un avis technique, pas un engagement du client. Faites signer le client, ou demandez la copie du mandat (article 1998 du code civil).",
    },
    {
      q: "QuoteBuilder vérifie-t-il le pouvoir du signataire ?",
      a: "Non. QuoteBuilder recueille la demande et les réponses du prospect, permet au prospect de partager le dossier à ses décideurs pour validation et de joindre des fichiers, et vous laisse tracer vos vérifications dans les notes internes. Il ne vérifie pas les dirigeants, ne fait pas signer les devis et ne remplace pas la vérification décrite dans cet article.",
    },
  ],
  "devis-acheteur-public-marche-sans-publicite-b2b": [
    {
      q: "Une mairie peut-elle me commander des travaux sur simple devis ?",
      a: "Oui, quand la valeur estimée de son besoin est inférieure à 100 000 € HT pour des travaux, ou à 60 000 € HT pour des fournitures ou des services (article R2122-8 du code de la commande publique, version en vigueur depuis le 1er avril 2026). Elle doit tout de même choisir une offre pertinente, bien utiliser l'argent public et ne pas toujours retenir la même entreprise. C'est pourquoi elle demande souvent plusieurs devis.",
    },
    {
      q: "Mon devis accepté par une collectivité est-il un marché public ?",
      a: "Oui. Le code de la commande publique appelle marché tout contrat conclu par un acheteur soumis au code avec une entreprise, pour des travaux, des fournitures ou des services, contre un prix (article L1111-1). Il n'y a pas de montant minimum. Les règles de délai de paiement et d'intérêts moratoires s'appliquent donc à un devis de 1 800 €.",
    },
    {
      q: "Quel est le délai de paiement d'une collectivité ?",
      a: "Trente jours pour l'État, les collectivités et la plupart des établissements publics (article R2192-10). Cinquante jours pour les établissements publics de santé (article R2192-11, 1°). Soixante jours pour les entreprises publiques qui ne sont pas des établissements publics locaux (article R2192-11, 2°). Le marché peut prévoir un délai plus court, jamais plus long (article L2192-10).",
    },
    {
      q: "À partir de quand le délai de paiement court-il ?",
      a: "De la réception de la facture par l'acheteur (article R2192-12). Si la facture arrive avant la fin des prestations, ou si sa date de réception est incertaine, le délai part de la fin des prestations (article R2192-13). Le dépôt sur Chorus Pro donne une date de réception claire.",
    },
    {
      q: "L'acheteur peut-il suspendre le délai de paiement ?",
      a: "Une seule fois, si la facture est incomplète, erronée ou incohérente (article R2192-27), par une notification qui donne une date certaine et précise les pièces à fournir (article R2192-28). Un nouveau délai de 30 jours, ou le solde restant s'il est plus long, court à partir de la réception des pièces (article R2192-29).",
    },
    {
      q: "Comment calculer les intérêts moratoires d'un marché public ?",
      a: "Montant TTC de la facture, diminué de la retenue de garantie, multiplié par le taux, multiplié par le nombre de jours de retard, divisé par 365. Le taux est celui de la BCE en vigueur au premier jour du semestre où le retard a commencé, plus huit points (article R2192-31). Les jours se comptent du lendemain de l'échéance jusqu'à la mise en paiement incluse (article R2192-32). Exemple : 21 600 € à 10,40 % pendant 30 jours donnent 184,64 €.",
    },
    {
      q: "Quel est le taux des intérêts moratoires en 2026 ?",
      a: "10,15 % pour des intérêts qui ont commencé à courir au premier semestre 2026 (BCE à 2,15 % au 1er janvier) et 10,40 % pour le second semestre (BCE à 2,40 % au 1er juillet), d'après le tableau des taux directeurs de la Banque de France lu le 17 novembre 2026. Le passage de la BCE à 2,65 % le 16 septembre 2026 ne change pas le taux du second semestre.",
    },
    {
      q: "L'indemnité de 40 € est-elle due même pour un jour de retard ?",
      a: "Le retard de paiement donne lieu, de plein droit et sans autre formalité, à l'indemnité forfaitaire pour frais de recouvrement (article L2192-13), fixée à 40 € (article D2192-35). Le texte ne prévoit pas de durée minimale de retard. Si vos frais réels de recouvrement sont plus élevés, vous pouvez demander un complément sur justificatifs.",
    },
    {
      q: "Dois-je écrire les intérêts moratoires dans mon devis pour y avoir droit ?",
      a: "Non, ils sont dus de plein droit. Les écrire reste utile : l'acheteur voit que vous connaissez la règle, et votre clause rappelle aussi Chorus Pro, les références de facture et l'interruption unique du délai. C'est souvent ce rappel qui évite le retard.",
    },
    {
      q: "QuoteBuilder dépose-t-il mes factures sur Chorus Pro ou calcule-t-il les intérêts ?",
      a: "Non. QuoteBuilder recueille la demande de devis, les réponses et les fichiers du prospect, et vous laisse suivre le dossier en équipe avec des notes internes. Il ne fait ni facture, ni dépôt sur Chorus Pro, ni suivi des paiements. Le calcul des intérêts se fait avec le calculateur gratuit, qui fonctionne sans compte.",
    },
  ],
  "tva-client-etranger-ue-export-devis-b2b": [
    {
      q: "Un devis pour un client européen doit-il être hors taxes ?",
      a: "Il doit au moins dire clairement si le prix est hors taxes ou toutes taxes comprises, et quel régime vous retenez. Pour une livraison intracommunautaire ou un service à un professionnel européen, le prix hors taxes est la base, et la TVA française ne s'ajoute que si une condition manque. Écrivez-le dans le devis.",
    },
    {
      q: "Suffit-il que le client soit à l'étranger pour ne pas facturer de TVA ?",
      a: "Non. Pour des biens, ce qui compte est le transport hors de France, le numéro de TVA du client et vos preuves (articles 258 et 262 ter du CGI). Pour des services, c'est la qualité d'assujetti du client et le lieu où il est établi (article 259). Un client étranger qui fait livrer les biens en France paie la TVA française.",
    },
    {
      q: "Que se passe-t-il si le client ne donne pas son numéro de TVA ?",
      a: "Pour une livraison de biens vers un autre pays de l'Union, l'exonération ne s'applique pas : le BOFiP indique que le vendeur n'a pas d'autre choix que de facturer la TVA (BOI-TVA-CHAMP-30-20-10, § 100). Si le client donne ensuite un numéro valide et établit qu'il était assujetti, la facture est rectifiée.",
    },
    {
      q: "Comment vérifier un numéro de TVA intracommunautaire ?",
      a: "Sur le service VIES de la Commission européenne, qui indique si le numéro est valide dans l'État qui l'a attribué. Gardez une trace datée de la vérification avec le dossier : le BOFiP demande au vendeur de s'assurer de l'existence et de la validité du numéro.",
    },
    {
      q: "Quelle mention mettre sur la facture d'une livraison intracommunautaire ?",
      a: "Les numéros de TVA du vendeur et de l'acquéreur (242 nonies A, 3°) et la référence de l'exonération (12°), par exemple « Exonération de TVA, article 262 ter I du CGI ». Indiquez aussi que la facture porte sur des biens (8° bis).",
    },
    {
      q: "Et pour un service rendu à une entreprise d'un autre pays de l'UE ?",
      a: "La mention « Autoliquidation » (242 nonies A, 13°), votre numéro de TVA et celui du client (4°), sans montant de TVA. Le service entre dans votre état récapitulatif des clients (article 289 B).",
    },
    {
      q: "Quelle preuve garder pour une exportation hors de l'Union ?",
      a: "La déclaration en douane d'exportation certifiée, ou une preuve alternative admise. Si le client organise le transport, la déclaration de son transporteur ou transitaire attestant la sortie, avec la preuve du paiement (BOI-TVA-CHAMP-30-30-10-20, § 25).",
    },
    {
      q: "Le passage au code des impositions sur les biens et services change-t-il mes factures en 2027 ?",
      a: "Pas sur le fond. Le rescrit BOI-RES-TVA-000253-20261007 indique que la recodification n'a aucune incidence sur les règles de facturation, et que les mentions des factures peuvent renvoyer au code général des impôts jusqu'au 30 juin 2028. Prévoyez la mise à jour de vos modèles avant cette date.",
    },
    {
      q: "Je pose du matériel chez un client en Belgique : est-ce une livraison intracommunautaire ?",
      a: "Non. Quand vous montez ou installez le bien, la livraison est située là où a lieu le montage (article 258 I b du CGI), donc en Belgique. La TVA belge peut s'appliquer et vous devrez peut-être vous y identifier. Faites valider le dossier avant le devis.",
    },
    {
      q: "QuoteBuilder calcule-t-il la TVA d'un devis étranger ?",
      a: "Non. QuoteBuilder recueille la demande, les réponses et les fichiers du prospect, et vous laisse tracer les vérifications dans les notes internes. Il n'affiche pas de hors taxes ni de toutes taxes comprises, ne vérifie pas les numéros de TVA et ne fait pas de factures. Les mentions fiscales viennent de votre outil de facturation.",
    },
  ],
  "forfait-regie-temps-passe-devis-b2b": [
    {
      q: "Quelle différence entre un forfait et une régie ?",
      a: "Au forfait, le prix est fixé à l'avance pour un périmètre décrit, quel que soit le temps passé : le prestataire porte le risque d'heures en plus. En régie, le client paie le temps passé, au taux convenu : il porte ce risque. Entre les deux, la régie plafonnée limite ce que le client peut payer.",
    },
    {
      q: "Peut-on augmenter un forfait en cours de mission ?",
      a: "Pas seul. Un contrat ne peut être modifié que du consentement mutuel des parties, ou pour les causes que la loi autorise (article 1193 du code civil). Si le périmètre change, un avenant écrit et chiffré avant exécution est la méthode la plus sûre. Si le prix doit pouvoir évoluer, par exemple selon un indice, il faut le prévoir dès le devis : voir la [révision de prix et l'indexation](https://www.quotebuilder.co/blog/revision-prix-indexation-devis-b2b).",
    },
    {
      q: "Quelle réserve de risque mettre dans un forfait ?",
      a: "Il n'existe pas de pourcentage légal ni universel. Un repère simple : la réserve couvre au moins la moitié de l'écart entre votre estimation basse et votre estimation haute, rapporté à l'estimation probable. Mesurez aussi ce que vos derniers projets ont réellement coûté par rapport à l'estimation : c'est votre meilleure donnée.",
    },
    {
      q: "Une estimation en régie engage-t-elle le prestataire ?",
      a: "Elle ne devrait pas, si le devis le dit : « estimation de 60 à 100 heures, sans engagement sur le nombre d'heures ». Un seul chiffre précis écrit sans réserve sera lu comme un engagement par le client. Écrivez une fourchette, et prévoyez une alerte à 80 %.",
    },
    {
      q: "Le client peut-il contester une facture en régie ?",
      a: "Oui. Il peut contester les heures qu'il juge non justifiées. C'est pourquoi un relevé d'heures détaillé, communiqué régulièrement, et un délai de contestation écrit dans le devis protègent les deux parties. En cas de désaccord sur le prix d'une prestation, l'article 1165 du code civil demande au prestataire qui fixe le prix de pouvoir en motiver le montant.",
    },
    {
      q: "Qu'est-ce qu'une régie plafonnée ?",
      a: "C'est une facturation au temps passé avec un montant maximum. Le client sait ce qu'il paiera au plus, le prestataire facture le temps réel jusqu'au plafond. Le devis doit dire ce qui se passe quand 80 % du plafond sont atteints, et que rien n'est facturé au-delà sans accord écrit.",
    },
    {
      q: "Quand choisir un forfait par phase ?",
      a: "Quand le besoin est trop flou pour un prix ferme mais que le client veut avancer : la phase 1 (étude, cadrage, prototype) est un forfait court avec un livrable, la phase 2 est chiffrée à la fin de la phase 1, avec ce qu'on a appris. Aucune heure de la phase 2 ne commence sans avenant écrit.",
    },
    {
      q: "Les articles 1793 et 1794 du code civil s'appliquent-ils à une prestation de services ?",
      a: "Ils concernent le marché à forfait de construction d'un bâtiment d'après un plan arrêté et convenu, et la résiliation d'un tel marché par le maître. Ils ne sont pas écrits pour une prestation informatique, de conseil ou de formation. Ils illustrent une logique (pas de supplément sans accord écrit), mais il ne faut pas les copier dans un devis sans vérifier qu'ils s'appliquent.",
    },
    {
      q: "QuoteBuilder suit-il les heures passées ou facture-t-il au temps passé ?",
      a: "Non. QuoteBuilder reçoit les demandes de devis, les trie, les suit et affiche un prix saisi au centime et arrondi à l'euro dès 1 € (sous 1 €, les centimes restent), en fixe, en fourchette ou « Sur devis ». Il n'a ni relevé d'heures, ni facturation, ni encaissement, ni signature électronique : le temps passé et les avenants se gèrent dans vos outils.",
    },
    {
      q: "Le comparateur donne-t-il le bon mode de facturation ?",
      a: "Il compare les prix, calcule la marge et le point mort, contrôle dix points et propose un mode d'après un barème simple (périmètre, inconnues, écart des estimations). C'est une aide à la discussion, pas un avis juridique ni une garantie de marge. Les valeurs par défaut sont des hypothèses d'exemple.",
    },
  ],
  "bon-a-tirer-bat-validation-avant-production-devis-b2b": [
    {
      q: "Le bon à tirer est-il obligatoire ?",
      a: "Non. Aucun texte n'impose un BAT entre professionnels. C'est une pratique contractuelle : il existe si le devis ou les conditions le prévoient, et il produit les effets qu'ils lui donnent. Pour une fabrication sur mesure, il est fortement recommandé.",
    },
    {
      q: "Un BAT sans réponse vaut-il validation ?",
      a: "Pas par principe. L'article 1120 du code civil dit que le silence ne vaut pas acceptation, sauf si la loi, les usages, les relations d'affaires ou des circonstances particulières en décident autrement. Une clause de validation tacite peut exister, mais elle sera discutée en cas de litige. Le plus sûr reste de ne pas produire sans validation écrite.",
    },
    {
      q: "Qui paie une erreur présente dans le BAT validé ?",
      a: "Si le devis prévoit qu'une erreur reproduite à l'identique depuis le BAT validé reste à la charge du client, c'est le client. Sans clause, le fabricant dispose d'un argument fort (le client a vu et validé), mais la discussion dépendra de ce que la validation couvrait et de la preuve de cette validation.",
    },
    {
      q: "Combien de tours de corrections faut-il inclure ?",
      a: "La loi ne fixe rien. Deux tours sont fréquents pour un BAT d'impression ou de signalétique. L'important est d'écrire le nombre inclus, ce qu'est un tour et le prix des suivants.",
    },
    {
      q: "Le délai de livraison court-il à partir de la commande ou du BAT ?",
      a: "De ce que dit le devis. Sans précision, le client peut considérer que la date promise est ferme. Écrivez que le délai de fabrication court à partir de la validation écrite du dernier BAT, et si vous donnez une date, à quelle date limite de validation elle correspond.",
    },
    {
      q: "Un e-mail « OK » suffit-il comme validation ?",
      a: "C'est une trace, mais faible. Les articles 1366 et 1367 du code civil donnent force probante à l'écrit électronique si son auteur est identifié et son intégrité garantie. Un e-mail de la personne désignée qui cite le numéro de version est bien plus solide qu'un « OK » dans un fil où circulent plusieurs versions.",
    },
    {
      q: "Un BAT PDF valide-t-il les couleurs ?",
      a: "Non, sauf si le devis le dit, ce qui serait risqué pour le fabricant. Un écran ne restitue pas la couleur imprimée sur un support réel. Si la couleur compte, prévoyez une épreuve ou un échantillon et une tolérance écrite.",
    },
    {
      q: "Le prototype ou la présérie peuvent-ils être facturés même sans commande de série ?",
      a: "Oui, si le devis le prévoit. Écrivez leur prix, leur caractère dû quelle que soit la suite, et s'ils sont déduits de la commande de série.",
    },
    {
      q: "Que faire si le client modifie sa demande après validation ?",
      a: "Traitez-la comme une modification de commande : chiffrez un avenant avec le nouveau prix et le nouveau délai, et facturez ce qui a déjà été produit si le devis le prévoit.",
    },
    {
      q: "QuoteBuilder gère-t-il l'envoi et la validation des BAT ?",
      a: "Non. QuoteBuilder recueille la demande et les fichiers du prospect (zone « Plan (PDF ou image) », espace prospect), et vous permet de tracer les étapes dans les notes internes. Il n'a pas d'objet BAT, pas de signature électronique, et l'équipe ne peut pas joindre de fichier au dossier : le BAT part par votre messagerie ou votre outil de production.",
    },
  ],
  "plan-prevention-entreprise-exterieure-devis-b2b": [
    {
      q: "Qu'est-ce qu'un plan de prévention ?",
      a: "C'est le document par lequel l'entreprise qui accueille (entreprise utilisatrice) et l'entreprise qui intervient (entreprise extérieure) fixent, d'un commun accord et avant le début des travaux, les mesures prises par chacune pour prévenir les risques nés de l'interférence entre leurs activités, installations et matériels (article R4512-6 du code du travail).",
    },
    {
      q: "Quand le plan de prévention doit-il être écrit ?",
      a: "Dans deux cas : quand l'opération représente au moins 400 heures de travail prévisibles sur douze mois au plus, sous-traitants compris, en continu ou non, ou quand elle comporte un des travaux dangereux de la liste fixée par l'arrêté du 19 mars 1993, quelle que soit sa durée (article R4512-7). Hors de ces cas, il peut être oral, mais un écrit simplifié reste prudent.",
    },
    {
      q: "Les heures des sous-traitants comptent-elles dans les 400 heures ?",
      a: "Oui. L'article R4512-7 vise l'opération réalisée par les entreprises extérieures, « y compris les entreprises sous-traitantes auxquelles elles peuvent faire appel ». On additionne toutes les heures prévisibles de l'opération.",
    },
    {
      q: "Qui rédige le plan de prévention ?",
      a: "Le texte dit que les employeurs l'arrêtent d'un commun accord. En pratique, le client propose souvent son modèle et l'entreprise extérieure le complète avec ses modes opératoires, ses matériels et ses intervenants. Les deux le signent quand il est écrit.",
    },
    {
      q: "L'inspection commune est-elle obligatoire même pour une petite intervention ?",
      a: "Le texte prévoit une inspection commune préalable avant toute opération réalisée par une entreprise extérieure dans l'établissement (article R4512-2). Pour une intervention brève et répétée, elle peut être courte, mais elle reste la base de l'analyse des risques.",
    },
    {
      q: "Quelle différence entre plan de prévention et protocole de sécurité ?",
      a: "Le protocole de sécurité concerne le chargement et le déchargement de marchandises par une entreprise de transport, en provenance ou à destination d'un lieu extérieur. Il est toujours écrit et remplace le plan de prévention pour ces opérations (articles R4515-1 à R4515-11). Quand les mêmes personnes montent ensuite du matériel sur place, le montage relève du plan de prévention.",
    },
    {
      q: "Le temps d'accueil sécurité peut-il être facturé au client ?",
      a: "Le temps consacré à l'information des salariés est du temps de travail effectif (article R4512-16) : il est payé aux salariés. Rien n'interdit de le faire apparaître dans le prix, comme une ligne ou une hypothèse de chiffrage. Le plus sûr est de l'écrire dans le devis, avec ce qui se passe si le site impose davantage.",
    },
    {
      q: "Le plan de prévention s'applique-t-il sur un chantier de bâtiment ?",
      a: "Pas sur les chantiers de bâtiment ou de génie civil soumis à la coordination SPS de l'article L4532-2, ni sur les autres chantiers clos et indépendants (article R4511-3). C'est alors le régime de la coordination de chantier qui joue. Les travaux dans un bâtiment en activité, au milieu des salariés du client, relèvent en revanche souvent du plan de prévention.",
    },
    {
      q: "Que faire si le seuil de 400 heures est dépassé en cours de chantier ?",
      a: "L'article R4512-7 le prévoit : dès qu'il apparaît que les heures doivent atteindre 400, le plan doit être établi par écrit. Prévenez le client, formalisez le plan avant la suite des travaux, et vérifiez que le dépassement est couvert par un avenant au devis.",
    },
    {
      q: "QuoteBuilder rédige-t-il le plan de prévention ?",
      a: "Non. QuoteBuilder aide à poser les bonnes questions dès la demande de devis (site en activité, accueil sécurité, contraintes), à recevoir les fichiers du prospect et à garder des notes internes. Il ne rédige ni ne fait signer de plan de prévention ou de protocole de sécurité, et ne compte pas les heures d'une opération.",
    },
  ],
  "outillage-specifique-moule-propriete-amortissement-devis-b2b": [
    {
      q: "Qui est propriétaire d'un moule payé par le client ?",
      a: "Celui que le devis désigne. Aucun texte ne dit qu'un moule appartient à celui qui le paie. Si le devis dit que le client est propriétaire sans dire quand, le transfert se fait en principe à la conclusion du contrat (article 1196 du code civil). S'il ne dit rien du tout, chaque partie peut soutenir sa position, et c'est le juge qui qualifiera le contrat. Écrivez le propriétaire et la date du transfert.",
    },
    {
      q: "Vaut-il mieux facturer l'outillage à part ou l'amortir dans le prix des pièces ?",
      a: "Facturer à part protège le fabricant et rend le prix des pièces lisible. Amortir baisse le prix d'entrée mais fait porter au fabricant le risque de volume. Le mixte partage ce risque. Le choix dépend de la fermeté des volumes et de la solidité du client. Dans tous les cas, écrivez la formule, la quantité et ce qui se passe si elle n'est pas atteinte.",
    },
    {
      q: "Comment calculer l'amortissement d'un outillage dans le prix d'une pièce ?",
      a: "Part amortie (coût de l'outil moins ce qui est facturé à part) divisée par la quantité d'amortissement, arrondie au centime supérieur. Dans l'exemple, 12 000 € sur 20 000 pièces donnent 0,60 € par pièce. Le [calculateur d'amortissement d'un outillage spécifique](https://www.quotebuilder.co/outils/calculateur-amortissement-outillage-specifique) fait le calcul et le tableau pas à pas. Ce n'est pas l'amortissement comptable.",
    },
    {
      q: "Que se passe-t-il si le client arrête ses commandes avant la quantité prévue ?",
      a: "Sans clause, le reste non amorti n'est dû par personne de façon évidente, surtout si la quantité était une estimation. Avec une clause d'arrêt anticipé, le client paie l'amortissement par pièce multiplié par les pièces non commandées, 7 200 € dans l'exemple. L'article 1794 du code civil, qui vise le marché à forfait, n'est pas une solution sûre pour une commande de pièces sans volume ferme.",
    },
    {
      q: "Le fabricant peut-il refuser de rendre le moule tant qu'il n'est pas payé ?",
      a: "Le dépositaire peut retenir le dépôt jusqu'à l'entier paiement de ce qui lui est dû à raison du dépôt (article 1948), et l'article 2286 ouvre un droit de rétention dans d'autres cas. Le lien entre la somme réclamée et l'outil se discute pour un reste d'amortissement ; une clause de rétention qui vise toutes les sommes dues au titre de l'outillage et de sa garde évite le débat. La rétention se perd si le fabricant laisse partir l'outil volontairement.",
    },
    {
      q: "Le client peut-il récupérer son moule à tout moment ?",
      a: "S'il en est propriétaire et que le moule est en dépôt chez le fabricant, le dépôt doit lui être remis dès qu'il le réclame (article 1944), sous réserve du droit de rétention pour ce qui est dû. En pratique, prévoyez un délai court pour préparer l'outil, le lieu de remise et la charge du transport (articles 1942 et 1943).",
    },
    {
      q: "Qui doit assurer un outillage gardé chez le fabricant ?",
      a: "Celui que le devis désigne. Les deux schémas courants : le fabricant l'assure au titre des biens confiés, ou le client l'assure dans sa police en indiquant le lieu. Écrivez aussi la valeur assurée, de préférence une valeur de remplacement. Sans écrit, chacun croit souvent que l'autre est assuré.",
    },
    {
      q: "Combien de temps le fabricant doit-il garder un outillage inutilisé ?",
      a: "Les articles du dépôt relus pour cet article ne fixent pas de durée de conservation : c'est au devis de la fixer. Une durée après la dernière commande, par exemple trente-six mois, suivie d'une lettre au client et d'un délai pour reprendre l'outil à ses frais, évite à la fois la destruction surprise et le stockage sans fin.",
    },
    {
      q: "Le client récupère-t-il aussi les plans et fichiers de l'outil ?",
      a: "Pas automatiquement. Être propriétaire de l'objet ne donne pas les fichiers qui ont servi à le concevoir. Si le client en a besoin, il faut le négocier et l'écrire : moment de la remise, format, usage permis. Le fabricant qui veut protéger son savoir-faire l'écrit aussi.",
    },
    {
      q: "QuoteBuilder calcule-t-il l'amortissement d'un outillage ?",
      a: "Non. Le catalogue connaît un prix fixe, une fourchette ou « Sur devis », et une ligne vaut prix unitaire fois quantité, sans palier ni coût d'outillage. Vous pouvez ajouter un produit « Outillage spécifique » en « Sur devis » pour l'annoncer dès la demande, faire le calcul avec le calculateur gratuit, puis mettre le prix et la clause dans votre devis final. Le PDF de QuoteBuilder reste un document indicatif, non contractuel.",
    },
  ],
  "reception-travaux-proces-verbal-reserves-devis-b2b": [
    {
      q: "Qu'est-ce que la réception des travaux ?",
      a: "C'est l'acte par lequel le maître de l'ouvrage déclare accepter l'ouvrage, avec ou sans réserves (article 1792-6 du code civil). Elle est demandée par la partie la plus diligente, se fait à l'amiable ou à défaut en justice, et toujours contradictoirement. C'est elle qui fait courir les garanties.",
    },
    {
      q: "Le procès-verbal de réception est-il obligatoire ?",
      a: "La loi n'impose pas de forme dans un marché privé, mais sans procès-verbal la réception se prouve mal et se date mal. Les tribunaux admettent parfois une réception tacite, au cas par cas. Un procès-verbal daté et signé des deux parties évite le débat.",
    },
    {
      q: "Quel est le délai pour lever les réserves ?",
      a: "Aucun délai légal fixe : les délais de reprise se fixent d'un commun accord (article 1792-6). Écrivez-les au procès-verbal, et prévoyez dans le devis un délai par défaut, par exemple trente jours. Si le délai n'est pas tenu, le client peut, après mise en demeure, faire exécuter les reprises aux frais de l'entreprise.",
    },
    {
      q: "Que se passe-t-il si un défaut visible n'a pas été réservé ?",
      a: "En général, un défaut apparent le jour de la réception et non réservé est considéré comme accepté, et se reproche ensuite très difficilement. Les désordres qui apparaissent après la réception restent couverts par la garantie de parfait achèvement, s'ils sont notifiés par écrit dans l'année.",
    },
    {
      q: "Le client peut-il refuser la réception ?",
      a: "Oui, s'il estime que l'ouvrage n'est pas en état d'être reçu, et il doit dire pourquoi. Pour des défauts de finition, la réception avec réserves est la bonne réponse. Un refus sans raison sérieuse peut conduire l'entreprise à demander une réception judiciaire.",
    },
    {
      q: "Quelles garanties partent de la réception ?",
      a: "La garantie de parfait achèvement (un an, article 1792-6), la garantie de bon fonctionnement des éléments d'équipement dissociables (deux ans au moins, article 1792-3) et la responsabilité décennale (dix ans, articles 1792 et 1792-4-1). La retenue de garantie se libère aussi un an après la réception.",
    },
    {
      q: "Peut-on réduire la garantie de parfait achèvement dans le devis ?",
      a: "Non. Une clause qui exclut ou limite les garanties des articles 1792 à 1792-6 est réputée non écrite (article 1792-5). Le devis peut prévoir une garantie plus longue, jamais plus courte.",
    },
    {
      q: "Le client peut-il retenir une partie du solde à cause des réserves ?",
      a: "Dans un marché de travaux privé, la retenue de garantie est limitée à 5 % des acomptes et doit être consignée ou remplacée par une caution (loi n° 71-584). Au-delà, le client doit justifier d'une raison sérieuse et proportionnée au défaut.",
    },
    {
      q: "Les équipements professionnels sont-ils couverts par la décennale ?",
      a: "Les éléments d'équipement dont la fonction exclusive est de permettre une activité professionnelle dans l'ouvrage ne sont pas des éléments d'équipement au sens des articles 1792 à 1792-4 (article 1792-7). Ils relèvent de la garantie du contrat et des vices cachés. Les travaux sur l'ouvrage qui les accueille gardent leurs garanties.",
    },
    {
      q: "QuoteBuilder gère-t-il la réception des travaux ?",
      a: "Non. QuoteBuilder reçoit et qualifie les demandes de devis, avec un funnel, un récapitulatif chiffré, un dossier et des relances. Il ne gère ni le chantier, ni le procès-verbal, ni les réserves, ni les délais de garantie. Le vérificateur gratuit calcule ces délais en local, sans compte.",
    },
  ],
  "cotraitance-groupement-entreprises-devis-b2b": [
    {
      q: "Quelle différence entre cotraitance et sous-traitance ?",
      a: "En cotraitance, chaque entreprise est partie au contrat avec le client et lui répond directement de ses prestations. En sous-traitance, une entreprise confie à une autre, par un contrat distinct et sous sa responsabilité, une partie du contrat qu'elle a passé avec le client (article 1er de la loi n° 75-1334 du 31 décembre 1975). Le sous-traitant n'est pas lié au client, et l'entreprise principale répond seule de tout envers lui.",
    },
    {
      q: "Un groupement d'entreprises est-il une société ?",
      a: "Non. Un groupement momentané d'entreprises n'a pas de personnalité morale. Il ne signe pas, n'encaisse pas et ne peut pas être poursuivi en tant que tel : ce sont ses membres qui s'engagent. Les membres peuvent créer une société commune s'ils le souhaitent, mais c'est alors une autre construction.",
    },
    {
      q: "Groupement conjoint ou solidaire : lequel choisir ?",
      a: "Le groupement conjoint limite l'engagement de chacun à ses prestations, mais laisse au client le risque de défaillance de chaque membre. Le groupement solidaire engage chacun pour le tout, ce qui protège le client mais expose tous les membres. Le groupement conjoint avec mandataire solidaire est un compromis : le mandataire garantit l'ensemble, les autres ne répondent que d'eux-mêmes. Le choix dépend de la confiance entre membres, de leur taille relative et de ce que le client exige.",
    },
    {
      q: "Si nous n'écrivons rien, sommes-nous solidaires ?",
      a: "En droit civil, non : la solidarité ne se présume pas (article 1310 du code civil), et chacun ne doit que sa part. Mais entre commerçants, la jurisprudence présume la solidarité des débiteurs pour une obligation commerciale. Des sociétés commerciales qui répondent ensemble sans rien écrire risquent donc d'être traitées comme solidaires. Écrivez toujours la forme du groupement dans le devis.",
    },
    {
      q: "La convention de groupement suffit-elle ?",
      a: "Non, pas face au client. Le client n'est pas partie à la convention (article 1199 du code civil) : elle règle les rapports entre membres, mais ne modifie pas ce que le devis accepté prévoit envers lui. La forme du groupement, la liste des membres, la répartition des prestations et le circuit de paiement doivent figurer dans le devis.",
    },
    {
      q: "Le mandataire peut-il signer pour tout le monde ?",
      a: "Oui, s'il a reçu un pouvoir qui le permet (article 1984 du code civil), et dans les limites de ce pouvoir (article 1989). Un pouvoir écrit, signé par chaque membre avant l'envoi du devis, évite toute discussion. Sans pouvoir, sa signature n'engage que lui.",
    },
    {
      q: "Que se passe-t-il si un membre fait faillite en cours de chantier ?",
      a: "Face au client, tout dépend de la forme écrite : en groupement conjoint, le client s'adresse au seul membre défaillant ; avec mandataire solidaire, au défaillant ou au mandataire ; en groupement solidaire, à n'importe quel membre. Entre membres, celui qui a payé se retourne contre le défaillant (articles 1317 à 1319 du code civil). Si celui-ci ne peut pas rembourser, la perte se répartit selon la convention, ou selon l'article 1317 entre codébiteurs solidaires.",
    },
    {
      q: "Comment répartir les frais communs ?",
      a: "Au prorata des parts, à parts égales, ou selon une clé propre à chaque poste. Le prorata est la clé la plus neutre. L'important est de l'écrire dans la convention avant l'acceptation du devis. Le calculateur répartit les frais au prorata ou à parts égales en gardant une somme exacte à l'euro.",
    },
    {
      q: "QuoteBuilder gère-t-il les groupements ?",
      a: "Non. QuoteBuilder reçoit la demande, calcule un récapitulatif indicatif à partir de votre catalogue, et crée un dossier dans une seule organisation, assignable aux membres actifs de votre équipe. Il n'a pas de notion de groupement, de cotraitant ou de mandataire, ne produit pas le devis contractuel, ne gère ni signature électronique ni facturation, et ne répartit pas les montants entre entreprises. La convention et les pouvoirs se préparent dans vos outils habituels.",
    },
    {
      q: "Par où commencer concrètement ?",
      a: "Listez les membres et leurs prestations, chiffrez chaque part, choisissez la forme du groupement, faites signer les pouvoirs et la convention, puis rédigez le devis avec la clause de groupement. Le [calculateur de répartition d'un groupement de cotraitants](https://www.quotebuilder.co/outils/calculateur-repartition-groupement-cotraitance) vérifie douze points, répartit les montants, simule une défaillance et rédige la clause et le message.",
    },
  ],
  "cession-creance-affacturage-dailly-devis-b2b": [
    {
      q: "Peut-on céder une facture sans l'accord de son client ?",
      a: "Oui. L'article 1321 du code civil précise que le consentement du débiteur n'est pas requis, sauf si la créance a été stipulée incessible. Et entre professionnels exerçant une activité de production, de distribution ou de services, une clause qui interdit de céder ses créances est nulle (article L442-3 c) du code de commerce). Il faut en revanche informer le client pour que la cession lui soit opposable.",
    },
    {
      q: "Quelle est la différence entre Dailly et affacturage ?",
      a: "Le Dailly est un crédit bancaire garanti par la cession de vos factures, au moyen d'un bordereau (articles L313-23 et suivants du code monétaire et financier). Vous gardez en général le recouvrement et le risque d'impayé. L'affacturage repose le plus souvent sur la subrogation : le factor paie la facture, devient créancier, se charge souvent du recouvrement et peut garantir l'impayé selon l'offre.",
    },
    {
      q: "Faut-il un écrit pour céder une créance ?",
      a: "Oui. La cession de créance du code civil doit être constatée par écrit, à peine de nullité (article 1322). Le bordereau Dailly doit contenir les mentions de l'article L313-23. La subrogation doit être expresse et consentie au moment du paiement (article 1346-1).",
    },
    {
      q: "À partir de quand le client doit-il payer le factor ?",
      a: "À partir du moment où la cession ou la subrogation lui a été notifiée, ou s'il en a pris acte (articles 1324 et 1346-5 du code civil). En Dailly, à compter de la notification de la banque, il ne se libère valablement qu'auprès d'elle (article L313-28).",
    },
    {
      q: "Le client peut-il refuser de payer le factor à cause d'un défaut ?",
      a: "Oui, s'il avait une bonne raison de ne pas vous payer. Il peut opposer au cessionnaire l'exception d'inexécution, la résolution, la nullité ou la compensation des dettes connexes. Seul un acte d'acceptation Dailly l'empêche d'opposer à la banque ses exceptions personnelles, sauf fraude.",
    },
    {
      q: "Peut-on céder un devis accepté avant d'avoir exécuté la prestation ?",
      a: "Le code civil et le Dailly permettent de céder une créance future. Mais tant que la prestation n'est pas exécutée, le client ne doit rien, et le cessionnaire le sait. En affacturage, le factor paie une facture émise : il faut attendre l'exécution et la facture.",
    },
    {
      q: "Combien coûte l'affacturage ?",
      a: "Cela dépend de l'offre. Il faut additionner la commission, les intérêts sur la somme avancée et les frais fixes, puis ramener ce coût à l'année pour comparer. Dans l'exemple de cet article, 296 € pour une facture de 18 000 € financée cinquante-six jours, soit environ 11,9 % par an sur la somme avancée. Ce sont des hypothèses d'exemple.",
    },
    {
      q: "Qu'est-ce que la retenue de garantie en affacturage ?",
      a: "C'est la part de la facture que le factor ne vous avance pas, pour couvrir les avoirs, les litiges et les impayés. Elle vous est rendue après le paiement du client, selon les règles du contrat. Ce n'est pas un coût, mais ce n'est pas de la trésorerie disponible tout de suite.",
    },
    {
      q: "Comment éviter la fraude au changement de RIB ?",
      a: "Ne changez jamais de coordonnées de paiement sur la foi d'un e-mail. Exigez une notification écrite signée, vérifiez par un appel au numéro habituel de votre fournisseur, et appliquez le changement à la seule facture concernée sauf mention contraire.",
    },
    {
      q: "QuoteBuilder gère-t-il la cession des factures ?",
      a: "Non. QuoteBuilder reçoit et organise les demandes de devis. Il n'a ni facturation, ni encaissement, ni connexion à un factor. Les notes internes du dossier, en ajout seul, peuvent servir de journal daté. Le calcul du coût et les points de contrôle se font avec le [vérificateur de cession de créance et d'affacturage](https://www.quotebuilder.co/outils/verificateur-cession-creance-affacturage), en local, sans compte.",
    },
  ],
  "erreur-prix-devis-b2b": [
    {
      q: "Peut-on corriger un devis déjà accepté ?",
      a: "Le prix accepté engage les deux parties (articles 1103 et 1121). Une erreur d'arithmétique visible sur le devis peut être rectifiée si elle l'est au regard des éléments de calcul connus des deux parties au moment de l'acceptation (Cass. 3e civ., 12 septembre 2012, n° 11-13.120). Les autres erreurs se négocient, et une mauvaise estimation ne permet pas de revenir sur le prix (article 1136).",
    },
    {
      q: "Mon devis comporte une erreur et le client ne l'a pas encore accepté : que faire ?",
      a: "Retirez-le par écrit, immédiatement, et envoyez un devis corrigé, numéroté et daté, qui remplace expressément le premier. Tant que l'offre n'est pas parvenue au client, elle se retire librement (article 1115) ; une fois reçue, sa rétractation empêche le contrat de se former mais peut engager votre responsabilité extracontractuelle (article 1116).",
    },
    {
      q: "J'ai sous-estimé le temps de pose : puis-je facturer plus ?",
      a: "Pas sans l'accord du client. C'est une erreur sur la valeur : une appréciation économique inexacte de votre propre prestation n'est pas une cause de nullité (article 1136). Le prix accepté reste dû. Vous pouvez proposer un avenant, que le client reste libre de refuser.",
    },
    {
      q: "Le client savait que mon prix était faux : est-il de mauvaise foi ?",
      a: "Cela dépend de ce qu'il savait. Ne pas révéler son estimation de la valeur n'est pas un dol (article 1137). Mais une erreur d'addition visible sur le devis n'est pas une question d'estimation, et le contrat doit être formé de bonne foi (article 1104). Le seul silence ne suffit pas toujours : la Cour de cassation a censuré une condamnation fondée sur l'absence de signalement d'une erreur de métré, faute d'obligation de vérifier (n° 17-11.226).",
    },
    {
      q: "Le client m'a demandé de confirmer mon prix et je l'ai fait : est-ce grave ?",
      a: "Oui. Un prix confirmé en termes clairs, excluant toute équivoque, a été jugé une erreur inexcusable, et l'offre acceptée ne pouvait plus être rétractée pour erreur matérielle (Cass. 3e civ., 8 juin 2010, n° 09-66.495). Avant de confirmer un prix sur lequel le client s'interroge, refaites le calcul ligne par ligne.",
    },
    {
      q: "« Sauf erreur ou omission » sur mon devis me protège-t-il ?",
      a: "Très peu. La formule ne dit pas ce qui fait foi en cas d'erreur. Une clause qui prévoit qu'en cas de discordance les quantités et prix unitaires font foi, et que le total est rectifié dans les deux sens, est beaucoup plus utile, à condition d'avoir été acceptée (article 1119).",
    },
    {
      q: "Et dans un marché à forfait ?",
      a: "L'article 1793 interdit à l'entrepreneur de demander une augmentation de prix pour des changements non autorisés par écrit avec un prix convenu. Un poste oublié, une quantité fausse ou une mauvaise estimation restent à sa charge, sauf avenant. À l'inverse, le maître d'ouvrage ne peut pas exiger le remboursement d'une erreur de métré sans obligation de vérifier de l'entrepreneur (n° 17-11.226). La recherche d'une erreur d'arithmétique rectifiable reste possible (n° 11-13.120).",
    },
    {
      q: "Combien de temps ai-je pour agir ?",
      a: "Il n'y a pas de délai légal spécifique pour signaler une erreur de prix ; signalez-la le plus vite possible. Les actions entre professionnels se prescrivent par cinq ans (article 2224 du code civil, article L110-4 du code de commerce) et, pour une nullité pour erreur, le délai court du jour de la découverte (article 1144).",
    },
    {
      q: "QuoteBuilder peut-il éviter les erreurs de prix ?",
      a: "Il en évite une partie : dans le récapitulatif, chaque ligne vaut prix unitaire × quantité et la fourchette reprend la somme des lignes ou la règle que vous avez posée. Il ne vérifie pas les prix saisis au catalogue, ne fait pas de devis ferme et ne permet pas de modifier un dossier après l'envoi. Le récapitulatif porte le pied « Document indicatif, non contractuel. ».",
    },
    {
      q: "Par où commencer concrètement ?",
      a: "Ouvrez le [vérificateur d'erreur de prix dans un devis](https://www.quotebuilder.co/outils/verificateur-erreur-prix-devis), saisissez le stade, la nature de l'erreur et les deux montants, puis copiez la clause et le message. Ajoutez ensuite la clause à votre modèle de devis.",
    },
  ],
  "rupture-brutale-relations-commerciales-devis-b2b": [
    {
      q: "Qu'est-ce qu'une rupture brutale d'une relation commerciale établie ?",
      a: "C'est le fait de mettre fin, en tout ou en partie, à une relation commerciale suivie et stable sans préavis écrit suffisant. L'article L442-1 II du code de commerce oblige l'auteur de la rupture à réparer le préjudice causé. Ce n'est pas la rupture qui est sanctionnée, c'est l'absence de préavis suffisant.",
    },
    {
      q: "Une suite de devis acceptés peut-elle former une relation établie ?",
      a: "Oui. Une relation établie n'exige pas un contrat unique. Une succession régulière de devis, de commandes ou de contrats annuels peut suffire, et la durée se compte depuis le début réel de la relation, même sous des contrats antérieurs (Cass. com., 16 février 2022, n° 20-18.844).",
    },
    {
      q: "Quelle durée de préavis faut-il donner ?",
      a: "Il n'y a pas de barème légal. Le juge tient compte de l'ancienneté, de la dépendance, de l'exclusivité, des investissements et des usages. Des décisions publiées ont retenu quatre mois pour deux ans et demi de relation, six mois pour quatorze ans avec 15 à 20 % du chiffre d'affaires, et jugé suffisants trente-cinq mois pour vingt-trois ans. Un préavis de dix-huit mois met l'auteur à l'abri d'un reproche sur la durée.",
    },
    {
      q: "Le préavis prévu au contrat suffit-il ?",
      a: "Il doit être respecté, mais il peut être jugé insuffisant au regard de l'ancienneté de la relation. Et une clause qui dispense de tout préavis n'écarte pas l'article L442-1 II (Cass. com., 5 avril 2018, n° 16-26.568).",
    },
    {
      q: "Le préavis peut-il être donné par e-mail ?",
      a: "Le texte exige un écrit, sans imposer de forme. Un e-mail daté est un écrit ; une lettre recommandée avec avis de réception prouve mieux la date de réception. L'écrit doit annoncer clairement la fin ou la réduction et sa date d'effet.",
    },
    {
      q: "Une forte baisse des commandes est-elle une rupture ?",
      a: "Elle peut l'être. Le texte vise la rupture « même partielle », et une baisse significative du chiffre d'affaires peut caractériser une rupture partielle (Cass. com., 16 février 2022, n° 20-18.844). Depuis août 2026, le texte vise aussi la réduction substantielle des volumes pendant la négociation d'un contrat, même temporaire.",
    },
    {
      q: "Peut-on réduire les commandes pendant le préavis ?",
      a: "En principe non : le préavis doit être effectif, et la relation doit se poursuivre aux conditions antérieures, sauf circonstances particulières. Des modifications non substantielles restent possibles ; dans un arrêt publié, une baisse d'environ 15 % a été jugée non substantielle (Cass. com., 19 mars 2025, n° 23-23.507).",
    },
    {
      q: "Quand peut-on rompre sans préavis ?",
      a: "En cas d'inexécution suffisamment grave par l'autre partie, ou de force majeure. Des difficultés ponctuelles, sans mise en garde préalable, ne suffisent pas (Cass. com., 24 juin 2014, n° 12-27.908). Mieux vaut documenter, mettre en demeure, puis décider.",
    },
    {
      q: "Comment se calcule l'indemnité ?",
      a: "Elle répare le seul caractère brutal de la rupture. Elle se calcule en principe sur la marge brute escomptée pendant le préavis manquant : chiffre d'affaires escompté moins les coûts variables non supportés, éventuellement moins certains coûts fixes non supportés (Cass. com., 28 juin 2023, n° 21-16.940, publié). Les éléments postérieurs à l'annonce, comme une reconversion réussie, ne comptent pas pour fixer la durée du préavis (Cass. com., 17 mai 2023, n° 21-24.809).",
    },
    {
      q: "QuoteBuilder gère-t-il les préavis et les ruptures de relation ?",
      a: "Non. QuoteBuilder reçoit et organise les demandes de devis. Il n'a pas de champ pour la date de début d'une relation, ni de rappel de fin de préavis, ni de signature électronique, ni de facturation. Les notes internes du dossier, en ajout seul, peuvent servir de journal daté. Le calcul du préavis se fait avec le [calculateur de préavis de rupture brutale](https://www.quotebuilder.co/outils/calculateur-preavis-rupture-brutale), en local, sans compte.",
    },
  ],
  "compensation-creances-deduction-facture-devis-b2b": [
    {
      q: "Mon client a payé ma facture « moins » des pénalités de retard : a-t-il le droit ?",
      a: "Seulement si la somme déduite est certaine, liquide et exigible, ou si vous avez accepté la compensation. Si vous contestez les pénalités avec des éléments sérieux, elles ne sont pas certaines et la compensation légale ne joue pas (Cass. com., 24 mars 2015, n° 13-23.791). La facture reste due en entier.",
    },
    {
      q: "Qu'est-ce qu'une créance « certaine, liquide et exigible » ?",
      a: "Certaine : son existence n'est pas sérieusement contestée. Liquide : son montant est fixé ou se calcule simplement à partir du contrat. Exigible : elle est échue. Les trois conditions viennent de l'article 1347-1 du code civil.",
    },
    {
      q: "La compensation est-elle automatique ?",
      a: "Non, plus depuis le 1er octobre 2016 : elle doit être invoquée (article 1347). Une fois invoquée, elle prend effet à la date où ses conditions étaient réunies.",
    },
    {
      q: "Une clause de compensation dans mes CGV suffit-elle ?",
      a: "Elle permet une compensation convenue (article 1348-2), si elle a été acceptée par le client. Elle ne rend pas due une somme contestée. La rédaction la plus solide admet la compensation des sommes reconnues par écrit et exclut la déduction des sommes discutées.",
    },
    {
      q: "Puis-je interdire à mon client toute compensation ?",
      a: "Vous pouvez l'écrire, et une clause acceptée donne un argument. Elle ne supprime pas la possibilité de demander au juge la compensation de dettes connexes (articles 1348 et 1348-1), et une clause très large, imposée, peut se discuter. La version équilibrée du vérificateur tient mieux.",
    },
    {
      q: "Que change l'article L441-17 du code de commerce ?",
      a: "Dans la relation entre un fournisseur et un distributeur (hors grossistes), il interdit de déduire d'office de la facture du fournisseur les pénalités ou rabais pour non-respect d'un engagement contractuel, même fondés. Les pénalités logistiques doivent être notifiées avec la preuve du manquement et du préjudice, et restent plafonnées à 2 % de la valeur des produits commandés de la catégorie.",
    },
    {
      q: "Mon client est en redressement judiciaire : puis-je compenser ce que je lui dois ?",
      a: "Seulement avec des créances connexes, nées du même contrat ou d'un ensemble contractuel unique (article L622-7 du code de commerce ; Cass. com., 6 mai 2026, n° 23-23.937). Déclarez votre créance dans les délais et faites-vous accompagner.",
    },
    {
      q: "Ma facture a été cédée à un factor : le client peut-il lui opposer ses pénalités ?",
      a: "Oui pour des dettes connexes, même après la notification de la cession (article 1324 ; Cass. com., 10 sept. 2025, n° 24-17.326), à condition que les pénalités soient elles-mêmes certaines, liquides et exigibles. Un client qui a pris acte de la cession sans réserve ne peut plus opposer la compensation qu'il aurait pu opposer au fournisseur (article 1347-5).",
    },
    {
      q: "QuoteBuilder peut-il gérer une compensation ou un avoir ?",
      a: "Non. QuoteBuilder ne gère ni factures, ni avoirs, ni encaissements. Il capte et qualifie les demandes de devis. La compensation se règle dans vos conditions, vos échanges écrits et votre comptabilité ; une note interne (ajout seul) peut garder une trace pour l'équipe.",
    },
    {
      q: "Par où commencer concrètement ?",
      a: "Passez votre cas dans le [vérificateur de compensation de créances](https://www.quotebuilder.co/outils/verificateur-compensation-creances), reprenez la clause dans vos devis et conditions générales, puis répondez par écrit à la déduction. Pour voir un funnel côté visiteur, testez la [démo rayonnage](https://www.quotebuilder.co/c/demo/rayonnage).",
    },
  ],
  "sous-traitance-loi-1975-paiement-direct-devis-b2b": [
    {
      q: "Qui est sous-traitant au sens de la loi du 31 décembre 1975 ?",
      a: "Celui à qui un entrepreneur confie, par un sous-traité et sous sa responsabilité, l'exécution de tout ou partie d'un contrat d'entreprise ou d'une partie d'un marché public conclu avec le maître de l'ouvrage (article 1er). Il faut un contrat d'entreprise en haut et en bas de la chaîne : le fournisseur de produits standard n'est pas sous-traitant, celui qui réalise un travail spécifique pour les besoins particuliers du donneur d'ordre l'est (Cass. com., 17 mars 1998, n° 95-17.997).",
    },
    {
      q: "L'acceptation du sous-traitant doit-elle être écrite ?",
      a: "La loi n'impose pas de forme, mais l'écrit est de loin le plus sûr. L'acceptation tacite est admise si elle résulte d'actes manifestant sans équivoque la volonté du maître de l'ouvrage, pas d'une simple attitude passive (Cass. 3e civ., 18 juillet 1984, n° 83-11.401 ; Cass. 3e civ., 28 janvier 2021, n° 19-26.271). Un paiement direct du sous-traitant par le maître de l'ouvrage peut en être un.",
    },
    {
      q: "Peut-on faire accepter le sous-traitant après la signature du sous-traité ?",
      a: "Oui. L'article 3 vise la conclusion et toute la durée du contrat, et la chambre mixte a jugé que l'acceptation et l'agrément n'ont pas à être antérieurs ou concomitants à la conclusion du sous-traité (Cass. ch. mixte, 13 mars 1981, n° 80-12.125). En pratique, plus on attend, plus le maître de l'ouvrage risque d'avoir déjà payé l'entreprise principale.",
    },
    {
      q: "Que risque l'entreprise principale qui ne présente pas son sous-traitant ?",
      a: "Elle reste tenue envers lui mais ne peut pas lui opposer le sous-traité (article 3, alinéa 2), et l'infraction est punie d'une amende de 7 500 € (article L8271-1-1 du code du travail). Le sous-traitant peut aussi, selon la jurisprudence, résilier le sous-traité ; s'il ne le fait pas, le contrat doit être exécuté (Cass. 3e civ., 10 novembre 2021, n° 20-19.372).",
    },
    {
      q: "Quand la caution doit-elle être remise au sous-traitant ?",
      a: "Avant la conclusion du sous-traité et, si les travaux ont commencé plus tôt, avant leur commencement (Cass. 3e civ., 21 janvier 2021, n° 19-22.219). Une caution remise après coup ne sauve pas le contrat : il est nul, d'une nullité relative que seul le sous-traitant peut invoquer, et qu'il peut aussi choisir de confirmer (Cass. 3e civ., 23 novembre 2023, n° 22-21.463).",
    },
    {
      q: "Comment fonctionne l'action directe ?",
      a: "Le sous-traitant accepté et agréé met l'entreprise principale en demeure de payer et envoie une copie au maître de l'ouvrage. Un mois après, sans paiement, il peut réclamer directement au maître de l'ouvrage les sommes dues au titre du sous-traité (article 12), dans la limite de ce que le maître de l'ouvrage doit encore à l'entreprise principale à la date où il reçoit la copie (article 13).",
    },
    {
      q: "Et si l'entreprise principale est en liquidation ?",
      a: "L'action directe subsiste (article 12). Si aucune mise en demeure n'a été envoyée avant la liquidation, la déclaration de la créance au passif vaut mise en demeure (Cass. 3e civ., 13 juillet 2023, n° 21-23.747). Prévenez aussi le maître de l'ouvrage par écrit, sans attendre.",
    },
    {
      q: "Le maître de l'ouvrage peut-il être tenu de payer un sous-traitant qu'il n'a pas accepté ?",
      a: "Pas par l'action directe, qui suppose l'acceptation. Mais dans les travaux de bâtiment et de travaux publics, et en sous-traitance industrielle, l'article 14-1 l'oblige, s'il connaît la présence du sous-traitant, à mettre l'entrepreneur principal en demeure de le présenter, et à exiger la justification de la caution sans délégation. S'il ne le fait pas, sa responsabilité peut être engagée (Cass. 3e civ., 11 septembre 2013, n° 12-21.077), à condition qu'il ait personnellement su (Cass. 3e civ., 15 avril 2021, n° 19-20.424).",
    },
    {
      q: "En marché public, le sous-traitant a-t-il besoin d'une caution ?",
      a: "Le sous-traitant direct accepté et agréé est payé directement par l'acheteur au-delà de 600 euros toutes taxes comprises (article R2193-10 du code de la commande publique), et toute renonciation au paiement direct est réputée non écrite. La caution vise surtout le second rang : le sous-traitant qui sous-traite à son tour doit délivrer une caution ou une délégation de paiement (article 6 de la loi, dernier alinéa).",
    },
    {
      q: "QuoteBuilder gère-t-il l'acceptation des sous-traitants ou la caution ?",
      a: "Non. QuoteBuilder reçoit les demandes de devis et garde, pour chaque dossier, les réponses du prospect, ses fichiers et les notes internes de l'équipe. Il ne fait ni signature, ni facture, ni suivi de paiement, et n'a pas de champ dédié à la sous-traitance. Vous pouvez ajouter des questions au funnel (maître de l'ouvrage, chantier, marché public ou privé) et noter les dates clés dans le dossier ; le contrôle se fait avec le vérificateur, à part.",
    },
  ],
  "exception-inexecution-devis-b2b": [
    {
      q: "L'exception d'inexécution met-elle fin au contrat ?",
      a: "Non. Elle permet de refuser (1219) ou de suspendre (1220) l'exécution. Pour mettre fin au contrat, voyez la résolution (articles 1224 à 1226) et l'article sur la [clause résolutoire](https://www.quotebuilder.co/blog/clause-resolutoire-devis-b2b).",
    },
    {
      q: "Faut-il une mise en demeure avant d'invoquer l'article 1219 ?",
      a: "Le texte de l'article 1219 n'impose pas de mise en demeure. L'arrêt Cass. 3e civ., 18 septembre 2025, n° 23-24.005, le rappelle en bail commercial lorsque les locaux sont impropres à l'usage. En devis B2B, une information écrite datée reste une bonne pratique.",
    },
    {
      q: "Quelle différence entre 1219 et 1220 ?",
      a: "1219 : inexécution actuelle. 1220 : inexécution future manifeste, avec notification dans les meilleurs délais et conséquences suffisamment graves pour vous.",
    },
    {
      q: "Que signifie « suffisamment grave » ?",
      a: "Le code ne fixe pas de pourcentage. On regarde l'économie du contrat, le caractère essentiel du manquement, la possibilité de rattrapage et la bonne foi. Les arrêts locatifs cités insistent souvent sur l'impropriété à l'usage.",
    },
    {
      q: "Puis-je suspendre toute la prestation pour un petit retard ?",
      a: "Risqué. Une suspension disproportionnée peut être jugée abusive et devenir une inexécution fautive (article 1231-1). Préférez une suspension partielle liée au manquement.",
    },
    {
      q: "L'exception d'inexécution s'applique-t-elle à une obligation de paiement ?",
      a: "Selon les cas, oui : par exemple refuser de payer le solde tant que la livraison conforme n'est pas faite. Ce n'est pas un permis général de ne pas payer une somme exigible sans manquement caractérisé de l'autre.",
    },
    {
      q: "Que se passe-t-il si je ne notifie pas sous 1220 ?",
      a: "Le texte exige la notification dans les meilleurs délais. Sans elle, la suspension anticipée est fragile.",
    },
    {
      q: "Une clause peut-elle écarter les articles 1219 et 1220 ?",
      a: "Entre professionnels, l'aménagement est possible mais limité par la bonne foi, l'article 1171 (contrat d'adhésion) et l'interdiction de clauses qui videraient l'obligation essentielle (article 1170). Renoncer purement et simplement à toute exception, de façon unilatérale, est souvent fragile.",
    },
    {
      q: "QuoteBuilder enregistre-t-il ma notification de suspension ?",
      a: "Non. Aucun champ dédié sur le dossier. Gardez la preuve hors outil (courriel, LRAR). L'espace prospect ne remplace pas cette preuve.",
    },
    {
      q: "Par où commencer concrètement ?",
      a: "Passez votre cas dans le [vérificateur d'exception d'inexécution](https://www.quotebuilder.co/outils/verificateur-exception-inexecution), alignez la clause de vos CGV, puis, si besoin, créez un compte Free ou testez la [démo rayonnage](https://www.quotebuilder.co/c/demo/rayonnage).",
    },
  ],
  "clause-resolutoire-devis-b2b": [
    {
      q: "Quelle différence entre clause résolutoire et résolution unilatérale ?",
      a: "La clause résolutoire (article 1225) est prévue au contrat : si ses conditions sont réunies et la mise en demeure correcte, la résolution est en principe de plein droit. La résolution unilatérale (article 1226) existe même sans clause : le créancier notifie à ses risques et périls et doit prouver la gravité si le débiteur conteste.",
    },
    {
      q: "Faut-il toujours une mise en demeure ?",
      a: "En principe oui. L'article 1225 l'impose pour la clause résolutoire sauf stipulation contraire. L'article 1226 l'impose sauf urgence. La jurisprudence admet aussi une dispense quand la mise en demeure serait vaine (Cass. com., 17 janvier 2024, n° 22-20.785). Ces exceptions sont étroites.",
    },
    {
      q: "La mise en demeure doit-elle citer la clause ?",
      a: "Oui, pour une clause résolutoire : l'article 1225 dit que la mise en demeure ne produit effet que si elle mentionne expressément la clause. Pour l'article 1226, elle doit mentionner qu'à défaut d'exécution, le créancier sera en droit de résoudre le contrat.",
    },
    {
      q: "Quel délai laisser ?",
      a: "Le code civil parle d'un délai raisonnable, sans durée chiffrée. Si le contrat fixe quinze ou trente jours, respectez-le. Un délai manifestement trop court laisse penser que la rupture était décidée d'avance. Les repères de quinze et trente jours dans le vérificateur sont ceux de l'outil, pas des seuils légaux.",
    },
    {
      q: "Une clause peut-elle viser « toute obligation du contrat » ?",
      a: "Oui, sous condition que le débiteur puisse identifier clairement les engagements (Cass. com., 3 juin 2026, n° 24-19.612). Lister nommément les obligations critiques reste plus sûr.",
    },
    {
      q: "Que devient l'acompte en cas de résolution ?",
      a: "Cela dépend de l'utilité des prestations déjà fournies (article 1229) et des clauses éventuelles sur les acomptes, arrhes ou dédit. Ce n'est pas automatique. Voir aussi [annulation, arrhes et dédit](https://www.quotebuilder.co/blog/annulation-commande-devis-b2b-arrhes-dedit-clause-penale).",
    },
    {
      q: "QuoteBuilder peut-il envoyer la mise en demeure ?",
      a: "Non. QuoteBuilder ne fait pas de signature électronique, ni de facturation, ni d'envoi d'acte juridique de rupture. Vous rédigez et envoyez la mise en demeure hors de l'outil. Le vérificateur vous aide à préparer le contenu.",
    },
    {
      q: "La clause survit-elle dans le PDF du devis QuoteBuilder ?",
      a: "Non. Le PDF porte le pied « Document indicatif, non contractuel. » et ne peut afficher aucune clause. La clause vit dans vos CGV acceptées avec le devis.",
    },
    {
      q: "Peut-on résoudre si le client est en redressement judiciaire ?",
      a: "Pas du seul fait de l'ouverture de la procédure (L622-13). Des règles spécifiques s'appliquent. Consultez votre conseil dès qu'une procédure collective apparaît.",
    },
    {
      q: "Où tester le vérificateur ?",
      a: "Sur [quotebuilder.co/outils/verificateur-clause-resolutoire](https://www.quotebuilder.co/outils/verificateur-clause-resolutoire). Calcul local, aucune donnée envoyée, pas un conseil juridique.",
    },
  ],
  "force-majeure-imprevision-devis-b2b": [
    {
      q: "Quelle est la différence entre force majeure et imprévision ?",
      a: "La force majeure (article 1218) suppose un empêchement d'exécuter. L'imprévision (article 1195) suppose une exécution encore possible, mais excessivement onéreuse après un changement de circonstances imprévisible, pour une partie qui n'avait pas accepté d'assumer le risque. Les effets ne sont pas les mêmes : suspension ou résolution de plein droit d'un côté, renégociation puis éventuelle intervention du juge de l'autre.",
    },
    {
      q: "Les trois conditions de l'article 1218 sont-elles cumulatives ?",
      a: "Oui. Il faut un événement hors du contrôle du débiteur, imprévisible raisonnablement à la conclusion du contrat, et dont les effets ne peuvent être évités par des mesures appropriées, qui empêche l'exécution. Manquer l'une des trois fait tomber la qualification.",
    },
    {
      q: "Puis-je exclure l'article 1195 dans un devis entre professionnels ?",
      a: "Oui, si la clause est claire et que la partie concernée accepte d'assumer le risque. Une formule vague (« prix fermes et définitifs ») est plus fragile qu'une renonciation expresse à se prévaloir de l'article 1195, ou qu'une indexation qui organise le risque. L'acceptation des CGV suit l'article 1119.",
    },
    {
      q: "Une liste d'événements (épidémie, guerre, grève) suffit-elle ?",
      a: "Rarement. Une liste fermée laisse hors champ tout ce qui n'y figure pas. Mieux vaut renvoyer à l'article 1218 et donner des exemples non limitatifs, puis traiter l'imprévision à part.",
    },
    {
      q: "Le client peut-il refuser de payer en invoquant la force majeure ?",
      a: "En principe, une obligation de somme d'argent n'est pas empêchée au sens de l'article 1218. La Cour de cassation l'a rappelé pour les loyers commerciaux pendant les fermetures COVID (Cass. 3e civ., 30 juin 2022, n° 21-20.190). Le débat sur un acompte ou un solde dépend des faits et des clauses, mais « je ne peux plus exploiter mon atelier » ne suspend pas automatiquement une dette d'argent.",
    },
    {
      q: "Dois-je continuer d'exécuter pendant une renégociation 1195 ?",
      a: "Oui. L'article 1195 le dit expressément. Arrêter d'exécuter, c'est s'exposer aux sanctions de l'inexécution (article 1217), même si la demande de renégociation est légitime.",
    },
    {
      q: "Un incendie chez mon fournisseur est-il de la force majeure ?",
      a: "Cela dépend : exclusivité réelle du fournisseur, alternatives possibles, mesures prises, caractère temporaire ou définitif. Ce n'est pas automatique. Documentez les tentatives d'alternative et notifiez tôt.",
    },
    {
      q: "Le silence du client vaut-il acceptation d'une hausse de prix ?",
      a: "Non, sauf circonstances particulières caractérisées. Toute modification du contrat requiert en principe le consentement des parties (article 1193) ; le silence ne vaut pas à lui seul acceptation (Cass. com., 26 février 2025, n° 23-21.063).",
    },
    {
      q: "QuoteBuilder peut-il enregistrer ma clause de force majeure ?",
      a: "Non. Aucun champ dédié, pas de case d'acceptation des CGV, pas de signature électronique, PDF récapitulatif « Document indicatif, non contractuel. ». La clause vit dans votre devis ferme et vos conditions générales.",
    },
    {
      q: "Les pourcentages +30 % / +50 % / +100 % de l'outil sont-ils légaux ?",
      a: "Non. Ce sont des **repères de l'outil** pour classer une situation. Le code civil ne fixe aucun pourcentage d'onérosité excessive. Seuls les faits, et le cas échéant le juge, tranchent.",
    },
  ],
  "clause-attributive-juridiction-mediation-devis-b2b": [
    {
      q: "Une clause attributive de juridiction est-elle valable avec un artisan ?",
      a: "Non, si l'artisan exerce en entreprise individuelle sans être commerçant. L'article 48 exige que toutes les parties aient contracté en qualité de commerçant, et la Cour de cassation a jugé qu'un artisan n'acquiert pas cette qualité en acceptant des lettres de change (Cass. com., 11 mai 1993, n° 91-14.734). Le fait que le tribunal de commerce soit compétent pour les litiges entre artisans ne change pas cette règle.",
    },
    {
      q: "Et avec une association ou une société civile ?",
      a: "Non plus : elles ne sont pas commerçantes. La clause est réputée non écrite à leur égard, et les articles 42 et 46 du code de procédure civile s'appliquent. Si votre client est une SAS ou une SARL, il est commerçant par sa forme (article L210-1 du code de commerce).",
    },
    {
      q: "Qu'est-ce qu'une clause « très apparente » ?",
      a: "La loi ne fixe pas de taille de police. La Cour de cassation demande au juge de regarder la typographie et la présentation de la clause dans le document (Cass. com., 20 avril 2017, n° 15-20.908). Un titre explicite, des caractères distincts du reste, un rappel près de la signature du client vont dans le bon sens. Une clause noyée dans un bloc de CGV en petits caractères, non.",
    },
    {
      q: "Si je saute l'étape de médiation prévue, que risque mon action ?",
      a: "D'être déclarée irrecevable, si le client l'invoque et si la clause institue une vraie procédure préalable obligatoire (Cass. ch. mixte, 14 février 2003). Le juge n'examine alors pas le fond. Et lancer la médiation après l'assignation ne régularise pas l'action (Cass. ch. mixte, 12 décembre 2014).",
    },
    {
      q: "« Les parties tenteront de régler leur différend à l'amiable » : est-ce une clause obligatoire ?",
      a: "C'est discuté. En 2014, la chambre commerciale a jugé qu'une clause non assortie de conditions particulières de mise en œuvre n'était pas une conciliation obligatoire. En 2018, elle a appliqué une clause courte qui désignait un tiers. Le plus sûr est d'écrire une clause précise (tiers, délai, notification) si vous voulez une étape obligatoire, et de ne rien écrire d'ambigu si vous n'en voulez pas.",
    },
    {
      q: "La médiation m'empêche-t-elle de demander une mesure urgente ?",
      a: "Non. Depuis le 1er septembre 2025, l'article 1537 du code de procédure civile prévoit que le recours à un mode amiable conventionnel ne fait pas obstacle à ce que le juge ordonne une mesure d'instruction ou une mesure provisoire ou conservatoire. Écrivez-le aussi dans la clause.",
    },
    {
      q: "Pendant la médiation, le délai pour agir continue-t-il de courir ?",
      a: "Non, il est suspendu à compter du jour où les parties conviennent, après la survenance du litige, de recourir à la médiation ou à la conciliation, ou à défaut d'accord écrit, du jour de la première réunion. Il reprend, pour au moins six mois, quand la médiation est déclarée terminée (article 2238 du code civil). Gardez une trace datée de ces étapes.",
    },
    {
      q: "Ma facture impayée doit-elle passer par la médiation ?",
      a: "Si votre clause s'applique à « tout différend » sans exception, le client peut le soutenir. Pour l'éviter, prévoyez dans la clause que l'étape amiable ne s'applique pas au recouvrement des sommes dont le principe et le montant ne sont pas contestés par écrit avant l'échéance.",
    },
    {
      q: "Puis-je mettre une clause d'arbitrage dans mon devis ?",
      a: "Entre commerçants, c'est possible (article L721-3 du code de commerce). Elle ne peut pas être opposée à une partie qui n'a pas contracté dans le cadre de son activité professionnelle (article 2061 du code civil). Pour un devis courant, l'arbitrage coûte souvent trop cher au regard des montants en jeu : une étape de médiation suivie du tribunal est en général plus adaptée.",
    },
    {
      q: "QuoteBuilder peut-il faire accepter ma clause de juridiction au client ?",
      a: "Non. QuoteBuilder ne gère ni CGV, ni signature électronique, ni case d'acceptation, et son PDF récapitulatif porte la mention « Document indicatif, non contractuel. ». La clause doit figurer dans votre devis ferme et vos conditions générales, acceptés par le client dans vos outils habituels. QuoteBuilder vous aide à garder la trace de la demande et, dans les notes internes, celle des étapes amiables.",
    },
  ],
  "clause-non-sollicitation-personnel-devis-b2b": [
    {
      q: "Une clause de non-sollicitation du personnel est-elle valable ?",
      a: "Elle peut l'être. Elle n'est licite que si elle est proportionnée aux intérêts légitimes à protéger au regard de l'objet du contrat, parce qu'elle porte atteinte à la liberté du travail et à la liberté d'entreprendre (Cass. com., 27 mai 2021 ; Cass. com., 23 septembre 2026). Une clause limitée aux personnes affectées au contrat, de durée courte, et dont l'intérêt est expliqué, a les meilleures chances de tenir.",
    },
    {
      q: "Qui doit prouver que la clause est proportionnée ?",
      a: "Celui qui l'invoque. La Cour de cassation l'a jugé le 23 septembre 2026 (n° 24-21.805) : l'entreprise qui demande l'application de la clause doit démontrer qu'elle est proportionnée. Dans cette affaire, la clause ne durait que six mois et elle a été jugée illicite, faute d'explication de l'intérêt protégé.",
    },
    {
      q: "Quelle durée prévoir ?",
      a: "Aucun texte ne la fixe. Les affaires jugées portaient sur un an (2021) et six mois (2026), et la durée n'a pas suffi dans les deux cas. Le plus défendable est la durée du contrat, plus une période courte après la fin, justifiée par exemple par le temps de recruter et de former un remplaçant. Le vérificateur utilise douze mois comme repère interne, pas comme seuil légal.",
    },
    {
      q: "La clause peut-elle viser tout le personnel ?",
      a: "Elle le peut sur le papier, mais c'est difficile à justifier. Le prestataire devra expliquer pourquoi l'embauche d'une personne qui n'a jamais travaillé pour le client menace un intérêt légitime lié au contrat. Viser les personnes qui ont participé à l'exécution du contrat est beaucoup plus solide.",
    },
    {
      q: "Le salarié est-il lié par la clause ?",
      a: "Non. Il n'est pas partie au contrat (article 1199 du code civil) et reste libre de démissionner. La clause engage l'entreprise qui embauche, pas le salarié. Et si la clause l'empêche d'être embauché, il peut demander réparation à son employeur (Cass. soc., 2 mars 2011, n° 09-40.547).",
    },
    {
      q: "Une agence d'intérim peut-elle interdire l'embauche de ses intérimaires ?",
      a: "Non, pas à l'issue de la mission. L'article L1251-44 du code du travail répute non écrite toute clause tendant à interdire l'embauche par l'entreprise utilisatrice du salarié temporaire à l'issue de sa mission, et le contrat de mission doit mentionner que cette embauche n'est pas interdite (article L1251-16, 7°).",
    },
    {
      q: "Quelle indemnité prévoir ?",
      a: "Un montant en rapport avec le préjudice réel, en général le coût de recrutement et de formation d'un remplaçant, avec la base de calcul écrite. Une indemnité forfaitaire est une clause pénale : le juge peut la réduire si elle est manifestement excessive (article 1231-5 du code civil). Sans indemnité, il faut prouver son préjudice.",
    },
    {
      q: "Le salarié a postulé de lui-même : la clause s'applique-t-elle ?",
      a: "Cela dépend de la rédaction. Une clause qui interdit seulement de « solliciter » ne vise pas la candidature spontanée ; une clause qui interdit toute embauche la vise. Une rédaction d'équilibre exclut la réponse à une offre publique non ciblée, sans contact préalable du client, et prévoit d'informer le prestataire.",
    },
    {
      q: "Non-sollicitation et non-concurrence, est-ce la même chose ?",
      a: "Non. La clause de non-sollicitation n'est ni une variante ni une précision de la clause de non-concurrence (Cass. com., 11 juillet 2006, n° 04-20.438). La non-concurrence limite l'activité de celui qui s'engage ; la non-sollicitation limite le recrutement du personnel d'une autre entreprise.",
    },
    {
      q: "QuoteBuilder ajoute-t-il une clause de non-sollicitation à mes devis ?",
      a: "Non. QuoteBuilder reçoit et suit les demandes de devis ; le PDF récapitulatif d'une demande porte la mention « Document indicatif, non contractuel. » et ne contient pas de clause. La clause se rédige dans votre devis et vos conditions générales, en dehors du logiciel. Le [vérificateur gratuit](https://www.quotebuilder.co/outils/verificateur-clause-non-sollicitation-personnel) vous aide à la contrôler et à la rédiger.",
    },
  ],
  "accord-confidentialite-nda-avant-devis-b2b": [
    {
      q: "Faut-il un accord de confidentialité pour une simple demande de devis ?",
      a: "Pas toujours. Si le premier prix peut se faire sans plan, sans volume prévisionnel et sans nom de client, il n'y a rien à protéger à ce stade. L'accord devient utile quand il faut transmettre ce qui a une valeur : un plan coté, un fichier 3D, une formulation, un prix cible. Et il devient indispensable si l'objet peut être breveté.",
    },
    {
      q: "Sans NDA, le fournisseur peut-il réutiliser mes plans ?",
      a: "Non, pas librement. L'article 1112-2 du code civil engage la responsabilité de celui qui utilise ou divulgue sans autorisation une information confidentielle obtenue pendant des négociations. Mais il faudra prouver que l'information était confidentielle, puis la faute et le préjudice. L'accord rend cette preuve beaucoup plus simple.",
    },
    {
      q: "Un e-mail qui dit « merci de garder ces plans confidentiels » suffit-il ?",
      a: "C'est mieux que rien : il montre que l'information était identifiée comme confidentielle et qu'une mesure de protection a été prise. Mais il ne dit ni la finalité, ni la durée, ni les destinataires, ni le sort des fichiers. Et le fournisseur ne s'est engagé à rien tant qu'il n'a pas accepté.",
    },
    {
      q: "Quelle durée choisir ?",
      a: "Une durée cohérente avec la vie de l'information. Un prix cible vieillit vite ; un plan de pièce ou une formulation beaucoup moins. Évitez la confidentialité « sans limite », que l'article 1210 du code civil rend fragile. Distinguez aussi la période d'échange et la durée de l'obligation, qui doit survivre à la fin des discussions.",
    },
    {
      q: "Le fournisseur peut-il démonter l'échantillon que je lui ai confié ?",
      a: "Oui, en principe, s'il le détient de façon licite et si rien ne l'interdit. L'article L151-3 du code de commerce range le démontage et le test parmi les modes d'obtention licite d'un secret, sauf stipulation contractuelle contraire. Si vous ne voulez pas, écrivez-le dans l'accord.",
    },
    {
      q: "Le NDA protège-t-il mon invention ?",
      a: "Il protège l'information, pas l'invention. Il aide à ne pas détruire la nouveauté avant un dépôt de brevet, ce que l'INPI recommande expressément. Mais seul le dépôt donne un titre. L'e-Soleau prouve une date, sans protéger.",
    },
    {
      q: "Une clause pénale est-elle vraiment utile ?",
      a: "Oui, surtout pour la confidentialité. La Cour de cassation a jugé en 2019 que la violation d'un accord de confidentialité ne dispensait pas de prouver le principe et le montant du préjudice. La clause pénale fixe ce montant à l'avance. Le juge peut toutefois la modérer si elle est manifestement excessive (article 1231-5 du code civil).",
    },
    {
      q: "Je suis le fournisseur : puis-je refuser de signer ?",
      a: "Oui. Vous pouvez aussi demander des corrections : exclusions classiques, définition par catégories, durée raisonnable, sous-traitants autorisés, clause pénale proportionnée, accord mutuel. La plupart des clients sérieux les acceptent, parce qu'elles rendent l'accord plus solide.",
    },
    {
      q: "Les informations données à l'oral sont-elles couvertes ?",
      a: "Seulement si l'accord le prévoit. La règle habituelle : l'information orale est confidentielle si elle est identifiée comme telle au moment de l'échange et confirmée par écrit dans un délai court. Sans cette règle, une visite d'atelier ou une réunion de lancement laisse peu de traces.",
    },
    {
      q: "Combien de temps ai-je pour agir en cas d'atteinte au secret des affaires ?",
      a: "Cinq ans, à compter du jour où le détenteur légitime a connu ou aurait dû connaître le dernier fait qui permet d'agir (article L152-2 du code de commerce). Pour une action fondée sur l'accord lui-même, parlez du délai avec votre avocat.",
    },
  ],
  "clause-limitation-responsabilite-devis-b2b": [
    {
      q: "Une clause de limitation de responsabilité est-elle valable entre professionnels ?",
      a: "Oui, en principe. Le code civil ne l'interdit pas entre professionnels ; il en fixe les limites. Elle est réputée non écrite si elle prive de sa substance l'obligation essentielle (article 1170), écartée en cas de faute lourde ou dolosive, interdite pour les dommages aux personnes causés par un produit défectueux (article 1245-14), et contrôlable au titre du déséquilibre significatif dans un contrat d'adhésion (article 1171).",
    },
    {
      q: "Quel plafond prévoir ?",
      a: "Aucun texte ne fixe de montant. Dans l'affaire Faurecia (Cass. com., 29 juin 2010), un plafond égal au prix payé n'a pas été jugé dérisoire. Un plafond au moins égal au prix du devis est donc le plus facile à défendre ; un plafond très inférieur au prix, pour un engagement central, sera discuté. Il doit aussi rester sous le plafond par sinistre de votre assurance.",
    },
    {
      q: "Peut-on exclure toute responsabilité ?",
      a: "Non, pas utilement. Une clause « aucune responsabilité » prive l'engagement principal de sa substance et est réputée non écrite (article 1170). Le prestataire répond alors de tout le dommage prouvé, ce qui est pire qu'un plafond modéré.",
    },
    {
      q: "Qu'est-ce qu'une obligation essentielle ?",
      a: "C'est l'engagement que le client achète, celui qui fait l'intérêt du contrat : livrer dans le délai pour un transporteur rapide (Chronopost, 1996), livrer une installation qui fonctionne pour un intégrateur. La clause qui rend son manquement gratuit ou symbolique est réputée non écrite ; celle qui en limite la réparation à un montant réel peut être valable.",
    },
    {
      q: "La clause s'applique-t-elle en cas de faute lourde ?",
      a: "Non. La faute lourde et le dol écartent la clause. Mais la faute lourde est rare : la Cour de cassation exige une négligence d'une extrême gravité dénotant l'inaptitude du débiteur à accomplir sa mission (ch. mixte, 22 avril 2005 ; Cass. com., 9 septembre 2026), et elle ne se déduit pas du seul manquement, même à une obligation essentielle (Faurecia, 2010).",
    },
    {
      q: "« Dommages indirects exclus » : cela suffit-il ?",
      a: "C'est risqué. Le mot « indirect » sera discuté, et une perte de production causée par une panne est souvent présentée comme un dommage direct. Dans un contrat d'adhésion, le doute profite au client (article 1190). Mieux vaut nommer les préjudices exclus : perte d'exploitation, de production, de chiffre d'affaires ou de marge, de données.",
    },
    {
      q: "Les conditions générales au verso du devis suffisent-elles ?",
      a: "Pas toujours. Elles n'ont effet que si le client les a connues et acceptées (article 1119). Une mention d'acceptation dans le devis signé, avec les CGV jointes, est la preuve la plus simple. Une clause écrite directement dans le devis est encore plus sûre, et elle l'emporte sur des conditions générales contraires du client.",
    },
    {
      q: "Peut-on limiter le délai pour réclamer ?",
      a: "Oui, mais pas à moins d'un an (article 2254), et le délai doit courir à compter du jour où le client a connu ou aurait dû connaître les faits. La Cour de cassation a réputé non écrite une clause d'un an à compter du fait générateur (Cass. 1re civ., 13 mars 2024, n° 22-12.345). Sans clause, le délai est de cinq ans (article 2224).",
    },
    {
      q: "Et si le client est un particulier ?",
      a: "La clause qui supprime ou réduit son droit à réparation est présumée abusive de manière irréfragable (article R. 212-1, 6° du code de la consommation). Elle ne doit pas figurer dans un devis adressé à un consommateur. Décrivez plutôt précisément la prestation et ses limites techniques.",
    },
    {
      q: "QuoteBuilder ajoute-t-il une clause de responsabilité à mes devis ?",
      a: "Non. QuoteBuilder reçoit et suit les demandes de devis ; le PDF récapitulatif d'une demande porte la mention « Document indicatif, non contractuel. » et ne contient pas de clause. La clause se rédige dans votre devis et vos conditions générales, en dehors du logiciel. Le [vérificateur gratuit](https://www.quotebuilder.co/outils/verificateur-clause-limitation-responsabilite) vous aide à la contrôler et à la rédiger.",
    },
  ],
  "cession-droits-auteur-devis-b2b": [
    {
      q: "Si je paie un photographe, les photos sont-elles à moi ?",
      a: "Les fichiers, oui. Les droits d'auteur, non. L'article L111-1 du code de la propriété intellectuelle précise que le contrat de commande n'emporte pas dérogation aux droits de l'auteur. Pour utiliser les photos, il faut une cession écrite qui liste les droits, les supports, la destination, le territoire et la durée.",
    },
    {
      q: "Un e-mail du photographe qui dit « vous pouvez les utiliser » suffit-il ?",
      a: "C'est un écrit, donc mieux que rien, mais il prouve mal l'étendue de ce qui a été cédé. Un juge lira l'accord de façon restrictive : sans supports ni durée, le client aura du mal à justifier un usage sur un emballage ou en affichage. Mieux vaut une clause signée dans le devis ou dans un avenant.",
    },
    {
      q: "Peut-on céder les droits « pour toujours » ?",
      a: "On peut céder pour toute la durée légale des droits, soit la vie de l'auteur et 70 ans après sa mort. C'est rarement nécessaire et cela coûte plus cher. Une durée de 3 à 10 ans, avec une possibilité de prolongation, suffit pour la plupart des usages de communication.",
    },
    {
      q: "La formule « tous supports, connus et inconnus » est-elle valable ?",
      a: "Elle n'est pas interdite, mais elle est lue restrictivement et ne règle pas la question de la destination. Pour les formes d'exploitation non prévisibles à la signature, l'article L131-6 exige une clause expresse et une participation aux profits. Une liste des supports réellement prévus est plus sûre pour les deux parties.",
    },
    {
      q: "Le forfait est-il permis pour une cession de droits photo ?",
      a: "Oui, dans les cas listés par l'article L131-4, notamment quand la base de calcul proportionnelle ne peut pas être déterminée, ce qui est le cas pour une photo utilisée dans une communication sans recettes identifiables. Il vaut mieux citer ce motif dans la clause et indiquer un montant distinct pour la cession.",
    },
    {
      q: "Le client peut-il recadrer ou retoucher mes photos ?",
      a: "Seulement si la clause cède l'adaptation et, idéalement, liste les modifications acceptées. Le droit au respect de l'œuvre ne se cède pas (article L121-1) : même avec une cession large, une modification qui dénature la photo peut être contestée.",
    },
    {
      q: "Dois-je être crédité sur tous les supports ?",
      a: "Le droit au nom est un droit moral, qui ne se cède pas. Dans la pratique, l'auteur peut accepter par écrit que son nom ne figure pas sur certains supports (emballage, écran de salon) et que le crédit soit regroupé ailleurs (mentions légales du site). Il faut l'écrire dans la clause.",
    },
    {
      q: "Une agence peut-elle me céder les droits de ses graphistes ?",
      a: "Seulement si elle les a elle-même obtenus de ses graphistes, salariés ou pigistes, car le contrat de travail ne cède pas les droits d'auteur (sauf pour les logiciels, article L113-9). Demandez une garantie écrite : l'agence déclare détenir les droits et vous garantit contre les réclamations des auteurs.",
    },
    {
      q: "Peut-on signer un contrat annuel qui cède tous les reportages à venir ?",
      a: "Non pour la cession elle-même : la cession globale des œuvres futures est nulle (article L131-1). Le contrat-cadre peut fixer les prix et les conditions, mais chaque commande doit avoir sa propre cession, qui identifie les œuvres livrées.",
    },
    {
      q: "Les salariés photographiés doivent-ils donner leur accord ?",
      a: "Oui, s'ils sont reconnaissables. Leur droit à l'image (article 9 du code civil) est distinct des droits du photographe, qui ne peut pas le céder. L'autorisation doit être écrite et préciser les supports et la durée. Il faut aussi décider, dans le devis, qui la recueille.",
    },
  ],
  "obligation-vigilance-attestation-urssaf-devis-b2b": [
    {
      q: "À partir de quel montant l'obligation de vigilance s'applique-t-elle ?",
      a: "À partir de 5 000 € hors taxes, pour toute opération portant sur une prestation de services, des travaux ou un acte de commerce (article R. 8222-1 du code du travail). Le seuil s'apprécie sur le montant global du contrat, même s'il est payé en plusieurs factures, comme le précise Service-Public.fr.",
    },
    {
      q: "Quels documents le donneur d'ordre doit-il se faire remettre ?",
      a: "Pour un donneur d'ordre professionnel : une attestation de vigilance de moins de six mois, dont il vérifie l'authenticité, et, si l'immatriculation du prestataire est obligatoire, un Kbis, un extrait RNE, un devis ou un courrier portant nom, adresse complète et numéro d'immatriculation, ou un récépissé de dépôt de déclaration (article D. 8222-5). Pour un particulier, un seul de ces documents suffit (article D. 8222-4).",
    },
    {
      q: "Combien de temps une attestation de vigilance est-elle valable ?",
      a: "Elle doit dater de moins de six mois au moment où elle est remise. Une attestation du 12 octobre 2026 peut être remise jusqu'au 11 avril 2027 inclus. L'attestation provisoire de début d'activité vaut jusqu'à la première échéance déclarative ou de paiement.",
    },
    {
      q: "À quelle fréquence faut-il renouveler la vérification ?",
      a: "À la conclusion du contrat, puis tous les six mois jusqu'à la fin de son exécution. Le rythme part de la date de conclusion, et à chaque échéance la pièce remise doit avoir moins de six mois.",
    },
    {
      q: "Une attestation sur l'honneur peut-elle remplacer l'attestation de vigilance ?",
      a: "Non. La Cour de cassation juge que seuls les documents de l'article D. 8222-5 libèrent le donneur d'ordre (Cass. 2e civ., 11 février 2016, n° 14-10.614). Elle a refusé en 2024 des attestations sur l'honneur de la gérante et une attestation sur ses cotisations personnelles, le sous-traitant employant des salariés (Cass. 2e civ., 5 décembre 2024, n° 22-21.152).",
    },
    {
      q: "Comment vérifier l'authenticité d'une attestation ?",
      a: "Avec le code de sécurité qui figure sur l'attestation, saisi sur le service de vérification de l'Urssaf ou de la MSA. Le donneur d'ordre compare le document affiché avec celui qu'il a reçu, et garde une trace datée du contrôle.",
    },
    {
      q: "Une entreprise qui a des dettes Urssaf peut-elle obtenir son attestation ?",
      a: "Oui, si elle a souscrit un plan d'apurement et le respecte, ou si elle conteste les sommes par un recours contentieux qui ne fait pas suite à une verbalisation pour travail dissimulé (article L. 243-15 du code de la sécurité sociale). Une déclaration manquante ou une cotisation impayée hors plan bloque en revanche la délivrance.",
    },
    {
      q: "Que risque le donneur d'ordre qui n'a pas vérifié ?",
      a: "Si son cocontractant fait l'objet d'un procès-verbal pour travail dissimulé, il est tenu solidairement des impôts, taxes, cotisations, pénalités, majorations et rémunérations dus (article L. 8222-2), à proportion de la valeur des travaux ou services (article L. 8222-3). Le Conseil constitutionnel a jugé ce mécanisme conforme, à condition que le donneur d'ordre puisse contester la procédure et les sommes.",
    },
    {
      q: "Un particulier qui fait faire des travaux chez lui est-il concerné ?",
      a: "Oui, au-delà de 5 000 € HT, mais avec une obligation allégée : il doit se faire remettre un seul des documents de l'article D. 8222-5, à la conclusion puis tous les six mois, sans contrôle d'authenticité (article D. 8222-4). Les mécanismes d'injonction de l'article L. 8222-5 ne s'appliquent pas à lui.",
    },
    {
      q: "Qu'est-ce qui change avec la loi du 25 juin 2026 ?",
      a: "Elle crée l'article L. 8222-1-1 : le maître de l'ouvrage devra vérifier périodiquement les sous-traitants qu'il accepte, pour les contrats d'un montant minimum, selon des documents et des conditions fixés par décret, avec un contrôle d'authenticité. Le texte entre en vigueur au plus tard fin décembre 2026. Au 2 novembre 2026, nous n'avons pas trouvé de décret publié.",
    },
  ],
  "cgv-conditions-achat-client-devis-b2b": [
    {
      q: "Mes CGV prévalent-elles sur les conditions générales d'achat du client ?",
      a: "Non, pas par principe. Vos CGV n'ont effet que si le client les a connues et acceptées. Si ses conditions d'achat ont aussi été acceptées et disent l'inverse sur un point, les deux clauses sont sans effet sur ce point (code civil, article 1119, alinéa 2). Seul ce qui est écrit dans le devis signé l'emporte sur les deux.",
    },
    {
      q: "Qu'appelle-t-on la « bataille des formulaires » ?",
      a: "C'est le conflit entre les conditions générales du vendeur, envoyées avec le devis, et celles de l'acheteur, envoyées avec le bon de commande. Chacun considère que les siennes s'appliquent. En droit français, depuis 2016, l'article 1119 règle la question : les clauses incompatibles s'annulent, et on applique la loi sur les points concernés.",
    },
    {
      q: "Le client m'envoie un bon de commande avec ses conditions d'achat : que faire avant d'exécuter ?",
      a: "Lisez au moins les clauses de paiement, de propriété, de responsabilité, de pénalités et de tribunal. Si un point ne vous convient pas, répondez par écrit avant de lancer la fabrication ou l'intervention, et attendez la confirmation. Le bon de commande qui modifie votre devis est une nouvelle offre (article 1118) ; l'exécuter sans réserve peut valoir acceptation (article 1113).",
    },
    {
      q: "La clause « nos CGV prévalent sur toute autre condition » suffit-elle ?",
      a: "Non, dès que les conditions d'achat contiennent la clause inverse. Les deux clauses sont incompatibles et sont neutralisées comme les autres. Pour faire prévaloir un point, écrivez-le dans le devis signé.",
    },
    {
      q: "Mes CGV imprimées au dos de la facture sont-elles opposables ?",
      a: "En principe non : la facture arrive après la conclusion du contrat, le client n'a pas pu les accepter au moment de commander. Dans une relation d'affaires suivie, on peut parfois soutenir qu'il les connaissait déjà, mais c'est une question de preuve. Joignez-les au devis.",
    },
    {
      q: "Que devient ma réserve de propriété si les conditions d'achat la refusent ?",
      a: "Elle ne joue pas. La Cour de cassation juge que des clauses croisées qui se contredisent excluent la réserve de propriété, et que le refus de l'acheteur ne peut être levé que par une acceptation expresse et antérieure à la livraison ; ni l'exécution du contrat ni la signature du bon de livraison n'y suffisent (Cass. com., 11 février 2026, n° 24-13.195). Faites accepter la clause par écrit dans le devis signé, avant de livrer.",
    },
    {
      q: "Mes CGV et celles du client désignent deux tribunaux différents : lequel est compétent ?",
      a: "Aucun des deux par l'effet des clauses : quand des clauses attributives de juridiction se contredisent, on applique les règles de compétence de droit commun (Cass. 1re civ., 28 mars 1995, n° 93-13.237). Si le tribunal compte pour vous, écrivez-le de façon très apparente dans le devis signé.",
    },
    {
      q: "Si nos délais de paiement se contredisent, lequel s'applique ?",
      a: "Si les deux conditions générales ont été acceptées, les deux clauses tombent et le délai par défaut de l'article L441-10 s'applique : 30 jours après la réception des marchandises ou l'exécution de la prestation. Si le délai figure sur le bon de commande lui-même ou dans le devis signé, c'est une condition particulière, elle l'emporte.",
    },
    {
      q: "Le client peut-il m'imposer un délai de paiement de 90 jours ?",
      a: "Non. Un délai convenu entre professionnels ne peut pas dépasser 60 jours à compter de la date de la facture, ou 45 jours fin de mois si c'est expressément prévu (article L441-10, rédaction en vigueur au 2 novembre 2026, une nouvelle rédaction étant annoncée au 1er janvier 2027). Une clause d'achat à 90 jours est contraire à la loi, même si vous l'avez acceptée.",
    },
    {
      q: "Le silence du client vaut-il acceptation de mes CGV ?",
      a: "Le silence ne vaut pas acceptation, sauf si la loi, les usages, les relations d'affaires ou des circonstances particulières en décident autrement (article 1120). Un client qui commande en connaissant vos CGV, sans les contester, peut être considéré comme les ayant acceptées par son comportement ; mais s'il commande avec ses propres conditions, son comportement dit plutôt le contraire. La signature du devis tranche la question.",
    },
  ],
  "attestation-assurance-decennale-devis-b2b": [
    {
      q: "L'attestation d'assurance décennale doit-elle vraiment être jointe au devis ?",
      a: "Oui, pour les constructeurs soumis à l'obligation d'assurance. L'article L. 243-2 du code des assurances prévoit que la justification prend la forme d'attestations jointes aux devis et aux factures des professionnels assurés. Une simple mention sur le devis ne remplace pas l'attestation.",
    },
    {
      q: "Quelles mentions doit comporter l'attestation ?",
      a: "Le modèle de l'arrêté du 5 janvier 2016, repris à l'article A. 243-3, impose notamment la mention « Assurance de responsabilité décennale obligatoire », l'identité et le numéro SIREN de l'assuré, l'assureur, le numéro du contrat, la période de validité, la date d'établissement, les activités couvertes, l'étendue géographique et le plafond de coût de chantier, et le cas échéant le montant de marché. Elle est signée par l'assureur ou son mandataire.",
    },
    {
      q: "Mon attestation expire avant le démarrage du chantier : suis-je couvert ?",
      a: "Ce n'est pas l'attestation jointe au devis qui couvrira le chantier, mais le contrat en vigueur à la date d'ouverture du chantier. Si votre contrat est renouvelé, vous serez couvert ; il faut alors fournir l'attestation de la nouvelle période avant l'ouverture.",
    },
    {
      q: "Qu'est-ce que la date d'ouverture du chantier ?",
      a: "C'est une date unique pour toute l'opération : la déclaration d'ouverture de chantier pour les travaux soumis à permis de construire, sinon le premier ordre de service ou, à défaut, le début effectif des travaux. Une entreprise qui arrive après cette date retient la date à laquelle elle commence effectivement ses prestations.",
    },
    {
      q: "Une partie de mon devis sort de mes activités déclarées : que faire ?",
      a: "Avant l'ouverture du chantier, retirez ces lignes, confiez-les à une entreprise assurée pour cette activité, ou obtenez par écrit une extension de votre assureur. Sinon, ces travaux ne sont pas couverts, et la jurisprudence admet que l'assureur oppose ce refus au client.",
    },
    {
      q: "Le plafond de l'attestation se compare-t-il au montant de mon devis ?",
      a: "Non. Il se compare au coût total de construction de l'opération, tous corps d'état, déclaré par le maître d'ouvrage ; l'attestation précise si les honoraires sont inclus. Demandez ce chiffre au client au moment du chiffrage.",
    },
    {
      q: "Un sous-traitant doit-il fournir une attestation décennale ?",
      a: "Pas au titre de l'obligation légale, puisqu'il n'est pas lié au maître d'ouvrage par un contrat de louage d'ouvrage. Mais le contrat de sous-traitance l'exige très souvent ; c'est alors une obligation contractuelle, et le contrat dit quelle attestation fournir.",
    },
    {
      q: "Quels travaux échappent à l'obligation d'assurance décennale ?",
      a: "Ceux de la liste de l'article L. 243-1-1 : ouvrages maritimes, fluviaux, routiers, ferroviaires, portuaires, aéroportuaires, de traitement des déchets, voiries, réseaux, parkings, ouvrages sportifs non couverts, entre autres, sauf s'ils sont accessoires à un ouvrage soumis. Les existants non incorporés sont aussi exclus.",
    },
    {
      q: "Que risque une entreprise qui travaille sans assurance décennale ?",
      a: "Six mois d'emprisonnement et 75 000 € d'amende, ou l'une des deux peines (article L. 243-3). Le dirigeant peut aussi être condamné personnellement à indemniser le maître d'ouvrage, la Cour de cassation voyant dans ce défaut une faute séparable de ses fonctions.",
    },
    {
      q: "Le client peut-il se retourner contre l'assureur indiqué sur l'attestation ?",
      a: "Oui, c'est l'un des objectifs de l'attestation : si le constructeur fait défaut, le maître d'ouvrage s'adresse à l'assureur désigné. Mais l'attestation n'engage pas l'assureur au-delà du contrat : si l'activité n'était pas déclarée, il peut refuser sa garantie.",
    },
  ],
  "travaux-supplementaires-avenant-devis-b2b": [
    {
      q: "Un e-mail du client suffit-il comme autorisation écrite ?",
      a: "Un e-mail est un écrit. S'il vient de la personne qui peut engager le client, qu'il désigne clairement les travaux et qu'il reprend le prix, il remplit le rôle d'une autorisation écrite avec prix convenu. Un e-mail qui dit seulement « faites-le » sans prix est une autorisation sans prix : insuffisante dans un forfait de construction, au sens de l'article 1793.",
    },
    {
      q: "Le client a vu les travaux se faire et n'a rien dit. Doit-il payer ?",
      a: "Pas forcément. Dans un marché à forfait, le fait que les travaux soient apparents, que le client ait été informé et qu'il n'ait pas protesté ne vaut pas acceptation (Cass. 3e civ., 27 juin 2019, n° 16-25.262). Il faut une acceptation expresse et non équivoque, ou un bouleversement de l'économie du contrat. Hors forfait, il faut prouver la commande.",
    },
    {
      q: "À partir de quel pourcentage le forfait est-il bouleversé ?",
      a: "Aucun texte ne fixe de pourcentage pour les marchés privés. Les juges regardent la nature et l'importance des modifications demandées par le client. Un doublement du volume a pu être retenu (arrêt du 12 mars 1997), mais un écart chiffré ne suffit jamais à lui seul à garantir le résultat.",
    },
    {
      q: "Mon devis n'est pas un forfait, il est à prix unitaires. Qu'est-ce qui change ?",
      a: "Les quantités réellement exécutées se paient aux prix unitaires du bordereau, sans avenant, si le contrat le prévoit. En revanche, un ouvrage nouveau, sans prix au bordereau, reste un supplément : il faut une commande et un prix accepté. Notre calculateur traite ce cas avec l'option « prix unitaires, métré ou régie ».",
    },
    {
      q: "Je fais de la rénovation, pas de la construction. L'article 1793 s'applique-t-il ?",
      a: "Pas automatiquement. Pour une rénovation ponctuelle sans intervention sur la structure, la Cour de cassation a admis que l'article 1793 soit écarté (23 juin 1999, n° 98-10.276). Mais le contrat peut prévoir une règle aussi stricte, et il faudra de toute façon prouver la commande. Écrire reste la seule solution sûre.",
    },
    {
      q: "La norme NF P 03-001 prévoit une acceptation tacite du décompte. Les suppléments passent-ils ?",
      a: "Pas dans un marché à forfait. La Cour de cassation a jugé le 8 juin 2023 (n° 22-10.393) que la procédure contractuelle de clôture des comptes ne peut pas prévaloir sur la qualification de forfait et que le silence du maître de l'ouvrage au mémoire définitif ne vaut pas acceptation expresse et non équivoque des travaux supplémentaires.",
    },
    {
      q: "Le chef de chantier du client a signé le bon d'intervention. Est-ce suffisant ?",
      a: "C'est une preuve utile que les travaux ont été demandés et faits. Si le bon mentionne le prix, c'est mieux. Mais si cette personne n'a pas le pouvoir d'engager une dépense, le client pourra contester la facture. Faites valider les suppléments par la personne désignée au début du chantier.",
    },
    {
      q: "J'ai découvert un problème caché en cours de travaux. Puis-je le traiter et le facturer ?",
      a: "Signalez-le d'abord par écrit, avec photos et chiffrage, et attendez l'accord, sauf urgence de sécurité. Dans un forfait, le risque d'un support mal évalué pèse souvent sur l'entreprise. Une réserve écrite dans le devis initial sur l'état des supports, avec la règle de chiffrage en cas de découverte, est la meilleure protection.",
    },
    {
      q: "Mon client est une collectivité. Puis-je faire des travaux supplémentaires sur simple demande ?",
      a: "Non. Avec un acheteur public, une modification du marché suit le Code de la commande publique et l'exécution passe par des ordres de service. Une modification de faible montant est possible sous les seuils européens et sous 15 % du marché initial pour des travaux (R2194-8), en cumulant les modifications successives (R2194-9). Attendez l'ordre de service ou l'avenant.",
    },
    {
      q: "QuoteBuilder peut-il générer et faire signer l'avenant ?",
      a: "Non. QuoteBuilder n'a pas de signature électronique ni de gestion d'avenants, et son PDF est un document indicatif. Il peut recevoir la demande de supplément comme une nouvelle demande, garder les fichiers et les notes internes du dossier. L'avenant se rédige et se signe dans vos outils habituels. Le calculateur d'avenant prépare un texte à reprendre.",
    },
  ],
  "autoliquidation-tva-sous-traitance-btp-devis-b2b": [
    {
      q: "Quand un sous-traitant du bâtiment doit-il facturer sans TVA ?",
      a: "Quand trois conditions sont réunies : il réalise des travaux de construction en relation avec un bien immobilier (réparation, nettoyage, entretien, transformation et démolition compris), il intervient comme sous-traitant au sens de la loi du 31 décembre 1975, et son client est assujetti à la TVA. Il facture alors hors taxes, avec la mention « Autoliquidation ».",
    },
    {
      q: "Quelle mention porter sur la facture ?",
      a: "La mention « Autoliquidation », exigée par le 13° du I de l'article 242 nonies A de l'annexe II au CGI, et l'indication que la TVA est due par le preneur assujetti. La référence à l'article du CGI n'est pas obligatoire. Le numéro de TVA du preneur n'est pas obligatoire non plus pour ce cas d'autoliquidation.",
    },
    {
      q: "Un devis accepté suffit-il, sans contrat de sous-traitance ?",
      a: "Oui. Le BOFiP admet qu'à défaut de contrat formel, un devis, un bon de commande signé ou tout document établissant l'accord sur les travaux et leur prix en tienne lieu. C'est pourquoi le devis doit décrire clairement les travaux et le chantier.",
    },
    {
      q: "La location d'un engin avec chauffeur est-elle autoliquidée ?",
      a: "Non, si elle fait l'objet d'un contrat à part. Le BOFiP exclut la location d'engins et de matériels de chantier, même avec montage et démontage, et le rescrit de 2026 précise que la location avec chauffeur n'est pas concernée. Si la location fait partie d'un contrat unique qui comprend des travaux immobiliers, l'ensemble est autoliquidé.",
    },
    {
      q: "Et la fourniture de matériaux sans pose ?",
      a: "C'est une livraison de biens, hors du dispositif. La fabrication de pièces sur mesure aussi, tout comme les travaux réalisés en atelier sur des biens meubles. La fourniture avec pose, en revanche, relève des travaux immobiliers quand la pose incorpore les éléments au bâti.",
    },
    {
      q: "Le nettoyage de fin de chantier est-il concerné ?",
      a: "Oui quand il est compris dans le contrat de travaux du sous-traitant sur le même chantier, parce qu'il prolonge les travaux. Non quand il est confié par un contrat distinct, indépendamment des travaux.",
    },
    {
      q: "Mon sous-traitant est micro-entrepreneur, dois-je autoliquider ?",
      a: "Pas s'il est en franchise en base de TVA et n'a pas opté pour un régime réel. Il facture sans TVA avec la mention « TVA non applicable, article 293 B du CGI », et vous n'avez rien à autoliquider.",
    },
    {
      q: "Quand l'entreprise principale doit-elle déclarer la TVA autoliquidée ?",
      a: "Sur la déclaration de la période au cours de laquelle elle paie son sous-traitant, puisque la TVA sur les travaux est exigible à l'encaissement. Elle porte le montant hors taxes en « autres opérations imposables » et déduit la TVA dans les conditions de droit commun.",
    },
    {
      q: "Que risque l'entreprise principale qui oublie ?",
      a: "Une amende égale à 5 % de la taxe qu'elle aurait pu déduire, prévue au 4 de l'article 1788 A du CGI. Le commentaire officiel de la décision du Conseil constitutionnel du 22 septembre 2022 cite une tolérance pour celui qui régularise spontanément avant toute action de l'administration. Pour un cas réel, voyez votre expert-comptable.",
    },
    {
      q: "Le passage au CIBS en 2027 change-t-il quelque chose ?",
      a: "Les références changent, pas la doctrine. Le transfert des dispositions législatives de la TVA dans le code des impositions sur les biens et services est reporté au 1er janvier 2027, les anciennes références au CGI restent utilisables jusqu'au 30 juin 2028, et l'administration indique que sa doctrine opposable est inchangée. La mention « Autoliquidation » reste la même.",
    },
  ],
  "contrat-cadre-bordereau-prix-unitaires-devis-b2b": [
    {
      q: "Quelle différence entre un devis et un contrat-cadre ?",
      a: "Un devis accepté porte sur une commande précise. Un contrat-cadre fixe les règles générales d'une relation suivie, et des contrats d'application, souvent des bons de commande, en précisent l'exécution (article 1111 du Code civil). Le contrat-cadre évite de renégocier chaque commande.",
    },
    {
      q: "Un contrat-cadre oblige-t-il le client à commander ?",
      a: "Pas forcément. Tout dépend de ce qui est écrit. Un volume prévisionnel n'oblige pas. Un volume minimal ou ferme oblige, et le contrat doit dire ce qui se passe s'il n'est pas atteint.",
    },
    {
      q: "Le prix peut-il être fixé plus tard, par le fournisseur ?",
      a: "Oui, si le contrat-cadre le prévoit. L'article 1164 du Code civil permet de convenir que le prix sera fixé unilatéralement par une partie. Celle-ci doit motiver son prix en cas de contestation, et l'abus peut donner lieu à des dommages et intérêts, voire à la résolution du contrat.",
    },
    {
      q: "Qu'est-ce qu'un bordereau de prix unitaires ?",
      a: "C'est la liste des prix par unité : par pièce, par heure, par mètre, par tonne. Le montant d'une commande est le prix unitaire multiplié par la quantité commandée. Le bordereau doit préciser l'unité et ce qui est compris dans le prix.",
    },
    {
      q: "Remise par tranche ou remise globale : laquelle choisir ?",
      a: "La remise globale applique le palier atteint à tout le volume : elle pousse le client à franchir les seuils, mais crée un effet de seuil. La remise par tranche donne à chaque tranche son taux : elle est plus lisible et sans effet de seuil, mais moins incitative. L'important est d'écrire laquelle s'applique.",
    },
    {
      q: "Que faire si le client n'atteint pas le palier de la remise appliquée ?",
      a: "Si le contrat prévoit une clause de rappel, vous facturez la différence entre le prix du palier réellement atteint et le prix facturé. Sans clause, récupérer cette différence est difficile. Le [calculateur de remise sur volume](https://www.quotebuilder.co/outils/calculateur-remise-volume-contrat-cadre) donne le montant du rappel.",
    },
    {
      q: "Comment verser une ristourne de fin d'année ?",
      a: "Par un avoir, une fois le volume de la période connu. La ristourne réduit la base de la TVA, conformément à l'article 267 du Code général des impôts. Le contrat doit fixer la date du bilan et le délai d'émission de l'avoir.",
    },
    {
      q: "Peut-on prévoir une pénalité si le client commande moins que prévu ?",
      a: "Oui, mais c'est une clause pénale. L'article 1231-5 du Code civil permet au juge de la réduire si elle est manifestement excessive, et en proportion de l'exécution partielle. Perdre le palier de remise suffit souvent.",
    },
    {
      q: "Un accord-cadre public fonctionne-t-il de la même façon ?",
      a: "Il s'en rapproche, mais il suit le Code de la commande publique : un maximum en valeur ou en quantité est obligatoire depuis le 1er janvier 2022, la durée est en principe limitée à quatre ans pour les pouvoirs adjudicateurs, et l'exécution se fait par bons de commande.",
    },
    {
      q: "QuoteBuilder gère-t-il les contrats-cadres et les remises sur volume ?",
      a: "Non. QuoteBuilder reçoit et suit les demandes de devis. Son catalogue calcule chaque ligne au prix unitaire multiplié par la quantité, sans palier de remise. Il ne gère ni contrat-cadre, ni bons de commande, ni facturation, ni avoirs.",
    },
  ],
  "garantie-paiement-1799-1-devis-travaux-b2b": [
    {
      q: "À partir de quel montant la garantie de paiement est-elle obligatoire ?",
      a: "Quand les sommes dues dépassent 12 000 € HT. Elles se calculent sur le prix convenu au marché, déduction faite des arrhes et acomptes versés à la signature (article 1er du décret n° 99-658 du 30 juillet 1999). Les paiements faits ensuite ne se déduisent pas pour apprécier le seuil.",
    },
    {
      q: "Quelles formes peut prendre la garantie ?",
      a: "Le versement direct par la banque d'un crédit dédié aux travaux, sur ordre écrit du client. Sans crédit dédié, ou pour la part qu'il ne couvre pas, un cautionnement solidaire d'un établissement de crédit, d'une société de financement, d'une entreprise d'assurance ou d'un organisme de garantie collective, sauf autre garantie stipulée au contrat, comme une hypothèque ou une consignation.",
    },
    {
      q: "Un particulier doit-il fournir la garantie ?",
      a: "Il n'a pas à fournir de caution quand il fait faire des travaux pour ses besoins personnels (alinéa 4 de l'article 1799-1). En revanche, s'il finance les travaux par un crédit dédié, la banque ne peut verser les fonds qu'à l'entreprise, tant qu'elle n'est pas intégralement payée.",
    },
    {
      q: "Peut-on renoncer à la garantie dans le devis ?",
      a: "Non. L'obligation est d'ordre public : une clause de renonciation est sans effet, et l'entreprise peut demander la garantie à tout moment malgré la clause.",
    },
    {
      q: "Peut-on demander la garantie en cours de chantier ou après la réception ?",
      a: "Oui. La Cour de cassation admet la demande à tout moment, en cours d'exécution (9 novembre 2005, n° 04-20.047), après la réalisation des travaux (15 septembre 2016, n° 15-19.648) et même après la résiliation du marché (18 mai 2017, n° 16-16.795), tant que le prix n'est pas intégralement payé.",
    },
    {
      q: "Les travaux supplémentaires sont-ils couverts ?",
      a: "Ceux qui ont été acceptés, oui : la garantie porte sur le prix initial ou sur le nouveau montant convenu entre les parties (Cass. 3e civ., 4 janvier 2006, n° 04-17.226). Les travaux faits sans accord écrit ne sont pas couverts tant que le client ne les a pas acceptés.",
    },
    {
      q: "Quand peut-on suspendre le chantier ?",
      a: "Quand trois conditions sont réunies : une mise en demeure en recommandé de fournir la garantie, un délai de quinze jours écoulé sans réponse, et des travaux exécutés restés impayés. Par prudence, comptez le délai à partir de la réception de la lettre et suspendez à partir du seizième jour. Prévenez le client par écrit.",
    },
    {
      q: "Que faire si le client refuse malgré la mise en demeure ?",
      a: "Saisir le juge des référés. L'obligation n'étant pas sérieusement contestable, il peut ordonner la fourniture de la garantie, au besoin sous astreinte (articles 835 et 873 du Code de procédure civile). Des reproches sur la qualité des travaux ne suffisent pas à l'écarter.",
    },
    {
      q: "Comment est protégé un sous-traitant ?",
      a: "Par l'article 14 de la loi du 31 décembre 1975 : l'entreprise principale doit lui fournir une caution personnelle et solidaire, sauf délégation de paiement du maître de l'ouvrage, à peine de nullité du sous-traité. S'il est accepté et ses conditions de paiement agréées, il dispose aussi d'une action directe contre le maître de l'ouvrage un mois après une mise en demeure restée sans effet.",
    },
    {
      q: "QuoteBuilder gère-t-il la garantie de paiement ?",
      a: "Non. QuoteBuilder reçoit les demandes de devis et garde, pour chaque dossier, les réponses du prospect, ses fichiers et les notes internes de l'équipe. Il ne fait ni signature, ni facture, ni suivi de paiement, et ne calcule pas de garantie. Vous pouvez ajouter au funnel des questions sur le type de client et le financement des travaux ; le calcul se fait avec le calculateur, à part.",
    },
  ],
  "facturation-electronique-2026-devis-b2b-tpe-pme": [
    {
      q: "Une TPE doit-elle déjà faire quelque chose en 2026 ?",
      a: "Oui : depuis le 1er septembre 2026, toute entreprise assujettie à la TVA doit pouvoir recevoir des factures électroniques, donc avoir choisi une plateforme agréée. L'émission, elle, n'est obligatoire qu'au 1er septembre 2027 pour les PME et les micro-entreprises.",
    },
    {
      q: "Un auto-entrepreneur en franchise en base est-il concerné ?",
      a: "Oui. La franchise en base dispense de facturer la TVA, pas de la réforme. L'auto-entrepreneur reçoit depuis 2026 et émettra en 2027 ses factures à des clients professionnels par une plateforme agréée.",
    },
    {
      q: "Mon devis doit-il passer par une plateforme agréée ?",
      a: "Non. La réforme porte sur les factures. Le devis reste un document commercial libre dans sa forme, avec ses propres mentions. La facture d'acompte, en revanche, est une facture.",
    },
    {
      q: "Une facture PDF envoyée par e-mail est-elle une facture électronique ?",
      a: "Non. Au sens de la réforme, une facture électronique est émise, transmise et reçue sous forme de données structurées, par une plateforme agréée. Un PDF seul reste une facture papier dématérialisée.",
    },
    {
      q: "Comment savoir si je suis PME ou micro-entreprise ?",
      a: "Regardez l'effectif, le chiffre d'affaires et le bilan du dernier exercice clos avant le 1er janvier 2025. Moins de 10 personnes et un chiffre d'affaires ou un bilan inférieur ou égal à 2 M€ : micro-entreprise. Pour la réforme, les deux catégories ont de toute façon la même date d'émission.",
    },
    {
      q: "Un client grand compte peut-il m'imposer la facture électronique avant 2027 ?",
      a: "Pas au titre de la réforme. Le guide de démarrage de la DGFiP indique qu'un client ne peut pas imposer l'émission électronique à une entreprise dont l'échéance est en 2027, ni refuser de payer une facture au seul motif qu'elle n'est pas électronique. Un accord commercial peut prévoir autre chose.",
    },
    {
      q: "Quelles sont les nouvelles mentions sur la facture ?",
      a: "Le SIREN du client, l'adresse de livraison si elle diffère de l'adresse de facturation, la catégorie de l'opération (biens, services ou les deux) et, le cas échéant, l'option pour le paiement de la TVA d'après les débits. Pour une PME, à partir du 1er septembre 2027.",
    },
    {
      q: "Que risque une PME qui continue d'envoyer des PDF après le 1er septembre 2027 ?",
      a: "50 € par facture, dans la limite de 15 000 € par an (article 1737 du CGI). La première infraction n'est pas sanctionnée si elle est réparée spontanément ou dans les trente jours d'une demande de l'administration.",
    },
    {
      q: "Je fais des prestations de services : quel est ce e-reporting des paiements ?",
      a: "Si vous payez la TVA à l'encaissement, ce qui est le régime par défaut des services, vous transmettez via votre plateforme les données des paiements reçus, à partir de votre date d'émission. Ce n'est pas le cas si vous avez opté pour les débits ou si l'opération est autoliquidée.",
    },
    {
      q: "QuoteBuilder peut-il émettre mes factures électroniques ?",
      a: "Non. QuoteBuilder gère la demande de devis et son suivi. Il n'émet pas de facture et n'est pas une plateforme agréée. Il peut en revanche collecter en amont des informations utiles à la facture, comme le SIREN du client, en ajoutant une question au funnel.",
    },
  ],
  "prescription-facture-impayee-devis-b2b": [
    {
      q: "Quel est le délai de prescription d'une facture impayée entre professionnels ?",
      a: "Cinq ans en principe. L'article L110-4 du Code de commerce s'applique entre commerçants ou entre un commerçant et un non-commerçant ; entre deux professionnels non commerçants, l'article 2224 du Code civil donne aussi cinq ans. Certains contrats ont un délai spécial plus court, comme le transport (un an), et un contrat entre professionnels peut fixer une durée entre un et dix ans.",
    },
    {
      q: "Quel est le délai contre un particulier ?",
      a: "Deux ans. L'article L218-2 du Code de la consommation prévoit que l'action des professionnels, pour les biens ou les services qu'ils fournissent aux consommateurs, se prescrit par deux ans. Ce délai ne peut pas être modifié par contrat (article L218-1).",
    },
    {
      q: "À partir de quand court le délai : la date de la facture, l'échéance ou la fin des travaux ?",
      a: "En principe à partir de l'exigibilité, souvent l'échéance écrite sur la facture (Cass. com., 5 décembre 2018, n° 17-16.282 ; 14 juin 2023, n° 21-14.841). Mais une facture émise tardivement ne repousse pas le délai : la Cour de cassation retient alors la date d'achèvement des prestations (Cass. com., 26 février 2020, n° 18-25.036). Par prudence, calculez les deux et retenez la plus proche.",
    },
    {
      q: "Une mise en demeure en recommandé interrompt-elle la prescription ?",
      a: "Non. La chambre commerciale de la Cour de cassation l'a rappelé le 18 mai 2022 (n° 20-23.204) : les causes d'interruption sont la reconnaissance du débiteur, la demande en justice et les mesures conservatoires ou actes d'exécution forcée. Une lettre recommandée, même avec accusé de réception, n'en fait pas partie.",
    },
    {
      q: "Un paiement partiel fait-il repartir le délai ?",
      a: "Oui, s'il vaut reconnaissance de la dette par le client, ce qui est le cas d'un acompte clairement rattaché à la facture. L'article 2240 du Code civil fait de la reconnaissance une cause d'interruption, et l'article 2231 fait alors courir un nouveau délai de même durée. Gardez le relevé qui rattache le virement à la facture.",
    },
    {
      q: "Comment compter le dernier jour ?",
      a: "Le délai se compte en jours (article 2228) et il est acquis quand le dernier jour du terme est accompli (article 2229). Pour une échéance au 14 janvier 2022, le délai de cinq ans finit le 14 janvier 2027 à minuit. Il n'y a pas de report au jour ouvrable suivant : les règles des délais de procédure ne s'appliquent pas (Cass. 1re civ., 12 décembre 2018, n° 17-25.697).",
    },
    {
      q: "Une médiation suspend-elle la prescription ?",
      a: "Oui, si les parties conviennent de recourir à une médiation ou à une conciliation après la naissance du litige, ou à défaut d'accord écrit, à partir de la première réunion (article 2238). Le délai repart à la fin déclarée de la médiation, pour au moins six mois. De simples négociations commerciales ne suspendent pas le délai.",
    },
    {
      q: "Que se passe-t-il si la facture est prescrite ?",
      a: "La dette existe toujours, mais vous ne pouvez plus en obtenir le paiement forcé si le client oppose la prescription. Le juge ne la soulève pas de lui-même (article 2247), et un client qui paie une dette prescrite ne peut pas se faire rembourser pour ce motif (article 2249). Une reconnaissance après coup ne fait pas repartir un délai expiré, sauf si elle vaut renonciation à la prescription, ce qui s'apprécie strictement.",
    },
    {
      q: "Quelle procédure choisir pour recouvrer une facture B2B ?",
      a: "Pour une facture non contestée, l'injonction de payer reste la voie courante, quel que soit le montant. La procédure des petites créances, jusqu'à 5 000 €, ne vise pas les créances commerciales facturées entre commerçants. La nouvelle procédure de recouvrement des créances commerciales incontestées, créée par la loi du 23 avril 2026, doit entrer en vigueur au plus tard le 31 décembre 2026. Si le client conteste, il faut une assignation.",
    },
    {
      q: "QuoteBuilder suit-il les factures et les délais de prescription ?",
      a: "Non. QuoteBuilder ne fait ni facture, ni encaissement, ni suivi d'échéance, et ne calcule pas de prescription. Il reçoit les demandes de devis et garde, pour chaque dossier, les réponses du prospect, ses fichiers et les notes internes de l'équipe. Le devis accepté et la facture restent dans vos outils habituels. Le calcul de prescription se fait avec le calculateur, à part.",
    },
  ],
  "retractation-hors-etablissement-tpe-devis-b2b": [
    {
      q: "Un professionnel peut-il se rétracter d'un contrat signé avec un autre professionnel ?",
      a: "Oui, dans un cas précis : le contrat est conclu hors établissement, son objet n'entre pas dans le champ de l'activité principale du client, et le client emploie cinq salariés au plus (article L221-3 du Code de la consommation). Les trois conditions sont cumulatives.",
    },
    {
      q: "Le texte s'applique-t-il si le client a lui-même demandé le rendez-vous ?",
      a: "Oui. La définition du contrat hors établissement (article L221-1) vise le contrat conclu hors des locaux du vendeur, en présence des deux parties, « y compris à la suite d'une sollicitation ou d'une offre faite par le consommateur ».",
    },
    {
      q: "Et si le devis est signé par e-mail après une visite ?",
      a: "Le texte ne tranche pas ce cas au jour près. Le contrat conclu à distance « immédiatement après » une sollicitation personnelle dans un autre lieu est visé. Plus la signature est éloignée de la visite, et faite par le client seul, plus on s'en éloigne. Dans le doute, appliquez la règle.",
    },
    {
      q: "Comment savoir si l'objet du contrat entre dans l'activité principale du client ?",
      a: "Comparez l'objet du contrat au métier du client, pas à son utilité pour l'entreprise. La Cour de cassation a laissé aux juges du fond l'appréciation de ce point (1re civ., 27 novembre 2019, n° 18-22.525) et a admis la protection pour un site internet vendu à un architecte (1re civ., 12 septembre 2018, n° 17-17.319).",
    },
    {
      q: "Comment se compte le délai de quatorze jours ?",
      a: "Le jour de la signature (ou de la réception) n'est pas compté. Le délai se termine à la fin du 14e jour. S'il tombe un samedi, un dimanche ou un jour férié ou chômé, il est reporté au premier jour ouvrable suivant (article L221-19).",
    },
    {
      q: "Quand le délai part-il de la livraison ?",
      a: "Pour une vente de biens et pour un contrat de service qui inclut la livraison de biens. Un contrat mixte, fourniture et pose, est assimilé à une vente (article L221-1 II). Pour un service seul, le délai part de la signature.",
    },
    {
      q: "Peut-on encaisser un acompte à la signature ?",
      a: "Non pour un contrat hors établissement dans le champ du texte : aucun paiement ni contrepartie ne peut être reçu avant l'expiration d'un délai de sept jours à compter de la conclusion (article L221-10), sauf exceptions limitées prévues par le texte.",
    },
    {
      q: "Que se passe-t-il si le devis ne mentionne pas le droit de rétractation ?",
      a: "Le délai est prolongé de douze mois à compter de la fin du délai initial (article L221-20). Si l'information est fournie pendant cette prolongation, un délai de quatorze jours court à partir de sa réception. Le contrat peut aussi être annulé si l'article L221-9 n'est pas respecté (article L242-1).",
    },
    {
      q: "Le client doit-il payer la prestation commencée s'il se rétracte ?",
      a: "Seulement s'il a fait une demande expresse de démarrage sur papier ou support durable et qu'il a reçu l'information prévue. Il paie alors un montant proportionné à ce qui a été fourni (article L221-25). Sans cette demande, il ne doit rien pour la période d'exécution pendant le délai.",
    },
    {
      q: "QuoteBuilder ajoute-t-il le formulaire de rétractation au devis ?",
      a: "Non. QuoteBuilder n'a pas de champ de mentions légales ni de formulaire de rétractation, et sa PDF est un récapitulatif indiqué « Document indicatif, non contractuel. ». Le contrat et le formulaire se gèrent avec vos propres documents.",
    },
  ],
  "prix-vente-coefficient-debourse-sec-devis-b2b": [
    {
      q: "Qu'est-ce que le déboursé sec ?",
      a: "C'est l'ensemble des coûts directement liés à un devis : achats de matériaux et fournitures, heures de main-d'œuvre valorisées à leur coût chargé, sous-traitance, location, déplacements. Il exclut les frais généraux et le bénéfice.",
    },
    {
      q: "Comment calculer un coefficient de vente ?",
      a: "Quand frais généraux et bénéfice sont exprimés en pourcentage du prix de vente HT, le coefficient vaut 1 / (1 − frais généraux − bénéfice). Avec 18 % et 7 %, hypothèses d'exemple, il vaut 1 / 0,75, soit 1,333. Le prix de vente HT est le déboursé sec multiplié par ce coefficient.",
    },
    {
      q: "Quelle différence entre taux de marge et taux de marque ?",
      a: "Les deux mesurent la même somme, le prix de vente moins le coût. Le taux de marque la rapporte au prix de vente, le taux de marge au coût. Pour un article acheté 75 € et vendu 100 €, le taux de marque est de 25 % et le taux de marge de 33,33 %.",
    },
    {
      q: "Comment passer d'un taux de marque à un taux de marge ?",
      a: "Taux de marge = taux de marque / (1 − taux de marque). Un taux de marque de 20 % correspond à un taux de marge de 25 %, un taux de marque de 50 % à un taux de marge de 100 %. Dans l'autre sens, taux de marque = taux de marge / (1 + taux de marge).",
    },
    {
      q: "Comment calculer son taux de frais généraux ?",
      a: "Divisez le total annuel des frais généraux par le chiffre d'affaires annuel HT, sur le dernier exercice et en tenant compte de l'activité prévue. Le résultat est un pourcentage du prix de vente. Recalculez-le chaque année.",
    },
    {
      q: "Comment calculer un coût horaire chargé ?",
      a: "Divisez le coût annuel du salarié pour l'entreprise (salaire brut et charges patronales) par le nombre d'heures réellement productives dans l'année, après déduction des congés, absences, trajets non facturés et temps non affectables. Diviser par les heures payées sous-estime le coût.",
    },
    {
      q: "Peut-on vendre sous son prix de revient ?",
      a: "Oui, en principe, entre professionnels : les prix sont libres (article L410-2 du Code de commerce). La limite est la revente en l'état sous le prix d'achat effectif, interdite par l'article L442-5 sauf exceptions, avec une amende pouvant atteindre 0,4 % du chiffre d'affaires réalisé en France depuis la loi du 14 avril 2025. Économiquement, un devis sous le prix plancher fait perdre de l'argent.",
    },
    {
      q: "Que se passe-t-il si un travail commence sans prix convenu ?",
      a: "Pour une prestation de service, l'article 1165 du Code civil permet au prestataire de fixer le prix, à charge pour lui de le motiver en cas de contestation, et le client peut agir en cas d'abus. Mieux vaut un devis accepté avant de commencer.",
    },
    {
      q: "Peut-on augmenter un prix forfaitaire en cours de chantier ?",
      a: "Pour la construction d'un bâtiment à forfait, l'article 1793 du Code civil l'exclut, sauf changements autorisés par écrit avec un prix convenu. La Cour de cassation admet aussi le supplément en cas de bouleversement de l'économie du contrat ou d'acceptation expresse et non équivoque après exécution.",
    },
    {
      q: "QuoteBuilder calcule-t-il le prix de vente ou la marge ?",
      a: "Non. Le catalogue reçoit un prix fixe, une fourchette ou « Sur devis », sans champ de coût, de marge ni de coefficient. Le calcul se fait avant, puis le prix obtenu est saisi sur la fiche ou importé en CSV. Le PDF affiche une fourchette indicative et précise qu'il s'agit d'un document indicatif, non contractuel.",
    },
  ],
  "reconduction-tacite-preavis-resiliation-devis-b2b": [
    {
      q: "Un contrat reconduit tacitement repart-il pour la même durée ?",
      a: "Pas automatiquement. Selon les articles 1214 et 1215 du Code civil, la reconduction tacite crée un nouveau contrat au même contenu, mais à durée indéterminée. Pour qu'il reparte pour douze mois, le contrat doit prévoir une reconduction par périodes de douze mois.",
    },
    {
      q: "Peut-on résilier un contrat à durée indéterminée à tout moment ?",
      a: "Oui, chaque partie peut y mettre fin à tout moment, à condition de respecter le préavis prévu au contrat ou, à défaut, un délai raisonnable (article 1211 du Code civil). Entre professionnels, il faut aussi tenir compte de la durée de la relation (article L442-1 II du Code de commerce).",
    },
    {
      q: "Que se passe-t-il si le client envoie sa résiliation après la date limite ?",
      a: "Si le contrat prévoit une reconduction par périodes, il repart pour une période entière et le client reste engagé jusqu'à la fin de cette nouvelle période. Le prestataire peut accepter une sortie anticipée, mais il n'y est pas obligé.",
    },
    {
      q: "Le préavis compte-t-il à partir de l'envoi ou de la réception du courrier ?",
      a: "C'est la clause qui le dit. Si elle parle d'un courrier « reçu » trois mois avant l'échéance, c'est la date de réception qui compte. Écrivez-le dans le devis pour éviter toute discussion, et gardez la preuve de la date.",
    },
    {
      q: "La loi Chatel s'applique-t-elle entre entreprises ?",
      a: "Non. L'obligation d'informer le client de l'échéance (article L215-1 du Code de la consommation) vise les consommateurs, et l'article L215-3 l'étend aux non-professionnels. Une entreprise qui achète pour son activité n'est ni l'un ni l'autre.",
    },
    {
      q: "Respecter le préavis du contrat suffit-il pour arrêter une relation ancienne ?",
      a: "Pas toujours. L'article L442-1 II du Code de commerce exige un préavis écrit qui tient compte de la durée de la relation commerciale. Un préavis contractuel de trois mois peut être jugé trop court pour une relation de plusieurs années. Un préavis de dix-huit mois met à l'abri d'une condamnation pour préavis insuffisant.",
    },
    {
      q: "Des contrats d'un an successifs forment-ils une relation commerciale établie ?",
      a: "Ils peuvent. La Cour de cassation l'a admis le 5 avril 2018 (chambre commerciale, n° 16-26.568). Ce qui compte est la stabilité de la relation, pas la forme des contrats.",
    },
    {
      q: "Le prix reste-t-il le même après la reconduction ?",
      a: "Oui, sauf clause contraire, puisque le contrat reconduit reprend le même contenu. Pour faire évoluer le prix, prévoyez une clause d'indexation ou une révision proposée avant chaque date limite de dénonciation.",
    },
    {
      q: "Peut-on prévoir une indemnité si le client part avant le terme ?",
      a: "Oui. Mais si elle sanctionne l'inexécution, c'est une clause pénale, que le juge peut réduire si elle est manifestement excessive (article 1231-5 du Code civil). Une indemnité proportionnée au préjudice réel tient mieux.",
    },
    {
      q: "QuoteBuilder gère-t-il la durée et la reconduction des contrats ?",
      a: "Non. Il n'y a ni champ durée, ni reconduction, ni préavis, ni prix mensuel. Vous pouvez demander la durée souhaitée dans le funnel avec une question de type Liste et noter les conditions dans une note interne du dossier. La clause de durée s'écrit dans votre devis final.",
    },
  ],
  "frais-port-franco-incoterms-devis-b2b": [
    {
      q: "Que veut dire « franco de port » sur un devis ?",
      a: "Le transport est compris dans le prix : le client ne paie pas de frais de livraison en plus. Le terme ne dit pas, à lui seul, où la marchandise est livrée ni qui supporte les risques pendant le trajet. Précisez le lieu ou la zone, et le moment où les risques passent au client.",
    },
    {
      q: "Si mon devis ne dit rien sur le transport, qui paie ?",
      a: "Selon l'article 1608 du Code civil, les frais de délivrance sont à la charge du vendeur et ceux de l'enlèvement à la charge de l'acheteur, sauf stipulation contraire. La délivrance se fait par défaut là où se trouvait la chose au moment de la vente (article 1609). Sans clause, la livraison chez le client n'est donc pas due.",
    },
    {
      q: "Comment calculer un seuil franco de port ?",
      a: "Divisez le coût moyen d'une livraison par le produit de votre taux de marge brute et de la part de marge que vous acceptez de consacrer au transport. Avec 45 € de transport, 35 % de marge et 25 % de part acceptée (hypothèses d'exemple), le seuil est de 514,29 € HT, arrondi à 520 €.",
    },
    {
      q: "Faut-il utiliser les Incoterms pour une vente en France ?",
      a: "Ce n'est pas obligatoire, mais c'est possible et souvent utile. Un Incoterm a un sens précis, connu des deux parties. Il faut citer la règle, le lieu précis et l'édition, par exemple « DAP, entrepôt du client à Lyon, Incoterms® 2020 ».",
    },
    {
      q: "Avec CPT, qui supporte les risques pendant le transport ?",
      a: "Le client. Avec CPT, le vendeur paie le transport jusqu'à destination, mais les risques passent à l'acheteur dès la remise au premier transporteur. Si votre client attend une livraison en bon état chez lui à vos risques, DAP ou DPU correspondent mieux.",
    },
    {
      q: "Les réserves sur le bon de livraison suffisent-elles ?",
      a: "Non. L'article L133-3 du Code de commerce demande une protestation motivée notifiée au transporteur dans les trois jours qui suivent la réception, jours fériés non compris, par lettre recommandée ou acte extrajudiciaire. Sans elle, l'action pour avarie ou perte partielle s'éteint.",
    },
    {
      q: "Combien le transporteur rembourse-t-il en cas de perte ?",
      a: "À défaut de convention écrite, le contrat type général plafonne l'indemnité, hors dol ou faute inexcusable : pour les envois de moins de trois tonnes, 33 € par kilogramme sans dépasser 1 000 € par colis ; pour les envois de trois tonnes et plus, 20 € par kilogramme dans la limite du poids de l'envoi en tonnes multiplié par 3 200 €. Une déclaration de valeur faite à la commande du transport remplace ce plafond.",
    },
    {
      q: "Mon client peut-il recevoir une facture du transporteur alors que j'ai vendu franco ?",
      a: "Oui, si vous ne payez pas le transporteur. L'article L132-8 du Code de commerce donne au transporteur qui a exécuté le transport une action directe en paiement contre l'expéditeur et le destinataire. Une clause contraire est réputée non écrite.",
    },
    {
      q: "Frais de port et frais de déplacement, c'est la même chose ?",
      a: "Non. Les frais de port couvrent l'acheminement d'une marchandise par un transporteur. Les frais de déplacement couvrent le trajet de vos équipes pour une intervention. Ce sont deux lignes distinctes dans un devis, avec des modes de calcul différents.",
    },
    {
      q: "QuoteBuilder calcule-t-il les frais de port ou le franco ?",
      a: "Non. Il n'y a pas de champ frais de port, franco ou Incoterm. Vous pouvez créer une ligne « Livraison » au catalogue et la faire proposer par une règle selon les réponses du prospect, mais une règle ne lit pas le montant de la fourchette. Le seuil franco et vos conditions de transport s'écrivent dans votre devis final.",
    },
  ],
  "garantie-vices-caches-sav-devis-b2b": [
    {
      q: "La garantie des vices cachés s'applique-t-elle entre professionnels ?",
      a: "Oui. Les articles 1641 à 1649 du Code civil s'appliquent à toute vente, y compris entre entreprises. Seule la garantie légale de conformité du Code de la consommation est réservée aux ventes à des consommateurs.",
    },
    {
      q: "Combien de temps un client professionnel a-t-il pour agir ?",
      a: "Deux ans à compter de la découverte du vice (article 1648), sans dépasser vingt ans à compter de la vente (article 2232, chambre mixte du 21 juillet 2023). Le délai de deux ans peut être suspendu pendant une expertise judiciaire.",
    },
    {
      q: "Une garantie contractuelle d'un an limite-t-elle ma responsabilité à un an ?",
      a: "Non. Elle définit ce que vous offrez en plus. La garantie des vices cachés continue de jouer selon ses propres règles.",
    },
    {
      q: "Puis-je exclure la garantie des vices cachés dans mes conditions de vente ?",
      a: "L'article 1643 le permet pour un vendeur qui ignorait le vice. Un vendeur professionnel étant présumé connaître les vices, la clause est en principe inefficace face à un acheteur d'une autre spécialité. Elle peut jouer entre professionnels de la même spécialité, pour un vice décelable. Faites relire la clause.",
    },
    {
      q: "Que doit préciser une garantie contractuelle ?",
      a: "La durée et son point de départ, ce qui est couvert (pièces, main-d'œuvre, déplacement), les exclusions, la façon de signaler une panne, le délai d'intervention et ce qui se passe si la réparation est impossible.",
    },
    {
      q: "Comment chiffrer le coût de la garantie ?",
      a: "Multipliez le coût d'une intervention par le nombre d'interventions attendu par vente, calculé à partir de votre taux d'intervention annuel, de la durée et du nombre moyen d'interventions par dossier. Le [calculateur de coût de garantie et de SAV](https://www.quotebuilder.co/outils/calculateur-cout-garantie-sav-devis) le fait pour vous.",
    },
    {
      q: "Faut-il facturer l'extension de garantie à part ?",
      a: "C'est souvent plus clair : le client voit ce qu'il paie et peut choisir. Dans QuoteBuilder, une extension peut être un produit du catalogue avec son propre prix.",
    },
    {
      q: "Mes travaux de pose sont-ils couverts par les mêmes règles ?",
      a: "Pas forcément. La pose dans un bâtiment peut relever des garanties des constructeurs (parfait achèvement, bon fonctionnement, décennale), qui partent de la réception des travaux. Le régime dépend de ce que vous faites exactement.",
    },
    {
      q: "QuoteBuilder affiche-t-il ma garantie au client ?",
      a: "Oui, si vous ajoutez un document « Garantie » (lien et libellé) sur la fiche produit. Il apparaît sur les cartes produit de l'étape Personnalisation, dans le catalogue et sur la page boutique. Il n'apparaît pas sur le PDF.",
    },
    {
      q: "QuoteBuilder gère-t-il le SAV ?",
      a: "Non. Il n'y a ni ticket ni suivi d'intervention. Le dossier s'arrête au statut du pipeline, par exemple « Gagné ». Gardez votre outil de SAV habituel.",
    },
  ],
  "clause-reserve-propriete-devis-b2b": [
    {
      q: "Une clause de réserve de propriété est-elle valable entre professionnels ?",
      a: "Oui. Elle est prévue par les articles 2367 à 2372 du Code civil et produit ses effets en procédure collective selon l'article L624-16 du Code de commerce. Elle doit être convenue par écrit et, pour être opposable en cas de redressement ou de liquidation, acceptée au plus tard au moment de la livraison.",
    },
    {
      q: "Suffit-il de mettre la clause sur la facture ?",
      a: "Non. Une mention sur les seules factures ne prouve pas que l'acheteur a accepté la clause, surtout si la facture est envoyée après la livraison. Mettez-la dans le devis signé ou dans des conditions générales acceptées avant la commande.",
    },
    {
      q: "Où placer la clause de réserve de propriété dans un devis ?",
      a: "Le plus sûr est dans les conditions particulières du devis, juste au-dessus de la signature ou du bon pour accord. À défaut, dans des conditions générales jointes au devis et expressément acceptées par le client.",
    },
    {
      q: "Quel est le délai pour revendiquer un bien en cas de redressement judiciaire ?",
      a: "Trois mois à compter de la publication du jugement d'ouverture (article L624-9 du Code de commerce). La demande s'adresse d'abord au mandataire de justice. Au-delà de ce délai, la revendication n'est plus possible.",
    },
    {
      q: "Que se passe-t-il si le client a revendu le bien sans me payer ?",
      a: "Votre droit de propriété se reporte sur la créance de votre client contre son propre acheteur (article 2372 du Code civil). En procédure collective, vous pouvez revendiquer le prix qui n'a été ni payé ni compensé à la date du jugement (article L624-18 du Code de commerce).",
    },
    {
      q: "La réserve de propriété fonctionne-t-elle pour une prestation de service ?",
      a: "Non. Sans bien livré dont vous resteriez propriétaire, la clause n'a pas d'objet. Pour une prestation, protégez-vous par un acompte, un échéancier et des conditions de paiement claires.",
    },
    {
      q: "Et si le bien a été installé chez le client ?",
      a: "La clause reste utile si le bien peut être séparé sans dommage (article 2370 du Code civil), par exemple des rayonnages boulonnés ou une machine posée. Si le bien est scellé, collé ou intégré au bâtiment, la reprise devient difficile et la clause perd l'essentiel de son intérêt.",
    },
    {
      q: "Qui supporte les risques pendant la réserve de propriété ?",
      a: "Sans précision, les risques suivent la propriété (article 1196 du Code civil), donc restent chez le vendeur. La plupart des clauses prévoient que les risques passent au client dès la livraison, avec obligation d'assurer le bien. Écrivez-le.",
    },
    {
      q: "Si je reprends le bien, puis-je garder l'acompte en plus ?",
      a: "La valeur du bien repris s'impute sur ce qui reste dû. Si elle dépasse la dette restante, vous devez rendre la différence au client (article 2371 du Code civil). La clause garantit votre créance, pas davantage.",
    },
    {
      q: "QuoteBuilder ajoute-t-il une clause de réserve de propriété à mes devis ?",
      a: "Non. Le PDF de QuoteBuilder est un récapitulatif de configuration indicatif et non contractuel, sans section conditions générales. Il n'y a pas non plus de signature électronique. Votre clause va dans votre propre devis ou vos conditions générales, signés avec votre outil habituel.",
    },
  ],
  "delai-livraison-penalites-retard-execution-devis-b2b": [
    {
      q: "Un délai de livraison écrit dans un devis est-il un engagement ?",
      a: "Oui, le délai fait partie du contrat une fois le devis accepté. Mais tout dépend de sa rédaction : un délai « indicatif » engage moins qu'un délai avec un point de départ, qui engage moins qu'une date ferme. Un retard très important peut être reproché même sur un délai indicatif.",
    },
    {
      q: "Le client peut-il appliquer des pénalités de retard sans clause dans le devis ?",
      a: "Pas sous forme de pénalité forfaitaire. Sans clause, il peut suspendre son propre paiement, demander une réduction du prix, la résolution ou des dommages et intérêts (article 1217 du Code civil), mais il doit en principe mettre en demeure (article 1231) et prouver son préjudice.",
    },
    {
      q: "Quel taux de pénalité de retard prévoir entre professionnels ?",
      a: "Il n'y a pas de taux légal. Les CCAG publics servent de repère : 1/3000 par jour pour les travaux, 1/1000 par jour de la valeur en retard pour les fournitures et services, avec un plafond de 10 % et une exonération sous 1 000 €. Partez du préjudice réaliste d'un jour de retard pour fixer le vôtre.",
    },
    {
      q: "Faut-il plafonner les pénalités de retard ?",
      a: "C'est fortement conseillé. Sans plafond, la pénalité peut dépasser la marge ou le prix, et devenir manifestement excessive. Avec un plafond, prévoyez ce qui se passe au-delà : mise en demeure, puis résolution possible.",
    },
    {
      q: "Le juge peut-il réduire une pénalité de retard ?",
      a: "Oui. Une pénalité de retard est une clause pénale : l'article 1231-5 du Code civil permet au juge de la modérer si elle est manifestement excessive, ou de l'augmenter si elle est dérisoire, et de la diminuer en cas d'exécution partielle. Une clause qui interdit cette réduction est réputée non écrite.",
    },
    {
      q: "Faut-il une mise en demeure pour appliquer des pénalités de retard ?",
      a: "En principe, oui : sauf inexécution définitive, la pénalité n'est encourue que lorsque le débiteur est mis en demeure (article 1231-5). Beaucoup de clauses prévoient une application « de plein droit, par la seule échéance du terme » ; dans le doute, un écrit daté dès le dépassement de la date reste la meilleure protection.",
    },
    {
      q: "Les jours de retard se comptent-ils en jours calendaires ou ouvrés ?",
      a: "Ce que dit votre contrat. À défaut de précision, la lecture la plus courante est le jour calendaire. Le CCAG Travaux, par exemple, compte les délais en jours calendaires et ne déduit ni samedis, ni dimanches, ni jours fériés pour le calcul des pénalités.",
    },
    {
      q: "Un retard causé par le client compte-t-il ?",
      a: "Non, s'il est établi. L'article 1610 du Code civil vise le retard qui « ne vient que du fait du vendeur ». Écrivez dans le devis que tout retard du client (validation des plans, acompte, accès au site) prolonge le délai d'autant, et gardez la trace des dates.",
    },
    {
      q: "Le retard d'un fournisseur de matière est-il un cas de force majeure ?",
      a: "En général, non. La force majeure suppose un événement qui échappe au contrôle du débiteur, imprévisible lors de la conclusion du contrat et dont les effets ne peuvent pas être évités (article 1218 du Code civil). Si vous voulez couvrir ce risque, prévoyez-le comme une cause de prolongation négociée.",
    },
    {
      q: "QuoteBuilder suit-il les délais de livraison et calcule-t-il les pénalités ?",
      a: "Non. QuoteBuilder recueille et suit la demande de devis jusqu'à la décision. Le dossier n'a pas de champ date de livraison, il n'y a pas de planning ni de statut « En retard », et aucun calcul de pénalités. Vous pouvez demander la date impérative dans le funnel, la noter dans une note interne, et faire le calcul avec le calculateur de pénalités de retard de livraison.",
    }
  ],
  "annulation-commande-devis-b2b-arrhes-dedit-clause-penale": [
    {
      q: "Un client professionnel peut-il annuler une commande signée ?",
      a: "Par principe, non : un contrat signé l'engage, et il ne peut être révoqué que d'un commun accord ou pour une cause prévue par la loi (articles 1103 et 1193 du Code civil). En pratique, il le peut si le contrat lui en donne la faculté : arrhes, clause de dédit ou barème d'annulation. Sinon, il doit réparer votre préjudice.",
    },
    {
      q: "Quelle différence entre un acompte et des arrhes ?",
      a: "Les arrhes permettent à chaque partie de se dédire : le client en les perdant, le prestataire en restituant le double (article 1590 du Code civil). L'acompte est un premier paiement sur un engagement ferme : il ne permet pas d'annuler, il s'impute sur ce qui est dû.",
    },
    {
      q: "Entre professionnels, une somme versée sans précision vaut-elle arrhes ?",
      a: "La présomption d'arrhes de l'article L214-1 du Code de la consommation ne vise que les contrats entre un professionnel et un consommateur. Entre professionnels, c'est le contrat qui qualifie la somme, et en cas de doute le juge cherche l'intention des parties. Écrivez « acompte » ou « arrhes » en toutes lettres.",
    },
    {
      q: "Peut-on garder tout l'acompte si le client annule ?",
      a: "Si le contrat est ferme et que le client annule, l'acompte s'impute sur ce qui vous est dû : l'indemnité du barème si vous en avez un, ou votre préjudice. Si l'indemnité est inférieure à l'acompte, le surplus se rembourse, sauf clause contraire.",
    },
    {
      q: "Le juge peut-il réduire des frais d'annulation ?",
      a: "Oui, si la clause est une clause pénale et que la pénalité est manifestement excessive (article 1231-5 du Code civil). Une clause de dédit, qui fixe le prix d'une faculté d'annuler, n'est en principe pas modérable. La qualification dépend de la rédaction.",
    },
    {
      q: "Faut-il une mise en demeure pour réclamer une clause pénale ?",
      a: "Oui, sauf inexécution définitive : l'article 1231-5 prévoit que la pénalité n'est encourue que lorsque le débiteur est mis en demeure. Une annulation ferme et écrite peut constituer une inexécution définitive, mais une mise en demeure reste la voie la plus sûre.",
    },
    {
      q: "Que se passe-t-il si c'est le prestataire qui annule ?",
      a: "Avec des arrhes, il restitue le double. Avec un acompte, il le rembourse, et le client peut demander l'exécution ou des dommages et intérêts. Le barème d'annulation, écrit pour le client, ne joue pas en sa faveur.",
    },
    {
      q: "Le client d'un marché de travaux peut-il résilier avant le chantier ?",
      a: "Pour un marché à forfait, oui : l'article 1794 du Code civil lui permet de résilier par sa seule volonté, en dédommageant l'entrepreneur de ses dépenses, de ses travaux et de ce qu'il aurait pu gagner. La Cour de cassation exige que le caractère forfaitaire du marché soit constaté.",
    },
    {
      q: "Un report de date décidé par le client est-il un cas de force majeure ?",
      a: "En principe, non. L'article 1218 du Code civil vise un événement qui échappe au contrôle du débiteur, imprévisible lors de la conclusion du contrat et dont les effets ne peuvent être évités. Une décision interne n'en fait pas partie. Prévoyez plutôt une clause de report.",
    },
    {
      q: "QuoteBuilder calcule-t-il les frais d'annulation ?",
      a: "Non. QuoteBuilder recueille et suit la demande de devis, sans encaissement, facture ni signature. Vous pouvez annoncer votre barème dans la description de vos produits, noter l'annulation dans une note interne et passer le dossier en Perdu. Le calcul se fait avec le calculateur de frais d'annulation, en local.",
    },
  ],
  "retenue-garantie-caution-devis-travaux-b2b": [
    {
      q: "Quel est le taux maximum d'une retenue de garantie ?",
      a: "5 % sur un marché de travaux privé, en application de la loi n° 71-584 du 16 juillet 1971. Sur un marché public, 5 % du montant initial du marché, augmenté des modifications, et 3 % quand le titulaire est une PME et que l'acheteur est l'État, certains établissements publics de l'État ou une collectivité dont les dépenses de fonctionnement dépassent 60 millions d'euros.",
    },
    {
      q: "La retenue de garantie est-elle obligatoire ?",
      a: "Non. Sur un marché privé, elle n'existe que si le contrat la prévoit. Sur un marché public, l'acheteur est libre de la prévoir ou non dans les clauses financières du marché. La garantie de parfait achèvement, elle, ne dépend pas d'une clause : elle est prévue par l'article 1792-6 du Code civil.",
    },
    {
      q: "La retenue de garantie se calcule-t-elle sur le HT ou sur le TTC ?",
      a: "La loi parle de 5 % du montant des acomptes, sans préciser HT ou TTC. C'est le contrat qui le fixe. Sur un marché à 20 % de TVA, une retenue de 5 % du TTC représente 6 % du montant HT.",
    },
    {
      q: "Quand la retenue de garantie doit-elle être libérée ?",
      a: "Sur un marché privé, un an après la date de réception, avec ou sans réserves, sauf si le maître de l'ouvrage a notifié par lettre recommandée une opposition motivée par l'inexécution de vos obligations. Sur un marché public, dans les 30 jours qui suivent la fin du délai de garantie, ou 30 jours après la levée des réserves notifiées pendant ce délai.",
    },
    {
      q: "Peut-on remplacer la retenue de garantie par une caution bancaire ?",
      a: "Oui. Sur un marché privé, la retenue n'est pas pratiquée si l'entreprise fournit, pour le même montant, une caution personnelle et solidaire d'une banque, d'un établissement financier habilité ou d'une société de caution mutuelle. Sur un marché public, le titulaire peut la remplacer par une garantie à première demande ou, si l'acheteur ne s'y oppose pas, par une caution personnelle et solidaire.",
    },
    {
      q: "Que faire si le client prévoit une retenue de 10 % ?",
      a: "Sur un marché de travaux privé, c'est au-dessus du plafond de 5 %, et la loi déclare nulles les clauses qui font échec à ses règles. Demandez que le taux soit ramené à 5 % au plus avant de signer, et faites relire la clause par votre conseil.",
    },
    {
      q: "Le client peut-il garder la retenue sur son compte ?",
      a: "Pas sur un marché privé : le maître de l'ouvrage doit consigner une somme égale à la retenue entre les mains d'un consignataire accepté par les deux parties ou, à défaut, désigné par le président du tribunal judiciaire ou du tribunal de commerce.",
    },
    {
      q: "Un sous-traitant peut-il subir une retenue de garantie ?",
      a: "Sur un chantier privé, oui : la loi de 1971 s'applique aux conventions de sous-traitance, avec les mêmes règles. Sur un marché public, Service Public Entreprendre précise que la retenue s'applique au titulaire du marché, pas au sous-traitant.",
    },
    {
      q: "QuoteBuilder calcule-t-il la retenue de garantie ?",
      a: "Non. QuoteBuilder ne produit pas de factures, n'encaisse rien et ne connaît pas la date de réception de vos chantiers. Il sert en amont : poser la question de la retenue dans le funnel, annoncer vos conditions dans la description des produits, l'email de confirmation ou vos réponses, et garder ce qui a été convenu en note interne.",
    },
    {
      q: "Le récapitulatif PDF de QuoteBuilder peut-il mentionner la retenue de garantie ?",
      a: "Non. Le récapitulatif PDF montre la configuration et une fourchette indicative, avec un pied de page fixe, « Document indicatif, non contractuel. ». La clause de retenue de garantie va dans votre devis final et dans votre marché.",
    },
  ],
  "conditions-paiement-penalites-retard-devis-b2b": [
    {
      q: "Quel est le délai de paiement maximum entre professionnels ?",
      a: "60 jours après la date d'émission de la facture, ou 45 jours fin de mois si c'est écrit au contrat et que ce n'est pas abusif pour le fournisseur. Sans accord, le délai est de 30 jours après la réception des marchandises ou l'exécution de la prestation. Certains secteurs, comme le transport routier de marchandises, ont des délais spécifiques.",
    },
    {
      q: "Quel est le taux des pénalités de retard au second semestre 2026 ?",
      a: "12,40 %, si vos conditions ne prévoient pas d'autre taux : le taux de refinancement de la BCE en vigueur au 1er juillet 2026, 2,40 %, majoré de 10 points. Au premier semestre 2026, il était de 12,15 %.",
    },
    {
      q: "Peut-on prévoir un taux de pénalités plus bas ?",
      a: "Oui, dans vos CGV ou au contrat, mais pas en dessous de trois fois le taux de l'intérêt légal. Au second semestre 2026, l'intérêt légal entre professionnels est de 2,75 %, donc le plancher est de 8,25 %.",
    },
    {
      q: "Comment calculer les pénalités de retard ?",
      a: "Somme due × taux annuel × nombre de jours de retard ÷ 365, à partir du lendemain de l'échéance. Si le retard couvre deux semestres, chaque jour prend le taux de son semestre. Le calculateur de pénalités fait ce calcul avec vos dates.",
    },
    {
      q: "Faut-il envoyer une mise en demeure pour réclamer des pénalités ?",
      a: "Non. Entre professionnels, les pénalités sont exigibles sans qu'un rappel soit nécessaire. En pratique, il faut quand même les réclamer par écrit, avec le calcul, puisque le client ne les paiera pas de lui-même.",
    },
    {
      q: "L'indemnité de 40 € est-elle due par facture ou par client ?",
      a: "Par facture payée en retard, une seule fois, même si la facture a été payée en partie. Elle n'est pas soumise à la TVA. Si vos frais de recouvrement réels sont plus élevés, une indemnisation complémentaire peut être demandée sur justificatifs.",
    },
    {
      q: "Les conditions de paiement doivent-elles figurer sur le devis ?",
      a: "Le délai de paiement, les pénalités et l'indemnité doivent figurer dans vos CGV et sur la facture. Les reprendre dans le devis, en un bloc court, permet au client de les voir avant de s'engager, et de signaler tout de suite s'il a ses propres conditions d'achat.",
    },
    {
      q: "Comment se calcule un délai de 45 jours fin de mois ?",
      a: "Deux méthodes sont admises : fin du mois d'émission de la facture, puis 45 jours ; ou 45 jours après la facture, puis fin du mois. Pour une facture du 1er août 2026, cela donne le 15 octobre ou le 30 septembre. Écrivez la méthode dans vos conditions.",
    },
    {
      q: "QuoteBuilder calcule-t-il les pénalités de retard ?",
      a: "Non. QuoteBuilder ne produit pas de factures, n'encaisse rien et ne calcule pas de pénalités. Il sert en amont : poser les bonnes questions dans le funnel, annoncer vos conditions dans la description des produits, l'email de confirmation ou vos réponses, et garder ce qui a été convenu en note interne.",
    },
    {
      q: "Le récapitulatif PDF de QuoteBuilder peut-il porter mes conditions de paiement ?",
      a: "Non. Le récapitulatif PDF montre la configuration et une fourchette indicative, avec un pied de page fixe, « Document indicatif, non contractuel. ». Vos conditions de paiement vont dans votre devis final et dans vos CGV.",
    },
  ],
  "revision-prix-indexation-devis-b2b": [
    {
      q: "Qu'est-ce qu'une clause de révision de prix ?",
      a: "C'est une clause du devis ou du contrat qui fixe à l'avance comment le prix évolue entre la date du devis et l'exécution, en fonction d'un ou plusieurs indices publiés. Elle précise l'indice, la formule, les mois de référence et la fréquence de révision, et joue à la hausse comme à la baisse.",
    },
    {
      q: "Quelle est la différence entre prix ferme, actualisable et révisable ?",
      a: "Un prix ferme ne change pas. Un prix ferme actualisable est recalé une seule fois, au démarrage, si l'exécution commence longtemps après l'offre, puis reste ferme. Un prix révisable suit une formule pendant toute l'exécution, à une fréquence prévue.",
    },
    {
      q: "Quelle formule utiliser pour réviser un prix ?",
      a: "La plus simple : nouveau prix = prix initial × indice du mois de révision / indice du mois de départ. Quand le prix mélange plusieurs postes, on utilise une formule à plusieurs termes, avec éventuellement une partie fixe, dont les coefficients font 1 au total.",
    },
    {
      q: "Quel indice choisir pour indexer un devis ?",
      a: "Un indice qui suit vos coûts ou votre marché, publié régulièrement et consultable par le client. Dans le bâtiment, l'index BT ou TP le plus proche du travail réalisé. Ailleurs, un indice de prix de production de votre branche, un cours de matière ou un indice du coût du travail.",
    },
    {
      q: "Peut-on indexer un devis sur l'inflation ?",
      a: "L'article L112-2 du Code monétaire et financier interdit les indexations fondées sur le niveau général des prix ou sur des prix sans relation directe avec l'objet du contrat ou l'activité d'une partie. Avant d'écrire une référence à l'inflation, demandez un avis et cherchez un indice propre à votre activité.",
    },
    {
      q: "Que faire si l'indice prévu disparaît ?",
      a: "Le Code civil, à l'article 1167, prévoit son remplacement par l'indice qui s'en rapproche le plus. En pratique, l'Insee désigne souvent une série poursuivante et un coefficient de raccordement. Le mieux est de prévoir ce cas dans la clause.",
    },
    {
      q: "Faut-il une partie fixe dans la formule ?",
      a: "Ce n'est pas obligatoire entre entreprises. Une partie fixe amortit les variations, à la hausse comme à la baisse, et représente la part du prix qui ne dépend pas des cours. Plus elle est grande, plus vous gardez de risque à votre charge.",
    },
    {
      q: "Une clause de révision peut-elle faire baisser le prix ?",
      a: "Oui, et elle doit pouvoir le faire. Si un indice baisse, le prix révisé baisse. Une clause qui ne jouerait qu'à la hausse serait difficile à faire accepter et à défendre.",
    },
    {
      q: "QuoteBuilder calcule-t-il la révision de prix ?",
      a: "Non. QuoteBuilder ne suit aucun indice et ne recalcule pas les prix. Vous mettez à jour vous-même les prix du catalogue, à la main ou par import CSV, ainsi que les fourchettes de vos règles. La clause et le calcul se font dans votre devis et votre facturation.",
    },
    {
      q: "Que deviennent les demandes déjà reçues quand je change mes prix dans QuoteBuilder ?",
      a: "Elles ne changent pas. Les produits, leurs prix et la fourchette sont enregistrés dans le dossier à l'envoi de la demande. Le PDF, la fiche et l'espace prospect gardent les montants d'origine, ce qui montre ce que le client a vu.",
    },
  ],
  "analyser-devis-perdus-motifs-perte-b2b": [
    {
      q: "Comment analyser ses devis perdus ?",
      a: "Notez un motif principal pour chaque devis perdu, au moment où vous le classez, avec une liste courte et fixe (prix, délai, concurrent préféré, pas de réponse, projet annulé ou reporté, hors cible). Une fois par trimestre, comptez les motifs, calculez le taux de gain sur les dossiers tranchés, relisez quelques dossiers des deux premiers motifs et décidez une action par motif.",
    },
    {
      q: "Quels motifs de perte utiliser ?",
      a: "Une liste de cinq à sept motifs suffit : prix, délai, concurrent préféré, pas de réponse, projet annulé ou reporté, hors cible, et sans motif pour compter les oublis. Écrivez une définition pour chacun et évitez le motif « Autre », qui devient vite le premier.",
    },
    {
      q: "Comment calculer son taux de transformation de devis ?",
      a: "Divisez le nombre de devis gagnés par le nombre de devis tranchés, c'est-à-dire gagnés plus perdus, sur la même période. Les dossiers encore ouverts n'entrent pas dans le calcul.",
    },
    {
      q: "Faut-il demander au client pourquoi il n'a pas retenu notre devis ?",
      a: "Oui, avec une seule question, au moment où il annonce sa décision : qu'est-ce qui a fait la différence ? Pas de questionnaire, pas de remise proposée dans la foulée. Notez ses mots, puis croisez avec le dossier.",
    },
    {
      q: "Quand classer un devis en perdu ?",
      a: "Quand l'affaire est tranchée : le client a choisi ailleurs, a renoncé, ou ne répond plus après les relances prévues par votre règle d'équipe. Un client qui attend une validation interne reste en attente.",
    },
    {
      q: "Peut-on noter le motif de perte dans QuoteBuilder ?",
      a: "Pas dans un champ dédié : le statut Perdu n'a pas de motif. Notez-le dans une note interne de la fiche, en commençant par « Motif : ». Les notes sont visibles par l'équipe, pas par le client, et ne se modifient pas une fois ajoutées.",
    },
    {
      q: "Les statistiques de QuoteBuilder montrent-elles les devis perdus ?",
      a: "Non. L'écran Statistiques compte les demandes reçues, rappelées et signées, et le pipeline montre les dossiers ouverts, mais aucun indicateur ne compte les dossiers Perdu. Le taux de gain se calcule à partir des exports CSV filtrés sur Gagné et sur Perdu.",
    },
    {
      q: "Que voit le client quand son dossier passe en Perdu ?",
      a: "Rien ne lui est envoyé automatiquement. Sur son espace prospect, la frise n'a pas d'étape de clôture et le dossier apparaît à l'étape « Reçu ». L'espace membres affiche « Clôturé ». Prévenez-le vous-même, depuis la fiche, avec « Écrire ».",
    },
    {
      q: "Peut-on relancer plus tard un client dont le projet a été reporté ?",
      a: "Oui. Notez la date de reprise dans la note de motif et prévoyez un rappel. Un segment sur le statut Perdu permet aussi une campagne, mais seulement vers les contacts qui ont donné leur consentement marketing, et la newsletter segmentée fait partie des plans Pro et Agency.",
    },
    {
      q: "Que peut-on écrire dans une note sur un client ?",
      a: "Des faits utiles au suivi du dossier, formulés de façon neutre. La CNIL rappelle que la personne peut demander à lire les commentaires la concernant, qu'ils doivent rester adéquats, pertinents et non excessifs, et que les données sensibles comme la santé ne s'y écrivent pas, sauf exceptions.",
    },
  ],
  "zone-intervention-frais-deplacement-devis-b2b": [
    {
      q: "Comment calculer des frais de déplacement pour un devis ?",
      a: "Additionnez le coût du véhicule (kilomètres aller et retour × coût au kilomètre), le temps de route de chaque personne au coût horaire chargé, et les péages ou parkings. Multipliez par le nombre d'allers-retours du chantier. Le calculateur des frais de déplacement par zone fait ce calcul avec vos chiffres.",
    },
    {
      q: "Faut-il facturer le déplacement à part ou l'inclure dans le prix ?",
      a: "Les deux se défendent. Dans une zone proche, l'inclure simplifie le devis. Plus loin, une ligne à part, nommée clairement, évite de perdre de l'argent et se discute plus facilement qu'un prix global plus élevé.",
    },
    {
      q: "Comment définir sa zone d'intervention ?",
      a: "Calculez le coût du trajet en kilomètres ou en temps, puis traduisez les cercles en noms de lieux que le client comprend. Trois zones et un « au-delà » suffisent presque toujours.",
    },
    {
      q: "Comment fixer un forfait de déplacement par zone ?",
      a: "Calculez le coût du trajet au bord extérieur de la zone, pour tous les allers-retours d'un chantier type, puis arrondissez. Vous pouvez aussi absorber la part que votre marge supporte et ne facturer que le reste.",
    },
    {
      q: "Les frais de déplacement doivent-ils figurer sur le devis ?",
      a: "Pour le dépannage, la réparation et l'entretien dans le bâtiment et l'équipement de la maison, l'arrêté du 24 janvier 2017 l'exige vis-à-vis des consommateurs. Entre professionnels, l'écrire sur une ligne à part reste la façon la plus simple d'éviter un litige.",
    },
    {
      q: "Que répondre à une demande de devis hors de sa zone ?",
      a: "Répondez vite : oui à conditions (forfait, minimum, tournée), oui à distance si c'est possible, ou non avec une piste. Le silence est la seule mauvaise réponse.",
    },
    {
      q: "QuoteBuilder calcule-t-il la distance jusqu'au chantier ?",
      a: "Non. Le funnel ne lit pas d'adresse et ne calcule pas de distance. Vous posez une question de zone avec des noms de lieux, et c'est le prospect qui choisit.",
    },
    {
      q: "Peut-on afficher une fourchette de prix qui inclut le déplacement ?",
      a: "Oui, avec les règles de suggestion : une règle par couple solution et zone, qui propose aussi un produit « forfait déplacement », ou dont la fourchette Prix min et Prix max inclut le trajet.",
    },
    {
      q: "Peut-on bloquer les demandes hors zone dans le funnel ?",
      a: "Non. Le funnel n'a pas de branchement conditionnel et le prospect peut toujours envoyer sa demande. Vous pouvez seulement ne pas lui proposer de solution, puis lui répondre au cas par cas.",
    },
    {
      q: "Peut-on assigner automatiquement une demande selon la zone ?",
      a: "Pas simplement pour une question créée dans l'éditeur : la condition « Réponse funnel » de l'Autopilote demande la clé et la valeur techniques, que l'éditeur n'affiche pas. L'assignation se fait depuis la fiche, ou par le parcours si le funnel est configuré par l'API avec des clés lisibles.",
    },
  ],
  "salon-professionnel-demandes-devis-b2b": [
    {
      q: "Comment transformer les contacts d'un salon en demandes de devis ?",
      a: "Faites remplir une vraie demande pendant que le visiteur est sur le stand : un QR code vers un funnel court, ou une tablette avec un commercial qui remplit avec lui. Pour les autres, un email le soir même avec le lien du funnel. Puis rappelez dans les 48 heures.",
    },
    {
      q: "Faut-il un QR code sur un stand de salon ?",
      a: "C'est le moyen le plus simple de faire passer un visiteur du stand à un formulaire sur son propre téléphone. Mettez-le à hauteur des yeux, avec une phrase qui dit ce que le visiteur obtient, et testez le scan avant d'imprimer.",
    },
    {
      q: "QuoteBuilder génère-t-il le QR code ?",
      a: "Non. Vous copiez le lien public du funnel dans l'onglet « Lien & embed », vous ajoutez les paramètres utm, et vous générez le QR code avec l'outil de votre choix.",
    },
    {
      q: "Comment savoir quelles demandes viennent du salon ?",
      a: "Ajoutez `utm_source=salon` et `utm_campaign` au nom du salon dans le lien du QR code. QuoteBuilder garde ces valeurs avec la demande, les affiche dans la rubrique Attribution de la fiche et dans les onglets Sources et Campagnes des statistiques.",
    },
    {
      q: "Peut-on utiliser une tablette partagée sur le stand ?",
      a: "Oui, en ouvrant le funnel dans une fenêtre de navigation privée, fermée après chaque demande envoyée. Sinon, le navigateur garde la session du visiteur précédent.",
    },
    {
      q: "Peut-on saisir à la main une demande après le salon ?",
      a: "Pas dans le back-office : il n'y a pas de saisie manuelle de demande. Le commercial peut remplir le funnel lui-même avec les informations du visiteur, en gardant le lien tagué salon.",
    },
    {
      q: "Peut-on relancer automatiquement les visiteurs du salon ?",
      a: "Oui, ceux qui ont envoyé une demande ou commencé une demande avec leur email, via les parcours d'Autopilote. Un funnel dédié au salon permet un parcours avec ses propres délais. Les contacts qui n'ont rien rempli se relancent depuis votre messagerie.",
    },
    {
      q: "Le score tient-il compte du salon ?",
      a: "Non. Le score suit une formule fixe qui lit quelques réponses du funnel. Il ne lit ni la source, ni la campagne, ni ce qui s'est dit sur le stand. Ajoutez une note interne sur la fiche.",
    },
    {
      q: "Comment calculer le ROI d'un salon professionnel ?",
      a: "Additionnez tous les coûts, temps de l'équipe compris. Divisez par le nombre de demandes, puis par le nombre de clients signés sur le cycle de vente. Comparez avec la marge brute de ces commandes. Le calculateur ROI salon professionnel fait ce calcul avec vos chiffres.",
    },
    {
      q: "Peut-on envoyer un email aux visiteurs dont on a scanné le badge ?",
      a: "En B2B, la CNIL admet la prospection par email sur la base de l'intérêt légitime si le message concerne la profession de la personne, à condition de l'informer et de lui permettre de s'opposer simplement, à chaque envoi. Faites valider votre pratique par votre conseil.",
    },
  ],
  "email-confirmation-demande-devis-b2b": [
    {
      q: "Faut-il envoyer un email de confirmation après une demande de devis ?",
      a: "Oui. C'est le premier message que le client reçoit après sa demande. Il confirme la réception, annonce le délai et la prochaine étape, et donne un moyen de compléter la demande. Sans lui, le client ne sait pas si sa demande est partie.",
    },
    {
      q: "Que mettre dans l'objet ?",
      a: "Le mot « demande », l'idée de réception et, si possible, le nom de votre entreprise. Par exemple « Demande de devis reçue, Atelier Martin ». Évitez les objets vagues comme « Récapitulatif ».",
    },
    {
      q: "Quel délai annoncer ?",
      a: "Celui que votre équipe tient vraiment, en jours ouvrés, en précisant s'il s'agit d'un premier contact ou du devis chiffré. Mesurez-le sur vos dernières demandes avant de l'écrire.",
    },
    {
      q: "Peut-on mettre le prix dans la confirmation ?",
      a: "Une fourchette indicative, oui, si votre funnel en calcule une, en précisant que ce n'est pas encore un devis. Dans QuoteBuilder, la variable `{{price_range}}` affiche la fourchette ou « Sur devis ».",
    },
    {
      q: "La confirmation remplace-t-elle le devis ?",
      a: "Non. C'est un accusé de réception. Les mentions obligatoires et le prix ferme vont sur le devis que vous envoyez ensuite.",
    },
    {
      q: "Où modifier l'email de confirmation dans QuoteBuilder ?",
      a: "Dans Paramètres, rubrique Emails, réservée aux administrateurs. Le bloc « Email · prospect_confirm » contient l'objet et le corps du message.",
    },
    {
      q: "Peut-on avoir un texte différent par funnel ?",
      a: "Non. QuoteBuilder utilise un seul modèle de confirmation par organisation. Écrivez un texte valable pour tous vos funnels, ou nommez la demande avec `{{suggestion_name}}`.",
    },
    {
      q: "Le récapitulatif PDF est-il toujours joint ?",
      a: "Il est joint quand l'option « Joindre le récapitulatif » est cochée sur l'étape d'envoi du Parcours demande, ce qui est le cas par défaut. Si vous la décochez, retirez la phrase « ci-joint » de votre texte.",
    },
    {
      q: "À qui arrive la réponse du client ?",
      a: "À l'adresse indiquée en « Répondre à » sur le message, pas à l'adresse d'envoi de QuoteBuilder. Vérifiez-le avec une demande de test, et écrivez une adresse et un numéro joignables dans le corps de l'email.",
    },
    {
      q: "Peut-on mettre un logo ou une mise en page ?",
      a: "Non. La confirmation part en texte simple. Les liens apparaissent en clair. Un texte court et bien espacé se lit très bien sur téléphone.",
    },
  ],
  "devis-payant-etude-prealable-b2b": [
    {
      q: "Est-ce légal de faire payer un devis ?",
      a: "Oui. En dehors des cas encadrés par un texte, un professionnel peut proposer un devis payant, notamment s'il y a déplacement ou étude approfondie. Il doit informer le client du prix avant d'établir le devis. Faites valider vos conditions par votre conseil.",
    },
    {
      q: "Faut-il annoncer le devis payant avant la demande ?",
      a: "Oui, avant que le client accepte le travail d'étude. Le plus simple est de l'écrire dans le formulaire de demande, puis dans l'email de confirmation, puis de le confirmer par écrit au premier échange.",
    },
    {
      q: "Quelle différence entre un devis payant et une étude préalable ?",
      a: "Le devis est le prix. L'étude est un travail technique qui permet de donner ce prix : relevé, plan, note de calcul, visite. Facturer l'étude est plus facile à expliquer, parce que le client reçoit un document utile même sans commande.",
    },
    {
      q: "Combien faire payer une étude ?",
      a: "Au plus le temps réellement passé, multiplié par votre taux horaire. Beaucoup d'entreprises en facturent une partie, ou un forfait par type d'étude. Évitez les montants symboliques et les montants sans rapport avec la taille du projet.",
    },
    {
      q: "Faut-il déduire l'étude de la commande ?",
      a: "C'est ce qui la fait accepter le plus facilement. Le client qui signe ne paie rien de plus. Fixez une durée de déduction, par exemple trois ou six mois, et écrivez-la avec le prix.",
    },
    {
      q: "Est-ce que je vais perdre des clients ?",
      a: "Probablement quelques-uns. Certains clients sérieux refusent par principe. La question est de savoir si le temps récupéré et les études facturées valent plus que la marge de ces contrats perdus. Le calculateur fait ce bilan avec vos chiffres.",
    },
    {
      q: "QuoteBuilder peut-il encaisser l'étude ?",
      a: "Non. QuoteBuilder n'a ni paiement en ligne ni facturation. Il annonce l'étude dans le funnel, enregistre la réponse du client et la met dans la fiche. Le règlement passe par votre circuit habituel.",
    },
    {
      q: "Peut-on proposer l'étude seulement pour les gros projets ?",
      a: "Oui, avec une règle Si/Alors qui suggère le produit « Étude » selon les réponses, par exemple au-delà d'une surface. La règle choisit les produits proposés. Elle n'ajoute pas d'étape et ne masque pas de question.",
    },
    {
      q: "Le score tient-il compte de l'accord pour l'étude payante ?",
      a: "Non. Le score suit une formule fixe qui ne lit pas cette réponse. Filtrez et triez les demandes sur la réponse elle-même, visible dans la fiche.",
    },
    {
      q: "Où écrire les conditions de l'étude ?",
      a: "Dans la description du produit « Étude », dans le texte d'aide de la question d'accord (posée en choix visuel, seul type dont l'aide s'affiche), dans l'email de confirmation et dans vos conditions générales. Le pied de page du PDF de QuoteBuilder est fixe et ne sert pas à ça.",
    },
  ],
  "espace-membres-portail-client-devis-b2b": [
    {
      q: "Quelle différence entre l'espace prospect et l'espace membres ?",
      a: "L'espace prospect est la page d'une seule demande : statut, récapitulatif, fichiers, messages. Il est créé automatiquement à chaque envoi. L'espace membres est la page d'un client : la liste de toutes ses demandes chez vous, plus des documents et des liens communs. Il est créé une fois par un Admin.",
    },
    {
      q: "Le client doit-il créer un compte ?",
      a: "Non. Il se connecte avec l'adresse email utilisée pour sa demande et le code PIN à 6 chiffres reçu par email. Les essais de connexion sont limités : trop de tentatives rapprochées sont refusées, le temps de réessayer. Depuis la page de suivi d'une demande, un lien l'amène dans l'espace déjà connecté.",
    },
    {
      q: "Quelles demandes le client voit-il ?",
      a: "Toutes les demandes envoyées chez vous avec l'adresse email qui sert à la connexion, de la plus récente à la plus ancienne, avec la date et un statut écrit pour lui. Il ne voit pas les demandes envoyées depuis une autre adresse, même dans la même société.",
    },
    {
      q: "Pourquoi une demande n'est-elle plus cliquable ?",
      a: "Le lien de suivi d'une demande est valable 30 jours. Passé ce délai, la demande reste dans la liste avec son statut, mais sans lien vers sa page de suivi.",
    },
    {
      q: "Le client peut-il se connecter avec un ancien code PIN ?",
      a: "Seulement si la demande correspondante a moins de 30 jours. Le code d'une demande plus ancienne n'ouvre plus l'espace. Chaque nouvelle demande génère un nouveau code, envoyé dans son email de confirmation.",
    },
    {
      q: "Qui peut créer et modifier l'espace membres ?",
      a: "Le Propriétaire et les Admins. Le rôle Commercial ne voit pas l'entrée Espace membres dans le menu et ne peut pas modifier l'espace.",
    },
    {
      q: "Les documents déposés sont-ils protégés ?",
      a: "Oui. Un fichier déposé est privé : il s'ouvre pour un client connecté, ou pour l'équipe, par un lien signé de courte durée. La ressource publiée reste visible par tous les clients connectés. N'y mettez que des documents que vous pourriez envoyer à chacun d'eux.",
    },
    {
      q: "Un relecteur invité sur une demande a-t-il accès à l'espace membres ?",
      a: "Non. Le lien vers l'espace membres n'est pas affiché aux relecteurs. Ils gardent leur lien personnel, valable 30 jours, vers la demande pour laquelle ils ont été invités.",
    },
    {
      q: "Peut-on avoir plusieurs espaces membres ?",
      a: "Oui, mais les emails et la page de suivi renvoient vers le dernier espace publié. Si vous en gardez plusieurs en ligne, vérifiez lequel part dans vos emails.",
    },
    {
      q: "L'espace membres apparaît-il dans Google ?",
      a: "Non. Ses pages portent une directive noindex. Il sert vos clients existants, pas votre référencement.",
    },
  ],
  "import-catalogue-csv-funnel-devis-b2b": [
    {
      q: "Quelles colonnes l'import CSV de QuoteBuilder reconnaît-il ?",
      a: "Sept champs : nom, SKU, catégorie, prix min, prix max, tags et description, chacun sous quelques noms de colonne, par exemple `nom`, `reference`, `categorie` ou `prix_min`. Les en-têtes sont comparés sans majuscules ni accents.",
    },
    {
      q: "Pourquoi mon fichier Excel est-il refusé ?",
      a: "Le plus souvent, à cause du point-virgule. L'import ne découpe qu'à la virgule : l'en-tête devient une seule colonne et la colonne nom est introuvable. Convertissez le fichier en virgules.",
    },
    {
      q: "Ma colonne « Prix » est ignorée, pourquoi ?",
      a: "« Prix » ne fait pas partie des noms reconnus. Renommez-la en « Prix min », et ajoutez une colonne « Prix max » avec la même valeur pour un prix fixe.",
    },
    {
      q: "Que se passe-t-il si je réimporte le même fichier ?",
      a: "Les lignes dont le SKU existe déjà dans le funnel mettent à jour leur fiche. Les lignes sans SKU sont créées une seconde fois. Sans colonne SKU, réimporter double le catalogue.",
    },
    {
      q: "Une colonne absente garde-t-elle l'ancienne valeur ?",
      a: "Non. Pour un SKU existant, l'import réécrit nom, description, prix min, prix max, tags et catégorie avec les valeurs du fichier. Une colonne absente ou une cellule vide efface le champ.",
    },
    {
      q: "Comment écrire un prix avec des centimes ?",
      a: "Avec un point (18.42) ou une virgule entre guillemets (\"18,42\"), sans séparateur de milliers. Le prix est enregistré au centime, mais QuoteBuilder affiche les montants d'un euro ou plus sans centimes.",
    },
    {
      q: "Peut-on importer les photos, les options ou le stock ?",
      a: "Non. Le CSV porte le nom, le SKU, la catégorie, les prix, les tags et la description. Photos, documents et options se règlent sur la fiche produit. Le stock vient seulement d'une boutique synchronisée.",
    },
    {
      q: "Qui peut importer un catalogue ?",
      a: "Le Propriétaire et les Admins. Le menu Catalogue n'apparaît pas pour un Commercial.",
    },
    {
      q: "Un produit retiré du fichier est-il supprimé ?",
      a: "Non. L'import crée et met à jour, il ne supprime rien. Un produit qui ne doit plus être proposé se désactive ou se supprime depuis le catalogue.",
    },
    {
      q: "Faut-il un funnel avant d'importer ?",
      a: "Oui. Les produits sont rattachés au funnel choisi à l'étape 1 de l'import. Sans funnel, l'import s'arrête avec le message « Créez d'abord un funnel : le catalogue s'y rattache. »",
    },
  ],
  "roles-permissions-equipe-demande-devis-b2b": [
    {
      q: "Quels sont les rôles d'équipe dans QuoteBuilder ?",
      a: "Trois : Propriétaire, Admin et Commercial. Le Propriétaire a tout l'espace et ne peut être ni rétrogradé ni suspendu. L'Admin configure funnels, catalogue, équipe et automatisations, et traite aussi les demandes. Le Commercial traite les demandes, relance les abandons et envoie des emails, sans accès aux réglages.",
    },
    {
      q: "Un Commercial peut-il voir les demandes assignées à ses collègues ?",
      a: "Oui. Le rôle Commercial limite l'accès aux réglages, pas aux dossiers. Tous les membres actifs voient toutes les demandes de l'espace. Le filtre par assigné de la liste des Demandes sert à n'afficher que ses dossiers, mais ce n'est pas une restriction d'accès.",
    },
    {
      q: "Peut-on inviter quelqu'un comme Propriétaire ?",
      a: "Non. La fenêtre d'invitation propose uniquement Commercial et Admin. Le Propriétaire est la personne qui a créé l'espace, et l'interface ne propose pas de transfert de propriété.",
    },
    {
      q: "Comment inviter un commercial ?",
      a: "Page Équipe, bouton Inviter, choix du rôle Commercial, saisie de son email, puis Envoyer l'invitation. Il reçoit un email avec un lien pour créer son accès ou se connecter. Il doit utiliser l'adresse invitée, sinon l'invitation est refusée.",
    },
    {
      q: "Le lien d'invitation ne fonctionne plus, que faire ?",
      a: "Si vous avez réinvité la même adresse ou cliqué sur Renvoyer l'accès, un nouveau lien a été généré et l'ancien ne fonctionne plus. Demandez à la personne d'utiliser le dernier email reçu. Vérifiez aussi qu'elle se connecte avec l'adresse invitée.",
    },
    {
      q: "Un Admin peut-il modifier le rôle d'un autre Admin ?",
      a: "Oui. Un Admin peut changer le rôle d'un Commercial ou d'un autre Admin. Il ne peut modifier ni le Propriétaire ni son propre compte. Aujourd'hui, l'application ne coupe pas de façon fiable l'accès d'un membre actif : Suspendre peut annoncer un succès sans changer le statut. Vérifiez dans la liste Équipe et, si rien ne change, contactez le support. Révoquer l'invitation ne concerne qu'une invitation en attente.",
    },
    {
      q: "Que se passe-t-il quand on change le rôle d'un membre ?",
      a: "Le nouveau rôle s'applique à son prochain chargement de page : le menu et les écrans accessibles changent sans reconnexion. Aucun email ne le prévient automatiquement, prévenez-le vous-même.",
    },
    {
      q: "Comment gérer le départ d'un commercial ?",
      a: "Filtrez la liste des Demandes sur son nom, réassignez ses dossiers ouverts, puis essayez Suspendre. Vérifiez dans la liste Équipe que le statut a bien changé. S'il n'a pas changé, contactez le support : aujourd'hui l'application ne coupe pas de façon fiable l'accès d'un membre actif. Son historique reste consultable.",
    },
    {
      q: "Le Directeur financier ou le Responsable technique invité sur un dossier fait-il partie de l'équipe ?",
      a: "Non. Ce sont des relecteurs côté client, invités sur une demande précise avec un lien personnel valable 30 jours. Ils n'ont pas de compte dans votre espace et n'apparaissent pas sur la page Équipe.",
    },
    {
      q: "Faut-il donner le rôle Admin à tous les commerciaux pour gagner du temps ?",
      a: "Non. Le rôle Admin ouvre les réglages qui touchent chaque prospect : funnels, catalogue, automatisations. Un commercial traite ses demandes avec le rôle Commercial. Gardez un ou deux Admins qui maintiennent réellement l'outil, dont un de secours.",
    },
  ],
  "segments-campagnes-email-demande-devis-b2b": [
    {
      q: "Quelle différence entre l'Autopilote et une campagne email ?",
      a: "L'Autopilote attache un parcours à une demande : confirmation, relances, reprise d'abandon, selon un déclencheur. Une campagne envoie un email à un segment de contacts, quand vous lancez l'envoi. L'un ne remplace pas l'autre.",
    },
    {
      q: "Où se règlent les segments et les campagnes ?",
      a: "Dans le menu Commercial : Segmentation pour les règles, Emails pour le message et l'envoi. L'Autopilote est dans Automatisations, visible par les administrateurs. Un commercial voit Emails et Segmentation.",
    },
    {
      q: "Quels critères peut-on combiner ?",
      a: "Funnel, score, statut, audience, une réponse de funnel, et le dernier email marketing. Toutes les règles du segment doivent être vraies. Une liste de règles vide matche tout le monde.",
    },
    {
      q: "Comment QuoteBuilder distingue-t-il le B2B du B2C ?",
      a: "B2B veut dire qu'une société est renseignée sur la demande. B2C veut dire que le champ est vide. Il n'y a pas d'autre drapeau. L'opérateur « n'est pas » n'est pas appliqué sur ces deux valeurs.",
    },
    {
      q: "Le score Hot, Warm ou Cold se configure-t-il ?",
      a: "Non. Il est calculé à la soumission par une formule fixe, puis stocké. Le segment lit ce libellé. Il ne se recalcule pas le jour de la campagne, et vous ne réglez pas les points.",
    },
    {
      q: "Que veut dire « déjà relancés » ?",
      a: "La fenêtre, 30 jours par défaut, regarde la date du dernier envoi de campagne marketing. Elle ne regarde pas les emails de l'Autopilote. Mettre 0 désactive l'exclusion. Le libellé du bilan après envoi réutilise « déjà relancés » pour tous les ignorés, y compris le défaut de consentement.",
    },
    {
      q: "Un contact sans case marketing reçoit-il la campagne ?",
      a: "Non. Il est écarté de l'envoi. Il est compté parmi les ignorés dans le bilan. Le motif précis n'est pas affiché dans ce bilan.",
    },
    {
      q: "Peut-on envoyer la campagne par SMS ou WhatsApp ?",
      a: "Non. L'envoi est un email, depuis l'adresse QuoteBuilder ou une boîte Gmail, Outlook ou IMAP. Il n'y a pas de SMS dans ce module. WhatsApp n'est pas un mode d'envoi de campagne.",
    },
    {
      q: "Une campagne sans segment part-elle quand même ?",
      a: "Oui, vers les contacts qui ont un email, parmi les demandes lues (les 2 000 plus récentes), sous réserve du consentement et de la fenêtre de jours. L'option s'appelle « Tous les contacts avec un email ».",
    },
    {
      q: "La newsletter segmentée est-elle incluse dans tous les plans ?",
      a: "Sur la page Tarifs, la ligne est cochée pour Pro et Agency, pas pour Free ni Starter. Il n'y a pas de plan « Pro+ ». Les écrans Emails et Segmentation ne vérifient pas le plan à l'ouverture.",
    },
  ],
  "autopilote-workflows-relance-demande-devis-b2b": [
    {
      q: "Qu'est-ce que l'Autopilote de QuoteBuilder ?",
      a: "C'est le module de parcours automatiques, accessible dans le menu Automatisations par les administrateurs. Un parcours enchaîne sur un canvas des emails, des attentes, des conditions, des assignations et des changements de statut, à partir d'un déclencheur.",
    },
    {
      q: "Quels déclencheurs peut-on utiliser ?",
      a: "Trois : Soumission (une demande est envoyée), Abandon (une session avec email reste inactive le temps fixé, 1 heure par défaut) et Changement de statut (le statut d'une demande change, éventuellement vers un statut précis).",
    },
    {
      q: "Que contient le parcours installé par défaut ?",
      a: "Le Parcours demande envoie la confirmation avec le PDF et le brief commercial tout de suite, un rappel interne à 4 heures si la demande est encore au statut Nouveau, un email rassurant et une demande de photo à 24 heures et une relance douce à 72 heures si le dossier est toujours ouvert. Le Parcours abandon envoie une reprise de session 1 heure après la dernière activité, puis une seconde relance à 24 heures.",
    },
    {
      q: "Le prospect reçoit-il des relances après avoir signé ?",
      a: "Non, si le dossier passe à un statut clos comme Gagné ou Perdu. Les branches vérifient que le dossier est ouvert avant chaque message, et passer un dossier à un statut clos interrompt ses exécutions en attente.",
    },
    {
      q: "Peut-on modifier le texte des emails ?",
      a: "Oui. L'objet et le corps de chaque email se modifient dans Paramètres, rubrique Emails. Les variables comme le nom du contact, le lien de suivi ou le code PIN sont remplies à l'envoi.",
    },
    {
      q: "Les délais tiennent-ils compte des week-ends ?",
      a: "Non. Les attentes sont comptées en heures pleines, et le moteur passe toutes les 15 minutes. Une attente de 4 heures après une demande envoyée le vendredi à 18 h se termine le vendredi vers 22 h.",
    },
    {
      q: "Comment savoir si un email est bien parti ?",
      a: "Ouvrez le dossier, onglet Automatisations : chaque étape affiche Fait, En attente, Échec ou Ignoré. Sur le canvas du parcours, chaque email affiche aussi ses compteurs « ok » et « erreur ».",
    },
    {
      q: "Que se passe-t-il si je désactive le Parcours demande ?",
      a: "Si aucun parcours de soumission n'est actif, une demande envoyée depuis un funnel déclenche quand même la confirmation au prospect et le brief à l'adresse commerciale. Les rappels internes et les relances ne partent plus.",
    },
    {
      q: "L'Autopilote envoie-t-il des SMS ou fait-il des tests A/B ?",
      a: "Non. Les envois sont des emails en texte simple, avec un seul texte par étape. Il n'y a ni SMS, ni WhatsApp, ni LinkedIn, ni test A/B.",
    },
    {
      q: "Les relances d'abandon respectent-elles le RGPD ?",
      a: "Elles répondent à une action du prospect, qui a commencé une demande et donné son email, et restent liées à cette demande. Ne réutilisez pas ces adresses pour une campagne commerciale sans consentement marketing. La conservation des données reste à définir de votre côté.",
    },
  ],
  "google-ads-demande-devis-b2b-cout-par-client": [
    {
      q: "Quelle différence entre coût par devis et coût par client ?",
      a: "Le coût par devis divise la dépense publicitaire par le nombre de demandes reçues depuis les annonces. Le coût par client la divise par le nombre de dossiers passés au statut Gagné.",
    },
    {
      q: "Comment calculer le coût par client maximum acceptable ?",
      a: "Partez de la marge brute moyenne d'une affaire signée : c'est le coût par client à l'équilibre. Multipliez-le par votre taux de demandes gagnées pour obtenir le coût par devis maximum, puis par votre taux de clics transformés en demandes pour obtenir le coût par clic maximum.",
    },
    {
      q: "Comment Google Ads sait-il qu'une demande de devis a été signée ?",
      a: "Il ne le sait que si vous le lui renvoyez. Avec Google Ads connecté, QuoteBuilder envoie la conversion « Affaire gagnée » quand un dossier passe au statut Gagné, à condition que la demande d'origine porte un identifiant de clic Google.",
    },
    {
      q: "Qu'est-ce que le gclid et pourquoi est-il indispensable ?",
      a: "C'est l'identifiant de clic que Google ajoute à l'URL quand le marquage automatique est activé. Sans lui, la demande ne peut pas être rattachée à l'annonce, ni la conversion renvoyée.",
    },
    {
      q: "Faut-il des UTM si le gclid est présent ?",
      a: "Oui pour le coût par devis. Le `gclid` suffit à classer la demande en source Google Ads et à renvoyer les conversions, mais c'est le `utm_campaign` qui permet de rapprocher la demande du nom de campagne Google Ads et donc de sa dépense.",
    },
    {
      q: "QuoteBuilder envoie-t-il le montant du devis à Google Ads ?",
      a: "Non. Les conversions « Devis soumis » et « Affaire gagnée » partent sans valeur : on peut viser un coût par conversion, pas un retour sur dépense en valeur.",
    },
    {
      q: "Que se passe-t-il si la signature arrive plus de 90 jours après le clic ?",
      a: "Les actions créées par QuoteBuilder ont une fenêtre de 90 jours après clic. Une signature plus tardive reste visible dans QuoteBuilder, mais Google Ads ne la rattachera pas à l'annonce.",
    },
    {
      q: "Pourquoi mon coût par client change-t-il autant d'un mois à l'autre ?",
      a: "Parce que le nombre de clients est petit : avec deux ou trois signatures par mois, une affaire de plus ou de moins change tout. Jugez-le sur trois mois et pilotez au coût par devis entre-temps.",
    },
    {
      q: "Peut-on voir les campagnes sans connecter Google Ads ?",
      a: "Oui. Les demandes arrivées avec des UTM apparaissent dans l'onglet Campagnes des Statistiques, avec les devis et les gagnés. Il manque seulement la dépense, donc le coût par devis et le coût par client.",
    },
    {
      q: "QuoteBuilder peut-il créer ou optimiser mes campagnes Google Ads ?",
      a: "Non. Annonces, budgets et enchères se gèrent dans Google Ads. QuoteBuilder prépare le lien suivi et des mots-clés par métier, crée les deux actions de conversion et mesure les coûts.",
    },
  ],
  "rgpd-demande-devis-b2b-consentement-conservation": [
    {
      q: "Faut-il une case à cocher obligatoire pour envoyer une demande de devis ?",
      a: "Non. Traiter les données pour répondre à la demande ne repose pas sur le consentement. Une case obligatoire pour pouvoir envoyer la demande serait même une mauvaise pratique si elle sert aussi à la prospection.",
    },
    {
      q: "La case de consentement de QuoteBuilder est-elle cochée par défaut ?",
      a: "Non. Elle est décochée et facultative. Le prospect peut envoyer sa demande sans la cocher.",
    },
    {
      q: "Peut-on modifier le texte de la case de consentement ?",
      a: "Pas aujourd'hui. Utilisez le sous-titre de l'étape Vos coordonnées pour la mention d'information.",
    },
    {
      q: "Combien de temps garder les données d'un prospect ?",
      a: "Le repère de la CNIL est de trois ans après la collecte ou le dernier contact venant du prospect. Les devis signés et factures suivent les règles comptables, dix ans pour les pièces justificatives.",
    },
    {
      q: "QuoteBuilder supprime-t-il les vieux dossiers automatiquement ?",
      a: "Non. Il n'y a pas de purge automatique. Prévoyez une revue régulière et anonymisez les dossiers concernés.",
    },
    {
      q: "Comment effacer les données d'un prospect qui le demande ?",
      a: "Un administrateur va dans Paramètres, section Données personnelles (RGPD), saisit l'email et clique sur Anonymiser. Vérifiez ensuite les fichiers joints, les notes internes et les outils où la demande a été transmise.",
    },
    {
      q: "Le bouton Anonymiser supprime-t-il les plans et photos ?",
      a: "Non. Les fichiers joints restent sur le dossier. Traitez-les à part.",
    },
    {
      q: "Peut-on envoyer une campagne à un prospect qui n'a pas coché la case ?",
      a: "Non. QuoteBuilder l'écarte automatiquement de l'envoi, et il est compté parmi les ignorés dans le bilan de la campagne.",
    },
    {
      q: "Google Analytics sur le funnel demande-t-il un consentement ?",
      a: "Selon la CNIL, oui pour les traceurs non exemptés. QuoteBuilder n'affiche pas de bandeau : laissez les champs Suivi Google vides ou faites gérer le consentement par votre propre outil.",
    },
    {
      q: "Une adresse contact@entreprise.fr est-elle une donnée personnelle ?",
      a: "Une adresse générique qui désigne une société n'est pas soumise aux règles de prospection rappelées par la CNIL. Une adresse nominative, prenom.nom@entreprise.fr, est une donnée personnelle.",
    },
  ],
  "webhook-demande-devis-crm-signature-hmac": [
    {
      q: "Quel événement le webhook de QuoteBuilder envoie-t-il ?",
      a: "Un seul : `quote.submitted`, quand une demande est envoyée depuis un funnel ou transmise par le plugin WordPress en envoi direct. Il n'y a pas d'événement pour les changements de statut.",
    },
    {
      q: "Comment vérifier la signature d'un webhook QuoteBuilder ?",
      a: "Calculez le HMAC SHA-256 du corps brut avec votre secret, en hexadécimal, et comparez-le à l'en-tête `X-QuoteBuilder-Signature` avec une fonction à temps constant. S'ils diffèrent, refusez la requête.",
    },
    {
      q: "Pourquoi ma signature ne correspond-elle jamais ?",
      a: "Le plus souvent, le corps a été parsé puis reconstruit avant le calcul. Signez les octets reçus, sans les transformer. Vérifiez ensuite le secret, sans espace en trop.",
    },
    {
      q: "QuoteBuilder renvoie-t-il un webhook en échec ?",
      a: "Non. Chaque webhook actif reçoit un seul envoi par demande. Un échec apparaît dans le tableau des envois, et se rattrape par l'API `/api/leads`.",
    },
    {
      q: "Peut-on tester un webhook sans vraie demande ?",
      a: "Il n'y a pas de bouton de test. Envoyez une demande depuis votre funnel avec une adresse interne, puis regardez la ligne correspondante dans le tableau des envois.",
    },
    {
      q: "Les fichiers joints sont-ils envoyés au CRM ?",
      a: "Non. Le JSON donne leur nom et leur chemin de stockage, qui n'est pas un lien public. Les fichiers se consultent dans le dossier QuoteBuilder.",
    },
    {
      q: "Les réponses arrivent-elles avec leurs libellés ?",
      a: "Non, avec les valeurs des options. « Ce trimestre » arrive sous la forme `quarter`. Prévoyez une table de correspondance côté CRM.",
    },
    {
      q: "Une demande créée par l'API déclenche-t-elle le webhook ?",
      a: "Non. Seuls les envois de funnel et du plugin WordPress en envoi direct déclenchent `quote.submitted`. Ce que vous créez par `/api/leads`, vous le connaissez déjà.",
    },
    {
      q: "Comment faire remonter un statut gagné du CRM vers QuoteBuilder ?",
      a: "Appelez `PATCH /api/leads/{id}` avec `{\"status\": \"won\"}` et votre clé API. Le dossier change de statut et les automatisations « Statut modifié » se déclenchent.",
    },
    {
      q: "Peut-on changer l'URL ou le secret d'un webhook ?",
      a: "Pas directement. Ajoutez un nouveau webhook, vérifiez qu'il reçoit bien, puis désactivez l'ancien.",
    },
  ],
  "mesurer-funnel-devis-b2b-entonnoir-statistiques": [
    {
      q: "Quelles sont les étapes d'un entonnoir de demande de devis ?",
      a: "Sept marches : Visiteurs, Commencé, Email, Complété, Devis, Rappelé, Gagné. Les quatre premières mesurent le funnel, la cinquième la conversion, les deux dernières l'équipe commerciale.",
    },
    {
      q: "Comment calcule-t-on le taux de conversion d'un funnel de devis ?",
      a: "Demandes envoyées divisées par visiteurs, sur la même période et le même funnel. Pour trouver où agir, calculez aussi le taux de passage de chaque marche.",
    },
    {
      q: "Où voir l'entonnoir complet dans QuoteBuilder ?",
      a: "Dans le rapport PDF de la page Statistiques, rubrique « Tunnel de conversion ». L'onglet Vue affiche les indicateurs principaux : visites, devis, conversion, CA et rappel.",
    },
    {
      q: "Que compte la marche Rappelé ?",
      a: "Les demandes au statut Contacté, En cours, En attente ou Gagné. Une demande passée directement à Perdu n'est pas comptée.",
    },
    {
      q: "Pourquoi mes affaires gagnées des 30 derniers jours paraissent-elles si faibles ?",
      a: "Parce que la période compte les demandes créées pendant ces 30 jours. Une affaire signée hier sur une demande de juillet n'y figure pas. Comparez des mois plus anciens.",
    },
    {
      q: "Le chiffre d'affaires affiché est-il mon chiffre d'affaires signé ?",
      a: "Non. C'est une estimation à partir des lignes choisies : milieu de la fourchette multiplié par la quantité, et une valeur moyenne pour les demandes sans prix.",
    },
    {
      q: "Faut-il Google Analytics pour mesurer un funnel QuoteBuilder ?",
      a: "Non. Les Statistiques fonctionnent seules. GA4 et Tag Manager se branchent dans l'onglet Suivi Google si vous voulez retrouver les événements dans vos outils.",
    },
    {
      q: "Peut-on savoir quelle campagne Google Ads apporte des clients ?",
      a: "Oui, si Google Ads est connecté : l'onglet Campagnes affiche le coût d'une demande et d'un client, et la conversion « affaire gagnée » est envoyée à Google Ads quand vous posez le statut Gagné.",
    },
    {
      q: "Peut-on faire un test A/B sur un funnel ?",
      a: "Pas d'outil intégré. Créez un second funnel avec la variante, envoyez une partie du trafic vers chacun, et comparez-les dans l'onglet Funnels.",
    },
    {
      q: "Combien de temps attendre avant de juger un changement ?",
      a: "Au moins 30 jours, et assez de visiteurs pour que les écarts dépassent quelques unités. Avec de petits volumes, prenez plusieurs mois.",
    },
  ],
  "demande-devis-abandonnee-funnel-reprise": [
    {
      q: "Qu'est-ce qu'une demande de devis abandonnée ?",
      a: "Un parcours commencé dans votre funnel puis laissé en plan avant l'envoi. Le prospect a répondu à une partie des questions sans transmettre sa demande.",
    },
    {
      q: "Peut-on relancer un prospect qui n'a laissé aucun email ?",
      a: "Non. La session reste visible dans la page Sessions, avec son avancement et ses réponses, mais sans moyen de contact.",
    },
    {
      q: "Quand QuoteBuilder propose-t-il de sauvegarder la configuration ?",
      a: "À partir de la deuxième étape du funnel, tant que la demande n'est pas envoyée, avec un bandeau facultatif « Prénom » et « Email pour recevoir le récap ».",
    },
    {
      q: "Au bout de combien de temps part la relance ?",
      a: "Après une heure d'inactivité dans le parcours abandon par défaut, puis une seconde après vingt-quatre heures. Le seuil se règle dans le déclencheur, en heures. Les automatisations sont examinées toutes les quinze minutes.",
    },
    {
      q: "Le prospect doit-il tout ressaisir ?",
      a: "Non. Le lien de reprise rouvre le funnel avec ses réponses déjà données. S'il a envoyé sa demande entre-temps, il arrive sur la page de suivi.",
    },
    {
      q: "Que se passe-t-il si le prospect envoie sa demande avant la seconde relance ?",
      a: "La séquence s'arrête. Une automatisation déclenchée par un abandon ne continue pas sur une session envoyée.",
    },
    {
      q: "Une session abandonnée apparaît-elle dans le pipeline ?",
      a: "Pas pour le funnel hébergé : elle reste dans la page Sessions jusqu'à l'envoi. Avec le plugin WordPress, un email valide crée un dossier au statut Commencée.",
    },
    {
      q: "Combien de relances envoie le plugin WordPress ?",
      a: "Une seule, deux heures après la saisie de l'email, tant que le dossier est au statut Commencée. Un dossier jamais envoyé est supprimé au bout de trente jours.",
    },
    {
      q: "Le montant « récupérable » du rapport Statistiques est-il fiable ?",
      a: "C'est un plafond : abandons avec email multipliés par le panier moyen. Pour une estimation réaliste, appliquez vos taux de reprise et de signature.",
    },
    {
      q: "Faut-il un consentement pour relancer un professionnel ?",
      a: "La CNIL admet l'intérêt légitime pour une prospection en rapport avec la profession, avec information à la collecte et opposition simple. Informez clairement au moment où l'email est saisi.",
    },
  ],
  "fourchette-prix-indicative-demande-devis-b2b": [
    {
      q: "Faut-il afficher un prix sur un site B2B ?",
      a: "Ce n'est pas obligatoire, mais les tests du Nielsen Norman Group montrent que l'absence totale de prix frustre les acheteurs B2B. Une fourchette ou quelques scénarios chiffrés donnent un ordre de grandeur.",
    },
    {
      q: "Une fourchette affichée m'engage-t-elle ?",
      a: "Elle n'a pas la valeur d'un devis accepté. Présentez-la comme indicative, comme le fait le PDF de QuoteBuilder. Pour une question juridique précise, consultez un professionnel du droit.",
    },
    {
      q: "Quelle différence entre fourchette produit et fourchette de règle ?",
      a: "La fourchette produit est unitaire : multipliée par la quantité, elle donne le montant de chaque ligne. La fourchette de règle, si vous la saisissez, devient la fourchette indicative du dossier ; sinon, c'est la somme des lignes.",
    },
    {
      q: "Où saisir la fourchette d'une règle ?",
      a: "Sur la page Règles, dans le formulaire d'édition de la règle, avec les champs « Prix min » et « Prix max », puis « Enregistrer la règle ». La fenêtre de création ne propose pas ces champs.",
    },
    {
      q: "Le prospect voit-il le total multiplié par la quantité ?",
      a: "Oui. Dans son espace prospect et dans le PDF, chaque ligne affiche prix × quantité. À l'étape Personnalisation, il voit le prix unitaire.",
    },
    {
      q: "Peut-on afficher un prix fixe plutôt qu'une fourchette ?",
      a: "Oui. À la création du produit, choisissez « Prix fixe » : le même montant est enregistré en minimum et en maximum. En import CSV, mettez la même valeur dans `price_min` et `price_max`.",
    },
    {
      q: "Les prix sont-ils HT ou TTC ?",
      a: "QuoteBuilder ne gère pas la TVA et n'affiche ni HT ni TTC. Les montants sont ceux que vous saisissez. Indiquez vous-même « HT » dans la description du produit ou de la règle si c'est le cas.",
    },
    {
      q: "Les options d'un produit modifient-elles la fourchette ?",
      a: "Non. Le calcul ne repose que sur le prix minimum, le prix maximum et la quantité. Pour une option qui change vraiment le prix, créez un produit séparé.",
    },
    {
      q: "La fourchette influence-t-elle le score Hot, Warm ou Cold ?",
      a: "Non. Le score suit une formule fixe qui ne lit pas les prix.",
    },
    {
      q: "Que voit le prospect si je ne mets aucun prix ?",
      a: "« Sur devis », partout où la fourchette indicative apparaît. Expliquez alors dans la description ce qui détermine le prix.",
    },
  ],
  "funnel-devis-chat-ia-vs-formulaire-etapes-b2b": [
    {
      q: "Quels types de funnel existent dans QuoteBuilder ?",
      a: "Trois : Formulaire, Chat IA et Catalogue. Le type se choisit à la création du funnel.",
    },
    {
      q: "Existe-t-il un template pensé pour le chat ?",
      a: "Oui, « Brief chat » dans la famille rayonnage. Il crée un funnel « Chat rayonnage » avec un bloc type d'espace, surface ou volume, contraintes, puis suggestions, personnalisation et coordonnées.",
    },
    {
      q: "L'agent invente-t-il des produits ou des prix ?",
      a: "Il ne doit citer que ce que renvoie votre catalogue. Les prix sont les fourchettes min et max de vos fiches. Il ne peut pas présenter de configuration sans avoir consulté le catalogue ou les règles.",
    },
    {
      q: "Les règles de suggestion fonctionnent-elles en mode chat ?",
      a: "Oui. L'agent évalue les mêmes règles Si/Alors sur le brief en cours : trois blocs au maximum, par priorité, conditions toutes vraies.",
    },
    {
      q: "Si une réponse existe à la fois dans le formulaire et dans le chat, laquelle compte ?",
      a: "Celle du formulaire, pour une même clé. Les valeurs extraites du chat complètent les clés que le formulaire n'a pas remplies.",
    },
    {
      q: "Le commercial peut-il relire la conversation sur la fiche devis ?",
      a: "Non. La fiche affiche les réponses structurées du dossier, les produits, les fichiers et la fourchette indicative. La conversation reste attachée à la session du prospect.",
    },
    {
      q: "Le chat améliore-t-il le score Hot / Warm / Cold ?",
      a: "Pas en soi. Le score est une formule fixe calculée à la soumission sur les réponses fusionnées. Il compte si les bonnes clés sont remplies (surface en nombre, type de projet, contraintes, longueur du besoin).",
    },
    {
      q: "Peut-on faire parler l'agent sur un funnel de type Formulaire ?",
      a: "Oui, avec le module « Discuter de votre projet ». Le funnel garde son type Formulaire ; le prospect discute, puis renseigne ses coordonnées et envoie sa demande.",
    },
    {
      q: "L'agent peut-il prendre une commande ou un paiement ?",
      a: "Non. Il prépare un brief de devis et collecte les coordonnées. Pas de commande, pas de paiement, pas d'envoi de devis à sa place.",
    },
    {
      q: "Le prospect peut-il envoyer un plan pendant le chat ?",
      a: "Pas dans la conversation. Le plan se joint à l'étape Personnalisation (PDF ou image, 10 Mo au maximum) ou depuis la page prospect après l'envoi de la demande.",
    },
  ],
  "regles-suggestion-produits-funnel-devis-b2b": [
    {
      q: "Une règle de suggestion peut-elle faire sauter une étape du funnel ?",
      a: "Non. Les étapes et les questions suivent un ordre fixe. Les règles Si/Alors choisissent seulement les produits proposés à l'écran « Solutions recommandées ».",
    },
    {
      q: "Peut-on combiner plusieurs conditions dans une règle ?",
      a: "Oui, et elles doivent toutes être vraies. Pour exprimer un OU, créez deux règles ou utilisez « est parmi » sur une même question.",
    },
    {
      q: "Combien de suggestions le prospect voit-il ?",
      a: "Au maximum trois blocs, c'est-à-dire trois règles : celles qui correspondent à ses réponses, triées par priorité décroissante. Chaque bloc peut contenir plusieurs produits.",
    },
    {
      q: "Quelle différence entre « inclut » et « est parmi » ?",
      a: "« Inclut » pour une question à choix multiples : la valeur doit faire partie des réponses cochées. « Est parmi » pour une question à réponse unique : la réponse doit faire partie de votre liste.",
    },
    {
      q: "Que se passe-t-il si aucune règle ne correspond ?",
      a: "L'écran n'a rien à proposer pour ce prospect. C'est pour ça qu'on garde une règle filet « pour tout le monde » en priorité 0.",
    },
    {
      q: "Les règles modifient-elles le prix ou le score ?",
      a: "Non. Le prix reste une fourchette indicative min-max en euros entiers. Le score Hot / Warm / Cold est une formule fixe calculée à la soumission, non configurable.",
    },
    {
      q: "Peut-on proposer un kit ou un pack ?",
      a: "Il n'y a pas de kits ni de bundles dans QuoteBuilder. Mettez plusieurs produits dans la même règle, ou faites d'un complément une option du produit principal.",
    },
    {
      q: "D'où viennent les produits liés ?",
      a: "Pour une boutique WooCommerce reliée par le plugin WordPress, des up-sells, cross-sells et produits de même catégorie définis dans Woo. Le bloc « Souvent demandé avec » en affiche de 1 à 8, 4 par défaut.",
    },
    {
      q: "Qui peut créer ou modifier les règles ?",
      a: "Un administrateur de l'espace, dans Produits, onglet Règles. Les autres membres ne gèrent pas les règles.",
    },
    {
      q: "Le mode chat utilise-t-il les mêmes règles ?",
      a: "Oui pour l'évaluation : les réponses extraites de la conversation comptent. Si une réponse existe aussi dans le formulaire, c'est celle du formulaire qui prime.",
    },
  ],
  "notes-internes-dossier-devis-equipe-b2b": [
    {
      q: "Qu'est-ce qu'une note interne sur un dossier devis ?",
      a: "Un texte d'équipe collé au dossier (risque, décision, synthèse d'appel, handoff), visible à l'équipe seulement, séparé du fil prospect. Dans QuoteBuilder : notes sur l'enregistrement devis, pas un chat interne inventé.",
    },
    {
      q: "Quelle différence avec le fil de l'espace prospect ?",
      a: "Le fil prospect est un chat plat visible au prospect (clarifs, options, photos). Les réponses équipe n'y affichent pas de nom d'auteur. Les notes internes, elles, ne doivent pas y apparaître. Feature : espace prospect.",
    },
    {
      q: "Et la validation interne / les relecteurs ?",
      a: "La validation interne est votre garde-fou avant envoi. Les relecteurs (ex. Responsable technique, Directeur financier) ont chacun un lien 30 jours : Valider le dossier ou Modifications + commentaire + budget max. Les notes internes préparent ces arbitrages ; elles ne les remplacent pas.",
    },
    {
      q: "QuoteBuilder a-t-il un chat interne d'équipe ?",
      a: "Non au sens « module chat interne temps réel ». Il y a des notes internes sur le dossier, un fil prospect plat, et le flux relecteurs. Gardez Slack pour l'alerte, le dossier pour la mémoire.",
    },
    {
      q: "Peut-on ancrer un commentaire sur une ligne du devis ?",
      a: "Non dans le modèle produit actuel. Pas de commentaires ancrés aux lignes. Fil plat + notes sur le dossier + relecture Valider / Modifications.",
    },
    {
      q: "Qui voit la dernière consultation du prospect ?",
      a: "Une dernière vue relative apparaît côté fiche devis commercial / équipe. Ce n'est pas un open-tracking avancé dans l'espace prospect. Les notes internes aident à décider quoi faire après ce signal.",
    },
    {
      q: "Comment lier notes internes, score et assignation ?",
      a: "Le score Hot / Warm / Cold trie à la soumission (formule fixe). L'assignation donne un propriétaire. Les notes portent le contexte que le score n'encode pas (urgence perçue, risque marge, concurrent). Pas de SLA produit ; le délai reste une règle d'équipe.",
    },
    {
      q: "Que faire du contexte capté au téléphone ou sur WhatsApp ?",
      a: "Le convertir le jour même en brief (préfill / funnel) puis écrire 3-5 lignes en notes internes.",
    },
    {
      q: "Comment estimer le coût du contexte hors dossier ?",
      a: "Minutes de re-brief × volume × taux, plus une part de dossiers morts / clarifs faute de contexte × panier. L'estimateur coût du contexte hors dossier devis le fait en local dans le navigateur.",
    },
    {
      q: "Accepté, Signé, versions, TVA : ça change les notes internes ?",
      a: "Non. Accepté / Signé ne sont pas des statuts CRM ; Gagné / Perdu sont posés par le commercial ; pas de versions Vn ; pas d'acceptation en ligne prospect ; pas de TVA stockée (fourchette min-max). Les notes internes restent la mémoire équipe.",
    },
  ],
  "transfert-brief-commercial-technique-devis-b2b": [
    {
      q: "Faut-il un outil de chat interne pour le handoff devis ?",
      a: "Non. Il faut un brief structuré partagé (funnel / dossier) et des règles d’équipe. Un chat sans brief multiplie les allers-retours. QuoteBuilder n’ajoute pas un module chat interne.",
    },
    {
      q: "Que doit contenir un brief commercial pour le technique ?",
      a: "Type de projet, grandeurs utiles, accès, contraintes, besoin rédigé, photos si pertinentes, options déjà évoquées, owner et prochaine action. Le score aide à ordonner ; il ne remplace pas les photos métier.",
    },
    {
      q: "Le score Hot / Warm / Cold lit-il les photos ?",
      a: "Non. Sur QuoteBuilder, la formule fixe ignore photos, zone, urgence et contexte. Elle lit notamment surface, load, access, project_type, constraints et la longueur du besoin. Elle n’est pas configurable. Pas de SLA produit.",
    },
    {
      q: "Comment éviter que le technique rappelle le prospect « comme le commercial » ?",
      a: "Checklist handoff obligatoire avant assignation. Si un champ manque, le commercial complète (ou envoie le lien funnel) avant de passer le dossier.",
    },
    {
      q: "Les relecteurs remplacent-ils la validation interne ?",
      a: "Non. Les relecteurs (Valider / Modifications + commentaire + budget max) aident côté prospect multi-décideurs, sur un chat fil plat. La validation interne est le garde-fou avant envoi (marge, faisabilité, accès).",
    },
    {
      q: "Peut-on commenter une ligne précise du devis avec le prospect ?",
      a: "Pas via des commentaires ancrés aux lignes dans QuoteBuilder. Le fil est plat. Pour une variante, mieux vaut une option ou une variante claire qu’un fil de messages sur une ligne.",
    },
    {
      q: "Qui pose le statut Gagné ?",
      a: "Le commercial (ou le rôle commercial défini dans l’équipe). Pas une acceptation en ligne. « Accepté » n’est qu’un libellé d’espace prospect quand le devis est Gagné ; « Signé » n’est qu’un libellé de graphique de stats.",
    },
    {
      q: "Comment mesurer le coût des mauvais handoffs ?",
      a: "Comptez les devis / mois concernés, le % de handoffs sales, les minutes perdues, le taux horaire, le % de devis annulés ou repris faute de brief, et un panier moyen. L’estimateur coût handoff formalise le calcul, indicatif et local.",
    },
    {
      q: "Faut-il un funnel différent pour le commercial et pour le technique ?",
      a: "Non. Même brief. Le commercial capture ; le technique consomme. Les étapes produit restent en ordre fixe ; les Si/Alors orientent surtout les suggestions produits.",
    },
    {
      q: "Comment démarrer sans refondre toute l’orga ?",
      a: "Une checklist handoff, un funnel sur la page devis et une règle « pas d’assignation technique sans brief minimum » suffisent pour un pilote. Mesurez les minutes de re-qualif avant et après.",
    },
  ],
  "sources-demande-devis-b2b-funnel-api": [
    {
      q: "Quelles sont les vraies sources d'une demande dans QuoteBuilder ?",
      a: "Funnel public, /api/leads, plugins / intégrations (WordPress, Woo, Shopify, etc.), devis démarrés côté plugin (statut Commencée), agent chat, ou un commercial qui remplit / envoie un lien préfill vers le funnel. Pas d'écran « créer devis » manuel, pas d'import de devis.",
    },
    {
      q: "Pourquoi refuser la saisie manuelle si mon équipe est habituée à Excel ?",
      a: "Parce que la resaisie déforme le brief et recrée deux vérités. L'habitude Excel est confortable pour l'émetteur, coûteuse pour le chiffrage et le prospect. Le préfill + funnel garde le geste humain sans casser le schéma.",
    },
    {
      q: "Un commercial peut-il joindre un PDF reçu par mail au dossier ?",
      a: "Dans QuoteBuilder, le commercial ne joint pas de fichiers au dossier. Les pièces jointes viennent des uploads prospect (funnel ou espace prospect). La bonne pratique : renvoyer le prospect (ou le préfill) pour qu'il dépose le plan au bon endroit.",
    },
    {
      q: "Faut-il tuer le téléphone et WhatsApp ?",
      a: "Non. Il faut les convertir en brief structuré le jour même (script + préfill + funnel). Voir téléphone / WhatsApp vers brief et l'estimateur demandes orales.",
    },
    {
      q: "Quelle différence entre centraliser multi-canaux et ce guide « sources » ?",
      a: "Centraliser traite le chaos des boîtes et canaux humains. Ici on précise le mécanisme d'entrée technique (funnel / API / plugin / préfill) et pourquoi la double saisie est l'ennemi, y compris dans un CRM.",
    },
    {
      q: "Le score Hot / Warm / Cold dépend-il de la source ?",
      a: "Le score se calcule à la soumission sur des champs du brief (surface, load, access, project_type, constraints, longueur du besoin). Il ignore photos, zone, urgence. Il n'est pas configurable et il n'y a pas de SLA produit. Une source pauvre produit souvent un brief trop court, donc un score peu discriminant.",
    },
    {
      q: "Peut-on importer un historique de devis PDF ?",
      a: "Il n'y a pas d'écran d'import de devis dans QuoteBuilder. Pour le futur, faites naître les demandes dans le funnel / API / plugins. L'historique PDF reste de l'archive métier hors ce modèle.",
    },
    {
      q: "Comment chiffrer le coût de la double saisie ?",
      a: "Minutes perdues × volume × taux chargé, plus une part d'opportunités mortes ou reparties en clarification. L'estimateur coût double saisie devis le fait en local dans le navigateur.",
    },
    {
      q: "Formulaire WordPress ou funnel : que choisir ?",
      a: "Un formulaire contact pauvre recrée la double saisie. Un funnel (ou un pont plugin vers QuoteBuilder) capture le brief. Comparer formulaire vs funnel, recevoir les demandes WordPress, et l'estimateur formulaire vs funnel WP.",
    },
    {
      q: "Validité, versions, signature, kits, TVA : ça joue sur les sources ?",
      a: "Non. Le produit ne les porte pas. Pas de date de validité, pas de versions Vn, pas de signature en ligne prospect, pas de kits (options, variantes, produits liés), pas de TVA stockée (fourchette min-max). Le funnel n'a pas de branchement conditionnel : ordre fixe, Si/Alors pour suggérer des produits. Accepté / Signé ne sont pas des statuts CRM. La priorité sources reste : naître juste, une fois, sans resaisie.",
    },
  ],
  "telephone-whatsapp-vers-brief-devis-b2b": [
    {
      q: "Faut-il interdire WhatsApp pour les devis B2B ?",
      a: "Non. Il faut capturer ce qui arrive sur WhatsApp dans un brief structuré (checklist + dossier), puis continuer sur funnel, devis et espace prospect. Interdire le canal sans alternative fait juste passer les leads ailleurs.",
    },
    {
      q: "QuoteBuilder lit-il WhatsApp ou le téléphone ?",
      a: "Non. Ce n’est pas un client WhatsApp ni un standard téléphonique. L’outil sert après (ou pendant) la capture : funnel, préremplissage, dossier scoré, chiffrage, espace prospect, relances.",
    },
    {
      q: "Que mettre absolument dans un brief oral ?",
      a: "Type de projet ou d’intervention, accès, les grandeurs utiles (surface, charge, etc.), contraintes, un besoin rédigé, contact et owner. Photos et urgence sont utiles au métier et au triage, même si le score produit ne les lit pas.",
    },
    {
      q: "Comment éviter la double saisie après un appel ?",
      a: "Une checklist unique, puis le funnel. Lien prérempli, ou le commercial remplit le funnel via le lien préfill. Pas de copier-coller WhatsApp, puis Excel, puis CRM, puis devis.",
    },
    {
      q: "Le score Hot / Warm / Cold remplace-t-il le feeling du commercial ?",
      a: "Non. Sur QuoteBuilder, c’est une formule fixe (surface, load, access, project_type, constraints, longueur du besoin). Elle ordonne. Le commercial et les règles d’équipe tranchent encore, surtout pour l’urgence et la zone.",
    },
    {
      q: "Peut-on préremplir un funnel après un appel ?",
      a: "Oui, via des paramètres d’URL quand les champs sont déjà connus. Sinon, un lien funnel vide à faire compléter par le prospect.",
    },
    {
      q: "Comment gérer les photos envoyées sur WhatsApp ?",
      a: "Demandez au prospect de les déposer via le funnel ou sa page de suivi, et évitez de chiffrer sur un fil de messages non classés.",
    },
    {
      q: "Quel statut CRM après un premier appel ?",
      a: "Souvent Nouveau ou Contacté selon la convention d’équipe, puis En cours dès qu’un owner chiffre. Gagné et Perdu uniquement en clôture commerciale. Liste fixe : Commencée, Nouveau, Contacté, En cours, Gagné, Perdu, En attente.",
    },
    {
      q: "Comment mesurer le coût des oraux non capturés ?",
      a: "Comptez les demandes téléphone + WhatsApp + SMS par mois, le pourcentage sans brief structuré, les minutes de re-qualification, et une hypothèse de deals perdus. L’estimateur formalise le calcul, indicatif et local.",
    },
    {
      q: "Faut-il un funnel différent pour le téléphone et le web ?",
      a: "Non. Mêmes questions cœur. Le téléphone est un canal d’entrée. Le funnel, ou la checklist alignée, est le format de brief.",
    },
  ],
  "statuts-pipeline-devis-b2b": [
    {
      q: "Combien de statuts faut-il dans un pipeline devis B2B ?",
      a: "Sept suffisent si chacun a une règle claire : Commencée, Nouveau, Contacté, En cours, En attente, Gagné, Perdu. Au-delà, vous recréez souvent des nuances qui devraient vivre dans la prochaine action.",
    },
    {
      q: "Pourquoi « Accepté » n’est pas un statut CRM ?",
      a: "Parce que c’est un libellé d’espace prospect quand le devis est déjà Gagné. Ce n’est pas une étape intermédiaire que le prospect active pour pousser le CRM.",
    },
    {
      q: "Et « Signé » ?",
      a: "Un libellé de graphique de stats, pas une colonne CRM, pas une preuve de signature électronique prospect dans le produit.",
    },
    {
      q: "Qui pose Gagné et Perdu ?",
      a: "Le commercial (ou le process interne). Pas une acceptation en ligne automatique du prospect. Les relecteurs valident le dossier ou demandent des Modifications ; ils ne remplacent pas la décision commerciale.",
    },
    {
      q: "Quelle différence entre En cours et En attente ?",
      a: "En cours : le ballon est chez vous. En attente : chez le client ou un tiers, avec une date de revue. Sans cette distinction, tout devient un parking.",
    },
    {
      q: "Le score Hot / Warm / Cold remplace-t-il le statut ?",
      a: "Non. Le score trie et priorise. Le statut dit où en est le deal dans le cycle. Dans QuoteBuilder le score suit une formule fixe (surface, load, access, project_type, constraints, longueur du besoin) ; il ignore photos, zone, urgence ; il n’est pas configurable et n’embarque pas de SLA produit.",
    },
    {
      q: "Faut-il un statut « Vu » quand le prospect ouvre le devis ?",
      a: "Non. Une dernière consultation relative est un indice utile, pas un statut. Posez plutôt En attente / En cours avec une prochaine action.",
    },
    {
      q: "Comment forcer les sorties Perdu sans casser le moral ?",
      a: "Ritualisez : revue hebdo, âge max, motif court, et rappel que Perdu libère du temps pour les Hot. Montrez le coût des fantômes avec l’estimateur.",
    },
    {
      q: "Les relecteurs changent-ils le statut CRM ?",
      a: "Ils aident le circuit client (Valider / Modifications, badges, notifications). Le passage Gagné / Perdu reste une décision commerciale. Pas de signature prospect, pas de commentaires ancrés aux lignes.",
    },
    {
      q: "Combien de temps pour assainir un pipeline gonflé ?",
      a: "Souvent deux semaines pour le vocabulaire, le ménage des plus vieux, et la première vraie revue. Le maintien est hebdomadaire : sans rituel, les fantômes reviennent.",
    },
  ],
  "tva-ht-ttc-devis-b2b-france": [
    {
      q: "Quelle différence entre HT et TTC sur un devis ?",
      a: "Le HT est le montant avant TVA. Le TTC est HT + TVA. En B2B on négocie souvent en HT, mais le client regarde aussi le TTC pour son budget cash.",
    },
    {
      q: "Comment calculer la TVA à partir du HT ?",
      a: "Formule indicative : TVA = HT × taux. Exemple à 20 % : 1 000 € HT → 200 € de TVA. Le taux exact dépend de votre situation : validez-le avec votre expert-comptable.",
    },
    {
      q: "Comment retrouver le HT à partir d’un TTC ?",
      a: "Formule indicative : HT = TTC ÷ (1 + taux). Exemple à 20 % : 1 200 € TTC → 1 000 € HT. Utilisez le calculateur TVA devis HT/TTC pour éviter les erreurs de virgule.",
    },
    {
      q: "Quels taux de TVA mettre sur un devis en France ?",
      a: "Les taux courants qu’on croise sont notamment 20 %, 10 %, 5,5 %, 2,1 %, et parfois 0 % / exonération selon les cas. Ce n’est pas une liste à appliquer au hasard : le bon taux dépend de la prestation et du contexte. Demandez conseil à votre expert-comptable.",
    },
    {
      q: "Peut-on mélanger plusieurs taux sur un même devis ?",
      a: "Oui, c’est fréquent. Bonne pratique générale, hors QuoteBuilder : le taux sur chaque ligne, et une ventilation de la TVA par taux en bas de page. QuoteBuilder ne fait pas cette ventilation. Il affiche une fourchette indicative. Les prix se saisissent au centime et s'affichent arrondis à l'euro dès 1 € (sous 1 €, les centimes restent).",
    },
    {
      q: "Que mettre en cas d’exonération ou d’autoliquidation ?",
      a: "Uniquement le libellé validé par votre expert-comptable ou votre avocat. Ne recopiez pas une phrase trouvée en ligne. Sur votre modèle de devis, figez ce texte. Dans QuoteBuilder, le pied de page du PDF est fixe : les mentions vont sur votre devis définitif. Il n’y a pas de champ SIRET ni de numéro de TVA.",
    },
    {
      q: "L’acompte se calcule sur le HT ou le TTC ?",
      a: "Sur la base que vous écrivez. Choisissez une règle, notez-la (« 30 % TTC à la commande » ou « 30 % du HT »), et alignez facturation et encaissement.",
    },
    {
      q: "Un logiciel de devis choisit-il le bon taux tout seul ?",
      a: "Le taux applicable se valide avec votre expert-comptable. Une bonne pratique générale, hors QuoteBuilder, est de porter un taux par ligne et de ventiler la TVA. QuoteBuilder n’a pas de champ taux : la fiche, l’espace prospect (« Total indicatif ») et le PDF (« Fourchette indicative ») montrent une fourchette minimum / maximum. Les prix se saisissent au centime et s'affichent arrondis à l'euro dès 1 € (sous 1 €, les centimes restent). Le calculateur TVA devis HT/TTC applique le taux que vous saisissez, dans le navigateur.",
    },
    {
      q: "Que faire si le prospect ne comprend que le TTC ?",
      a: "Sur un devis classique, montrez le HT, la TVA et le TTC. En réunion, convertissez son budget TTC en HT maximum avec le calculateur. Sur un dossier QuoteBuilder, le nombre à l’écran est une fourchette indicative : dites ce que ce minimum et ce maximum recouvrent.",
    },
    {
      q: "Par quoi commencer demain matin ?",
      a: "Ouvrez trois devis récents. Vérifiez qu’aucune ligne ne mélange HT et TTC, que la ventilation de TVA est lisible s’il y a plusieurs taux, et faites valider les libellés sensibles par votre expert-comptable. Sur QuoteBuilder, vérifiez que la fourchette min-max se lit pareil sur la fiche, dans l’espace prospect et sur le PDF, et sachez que le pied de page du PDF est fixe. Le prospect a son lien. Chaque relecteur reçoit le sien, valable 30 jours, vers la même page.",
    },
  ],
  "visite-technique-avant-devis-b2b": [
    {
      q: "Faut-il toujours une visite technique avant un devis B2B ?",
      a: "Non. Seulement quand le risque de mal chiffrer (ou de mal diagnostiquer) dépasse le coût du déplacement, ou quand la visite est le service (dépannage). Sinon, brief, photos et hypothèses écrites suffisent souvent pour un indicatif.",
    },
    {
      q: "Comment un funnel réduit-il les déplacements inutiles ?",
      a: "En collectant type d’intervention, accès, photos, urgence, type de client et zone avant le rappel. Vous filtrez hors scope, hors zone et briefs vides sans démarrer le fourgon.",
    },
    {
      q: "Peut-on chiffrer sans visite de façon sérieuse ?",
      a: "Oui, si vous écrivez les hypothèses, distinguez indicatif et ferme, et prévoyez ce qui déclenche une révision. Sans ça, vous vendez une illusion.",
    },
    {
      q: "Le libellé QuoteBuilder décide-t-il d’une visite ?",
      a: "Non. QuoteBuilder pose un libellé automatique Hot, Warm ou Cold à partir des réponses du formulaire. Il n’est pas configurable. Photos, zone, urgence et délai de réponse se trient dans l’équipe, hors produit.",
    },
    {
      q: "Combien de temps après la visite faut-il envoyer le devis ?",
      a: "Le plus tôt possible tant que le contexte est chaud : souvent le jour même ou sous 48 h. Au-delà, le prospect compare ailleurs.",
    },
    {
      q: "QuoteBuilder planifie-t-il les visites techniques ?",
      a: "Non. L’outil aide à structurer le funnel, le libellé automatique, le devis, l’espace prospect, les relecteurs et les relances. La planification terrain reste hors produit (agenda, process équipe).",
    },
    {
      q: "Comment relancer après une visite sans harceler ?",
      a: "Une séquence courte, avec une question métier précise (option, accès, délai), plutôt qu’un « avez-vous lu le devis ? ». Sur la fiche commerciale, le champ Espace prospect montre la dernière consultation. Les pastilles sont En attente, Consulté, Validé et Modifications. Ça aide, sans remplacer le jugement.",
    },
    {
      q: "Que faire si le décideur est absent le jour J ?",
      a: "Ne transformez pas la visite en tourisme. Collectez ce qui est possible, notez l’absence, planifiez un point avec le décideur (visio ou rappel) avant de figer un devis ferme.",
    },
    {
      q: "Comment mesurer les visites inutiles ?",
      a: "Définissez un critère simple (brief insuffisant, hors scope, deal mort avant visite, décideur absent). Comptez le pourcentage sur 30 jours. Reliez-le aux heures et au coût de déplacement via l’estimateur.",
    },
    {
      q: "Faut-il une validation interne après visite ?",
      a: "Sur les dossiers que l’équipe juge prioritaires, les paniers élevés et les accès complexes, oui. La visite réduit le doute terrain ; la validation réduit le doute marge et conformité avant envoi.",
    },
  ],
  "approbation-client-multi-decideurs-devis-b2b": [
    {
      q: "Quelle différence avec la validation interne avant envoi ?",
      a: "La validation interne est chez vous, avant que le prospect voie le prix. Le circuit multi-décideurs est chez le client, après envoi. Les deux se complètent.",
    },
    {
      q: "Que peut faire un relecteur sur son lien ?",
      a: "Ouvrir la configuration, indiquer un budget max, écrire un commentaire, puis valider le dossier ou demander des modifications. Le lien dure 30 jours. Il ne pose pas le statut du devis.",
    },
    {
      q: "Que voit-on côté vendeur sur les consultations ?",
      a: "Sur la fiche, une dernière consultation en temps relatif, par exemple « vu il y a 2 h ». Pas de première ouverture, pas de compteur, pas d’historique, pas d’alerte à la consultation, pas de pixel e-mail. Le pilotage passe par les pastilles En attente, Consulté, Validé et Modifications, le récap, et les notifications.",
    },
    {
      q: "Une invitation envoyée par le commercial prévient-elle l’équipe ?",
      a: "Non. L’invité reçoit son lien. L’équipe est notifiée si le prospect invite depuis l’espace, si quelqu’un valide, si quelqu’un demande des modifications, et quand tout le circuit est validé.",
    },
    {
      q: "Que faire si le responsable technique demande des modifications et l’acheteur a déjà validé ?",
      a: "Le récap passe à Modifications demandées. Traitez le commentaire et le budget max s’il y en a un. L’acheteur reste sur Validé. Les deux informations sont sur la fiche.",
    },
    {
      q: "Les messages du prospect sont-ils les mêmes que les notes internes ?",
      a: "Non. Les notes internes restent dans l’équipe. Le fil de messages de l’espace est la conversation avec le contact, en un seul fil. Le commentaire d’un relecteur est un champ unique, à côté de son budget max.",
    },
    {
      q: "Comment chiffrer le coût de l’attente multi-décideurs ?",
      a: "Volume, part multi-décideurs, nombre de décideurs, jours d’attente, minutes de relance, taux horaire, panier, part de dossiers retardés ou perdus. L’estimateur le fait en local.",
    },
    {
      q: "Un lien partagé suffit-il sans pastilles ?",
      a: "Mieux qu’un PDF seul, mais insuffisant dès qu’il y a deux lecteurs. Sans statut par personne, vous revenez aux « tu as pu regarder ? ».",
    },
    {
      q: "Comment gérer un syndic avec un vote AG distant ?",
      a: "Lien partagé et relances calées sur le calendrier de l’assemblée. QuoteBuilder n’affiche pas de validité : une durée de prix est une règle d’équipe, hors produit. Ne réservez pas de créneau ferme avant le récap et la décision commerciale.",
    },
    {
      q: "Qui passe le devis en Gagné ?",
      a: "C’est le commercial qui passe le devis en Gagné (l’espace prospect affiche alors « Accepté »). Le relecteur ne le fait pas. Son choix est Valider le dossier ou Modifications.",
    },
  ],
  "suivi-ouverture-lecture-devis-en-ligne-b2b": [
    {
      q: "La fiche indique-t-elle que le prospect a consulté le devis ?",
      a: "Oui, pour le lien de l’espace prospect. Le champ Espace prospect ajoute la dernière consultation en texte relatif, par exemple « vu il y a 2 h ». S’il n’y a pas encore de visite, cette mention n’apparaît pas.",
    },
    {
      q: "Y a-t-il une date de première consultation, un compteur ou un historique ?",
      a: "Non. Chaque visite remplace la précédente. Vous voyez la dernière, pas la première, pas le nombre, pas la liste des heures.",
    },
    {
      q: "La liste des devis montre-t-elle cette consultation ?",
      a: "Non. Il faut ouvrir la fiche. La liste peut en revanche résumer la validation des relecteurs (validé, modifications demandées, compteur de validations), ce qui est un autre signal.",
    },
    {
      q: "Les e-mails sont-ils suivis ?",
      a: "Non. Il n’y a pas de pixel. Vous ne savez pas si le message a été ouvert. Vous savez, sur la fiche, si l’espace a été consulté, et seulement la dernière fois.",
    },
    {
      q: "Comment inviter un relecteur ?",
      a: "Le contact principal le fait depuis l’espace. Le commercial peut aussi inviter depuis le dossier (rôle financier, technique, acheteur ou décideur). La personne reçoit un lien, valable 30 jours.",
    },
    {
      q: "Que veulent dire les pastilles ?",
      a: "En attente : lien pas encore ouvert. Consulté : le lien du relecteur a été ouvert. Validé : la personne a approuvé. Modifications : elle demande un changement. Ce n’est pas un nombre de relectures.",
    },
    {
      q: "Quand l’équipe est-elle notifiée ?",
      a: "Quand le client invite un relecteur, quand quelqu’un valide, quand quelqu’un demande des modifications, et quand tout le circuit est validé. La validation complète part aussi vers l’adresse commerciale de l’organisation.",
    },
    {
      q: "Une simple consultation déclenche-t-elle une alerte ?",
      a: "Non. Ni la visite du contact principal, ni le passage d’une pastille à Consulté. Vous le constatez en ouvrant la fiche.",
    },
    {
      q: "Comment relancer sans inventer un signal ?",
      a: "Ouvrez la fiche. Consultation récente : une question courte, après un délai. Modification demandée : répondez au point. Circuit validé : proposez l’acceptation. Aucune visite : vérifiez le destinataire et renvoyez le lien.",
    },
    {
      q: "Comment chiffrer les relances faites sans regarder la fiche ?",
      a: "Volume de devis, part relancée sans signal utile, nombre de relances, minutes, taux chargé, panier, écart de conversion si les dossiers avec un signal passent devant. Voir l’estimateur du coût des relances à l’aveugle.",
    },
  ],
  "validation-interne-avant-envoi-devis-b2b": [
    {
      q: "Faut-il faire valider tous les devis ?",
      a: "Non. Proportionnez au risque (panier, complexité, remise, type de client). Un gate unique pour tout crée des contournements.",
    },
    {
      q: "Combien de temps max pour une validation interne ?",
      a: "Pour un Hot, visez des heures, pas des jours. Si vous dépassez 24 h ouvrées trop souvent, le process est mal dimensionné ou sous-staffé.",
    },
    {
      q: "Qui tranche en cas de désaccord commercial / technique ?",
      a: "Owner deal = commercial sur le récit et le timing. Owner technique = estimateur sur les hypothèses. Manager si impact marge ou engagement. Tracez la décision.",
    },
    {
      q: "Comment éviter que la validation tue la conversion ?",
      a: "Délais d’équipe courts, hors produit : pas de SLA QuoteBuilder. Seuils clairs, checklist courte, priorité selon le libellé automatique. Mesurez le délai de validation comme un KPI commercial, pas seulement qualité.",
    },
    {
      q: "Les commentaires internes sont-ils visibles du prospect ?",
      a: "Ils ne doivent pas l’être. Gardez annotations internes distinctes des questions dans l’espace prospect.",
    },
    {
      q: "Que faire si le prospect exige un devis « ce soir » ?",
      a: "Envoyez un indicatif clairement marqué ou un périmètre réduit, ou accélérez le gate d’équipe (créneau manager fixe). Évitez d’envoyer un dossier non relu présenté comme ferme. Il n’y a pas de versions.",
    },
    {
      q: "Comment lier validation et signature électronique ?",
      a: "La validation interne précède l’envoi. Il n’y a pas de signature en ligne ni de versions. Les relecteurs cliquent Valider le dossier ou Modifications. Le commercial pose Gagné.",
    },
    {
      q: "Quel lien avec les mentions obligatoires ?",
      a: "Le gate compliance léger (checklist) avant envoi. Ce n’est pas un audit juridique à chaque devis, c’est un filet opérationnel.",
    },
    {
      q: "Comment chiffrer le coût des envois sans validation ?",
      a: "Volume, % sans relecture, corrections, remises sauvages, taux horaire, panier. L’estimateur coût devis sans validation le fait en local.",
    },
  ],
  "commentaires-annotations-devis-collaboratif-b2b": [
    {
      q: "Faut-il interdire totalement le mail pour clarifier un devis ?",
      a: "Non. Interdisez-en le rôle de salle de décision. Dans QuoteBuilder, la décision utile atterrit dans le fil plat du prospect, ou dans le commentaire et le budget max du relecteur. Pas de commentaire ancré, pas de nouvelle version.",
    },
    {
      q: "Que faire si un décideur n’a pas accès au lien ?",
      a: "Renvoyez le lien sécurisé (ou un accès espace prospect), pas un PDF. Sinon vous recréez le double canal.",
    },
    {
      q: "Comment gérer une demande qui change le chiffrage ?",
      a: "QuoteBuilder n’a pas de versions. Mettez à jour le dossier courant, répondez dans le fil plat, et laissez le relecteur ajuster son commentaire ou son budget max. Ne laissez pas un ancien PDF circuler comme s’il faisait foi.",
    },
    {
      q: "Les commentaires remplacent-ils les options / variantes ?",
      a: "Non. Les options structurées évitent une partie des commentaires. Les commentaires gèrent le reste (cas particuliers).",
    },
    {
      q: "Que faire des anciens fils RE: RE: encore ouverts ?",
      a: "Clôturez-les en reportant la décision finale dans le devis (commentaire ou note de version), puis archivez le mail. Ne laissez pas deux vérités.",
    },
    {
      q: "Comment mesurer le coût des clarifications mail ?",
      a: "Comptez devis/mois, % avec clarification, mails moyens, minutes/mail, taux horaire, % deals perdus faute de clarté, panier moyen. L’estimateur coût e-mails clarification le fait en local.",
    },
    {
      q: "Faut-il résoudre tous les commentaires avant signature ?",
      a: "Il n’y a pas de signature en ligne. Le commercial pose Gagné. Avant cela, lisez le commentaire et le budget max du relecteur. Une pratique générale, hors produit, consiste à ne pas figer un accord tant qu’un point critique (prix, périmètre, délai) est ouvert.",
    },
    {
      q: "Quel lien avec la validité du devis ?",
      a: "QuoteBuilder n’a pas de date de validité ni de versions. Si l’équipe s’est fixé une durée de prix, hors produit, et qu’elle est dépassée, mettez à jour le dossier courant avant que le commercial pose Gagné.",
    },
    {
      q: "Peut-on démarrer sans outil collaboratif ?",
      a: "Oui, avec un Drive et un tableau « décisions » par devis. Vous gagnerez déjà face aux fils RE: RE:. Le lien sécurisé, le fil plat et le commentaire de chaque relecteur réduisent encore le forward. Les commentaires ancrés aux lignes restent hors produit.",
    },
    {
      q: "Où trouver un ordre de grandeur du coût des allers-retours documents ?",
      a: "L’estimateur coût aller-retours brief / photos et l’estimateur brief incomplet pour le brief ; l’estimateur e-mails clarification pour la phase post-envoi.",
    },
  ],
  "pieces-jointes-plans-photos-devis-b2b": [
    {
      q: "Faut-il interdire WhatsApp pour les devis ?",
      a: "Non. Interdisez-en le rôle d’archive. Un prospect peut vous alerter sur WhatsApp ; le document utile doit atterrir dans le dossier / espace prospect.",
    },
    {
      q: "Que faire si le plan est un DWG et que le commercial ne l’ouvre pas ?",
      a: "Demandez un PDF coté en parallèle, ou une revue courte par le bureau d’études avant chiffrage. Le funnel peut proposer « PDF plan » comme format préféré.",
    },
    {
      q: "Comment gérer les photos trop compressées ?",
      a: "Expliquez dans l’espace prospect : « idéalement sans compression agressive, une photo par angle ». Proposez un second upload si illisible. Mieux que de chiffrer à l’aveugle.",
    },
    {
      q: "Combien de documents maximum par dossier ?",
      a: "Assez pour chiffrer, pas une bibliothèque. Souvent 3 à 10 fichiers utiles. Au-delà, demandez un index (quoi est quoi) ou un plan « courant » clairement marqué.",
    },
    {
      q: "Le prospect peut-il remplacer un plan déjà uploadé ?",
      a: "Le prospect peut déposer un nouveau fichier dans le dossier. QuoteBuilder ne crée pas une version de devis pour autant. Prévenez l’estimateur : il n’y a pas d’historique de versions.",
    },
    {
      q: "Quel lien avec la validité du devis ?",
      a: "Si le plan change après envoi, la proposition peut être caduque. QuoteBuilder n’affiche pas de validité et n’a pas de versions. Mettez à jour le dossier courant. Une durée de prix, si vous en tenez une, est hors produit.",
    },
    {
      q: "Comment prioriser les dossiers sans photos ?",
      a: "L’équipe, hors produit, peut attendre avant de chiffrer, ou poser une étape de cadrage. Il n’y a pas de SLA produit. Le libellé automatique ignore les photos.",
    },
    {
      q: "Peut-on démarrer sans espace prospect ?",
      a: "Oui, avec un Drive partagé par dossier. Vous gagnerez déjà face à WhatsApp. L’espace prospect ajoute le lien devis, le statut et le multi-décideurs, avec moins de forward.",
    },
    {
      q: "Où trouver un ordre de grandeur du coût des allers-retours ?",
      a: "L’estimateur coût aller-retours brief / photos et l’estimateur brief incomplet.",
    },
  ],
  "mentions-obligatoires-devis-france": [
    {
      q: "Quelles sont les mentions obligatoires sur un devis en France ?",
      a: "Il n’existe pas une liste unique identique pour tous les cas. En B2B, visez au minimum identité vendeur (dont SIRET), description, prix et TVA, date / numéro, validité, conditions utiles (paiement, délais), et CGV accessibles. Validez le détail avec un professionnel.",
    },
    {
      q: "Un devis sans SIRET est-il valide ?",
      a: "Valide au sens commercial et conforme au sens juridique ne sont pas la même chose. Opérationnellement, un devis sans identification claire de l’émetteur est fragile. Ajoutez le SIRET (et le reste de l’identité) dans le template.",
    },
    {
      q: "Dois-je joindre les CGV à chaque devis ?",
      a: "Souvent oui, ou au minimum les rendre accessibles de façon prouvable au moment de l’offre (lien versionné, annexe jointe au devis). Demandez à votre avocat ce qui est adapté à votre process d’acceptation.",
    },
    {
      q: "B2B et B2C, mêmes mentions ?",
      a: "Pas forcément. Le B2C ajoute souvent des contraintes de protection du consommateur. Si vous avez les deux clientèles, séparez les templates.",
    },
    {
      q: "Quelle différence entre devis et facture ?",
      a: "Le devis propose ; la facture constate et demande le paiement selon les règles de facturation. Ne recyclez pas un devis en facture sans contrôle.",
    },
    {
      q: "Comment gérer la validité ?",
      a: "Mettez une date claire, alignez-la avec vos coûts (matières, sous-traitance), et relancez avant expiration.",
    },
    {
      q: "Les acomptes doivent-ils figurer sur le devis ?",
      a: "Oui, si vous en demandez. Montant ou pourcentage, déclencheur, et suite de l’échéancier. Sinon le client découvre la règle au moment de payer.",
    },
    {
      q: "Un lien sécurisé remplace-t-il les mentions ?",
      a: "Non. Le lien améliore le suivi, les versions et l’acceptation. Les mentions restent dans le contenu de l’offre. Les deux se complètent.",
    },
    {
      q: "Puis-je utiliser ce guide comme validation de conformité ?",
      a: "Non. C’est un guide pédagogique pour outiller vos templates. La validation juridique se fait avec un avocat ou un expert-comptable.",
    },
    {
      q: "Par quoi commencer demain matin ?",
      a: "Extraire 3 devis récents. Cocher la checklist mentions devis France. Corriger le template, pas seulement le dernier PDF. Faire relire les libellés sensibles (TVA, CGV, assurances).",
    },
  ],
  "envoyer-devis-lien-securise-vs-pdf-email": [
    {
      q: "Un lien sécurisé remplace-t-il totalement le PDF ?",
      a: "Non. Il remplace le PDF comme canal principal. Le PDF reste un export utile, téléchargeable depuis l’espace.",
    },
    {
      q: "Quelle différence avec un simple lien Google Drive ou Dropbox ?",
      a: "Un Drive partagé n’est pas un dossier commercial : pas de score, pas de relance Hot, pas de statut devis, pas de signature branchée au pipeline. C’est un dossier de fichiers.",
    },
    {
      q: "Faut-il un compte client pour ouvrir le devis ?",
      a: "Dans le modèle espace prospect QuoteBuilder, non : lien + PIN, sans créer de compte.",
    },
    {
      q: "Comment gérer plusieurs décideurs ?",
      a: "Le prospect a son lien, avec le PIN du mail de confirmation. Chaque relecteur reçoit son propre lien, valable 30 jours, vers la même page. Évitez de multiplier les PDF nominatifs.",
    },
    {
      q: "Que faire si le prospect refuse le lien et exige un PDF ?",
      a: "Envoyez l’export, mais notez-le dans le dossier. Proposez quand même le lien pour les questions. Les relecteurs cliquent Valider le dossier ou Modifications. Le commercial pose Gagné. Pas de signature en ligne.",
    },
    {
      q: "Les ouvertures de lien sont-elles fiables à 100 % ?",
      a: "Il n’y a pas de suivi d’ouverture. Le champ Espace prospect montre seulement la dernière consultation, en temps relatif. Pas de compteur, pas d’historique, pas de stats. C’est déjà plus qu’un PDF joint, et ce n’est pas un tracking.",
    },
    {
      q: "Lien vs signature : dans quel ordre ?",
      a: "D’abord un espace où le brief et les options sont clairs. Les relecteurs cliquent Valider le dossier ou Modifications. Le commercial pose Gagné. Il n’y a pas de signature en ligne. Signer un PDF figé trop tôt fige aussi les erreurs.",
    },
    {
      q: "Comment estimer ce que me coûte encore le PDF-only ?",
      a: "Utilisez l’estimateur coût devis PDF seuls avec votre volume mensuel, vos pourcentages non ouverts, le temps de ressaisie et vos taux de conversion.",
    },
    {
      q: "Est-ce lié au configurateur Excel vs funnel ?",
      a: "Partiellement. Mieux créer le devis ne suffit pas si vous l’envoyez encore en pièce jointe orpheline. Les deux chantiers se complètent.",
    },
    {
      q: "Par où démarrer cette semaine ?",
      a: "Listez les devis Hot des 14 derniers jours. Comptez les renvois de PDF. Repassez les 5 plus gros en lien sécurisé. Comparez délai de réponse et clarté des questions.",
    },
  ],
  "recevoir-demandes-devis-wordpress-quotebuilder": [
    {
      q: "Le plugin WordPress envoie-t-il un email au prospect à la création du devis ?",
      a: "Non pour le flux décrit ici : la création notifie le commercial. Le nurture ou la confirmation prospect se configure à part (autopilote, message manuel). Ce n’est pas le même événement.",
    },
    {
      q: "Faut-il un Bearer pour créer un devis depuis le widget navigateur ?",
      a: "Non. Avec la clé site et le CORS borné à vos domaines, le navigateur peut créer un devis sans Bearer. Les secrets serveur restent hors du front. La clé site n’est pas une clé admin.",
    },
    {
      q: "Quelle différence entre [quotebuilder] et [quotebuilder_quote] ?",
      a: "[quotebuilder] porte le funnel / parcours. [quotebuilder_quote] sert la liste ou la vue liée au devis. Ne les intervertissez pas sur une page « demander un devis ».",
    },
    {
      q: "Que se passe-t-il si la variante Woo n’existe pas ?",
      a: "La combinaison d’attributs inexistante est refusée. Pas de ligne fantôme, pas de prix inventé. Corrigez le catalogue ou le mapping attributs vers la variation réelle.",
    },
    {
      q: "L’IA du widget peut-elle inventer un SKU ?",
      a: "Non dans le cadre prévu : uniquement des SKU réels du catalogue synchronisé. Si le catalogue est vide ou désynchronisé, réparez la sync avant d’activer l’IA.",
    },
    {
      q: "Le chat peut-il donner un prix ou un délai de pose ?",
      a: "Il doit refuser les prix et délais inventés. Il s’appuie sur le catalogue, les specs et les modes d’emploi. Au-delà : escalade email vers le commercial assigné, sinon sales_email, sinon la boîte org.",
    },
    {
      q: "Comment éviter les doublons quand le prospect clique deux fois ?",
      a: "L’idempotence via externalId ignore le second événement identique. Vérifiez en QA avec un double envoi volontaire : un seul devis au statut Nouveau.",
    },
    {
      q: "Où arrivent les demandes par rapport aux autres canaux ?",
      a: "Dans le même pipeline QuoteBuilder, avec l’origine Site Web. Utile pour centraliser le site, les ads et la boutique sans boîtes mail concurrentes.",
    },
    {
      q: "Comment mesurer si le formulaire contact me coûte encore trop cher ?",
      a: "Comptez demandes par mois, pourcentage exploitables sans rappel, minutes de ressaisie et taux de réponse sous 24 h. L’estimateur formulaire vs funnel WordPress donne un ordre de grandeur (heures perdues, demandes mortes, score de maturité).",
    },
    {
      q: "Ce guide remplace-t-il la doc d’installation du widget ?",
      a: "Non. Pour CSP, domaines, Gutenberg et Elementor, voir installer le widget devis WordPress. Ici : réception des demandes, pipeline, et règles produit (clé site, variantes, chat, notif commerciale).",
    },
  ],
  "bibliotheque-lignes-kits-devis-b2b": [
    {
      q: "Quelle différence entre catalogue boutique et bibliothèque de devis ?",
      a: "La boutique sert l’achat en ligne et le SEO produit. Dans QuoteBuilder, le catalogue devis sert le chiffrage avec des options, des variantes, des produits liés et une fourchette min-max. Kits de pose et prix HT sont une pratique générale, hors produit.",
    },
    {
      q: "Faut-il tout mettre en kits ?",
      a: "Hors QuoteBuilder, des kits servent aux assemblages fréquents et les articles unitaires au reste. Dans le produit, il n’y a pas de kits : options, variantes et produits liés suffisent.",
    },
    {
      q: "Comment gérer les prix qui changent souvent (matière) ?",
      a: "Dans QuoteBuilder, mettez à jour le prix min et le prix max. Il n’y a pas de versions de prix ni de catalogue HT. Documentez qui peut modifier la fourchette.",
    },
    {
      q: "Un commercial peut-il créer une ligne hors biblio ?",
      a: "Oui, pour l’exception. Mais mesurez le volume d’exceptions. Si 40 % des lignes sont hors biblio, la bibliothèque est incomplète ou mal adoptée.",
    },
    {
      q: "Comment lier le funnel web au catalogue ?",
      a: "Le parcours guidé doit proposer les mêmes familles / options que le catalogue devis. Sinon vous requalifiez à la main. Le préremplissage URL et la fiche produit unifiée réduisent la double saisie.",
    },
    {
      q: "Que faire des anciens modèles Excel ?",
      a: "Archivez-les en lecture seule après avoir repris les lignes critiques en options, variantes et produits liés. Les kits ne se migrent pas : le produit n’en a pas.",
    },
    {
      q: "Quels métiers en profitent le plus ?",
      a: "Tous les métiers à lignes récurrentes + options : pose, fabrication légère, location événementielle, agencement, fermetures. Moins pertinent si chaque devis est 100 % ingénierie unique, même si les forfaits se répètent.",
    },
    {
      q: "Comment convaincre l’équipe d’abandonner le copier-coller ?",
      a: "Par le temps gagné sur 2 semaines pilote et par la baisse d’erreurs atelier, pas par un discours digital. Montrez un devis assemblé en 12 minutes vs 35.",
    },
    {
      q: "La bibliothèque remplace-t-elle l’estimateur ?",
      a: "Non. Elle accélère l’assemblage. Le jugement métier (contraintes site, risque, marge) reste humain. Le logiciel structure ; il ne remplace pas le métier.",
    },
    {
      q: "Où voir ça concrètement dans QuoteBuilder ?",
      a: "Sur la fonctionnalité catalogue : options, variantes, produits liés, fourchette minimum et maximum. Pas de kits, pas de catalogue HT. Compte Free ou démo publique pour tester ce principe.",
    },
  ],
  "remise-commerciale-marge-devis-b2b": [
    {
      q: "Quelle remise maximale accepter sur un devis B2B sans tuer la marge ?",
      a: "Il n’y a pas de % universel. Calculez la remise max qui laisse votre marge au-dessus du plancher. Sur un dossier à 28 % de marge avec plancher à 22 %, la remise max est souvent autour de 7-8 % (ordre de grandeur). Vérifiez avec le calculateur seuil remise / marge.",
    },
    {
      q: "Faut-il plafonner en % de remise ou en plancher de marge ?",
      a: "Les deux aident, mais le plancher de marge est le garde-fou réel. Un plafond de remise seul ignore les dossiers déjà justes.",
    },
    {
      q: "Comment présenter une remise sans donner l’impression que le prix était gonflé ?",
      a: "Ancrez le catalogue, affichez le geste clairement, limitez la validité, évitez le vocabulaire « exceptionnel » à répétition. Une variante moins chère est souvent plus crédible qu’un rabais opaque.",
    },
    {
      q: "Que répondre à « il me faut 15 % » ?",
      a: "Recalculez le plancher. Proposez une variante −15 % de périmètre, ou une remise partielle sous seuil avec validation. Demandez ce qui bloque vraiment (budget, concurrent, timing).",
    },
    {
      q: "Les options doivent-elles être remisées comme le corps du devis ?",
      a: "Pas forcément. Pose, SAV, urgence ont souvent des règles distinctes. Cohérence entre commerciaux > formule unique.",
    },
    {
      q: "Une remise remplace-t-elle un acompte ?",
      a: "Non. Remise = prix. Acompte = trésorerie et démarrage. Cumuler remise forte et acompte faible = double exposition. Voir acomptes et échéances sur devis B2B.",
    },
    {
      q: "Qui doit valider une remise sous le plancher ?",
      a: "En pratique : directeur ou COMEX métier, motif écrit, version figée. Sans ça, le plancher n’existe pas.",
    },
    {
      q: "Quels KPIs regarder en comité commercial ?",
      a: "Remise moyenne, marge nette sur acceptés, taux d’acceptation par palier de remise, % d’exceptions sous plancher, délai de validation.",
    },
    {
      q: "Comment simuler l’impact d’une remise déjà envisagée ?",
      a: "Le simulateur impact remise montre l’effet d’un % sur le résultat. Le calculateur seuil remise / marge répond à l’autre question : jusqu’où descendre avant de casser le plancher.",
    },
    {
      q: "Ce guide remplace-t-il une politique tarifaire validée ?",
      a: "Non. C’est du process commercial. Grilles, CGV et exceptions sensibles : faites valider en interne (et juridiquement si besoin).",
    },
  ],
  "preremplir-devis-url-parametres": [
    {
      q: "Est-ce que ça marche seulement sur la démo Quickly ?",
      a: "Non. Quickly / rayonnage sert d’exemple public. Dès que votre org et votre funnel sont publiés, les mêmes paramètres s’appliquent sur /c/votre-org/votre-slug et /embed/.",
    },
    {
      q: "Le shortcode WordPress doit-il inclure les paramètres ?",
      a: "Pas forcément. Si la page hôte a déjà la query, le widget la recopie dans l’iframe. Vous pouvez aussi construire une URL d’embed complète si vous contrôlez le HTML.",
    },
    {
      q: "Puis-je cumuler UTM et besoin / add ?",
      a: "Oui. Ce sont des clés de query indépendantes. Gardez des noms stables pour le préremplissage ; laissez les UTM pour l’analytics.",
    },
    {
      q: "Que se passe-t-il si j’ajoute deux fois le même produit ?",
      a: "Chaque token add qui matche un produit suit la logique d’ajout (quantité / note). En doute, testez avec un seul SKU clair, puis documentez le comportement attendu pour votre équipe.",
    },
    {
      q: "besoin peut-il cibler autre chose qu’une chip ?",
      a: "Le contrat décrit le match sur chips (value ou label). Pour un produit catalogue, utilisez add ou product.",
    },
    {
      q: "Comment lier ça à mon catalogue Woo ?",
      a: "Synchronisez d’abord le catalogue (sku / external id alignés), puis utilisez ces identifiants dans add.",
    },
    {
      q: "L’embed change-t-il les règles ?",
      a: "Non. Mêmes paramètres, mêmes règles de session, sur /embed/ comme sur /c/.",
    },
    {
      q: "Puis-je préremplir après qu’un devis a été soumis ?",
      a: "Non pour cette session. La session soumise reste inchangée. Nouveau parcours pour un nouveau test.",
    },
    {
      q: "Y a-t-il un outil pour construire l’URL ?",
      a: "Oui : le générateur d’URL de préremplissage devis. Il sort l’URL complète, la query seule, et un exemple de shortcode.",
    },
    {
      q: "Ça remplace un configurateur complet ?",
      a: "Non. C’est un amorçage du brief (chips + produit). Le reste du funnel (dimensions, options, contact) reste à remplir.",
    },
  ],
  "fiche-produit-b2b-devis-unifie": [
    {
      q: "Est-ce que je dois tout ressaisir si j’ai déjà Woo ?",
      a: "Non. Partez d’une sync, puis enrichissez specs, médias et sheet dans QuoteBuilder. Les règles non destructives protègent cet enrichissement.",
    },
    {
      q: "Les clés de specs sont-elles figées ?",
      a: "Les clés listées (charge, hauteur, profondeur, materiau, delai) sont le socle. Des clés libres permettent d’étendre sans attendre une refonte.",
    },
    {
      q: "Où apparaissent plan et usage ?",
      a: "En thumbs / vignettes, pendant que la card utilise surtout le rôle product. Le détail d’interface peut varier selon funnel, embed ou boutique, mais le typage reste le même.",
    },
    {
      q: "La notice peut-elle être longue ?",
      a: "manualText est pensé court. Pour le détail, ajoutez un PDF de rôle manual.",
    },
    {
      q: "Que synchronisent _qb_manual, _qb_certificate, _qb_warranty ?",
      a: "Ce sont les meta Woo associées aux documents Mode d’emploi (manuel, certificat, garantie). Elles évitent de noyer les PDF dans la galerie classique.",
    },
    {
      q: "Un pull Woo vide peut-il effacer ma notice ?",
      a: "Non. Un pull vide n’efface pas une notice déjà sauvegardée. Et la description HTML Woo n’est pas copiée dans la notice.",
    },
    {
      q: "Ça marche aussi en embed et en brief devis ?",
      a: "Oui : funnel, embed, brief devis et page boutique peuvent afficher specs et Mode d’emploi si présents.",
    },
    {
      q: "Lien avec les options / variantes ?",
      a: "La fiche unifiée documente le produit de référence. Les alternatives sur le devis restent un sujet voisin : options, variantes, alternatives.",
    },
    {
      q: "Shopify est-il couvert pareil ?",
      a: "L’article met l’accent sur le contrat Woo (meta _qb_*, attributs). La sync catalogue multi-plateforme est traitée dans l’article sync Woo / Shopify. Pour les détails shell Shopify, restez sur ce qui est réellement branché sur votre plan.",
    },
    {
      q: "Par où commencer sur 50 produits ?",
      a: "Par les 10 SKU qui génèrent le plus de demandes Hot. Specs, une image product, notice courte. Puis plans et PDF sur les familles à fort contentieux technique.",
    },
  ],
  "acomptes-echeances-devis-b2b": [
    {
      q: "Quel pourcentage d’acompte demander sur un devis B2B de fabrication ?",
      a: "Souvent 30 à 40 % à la commande quand il y a achat matière ou réservation de créneau. Moins si catalogue stable et client historique ; plus si matière spécifique ou nouveau compte. Alignez l’équipe sur une grille courte.",
    },
    {
      q: "Faut-il l’acompte à la signature ou seulement à la commande matière ?",
      a: "Si la signature déclenche déjà une commande non annulable ou un créneau rare, exigez dès la signature. Sinon vous pouvez séparer acceptation et acompte commande, à condition que l’atelier attende le second signal.",
    },
    {
      q: "Combien de jalons mettre sur l’échéancier ?",
      a: "Deux à quatre. Chaque jalon doit coller à un événement (signature, commande matière, livraison, réception). Au-delà, le suivi se complexifie sans toujours mieux protéger le cash.",
    },
    {
      q: "Que faire si le client refuse tout acompte ?",
      a: "Soit vous acceptez une dérogation écrite (qui, jusqu’à quel montant), soit vous ne lancez pas. Un refus systématique sur gros paniers est un signal de risque autant qu’une négociation.",
    },
    {
      q: "L’acompte remplace-t-il la validité du devis ?",
      a: "Non. La validité cadre le prix dans le temps. L’acompte cadre le démarrage et la trésorerie. Les deux se complètent.",
    },
    {
      q: "Comment gérer un changement d’options après acompte ?",
      a: "Nouvelle version ou avenant : total, acompte déjà versé, reste dû mis à jour. Ne modifiez pas silencieusement la même version.",
    },
    {
      q: "Peut-on bloquer la signature en ligne tant que l’acompte n’est pas payé ?",
      a: "Selon le tunnel : parfois signature d’abord puis paiement immédiat ; parfois paiement comme étape du parcours. L’essentiel est qu’il n’y ait pas de lancement atelier entre les deux sans statut clair.",
    },
    {
      q: "Quels indicateurs regarder en comité commercial ?",
      a: "% d’acceptés avec acompte, délai signature vers acompte, CA bloqué sans acompte, nombre de lancements atelier hors règle.",
    },
    {
      q: "Comment estimer rapidement le montant d’acompte et le reste dû ?",
      a: "Le calculateur acompte devis prend le HT, la TVA, un % ou un montant fixe, et des jalons optionnels. Calcul local, pour cadrer une discussion d’équipe.",
    },
    {
      q: "Ce guide remplace-t-il les CGV ?",
      a: "Non. C’est du process commercial. Mentions légales, qualification des paiements et litiges : faites valider votre cadre par un professionnel.",
    },
  ],
  "validite-expiration-devis-b2b": [
    {
      q: "Combien de jours de validité pour un devis B2B classique ?",
      a: "Souvent 21 à 30 jours. Ajustez selon volatilité matière, charge atelier et cycle de décision client. Évitez 90 jours par défaut si vos coûts bougent.",
    },
    {
      q: "Peut-on prolonger un devis expiré sans le recalculer ?",
      a: "Oui si coûts et périmètre sont inchangés, et si la marge tient. Documentez la prolongation. Sinon créez une nouvelle version.",
    },
    {
      q: "Que faire si le client veut « garder le prix » six mois ?",
      a: "Expliquez la validité et proposez soit un acompte / réservation, soit une clause de révision, soit un re-chiffrage périodique. Un prix figé six mois sans filet est un risque marge.",
    },
    {
      q: "Faut-il expirer automatiquement ou manuellement ?",
      a: "L’automatisation évite les oublis. Gardez une action humaine pour prolonger ou re-chiffrer. Le statut change ; la décision commerciale reste humaine.",
    },
    {
      q: "Comment gérer un devis avec plusieurs options et une seule date ?",
      a: "Une date de validité pour la version complète. Si une option rare a une dispo courte, notez-le sur la ligne ou réduisez la validité globale.",
    },
    {
      q: "L’expiration empêche-t-elle l’acceptation en ligne ?",
      a: "Idéalement oui (ou warning fort). Accepter un devis expiré sans geste revient à signer un engagement ambigu.",
    },
    {
      q: "Que mettre dans la relance J-5 ?",
      a: "Date de fin, rappel du total / recommandation, question sur la décision, proposition de prolongation courte ou d’ajustement. Pas un pavé marketing.",
    },
    {
      q: "Comment traiter les devis « ouverts » depuis 4 mois dans Excel ?",
      a: "Clôturez-les (expiré / perdu / à re-chiffrer). Recalculez le vrai pipeline. Sinon vos specs mensuelles mentent.",
    },
    {
      q: "La validité remplace-t-elle les CGV ?",
      a: "Non. Elle complète le process. Les CGV / mentions légales restent du ressort juridique.",
    },
    {
      q: "Quel outil pour estimer le coût des devis qui expirent ?",
      a: "Le simulateur coût devis expirés donne un ordre de grandeur (CA, heures, re-chiffrage, gain si relance avant).",
    },
  ],
  "options-variantes-alternatives-devis-b2b": [
    {
      q: "Combien d’options maximum sur un devis B2B ?",
      a: "En pratique, 2 variantes exclusives + 2 à 4 lignes optionnelles. Au-delà, le prospect compare mal et demande encore un PDF. Les besoins rares passent en « sur devis » ou phase 2.",
    },
    {
      q: "Faut-il toujours proposer un pack premium ?",
      a: "Non. Proposez-le quand le catalogue le justifie (confort, SAV, délai prioritaire). Sinon une variante A/B claire suffit. Le premium forcé ressemble à du remplissage.",
    },
    {
      q: "Comment gérer une option demandée après envoi ?",
      a: "Créez une nouvelle version (ou un amendement) avec l’option, conservez l’historique, et renvoyez un lien unique. Ne « écrasez » pas le PDF précédent sans trace.",
    },
    {
      q: "Les options doivent-elles avoir la même marge que le corps du devis ?",
      a: "Pas forcément. Fixez des règles par type (pose, accessoire, urgence). L’important est la cohérence entre commerciaux, pas une marge unique magique.",
    },
    {
      q: "Option gratuite pour gagner le deal : bonne idée ?",
      a: "Rarement. Une option « offerte » sans limite devient une norme. Préférez une variante moins chère avec périmètre réduit, ou une option à prix symbolique si politique commerciale l’autorise.",
    },
    {
      q: "Comment présenter une alternative concurrente sans dénigrer ?",
      a: "Comparez trois écarts factuels (délai, périmètre inclus, conditions SAV). Pas de tableau émotionnel. Documentez la variante dans le dossier.",
    },
    {
      q: "Excel peut-il suffire pour les options ?",
      a: "Pour un volume très faible, parfois. Dès que plusieurs personnes touchent le même devis, Excel multiplie les copies. Un outil structuré réduit les V3 fantômes. Voir configurateur vs Excel.",
    },
    {
      q: "Que faire si le prospect veut « tout optionnel » ?",
      a: "Recadrez : une base recommandée + options. Un devis 100 % optionnel n’est pas un devis, c’est un catalogue. Qualifiez le besoin avant de chiffrer.",
    },
    {
      q: "Les options ralentissent-elles l’acceptation ?",
      a: "Mal présentées, oui. Bien structurées (recommandation + totaux clairs + acceptation en ligne), elles accélèrent souvent la décision en évitant le ping-pong PDF.",
    },
    {
      q: "Comment relier options et score Hot / Warm / Cold ?",
      a: "Les Hot méritent un soin A/B soigné. Les Cold n’ont pas besoin de six variantes. Utilisez le score pour allouer le temps chiffrage. Voir score demande.",
    },
  ],
  "signature-acceptation-devis-en-ligne-b2b": [
    {
      q: "Faut-il toujours une e-signature pour un devis B2B ?",
      a: "Non. Souvent un bouton Accepter sur une version datée suffit pour démarrer opérationnellement. Gardez l’e-sign quand le risque, le montant ou la procédure client l’exigent.",
    },
    {
      q: "Comment éviter que le client signe l’ancienne version ?",
      a: "Une seule version active dans l’espace prospect. Les anciennes restent en historique, clairement marquées « remplacée ». Interdiction d’envoyer des PDF parallèles.",
    },
    {
      q: "Que faire si le client accepte oralement au téléphone ?",
      a: "Notez l’acceptation dans le dossier avec date, interlocuteur, version concernée, et envoyez immédiatement un lien de confirmation en ligne. L’oral seul disparaît.",
    },
    {
      q: "Comment gérer plusieurs décideurs ?",
      a: "Un lien partageable + rôles clairs (qui peut accepter). Évitez cinq transferts de PDF. L’espace prospect est conçu pour ça.",
    },
    {
      q: "L’acceptation en ligne remplace-t-elle le bon de commande ?",
      a: "Pas toujours. Certaines organisations exigent encore un BC. L’acceptation en ligne accélère le go interne (commande matière, planning) en attendant le formalisme client.",
    },
    {
      q: "Que mesurer en premier pour améliorer le taux ?",
      a: "Taux de vue, puis délai vue → acceptation, puis nombre de versions. Améliorer l’envoi sans mesurer la vue, c’est piloter à l’aveugle.",
    },
    {
      q: "Comment traiter une demande de remise au moment d’accepter ?",
      a: "Créez une nouvelle version avec le prix recalculé. Ne « corrigez » pas le PDF déjà accepté. Vérifiez la marge avant de valider.",
    },
    {
      q: "Faut-il un PIN ou une authentification ?",
      a: "Hors QuoteBuilder pour la signature. Un lien avec PIN existe. Il n’y a pas de traçage d’ouverture : seulement la dernière consultation, en temps relatif, dans le champ Espace prospect.",
    },
    {
      q: "Quel délai de validité mettre ?",
      a: "Assez court pour forcer une décision (ex. 15–30 jours selon métier et volatilité matière), assez long pour le circuit de validation client. Affichez-le clairement sur le récap.",
    },
    {
      q: "Par où commencer si on est encore 100 % PDF mail ?",
      a: "Interdiction progressive : tout nouveau devis part via un lien dossier. Archivez les PDF dans le dossier, pas l’inverse. Formez l’équipe en une réunion de 45 minutes, puis tenez la règle en revue pipeline.",
    },
  ],
  "revue-pipeline-devis-b2b": [
    {
      q: "Hebdo ou bi-hebdo ?",
      a: "Hebdo si vous avez un flux continu de demandes et des Hot qui bougent vite. Bi-hebdo si les cycles sont longs et que la liste Hot est petite. Si la réunion dépasse souvent 45 minutes, c’est souvent un signe de mauvaise préparation ou de trop de Cold dans la liste, pas un besoin d’allonger.",
    },
    {
      q: "Combien de dossiers passer en revue ?",
      a: "Priorité : tous les Hot, puis Warm en risque, puis briefs bloqués. Pas les 200 lignes. Si Hot > capacité réaliste, recalibrez le score avant d’allonger la réunion.",
    },
    {
      q: "Faut-il un CRM lourd ?",
      a: "Non. Il faut une file de dossiers avec owner, score, brief, historique d’actions. Un CRM mal tenu est pire qu’un outil devis bien filtré. L’essentiel : une vérité partagée, pas un logiciel « enterprise » pour la forme.",
    },
    {
      q: "Que faire si un commercial refuse d’abandonner ?",
      a: "Demandez le motif et la prochaine action datée. Si les deux sont flous, le dossier descend. Le plafond de Hot aide : pour en ajouter un, il faut en sortir un.",
    },
    {
      q: "Comment traiter les devis déjà envoyés ?",
      a: "Ils restent dans le pipeline avec statut clair (envoyé, en négociation, relance due). La revue décide la relance, pas le « on attend ». Voir relancer depuis le dossier.",
    },
    {
      q: "Les briefs incomplets doivent-ils être dans Hot ?",
      a: "En général non. Un Hot sans brief crée de la pression inutile sur l’atelier. Classez Warm (ou « à qualifier ») jusqu’au minimum viable. Voir qualifier avant chiffrage.",
    },
    {
      q: "Qui décide du score Hot/Warm/Cold ?",
      a: "Règles écrites + owner propose + animateur tranche en cas de conflit. Pas de vote à main levée chaque semaine. Sinon le score devient politique.",
    },
    {
      q: "Comment éviter que la revue redevienne une lecture Excel ?",
      a: "Interdiction d’ouvrir un export pendant la réunion. Vue filtrée dans l’outil de dossiers. Si quelqu’un a besoin d’un tableur pour « mieux voir », c’est que les filtres et champs manquent. Corrigez le système, pas la réunion.",
    },
    {
      q: "Que noter comme motif d’abandon ?",
      a: "Court et utile : silence après N relances, budget, concurrent, hors zone, hors typologie, projet annulé. Assez pour apprendre. Pas un roman.",
    },
    {
      q: "Comment lier revue et capacité équipe ?",
      a: "Avant la séance (ou en flash en fin), regardez si le volume Hot + Warm à chiffrer dépasse la capacité. Le calculateur de capacité sert hors réunion ; en réunion, décidez de reporter ou de reclasser plutôt que de promettre l’impossible.",
    },
  ],
  "centraliser-demandes-devis-multi-canaux": [
    {
      q: "Faut-il fermer WhatsApp et LinkedIn pour centraliser ?",
      a: "Non. Il faut interdire qu’ils soient le seul endroit où vit le deal. Conversation OK, stockage du brief et du devis dans le dossier commun.",
    },
    {
      q: "Que faire des anciennes boîtes mail perso ?",
      a: "Basculer progressivement vers devis@ ou une file partagée. Règle : tout nouveau devis hors boîte perso. Archiver l’historique, ne pas le laisser comme inbox active.",
    },
    {
      q: "Comment traiter un doublon déjà chiffré deux fois ?",
      a: "Fusionner les dossiers, garder la version active la plus récente, documenter l’écart de prix, contacter le prospect avec une seule voix. Mettre une alerte anti-doublon pour la suite.",
    },
    {
      q: "Le score doit-il être posé dès la création du dossier ?",
      a: "Idéalement oui, même provisoire (Cold par défaut). Affiner dès que le brief s’enrichit. Un dossier sans score tombe au fond de la file.",
    },
    {
      q: "Marketplace et site doivent-ils avoir le même SLA ?",
      a: "Le SLA porte sur le score, pas sur le canal. Un Hot marketplace = même urgence qu’un Hot site. Sinon vous discriminez un canal rentable par paresse d’intake.",
    },
    {
      q: "Peut-on centraliser sans logiciel dédié au début ?",
      a: "Oui, avec discipline (table partagée + IDs + owners). Ça casse vite à 3 commerciaux. Un pipeline devis évite que la table Excel redevienne un deuxième chaos.",
    },
    {
      q: "Comment éviter que l’intake soit « le travail de personne » ?",
      a: "Nommer un rôle Intake (même rotatif) + mesure du délai premier contact. Sans owner d’intake, la centralisation reste un slide.",
    },
    {
      q: "Quid des demandes issues d’un salon ?",
      a: "Batch saisie J+0 ou J+1 avec source « salon », photos badges, score. Les cartes de visite dans une poche ne sont pas un pipeline.",
    },
    {
      q: "Faut-il un dossier par contact ou par projet ?",
      a: "Par projet (opportunité). Un même contact peut avoir plusieurs projets. Rattacher les échanges au bon dossier évite de mélanger deux chantiers.",
    },
    {
      q: "Par où commencer si tout est en silo aujourd’hui ?",
      a: "(1) règle pas de devis hors dossier, (2) boîte / file unique, (3) saisie express téléphone et WhatsApp, (4) funnel site. Dans cet ordre. Le reste suit.",
    },
  ],
  "versions-historique-devis-b2b": [
    {
      q: "Faut-il une nouvelle version pour une simple remise ?",
      a: "Oui, si la remise change le total ou les conditions. Une remise orale non versionnée est une dette. Le prospect et l’atelier doivent voir le même chiffre.",
    },
    {
      q: "Combien de versions avant de requalifier le brief ?",
      a: "Pas de chiffre magique. Au-delà de 3–4 allers-retours majeurs de scope, arrêtez de patcher : requalifiez, puis repartez sur une v propre (parfois v1 d’un nouveau périmètre clairement nommé).",
    },
    {
      q: "Le prospect doit-il voir tout l’historique ?",
      a: "Pas forcément. Il doit voir la version active et, si utile, un récap des changements. L’historique complet (brouillons internes, notes marge) reste interne.",
    },
    {
      q: "Comment gérer les options A / B / C ?",
      a: "Deux approches : une version avec options explicites côte à côte, ou une version par scénario (v2-A, v2-B) si les totaux divergent fort. Dans les deux cas, une seule version recommandée ou active pour la relance.",
    },
    {
      q: "Que faire si le client signe une ancienne version ?",
      a: "Traitez-le comme un incident process. Vérifiez le contenu signé, confirmez l’écart par écrit, et alignez la production sur le document signé (sauf accord contraire écrit). Puis corrigez les liens pour que seule l’active soit signable.",
    },
    {
      q: "PDF, lien magique, ou les deux ?",
      a: "Hors QuoteBuilder pour les versions et la signature. L’espace prospect montre le dossier courant, sans numéro de version. Le PDF reste utile pour l’archivage.",
    },
    {
      q: "Comment versionner quand plusieurs commerciaux touchent le dossier ?",
      a: "Owner unique pour les envois. Les coéquipiers commentent ou préparent un brouillon. Seul l’owner (ou un backup explicite) publie une version.",
    },
    {
      q: "Les versions remplacent-elles le score Hot / Warm / Cold ?",
      a: "Non. Le score priorise. Les versions documentent l’évolution du deal. Un Hot peut être en v1 ; un Warm en v4. Un Warm en v4 mérite souvent une revue de brief.",
    },
    {
      q: "Faut-il archiver les versions refusées ?",
      a: "Oui, au moins un temps. Elles servent aux litiges, à l’analyse marge, et à la formation. Marquez-les refusées / remplacées, ne les laissez pas actives.",
    },
    {
      q: "Par où commencer si on est encore 100 % Excel + mail ?",
      a: "Convention de nommage + dossier unique par affaire + journal une ligne par version + interdiction d’envoyer hors dossier. Ensuite, un outil qui lie demande, versions et relances.",
    },
  ],
  "assignation-sla-demande-devis-equipe": [
    {
      q: "C’est quoi un SLA sur une demande de devis ?",
      a: "Un accord d’équipe sur le délai max de première réponse utile et de next step (chiffrage, RDV, ou demande de brief). Ce n’est pas un auto-mail vide.",
    },
    {
      q: "Faut-il un owner unique même à deux commerciaux ?",
      a: "Oui. À deux, le risque de double réponse et d’orphelins est déjà réel. L’owner évite les « je pensais que tu… ».",
    },
    {
      q: "Comment choisir entre assignation par territoire et par score ?",
      a: "Souvent les deux : territoire (ou métier) pour le routage de base, score pour la priorité et le SLA à l’intérieur de la file.",
    },
    {
      q: "Que faire d’un Hot qui arrive hors horaires ?",
      a: "Soit astreinte Hot uniquement, soit file lundi matin avec message clair au prospect. Décidez une règle, ne laissez pas le hasard choisir.",
    },
    {
      q: "Comment éviter qu’un senior mange tous les Hot ?",
      a: "Plafond de Hot ouverts + overflow automatique + revue de charge hebdo. Le meilleur closer ne doit pas devenir le goulot.",
    },
    {
      q: "Les juniors peuvent-ils prendre des Warm et Cold ?",
      a: "Oui, surtout les Cold et les Warm à brief incomplet. Les Hot à fort panier restent plutôt seniors, avec revue.",
    },
    {
      q: "Que mesurer en premier si on n’a rien ?",
      a: "Owner renseigné, temps de première réponse Hot, nombre d’orphelins > 24 h. Trois chiffres suffisent pour commencer.",
    },
    {
      q: "Comment gérer les demandes qui arrivent sur WhatsApp / LinkedIn / téléphone ?",
      a: "Même règle : créer le dossier dans le pipeline dans les 15 minutes, assigner un owner, coller le brief. Sinon ces canaux deviennent des silos invisibles.",
    },
    {
      q: "Faut-il punir un SLA raté ?",
      a: "Non. Regarder la cause : surcharge, brief pourri, règle absurde, outil inadapté. Ajuster capacité ou SLA. La punition crée des fausses données.",
    },
    {
      q: "Un outil peut-il assigner tout seul ?",
      a: "Il peut router selon des règles (territoire, score, charge) et alerter. La qualité reste humaine : brief, jugement, relation. L’outil réduit le chaos, il ne remplace pas le commercial.",
    },
  ],
  "qualifier-demande-devis-avant-chiffrage": [
    {
      q: "Faut-il toujours un budget chiffré pour qualifier ?",
      a: "Non. Une bande budgétaire ou « enveloppe validée / non validée » suffit souvent. L’absence totale d’ordre de grandeur est un signal Cold, pas une fatalité.",
    },
    {
      q: "Peut-on envoyer une estimation indicative sans devis complet ?",
      a: "Oui. C’est même recommandé sur Warm / Cold. Clarifiez que ce n’est pas un devis atelier engageant.",
    },
    {
      q: "Qui doit poser le score : commercial ou automatisme ?",
      a: "Le score Hot / Warm / Cold est calculé automatiquement à la soumission, avec une formule fixe et non configurable. Le commercial garde la main sur le triage (urgence, zone, contexte), et l’équipe compare avec le close rate réel.",
    },
    {
      q: "Combien de questions dans le funnel de qualification ?",
      a: "En pratique, 8 à 15 champs utiles battent 30 champs « au cas où ». Priorisez les axes qui changent le prix ou la décision.",
    },
    {
      q: "La qualification remplace-t-elle la visite technique ?",
      a: "Non. Elle décide quand y aller et avec quel brief. Voir aussi la visite guidée du parcours devis.",
    },
    {
      q: "Comment traiter un appel d’offres formel ?",
      a: "Branche dédiée : délais, pièces, critères, contacts. Ne forcez pas le même parcours qu’un devis express.",
    },
    {
      q: "Que faire si le prospect refuse de donner un budget ?",
      a: "Expliquez pourquoi la bande aide à proposer juste. S’il refuse toujours, scorez plus bas et limitez l’investissement chiffrage.",
    },
    {
      q: "Peut-on qualifier depuis un configurateur plutôt qu’un formulaire ?",
      a: "Oui. Un parcours configuré produit souvent un meilleur brief qu’un mail. Voir configurateur vs Excel PDF.",
    },
    {
      q: "Quels secteurs gagnent le plus à qualifier avant chiffrage ?",
      a: "Tous les métiers où une ligne oubliée change le prix : menuiserie, agencement, rayonnage, location événementielle, équipements techniques.",
    },
    {
      q: "Par où commencer si l’équipe est solo ?",
      a: "Grille 6 axes sur papier + 5 questions obligatoires à l’entrée + règle « pas de PDF lourd si 3 axes manquants ». Puis outiller.",
    },
  ],
  "creer-devis-avec-claude-mcp": [
    {
      q: "C’est quoi QuoteBuilder MCP ?",
      a: "Un serveur Model Context Protocol (package npm quotebuilder-mcp) qui expose des tools Claude Desktop pour lire et écrire dans votre compte QuoteBuilder (leads / devis, stats, funnels, automations selon la version). La feature devis v0 ajoute create_quote, list_quotes, get_quote_status.",
    },
    {
      q: "Faut-il un compte payant ?",
      a: "Non pour démarrer : créez un compte Free, générez une clé API, branchez Claude. Les plafonds et options avancées suivent votre plan (tarifs).",
    },
    {
      q: "Quelle URL mettre dans QB_API_URL ?",
      a: "Celle documentée par le package / README MCP. Aujourd’hui le défaut documenté est https://www.quotebuilder.co. L’URL canonique du produit web reste https://www.quotebuilder.co. En doute, recopiez exactement la valeur de votre doc interne ou du README du package, ne « corrigez » pas au feeling.",
    },
    {
      q: "create_quote envoie-t-il un e-mail au prospect ?",
      a: "Pas par défaut. run_autopilot vaut false sauf si vous le forcez à true. C’est voulu : créer depuis Claude ≠ publier une soumission web avec workflows quote.submitted.",
    },
    {
      q: "Pourquoi pas submitQuote ?",
      a: "submitQuote correspond au monde public / prospect (funnel, boutique, token / PIN selon parcours). Les tools MCP devis v0 wrappent /api/leads avec une clé vendeur. Deux portes, un pipeline.",
    },
    {
      q: "Claude remplace-t-il le score Hot / Warm ?",
      a: "Non. Le score et la priorisation restent dans QuoteBuilder (et dans votre grille métier). MCP vous aide à créer et lire le dossier ; la priorisation se joue dans la file Demandes. Méthode : score demande devis B2B.",
    },
    {
      q: "Où voir le devis après création ?",
      a: "Dans l’app : accueil, liste /devis, fiche détail. Depuis Claude : list_quotes et get_quote_status. Si rien n’apparaît, vérifiez la clé, l’org, le flag MCP_DEVIS_V0, et les logs MCP de Claude Desktop.",
    },
    {
      q: "Puis-je générer le PDF depuis Claude en v0 ?",
      a: "Non. Hors scope v0. Générez / envoyez le PDF depuis QuoteBuilder une fois le dossier propre.",
    },
  ],
  "visite-guidee-parcours-devis-b2b": [
    {
      q: "C’est quoi un dossier devis B2B ?",
      a: "Un dossier devis, c’est l’ensemble des informations nécessaires pour prioriser et chiffrer : contact, projet, contraintes, fourchette, source, score, owner, échanges. Ce n’est pas seulement le PDF du devis.",
    },
    {
      q: "Faut-il un funnel et une boutique ?",
      a: "Pas obligatoirement les deux au jour 1. Le funnel guidé suffit pour beaucoup d’offres configurables. Ajoutez la vitrine si le catalogue est large et que les prospects cherchent par référence. Les deux peuvent alimenter la même liste Demandes.",
    },
    {
      q: "Combien d’étapes dans un funnel devis ?",
      a: "Cinq à sept est un bon point de départ. Moins si l’offre est simple. Plus seulement si chaque étape ajoute une info vraiment utile au chiffrage. La barre de progression aide le prospect à savoir où il en est.",
    },
    {
      q: "Le score doit-il être visible pour le prospect ?",
      a: "En général non. Montrez un récap du brief et les prochaines étapes. Le score (Hot / Warm / Cold) sert à l’équipe pour allouer le temps.",
    },
    {
      q: "Que faire si une demande Hot attend depuis une semaine ?",
      a: "Traitez-la comme une urgence manuelle : appeler, répondre à la question ouverte, noter l’échange dans le dossier. Puis vérifiez pourquoi aucune automation ni alerte n’a couvert le cas.",
    },
    {
      q: "Les automations remplacent-elles les relances humaines ?",
      a: "Non. Elles portent la confirmation, les rappels et une partie des Warm / abandons. Les Hot complexes, les multi-décideurs et les objections restent du travail commercial.",
    },
    {
      q: "Par où tester sans reconstruire tout mon site ?",
      a: "Ouvrez le funnel démo rayonnage et la boutique démo, puis comparez avec votre formulaire actuel sur un cas réel. Si le brief sort plus chiffrable, vous avez votre réponse.",
    },
  ],
  "relancer-devis-hot-depuis-dossier": [
    {
      q: "Qu’est-ce qu’un devis Hot concrètement ?",
      a: "Un dossier dont le score dépasse un seuil écrit (souvent 80/100) : fit, urgence, brief complet, signal budget, engagement. Ce n’est pas « le commercial a un bon feeling ».",
    },
    {
      q: "Faut-il toujours appeler un Hot ?",
      a: "Pas toujours, mais souvent oui quand le brief demande une visite, un décideur, ou une contrainte site. Si le Hot est un complément catalogue simple, un mail précis le jour même peut suffire. Le dossier doit guider le canal.",
    },
    {
      q: "Que faire si le Hot n’a pas d’owner ?",
      a: "Assigner immédiatement, même temporairement. Un Hot sans owner est un défaut de process. Tant que « l’équipe » est owner, le SLA est fictif.",
    },
    {
      q: "Les automations peuvent-elles relancer les Hot toutes seules ?",
      a: "Elles peuvent confirmer, notifier, et porter une partie de la cadence post-devis. Elles ne doivent pas masquer un Hot avec question ouverte non traitée.",
    },
    {
      q: "Combien de relances avant de classer perdu ?",
      a: "Assez pour couvrir votre calendrier écrit (souvent 4 à 6 touches utiles sur un cycle court), puis une sortie claire : perdu, nurture Cold, ou report avec date.",
    },
    {
      q: "Comment construire la séquence sans partir de zéro ?",
      a: "Utilisez le générateur de séquence de relances, validez le ton en équipe, branchez le répétitif dans les automations, gardez les étapes à jugement dans le dossier.",
    },
    {
      q: "Par où tester le process dans QuoteBuilder ?",
      a: "Côté prospect : démo funnel rayonnage. Côté vendeur : essai Free pour voir accueil, liste Demandes, détail dossier, automations.",
    },
  ],
  "delai-reponse-demande-devis-b2b": [
    {
      q: "Quel délai de réponse viser pour un devis B2B ?",
      a: "Pour un Hot en heures ouvrées, beaucoup de PME gagnent déjà en passant sous 1 heure de premier contact utile. La cible « 5 minutes » est un benchmark inbound exigeant, utile si vous avez du volume Ads et une astreinte.",
    },
    {
      q: "Faut-il répondre le week-end ?",
      a: "Si vos prospects déposent des demandes le samedi, une auto-confirm + reprise lundi tôt vaut mieux que le silence. Une vraie astreinte se justifie surtout sur les Hot à forte valeur.",
    },
    {
      q: "L’auto-reply compte-t-il comme réponse ?",
      a: "Comme accusé, oui. Comme first response utile, non. Le prospect veut savoir qu’un humain a lu le brief ou qu’un créneau est proposé.",
    },
    {
      q: "Comment accélérer sans embaucher ?",
      a: "Moins de demandes pourries (meilleure entrée), score, assignation claire, créneaux protégés inbound, et suppression des transferts Excel.",
    },
    {
      q: "Speed to lead et relance après devis, c’est la même chose ?",
      a: "Non. Speed to lead = premier contact après la demande. Relance = suivi après envoi de l’offre. Les deux fuient du CA. Traitez-les comme deux pipelines liés.",
    },
    {
      q: "Un chatbot suffit-il ?",
      a: "Un bot qui clarifie le brief et book un créneau aide. Un bot qui promet des délais irréalistes ou qui bloque l’humain ralentit. Gardez la sortie vers un dossier + owner.",
    },
  ],
  "score-demande-devis-b2b": [
    {
      q: "Faut-il montrer le score au prospect ?",
      a: "Non en général. Montrez plutôt un récap clair du brief et les prochaines étapes. Le score est un outil interne de priorisation.",
    },
    {
      q: "Un score 100 est-il réaliste ?",
      a: "Rarement, et ce n’est pas grave. Un Hot à 82 bien traité bat un « 100 » cosmétique.",
    },
    {
      q: "Peut-on scorer uniquement à la main ?",
      a: "Oui jusqu’à ~30 devis / mois. Au-delà, la dérive est quasi certaine sans pipeline.",
    },
    {
      q: "Lead scoring CRM vs score devis : que garder ?",
      a: "Gardez le firmographique marketing en amont. Pour les demandes de devis, basculez sur la grille 5 axes. Mélanger les deux sans règles crée des Hot marketing qui sont Cold opérationnels.",
    },
    {
      q: "Que faire des demandes multi-décideurs ?",
      a: "Ajoutez un bonus comportement si plusieurs contacts du même compte engagent. Le cycle s’allonge, mais le signal d’achat monte souvent.",
    },
    {
      q: "Comment lier score et pricing SaaS / outil ?",
      a: "Si vous industrialisez le parcours (funnel, catalogue, pipeline), un outil comme QuoteBuilder (Free puis Starter / Pro / Agency selon volume) sert surtout à capturer les champs du score et à exécuter les playbooks, pas à remplacer le jugement commercial.",
    },
  ],
  "configurateur-devis-vs-excel-pdf": [
    {
      q: "Configurateur, CPQ, funnel de devis : c’est la même chose ?",
      a: "Pas exactement. CPQ (Configure Price Quote) couvre souvent configuration + pricing + quote dans des contextes complexes. Un funnel de devis capture un brief chiffrable et orchestre la suite (score, relances). Pour beaucoup de PME, le funnel suffit avant un CPQ lourd.",
    },
    {
      q: "Peut-on garder le PDF ?",
      a: "Oui. Beaucoup d’équipes génèrent encore un PDF en sortie d’un parcours. La différence : le PDF n’est plus la seule source de vérité.",
    },
    {
      q: "Et la signature électronique ?",
      a: "Utile plus tard. D’abord fiabiliser brief + offre + suivi. Signer plus vite un devis faux n’aide personne.",
    },
    {
      q: "Comment former l’équipe ?",
      a: "Une session d’1 h sur le parcours, un cheat sheet des 10 règles, et une revue hebdo des dossiers bizarre pendant 1 mois. Pas un séminaire de 2 jours.",
    },
    {
      q: "Quel ROI attendre ?",
      a: "Mesurez cycle time, taux d’erreur, close rate des dossiers Hot, et heures commerciales récupérées. Les benchmarks externes donnent le courage. Vos chiffres donnent la décision.",
    },
    {
      q: "QuoteBuilder remplace-t-il Excel à 100 % ?",
      a: "Non, et ce n’est pas le but. Il structure l’entrée, le pipeline et les relances. Les cas extrêmes restent hybrides.",
    },
  ],
  "pourquoi-les-devis-meurent-sans-relance": [
    {
      q: "Les statistiques Invesp / Belkins / ZoomInfo valent-elles pour le B2B français ?",
      a: "Les pourcentages viennent d’études anglophones sur le suivi commercial. L’ordre de grandeur se retrouve chez les PME qui vendent sur devis : la première relance part, les suivantes restent dans les brouillons. L’autopilote sert surtout à ne pas oublier la suite.",
    },
    {
      q: "Combien de relances avant d’être intrusif ?",
      a: "Cinq touches utiles, pas cinq copies du même PDF. Confirmation, point à 24 h, relance à J+3, contenu à J+7, réactivation à J+30. Chaque message a un objet différent.",
    },
    {
      q: "Faut-il relancer aussi les abandons de funnel ?",
      a: "Oui, dès qu’un e-mail est capté. Une session abandonnée avec identité vaut souvent plus qu’un formulaire « bonjour » complet. Voir le calculateur de CA perdu.",
    },
    {
      q: "QuoteBuilder remplace-t-il le commercial ?",
      a: "Non. L’autopilote envoie les touches que personne n’enchaîne. Le commercial conclut, sur un dossier déjà un peu cadré.",
    },
  ],
  "formulaire-contact-vs-funnel-devis-b2b": [
    {
      q: "Un bon formulaire Typeform suffit-il ?",
      a: "Il améliore le taux de complétion. Il ne livre pas un catalogue contraint, un score, une assignation ni des relances. C’est un meilleur formulaire, pas un système de devis.",
    },
    {
      q: "Le funnel ne va-t-il pas faire fuir le prospect ?",
      a: "Un parcours trop long, oui. Un parcours métier (gamme, contrainte, budget) filtre les curieux et accélère les vrais projets. L’identité se capture progressivement.",
    },
    {
      q: "Peut-on garder le formulaire existant en parallèle ?",
      a: "Oui. Le widget QuoteBuilder s’ajoute à une page. Vous comparez le taux de dossiers exploitables, pas seulement le volume de messages.",
    },
    {
      q: "Chat IA ou wizard ?",
      a: "Le wizard cadre. Le chat débloque les cas flous. Les deux écrivent dans le même dossier. Le canal importe moins que la fiche à la fin.",
    },
  ],
  "installer-widget-devis-wordpress-javascript": [
    {
      q: "Le widget casse-t-il le thème WordPress ?",
      a: "Non. Plugin + bloc Gutenberg ou shortcode. Le funnel s’ouvre dans votre page, sans nouveau thème.",
    },
    {
      q: "Faut-il WooCommerce ?",
      a: "Non pour afficher un funnel. Woo sert à synchroniser le catalogue. Le widget JS marche sur n’importe quel site.",
    },
    {
      q: "Et le RGPD / cookies ?",
      a: "Le funnel collecte l’identité au moment utile. Déclarez le traitement dans votre politique. QuoteBuilder n’est pas un pixel publicitaire.",
    },
    {
      q: "Combien de temps pour installer ?",
      a: "Compte QuoteBuilder, funnel publié, deux lignes de JS ou un bloc. Plutôt des minutes qu’un projet SI.",
    },
  ],
  "template-boutique-en-ligne-menuiserie-devis": [
    {
      q: "Un template boutique menuiserie remplace-t-il mon site vitrine WordPress ?",
      a: "Pas forcément. Beaucoup d’équipes gardent le site corporate (agence, blog, recrutement) et publient la boutique devis QuoteBuilder en sous-domaine ou en lien principal « Demander un devis ». L’important est que le parcours chiffrage soit métier, pas que tout le site migre d’un coup.",
    },
    {
      q: "Pourquoi ne pas juste désactiver le paiement sur Shopify ?",
      a: "Vous pouvez. Mais le thème, les libellés, le panier et le SEO restent pensés checkout. Les prospects cherchent encore « Ajouter au panier ». Une base devis retire cette ambiguïté et branche la soumission sur un dossier commercial (score, relance), pas sur une commande à 0 €.",
    },
    {
      q: "Skincare B2B : faut-il afficher les prix ?",
      a: "Affichez des fourchettes catalogue si elles aident à filtrer. Masquez si chaque protocole dépend du bilan. Dans les deux cas, le CTA reste « Demander un devis », jamais « Payer maintenant ».",
    },
    {
      q: "Stock / rayonnage : funnel ou boutique ?",
      a: "Les deux se complètent. Le funnel rayonnage cadre un projet (type d’espace, contraintes). La boutique vitrine sert l’acheteur qui navigue par référence. Même pipeline derrière.",
    },
    {
      q: "Combien de temps pour passer du template à l’URL publique ?",
      a: "Avec un catalogue déjà listé (même imparfait), beaucoup d’équipes publient une V1 en quelques heures : template, Chat IA sur les textes, photos, publish. Le polish Puck et les intégrations viennent ensuite.",
    },
    {
      q: "Les trois templates sont-ils déjà en démo publique ?",
      a: "Oui. Menuiserie Atelier Bois Nord, skincare Atelier Peau Claire, stock Stock Pro B2B. Chaque démo a son catalogue dédié sous /catalogue.",
    },
  ],
  "devis-en-ligne-integre-boutique": [
    {
      q: "Qu’est-ce qu’un devis en ligne intégré boutique concrètement ?",
      a: "C’est un parcours de demande de devis storefront servi sous l’URL boutique (/b/.../devis), avec le même header/footer que le catalogue, et des CTA shop-local (Devis, Ajouter au devis). La soumission crée un dossier commercial.",
    },
    {
      q: "Est-ce que le funnel /c disparaît ?",
      a: "Non. Il reste pertinent pour les landings projet et l’acquisition où le catalogue n’est pas le point d’entrée. Ce qui change : depuis la boutique publique, vous n’êtes plus forcé de sortir vers /c pour composer.",
    },
    {
      q: "« Ajouter au devis » remplace-t-il le panier e-commerce ?",
      a: "Oui, dans une logique quote-request only. Le prospect assemble un brief, pas une commande à encaisser. Les prix affichés sont des fourchettes catalogue ; le devis écrit tranche.",
    },
    {
      q: "Pourquoi certaines démos affichent « Calcul des configurations… » ?",
      a: "Sur les templates catalogue-first (menuiserie, stock), l’étape Catalogue charge les gammes et règles. Le message est un état de chargement live. Attendez quelques secondes puis continuez ; ce n’est pas un blocage du chrome boutique.",
    },
    {
      q: "Puis-je garder mon site WordPress et n’utiliser que la boutique devis ?",
      a: "Oui. Beaucoup d’équipes gardent le site corporate et publient la vitrine QuoteBuilder pour le catalogue + devis. L’important est que le clic « Demander un devis » mène à un brief structuré, pas à un mailto.",
    },
    {
      q: "Combien de temps pour tester en démo ?",
      a: "Zéro compte pour les trois URLs /devis listées plus haut. Pour votre propre boutique : compte Free, choix d’un template secteur, publish, test du chrome sur /devis.",
    },
  ],
  "sync-catalogue-woocommerce-shopify-parcours-devis": [
    {
      q: "La sync remplace-t-elle la boutique ?",
      a: "Non. Woo ou Shopify restent la source produits. QuoteBuilder pose ce catalogue dans un parcours de devis, avec Si/Alors et pipeline.",
    },
    {
      q: "Shopify est-il sur tous les plans ?",
      a: "WooCommerce dès Starter. Shopify à partir de Pro. Agency reprend la stack Pro en multi-comptes.",
    },
    {
      q: "Que devient une déclinaison Woo ?",
      a: "Photos, prix et variantes sont importés. Vous activez ou coupez une référence sans casser le funnel.",
    },
    {
      q: "Et si je n’ai pas de boutique ?",
      a: "Saisie manuelle ou CSV. La boutique native QuoteBuilder existe aussi : mini-site devis, sans paiement.",
    },
  ],
};
