import Anthropic from "@anthropic-ai/sdk";
import { COMMERCE_AGENT_CONFIG } from "@/lib/commerce-agent/config";
import { searchCatalog } from "@/lib/commerce-agent/catalog";
import type { Json } from "@/lib/db/database.types";
import { toWidgetMatrixProduct, type WidgetMatrixProduct } from "@/lib/catalog/variant-matrix";
import { parsePluginQuoteBody } from "@/lib/integrations/plugin-quotes";
import {
  bindQuoteBody,
  bindWidgetLines,
  widgetLinesFromUnknown,
  type WidgetLine,
} from "@/lib/integrations/quote-widget-bind";
import type { PluginConnection } from "@/lib/integrations/plugin";
import { publicSiteChatPath } from "@/lib/chat-agent/http";
import { openPublicSite, publicSiteQuotePath } from "@/lib/integrations/public-site-quote";
import { parseQuoteWidget, widgetPairing } from "@/lib/integrations/quote-widget-settings";
import { clientIp, rateLimit } from "@/lib/security/rate-limit";
import { createServiceClient } from "@/lib/supabase/service";
import type { Product } from "@/lib/wizard/types";

export const PUBLIC_SITE_WIDGET_METHODS = "GET, OPTIONS";
export const PUBLIC_SITE_ASSIST_METHODS = "POST, OPTIONS";
export const PUBLIC_SITE_ASSIST_IP_LIMIT = 10;
export const PUBLIC_SITE_ASSIST_WINDOW_MS = 60_000;

export type WidgetCatalogRow = {
  externalId: string;
  name: string;
};

export type { WidgetLine, WidgetMatrixProduct };
export { bindQuoteBody, bindWidgetLines, widgetLinesFromUnknown };

export type AssistModelOutput = {
  brief?: string;
  lines?: { productId?: string; name?: string; qty?: number }[];
};

export type AssistModel = (input: {
  requestText: string;
  catalog: WidgetCatalogRow[];
}) => Promise<AssistModelOutput | null>;

const ASSIST_SYSTEM = `Tu prépares un brief commercial B2B à partir du texte d'un visiteur.
Réponds uniquement avec un objet JSON : {"brief":"...","lines":[{"productId":"...","qty":1}]}.
Règles :
- brief : 1 à 3 phrases en français, le besoin tel qu'il est décrit. N'invente pas de dimensions, de délais ni de références.
- lines : uniquement des productId présents dans le catalogue fourni. Si aucun produit ne correspond, lines est [].
- N'invente jamais un productId, un SKU ou un nom de produit absent du catalogue.`;

function fold(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function text(value: unknown, max: number) {
  if (typeof value !== "string" && typeof value !== "number") return "";
  return String(value).trim().slice(0, max);
}

function clampQty(value: unknown) {
  const qty = typeof value === "number" ? value : typeof value === "string" ? Number(value) : 1;
  if (!Number.isFinite(qty) || qty < 1) return 1;
  return Math.min(9999, Math.round(qty));
}

function widgetFromSettings(settings: Json) {
  const raw =
    settings && typeof settings === "object" && !Array.isArray(settings)
      ? (settings as Record<string, unknown>).widget
      : undefined;
  return parseQuoteWidget(raw);
}

/**
 * Receipt for POST /api/public/sites/{siteKey}/quotes.
 * Same body as the plugin route (`source: wordpress`). Empty catalog and empty text is rejected.
 */
export function buildWidgetQuote(input: {
  externalId: string;
  pageUrl?: string;
  contact: { name: string; email: string; phone: string; company?: string | null };
  items?: unknown;
  requestText?: string;
  brief?: string | null;
}): { ok: true; body: Record<string, unknown> } | { ok: false; error: string } {
  const items = widgetLinesFromUnknown(input.items).map((line) => ({
    productId: line.productId,
    variationId: line.variationId,
    sku: line.sku,
    name: line.name,
    variation: line.variation,
    qty: line.qty,
    url: line.url,
  }));
  const requestText = text(input.requestText, 8000);
  if (!items.length && !requestText) {
    return { ok: false, error: "Ajoutez un produit ou décrivez le besoin." };
  }
  const body: Record<string, unknown> = {
    source: "wordpress",
    externalId: text(input.externalId, 64),
    pageUrl: text(input.pageUrl, 2000),
    contact: {
      name: input.contact.name,
      email: input.contact.email,
      phone: input.contact.phone,
      company: input.contact.company ?? "",
    },
    items,
    requestText,
  };
  const brief = text(input.brief, 500);
  if (brief) body.context = brief;
  const parsed = parsePluginQuoteBody(body);
  if (!parsed.ok) return parsed;
  return { ok: true, body };
}

/** Keep the visitor text. Attach only catalog products the model actually named. */
export function settleAssist(input: {
  requestText: string;
  modelOutput: AssistModelOutput | null;
  catalog: readonly WidgetCatalogRow[];
}): { requestText: string; brief: string | null; items: WidgetLine[] } {
  const requestText = text(input.requestText, 8000);
  if (!input.modelOutput) return { requestText, brief: null, items: [] };

  const byId = new Map<string, WidgetCatalogRow>();
  const byName = new Map<string, WidgetCatalogRow[]>();
  for (const row of input.catalog) {
    const externalId = row.externalId.trim();
    const name = row.name.trim();
    if (!externalId || !name) continue;
    const known = { externalId, name };
    byId.set(externalId, known);
    const key = fold(name);
    const list = byName.get(key) ?? [];
    list.push(known);
    byName.set(key, list);
  }

  const items: WidgetLine[] = [];
  for (const line of input.modelOutput.lines ?? []) {
    const productId = (line.productId ?? "").trim();
    let hit = productId ? byId.get(productId) : undefined;
    if (!hit && line.name) {
      const matches = byName.get(fold(line.name)) ?? [];
      if (matches.length === 1) hit = matches[0];
    }
    if (!hit) continue;
    if (items.some((existing) => existing.productId === hit.externalId)) continue;
    items.push({
      productId: hit.externalId,
      variationId: "",
      name: hit.name,
      qty: clampQty(line.qty),
      sku: "",
      variation: "",
      url: "",
    });
    if (items.length >= 8) break;
  }

  const briefRaw = text(input.modelOutput.brief, 500);
  return { requestText, brief: briefRaw.length >= 2 ? briefRaw : null, items };
}

/** Rank real shop products for the prompt. Unknown text returns no products, not a random slice. */
export function rankWidgetCatalog(rows: readonly WidgetCatalogRow[], query: string): WidgetCatalogRow[] {
  const products: Product[] = [];
  for (const row of rows) {
    const externalId = row.externalId.trim();
    const name = row.name.trim();
    if (!externalId || !name) continue;
    products.push({
      id: externalId,
      name,
      description: null,
      imageUrl: null,
      images: [],
      priceMin: null,
      priceMax: null,
      currency: "EUR",
      tags: [],
      category: null,
      options: [],
      specs: [],
      stockStatus: null,
      externalId,
    });
  }
  const found = searchCatalog(products, { query, limit: 12 });
  return found.products.map((product) => ({ externalId: product.id, name: product.name }));
}

function parseModelJson(text: string): AssistModelOutput | null {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    const raw = JSON.parse(text.slice(start, end + 1)) as unknown;
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
    const record = raw as Record<string, unknown>;
    const lines = Array.isArray(record.lines) ? record.lines : [];
    return {
      brief: typeof record.brief === "string" ? record.brief : "",
      lines: lines.flatMap((row) => {
        if (!row || typeof row !== "object" || Array.isArray(row)) return [];
        const line = row as Record<string, unknown>;
        return [
          {
            productId: typeof line.productId === "string" ? line.productId : undefined,
            name: typeof line.name === "string" ? line.name : undefined,
            qty: typeof line.qty === "number" ? line.qty : undefined,
          },
        ];
      }),
    };
  } catch {
    return null;
  }
}

/** One short completion. Missing key or a bad reply degrades to null (no invented lines). */
export async function structureRequestText(input: {
  requestText: string;
  catalog: WidgetCatalogRow[];
}): Promise<AssistModelOutput | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey) return null;
  try {
    const client = new Anthropic({ apiKey });
    const response = await client.messages.create({
      model: COMMERCE_AGENT_CONFIG.model,
      max_tokens: 600,
      system: ASSIST_SYSTEM,
      messages: [
        {
          role: "user",
          content: `Catalogue:\n${JSON.stringify(input.catalog)}\n\nDemande:\n${input.requestText}`,
        },
      ],
    });
    const text = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("\n");
    return parseModelJson(text);
  } catch (error) {
    console.error("quote widget assist failed", error);
    return null;
  }
}

export function publicWidgetConfig(connection: PluginConnection) {
  const widget = widgetFromSettings(connection.settings);
  const pairing = widgetPairing(connection.public_key, widget);
  return {
    mode: pairing.mode,
    aiRequestText: pairing.aiRequestText,
    site_key: pairing.site_key,
    submit: pairing.public_submit,
    assist: widget.aiRequestText
      ? {
          method: "POST" as const,
          path: `/api/public/sites/${connection.public_key}/assist`,
        }
      : null,
    chat: {
      method: "POST" as const,
      path: publicSiteChatPath(connection.public_key),
      auth: "X-QuoteBuilder-Site-Key",
    },
  };
}

function json(body: unknown, status: number, extra?: Headers) {
  const headers = extra ? new Headers(extra) : new Headers();
  headers.set("content-type", "application/json; charset=utf-8");
  headers.set("Cache-Control", "no-store");
  headers.set("Vary", "Origin");
  return new Response(JSON.stringify(body), { status, headers });
}

async function loadConnectionCatalog(connection: PluginConnection): Promise<WidgetCatalogRow[]> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("products")
    .select("external_id, name")
    .eq("organization_id", connection.organization_id)
    .eq("connection_id", connection.id)
    .eq("is_active", true)
    .not("external_id", "is", null)
    .limit(200);
  return (data ?? []).flatMap((row) => {
    const externalId = row.external_id?.trim() ?? "";
    const name = row.name?.trim() ?? "";
    return externalId && name ? [{ externalId, name }] : [];
  });
}

export async function loadWidgetCatalog(connection: PluginConnection): Promise<WidgetMatrixProduct[]> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("products")
    .select("external_id, name, sku, options, variants")
    .eq("organization_id", connection.organization_id)
    .eq("connection_id", connection.id)
    .eq("is_active", true)
    .not("external_id", "is", null)
    .order("name", { ascending: true })
    .limit(200);
  return (data ?? []).flatMap((row) => {
    const product = toWidgetMatrixProduct({
      externalId: row.external_id ?? "",
      name: row.name,
      sku: row.sku,
      options: row.options,
      variants: row.variants,
    });
    return product ? [product] : [];
  });
}

type WidgetDeps = {
  load?: (publicKey: string) => Promise<PluginConnection | null>;
  loadMatrices?: (connection: PluginConnection) => Promise<WidgetMatrixProduct[]>;
};

/** Public config for the embed. The site key is already in the path; no Bearer secret. */
export async function handlePublicSiteWidget(req: Request, siteKey: string, deps: WidgetDeps = {}) {
  const opened = await openPublicSite(req, siteKey, { load: deps.load, methods: PUBLIC_SITE_WIDGET_METHODS });
  if (!opened.ok) return opened.response;
  const { connection, cors } = opened.access;
  const loadMatrices = deps.loadMatrices ?? loadWidgetCatalog;
  let catalog: WidgetMatrixProduct[] = [];
  try {
    catalog = await loadMatrices(connection);
  } catch (error) {
    console.error("quote widget catalog failed", error);
    catalog = [];
  }
  return json({ ...publicWidgetConfig(connection), catalog }, 200, cors);
}

type AssistDeps = WidgetDeps & {
  loadCatalog?: (connection: PluginConnection) => Promise<WidgetCatalogRow[]>;
  model?: AssistModel;
};

/**
 * Optional structuring of requestText.
 * The visitor text is always returned. Lines are real catalog ids only.
 * AI off, missing key, or a model failure returns degraded: true and items: [].
 */
export async function handlePublicSiteAssist(req: Request, siteKey: string, deps: AssistDeps = {}) {
  const opened = await openPublicSite(req, siteKey, { load: deps.load, methods: PUBLIC_SITE_ASSIST_METHODS });
  if (!opened.ok) return opened.response;
  const { connection, cors } = opened.access;

  const ipLimit = rateLimit(
    `public-site-assist:ip:${clientIp(req)}`,
    PUBLIC_SITE_ASSIST_IP_LIMIT,
    PUBLIC_SITE_ASSIST_WINDOW_MS,
  );
  if (!ipLimit.ok) {
    cors.set("Retry-After", String(ipLimit.retryAfterSec));
    return json({ error: "Trop de requêtes, réessayez plus tard." }, 429, cors);
  }

  const body = await req.json().catch(() => null);
  const requestText =
    body && typeof body === "object" && !Array.isArray(body)
      ? text((body as Record<string, unknown>).requestText, 8000)
      : "";
  if (!requestText) return json({ error: "requestText est requis" }, 422, cors);

  const widget = widgetFromSettings(connection.settings);
  if (!widget.aiRequestText) {
    return json({ requestText, brief: null, items: [], degraded: true }, 200, cors);
  }

  const loadCatalog = deps.loadCatalog ?? loadConnectionCatalog;
  const catalog = await loadCatalog(connection);
  const ranked = rankWidgetCatalog(catalog, requestText);
  const model = deps.model ?? structureRequestText;
  let modelOutput: AssistModelOutput | null = null;
  try {
    modelOutput = await model({ requestText, catalog: ranked });
  } catch (error) {
    console.error("quote widget assist failed", error);
    modelOutput = null;
  }
  const settled = settleAssist({ requestText, modelOutput, catalog });
  return json({ ...settled, degraded: modelOutput == null }, 200, cors);
}

export function widgetSubmitPath(publicKey: string) {
  return publicSiteQuotePath(publicKey);
}
