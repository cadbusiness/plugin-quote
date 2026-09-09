import { createServiceClient } from "@/lib/supabase/service";
import { fill, sendTemplateEmail } from "@/lib/email/send";
import { logActivity } from "@/lib/crm/activity";
import { formatPrice } from "@/lib/format";
import { appUrl } from "@/lib/prospect/access";

export type FollowupTemplate = "reminder_24h" | "nudge_3d" | "reactivation_30d";

const TEMPLATE_MAP: Record<FollowupTemplate, string> = {
  reminder_24h: "prospect_reassure",
  nudge_3d: "prospect_followup",
  reactivation_30d: "prospect_reactivation",
};

export async function apiTriggerFollowup(
  organizationId: string,
  input: { lead_id: string; template: FollowupTemplate },
) {
  const kind = TEMPLATE_MAP[input.template];
  if (!kind) throw new Error(`Template inconnu: ${input.template}`);

  const supabase = createServiceClient();
  const { data: quote } = await supabase
    .from("quotes")
    .select(
      "id, contact_name, contact_email, contact_company, score, score_label, answers, organization_id, status",
    )
    .eq("id", input.lead_id)
    .eq("organization_id", organizationId)
    .maybeSingle();
  if (!quote) throw new Error("Lead introuvable");
  if (!quote.contact_email) throw new Error("Pas d’email prospect");

  const [{ data: template }, { data: org }, { data: access }, { data: items }] = await Promise.all([
    supabase
      .from("email_templates")
      .select("subject, body")
      .eq("organization_id", organizationId)
      .eq("kind", kind)
      .maybeSingle(),
    supabase.from("organizations").select("sales_name").eq("id", organizationId).maybeSingle(),
    supabase
      .from("prospect_access")
      .select("token")
      .eq("quote_id", quote.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase.from("quote_items").select("price_min, price_max, quantity").eq("quote_id", quote.id),
  ]);

  if (!template) throw new Error(`Template email ${kind} introuvable`);

  let priceMin: number | null = null;
  let priceMax: number | null = null;
  for (const item of items ?? []) {
    if (item.price_min != null) priceMin = (priceMin ?? 0) + item.price_min * (item.quantity || 1);
    if (item.price_max != null) priceMax = (priceMax ?? 0) + item.price_max * (item.quantity || 1);
    else if (item.price_min != null) priceMax = (priceMax ?? 0) + item.price_min * (item.quantity || 1);
  }

  const suivi = access?.token ? `${appUrl()}/suivi/${access.token}` : "";
  const answers =
    quote.answers && typeof quote.answers === "object" && !Array.isArray(quote.answers)
      ? (quote.answers as Record<string, unknown>)
      : {};
  const answersText = Object.entries(answers)
    .map(([key, value]) => `- ${key}: ${Array.isArray(value) ? value.join(", ") : String(value ?? "-")}`)
    .join("\n");

  const vars = {
    contact_name: quote.contact_name,
    contact_email: quote.contact_email,
    contact_company: quote.contact_company ?? "",
    score: String(quote.score ?? ""),
    score_label: quote.score_label ?? "",
    sales_name: org?.sales_name ?? "",
    answers_text: answersText,
    suggestion_name: "",
    price_range: formatPrice(priceMin, priceMax),
    suivi_url: suivi,
    resume_url: "",
    pin: "",
  };

  await sendTemplateEmail({
    to: quote.contact_email,
    subject: fill(template.subject, vars),
    body: fill(template.body, vars),
  });

  await logActivity(supabase, {
    organizationId,
    quoteId: quote.id,
    type: "email_sent",
    payload: {
      template_kind: kind,
      mcp_template: input.template,
      source: "api",
    },
  });

  return {
    lead_id: quote.id,
    template: input.template,
    email_kind: kind,
    to: quote.contact_email,
    status: "sent",
  };
}

export async function apiGetPendingFollowups(organizationId: string) {
  const supabase = createServiceClient();
  const threeDaysAgo = new Date(Date.now() - 3 * 86400000).toISOString();
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();

  const { data: quotes } = await supabase
    .from("quotes")
    .select(
      "id, contact_name, contact_email, contact_company, status, score_label, score, created_at, assigned_to",
    )
    .eq("organization_id", organizationId)
    .in("status", ["new", "contacted", "in_progress", "waiting"])
    .lte("created_at", threeDaysAgo)
    .order("created_at", { ascending: true })
    .limit(100);

  const ids = (quotes ?? []).map((q) => q.id);
  if (!ids.length) return [];

  const { data: activities } = await supabase
    .from("quote_activities")
    .select("quote_id, type, payload, created_at")
    .eq("organization_id", organizationId)
    .in("quote_id", ids)
    .eq("type", "email_sent")
    .order("created_at", { ascending: false });

  const lastFollowup = new Map<string, string>();
  for (const activity of activities ?? []) {
    if (lastFollowup.has(activity.quote_id)) continue;
    const payload =
      activity.payload && typeof activity.payload === "object" && !Array.isArray(activity.payload)
        ? (activity.payload as Record<string, unknown>)
        : {};
    const kind = typeof payload.template_kind === "string" ? payload.template_kind : "";
    if (
      kind === "prospect_reassure" ||
      kind === "prospect_followup" ||
      kind === "prospect_reactivation" ||
      kind === "sales_unprocessed"
    ) {
      lastFollowup.set(activity.quote_id, activity.created_at);
    }
  }

  return (quotes ?? []).map((quote) => {
    const ageDays = Math.floor((Date.now() - new Date(quote.created_at).getTime()) / 86400000);
    const last = lastFollowup.get(quote.id);
    let suggested: FollowupTemplate = "nudge_3d";
    if (ageDays >= 30 || quote.created_at <= thirtyDaysAgo) suggested = "reactivation_30d";
    else if (ageDays >= 3) suggested = "nudge_3d";
    else suggested = "reminder_24h";

    return {
      lead_id: quote.id,
      name: quote.contact_name,
      email: quote.contact_email,
      company: quote.contact_company,
      status: quote.status,
      score_label: quote.score_label,
      score: quote.score,
      created_at: quote.created_at,
      age_days: ageDays,
      last_followup_at: last ?? null,
      suggested_template: suggested,
      needs_followup: !last || new Date(last).getTime() < Date.now() - 2 * 86400000,
    };
  }).filter((row) => row.needs_followup);
}
