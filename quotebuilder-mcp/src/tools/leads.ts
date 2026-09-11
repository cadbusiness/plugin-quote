import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  QuoteBuilderClient,
  errorResult,
  leadScoreSchema,
  leadStatusSchema,
  textResult,
} from "../client.js";
import { isMcpDevisV0Enabled } from "../flags.js";

export function registerLeadTools(
  server: McpServer,
  qb: QuoteBuilderClient,
  options: { devisV0?: boolean } = {},
) {
  const devisV0 = options.devisV0 ?? isMcpDevisV0Enabled();

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
        company: z.string().optional().describe("Société (B2B)"),
        funnel_id: z.string().describe("ID du funnel / configurateur"),
        data: z.record(z.string(), z.unknown()).optional().describe("Réponses wizard (clé → valeur)"),
      },
    },
    async (args) => {
      try {
        return textResult(await qb.createLead({ ...args, run_autopilot: true }));
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  if (!devisV0) return;

  server.registerTool(
    "list_quotes",
    {
      description:
        "Liste les devis (alias get_leads). Filtres statut CRM dont waiting, score, période.",
      inputSchema: {
        status: leadStatusSchema.optional().describe("Statut CRM"),
        score: leadScoreSchema.optional().describe("Score lead"),
        days: z.number().int().positive().optional().describe("Devis des X derniers jours"),
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
    "get_quote_status",
    {
      description:
        "Statut seul d’un devis : id, status, score, assignation, funnel. Pas de réponses ni notes.",
      inputSchema: {
        quote_id: z.string().describe("ID du devis"),
      },
    },
    async ({ quote_id }) => {
      try {
        return textResult(await qb.getQuoteStatus(quote_id));
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.registerTool(
    "create_quote",
    {
      description:
        "Crée un devis (alias create_lead). run_autopilot=false par défaut : pas d’emails / workflows quote.submitted.",
      inputSchema: {
        name: z.string(),
        email: z.string().email(),
        phone: z.string().optional(),
        company: z.string().optional().describe("Société (B2B)"),
        funnel_id: z.string().describe("ID du funnel / configurateur"),
        data: z.record(z.string(), z.unknown()).optional().describe("Réponses wizard (clé → valeur)"),
        run_autopilot: z
          .boolean()
          .optional()
          .default(false)
          .describe("Si true, déclenche les workflows quote.submitted (emails). Défaut false."),
      },
    },
    async (args) => {
      try {
        return textResult(
          await qb.createLead({
            ...args,
            run_autopilot: args.run_autopilot === true,
          }),
        );
      } catch (error) {
        return errorResult(error);
      }
    },
  );
}
