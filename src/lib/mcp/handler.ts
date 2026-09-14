import { createMcpHandler, withMcpAuth } from "mcp-handler";
import { verifyMcpBearerToken } from "@/lib/mcp/auth";
import { registerQuoteBuilderTools } from "@/lib/mcp/tools";
import { MCP_RESOURCE_METADATA_PATH } from "@/lib/mcp/urls";

const handler = createMcpHandler(
  (server) => {
    registerQuoteBuilderTools(server);
  },
  {
    serverInfo: { name: "quotebuilder-mcp", version: "1.2.0" },
    instructions:
      "QuoteBuilder MCP : CRM devis B2B. Outils devis : create_quote, list_quotes, get_quote_status. create_quote n’envoie pas les emails workflow sauf run_autopilot=true. Ne pas soumettre de session / PDF.",
  },
);

export const mcpHttpHandler = withMcpAuth(handler, verifyMcpBearerToken, {
  required: true,
  requiredScopes: ["mcp"],
  resourceMetadataPath: MCP_RESOURCE_METADATA_PATH,
});
