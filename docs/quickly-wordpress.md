# Quickly — chat WordPress (pitch)

Org `quickly`, funnel `rayonnage`. Le chat est la surface principale : la page WordPress embarque QuoteBuilder, elle n’affiche pas le site marketing.

Les relances (abandon et après demande) existent en **brouillon**. Le moteur n’envoie que les parcours `active`. Ne pas les passer en actif pendant le pitch, et ne pas soumettre de demande test vers un contact Quickly (`info@quickly-int.com` compris).

## Shortcode

Sur le site de test Hostinger (domaine temporaire **mintcream**, `*.hostingersite.com`) :

```
[quotebuilder org="quickly" id="rayonnage" height="720px"]
```

Équivalent HTML, si la page n’utilise pas le shortcode :

```html
<div data-quotebuilder data-org="quickly" data-id="rayonnage" data-height="720px"></div>
<script src="https://www.quotebuilder.co/widget.js" async></script>
```

Sur mobile (largeur ≤ 640 px) le widget prend `calc(100svh - 4.5rem)` pour laisser le bandeau du thème, et le chat défile à l’intérieur du cadre. Au-dessus, la hauteur du shortcode est respectée (`height`, défaut `720px`).

URL directe du cadre : `https://www.quotebuilder.co/embed/quickly/rayonnage`  
Page publique : `https://www.quotebuilder.co/c/quickly/rayonnage`

Le titre de ces pages est celui du commerçant (funnel · organisation). Le slogan marketing QuoteBuilder n’y est pas repris.

## Préremplissage (catalogue Woo + specs)

Le widget recopie la query string de la page WordPress dans l’iframe, y compris `besoin`, `add` et `product` (déjà lus par le funnel). Exemple de lien ou de page :

```
?besoin=rayonnages&add=SKU-WOO
```

`add` et `product` acceptent un id produit, un SKU Woo ou l’id externe Woo. `besoin` coche la gamme du funnel (valeur ou libellé).

Le plugin 2.3.11 peut aussi poser ces valeurs sur le shortcode (elles ne remplacent pas la query string si elle est déjà là) :

```
[quotebuilder org="quickly" id="rayonnage" height="720px" besoin="rayonnages" add="SKU-WOO"]
```

Le chat interroge le catalogue Woo du funnel `rayonnage`. Les mesures déjà stockées sur les produits (hauteur, largeur, longueur, unité) et la colonne `products.specs` sont envoyées à l’agent et affichées sur la fiche. L’embed ouvre le chat ; le parcours formulaire reste disponible via le bouton Funnel.

Tant que la migration n’est pas appliquée, l’API publique force quand même `chat` pour l’org `quickly`.

## Connecter le site mintcream

1. WordPress admin du site mintcream → **Extensions** → installer ou mettre à jour QuoteBuilder (zip `/quotebuilder-wp.zip`, ou la mise à jour proposée dans Extensions). WooCommerce doit être actif.
2. Menu **QuoteBuilder**.
3. **J’ai déjà un compte** (pas « Créer un compte »). Cela ouvre `https://www.quotebuilder.co/integrations/plugin/connect` avec l’URL du site.
4. Se connecter à l’espace **Quickly** (`slug` `quickly`) et choisir le funnel **rayonnage**.
5. Au retour, le plugin importe le catalogue Woo. L’écran QuoteBuilder affiche l’espace et le funnel. **Synchroniser les produits** relance l’import si besoin.
6. Coller le shortcode ci-dessus dans la page (bloc HTML ou shortcode). Publier.
7. Vérifier le chat sur la page, y compris en largeur mobile. Un lien avec `?besoin=` et `?add=` doit arriver prérempli dans le cadre.

Adresse QuoteBuilder si le site pointe encore vers un ancien hôte : réglage avancé du plugin, `https://www.quotebuilder.co`, puis **Enregistrer l’adresse** et reconnecter.

## Relances (brouillons, aucun envoi)

Dans l’app, espace Quickly → **Automatisations** :

| Parcours | Déclencheur | Statut |
|---|---|---|
| Relance abandon — Quickly | Session abandonnée (1 h, puis 24 h) | Brouillon |
| Relance après demande — Quickly | Demande soumise (confirmation, brief, relances) | Brouillon |

Les modèles d’email manquants sont créés s’ils n’existent pas. Les textes déjà personnalisés ne sont pas écrasés. Rien n’est envoyé tant que le parcours reste en brouillon.

Ré-appliquer les brouillons sans réactiver ni envoyer :

```bash
npm run seed:quickly-relances
```

`--pause-active` repasse les parcours **déjà actifs** de l’org `quickly` en brouillon. À n’utiliser que pour ce pitch : un second passage après une activation volontaire les couperait à nouveau.
