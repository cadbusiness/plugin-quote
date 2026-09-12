---
title: "Créer un devis avec Claude : QuoteBuilder MCP sur Claude Desktop"
slug: creer-devis-avec-claude-mcp
description: "Créer et suivre un devis B2B depuis Claude Desktop via QuoteBuilder MCP (create_quote, list_quotes, get_quote_status). Clé API, flag MCP_DEVIS_V0, process create→dossier, limites v0."
canonical: /blog/creer-devis-avec-claude-mcp
locale: fr-FR
word_count_target: 2200
keywords:
  - créer un devis avec Claude
  - QuoteBuilder MCP
  - devis B2B Claude Desktop
  - MCP devis
  - API QuoteBuilder Claude
author: QuoteBuilder
date: 2026-09-12
updated: 2026-09-12
---

# Créer un devis avec Claude : QuoteBuilder MCP sur Claude Desktop

Vous négociez dans Claude. Le brief est clair. Puis vous basculez dans un CRM, un tableur, un mail… et le devis « créé hors système » redevient un ticket flou. Owner absent, score absent, historique perdu.

Le problème n’est pas Claude. C’est le **trou entre la conversation et le dossier devis**.

QuoteBuilder MCP (package `quotebuilder-mcp`, feature live « Devis depuis Claude », changelog 1.14.0) branche Claude Desktop sur votre pipeline QuoteBuilder. Vous créez une demande, vous listez les dossiers, vous lisez le statut, puis vous ouvrez la fiche dans l’app. Sans recopier le brief à la main.

Public : fondateurs, commerciaux B2B et équipes qui chiffrent déjà dans QuoteBuilder (ou qui veulent tester le Free) et qui travaillent au quotidien dans Claude Desktop.

**Essayer le pipeline maintenant :** [créer un compte Free](https://www.quotebuilder.co/signup?plan=free) pour générer une clé API, ou [ouvrir la démo funnel rayonnage](https://www.quotebuilder.co/c/demo/rayonnage) (sans compte) pour voir d’où naît une demande scorée.


## Le problème : devis créés hors CRM

Un commercial efficace dans Claude produit vite : reformulation du besoin, options, objections, prochaines étapes. Le risque, c’est que ce travail reste **dans le chat**.

Conséquences classiques :

- le devis n’existe nulle part dans la file Demandes ;
- personne d’autre ne voit le dossier ;
- pas de score Hot / Warm, pas d’owner, pas d’alerte SLA ;
- les relances partent d’une boîte mail personnelle, pas du dossier.

Autrement dit : vous avez un **message intelligent**, pas un **dossier devis**. La différence est développée dans la [visite guidée du parcours devis B2B](/blog/visite-guidee-parcours-devis-b2b) : brief structuré, pipeline, fiche, automations.

QuoteBuilder MCP ne remplace pas le funnel public ni la boutique. Il ajoute une **porte d’entrée vendeur** : créer et suivre depuis Claude, dans le même système que vos demandes web.

![Accueil QuoteBuilder, KPIs et demandes scorées](/images/blog/creer-devis-avec-claude-mcp/02-accueil.png)
*Accueil `/accueil` : dès qu’un devis MCP est créé, il rejoint le même pipeline que les soumissions funnel.*


## Ce qu’est MCP ici (pas un gadget chat)

[MCP](https://modelcontextprotocol.io) (Model Context Protocol) est un protocole pour brancher des outils externes à un assistant (ici Claude Desktop). QuoteBuilder expose un serveur MCP : Claude appelle des **tools** authentifiés, qui wrappent l’API REST du compte.

Dans la v0 devis (flag `MCP_DEVIS_V0=1`), trois tools ciblent le cycle « créer / lister / statut » :

| Tool | Rôle métier |
|------|-------------|
| `create_quote` | Crée une demande / dossier côté QuoteBuilder (via `/api/leads`) |
| `list_quotes` | Liste les devis / demandes du compte |
| `get_quote_status` | Lit le statut (et le contexte utile) d’un dossier |

Point important : ces tools **wrappent `/api/leads`**. Ce n’est pas `submitQuote` (soumission publique / parcours prospect). Vous restez dans le monde **vendeur authentifié**, clé API Bearer `qb_live_…`.

Docs produit : `docs/mcp.md` dans le monorepo, package `quotebuilder-mcp`, site [quotebuilder.co](https://www.quotebuilder.co).

> Astuce. Parlez à Claude en langage métier (« crée un devis pour… », « liste les Hot de la semaine », « quel statut pour le dossier Léa ? »). Les tools font le pont ; vous n’avez pas à coller des URLs d’API dans le chat.


## Prérequis : compte, clé API, Claude Desktop

Avant d’activer le devis MCP :

1. Un compte QuoteBuilder (plan Free suffit pour démarrer) : [signup Free](https://www.quotebuilder.co/signup?plan=free).
2. Claude Desktop à jour, avec la config MCP activée.
3. Node / `npx` disponibles sur la machine (le serveur se lance via `npx -y quotebuilder-mcp`).
4. Une clé API `qb_live_…` créée dans **Paramètres → API & webhooks** (affichée une seule fois : stockez-la hors du chat).

L’écran Boutiques / intégrations rappelle la logique produit : brancher des sources (Woo, boutique hébergée, API) pour que le commercial travaille sur des dossiers, pas sur des copies.

![Boutiques et intégrations catalogue](/images/blog/creer-devis-avec-claude-mcp/08-integrations.png)
*Intégrations / boutiques : le MCP s’ajoute comme une autre façon d’alimenter et de lire le même système devis.*

> Attention. Ne collez jamais une clé `qb_live_…` dans un prompt public, un ticket Slack, ou un dépôt Git. Si elle fuit, révoquez-la dans Paramètres → API & webhooks et créez-en une nouvelle.


## Activer `MCP_DEVIS_V0` et brancher Claude Desktop

La feature devis MCP est derrière le flag d’environnement **`MCP_DEVIS_V0=1`**. Sans ce flag, le serveur MCP historique (leads, stats, funnels, follow-ups) reste disponible ; les tools `create_quote` / `list_quotes` / `get_quote_status` n’apparaissent pas.

Dans `claude_desktop_config.json` (config Claude Desktop), un bloc type ressemble à ceci (reprenez les valeurs de votre README / espace Paramètres ; n’inventez pas d’URL) :

```json
{
  "mcpServers": {
    "quotebuilder": {
      "command": "npx",
      "args": ["-y", "quotebuilder-mcp"],
      "env": {
        "QB_API_KEY": "qb_live_votre_cle",
        "QB_API_URL": "https://app.quotebuilder.io",
        "MCP_DEVIS_V0": "1"
      }
    }
  }
}
```

Notes de configuration :

- **`QB_API_KEY`** : obligatoire, clé `qb_live_…`.
- **`QB_API_URL`** : URL de base de l’API documentée dans le README du package `quotebuilder-mcp` (défaut documenté : `https://app.quotebuilder.io`). Le site marketing / app canonique reste [https://www.quotebuilder.co](https://www.quotebuilder.co). En local : `http://localhost:3000`.
- **`MCP_DEVIS_V0=1`** : active les tools devis v0.

Redémarrez Claude Desktop après sauvegarde. Dans un nouveau chat, Claude doit voir les tools QuoteBuilder (dont les trois devis si le flag est bien passé).

En développement local (sans npm global) :

```json
{
  "mcpServers": {
    "quotebuilder": {
      "command": "node",
      "args": ["/chemin/vers/quotebuilder-mcp/dist/index.js"],
      "env": {
        "QB_API_KEY": "qb_live_votre_cle",
        "QB_API_URL": "http://localhost:3000",
        "MCP_DEVIS_V0": "1"
      }
    }
  }
}
```


## Les 3 tools : create, list, status

### `create_quote`

Crée un dossier côté QuoteBuilder à partir du brief que vous avez construit dans Claude (contact, projet, contexte). Sous le capot : appel authentifié sur **`/api/leads`**, pas une soumission publique type funnel.

Paramètre critique : **`run_autopilot`**.

- **Défaut : `false`.** Aucun envoi d’e-mails / workflows liés à `quote.submitted` déclenchés « comme une soumission web ».
- Passez `true` seulement si vous voulez volontairement enclencher l’autopilote (confirmation, notifs, parcours demande).

C’est le garde-fou pour créer un devis **depuis Claude** sans spammer le prospect pendant que vous peaufinez le brief.

> Attention. En v0, `create_quote` ouvre / enrichit le dossier vendeur. Ce n’est pas l’équivalent d’un PDF signé, ni d’un `submitQuote` public avec PIN. Voir la section Limites plus bas.

### `list_quotes`

Liste les devis / demandes visibles pour la clé API. Utile pour : « montre les dossiers de cette semaine », « lesquels sont encore sans réponse ? », « filtre sur ce contact ».

Côté app, c’est la même logique que la file Demandes :

![Liste des demandes devis avec scores](/images/blog/creer-devis-avec-claude-mcp/03-devis.png)
*Liste `/devis` : les dossiers créés via MCP apparaissent dans la même file que les demandes funnel / boutique.*

### `get_quote_status`

Lit le statut d’un dossier (et le contexte utile pour décider : suite à donner, relance, appel). Complète la boucle : vous ne créez pas « dans le vide », vous **suivez** dans le même outil que le reste de l’équipe.

![Dossier devis détail, score et actions](/images/blog/creer-devis-avec-claude-mcp/04-devis-detail.png)
*Détail demande : après `get_quote_status`, ouvrez la fiche pour Écrire / Appeler / Relancer comme sur n’importe quel Hot.*


## Process métier : create → list → status → voir le dossier dans QB

Voici le process recommandé (équipe commerciale + Claude Desktop) :

**1. Qualifier dans Claude**  
Reformulez le besoin, les contraintes, la fourchette, l’urgence. Si le brief est trop flou, posez encore 2–3 questions avant de créer. Un mauvais `create_quote` pollue la file autant qu’un mauvais formulaire.

**2. Créer avec `create_quote` (`run_autopilot: false` par défaut)**  
Vous obtenez un dossier dans QuoteBuilder. Le commercial (ou vous) reste maître du premier contact.

**3. Vérifier avec `list_quotes`**  
Confirmez que le dossier est bien là, dans le bon contexte org, avec le bon contact.

**4. Suivre avec `get_quote_status`**  
Avant une relance ou un call, relisez le statut depuis Claude ou depuis l’app.

**5. Ouvrir la fiche dans QuoteBuilder**  
Pour le jugement commercial (visite site, multi-décideurs, objection prix), la fiche dossier reste la référence : score expliqué, historique, actions. Voir aussi [score demande devis B2B](/blog/score-demande-devis-b2b).

**6. (Option) Autopilote plus tard**  
Quand le brief est stable et que vous voulez la cadence e-mail, basculez volontairement sur un parcours automation / un `run_autopilot` true selon votre politique d’équipe. Les automations « demande » et « abandon » vivent toujours dans l’écran dédié :

![Automatisations parcours demande et abandon](/images/blog/creer-devis-avec-claude-mcp/05-automations.png)
*`run_autopilot` false évite de déclencher ces parcours trop tôt ; true les aligne sur une vraie soumission métier.*

Ce process répond au vrai KPI : **zéro devis fantôme**. Tout ce qui est chiffrable existe dans `/devis`, pas seulement dans l’historique Claude.


## Limites v0 (à dire clairement à l’équipe)

La v0 « Devis depuis Claude (MCP) » est volontairement bornée. Ce n’est pas un échec produit ; c’est un périmètre.

| Inclus en v0 | Hors scope v0 |
|--------------|---------------|
| `create_quote`, `list_quotes`, `get_quote_status` | Génération / envoi PDF devis |
| Auth clé `qb_live_…` | PIN prospect / parcours public |
| Wrap `/api/leads` | `submitQuote` (soumission funnel publique) |
| `run_autopilot` (défaut false) | Remplacer tout le CRM dans le chat |
| Flag `MCP_DEVIS_V0=1` | Parité complète avec chaque bouton UI |

Autrement dit : MCP v0 = **créer et suivre des dossiers vendeur** depuis Claude. Le chiffrage fin, le PDF, le partage prospect, le scoring affiné et les relances riches restent dans QuoteBuilder (et dans vos funnels / boutiques, voir [devis en ligne intégré boutique](/blog/devis-en-ligne-integre-boutique)).

> Astuce. Présentez MCP à l’équipe comme un **raccourci d’entrée**, pas comme « Claude qui vend tout seul ». Le commercial garde le jugement ; le système garde la mémoire.


## Checklist de mise en place

1. Compte QuoteBuilder actif ([Free](https://www.quotebuilder.co/signup?plan=free) ou supérieur).
2. Clé API créée dans **Paramètres → API & webhooks** (`qb_live_…`), stockée en gestionnaire de secrets.
3. Claude Desktop installé ; `npx` / Node OK.
4. Bloc `mcpServers.quotebuilder` ajouté dans `claude_desktop_config.json`.
5. `QB_API_URL` = valeur documentée du package (défaut README : `https://app.quotebuilder.io`) ; site utilisateur : `https://www.quotebuilder.co`.
6. `MCP_DEVIS_V0=1` présent dans `env`.
7. Redémarrage Claude Desktop ; tools visibles dans un nouveau chat.
8. Premier test : `create_quote` avec `run_autopilot` false sur un contact fictif.
9. Vérifier la présence du dossier dans `/devis` et sur l’accueil.
10. `list_quotes` puis `get_quote_status` sur l’id créé.
11. Ouvrir la fiche dans l’UI ; assigner owner + SLA.
12. Décider en équipe quand (et si) `run_autopilot` true est autorisé.


## FAQ

### C’est quoi QuoteBuilder MCP ?

Un serveur [Model Context Protocol](https://modelcontextprotocol.io) (package npm `quotebuilder-mcp`) qui expose des tools Claude Desktop pour lire et écrire dans votre compte QuoteBuilder (leads / devis, stats, funnels, automations selon la version). La feature devis v0 ajoute `create_quote`, `list_quotes`, `get_quote_status`.

### Faut-il un compte payant ?

Non pour démarrer : [créez un compte Free](https://www.quotebuilder.co/signup?plan=free), générez une clé API, branchez Claude. Les plafonds et options avancées suivent votre plan ([tarifs](/tarifs)).

### Quelle URL mettre dans `QB_API_URL` ?

Celle documentée par le package / README MCP. Aujourd’hui le défaut documenté est `https://app.quotebuilder.io`. L’URL canonique du produit web reste `https://www.quotebuilder.co`. En doute, recopiez exactement la valeur de votre doc interne ou du README du package, ne « corrigez » pas au feeling.

### `create_quote` envoie-t-il un e-mail au prospect ?

Pas par défaut. `run_autopilot` vaut **false** sauf si vous le forcez à true. C’est voulu : créer depuis Claude ≠ publier une soumission web avec workflows `quote.submitted`.

### Pourquoi pas `submitQuote` ?

`submitQuote` correspond au monde **public / prospect** (funnel, boutique, token / PIN selon parcours). Les tools MCP devis v0 wrappent **`/api/leads`** avec une clé vendeur. Deux portes, un pipeline.

### Claude remplace-t-il le score Hot / Warm ?

Non. Le score et la priorisation restent dans QuoteBuilder (et dans votre grille métier). MCP vous aide à **créer et lire** le dossier ; la priorisation se joue dans la file Demandes. Méthode : [score demande devis B2B](/blog/score-demande-devis-b2b).

### Où voir le devis après création ?

Dans l’app : accueil, liste `/devis`, fiche détail. Depuis Claude : `list_quotes` et `get_quote_status`. Si rien n’apparaît, vérifiez la clé, l’org, le flag `MCP_DEVIS_V0`, et les logs MCP de Claude Desktop.

### Puis-je générer le PDF depuis Claude en v0 ?

Non. Hors scope v0. Générez / envoyez le PDF depuis QuoteBuilder une fois le dossier propre.


## Conclusion

Créer un devis avec Claude n’a d’intérêt que si le devis **existe** ensuite dans le CRM devis : owner, statut, score, historique. QuoteBuilder MCP (v0, flag `MCP_DEVIS_V0=1`) pose exactement ce pont :

1. authentification par clé `qb_live_…` ;
2. `create_quote` (wrap `/api/leads`, autopilote off par défaut) ;
3. `list_quotes` / `get_quote_status` pour suivre ;
4. ouverture de la fiche dans [QuoteBuilder](https://www.quotebuilder.co) pour le travail commercial.

Limites assumées : pas de PDF, pas de PIN / `submitQuote` public dans cette v0. Le funnel et la boutique restent les portes prospect ; Claude Desktop devient une porte **vendeur**.

**Prochaine étape :** [créer un compte Free](https://www.quotebuilder.co/signup?plan=free) et générer votre clé API, [rejouer le funnel démo](https://www.quotebuilder.co/c/demo/rayonnage), ou [ouvrir la boutique démo](https://www.quotebuilder.co/b/demo/vitrine) pour comparer entrée web vs entrée MCP.

Pour aller plus loin : [visite guidée parcours devis B2B](/blog/visite-guidee-parcours-devis-b2b), [devis en ligne intégré boutique](/blog/devis-en-ligne-integre-boutique), [score demande devis B2B](/blog/score-demande-devis-b2b), [docs MCP](https://www.quotebuilder.co) (`docs/mcp.md` / package `quotebuilder-mcp`).
