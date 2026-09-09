import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/lib/db/database.types";
import type { Answers } from "@/lib/wizard/types";
import { matchSegment, parseSegmentRules } from "@/lib/segments/match";
import type { SegmentContact, SegmentRules } from "@/lib/segments/types";

type Client = SupabaseClient<Database>;

function asAnswers(value: Json | null): Answers {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Answers;
}

export async function loadSegmentContacts(
  supabase: Client,
  orgId: string,
): Promise<SegmentContact[]> {
  const [{ data: quotes }, { data: statuses }, { data: sends }] = await Promise.all([
    supabase
      .from("quotes")
      .select(
        "id, contact_name, contact_email, contact_company, score_label, status_id, status, configurator_id, answers",
      )
      .eq("organization_id", orgId)
      .order("created_at", { ascending: false })
      .limit(2000),
    supabase.from("quote_statuses").select("id, slug").eq("organization_id", orgId),
    supabase
      .from("email_campaign_sends")
      .select("contact_email, sent_at")
      .eq("organization_id", orgId)
      .eq("status", "sent")
      .order("sent_at", { ascending: false })
      .limit(4000),
  ]);

  const slugById = new Map((statuses ?? []).map((row) => [row.id, row.slug]));
  const lastByEmail = new Map<string, string>();
  for (const send of sends ?? []) {
    if (!send.sent_at) continue;
    const key = send.contact_email.toLowerCase();
    if (!lastByEmail.has(key)) lastByEmail.set(key, send.sent_at);
  }

  return (quotes ?? []).map((quote) => ({
    id: quote.id,
    contactName: quote.contact_name,
    contactEmail: quote.contact_email,
    contactCompany: quote.contact_company,
    scoreLabel: quote.score_label,
    statusSlug: (quote.status_id ? slugById.get(quote.status_id) : null) ?? quote.status,
    configuratorId: quote.configurator_id,
    answers: asAnswers(quote.answers),
    lastCampaignAt: lastByEmail.get(quote.contact_email.toLowerCase()) ?? null,
  }));
}

export async function resolveSegment(
  supabase: Client,
  orgId: string,
  rules: SegmentRules | unknown,
): Promise<SegmentContact[]> {
  const parsed = Array.isArray((rules as SegmentRules)?.all)
    ? (rules as SegmentRules)
    : parseSegmentRules(rules);
  const contacts = await loadSegmentContacts(supabase, orgId);
  return contacts.filter((contact) => matchSegment(parsed, contact));
}

export type FunnelQuestion = {
  configuratorId: string;
  funnelName: string;
  key: string;
  label: string;
  choices: { value: string; label: string }[];
};

export async function loadFunnelQuestions(supabase: Client, orgId: string): Promise<FunnelQuestion[]> {
  const [{ data: funnels }, { data: steps }, { data: questions }] = await Promise.all([
    supabase.from("configurators").select("id, name").eq("organization_id", orgId),
    supabase.from("wizard_steps").select("id, configurator_id").eq("organization_id", orgId),
    supabase.from("wizard_questions").select("id, step_id, key, label, options").eq("organization_id", orgId),
  ]);
  const funnelName = new Map((funnels ?? []).map((row) => [row.id, row.name]));
  const stepFunnel = new Map((steps ?? []).map((row) => [row.id, row.configurator_id]));
  const out: FunnelQuestion[] = [];
  for (const question of questions ?? []) {
    const configuratorId = stepFunnel.get(question.step_id);
    if (!configuratorId) continue;
    const options = (question.options ?? {}) as { choices?: { value: string; label: string }[] };
    out.push({
      configuratorId,
      funnelName: funnelName.get(configuratorId) ?? "Funnel",
      key: question.key,
      label: question.label,
      choices: options.choices ?? [],
    });
  }
  return out;
}
