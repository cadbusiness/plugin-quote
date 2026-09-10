import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { QuoteBuilderClient, errorResult, textResult } from "../client.js";

export function registerFunnelTools(server: McpServer, qb: QuoteBuilderClient) {
  server.registerTool(
    "list_funnels",
    {
      description: "Liste les funnels / configurateurs de l’organisation.",
      inputSchema: {},
    },
    async () => {
      try {
        return textResult(await qb.listFunnels());
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.registerTool(
    "get_funnel_performance",
    {
      description: "Performance d’un funnel sur 30 jours (conversion, pipeline, gagnés).",
      inputSchema: {
        funnel_id: z.string(),
      },
    },
    async ({ funnel_id }) => {
      try {
        return textResult(await qb.getFunnelPerformance(funnel_id));
      } catch (error) {
        return errorResult(error);
      }
    },
  );
}
