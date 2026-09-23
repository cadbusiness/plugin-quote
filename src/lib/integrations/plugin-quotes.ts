import type { Json, Tables } from "@/lib/db/database.types";
import { logActivity, notifyUser } from "@/lib/crm/activity";
import { ensureDefaultEmailTemplates } from "@/lib/crm/email-templates";
import { sendQuoteEmails } from "@/lib/email/send";
import type { PluginConnection } from "@/lib/integrations/plugin";
import { scoreQuote } from "@/lib/quotes/score";
import { createServiceClient } from "@/lib/supabase/service";
import { getAppUrl } from "@/lib/supabase/env";
import { dispatchQuoteWebhooks } from "@/lib/webhooks/dispatch";
import type { Answers } from "@/lib/wizard/types";

/** Shown by classifySource as « Site Web » — origin of a WordPress inbound quote. */
export const PLUGIN_QUOTE_SOURCE = "site web";
export const PLUGIN_QUOTE_MEDIUM = "website";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type PluginQuoteItem = {
  productId: string;
  variationId: string;
  sku: string;
  name: string;
  variation: string;
  qty: number;
  note: string;
  url: string;
};

export type ParsedPluginQuote = {
  externalId: string;
  org: string;
  funnel: string;
  createdAt: string | null;
  pageUrl: string;
  context: string;
  contact: {
    name: string;
    email: string;
    phone: string;
    company: string | null;
    city: string | null;
  };
  needs: string[];
  requestText: string;
  space: { length: string; height: string };
  items: PluginQuoteItem[];
};

export type PluginCatalogVariant = {
  externalId: string;
  title: string;
  price: number | null;
  sku: string | null;
};

export type PluginCatalogProduct = {
  id: string;
  name: string;
  externalId: string | null;
  sku: string | null;
  priceMin: number | null;
  priceMax: number | null;
  variants: PluginCatalogVariant[];
};

export type PluginQuoteLine = {
  productId: string | null;
  name: string;
  quantity: number;
  options: Record<string, string>;
  priceMin: number | null;
  priceMax: number | null;
};

export type PluginQuoteResult =
  | { ok: true; status: 200 | 201; id: string; url: string }
  | { ok: false; status: 422 | 500; error: string };

export function pluginQuoteUrl(quoteId: string) {
  return `${getAppUrl()}/devis/${quoteId}`;
}

/** Idempotence key: one quote per externalId on a given plugin connection. */
export function pluginReceiptKey(connectionId: string, externalId: string) {
  return { connection_id: connectionId, external_id: externalId.trim() };
}

/** Woo simple products send 0 / "0". Stored lines use "". */
export function normalizeVariationId(value: unknown) {
  if (value == null) return "";
  const text = String(value).trim();
  if (!text || text === "0") return "";
  return text.slice(0, 64);
}

export function parsePluginQuoteBody(body: unknown): { ok: true; quote: ParsedPluginQuote } | { ok: false; error: string } {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, error: "Requête invalide" };
  }
  const raw = body as Record<string, unknown>;
  const source = typeof raw.source === "string" ? raw.source.trim().toLowerCase() : "";
  if (source !== "wordpress") return { ok: false, error: "source doit être wordpress" };

  const externalId = readRequired(raw.externalId, "externalId", 64);
  if (typeof externalId !== "string") return { ok: false, error: externalId.error };

  const contactRaw = raw.contact;
  if (!contactRaw || typeof contactRaw !== "object" || Array.isArray(contactRaw)) {
    return { ok: false, error: "Le contact (nom, email, téléphone) est requis" };
  }
  const contact = contactRaw as Record<string, unknown>;
  const name = readRequired(contact.name, "contact.name", 200);
  if (typeof name !== "string") return { ok: false, error: name.error };
  const emailRaw = readRequired(contact.email, "contact.email", 320);
  if (typeof emailRaw !== "string") return { ok: false, error: emailRaw.error };
  const email = emailRaw.toLowerCase();
  if (!EMAIL.test(email)) return { ok: false, error: "contact.email est invalide" };
  const phone = readRequired(contact.phone, "contact.phone", 40);
  if (typeof phone !== "string") return { ok: false, error: phone.error };
  const company = readOptional(contact.company, "contact.company", 200);
  if (typeof company !== "string") return { ok: false, error: company.error };
  const city = readOptional(contact.city, "contact.city", 120);
  if (typeof city !== "string") return { ok: false, error: city.error };

  const requestText = readOptional(raw.requestText, "requestText", 8000);
  if (typeof requestText !== "string") return { ok: false, error: requestText.error };
  const pageUrl = readOptional(raw.pageUrl, "pageUrl", 2000);
  if (typeof pageUrl !== "string") return { ok: false, error: pageUrl.error };
  const context = readOptional(raw.context, "context", 500);
  if (typeof context !== "string") return { ok: false, error: context.error };
  const org = readOptional(raw.org, "org", 80);
  if (typeof org !== "string") return { ok: false, error: org.error };
  const funnel = readOptional(raw.funnel, "funnel", 80);
  if (typeof funnel !== "string") return { ok: false, error: funnel.error };

  const needs = readNeeds(raw.needs);
  if (!Array.isArray(needs)) return { ok: false, error: needs.error };
  const space = readSpace(raw.space);
  if ("error" in space) return { ok: false, error: space.error };
  const items = readItems(raw.items);
  if (!Array.isArray(items)) return { ok: false, error: items.error };

  return {
    ok: true,
    quote: {
      externalId,
      org,
      funnel,
      createdAt: readCreatedAt(raw.createdAt),
      pageUrl,
      context,
      contact: {
        name,
        email,
        phone,
        company: company || null,
        city: city || null,
      },
      needs,
      requestText,
      space,
      items,
    },
  };
}

export function pluginQuoteAnswers(quote: ParsedPluginQuote): Answers {
  const answers: Answers = {};
  if (quote.requestText) answers.need = quote.requestText;
  if (quote.needs.length) answers.besoin = quote.needs;
  if (quote.context) answers.contexte = quote.context;
  if (quote.space.length) answers.longueur = quote.space.length;
  if (quote.space.height) answers.hauteur = quote.space.height;
  if (quote.contact.city) answers.ville = quote.contact.city;
  if (quote.pageUrl) answers.page_url = quote.pageUrl;
  return answers;
}

export function pluginQuoteLines(items: PluginQuoteItem[], products: PluginCatalogProduct[]): PluginQuoteLine[] {
  return items.map((item) => {
    const matched = matchItem(item, products);
    const base = item.name || matched?.product.name || "Produit";
    const variation = item.variation || matched?.variantTitle || "";
    const options: Record<string, string> = {};
    if (item.sku) options.sku = item.sku;
    if (item.note) options.note = item.note;
    if (item.url) options.url = item.url;
    if (item.productId) options.woo_product_id = item.productId;
    if (item.variationId) options.woo_variation_id = item.variationId;
    const price = matched?.price ?? null;
    return {
      productId: matched?.product.id ?? null,
      name: variation ? `${base} (${variation})` : base,
      quantity: item.qty,
      options,
      priceMin: price?.min ?? matched?.product.priceMin ?? null,
      priceMax: price?.max ?? matched?.product.priceMax ?? null,
    };
  });
}

export async function receivePluginQuote(connection: PluginConnection, body: unknown): Promise<PluginQuoteResult> {
  const parsed = parsePluginQuoteBody(body);
  if (!parsed.ok) return { ok: false, status: 422, error: parsed.error };

  const supabase = createServiceClient();
  const existing = await findReceipt(supabase, pluginReceiptKey(connection.id, parsed.quote.externalId));
  if (existing) return { ok: true, status: 200, id: existing, url: pluginQuoteUrl(existing) };

  if (!connection.configurator_id) {
    return { ok: false, status: 422, error: "Cette connexion n'a pas de funnel." };
  }
  const { data: funnel } = await supabase
    .from("configurators")
    .select("id")
    .eq("id", connection.configurator_id)
    .eq("organization_id", connection.organization_id)
    .maybeSingle();
  if (!funnel) return { ok: false, status: 422, error: "Funnel introuvable pour cette connexion." };

  const products = await loadCatalog(supabase, connection, parsed.quote.items);
  const lines = pluginQuoteLines(parsed.quote.items, products);
  const answers = pluginQuoteAnswers(parsed.quote);
  const { score, label } = scoreQuote(answers);

  const { data: defaultStatus } = await supabase
    .from("quote_statuses")
    .select("id, slug")
    .eq("organization_id", connection.organization_id)
    .eq("is_default", true)
    .maybeSingle();

  const { data: quote, error: quoteError } = await supabase
    .from("quotes")
    .insert({
      organization_id: connection.organization_id,
      configurator_id: funnel.id,
      contact_name: parsed.quote.contact.name,
      contact_email: parsed.quote.contact.email,
      contact_phone: parsed.quote.contact.phone,
      contact_company: parsed.quote.contact.company,
      answers: answers as Json,
      extracted_params: {
        source: "wordpress",
        external_id: parsed.quote.externalId,
        plugin_connection_id: connection.id,
        page_url: parsed.quote.pageUrl || null,
        context: parsed.quote.context || null,
        org: parsed.quote.org || null,
        funnel: parsed.quote.funnel || null,
        created_at: parsed.quote.createdAt,
      } as Json,
      score,
      score_label: label,
      status: defaultStatus?.slug ?? "new",
      status_id: defaultStatus?.id ?? null,
      utm_source: PLUGIN_QUOTE_SOURCE,
      utm_medium: PLUGIN_QUOTE_MEDIUM,
      utm_content: parsed.quote.context || null,
      referrer: parsed.quote.pageUrl || null,
      ...(parsed.quote.createdAt ? { created_at: parsed.quote.createdAt } : {}),
    })
    .select("*")
    .single();
  if (quoteError || !quote) {
    console.error("Plugin quote insert failed", quoteError);
    return { ok: false, status: 500, error: "Création impossible" };
  }

  if (lines.length) {
    const { error: itemsError } = await supabase.from("quote_items").insert(
      lines.map((line) => ({
        organization_id: connection.organization_id,
        quote_id: quote.id,
        product_id: line.productId,
        name: line.name,
        quantity: line.quantity,
        options: line.options as Json,
        price_min: line.priceMin,
        price_max: line.priceMax,
      })),
    );
    if (itemsError) {
      console.error("Plugin quote items failed", itemsError);
      await supabase.from("quotes").delete().eq("id", quote.id);
      return { ok: false, status: 500, error: "Création impossible" };
    }
  }

  const receiptKey = pluginReceiptKey(connection.id, parsed.quote.externalId);
  const { error: receiptError } = await supabase.from("plugin_quote_receipts").insert({
    ...receiptKey,
    organization_id: connection.organization_id,
    quote_id: quote.id,
  });
  if (receiptError) {
    await supabase.from("quotes").delete().eq("id", quote.id);
    if (isUniqueViolation(receiptError)) {
      const winner = await findReceipt(supabase, receiptKey);
      if (winner) return { ok: true, status: 200, id: winner, url: pluginQuoteUrl(winner) };
    }
    console.error("Plugin quote receipt failed", receiptError);
    return { ok: false, status: 500, error: "Création impossible" };
  }

  await logActivity(supabase, {
    organizationId: connection.organization_id,
    quoteId: quote.id,
    type: "submitted",
    payload: {
      source: "wordpress",
      external_id: parsed.quote.externalId,
      connection_id: connection.id,
      score,
      label,
    },
  });

  try {
    await notifySales(supabase, {
      organizationId: connection.organization_id,
      quote,
      answers,
      lines,
      suggestionName: suggestionName(parsed.quote, lines),
    });
  } catch (error) {
    console.error("Plugin quote notify failed", error);
  }

  return { ok: true, status: 201, id: quote.id, url: pluginQuoteUrl(quote.id) };
}

function suggestionName(quote: ParsedPluginQuote, lines: PluginQuoteLine[]) {
  const text = quote.requestText.trim();
  if (text) return text.slice(0, 80);
  return lines[0]?.name ?? "Demande site web";
}

async function findReceipt(
  supabase: ReturnType<typeof createServiceClient>,
  key: ReturnType<typeof pluginReceiptKey>,
) {
  const { data } = await supabase
    .from("plugin_quote_receipts")
    .select("quote_id")
    .eq("connection_id", key.connection_id)
    .eq("external_id", key.external_id)
    .maybeSingle();
  return data?.quote_id ?? null;
}

async function loadCatalog(
  supabase: ReturnType<typeof createServiceClient>,
  connection: PluginConnection,
  items: PluginQuoteItem[],
) {
  const ids = [...new Set(items.flatMap((item) => [item.productId, item.variationId].filter(Boolean)))];
  if (!ids.length) return [];
  const { data } = await supabase
    .from("products")
    .select("id, name, external_id, sku, price_min, price_max, variants")
    .eq("organization_id", connection.organization_id)
    .eq("connection_id", connection.id)
    .in("external_id", ids);
  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    externalId: row.external_id,
    sku: row.sku,
    priceMin: row.price_min,
    priceMax: row.price_max,
    variants: readVariants(row.variants),
  }));
}

async function notifySales(
  supabase: ReturnType<typeof createServiceClient>,
  input: {
    organizationId: string;
    quote: Tables<"quotes">;
    answers: Answers;
    lines: PluginQuoteLine[];
    suggestionName: string;
  },
) {
  const { data: members } = await supabase
    .from("memberships")
    .select("user_id")
    .eq("organization_id", input.organizationId)
    .eq("status", "active")
    .not("user_id", "is", null);
  const body = `Nouvelle demande site web : ${input.quote.contact_name}`;
  await Promise.all(
    (members ?? [])
      .filter((member) => member.user_id)
      .map((member) =>
        notifyUser(supabase, {
          organizationId: input.organizationId,
          userId: member.user_id as string,
          quoteId: input.quote.id,
          type: "submitted",
          body,
        }),
      ),
  );

  await ensureDefaultEmailTemplates(supabase, input.organizationId);
  const { data: organization } = await supabase
    .from("organizations")
    .select("*")
    .eq("id", input.organizationId)
    .single();
  if (!organization) return;

  let priceMin: number | null = null;
  let priceMax: number | null = null;
  for (const line of input.lines) {
    const qty = line.quantity || 1;
    if (line.priceMin != null) priceMin = (priceMin ?? 0) + line.priceMin * qty;
    if (line.priceMax != null) priceMax = (priceMax ?? 0) + line.priceMax * qty;
  }

  try {
    await sendQuoteEmails({
      organization,
      quote: input.quote,
      answers: input.answers,
      suggestionName: input.suggestionName,
      priceMin,
      priceMax,
      pdf: null,
      includeProspect: false,
    });
  } catch (error) {
    console.error("Plugin quote sales email failed", error);
  }

  try {
    await dispatchQuoteWebhooks({
      organizationId: input.organizationId,
      quote: input.quote,
      answers: input.answers as Record<string, Json>,
      items: input.lines.map((line) => ({
        name: line.name,
        quantity: line.quantity,
        product_id: line.productId,
        options: line.options as Json,
        price_min: line.priceMin,
        price_max: line.priceMax,
      })),
      files: [],
      suggestion: null,
    });
  } catch (error) {
    console.error("Plugin quote webhooks failed", error);
  }
}

function matchItem(item: PluginQuoteItem, products: PluginCatalogProduct[]) {
  let product: PluginCatalogProduct | undefined;
  let variant: PluginCatalogVariant | undefined;
  if (item.variationId) {
    const hits = products.flatMap((row) => {
      const found = row.variants.find((entry) => entry.externalId === item.variationId);
      return found ? [{ product: row, variant: found }] : [];
    });
    const hit = hits.find((row) => item.productId && row.product.externalId === item.productId) ?? hits[0];
    if (hit) {
      product = hit.product;
      variant = hit.variant;
    }
  }
  if (!product && item.productId) {
    product = products.find((row) => row.externalId === item.productId);
  }
  if (!product && item.variationId) {
    product = products.find((row) => row.externalId === item.variationId);
  }
  if (!product) return null;
  const variantTitle = variant && !/^Variante \d+$/.test(variant.title) ? variant.title : "";
  const price =
    variant && variant.price != null
      ? { min: variant.price, max: variant.price }
      : null;
  return { product, variantTitle, price };
}

function readVariants(value: Json): PluginCatalogVariant[] {
  if (!Array.isArray(value)) return [];
  const variants: PluginCatalogVariant[] = [];
  for (const row of value) {
    if (!row || typeof row !== "object" || Array.isArray(row)) continue;
    const record = row as Record<string, unknown>;
    const externalId = normalizeVariationId(record.externalId);
    if (!externalId) continue;
    const price = typeof record.price === "number" && Number.isFinite(record.price) ? record.price : null;
    const sku = typeof record.sku === "string" && record.sku.trim() ? record.sku.trim() : null;
    const title = typeof record.title === "string" ? record.title.trim() : "";
    variants.push({ externalId, title, price, sku });
  }
  return variants;
}

function isUniqueViolation(error: { code?: string; message?: string }) {
  return error.code === "23505" || /plugin_quote_receipts/i.test(error.message ?? "");
}

function readRequired(value: unknown, label: string, max: number): string | { error: string } {
  if (typeof value !== "string" && typeof value !== "number") return { error: `${label} est requis` };
  const text = String(value).trim();
  if (!text) return { error: `${label} est requis` };
  if (text.length > max) return { error: `${label} est trop long` };
  return text;
}

function readOptional(value: unknown, label: string, max: number): string | { error: string } {
  if (value == null || value === "") return "";
  if (typeof value !== "string" && typeof value !== "number") return { error: `${label} est invalide` };
  const text = String(value).trim();
  if (text.length > max) return { error: `${label} est trop long` };
  return text;
}

function readNeeds(value: unknown): string[] | { error: string } {
  if (value == null) return [];
  if (!Array.isArray(value)) return { error: "needs est invalide" };
  if (value.length > 20) return { error: "needs est trop long" };
  const needs: string[] = [];
  for (const entry of value) {
    const text = readOptional(entry, "needs", 120);
    if (typeof text !== "string") return { error: text.error };
    if (text) needs.push(text);
  }
  return needs;
}

function readSpace(value: unknown): { length: string; height: string } | { error: string } {
  if (value == null) return { length: "", height: "" };
  if (typeof value !== "object" || Array.isArray(value)) return { error: "space est invalide" };
  const record = value as Record<string, unknown>;
  const length = readOptional(record.length, "space.length", 80);
  if (typeof length !== "string") return { error: length.error };
  const height = readOptional(record.height, "space.height", 80);
  if (typeof height !== "string") return { error: height.error };
  return { length, height };
}

function readItems(value: unknown): PluginQuoteItem[] | { error: string } {
  if (value == null) return [];
  if (!Array.isArray(value)) return { error: "items est invalide" };
  if (value.length > 100) return { error: "items est trop long" };
  const items: PluginQuoteItem[] = [];
  for (const entry of value) {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
      return { error: "items est invalide" };
    }
    const row = entry as Record<string, unknown>;
    const productId = readOptional(row.productId, "items.productId", 64);
    if (typeof productId !== "string") return { error: productId.error };
    const variationRaw = row.variationId;
    if (variationRaw != null && variationRaw !== "" && typeof variationRaw !== "string" && typeof variationRaw !== "number") {
      return { error: "items.variationId est invalide" };
    }
    const sku = readOptional(row.sku, "items.sku", 80);
    if (typeof sku !== "string") return { error: sku.error };
    const name = readOptional(row.name, "items.name", 300);
    if (typeof name !== "string") return { error: name.error };
    const variation = readOptional(row.variation, "items.variation", 300);
    if (typeof variation !== "string") return { error: variation.error };
    const note = readOptional(row.note, "items.note", 2000);
    if (typeof note !== "string") return { error: note.error };
    const url = readOptional(row.url, "items.url", 2000);
    if (typeof url !== "string") return { error: url.error };
    const qty = readQty(row.qty);
    if (qty == null) return { error: "items.qty est invalide" };
    items.push({
      productId: productId === "0" ? "" : productId,
      variationId: normalizeVariationId(variationRaw),
      sku,
      name,
      variation,
      qty,
      note,
      url,
    });
  }
  return items;
}

function readQty(value: unknown) {
  if (value == null || value === "") return 1;
  const qty = typeof value === "number" ? value : typeof value === "string" ? Number(value.trim()) : NaN;
  if (!Number.isFinite(qty) || qty < 1 || qty > 9999) return null;
  return Math.round(qty);
}

function readCreatedAt(value: unknown) {
  if (typeof value !== "string" || !value.trim()) return null;
  const time = Date.parse(value);
  if (!Number.isFinite(time)) return null;
  return new Date(time).toISOString();
}
