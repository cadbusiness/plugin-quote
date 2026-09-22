import type { PluginConnection } from "@/lib/integrations/plugin";
import { PLUGIN_QUOTE_EXAMPLE, parsePluginQuote } from "@/lib/integrations/plugin-quote-body";
import { createSession, updateSession } from "@/lib/public/session";
import { submitQuote } from "@/lib/quotes/submit";
import { createServiceClient } from "@/lib/supabase/service";
import type { Answers } from "@/lib/wizard/types";

export { PLUGIN_QUOTE_EXAMPLE, parsePluginQuote };

async function findExisting(organizationId: string, externalId: string) {
  if (!externalId) return null;
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("quotes")
    .select("id")
    .eq("organization_id", organizationId)
    .contains("answers", { external_id: externalId })
    .limit(1)
    .maybeSingle();
  return data?.id ?? null;
}

export async function ingestPluginQuote(row: PluginConnection, body: unknown) {
  const parsed = parsePluginQuote(body);
  if (!parsed.ok) return { ok: false as const, status: 400, error: parsed.error, expected: parsed.expected };
  if (!row.configurator_id) {
    return { ok: false as const, status: 409, error: "Aucun funnel appairé" };
  }

  const existingId = await findExisting(row.organization_id, parsed.quote.externalId);
  if (existingId) {
    return { ok: true as const, quoteId: existingId, alreadySubmitted: true };
  }

  const supabase = createServiceClient();
  const [{ data: org }, { data: funnel }] = await Promise.all([
    supabase.from("organizations").select("slug").eq("id", row.organization_id).maybeSingle(),
    supabase.from("configurators").select("slug").eq("id", row.configurator_id).maybeSingle(),
  ]);
  if (!org?.slug || !funnel?.slug) {
    return { ok: false as const, status: 404, error: "Funnel introuvable" };
  }

  const session = await createSession(org.slug, funnel.slug, {
    utmSource: "wordpress",
    utmMedium: "plugin",
    referrer: parsed.quote.page || null,
    landingPath: parsed.quote.page || null,
  });
  if (!session) return { ok: false as const, status: 404, error: "Funnel introuvable" };

  const answers: Answers = {
    ...parsed.quote.answers,
    need: parsed.quote.need,
    quote_mode: "rfq",
    ...(parsed.quote.externalId ? { external_id: parsed.quote.externalId } : {}),
  };
  const updated = await updateSession(session.id, session.token, {
    answers,
    contactDraft: {
      name: parsed.quote.name,
      email: parsed.quote.email,
      phone: parsed.quote.phone || undefined,
      company: parsed.quote.company || undefined,
    },
  });
  if (!updated) return { ok: false as const, status: 500, error: "Session impossible" };

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
  return { ok: true as const, quoteId: result.quoteId, alreadySubmitted: Boolean(result.alreadySubmitted) };
}

export function pluginQuoteErrorBody(error: string, expected?: typeof PLUGIN_QUOTE_EXAMPLE) {
  return expected ? { error, expected } : { error };
}
