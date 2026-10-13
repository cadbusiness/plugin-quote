import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { QuoteBuilderClient, errorResult, textResult } from "../client.js";

const READ_ONLY = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false };
const WRITE_CREATE = { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false };
const WRITE_REPLACE = { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: false };
const WRITE_SETTING = { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false };

const funnelId = z.string().describe("ID du funnel (list_funnels)");
const confirmPublished = z
  .boolean()
  .optional()
  .describe("Obligatoire (true) si le funnel est publié : la modification s’applique tout de suite aux visiteurs");

/** Steps / rules are validated by the QuoteBuilder API (same rules as the hosted MCP server). */
const step = z
  .object({
    id: z.string().optional(),
    type: z.enum(["questions", "suggestions", "customize", "contact"]),
    title: z.string(),
    subtitle: z.string().nullable().optional(),
    questions: z.array(z.record(z.string(), z.unknown())).optional(),
  })
  .passthrough();

const rule = z
  .object({
    id: z.string().optional(),
    name: z.string(),
    conditions: z.array(
      z.object({
        question_key: z.string(),
        op: z.enum(["eq", "neq", "gte", "lte", "in", "contains"]),
        value: z.union([z.string(), z.number(), z.boolean(), z.array(z.union([z.string(), z.number()]))]),
      }),
    ),
    products: z.array(z.string()).min(1).describe("ID, SKU ou nom exact de produits du catalogue du funnel"),
  })
  .passthrough();

async function run(fn: () => Promise<unknown>) {
  try {
    return textResult(await fn());
  } catch (error) {
    return errorResult(error);
  }
}

export function registerFunnelTools(server: McpServer, qb: QuoteBuilderClient) {
  server.registerTool(
    "list_funnels",
    {
      description: "Liste les funnels / configurateurs de l’organisation (get_funnel pour le détail).",
      inputSchema: {},
      annotations: READ_ONLY,
    },
    async () => run(() => qb.listFunnels()),
  );

  server.registerTool(
    "get_funnel_performance",
    {
      description: "Performance d’un funnel sur 30 jours (conversion, pipeline, gagnés).",
      inputSchema: {
        funnel_id: z.string(),
      },
      annotations: READ_ONLY,
    },
    async ({ funnel_id }) => run(() => qb.getFunnelPerformance(funnel_id)),
  );

  server.registerTool(
    "get_funnel",
    {
      description:
        "Définition complète d’un funnel : mode, statut publié ou non, étapes et questions, règles de suggestion, agent chat, suivi, liens et codes d’intégration, points bloquants avant publication.",
      inputSchema: { funnel_id: funnelId },
      annotations: READ_ONLY,
    },
    async ({ funnel_id }) => run(() => qb.getFunnel(funnel_id)),
  );

  server.registerTool(
    "list_funnel_templates",
    {
      description: "Modes (formulaire, chat IA, catalogue) et modèles de départ (rayonnage / racking, cuisine, générique…).",
      inputSchema: {},
      annotations: READ_ONLY,
    },
    async () => run(() => qb.listFunnelTemplates()),
  );

  server.registerTool(
    "create_funnel",
    {
      description:
        "Crée un funnel NON PUBLIÉ depuis un modèle. from_catalog : ID d’un funnel dont copier les produits, ou « auto ».",
      inputSchema: {
        name: z.string().min(2).max(80),
        mode: z.enum(["form", "chat", "catalog"]),
        template: z.string().optional(),
        from_catalog: z.string().optional(),
        screens: z.array(z.enum(["questions", "suggestions", "customize", "contact"])).optional(),
      },
      annotations: WRITE_CREATE,
    },
    async (args) => run(() => qb.createFunnel(args)),
  );

  server.registerTool(
    "update_funnel_steps",
    {
      description:
        "Remplace la liste complète des étapes (repartir de get_funnel, garder les id à conserver ; ce qui n’est pas listé est supprimé). Une seule étape contact, en dernier. Questions : {id?, key?, label, type (visual_choice|select|multi_select|number|text|file), required?, help?, options?: {choices?: [{label, value?}], min?, max?, unit?, placeholder?}}.",
      inputSchema: { funnel_id: funnelId, steps: z.array(step).min(1).max(15), confirm_published: confirmPublished },
      annotations: WRITE_REPLACE,
    },
    async ({ funnel_id, ...body }) => run(() => qb.updateFunnel(funnel_id, "steps", body)),
  );

  server.registerTool(
    "set_suggestion_rules",
    {
      description:
        "Règles « si réponse → produits ». Champs optionnels par règle : headline, description, priority, is_active, price_min, price_max. Références produit introuvables ou ambiguës = erreur, rien n’est deviné. mode replace (défaut) ou upsert.",
      inputSchema: {
        funnel_id: funnelId,
        rules: z.array(rule).max(50),
        mode: z.enum(["replace", "upsert"]).optional(),
        confirm_published: confirmPublished,
      },
      annotations: WRITE_REPLACE,
    },
    async ({ funnel_id, ...body }) => run(() => qb.updateFunnel(funnel_id, "rules", body)),
  );

  server.registerTool(
    "set_chat_agent",
    {
      description:
        "Funnel chat : instructions (ton, priorités ; 2000 caractères) et greeting (premier message ; 280 caractères). Omis = inchangé, vide = retiré.",
      inputSchema: {
        funnel_id: funnelId,
        instructions: z.string().max(2000).optional(),
        greeting: z.string().max(280).optional(),
        confirm_published: confirmPublished,
      },
      annotations: WRITE_SETTING,
    },
    async ({ funnel_id, ...body }) => run(() => qb.updateFunnel(funnel_id, "chat-agent", body)),
  );

  server.registerTool(
    "set_funnel_tracking",
    {
      description: "GA4 (G-XXXX), GTM (GTM-XXXX) et pixel Meta propres au funnel. Omis = inchangé, vide = retiré.",
      inputSchema: {
        funnel_id: funnelId,
        ga4_id: z.string().max(40).optional(),
        gtm_id: z.string().max(40).optional(),
        meta_pixel_id: z.string().max(40).optional(),
      },
      annotations: WRITE_SETTING,
    },
    async ({ funnel_id, ...body }) => run(() => qb.updateFunnel(funnel_id, "tracking", body)),
  );

  server.registerTool(
    "get_embed_code",
    {
      description: "Lien public, widget JS, modules question / agent, iframe et shortcodes WordPress (actifs une fois publié).",
      inputSchema: { funnel_id: funnelId },
      annotations: READ_ONLY,
    },
    async ({ funnel_id }) => run(() => qb.getEmbedCode(funnel_id)),
  );

  server.registerTool(
    "publish_funnel",
    {
      description:
        "Publie (publish=true) ou retire (false) un funnel. confirm=true uniquement après accord explicite du marchand.",
      inputSchema: { funnel_id: funnelId, publish: z.boolean(), confirm: z.boolean() },
      annotations: WRITE_SETTING,
    },
    async ({ funnel_id, ...body }) => run(() => qb.publishFunnel(funnel_id, body)),
  );
}
