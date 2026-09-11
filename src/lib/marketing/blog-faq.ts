import type { FaqItem } from "@/components/marketing/marketing-faq";

export const BLOG_FAQ: Record<string, FaqItem[]> = {
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
