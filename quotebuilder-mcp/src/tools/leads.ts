import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  QuoteBuilderClient,
  errorResult,
  leadScoreSchema,
  leadStatusSchema,
  textResult,
} from "../client.js";

export function registerLeadTools(server: McpServer, qb: QuoteBuilderClient) {
  server.registerTool(
    "get_leads",
    {
      description:
        "Récupère les demandes de devis QuoteBuilder avec filtres (statut, score hot/warm/cold, période).",
      inputSchema: {
        status: leadStatusSchema.optional().describe("Statut CRM"),
        score: leadScoreSchema.optional().describe("Score lead"),
        days: z.number().int().positive().optional().describe("Leads des X derniers jours"),
      },
    },
    async (args) => {
      try {
        return textResult(await qb.getLeads(args));
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.registerTool(
    "get_lead_detail",
    {
      description: "Détail d’une demande (réponses, score, notes, activités, pipeline).",
      inputSchema: {
        lead_id: z.string().describe("ID du lead / devis"),
      },
    },
    async ({ lead_id }) => {
      try {
        return textResult(await qb.getLeadDetail(lead_id));
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.registerTool(
    "update_lead_status",
    {
      description: "Met à jour le statut d’un lead et ajoute une note interne optionnelle.",
      inputSchema: {
        lead_id: z.string(),
        status: z.string().describe("Slug statut : new, contacted, in_progress, won, lost, waiting"),
        note: z.string().optional(),
      },
    },
    async (args) => {
      try {
        return textResult(await qb.updateLeadStatus(args));
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.registerTool(
    "create_lead",
    {
      description: "Crée une demande de devis manuelle (contact + réponses wizard).",
      inputSchema: {
        name: z.string(),
        email: z.string().email(),
        phone: z.string().optional(),
        funnel_id: z.string().describe("ID du funnel / configurateur"),
        data: z.record(z.string(), z.unknown()).optional().describe("Réponses wizard (clé → valeur)"),
      },
    },
    async (args) => {
      try {
        return textResult(await qb.createLead(args));
      } catch (error) {
        return errorResult(error);
      }
    },
  );
}
