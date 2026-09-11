Vous n’avez pas besoin d’un nouveau site pour arrêter de collecter des « bonjour, on voudrait un devis ». Vous avez besoin d’un parcours sur une page qui existe déjà. QuoteBuilder s’installe de deux façons : un **widget JavaScript** universel, ou le **plugin WordPress** (bloc Gutenberg + shortcode). Dans les deux cas, le design de votre thème reste le vôtre.

L’installation n’est pas le sujet difficile. Le sujet difficile, c’est de savoir **quoi** embarquer : un funnel publié, un catalogue à jour, une identité progressive, puis un autopilote. Ce texte détaille le branchement. La chaîne métier est celle de [comment ça marche](/comment-ca-marche).

## Avant d’installer quoi que ce soit

Créez un compte — le [plan Free](/tarifs) suffit pour voir l’interface : un funnel, le wizard, dix soumissions, sans carte. Publiez un parcours. Vérifiez l’URL publique `/c/…`. Si le brief est vide, le widget n’affichera qu’un formulaire déguisé. Relisez [formulaire vs funnel](/blog/formulaire-contact-vs-funnel-devis-b2b) avant de poser le snippet.

Décidez de la page d’entrée. Trois patterns tiennent la route.

**Page /devis dédiée.** Le funnel occupe le contenu. Moins de distractions. Idéal Ads : l’URL UTM pointe ici.

**Bouton sur une fiche produit.** Le widget s’ouvre au clic. Utile si le catalogue boutique reste la vitrine et que le devis est l’action.

**Bloc en milieu d’article.** Pour un secteur ([rayonnage](/secteurs/funnel-devis-rayonnage-stockage), habitat…), le contenu qualifie, le funnel convertit.

Évitez de remplacer brutalement le formulaire de contact du footer. Gardez-le pour le SAV. Le devis a sa page.

## Widget JavaScript : deux lignes, n’importe quel site

Le widget est fait pour Webflow, une vitrine HTML, un thème maison, Shopify (thème, pas l’admin), un site d’agence. Vous collez le script, vous pointez l’organisation et le funnel. Le parcours s’affiche en overlay ou inline selon le mode choisi dans le dashboard.

Ce que ça implique techniquement, sans jargon inutile :

- Le script se charge depuis QuoteBuilder. Pas de paquets npm à maintenir sur votre front.
- Le funnel tourne dans le contexte de votre page. Vous ne redirigez pas le prospect vers un autre univers visuel s’il n’y est pas obligé — l’URL publique reste disponible pour les campagnes.
- Les événements utiles (démarrage, soumission) peuvent remonter vers vos [stats](/fonctionnalites/stats) et, si vous l’avez branché, vers [Google Ads](/fonctionnalites/ads) via gclid / UTM.

Bonnes pratiques.

Placez le script une fois, dans le pied de page ou via votre gestionnaire de tags, pas une copie par bouton. Donnez à chaque CTA le même identifiant de funnel, sauf si vous avez vraiment deux parcours (ex. pro vs particulier).

Ne chargez pas le widget derrière un bandeau cookie trop agressif si le funnel est votre conversion principale. Vous n’êtes pas en train de poser un pixel publicitaire. Vous ouvrez un formulaire métier. Alignez le consentement avec votre [politique de confidentialité](/legal/confidentialite), mais ne bloquez pas l’outil de devis comme s’il s’agissait d’une régie.

Testez mobile. Un devis B2B commence souvent sur un téléphone, dans l’entrepôt ou sur un chantier. Si le premier écran demande trop de champs, le taux s’écroule. L’identité progressive existe pour ça.

## Plugin WordPress : bloc, shortcode, Woo en option

Le plugin QuoteBuilder s’installe comme n’importe quelle extension. Après appairage du compte, vous disposez d’un bloc Gutenberg et d’un shortcode. Vous posez le funnel dans une page, un article, un modèle de fiche.

Trois cas fréquents.

**WordPress vitrine, sans WooCommerce.** Le plugin affiche le funnel. Le catalogue se saisit dans QuoteBuilder ou s’importe en CSV. Vous n’avez pas besoin d’une boutique pour vendre sur devis.

**WordPress + WooCommerce.** Le plugin peut servir de pont : masquer un prix public, ouvrir une liste de devis, préremplir le funnel. La [sync catalogue](/blog/sync-catalogue-woocommerce-shopify-parcours-devis) évite de maintenir deux référentiels. Woo reste la source produits. QuoteBuilder reste le dossier.

**Multilingue / multi-sites.** Un funnel par langue ou par enseigne vaut mieux qu’un seul parcours avec des libellés vagues. Agency existe pour le multi-compte. N’essayez pas de tout faire tenir dans un unique wizard « fourre-tout ».

Le bloc Gutenberg évite de toucher au PHP. Si votre agence a verrouillé l’éditeur, le shortcode passe dans un widget classique. Dans les deux cas, vous ne forkez pas le thème.

## Ce que l’installation ne fait pas

Elle ne crée pas le brief. Un widget autour d’un funnel générique « nom / e-mail / message » est un formulaire de contact avec plus d’étapes. Posez les questions que le commercial pose au téléphone.

Elle ne remplace pas la première réponse humaine. L’[autopilote](/fonctionnalites/autopilote) confirme, relance, rappelle l’équipe à T+4 h. Il n’envoie pas une proposition chiffrée à votre place.

Elle ne configure pas Ads. L’URL du funnel, avec UTM, se colle dans Google Ads. QuoteBuilder mesure le devis et le gagné. Les enchères restent chez Google. Voir la page [Ads](/fonctionnalites/ads).

## Contrôle qualité en 20 minutes

Ouvrez la page en navigation privée. Parcourez le funnel jusqu’à l’e-mail. Abandonnez. Vérifiez que la session apparaît. Terminez une soumission de test. Ouvrez la fiche dans [Demandes](/fonctionnalites/demandes). Vérifiez le score, les réponses, les produits suggérés.

Envoyez-vous le mail T+0. Cliquez le lien [espace prospect](/fonctionnalites/espace-prospect). Déposez une photo. Si cette chaîne tient, l’install est bonne. Si un maillon manque, ne scalez pas le trafic Ads dessus.

## Performances et thème

Le script est volontairement léger par rapport à un builder de page. Évitez néanmoins de le combiner avec trois autres overlays (chat générique, popup newsletter, bandeau promo). Un seul overlay de conversion. Le reste se négocie.

Si votre thème charge jQuery en pied et casse l’ordre des scripts, passez par le plugin WordPress plutôt que par un snippet collé à la main dans `header.php`. Moins de conflits, mises à jour centralisées.

Cache (WP Rocket, etc.) : excluez la page devis du cache HTML trop agressif si vous voyez un funnel périmé après une publication. Le contenu marketing autour peut rester cache. Le bloc, lui, doit voir le funnel courant.

## Accessibilité et confiance

Titre de page clair : « Demander un devis », pas « Contact 2 ». Un H1 qui dit le métier. Un paragraphe qui dit le délai de réponse. Le widget n’a pas à porter tout le SEO de la page — le contenu autour, si, surtout sur une landing secteur.

Mentionnez qui traite la demande. Une PME qui montre une équipe réelle convertit mieux qu’un overlay anonyme. La page [à propos](/a-propos) côté QuoteBuilder pose l’éditeur (Vinci Liberta LTD, Dublin) ; la vôtre doit poser le commerçant.

## Erreurs d’intégration que l’on voit trop

**Deux funnels différents sur le même bouton.** Un A/B involontaire. Les stats mentent. Un identifiant, une page, une campagne.

**Le snippet dans un iframe lui-même dans un builder.** Double scroll, focus piégé, mobile cassé. Preférez le bloc Gutenberg ou un conteneur pleine largeur.

**Un overlay chat générique (Intercom, Tawk) qui recouvre le CTA devis.** Un seul canal de conversion visible. Le chat support peut rester plus bas, ou s’ouvrir après.

**UTM perdus.** Si Ads paie la page, le funnel doit recevoir la query string. QuoteBuilder la capture sur la session et le widget. Encore faut-il ne pas rediriger vers une URL « propre » qui strip les paramètres.

**Compte de test en production.** Un funnel brouillon collé sur /devis le jour du salon. Publiez. Vérifiez l’URL publique. Faites la soumission témoin.

## WordPress.com, builders, CSP

Sur un WordPress auto-hébergé, le plugin est le chemin le plus simple. Sur une offre verrouillée (certains plans WordPress.com), le JS universel peut être injecté via l’en-tête personnalisé, si l’hébergeur l’autorise. Sinon, une page /devis chez QuoteBuilder (URL publique) et un bouton « Demander un devis » qui y envoie : moins élégant, tout aussi mesurable.

Les builders (Elementor, Divi) aiment envelopper le HTML. Collez le shortcode dans un module HTML brut, pas dans un module « formulaire » du builder. Vous éviterez que le builder « aide » en filtrant le script.

Si votre Content-Security-Policy bloque les scripts tiers, autorisez l’origine QuoteBuilder. Sans ça, le widget reste une zone blanche. Ce n’est pas un bug du thème. C’est une politique de sécurité trop étroite pour un outil que vous avez choisi.

## SEO de la page qui porte le widget

Google indexe le contenu autour, pas le canvas du funnel. Rédigez 400 mots utiles au-dessus ou en dessous : qui vous êtes, délai de réponse, ce que le prospect doit préparer (plan, photos, contraintes). Une landing [secteur](/secteurs/funnel-devis-rayonnage-stockage) fait ce travail. Une page vide avec un overlay n’aide personne, ni le prospect, ni l’index.

Le titre et la meta de /devis doivent parler de devis, pas de « contact ». Canonical sur quotebuilder.co pour nos pages ; sur votre domaine pour les vôtres. N’ouvrez pas le funnel dans une URL paramétrée indexée en double.

## Après le snippet : le vrai travail

Branchez le catalogue. Activez un parcours de relances. Décidez qui est assigné par défaut. Posez le [générateur de séquence](/outils/generateur-sequence-relances) comme base, puis éditez le ton. Mesurez le CA laissé sur la table avec le [calculateur](/outils/cout-devis-non-relance).

L’install est un mardi matin. Le système, c’est le mois suivant : dossiers plus propres, moins de « vous avez reçu mon mail ? », moins de devis morts. Le widget n’est que la porte.

## Checklist de mise en production

- Compte QuoteBuilder créé, funnel **publié**, pas resté en brouillon.
- Page /devis avec H1 métier, délai de réponse, et le bloc ou le script.
- Soumission test visible dans Demandes, avec les bonnes réponses et le bon score.
- Mail T+0 reçu, lien espace prospect cliquable, PIN fonctionnel.
- Parcours autopilote en **Actif** (même minimal : confirmation + rappel 4 h).
- UTM d’une campagne test conservés jusqu’à la fiche.
- Formulaire de contact historique conservé ailleurs (SAV), plus sur cette URL.
- Cache de la page devis vérifié après une modification de step.
- Mobile : premier écran lisible, CTA non masqué par un chat.
- Une personne nommée pour lire les dossiers le jour J.

Si un seul item manque, vous avez un snippet, pas un canal. Revenez à [comment ça marche](/comment-ca-marche) avant d’acheter du trafic.

Le plan Free suffit pour cette checklist. Passez Starter (39 €/mois en annuel) quand les dix soumissions ne suffisent plus, ou Pro (79 €) pour Shopify, l’espace prospect complet et les flux jusqu’à J+30. L’install ne change pas avec le plan. Ce qui change, c’est ce que le dossier traverse après le clic.
