---
cover: /images/blog/sync-catalogue-woocommerce-shopify-parcours-devis/06-produits.png
---

Un catalogue boutique et un catalogue de devis ne servent pas le même moment. WooCommerce et Shopify excellent à afficher un prix, une photo, un panier. Le devis B2B commence quand le prix public ne suffit plus : charge, délai, variante, pose, minimum de commande, exception.

La tentation est de tout resaisir dans un deuxième outil. C’est ainsi que naissent les écarts : un SKU à jour dans Woo, une vieille fourchette dans le PDF, un commercial qui promet une référence désactivée. La sync QuoteBuilder existe pour une seule raison : **une source produits, un parcours de devis à côté, pas à la place**.

## Ce que la sync importe (et ce qu’elle ne promet pas)

Depuis [Intégrations](/fonctionnalites/integrations), WooCommerce et Shopify envoient produits, descriptions, photos, prix, déclinaisons. Import initial, sync planifiée, webhooks. Vous activez ou coupez une référence dans QuoteBuilder sans supprimer la fiche boutique.

WooCommerce est disponible dès Starter. Shopify à partir de Pro. Agency reprend la stack en multi-comptes. Les [tarifs](/tarifs) annuels affichés par défaut : 39 / 79 / 159 € par mois.

La sync **n’est pas** un checkout. QuoteBuilder ne remplace pas le paiement Woo / Shopify. La boutique native QuoteBuilder, si vous l’utilisez, est un mini-site de devis : pages, SEO, catalogue, pas d’encaissement. Anthropic décrit des agents commerce retail ; ici le vertical est le **devis PME**. Claude aide à cadrer. Le commerçant garde le catalogue et la soumission.

![Catalogue démo WooCommerce, alertes à compléter](/images/blog/sync-catalogue-woocommerce-shopify-parcours-devis/06-produits.png)
*Espace démo : sync Woo, produits sans prix / sans SKU, prêts pour le parcours de devis.*

## Pourquoi le parcours a besoin du catalogue réel

Sans catalogue, le funnel pose des questions abstraites. Avec catalogue, chaque réponse peut **suggérer**. C’est le Si/Alors : « réserve sèche + allée étroite » n’affiche pas la même gamme qu’« picking + forte rotation ». Le prospect voit ce que vous livrez. Vous recevez des lignes, pas un roman.

Les effets apparaissent assez vite. Une référence hors stock ou hors métier se désactive, elle sort du parcours, le commercial arrête de dire non après coup. Le budget indicatif arrive plus tôt (prix min / max ou fourchette, selon ce que vous exposez) : assez pour scorer, pas assez pour se substituer à la proposition finale. Et le brief que l’autopilote peut citer change tout. Relancer « votre configuration rayonnage 4 m, 400 kg » n’a rien à voir avec « je reviens vers vous concernant votre demande ». Voir [pourquoi les devis meurent sans relance](/blog/pourquoi-les-devis-meurent-sans-relance).

## WooCommerce : le cas le plus fréquent

Beaucoup de PME ont déjà Woo pour une vitrine, parfois avec des prix cachés, parfois avec un panier que personne n’utilise. Le plugin WordPress QuoteBuilder peut masquer prix / panier, lister les demandes, préremplir le funnel. La sync alimente le catalogue côté QuoteBuilder.

Le schéma propre est assez simple. Woo reste le référentiel produits (photos, déclinaisons, catégories). QuoteBuilder importe et synchronise. Les règles Si/Alors se posent dans QuoteBuilder, pas dans un plugin de logique Woo bricolé. Le [widget ou le bloc](/blog/installer-widget-devis-wordpress-javascript) ouvre le parcours sur le site. La [demande](/fonctionnalites/demandes) arrive scorée. L’[autopilote](/fonctionnalites/autopilote) enchaîne.

Ce que vous ne faites pas : recopier les SKU dans un tableur « pour le commercial ». Ce tableur a déjà trahi quelqu’un cette année.

## Shopify : même idée, autre admin

Shopify est souvent plus propre sur le média et les variantes. L’app personnalisée en `read_products` suffit pour l’import. Vous ne construisez pas un storefront Hydrogen pour vendre sur devis. Vous branchez le catalogue, vous gardez le checkout Shopify pour ce qui se paie en ligne (pièces, accessoires, standard) et vous orientez le sur-mesure vers le funnel.

Mélange d’ailleurs fréquent : 80 % du catalogue est commandable. 20 % est du projet. Ce 20 % produit souvent 80 % du CA. Le mettre dans le même panier que les consommables est un mensonge UX. Deux CTA : « Acheter » (Shopify) et « Configurer un devis » (QuoteBuilder). La sync garantit que les 20 % ont les bonnes photos et les bons noms.

## Boutique native vs boutique syncée

QuoteBuilder propose aussi un mini-site `/b/…` : templates, builder, chat, SEO / GEO, `llms.txt` de boutique. Utile si vous n’avez pas de site, ou si vous voulez une vitrine devis séparée de la marque e-commerce.

Si vous avez déjà Woo ou Shopify, n’ouvrez pas une troisième vérité produit. Sync + widget sur le site actuel. La boutique native reste une option, pas une obligation.

## Qualité de sync : ce qu’il faut vérifier

Les noms doivent rester lisibles. Un titre SEO Shopify n’est pas un libellé de step. Ajustez ce que le prospect voit dans le funnel. Sur les prix, fourchettes plutôt que prix public : en B2B, afficher le prix TTC d’une travée sans la pose ment un peu. Préférez une fourchette et un score, puis la proposition.

Une photo de gamme vaut mieux que vingt déclinaisons illisibles sur mobile. Côté fréquence, webhooks pour les changements, sync planifiée en filet. Un import manuel « un jour » redevient un tableur. Et n’activez pas tout : tout importer puis tout afficher noie le prospect. Activez le périmètre du funnel. Le reste attend.

## Règles Si/Alors : le catalogue devient un peu plus utile

La sync apporte les fiches. Les règles apportent le métier. « Si hauteur > 6 m alors gamme X. » « Si usage alimentaire alors inox. » Sans règles, le catalogue est une liste. Avec règles, le parcours se comporte comme un commercial junior honnête : il ne propose que ce qui passe.

Ces règles sont dans QuoteBuilder, pas dans le thème. Elles survivent à un changement de prestataire WordPress. Elles se lisent. Elles se coupent.

## Mesurer autre chose que « produits importés »

Un import à 400 SKU n’est pas un succès. Un succès, c’est plutôt : moins d’appels de requalification, plus de dossiers avec produits, un coût par devis Ads qui baisse parce que le brief est meilleur, un [écart de closing](/outils/cout-devis-non-relance) que vous pouvez montrer.

Les [stats par funnel](/fonctionnalites/stats) existent pour ça. Un funnel « projet » et un funnel « rechange » n’ont pas le même tunnel. Ne les mélangez pas dans un unique wizard parce que la sync a tout mis dans le même seau.

## Mettre en route sans projet SI

Compte Pro (Shopify) ou Starter (Woo). Connecter. Importer. Désactiver 90 % des SKU. Construire un funnel court sur 10 références. Publier le widget. Envoyer le trafic de la page devis existante. Regarder cinq dossiers. Alors seulement, élargir le catalogue.

L’erreur classique est l’inverse : tout synchroniser, tout afficher, s’étonner que le prospect se perde, conclure que « le configurateur ne marche pas ». Ce n’est pas le configurateur. C’est un hypermarché sans allées.

## Gouvernance : qui a le droit de toucher à quoi

Sans règle claire, la sync redevient un tableur. Décidez qui crée une fiche (en général, la personne déjà responsable de Woo / Shopify ; QuoteBuilder n’est pas un second PIM), qui active dans le funnel (souvent le commercial ou l’admin devis ; une nouveauté boutique n’a pas à surgir dans un parcours projet le lendemain), qui écrit les Si/Alors (quelqu’un qui connaît les exceptions : inox, délai, minimum ; pas un stagiaire « pour tester »), et qui coupe. Une rupture, une gamme arrêtée, une photo mensongère : désactivation le jour même. La sync ne doit pas réactiver toute seule une fiche que vous avez volontairement retirée du devis. Vérifiez le comportement d’un réimport avant d’automatiser.

Documentez ça en dix lignes dans l’équipe. Ce n’est pas de la processite. C’est ce qui empêche le brief de mentir.

## Variantes, nomenclatures, langues

Les déclinaisons Shopify (couleur, dimension) ne sont pas toujours des choix de devis. Un rack en RAL 5010 vs 7035, oui. Vingt longueurs au centimètre, non : le commercial tranche, ou un champ texte « cote exacte » suffit. Importer n’oblige pas à exposer.

Les SKU internes (« RAY-400-A-OLD ») ne doivent pas s’afficher au prospect. Utilisez le nom commercial. Gardez le SKU pour la fiche et l’export.

Si vous vendez en FR / EN / DE, un funnel par langue reste plus propre qu’un toggle bricolé dans un step. Les fiches peuvent rester dans une langue pivot si vos commerciaux requalifient ; le parcours, lui, doit être lisible sans dictionnaire.

## Quand ne pas synchroniser

Catalogue de 30 références stables : un CSV ou une saisie manuelle est plus simple. Vous éviterez un connecteur pour un tarif qui change deux fois par an.

Catalogue chaotique, doublons, photos manquantes : nettoyez d’abord la boutique. La sync photographie le désordre. Elle ne le range pas.

Projet 100 % sur-mesure sans référence : le funnel peut vivre avec des questions et zéro produit. Le catalogue n’est pas obligatoire. Il devient utile dès qu’une gamme revient souvent dans les propositions.

## Conclusion

WooCommerce et Shopify savent vendre ce qui a un prix. QuoteBuilder sait faire entrer ce qui a un brief. La sync est le pont : les fiches restent où elles sont maintenues, le parcours devient le dossier, l’autopilote a enfin quelque chose de précis à relancer.

Deux référentiels, c’est deux versions qui divergent. Un référentiel, un funnel, un pipeline : c’est un système de devis. Le reste est de la saisie.

## Après la première semaine de sync

Relisez cinq dossiers. Combien citent un produit réel ? Combien sont encore des romans ? Si le ratio est mauvais, ce n’est pas « la sync ». Ce sont les steps : trop de champ libre, pas assez de choix de gamme. Raccourcissez. Activez moins de SKU. Ajoutez une règle.

Vérifiez les photos cassées. Une image 404 dans un funnel tue plus la confiance qu’un prix manquant. La boutique peut tolérer un média absent ; le devis, moins.

Puis branchez l’[autopilote](/fonctionnalites/autopilote). Un catalogue juste sans relance, c’est un tarif plus propre dans une boîte mail. Le but de la sync n’est pas la propreté pour elle-même. C’est de pouvoir dire, à J+3 : « votre configuration série L, 400 kg, 12 ml est toujours ouverte ». Sans fiches justes, cette phrase est un mensonge. Avec, elle est une relance.

Les [tarifs](/tarifs) : Woo dès Starter (39 €/mois en annuel), Shopify dès Pro (79 €/mois). Agency si plusieurs boutiques clientes. Free pour voir l’UI, pas pour une sync boutique.

Un dernier test simple : prenez une référence que vous venez de renommer dans Woo ou Shopify. Attendez le webhook ou lancez une sync. Le funnel doit afficher le nouveau nom sans que vous touchiez un step. Si ce n’est pas le cas, le pont n’est pas en place. Le commercial, lui, croit qu’il l’est. C’est exactement le genre d’écart qui fait renaître le tableur. Fermez-le avant d’annoncer que « le catalogue est branché ».

Comptez aussi le délai. Un webhook qui met vingt minutes, ce n’est pas grave. Un import qui n’arrive jamais, si. Notez qui a lancé la dernière sync, et sur quelle boutique. Trois comptes Shopify plus tard, personne ne sait plus laquelle alimente le funnel.
