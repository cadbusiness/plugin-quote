import { z } from "zod";
import type { AuthInfo, McpServer } from "@modelcontextprotocol/server";
import {
  apiCreateLead,
  apiGetLeadDetail,
  apiGetLeads,
  apiGetQuoteStatus,
  apiUpdateLeadStatus,
  type LeadScore,
  type LeadStatusSlug,
} from "@/lib/api/leads";
import { apiGetStats, type StatsPeriod } from "@/lib/api/stats";
import { apiGetFunnelPerformance, apiListFunnels } from "@/lib/api/funnels";
import { apiGetPendingFollowups, apiTriggerFollowup, type FollowupTemplate } from "@/lib/api/automation";
import { organizationIdFromAuth } from "@/lib/mcp/auth";
import { errorResult, textResult } from "@/lib/mcp/results";

const leadStatusSchema = z.enum(["new", "contacted", "in_progress", "won", "lost", "waiting"]);
const leadScoreSchema = z.enum(["hot", "warm", "cold"]);
const statsPeriodSchema = z.enum(["today", "week", "month", "custom"]);
const followupTemplateSchema = z.enum(["reminder_24h", "nudge_3d", "reactivation_30d"]);

function orgId(auth?: AuthInfo) {
  return organizationIdFromAuth(auth);
}

export function registerQuoteBuilderTools(server: McpServer) {
  server.registerTool(
    "get_leads",
    {
      title: "Lister les demandes",
      description: "Récupère les demandes de devis QuoteBuilder (statut, score hot/warm/cold, période).",
      inputSchema: z.object({
        status: leadStatusSchema.optional().describe("Statut CRM"),
        score: leadScoreSchema.optional().describe("Score lead"),
        days: z.number().int().positive().optional().describe("Leads des X derniers jours"),
      }),
    },
    async (args, ctx) => {
      try {
        return textResult({
          leads: await apiGetLeads(orgId(ctx.http?.authInfo), {
            status: args.status as LeadStatusSlug | undefined,
            score: args.score as LeadScore | undefined,
            days: args.days,
          }),
        });
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.registerTool(
    "get_lead_detail",
    {
      title: "Détail d’une demande",
      description: "Détail d’une demande (réponses, score, notes, activités, pipeline).",
      inputSchema: z.object({
        lead_id: z.string().describe("ID du lead / devis"),
      }),
    },
    async ({ lead_id }, ctx) => {
      try {
        const lead = await apiGetLeadDetail(orgId(ctx.http?.authInfo), lead_id);
        if (!lead) return errorResult(new Error("Lead introuvable"));
        return textResult({ lead });
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.registerTool(
    "update_lead_status",
    {
      title: "Mettre à jour le statut",
      description: "Met à jour le statut d’un lead et ajoute une note interne optionnelle.",
      inputSchema: z.object({
        lead_id: z.string(),
        status: z.string().describe("Slug statut : new, contacted, in_progress, won, lost, waiting"),
        note: z.string().optional(),
      }),
    },
    async (args, ctx) => {
      try {
        return textResult({ lead: await apiUpdateLeadStatus(orgId(ctx.http?.authInfo), args) });
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.registerTool(
    "create_lead",
    {
      title: "Créer une demande",
      description: "Crée une demande de devis manuelle (contact + réponses wizard) et déclenche les workflows.",
      inputSchema: z.object({
        name: z.string(),
        email: z.string().email(),
        phone: z.string().optional(),
        company: z.string().optional().describe("Société (B2B)"),
        funnel_id: z.string().describe("ID du funnel / configurateur"),
        data: z.record(z.string(), z.unknown()).optional().describe("Réponses wizard (clé → valeur)"),
      }),
    },
    async (args, ctx) => {
      try {
        return textResult({
          lead: await apiCreateLead(orgId(ctx.http?.authInfo), { ...args, run_autopilot: true }),
        });
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.registerTool(
    "list_quotes",
    {
      title: "Lister les devis",
      description: "Liste les devis (alias get_leads). Filtres statut CRM, score, période.",
      inputSchema: z.object({
        status: leadStatusSchema.optional().describe("Statut CRM"),
        score: leadScoreSchema.optional().describe("Score lead"),
        days: z.number().int().positive().optional().describe("Devis des X derniers jours"),
      }),
    },
    async (args, ctx) => {
      try {
        return textResult({
          leads: await apiGetLeads(orgId(ctx.http?.authInfo), {
            status: args.status as LeadStatusSlug | undefined,
            score: args.score as LeadScore | undefined,
            days: args.days,
          }),
        });
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.registerTool(
    "get_quote_status",
    {
      title: "Statut d’un devis",
      description: "Statut seul d’un devis : id, status, score, assignation, funnel. Pas de réponses ni notes.",
      inputSchema: z.object({
        quote_id: z.string().describe("ID du devis"),
      }),
    },
    async ({ quote_id }, ctx) => {
      try {
        const quote = await apiGetQuoteStatus(orgId(ctx.http?.authInfo), quote_id);
        if (!quote) return errorResult(new Error("Devis introuvable"));
        return textResult({ quote });
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.registerTool(
    "create_quote",
    {
      title: "Créer un devis",
      description:
        "Crée un devis (alias create_lead). run_autopilot=false par défaut : pas d’emails / workflows quote.submitted.",
      inputSchema: z.object({
        name: z.string(),
        email: z.string().email(),
        phone: z.string().optional(),
        company: z.string().optional().describe("Société (B2B)"),
        funnel_id: z.string().describe("ID du funnel / configurateur"),
        data: z.record(z.string(), z.unknown()).optional().describe("Réponses wizard (clé → valeur)"),
        run_autopilot: z
          .boolean()
          .optional()
          .describe("Si true, déclenche les workflows quote.submitted (emails). Défaut false."),
      }),
    },
    async (args, ctx) => {
      try {
        return textResult({
          lead: await apiCreateLead(orgId(ctx.http?.authInfo), {
            ...args,
            run_autopilot: args.run_autopilot === true,
          }),
        });
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.registerTool(
    "get_stats",
    {
      title: "Statistiques du compte",
      description: "Statistiques du compte : total leads, conversion, hot/warm/cold, abandons, CA potentiel.",
      inputSchema: z.object({
        period: statsPeriodSchema.describe("Période : today, week, month ou custom"),
        from: z.string().optional().describe("Date début YYYY-MM-DD (custom)"),
        to: z.string().optional().describe("Date fin YYYY-MM-DD (custom)"),
      }),
    },
    async (args, ctx) => {
      try {
        return textResult({
          stats: await apiGetStats(orgId(ctx.http?.authInfo), {
            period: args.period as StatsPeriod,
            from: args.from,
            to: args.to,
          }),
        });
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.registerTool(
    "list_funnels",
    {
      title: "Lister les funnels",
      description: "Liste les funnels / configurateurs de l’organisation.",
      inputSchema: z.object({}),
    },
    async (_args, ctx) => {
      try {
        return textResult({ funnels: await apiListFunnels(orgId(ctx.http?.authInfo)) });
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.registerTool(
    "get_funnel_performance",
    {
      title: "Performance d’un funnel",
      description: "Performance d’un funnel sur 30 jours (conversion, pipeline, gagnés).",
      inputSchema: z.object({
        funnel_id: z.string(),
      }),
    },
    async ({ funnel_id }, ctx) => {
      try {
        const performance = await apiGetFunnelPerformance(orgId(ctx.http?.authInfo), funnel_id);
        if (!performance) return errorResult(new Error("Funnel introuvable"));
        return textResult({ performance });
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.registerTool(
    "trigger_followup",
    {
      title: "Déclencher une relance",
      description: "Déclenche une relance email pour un lead (reminder_24h, nudge_3d, reactivation_30d).",
      inputSchema: z.object({
        lead_id: z.string(),
        template: followupTemplateSchema,
      }),
    },
    async (args, ctx) => {
      try {
        return textResult({
          followup: await apiTriggerFollowup(orgId(ctx.http?.authInfo), {
            lead_id: args.lead_id,
            template: args.template as FollowupTemplate,
          }),
        });
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.registerTool(
    "get_pending_followups",
    {
      title: "Relances en attente",
      description: "Liste les leads ouverts qui nécessitent une relance.",
      inputSchema: z.object({}),
    },
    async (_args, ctx) => {
      try {
        return textResult({ followups: await apiGetPendingFollowups(orgId(ctx.http?.authInfo)) });
      } catch (error) {
        return errorResult(error);
      }
    },
  );
}
