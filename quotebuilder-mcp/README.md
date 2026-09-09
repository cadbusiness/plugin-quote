# QuoteBuilder MCP

Serveur [Model Context Protocol](https://modelcontextprotocol.io) pour piloter QuoteBuilder depuis Claude Desktop (leads, stats, funnels, relances).

## Installation

```bash
npm install -g quotebuilder-mcp
```

Ou en local :

```bash
cd quotebuilder-mcp
npm install
npm run build
```

## Clé API

1. Dans QuoteBuilder : **Paramètres → API & webhooks**
2. Créer une clé `qb_live_…` (affichée une seule fois)
3. La coller dans la config Claude Desktop

## Claude Desktop

Dans `claude_desktop_config.json` :

```json
{
  "mcpServers": {
    "quotebuilder": {
      "command": "npx",
      "args": ["-y", "quotebuilder-mcp"],
      "env": {
        "QB_API_KEY": "qb_live_votre_cle",
        "QB_API_URL": "https://app.quotebuilder.io"
      }
    }
  }
}
```

En développement local (sans npm global) :

```json
{
  "mcpServers": {
    "quotebuilder": {
      "command": "node",
      "args": ["/chemin/vers/quotebuilder-mcp/dist/index.js"],
      "env": {
        "QB_API_KEY": "qb_live_votre_cle",
        "QB_API_URL": "http://localhost:3000"
      }
    }
  }
}
```

## Outils exposés

| Tool | Rôle |
|---|---|
| `get_leads` | Liste filtrée (statut, score, jours) |
| `get_lead_detail` | Fiche demande |
| `update_lead_status` | Statut + note optionnelle |
| `create_lead` | Création manuelle sur un funnel |
| `get_stats` | Conversion, hot/warm/cold, abandons, CA |
| `list_funnels` | Funnels de l’org |
| `get_funnel_performance` | Perf 30 j d’un funnel |
| `trigger_followup` | Relance `reminder_24h` / `nudge_3d` / `reactivation_30d` |
| `get_pending_followups` | Leads à relancer |

## Exemples

- « Montre-moi mes prospects chauds cette semaine »
- « Relance tous les leads en attente depuis 3 jours »
- « Quel est le taux de conversion de mon funnel rayonnage ce mois ? »
- « Crée un nouveau lead pour Jean Dupont… »

## API REST sous-jacente

Le client appelle l’API QuoteBuilder authentifiée par Bearer :

- `GET/POST /api/leads`
- `GET/PATCH /api/leads/:id`
- `GET /api/stats`
- `GET /api/funnels`
- `GET /api/funnels/:id/performance`
- `POST /api/automation/trigger`
- `GET /api/automation/pending`

## Publier (mainteneurs)

```bash
npm run build
npm publish --access public
```

Soumission directory Anthropic : [modelcontextprotocol.io](https://modelcontextprotocol.io) → Servers directory (manifest `mcp.json`).
