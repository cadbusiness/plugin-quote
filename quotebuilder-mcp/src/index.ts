#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { QuoteBuilderClient } from "./client.js";
import { isMcpDevisV0Enabled } from "./flags.js";
import { registerLeadTools } from "./tools/leads.js";
import { registerStatsTools } from "./tools/stats.js";
import { registerFunnelTools } from "./tools/funnels.js";
import { registerAutomationTools } from "./tools/automation.js";

const devisV0 = isMcpDevisV0Enabled();

const apiKey = process.env.QB_API_KEY?.trim();
if (!apiKey) {
  console.error("QB_API_KEY manquante. Ajoutez-la dans la config MCP (env).");
  process.exit(1);
}

const qb = new QuoteBuilderClient(apiKey, process.env.QB_API_URL);

const server = new McpServer(
  { name: "quotebuilder-mcp", version: "1.0.0" },
  {
    instructions: devisV0
      ? "QuoteBuilder MCP : CRM devis B2B. Outils devis (MCP_DEVIS_V0) : create_quote, list_quotes, get_quote_status. create_quote n’envoie pas les emails workflow sauf run_autopilot=true. Ne pas soumettre de session / PDF."
      : "QuoteBuilder MCP : CRM devis B2B. Utilisez get_leads / get_stats / list_funnels / trigger_followup pour agir dans le compte.",
  },
);

registerLeadTools(server, qb, { devisV0 });
registerStatsTools(server, qb);
registerFunnelTools(server, qb);
registerAutomationTools(server, qb);

const transport = new StdioServerTransport();
await server.connect(transport);
