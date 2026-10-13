import { z } from "zod";
import type { AuthInfo, McpServer } from "@modelcontextprotocol/server";
import {
  apiCreateFunnel,
  apiGetEmbedCode,
  apiGetFunnel,
  apiListFunnelTemplates,
  apiPublishFunnel,
  apiSetChatAgent,
  apiSetFunnelTracking,
  apiSetSuggestionRules,
  apiUpdateFunnelSteps,
  type FunnelActor,
} from "@/lib/api/funnel-config";
import {
  LIMITS,
  chatAgentBody,
  createFunnelBody,
  publishBody,
  rulesBody,
  stepsBody,
  trackingBody,
} from "@/lib/api/funnel-config-core";
import { organizationIdFromAuth } from "@/lib/mcp/auth";
import { errorResult, textResult } from "@/lib/mcp/results";

const READ_ONLY = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false };
const WRITE_CREATE = { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false };
/** Declarative replace: steps, questions or rules left out are deleted. */
const WRITE_REPLACE = { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: false };
const WRITE_SETTING = { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false };

const funnelId = z.string().describe("ID du funnel (list_funnels)");

function actorOf(auth?: AuthInfo): FunnelActor {
  const id = auth?.extra?.userId;
  return { userId: typeof id === "string" && id ? id : null };
}

async function run(fn: () => Promise<unknown>) {
  try {
    return textResult(await fn());
  } catch (error) {
    return errorResult(error);
  }
}

export const FUNNEL_TOOL_NAMES = [
  "get_funnel",
  "list_funnel_templates",
  "create_funnel",
  "update_funnel_steps",
  "set_suggestion_rules",
  "set_chat_agent",
  "set_funnel_tracking",
  "get_embed_code",
  "publish_funnel",
] as const;

export function registerFunnelConfigTools(server: McpServer) {
  server.registerTool(
    "get_funnel",
    {
      title: "Détail d’un funnel",
      description:
        "Définition complète d’un funnel : mode (form / chat / catalog), statut publié ou non, étapes et questions (clés, types, options), règles de suggestion (conditions → produits), réglages de l’agent chat, suivi GA4 / GTM / Pixel, liens et codes d’intégration, points bloquants avant publication.",
      inputSchema: z.object({ funnel_id: funnelId }),
      annotations: READ_ONLY,
    },
    async ({ funnel_id }, ctx) => run(() => apiGetFunnel(organizationIdFromAuth(ctx.http?.authInfo), funnel_id)),
  );

  server.registerTool(
    "list_funnel_templates",
    {
      title: "Modèles de funnel",
      description:
        "Modes (formulaire, chat IA, catalogue) et modèles de départ disponibles (rayonnage / racking, cuisine, menuiserie, location, générique…) avec leurs étapes.",
      inputSchema: z.object({}),
      annotations: READ_ONLY,
    },
    async () => run(async () => apiListFunnelTemplates()),
  );

  server.registerTool(
    "create_funnel",
    {
      title: "Créer un funnel (brouillon)",
      description:
        "Crée un funnel NON PUBLIÉ à partir d’un modèle, comme « Nouveau funnel » dans l’app. from_catalog copie le catalogue produits d’un funnel existant (ID) ou « auto » (le funnel qui a le plus de produits, en général le catalogue synchronisé) : indispensable pour un funnel chat ou catalogue. Rien n’est visible des visiteurs avant publish_funnel.",
      inputSchema: createFunnelBody,
      annotations: WRITE_CREATE,
    },
    async (args, ctx) =>
      run(() => apiCreateFunnel(organizationIdFromAuth(ctx.http?.authInfo), actorOf(ctx.http?.authInfo), args)),
  );

  server.registerTool(
    "update_funnel_steps",
    {
      title: "Modifier les étapes et questions",
      description: `Remplace la liste complète des étapes d’un funnel (ordre inclus). Repartez de get_funnel : gardez les id des étapes / questions à conserver (leur clé de réponse est préservée) ; ce qui n’est pas listé est supprimé. Règles : une seule étape contact, en dernier ; une étape questions a au moins une question ; choix visuel / liste / choix multiple ont au moins une option ; un funnel catalogue garde ses étapes suggestions et customize. ${LIMITS.steps} étapes, ${LIMITS.questionsPerStep} questions par étape max. Funnel publié : confirm_published=true requis.`,
      inputSchema: stepsBody.extend({ funnel_id: funnelId }),
      annotations: WRITE_REPLACE,
    },
    async (args, ctx) =>
      run(() => apiUpdateFunnelSteps(organizationIdFromAuth(ctx.http?.authInfo), actorOf(ctx.http?.authInfo), args)),
  );

  server.registerTool(
    "set_suggestion_rules",
    {
      title: "Règles de suggestion produits",
      description:
        "Définit les règles « si le prospect répond X alors proposer ces produits ». Conditions sur les clés de questions du funnel (valeur ou libellé d’option accepté). Produits : ID, SKU (y compris de variation) ou nom exact, pris dans le catalogue du funnel ; toute référence introuvable ou ambiguë fait échouer l’appel avec des propositions, rien n’est deviné. mode replace (défaut) supprime les règles non listées, upsert les garde. Les règles existantes sont retrouvées par id ou par nom. Funnel publié : confirm_published=true requis.",
      inputSchema: rulesBody.extend({ funnel_id: funnelId }),
      annotations: WRITE_REPLACE,
    },
    async (args, ctx) =>
      run(() => apiSetSuggestionRules(organizationIdFromAuth(ctx.http?.authInfo), actorOf(ctx.http?.authInfo), args)),
  );

  server.registerTool(
    "set_chat_agent",
    {
      title: "Réglages de l’agent chat",
      description:
        "Funnel en mode chat uniquement. instructions : consignes du marchand ajoutées au prompt de l’agent (ton, priorités, vocabulaire, quand proposer un rappel) ; elles ne lèvent jamais les garde-fous (prix et produits uniquement depuis le catalogue). greeting : premier message affiché au prospect. Champ omis = inchangé, chaîne vide = retiré. Il n’existe pas (encore) de FAQ / réponses validées, de choix de langue ni d’email d’escalade par funnel. Funnel publié : confirm_published=true requis.",
      inputSchema: chatAgentBody.extend({ funnel_id: funnelId }),
      annotations: WRITE_SETTING,
    },
    async (args, ctx) =>
      run(() => apiSetChatAgent(organizationIdFromAuth(ctx.http?.authInfo), actorOf(ctx.http?.authInfo), args)),
  );

  server.registerTool(
    "set_funnel_tracking",
    {
      title: "Suivi GA4 / GTM / Pixel du funnel",
      description:
        "Identifiants de mesure propres au funnel (onglet Suivi) ; ils remplacent ceux de l’espace. Formats vérifiés : G-XXXXXXX, GTM-XXXXXXX, pixel Meta en chiffres. Champ omis = inchangé, chaîne vide = retiré.",
      inputSchema: trackingBody.extend({ funnel_id: funnelId }),
      annotations: WRITE_SETTING,
    },
    async (args, ctx) =>
      run(() => apiSetFunnelTracking(organizationIdFromAuth(ctx.http?.authInfo), actorOf(ctx.http?.authInfo), args)),
  );

  server.registerTool(
    "get_embed_code",
    {
      title: "Lien et codes d’intégration",
      description:
        "Mêmes codes que l’onglet « Lien & embed » : lien public, widget JS, module question, module agent chat, iframe, shortcodes WordPress et installation de l’extension. Ils ne fonctionnent qu’une fois le funnel publié.",
      inputSchema: z.object({ funnel_id: funnelId }),
      annotations: READ_ONLY,
    },
    async ({ funnel_id }, ctx) => run(() => apiGetEmbedCode(organizationIdFromAuth(ctx.http?.authInfo), funnel_id)),
  );

  server.registerTool(
    "publish_funnel",
    {
      title: "Publier / dépublier un funnel",
      description:
        "publish=true rend le funnel accessible aux visiteurs (bouton « Publier »), publish=false le retire (lien et intégrations ne répondent plus). Exige confirm=true, à ne passer qu’après accord explicite du marchand dans la conversation. La publication est refusée si la structure est invalide (voir publish_check de get_funnel).",
      inputSchema: publishBody.extend({ funnel_id: funnelId }),
      annotations: WRITE_SETTING,
    },
    async (args, ctx) =>
      run(() => apiPublishFunnel(organizationIdFromAuth(ctx.http?.authInfo), actorOf(ctx.http?.authInfo), args)),
  );
}
