import { createMcpHandler, withMcpAuth } from "mcp-handler";
import { verifyMcpBearerToken } from "@/lib/mcp/auth";
import { registerQuoteBuilderPrompts } from "@/lib/mcp/prompts";
import { registerQuoteBuilderTools } from "@/lib/mcp/tools";
import { MCP_RESOURCE_METADATA_PATH_FOR_RESOURCE, originFromRequest } from "@/lib/mcp/urls";

const handler = createMcpHandler(
  (server) => {
    registerQuoteBuilderTools(server);
    registerQuoteBuilderPrompts(server);
  },
  {
    serverInfo: { name: "quotebuilder-mcp", version: "1.3.0" },
    instructions: [
      "QuoteBuilder MCP : CRM devis B2B d’un marchand (une organisation par connexion).",
      "Devis : list_quotes / get_leads, get_lead_detail, get_lead_timeline, get_quote_status, create_quote (aucun email sauf run_autopilot=true).",
      "Pilotage : get_stats, list_funnels, get_funnel_performance, get_pending_followups.",
      "Google Ads : get_ads_performance (dépense → devis → gagnés par campagne), get_attribution_breakdown (utm / gclid), get_conversion_uploads (diagnostic des conversions hors ligne).",
      "Catalogue : search_catalog (prix, stock, variations) pour préparer un devis.",
      "Écriture : update_lead_status, add_lead_note, assign_lead (list_team pour trouver le commercial), trigger_followup (envoie un email au prospect : demander confirmation avant).",
      "revenue_estimate = estimation à partir des lignes de devis (moyenne des devis chiffrés si non chiffré), pas un CA facturé.",
    ].join(" "),
  },
);

/**
 * Le challenge 401 (`WWW-Authenticate: resource_metadata=…`) pointe vers l’hôte réellement
 * appelé (liste blanche) et vers la metadata RFC 9728 du chemin /api/mcp.
 */
export async function mcpHttpHandler(req: Request) {
  return withMcpAuth(handler, verifyMcpBearerToken, {
    required: true,
    requiredScopes: ["mcp"],
    resourceUrl: originFromRequest(req),
    resourceMetadataPath: MCP_RESOURCE_METADATA_PATH_FOR_RESOURCE,
  })(req);
}
