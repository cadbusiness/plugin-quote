# Brancher QuoteBuilder à Claude, ChatGPT ou Cursor

*Guide pour le marchand et son agence Google Ads. Aucune compétence technique requise.*

## En deux lignes

Le connecteur QuoteBuilder (protocole MCP) permet à votre assistant IA de **lire vos demandes de devis, vos statistiques, vos campagnes Google Ads et votre catalogue**, et, si vous le lui demandez, d’**ajouter une note, assigner un commercial ou changer un statut**. Vous posez la question en français, l’assistant va chercher les chiffres dans QuoteBuilder.

## L’adresse à copier

```
https://www.quotebuilder.co/api/mcp
```

C’est la seule chose à retenir. L’adresse historique `https://quotebuilder-weld.vercel.app/api/mcp` fonctionne aussi (même serveur, mêmes données). N’utilisez pas `https://quotebuilder.co/api/mcp` sans `www` : elle redirige, et certains assistants ne suivent pas la redirection.

Vous la retrouvez aussi dans QuoteBuilder : **Paramètres → API & webhooks**, bloc « URL MCP ».

## Qui peut connecter ?

- **Connexion par compte (OAuth, recommandé)** : la personne qui clique sur « Autoriser » doit être **propriétaire ou admin** de l’organisation QuoteBuilder. Un commercial voit « Droits insuffisants ».
- **Connexion par clé API** : seul un admin peut créer la clé (Paramètres → API & webhooks).
- **Agence Google Ads** : le plus propre est que le marchand invite l’agence comme membre de l’équipe QuoteBuilder (rôle admin le temps du branchement), ou crée une clé API dédiée nommée « Agence X », révocable à tout moment.

Une connexion donne accès à **une seule organisation** : celle choisie au moment de l’autorisation (ou celle de la clé). Elle ne voit jamais les données d’un autre marchand.

---

## Claude (claude.ai, Claude Desktop, Claude mobile)

Disponible avec un abonnement Claude payant (Pro, Max, Team, Enterprise).

1. Ouvrez **claude.ai → Paramètres → Connecteurs**.
2. Cliquez **Ajouter un connecteur personnalisé**.
3. Nom : `QuoteBuilder`. URL : `https://www.quotebuilder.co/api/mcp`. Laissez les champs OAuth avancés (client ID / secret) **vides**.
4. Cliquez **Ajouter**, puis **Se connecter** : une page QuoteBuilder s’ouvre. Connectez-vous si besoin, vérifiez le nom de l’organisation, cliquez **Autoriser**.
5. Dans une conversation, activez QuoteBuilder dans le menu des outils (icône « + » ou « Recherche et outils »).

Le connecteur ajouté sur claude.ai apparaît automatiquement dans **Claude Desktop** et l’app mobile avec le même compte.

**Claude Team / Enterprise** : c’est le propriétaire de l’espace Claude qui ajoute le connecteur dans les paramètres d’administration (Connecteurs) ; chaque membre clique ensuite « Se connecter » avec son propre compte QuoteBuilder.

Les **prompts prêts à l’emploi** (voir plus bas) apparaissent dans le menu « + » de Claude sous QuoteBuilder.

## ChatGPT (web et Desktop)

Disponible sur les offres qui autorisent les connecteurs personnalisés (Plus, Pro, Business, Enterprise, Edu ; les libellés évoluent souvent).

1. **Paramètres → Applications et connecteurs → Paramètres avancés** : activez le **mode développeur**.
2. Revenez dans **Applications et connecteurs**, cliquez **Créer** (ou « Ajouter une application »).
3. Nom : `QuoteBuilder`. URL du serveur MCP : `https://www.quotebuilder.co/api/mcp`. Authentification : **OAuth**. Laissez client ID / secret vides.
4. Validez, connectez-vous à QuoteBuilder, **Autoriser**.
5. Dans une conversation : « + » → **Mode développeur** / sélectionnez QuoteBuilder.

ChatGPT demande une confirmation avant chaque action d’écriture (note, assignation, statut). C’est normal : lisez-la et validez.

Sur les comptes Business / Enterprise, un admin de l’espace ChatGPT doit parfois autoriser les connecteurs personnalisés avant que les membres puissent les ajouter.

## Claude Code (terminal)

```bash
claude mcp add --transport http quotebuilder https://www.quotebuilder.co/api/mcp
```

Puis dans Claude Code tapez `/mcp`, choisissez **quotebuilder → Authenticate** : le navigateur s’ouvre sur la page d’autorisation QuoteBuilder.

Avec une clé API à la place d’OAuth :

```bash
claude mcp add --transport http quotebuilder https://www.quotebuilder.co/api/mcp \
  --header "Authorization: Bearer qb_live_VOTRE_CLE"
```

## Cursor (et autres éditeurs : Windsurf, VS Code…)

Fichier `~/.cursor/mcp.json` (ou **Settings → MCP → Add new MCP server**) :

```json
{
  "mcpServers": {
    "quotebuilder": {
      "url": "https://www.quotebuilder.co/api/mcp"
    }
  }
}
```

Cursor propose alors de se connecter (OAuth). Si votre version ne le fait pas, ajoutez la clé API :

```json
{
  "mcpServers": {
    "quotebuilder": {
      "url": "https://www.quotebuilder.co/api/mcp",
      "headers": { "Authorization": "Bearer qb_live_VOTRE_CLE" }
    }
  }
}
```

## Alternative : la clé API

Pour les outils qui ne gèrent pas OAuth (scripts, n8n, Make, anciens clients) :

1. QuoteBuilder → **Paramètres → API & webhooks** → **Créer une clé**. Donnez-lui un nom parlant (« Agence Ads », « Claude Desktop Marc »).
2. Copiez la clé `qb_live_…` : **elle ne s’affiche qu’une fois**.
3. Dans l’outil, ajoutez l’en-tête `Authorization: Bearer qb_live_…` avec l’URL ci-dessus.

Une clé n’expire pas : révoquez-la dès qu’elle ne sert plus (même page, bouton **Révoquer**).

Pour Claude Desktop **en local** sans compte Claude payant, le package `quotebuilder-mcp` (stdio) fonctionne avec la même clé : voir `quotebuilder-mcp/README.md`.

---

## Sécurité

- **Cloisonnement** : chaque connexion est rattachée à une organisation ; tous les outils filtrent sur cette organisation côté serveur.
- **Lecture vs écriture** : les outils de lecture sont marqués « lecture seule » (l’assistant peut les appeler sans vous déranger). Les outils d’écriture sont marqués comme tels : Claude et ChatGPT vous demandent confirmation.
- **Aucun email au prospect sans demande explicite** : `create_quote` n’envoie rien par défaut ; seul `trigger_followup` envoie un email de relance au prospect (et un changement de statut peut déclencher vos automatisations).
- **Révocation** :
  - clé API : Paramètres → API & webhooks → Révoquer (effet immédiat) ;
  - connexion OAuth : supprimez le connecteur dans Claude / ChatGPT. Le jeton reste techniquement valide jusqu’à 30 jours côté serveur : en cas de doute (ordinateur perdu, départ d’un collaborateur, fin de contrat d’agence), demandez au support QuoteBuilder de le révoquer.
- **Durées** : jeton OAuth 30 jours, renouvelé automatiquement (90 jours sans utilisation = reconnexion).
- Ne collez jamais une clé `qb_live_` dans une conversation, un email ou un document partagé.

---

## Les outils disponibles

| Outil | Ce qu’il fait | Type |
|---|---|---|
| `list_quotes` / `get_leads` | Liste des demandes (statut, score chaud / tiède / froid, X derniers jours) | Lecture |
| `get_lead_detail` | Fiche complète : réponses du prospect, lignes, montants, notes, assignés | Lecture |
| `get_lead_timeline` | Historique d’une demande : statuts, assignations, notes, messages, conversions Google Ads | Lecture |
| `get_quote_status` | Statut seul d’un devis | Lecture |
| `get_stats` | Visiteurs, demandes, taux de conversion, abandons, CA potentiel | Lecture |
| `list_funnels` | Vos configurateurs / funnels | Lecture |
| `get_funnel_performance` | Performance d’un funnel sur 30 jours | Lecture |
| `get_pending_followups` | Demandes ouvertes à relancer | Lecture |
| `get_ads_performance` | Par campagne Google Ads : dépense, clics, impressions, CTR, CPC, devis, gagnés, coût par devis, coût par client gagné, ROAS estimé | Lecture |
| `get_attribution_breakdown` | Devis, gagnés et valeur par canal / utm_source / utm_medium / utm_campaign, part avec gclid, part sans suivi | Lecture |
| `get_conversion_uploads` | Diagnostic des conversions envoyées à Google Ads : envoyées, ignorées, en erreur, motifs, pistes de correction | Lecture |
| `search_catalog` | Recherche produits (nom, SKU, SKU de variation, catégorie) : prix HT, stock, variations | Lecture |
| `list_team` | Membres de l’équipe à qui assigner une demande | Lecture |
| `add_lead_note` | Ajoute une note interne (invisible du prospect) | Écriture |
| `assign_lead` | Assigne / remplace / retire un commercial (le commercial est notifié, pas le prospect) | Écriture |
| `update_lead_status` | Change le statut (+ note) ; peut déclencher vos automatisations et la conversion « gagné » Google Ads | Écriture |
| `create_quote` / `create_lead` | Crée une demande manuelle (aucun email sauf demande explicite) | Écriture |
| `trigger_followup` | **Envoie** un email de relance au prospect | Écriture (email) |

Prompts prêts à l’emploi (menu « + » dans Claude) :

- **rapport_hebdo_ads** : rapport Google Ads de la semaine, comparé à la semaine précédente.
- **leads_a_relancer** : demandes à relancer aujourd’hui avec un message proposé.
- **preparer_devis** : proposition de produits / quantités / prix à partir d’une demande ou d’un besoin.

---

## Exemples de questions

### Commercial au quotidien

1. « Quelles demandes chaudes sont arrivées depuis lundi et ne sont toujours pas contactées ? »
2. « Montre-moi l’historique complet de la demande de la société Atelier Sud. »
3. « Assigne toutes les demandes de rayonnage de plus de 5 000 € reçues cette semaine à Léa. » *(l’assistant listera les demandes et vous demandera confirmation)*
4. « Ajoute une note sur la demande de Martin : rappeler jeudi 10 h, attend validation du plan. »
5. « Quelles demandes sont en attente depuis plus de 7 jours ? Propose un message de relance pour chacune, sans rien envoyer. »

### Pilotage (dirigeant)

6. « Combien de demandes ce mois-ci, combien de gagnées, et quel CA potentiel en cours ? »
7. « Quel funnel convertit le mieux sur les 30 derniers jours ? »
8. « Qui dans l’équipe a le plus de demandes ouvertes non traitées ? »
9. « Compare septembre et octobre : demandes, taux de conversion, gagnés. »

### Agence Google Ads

10. « Donne-moi le coût par devis et le coût par client gagné de chaque campagne sur les 30 derniers jours. »
11. « Quelle campagne coûte le plus cher par client gagné ? Que proposes-tu de faire du budget ? »
12. « Quelle part des devis Google Ads porte un gclid ? Lesquels n’en ont pas ? »
13. « Pourquoi des conversions n’ont pas été envoyées à Google Ads cette semaine ? »
14. « Répartis les devis du trimestre par source / medium / campagne, avec le taux de gain. »
15. « Y a-t-il des devis Google Ads qui ne correspondent à aucune campagne ? Quels utm_campaign faut-il renommer ? »
16. « Prépare mon rapport hebdo pour le client » *(ou le prompt `rapport_hebdo_ads`)*.

### Catalogue et devis

17. « Quels rayonnages mi-lourds de 2 m de haut sont en stock, et à quel prix ? »
18. « Trouve le produit dont le SKU est RML-2010 et ses variations. »
19. « À partir de la demande de Dupont Logistique, propose une liste de produits et un total HT. » *(ou le prompt `preparer_devis`)*
20. « Le prospect veut 40 mètres linéaires d’étagères charge lourde : que proposes-tu dans notre catalogue ? »

---

## Limites à connaître

- **Dépense Google Ads** : visible seulement si le compte Google Ads est connecté (menu Acquisition). Elle est synchronisée une fois par jour : les chiffres du jour sont incomplets.
- **Rattachement devis ↔ campagne** : par le paramètre `utm_campaign` des liens d’annonce (nom ou ID de la campagne). Une campagne mal nommée apparaît dans « devis Google Ads non rattachés ».
- **Valeurs estimées** : `revenue_estimate`, `won_value_estimate` et `roas_estimate` viennent des lignes de devis (moyenne des devis chiffrés pour une demande sans ligne). Ce n’est pas un CA facturé.
- **Devis venant du plugin WordPress / WooCommerce** : l’attribution (utm, gclid) de ces devis est en cours de fiabilisation ; certains peuvent encore apparaître en « Direct » ou sans gclid. Les chiffres Google Ads de ces devis sont à lire avec prudence d’ici la mise à jour.
- **Catalogue** : état au dernier passage de synchronisation WooCommerce / Shopify ; le stock exact peut avoir bougé depuis. Prix affichés HT tels que synchronisés.
- **Pas de création de devis PDF ni d’envoi de devis** par l’assistant : il prépare la proposition, l’envoi se fait dans QuoteBuilder.
- **Pas de modification des campagnes Google Ads** : QuoteBuilder mesure, il ne pilote pas les enchères.
- Révocation d’une connexion OAuth côté QuoteBuilder : pas encore de bouton (passer par le support), contrairement aux clés API.

## En cas de problème

| Symptôme | Que faire |
|---|---|
| « Droits insuffisants » à l’autorisation | Se connecter avec un compte propriétaire / admin de l’organisation |
| « Application inconnue » | Supprimer le connecteur dans Claude / ChatGPT et le recréer |
| Le connecteur ne trouve pas le serveur | Vérifier l’URL exacte, avec `www` et `/api/mcp` à la fin |
| « Clé API invalide ou révoquée » | Recréer une clé dans Paramètres → API & webhooks |
| Aucune dépense Google Ads | Connecter Google Ads dans Acquisition, attendre la synchronisation du lendemain |
