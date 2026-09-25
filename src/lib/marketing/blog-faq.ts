import type { FaqItem } from "@/components/marketing/marketing-faq";

export const BLOG_FAQ: Record<string, FaqItem[]> = {
  "commentaires-annotations-devis-collaboratif-b2b": [
    {
      q: "Faut-il interdire totalement le mail pour clarifier un devis ?",
      a: "Non. Interdisez-en le rôle de salle de décision. Un prospect peut vous alerter par mail ; la décision utile doit atterrir en commentaire ancré sur le devis partagé (ou dans une nouvelle version).",
    },
    {
      q: "Que faire si un décideur n’a pas accès au lien ?",
      a: "Renvoyez le lien sécurisé (ou un accès espace prospect), pas un PDF. Sinon vous recréez le double canal.",
    },
    {
      q: "Comment gérer une demande qui change le chiffrage ?",
      a: "Ouvrez une nouvelle version du devis. Liez le commentaire déclencheur à cette version. Ne corrigez pas un PDF déjà en circulation sans historique.",
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
      a: "Tous les commentaires critiques (prix, périmètre, délai engageant). Un commentaire cosmétique peut rester en note. Définissez la règle en équipe.",
    },
    {
      q: "Quel lien avec la validité du devis ?",
      a: "Si la clarification dépasse la validité, renvoyez une version à jour.",
    },
    {
      q: "Peut-on démarrer sans outil collaboratif ?",
      a: "Oui, avec un Drive et un tableau « décisions » par devis. Vous gagnerez déjà face aux fils RE: RE:. Le lien sécurisé et les commentaires ancrés réduisent encore le forward et le multi-décideurs.",
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
      a: "Oui, et ça doit créer une nouvelle version document visible, pas écraser en silence sans que l’estimateur le sache.",
    },
    {
      q: "Quel lien avec la validité du devis ?",
      a: "Si le plan change après envoi, la proposition peut être caduque. Affichez la validité et, si besoin, renvoyez une version.",
    },
    {
      q: "Comment prioriser les dossiers sans photos ?",
      a: "SLA plus long, ou étape « cadrage express » avant chiffrage. Ne brûlez pas l’équipe estimateur sur des briefs vides.",
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
      a: "Souvent oui, ou au minimum les rendre accessibles de façon prouvable au moment de l’offre (lien versionné, annexe, espace prospect). Demandez à votre avocat ce qui est adapté à votre process d’acceptation.",
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
      a: "Un même lien, et le PIN du mail de confirmation. Évitez de multiplier les fichiers nominatifs.",
    },
    {
      q: "Que faire si le prospect refuse le lien et exige un PDF ?",
      a: "Envoyez l’export, mais notez-le dans le dossier. Proposez quand même le lien pour les questions et la signature. Mesurez combien de ces cas restent vraiment PDF-only après 30 jours.",
    },
    {
      q: "Les ouvertures de lien sont-elles fiables à 100 % ?",
      a: "Aucun tracking n’est parfait (préchargement mail, VPN, etc.). Elles restent nettement plus utiles que l’absence totale de signal du PDF joint.",
    },
    {
      q: "Lien vs signature : dans quel ordre ?",
      a: "D’abord un espace où le brief et les options sont clairs. Ensuite la signature ou l’acceptation. Signer un PDF figé trop tôt fige aussi les erreurs.",
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
      a: "La boutique sert l’achat en ligne et le SEO produit. La bibliothèque de devis sert le chiffrage : kits pose, options métier, prix HT B2B, lignes hors web. Les deux peuvent se synchroniser, mais leurs priorités diffèrent.",
    },
    {
      q: "Faut-il tout mettre en kits ?",
      a: "Non. Kits pour les assemblages fréquents, articles unitaires pour le reste. Trop de kits = maintenance. Trop peu = chiffrage lent.",
    },
    {
      q: "Comment gérer les prix qui changent souvent (matière) ?",
      a: "Versionnez ou datez les prix catalogue. Ne laissez pas chaque commercial ajuster au feeling. Documentez qui peut modifier le prix de référence.",
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
      a: "Archivez-les en lecture seule après migration des kits critiques. Garder Excel « au cas où » prolonge la double vérité.",
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
      a: "Sur la fonctionnalité catalogue, reliée au funnel et aux demandes. Compte Free ou démo publique pour tester le principe. L’estimateur gain temps catalogue chiffre l’ordre de grandeur.",
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
      a: "Utile si les devis sont sensibles ou multi-destinataires. Pour beaucoup de PME, un lien magique + traçage d’ouverture est un bon premier cran. Voir l’article espace prospect.",
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
      a: "Le lien vers un espace prospect réduit le risque de mauvais fichier si l’espace n’expose que l’active. Le PDF reste utile pour archivage et signatures hors ligne. Les deux doivent porter le même numéro de version.",
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
      a: "Les deux. L’automatisme propose, le commercial confirme. Recalibrez avec le close rate réel.",
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
      a: "Celle documentée par le package / README MCP. Aujourd’hui le défaut documenté est https://app.quotebuilder.io. L’URL canonique du produit web reste https://www.quotebuilder.co. En doute, recopiez exactement la valeur de votre doc interne ou du README du package, ne « corrigez » pas au feeling.",
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
