import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { QuoteBuilderClient, errorResult, followupTemplateSchema, textResult } from "../client.js";

export function registerAutomationTools(server: McpServer, qb: QuoteBuilderClient) {
  server.registerTool(
    "trigger_followup",
    {
      description:
        "Déclenche une relance email pour un lead (reminder_24h, nudge_3d, reactivation_30d).",
      inputSchema: {
        lead_id: z.string(),
        template: followupTemplateSchema,
      },
    },
    async (args) => {
      try {
        return textResult(await qb.triggerFollowup(args));
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.registerTool(
    "get_pending_followups",
    {
      description: "Liste les leads ouverts qui nécessitent une relance.",
      inputSchema: {},
    },
    async () => {
      try {
        return textResult(await qb.getPendingFollowups());
      } catch (error) {
        return errorResult(error);
      }
    },
  );
}
