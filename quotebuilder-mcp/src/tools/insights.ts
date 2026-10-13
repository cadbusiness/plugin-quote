import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { QuoteBuilderClient, errorResult, textResult } from "../client.js";

const READ_ONLY = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false };
const WRITE_NOTE = { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false };
const WRITE_ASSIGN = { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false };

const periodShape = {
  days: z.number().int().min(1).max(366).optional().describe("Derniers X jours (défaut 30). Ignoré si from est fourni."),
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().describe("Date début YYYY-MM-DD (UTC)"),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().describe("Date fin YYYY-MM-DD incluse"),
};

/** Google Ads, attribution, catalogue et actions CRM (notes, assignation). Mêmes outils que le serveur hébergé. */
export function registerInsightTools(server: McpServer, qb: QuoteBuilderClient) {
  server.registerTool(
    "get_ads_performance",
    {
      description:
        "Par campagne Google Ads : dépense, clics, impressions, devis, gagnés, coût par devis, coût par client gagné, ROAS estimé.",
      inputSchema: { ...periodShape, campaign: z.string().optional().describe("Nom (contient) ou ID de campagne") },
      annotations: READ_ONLY,
    },
    async (args) => {
      try {
        return textResult(await qb.getAdsPerformance(args));
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.registerTool(
    "get_attribution_breakdown",
    {
      description:
        "Devis / gagnés / valeur estimée par canal, utm_source, utm_medium, utm_campaign, avec la part de devis portant un gclid.",
      inputSchema: {
        ...periodShape,
        group_by: z.enum(["source", "source_medium", "campaign", "full"]).optional(),
        limit: z.number().int().min(1).max(200).optional(),
      },
      annotations: READ_ONLY,
    },
    async (args) => {
      try {
        return textResult(await qb.getAttributionBreakdown(args));
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.registerTool(
    "get_conversion_uploads",
    {
      description:
        "Diagnostic des conversions hors ligne envoyées à Google Ads : envoyées / ignorées / en erreur, motifs, dernières erreurs, pistes.",
      inputSchema: { ...periodShape, status: z.enum(["uploaded", "skipped", "error", "pending"]).optional() },
      annotations: READ_ONLY,
    },
    async (args) => {
      try {
        return textResult(await qb.getConversionUploads(args));
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.registerTool(
    "search_catalog",
    {
      description:
        "Recherche produits du catalogue synchronisé (nom, SKU, SKU de variation, catégorie) avec prix HT, stock et variations.",
      inputSchema: {
        query: z.string().optional(),
        category: z.string().optional(),
        funnel_id: z.string().optional(),
        in_stock_only: z.boolean().optional(),
        include_inactive: z.boolean().optional(),
        limit: z.number().int().min(1).max(50).optional(),
        max_variants: z.number().int().min(0).max(100).optional(),
      },
      annotations: READ_ONLY,
    },
    async (args) => {
      try {
        return textResult(await qb.searchCatalog(args));
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.registerTool(
    "get_lead_timeline",
    {
      description: "Chronologie d’une demande : statuts, assignations, notes, messages, conversions Google Ads.",
      inputSchema: { lead_id: z.string(), limit: z.number().int().min(1).max(300).optional() },
      annotations: READ_ONLY,
    },
    async ({ lead_id, limit }) => {
      try {
        return textResult(await qb.getLeadTimeline(lead_id, limit));
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.registerTool(
    "list_team",
    {
      description: "Membres actifs de l’organisation (user_id, email, rôle) à qui assigner une demande.",
      inputSchema: {},
      annotations: READ_ONLY,
    },
    async () => {
      try {
        return textResult(await qb.listTeam());
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.registerTool(
    "add_lead_note",
    {
      description: "Ajoute une note interne (invisible du prospect) sur une demande. N’envoie aucun email.",
      inputSchema: { lead_id: z.string(), content: z.string().min(1).max(5000) },
      annotations: WRITE_NOTE,
    },
    async (args) => {
      try {
        return textResult(await qb.addLeadNote(args));
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.registerTool(
    "assign_lead",
    {
      description:
        "Assigne une demande à un membre actif (email ou user_id). mode add (défaut), replace ou remove. Notifie le membre ajouté, jamais le prospect.",
      inputSchema: {
        lead_id: z.string(),
        assignee: z.string().min(1),
        mode: z.enum(["add", "replace", "remove"]).optional(),
        notify: z.boolean().optional(),
      },
      annotations: WRITE_ASSIGN,
    },
    async (args) => {
      try {
        return textResult(await qb.assignLead(args));
      } catch (error) {
        return errorResult(error);
      }
    },
  );
}
