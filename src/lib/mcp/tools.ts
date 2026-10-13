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
import { apiGetAdsPerformance, apiGetAttributionBreakdown, apiGetConversionUploads } from "@/lib/api/insights";
import { ATTRIBUTION_GROUPS, MAX_PERIOD_DAYS } from "@/lib/api/insights-core";
import { apiSearchCatalog } from "@/lib/api/catalog";
import { apiAddLeadNote, apiAssignLead, apiGetLeadTimeline, apiListTeam } from "@/lib/api/crm";
import { ASSIGN_MODES, NOTE_MAX_LENGTH } from "@/lib/api/crm-core";
import { organizationIdFromAuth } from "@/lib/mcp/auth";
import { errorResult, textResult } from "@/lib/mcp/results";
import { registerFunnelConfigTools } from "@/lib/mcp/funnel-tools";

const leadStatusSchema = z.enum(["new", "contacted", "in_progress", "won", "lost", "waiting"]);
const leadScoreSchema = z.enum(["hot", "warm", "cold"]);
const statsPeriodSchema = z.enum(["today", "week", "month", "custom"]);
const followupTemplateSchema = z.enum(["reminder_24h", "nudge_3d", "reactivation_30d"]);

const periodShape = {
  days: z
    .number()
    .int()
    .min(1)
    .max(MAX_PERIOD_DAYS)
    .optional()
    .describe("Derniers X jours (défaut 30). Ignoré si from est fourni."),
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().describe("Date début YYYY-MM-DD (UTC)"),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().describe("Date fin YYYY-MM-DD incluse (défaut aujourd’hui)"),
};

/** MCP tool annotations: lets Claude / ChatGPT skip confirmation on reads and ask before writes. */
const READ_ONLY = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false };
const WRITE_NOTE = { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false };
const WRITE_ASSIGN = { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false };
/** Status changes can start workflows (emails) and Google Ads conversion uploads. */
const WRITE_STATUS = { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true };
const WRITE_CREATE = { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true };
const SENDS_EMAIL = { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true };

function orgId(auth?: AuthInfo) {
  return organizationIdFromAuth(auth);
}

function userIdFromAuth(auth?: AuthInfo) {
  const id = auth?.extra?.userId;
  return typeof id === "string" && id ? id : null;
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
      annotations: READ_ONLY,
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
      annotations: READ_ONLY,
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
      annotations: WRITE_STATUS,
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
      description:
        "Crée une demande de devis manuelle (contact + réponses wizard). N’envoie aucun email sauf si run_autopilot vaut true.",
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
          .describe("Si true, déclenche les workflows quote.submitted (emails au prospect). Défaut false."),
      }),
      annotations: WRITE_CREATE,
    },
    async (args, ctx) => {
      try {
        // Same default as create_quote: an assistant must opt in before emailing a prospect.
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
    "list_quotes",
    {
      title: "Lister les devis",
      description: "Liste les devis (alias get_leads). Filtres statut CRM, score, période.",
      inputSchema: z.object({
        status: leadStatusSchema.optional().describe("Statut CRM"),
        score: leadScoreSchema.optional().describe("Score lead"),
        days: z.number().int().positive().optional().describe("Devis des X derniers jours"),
      }),
      annotations: READ_ONLY,
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
      annotations: READ_ONLY,
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
      annotations: WRITE_CREATE,
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
      annotations: READ_ONLY,
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
      description: "Liste les funnels / configurateurs de l’organisation (get_funnel pour le détail).",
      inputSchema: z.object({}),
      annotations: READ_ONLY,
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
      annotations: READ_ONLY,
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
      annotations: SENDS_EMAIL,
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
      annotations: READ_ONLY,
    },
    async (_args, ctx) => {
      try {
        return textResult({ followups: await apiGetPendingFollowups(orgId(ctx.http?.authInfo)) });
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.registerTool(
    "get_lead_timeline",
    {
      title: "Historique d’une demande",
      description:
        "Chronologie complète d’une demande : changements de statut, assignations, notes, messages prospect, relances, conversions Google Ads envoyées.",
      inputSchema: z.object({
        lead_id: z.string().describe("ID du lead / devis"),
        limit: z.number().int().min(1).max(300).optional().describe("Nombre d’événements (défaut 100, plus récents d’abord)"),
      }),
      annotations: READ_ONLY,
    },
    async ({ lead_id, limit }, ctx) => {
      try {
        const timeline = await apiGetLeadTimeline(orgId(ctx.http?.authInfo), lead_id, limit);
        if (!timeline) return errorResult(new Error("Lead introuvable"));
        return textResult(timeline);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.registerTool(
    "add_lead_note",
    {
      title: "Ajouter une note interne",
      description:
        "Ajoute une note interne (invisible du prospect) sur une demande. Ne change pas le statut, n’envoie aucun email.",
      inputSchema: z.object({
        lead_id: z.string().describe("ID du lead / devis"),
        content: z.string().min(1).max(NOTE_MAX_LENGTH).describe("Texte de la note"),
      }),
      annotations: WRITE_NOTE,
    },
    async ({ lead_id, content }, ctx) => {
      try {
        const auth = ctx.http?.authInfo;
        return textResult({
          note: await apiAddLeadNote(orgId(auth), {
            lead_id,
            content,
            author_id: userIdFromAuth(auth),
            source: "mcp",
          }),
        });
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.registerTool(
    "list_team",
    {
      title: "Équipe commerciale",
      description: "Membres actifs de l’organisation (user_id, email, rôle) à qui une demande peut être assignée.",
      inputSchema: z.object({}),
      annotations: READ_ONLY,
    },
    async (_args, ctx) => {
      try {
        return textResult({ members: await apiListTeam(orgId(ctx.http?.authInfo)) });
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.registerTool(
    "assign_lead",
    {
      title: "Assigner une demande",
      description:
        "Assigne une demande à un membre actif (email ou user_id, voir list_team). mode add (défaut) ajoute, replace remplace tous les assignés, remove retire. Le membre ajouté reçoit une notification (app + email interne), jamais le prospect.",
      inputSchema: z.object({
        lead_id: z.string().describe("ID du lead / devis"),
        assignee: z.string().min(1).describe("Email ou user_id du membre"),
        mode: z.enum(ASSIGN_MODES).optional().describe("add | replace | remove (défaut add)"),
        notify: z.boolean().optional().describe("Notifier le membre ajouté (défaut true)"),
      }),
      annotations: WRITE_ASSIGN,
    },
    async (args, ctx) => {
      try {
        const auth = ctx.http?.authInfo;
        return textResult({
          assignment: await apiAssignLead(orgId(auth), { ...args, actor_id: userIdFromAuth(auth) }),
        });
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.registerTool(
    "get_ads_performance",
    {
      title: "Performance Google Ads par campagne",
      description:
        "Par campagne Google Ads sur une période : dépense, clics, impressions, CTR, CPC, devis reçus, gagnés, coût par devis, coût par client gagné, valeur estimée et ROAS estimé. Indique aussi les devis Google Ads non rattachés à une campagne.",
      inputSchema: z.object({
        ...periodShape,
        campaign: z.string().optional().describe("Filtrer sur un nom (contient) ou un ID de campagne"),
      }),
      annotations: READ_ONLY,
    },
    async (args, ctx) => {
      try {
        return textResult(await apiGetAdsPerformance(orgId(ctx.http?.authInfo), args));
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.registerTool(
    "get_attribution_breakdown",
    {
      title: "Attribution des devis (utm / gclid)",
      description:
        "Devis, gagnés, perdus et valeur estimée par canal / utm_source / utm_medium / utm_campaign, avec la part de devis portant un gclid (indispensable pour l’import de conversions Google Ads) et la part sans aucun suivi.",
      inputSchema: z.object({
        ...periodShape,
        group_by: z
          .enum(ATTRIBUTION_GROUPS)
          .optional()
          .describe("source (canal), source_medium, campaign, full (défaut : source + medium + campagne)"),
        limit: z.number().int().min(1).max(200).optional().describe("Lignes max (défaut 50)"),
      }),
      annotations: READ_ONLY,
    },
    async (args, ctx) => {
      try {
        return textResult(await apiGetAttributionBreakdown(orgId(ctx.http?.authInfo), args));
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.registerTool(
    "get_conversion_uploads",
    {
      title: "Diagnostic conversions Google Ads",
      description:
        "Diagnostic des conversions hors ligne envoyées à Google Ads (devis reçus et gagnés) : envoyées / ignorées / en erreur, motifs, dernières erreurs, couverture gclid des devis Google Ads et pistes de correction.",
      inputSchema: z.object({
        ...periodShape,
        status: z.enum(["uploaded", "skipped", "error", "pending"]).optional().describe("Filtrer un statut"),
      }),
      annotations: READ_ONLY,
    },
    async (args, ctx) => {
      try {
        return textResult(await apiGetConversionUploads(orgId(ctx.http?.authInfo), args));
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.registerTool(
    "search_catalog",
    {
      title: "Rechercher dans le catalogue",
      description:
        "Recherche produits du catalogue synchronisé (WooCommerce / Shopify) par nom, SKU (y compris SKU de variation), catégorie ou tag. Renvoie prix HT min–max, stock, variations (dimensions, finitions…) et lien produit, pour préparer un devis.",
      inputSchema: z.object({
        query: z.string().optional().describe("Mots-clés ou SKU, ex. « rayonnage mi-lourd 2000 » (vide = tout)"),
        category: z.string().optional().describe("Filtrer par catégorie (contient)"),
        funnel_id: z.string().optional().describe("Limiter au catalogue d’un funnel"),
        in_stock_only: z.boolean().optional().describe("Seulement les produits en stock"),
        include_inactive: z.boolean().optional().describe("Inclure les produits masqués / archivés"),
        limit: z.number().int().min(1).max(50).optional().describe("Produits max (défaut 20)"),
        max_variants: z.number().int().min(0).max(100).optional().describe("Variations max par produit (défaut 25)"),
      }),
      annotations: READ_ONLY,
    },
    async (args, ctx) => {
      try {
        return textResult(await apiSearchCatalog(orgId(ctx.http?.authInfo), args));
      } catch (error) {
        return errorResult(error);
      }
    },
  );
  registerFunnelConfigTools(server);
}
