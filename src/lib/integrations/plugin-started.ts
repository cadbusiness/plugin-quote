import { randomBytes } from "crypto";
import type { PluginConnection } from "@/lib/integrations/plugin";
import { createSession, updateSession } from "@/lib/public/session";
import { sendHtmlEmail } from "@/lib/email/send";
import { createServiceClient } from "@/lib/supabase/service";
import type { Json } from "@/lib/db/database.types";
import type { Answers, StorefrontLine } from "@/lib/wizard/types";
import {
  STARTED_LABEL,
  STARTED_STATUS,
  hashEmailForAds,
  parsePluginStart,
  resumeUrl,
  startedExpired,
  startedReminderDue,
} from "@/lib/integrations/started-quote";

export { hashEmailForAds };

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => {
    if (char === "&") return "&amp;";
    if (char === "<") return "&lt;";
    if (char === ">") return "&gt;";
    if (char === '"') return "&quot;";
    return "&#39;";
  });
}

function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
}

function quoteAnswers(quote: ParsedFields, token: string, externalId: string): Answers {
  return {
    ...quote.answers,
    need: quote.need === "Demande commencée" ? "" : quote.need,
    quote_mode: "rfq",
    started: true,
    resume_token: token,
    ...(quote.page ? { resume_page: quote.page } : {}),
    ...(quote.needs.length ? { needs: quote.needs } : {}),
    ...(Object.keys(quote.space).length ? { space: quote.space } : {}),
    ...(quote.city ? { city: quote.city } : {}),
    ...(quote.products.length ? { products: quote.products } : {}),
    ...(externalId ? { external_id: externalId } : {}),
    captured_at: new Date().toISOString(),
  };
}

type ParsedFields = {
  need: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  page: string;
  city: string;
  needs: string[];
  space: Record<string, string>;
  products: { id: string; name: string; qty: number; sku: string; variation: string; note: string }[];
  answers: Answers;
};

async function ensureStartedStatus(organizationId: string) {
  const supabase = createServiceClient();
  const { data: existing } = await supabase
    .from("quote_statuses")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("slug", STARTED_STATUS)
    .limit(1)
    .maybeSingle();
  if (existing?.id) return existing.id;
  const { data: created } = await supabase
    .from("quote_statuses")
    .insert({
      organization_id: organizationId,
      slug: STARTED_STATUS,
      label: STARTED_LABEL,
      color: "#d97706",
      position: -1,
      is_default: false,
      is_closed: false,
    })
    .select("id")
    .single();
  return created?.id ?? null;
}

async function findByExternalId(organizationId: string, externalId: string) {
  if (!externalId) return null;
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("quotes")
    .select("id, status, answers, session_id")
    .eq("organization_id", organizationId)
    .contains("answers", { external_id: externalId })
    .limit(1)
    .maybeSingle();
  return data;
}

export async function captureStartedQuote(row: PluginConnection, body: unknown) {
  const parsed = parsePluginStart(body);
  if (!parsed.ok) return { ok: false as const, status: 400, error: parsed.error, code: parsed.code };
  if (!row.configurator_id) {
    return { ok: false as const, status: 409, error: "Aucun funnel appairé", code: "no_funnel" };
  }

  const statusId = await ensureStartedStatus(row.organization_id);
  const supabase = createServiceClient();
  const quote = parsed.quote;
  const externalId = quote.externalId || `qb-${randomBytes(8).toString("hex")}`;
  const existing = await findByExternalId(row.organization_id, externalId);
  if (existing && existing.status !== STARTED_STATUS) {
    return {
      ok: true as const,
      quoteId: existing.id,
      status: existing.status,
      alreadyStarted: false,
      alreadySubmitted: true,
      externalId,
      resumeUrl: "",
    };
  }

  const previous = asRecord(existing?.answers);
  const token = typeof previous.resume_token === "string" && previous.resume_token
    ? previous.resume_token
    : randomBytes(24).toString("hex");
  const answers = quoteAnswers(quote, token, externalId);
  if (typeof previous.reminder_sent_at === "string") answers.reminder_sent_at = previous.reminder_sent_at;
  const link = resumeUrl(quote.page || (typeof previous.resume_page === "string" ? previous.resume_page : ""), token);
  const lines: StorefrontLine[] = quote.products.map((line) => ({
    externalId: line.id || line.sku || line.name,
    name: line.name,
    quantity: line.qty,
    sku: line.sku || null,
    variation: [line.variation, line.note].filter(Boolean).join(" · "),
  }));

  if (existing) {
    await supabase
      .from("quotes")
      .update({
        contact_name: quote.name === "Demande commencée" ? "Demande commencée" : quote.name,
        contact_email: quote.email,
        contact_phone: quote.phone || null,
        contact_company: quote.company || null,
        answers: answers as Json,
        consent_marketing: false,
      })
      .eq("id", existing.id)
      .eq("organization_id", row.organization_id)
      .eq("status", STARTED_STATUS);
    return {
      ok: true as const,
      quoteId: existing.id,
      status: STARTED_STATUS,
      alreadyStarted: true,
      alreadySubmitted: false,
      externalId,
      resumeUrl: link,
    };
  }

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
    referrer: quote.page || null,
    landingPath: quote.page || null,
  });
  if (!session) return { ok: false as const, status: 404, error: "Funnel introuvable", code: "funnel_missing" };

  await updateSession(session.id, session.token, {
    answers,
    ...(lines.length ? { customization: { quantities: {}, options: {}, storefrontLines: lines } } : {}),
  });

  const { data: created, error } = await supabase
    .from("quotes")
    .insert({
      organization_id: row.organization_id,
      configurator_id: row.configurator_id,
      session_id: session.id,
      contact_name: quote.name,
      contact_email: quote.email,
      contact_phone: quote.phone || null,
      contact_company: quote.company || null,
      consent_marketing: false,
      answers: answers as Json,
      status: STARTED_STATUS,
      status_id: statusId,
      utm_source: "wordpress",
      utm_medium: "plugin",
      referrer: quote.page || null,
    })
    .select("id")
    .single();
  if (error || !created) {
    return { ok: false as const, status: 500, error: "La demande n'a pas pu être enregistrée. Réessayez dans un moment.", code: "start_failed" };
  }

  await supabase.from("quote_activities").insert({
    organization_id: row.organization_id,
    quote_id: created.id,
    type: "started",
    payload: {},
  });
  await supabase.from("analytics_events").insert({
    organization_id: row.organization_id,
    configurator_id: row.configurator_id,
    session_id: session.id,
    event_type: "quotebuilder_email",
    payload: {},
  });

  return {
    ok: true as const,
    quoteId: created.id,
    status: STARTED_STATUS,
    alreadyStarted: false,
    alreadySubmitted: false,
    externalId,
    resumeUrl: link,
  };
}

export async function loadStartedResume(organizationId: string, token: string) {
  if (!/^[a-f0-9]{32,64}$/.test(token)) {
    return { ok: false as const, status: 400, error: "Lien de reprise invalide", code: "resume_invalid" };
  }
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("quotes")
    .select("id, status, contact_name, contact_email, contact_phone, contact_company, answers")
    .eq("organization_id", organizationId)
    .contains("answers", { resume_token: token })
    .limit(1)
    .maybeSingle();
  if (!data) return { ok: false as const, status: 404, error: "Demande introuvable", code: "resume_missing" };
  if (data.status !== STARTED_STATUS) {
    return { ok: false as const, status: 409, error: "Cette demande est déjà envoyée", code: "already_submitted" };
  }
  const answers = asRecord(data.answers);
  const space = asRecord(answers.space);
  const needs = Array.isArray(answers.needs) ? answers.needs.filter((item) => typeof item === "string") : [];
  return {
    ok: true as const,
    quoteId: data.id,
    email: data.contact_email,
    name: data.contact_name === "Demande commencée" ? "" : data.contact_name,
    phone: data.contact_phone ?? "",
    company: data.contact_company ?? "",
    city: typeof answers.city === "string" ? answers.city : "",
    need: typeof answers.need === "string" ? answers.need : "",
    needs,
    length: typeof space.length === "string" ? space.length : "",
    width: typeof space.width === "string" ? space.width : "",
    height: typeof space.height === "string" ? space.height : "",
  };
}

export async function remindAndPurgeStartedQuotes(now = Date.now()) {
  const supabase = createServiceClient();
  const { data: rows } = await supabase
    .from("quotes")
    .select("id, organization_id, contact_email, contact_name, answers, created_at, status")
    .eq("status", STARTED_STATUS)
    .order("created_at", { ascending: true })
    .limit(80);

  const expired = (rows ?? []).filter((row) => startedExpired(row.created_at, now)).map((row) => row.id);
  let purged = 0;
  if (expired.length) {
    await supabase.from("quote_sessions").update({ submitted_quote_id: null }).in("submitted_quote_id", expired);
    const { count } = await supabase
      .from("quotes")
      .delete({ count: "exact" })
      .in("id", expired)
      .eq("status", STARTED_STATUS);
    purged = count ?? expired.length;
  }

  const due = (rows ?? []).filter((row) => {
    if (expired.includes(row.id)) return false;
    const answers = asRecord(row.answers);
    return startedReminderDue(row.created_at, answers.reminder_sent_at, now) && resumeUrl(
      typeof answers.resume_page === "string" ? answers.resume_page : "",
      typeof answers.resume_token === "string" ? answers.resume_token : "",
    );
  });
  const orgIds = [...new Set(due.map((row) => row.organization_id))];
  const { data: orgs } = orgIds.length
    ? await supabase.from("organizations").select("id, name").in("id", orgIds)
    : { data: [] };
  const orgName = new Map((orgs ?? []).map((org) => [org.id, org.name]));

  let reminded = 0;
  for (const row of due) {
    const answers = asRecord(row.answers);
    const link = resumeUrl(
      typeof answers.resume_page === "string" ? answers.resume_page : "",
      typeof answers.resume_token === "string" ? answers.resume_token : "",
    );
    if (!link || !row.contact_email) continue;
    const claimedAt = new Date().toISOString();
    const nextAnswers = { ...answers, reminder_sent_at: claimedAt };
    const { data: claimed } = await supabase
      .from("quotes")
      .update({ answers: nextAnswers as Json })
      .eq("id", row.id)
      .eq("status", STARTED_STATUS)
      .select("id")
      .maybeSingle();
    if (!claimed) continue;
    const name = orgName.get(row.organization_id) || "notre équipe";
    const greeting = row.contact_name && row.contact_name !== "Demande commencée" ? `Bonjour ${row.contact_name},` : "Bonjour,";
    const safeName = escapeHtml(name);
    const safeGreeting = escapeHtml(greeting);
    const safeLink = escapeHtml(link);
    try {
      await sendHtmlEmail({
        to: row.contact_email,
        subject: `Votre demande de devis — ${name}`,
        text: `${greeting}\n\nVous avez commencé une demande de devis. Reprenez-la là où vous vous êtes arrêté :\n${link}\n\nCeci est le seul rappel. Si vous n'envoyez pas la demande, nous la supprimons sous 30 jours.\n\n${name}`,
        html: `<p>${safeGreeting}</p><p>Vous avez commencé une demande de devis. Reprenez-la là où vous vous êtes arrêté :</p><p><a href="${safeLink}">${safeLink}</a></p><p>Ceci est le seul rappel. Si vous n'envoyez pas la demande, nous la supprimons sous 30 jours.</p><p>${safeName}</p>`,
      });
      reminded += 1;
      await supabase.from("quote_activities").insert({
        organization_id: row.organization_id,
        quote_id: row.id,
        type: "email_sent",
        payload: { template_kind: "started_resume" },
      });
    } catch (error) {
      console.error("started reminder failed", error);
    }
  }

  return { reminded, purged };
}
