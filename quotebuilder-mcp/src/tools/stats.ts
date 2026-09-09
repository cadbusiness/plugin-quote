import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { QuoteBuilderClient, errorResult, statsPeriodSchema, textResult } from "../client.js";

export function registerStatsTools(server: McpServer, qb: QuoteBuilderClient) {
  server.registerTool(
    "get_stats",
    {
      description:
        "Statistiques du compte : total leads, conversion, hot/warm/cold, abandons, CA potentiel.",
      inputSchema: {
        period: statsPeriodSchema.describe("Période : today, week, month ou custom"),
        from: z.string().optional().describe("Date début YYYY-MM-DD (custom)"),
        to: z.string().optional().describe("Date fin YYYY-MM-DD (custom)"),
      },
    },
    async (args) => {
      try {
        return textResult(await qb.getStats(args));
      } catch (error) {
        return errorResult(error);
      }
    },
  );
}
