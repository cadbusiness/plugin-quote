import type { PluginConnection } from "@/lib/integrations/plugin";
import { PLUGIN_QUOTE_EXAMPLE, parsePluginQuote } from "@/lib/integrations/plugin-quote-body";
import { createSession, updateSession } from "@/lib/public/session";
import { submitQuote } from "@/lib/quotes/submit";
import { createServiceClient } from "@/lib/supabase/service";
import type { Answers, StorefrontLine } from "@/lib/wizard/types";

export { PLUGIN_QUOTE_EXAMPLE, parsePluginQuote };

async function findExisting(organizationId: string, externalId: string) {
  if (!externalId) return null;
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("quotes")
    .select("id, answers")
    .eq("organization_id", organizationId)
    .contains("answers", { external_id: externalId })
    .limit(1)
    .maybeSingle();
  if (!data?.id) return null;
  const answers = data.answers && typeof data.answers === "object" ? (data.answers as Record<string, unknown>) : {};
  return { id: data.id, reference: typeof answers.reference === "string" ? answers.reference : "" };
}

async function assignReference(organizationId: string, quoteId: string) {
  const supabase = createServiceClient();
  const year = new Date().getUTCFullYear();
  const start = `${year}-01-01T00:00:00.000Z`;
  const { count } = await supabase
    .from("quotes")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", organizationId)
    .gte("created_at", start);
  const reference = `Q-${year}-${String(Math.max(1, count ?? 1)).padStart(4, "0")}`;
  const { data: quote } = await supabase.from("quotes").select("answers").eq("id", quoteId).maybeSingle();
  const answers =
    quote?.answers && typeof quote.answers === "object" && !Array.isArray(quote.answers)
      ? { ...(quote.answers as Record<string, unknown>), reference }
      : { reference };
  await supabase.from("quotes").update({ answers }).eq("id", quoteId).eq("organization_id", organizationId);
  return reference;
}

export async function ingestPluginQuote(row: PluginConnection, body: unknown) {
  const parsed = parsePluginQuote(body);
  if (!parsed.ok) {
    return { ok: false as const, status: 400, error: parsed.error, code: "invalid_quote", expected: parsed.expected };
  }
  if (!row.configurator_id) {
    return { ok: false as const, status: 409, error: "Aucun funnel appairé", code: "no_funnel" };
  }

  const existing = await findExisting(row.organization_id, parsed.quote.externalId);
  if (existing) {
    return {
      ok: true as const,
      quoteId: existing.id,
      alreadySubmitted: true,
      reference: existing.reference,
    };
  }

  const supabase = createServiceClient();
  const [{ data: org }, { data: funnel }] = await Promise.all([
    supabase.from("organizations").select("slug").eq("id", row.organization_id).maybeSingle(),
    supabase.from("configurators").select("slug").eq("id", row.configurator_id).maybeSingle(),
  ]);
  if (!org?.slug || !funnel?.slug) {
    return { ok: false as const, status: 404, error: "Funnel introuvable", code: "funnel_missing" };
  }

  const session = await createSession(org.slug, funnel.slug, {
    utmSource: "wordpress",
    utmMedium: "plugin",
    referrer: parsed.quote.page || null,
    landingPath: parsed.quote.page || null,
  });
  if (!session) return { ok: false as const, status: 404, error: "Funnel introuvable", code: "funnel_missing" };

  const lines: StorefrontLine[] = parsed.quote.products.map((line) => ({
    externalId: line.id || line.sku || line.name,
    name: line.name,
    quantity: line.qty,
    sku: line.sku || null,
    variation: [line.variation, line.note].filter(Boolean).join(" · "),
  }));
  const answers: Answers = {
    ...parsed.quote.answers,
    need: parsed.quote.need,
    quote_mode: "rfq",
    ...(parsed.quote.needs.length ? { needs: parsed.quote.needs } : {}),
    ...(Object.keys(parsed.quote.space).length ? { space: parsed.quote.space } : {}),
    ...(parsed.quote.city ? { city: parsed.quote.city } : {}),
    ...(parsed.quote.externalId ? { external_id: parsed.quote.externalId } : {}),
  };
  const updated = await updateSession(session.id, session.token, {
    answers,
    ...(lines.length
      ? { customization: { quantities: {}, options: {}, storefrontLines: lines } }
      : {}),
    contactDraft: {
      name: parsed.quote.name,
      email: parsed.quote.email,
      phone: parsed.quote.phone || undefined,
      company: parsed.quote.company || undefined,
    },
  });
  if (!updated) return { ok: false as const, status: 500, error: "Session impossible", code: "session_failed" };

  const result = await submitQuote({
    sessionId: session.id,
    token: session.token,
    contact: {
      name: parsed.quote.name,
      email: parsed.quote.email,
      phone: parsed.quote.phone || undefined,
      company: parsed.quote.company || undefined,
      consentMarketing: false,
    },
  });
  let reference = "";
  try {
    reference = await assignReference(row.organization_id, result.quoteId);
  } catch (error) {
    console.error("plugin quote reference", error);
  }
  return {
    ok: true as const,
    quoteId: result.quoteId,
    alreadySubmitted: Boolean(result.alreadySubmitted),
    reference,
  };
}

export function pluginQuoteErrorBody(
  error: string,
  code = "invalid_quote",
  expected?: typeof PLUGIN_QUOTE_EXAMPLE,
) {
  return expected ? { error, code, expected } : { error, code };
}
