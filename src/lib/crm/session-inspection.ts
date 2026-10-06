import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/lib/db/database.types";
import { labelAnswers, type LabeledAnswer } from "@/lib/crm/answers";
import { visitStops, type AbandonStop } from "@/lib/crm/abandons";
import type { Answers } from "@/lib/wizard/types";

export type InspectionMessage = {
  role: "user" | "assistant";
  content: string;
};

export type SessionInspection = {
  id: string;
  name: string | null;
  email: string | null;
  company: string | null;
  phone: string | null;
  funnel: string;
  step: number;
  stepCount: number;
  progress: number;
  lastActivity: string;
  mode: string;
  answers: LabeledAnswer[];
  stops: AbandonStop[];
  messages: InspectionMessage[];
};

function asRecord(value: Json | null): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
}

function stringField(record: Record<string, unknown>, key: string) {
  const value = record[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function asAnswers(value: Json | null): Answers {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Answers;
}

function chatMessages(value: Json | null): InspectionMessage[] {
  if (!Array.isArray(value)) return [];
  const messages: InspectionMessage[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object" || Array.isArray(item)) continue;
    const row = item as Record<string, unknown>;
    if (typeof row.content !== "string" || !row.content.trim()) continue;
    messages.push({
      role: row.role === "assistant" ? "assistant" : "user",
      content: row.content.trim(),
    });
  }
  return messages;
}

/**
 * Read-only staff view of one session.
 * Selects only. Does not write last_activity_at and does not return the resume token.
 */
export async function loadSessionInspection(
  supabase: SupabaseClient<Database>,
  orgId: string,
  sessionId: string,
): Promise<SessionInspection | null> {
  const { data: session } = await supabase
    .from("quote_sessions")
    .select(
      "id, contact_draft, current_step, last_activity_at, updated_at, created_at, configurator_id, landing_path, answers, chat_messages, mode",
    )
    .eq("id", sessionId)
    .eq("organization_id", orgId)
    .maybeSingle();
  if (!session) return null;

  const [{ data: funnel }, { data: steps }, { data: events }] = await Promise.all([
    supabase.from("configurators").select("name").eq("id", session.configurator_id).eq("organization_id", orgId).maybeSingle(),
    supabase
      .from("wizard_steps")
      .select("title, sort_order")
      .eq("organization_id", orgId)
      .eq("configurator_id", session.configurator_id)
      .order("sort_order", { ascending: true }),
    supabase
      .from("analytics_events")
      .select("event_type, payload, created_at")
      .eq("organization_id", orgId)
      .eq("session_id", session.id)
      .order("created_at", { ascending: true })
      .limit(400),
  ]);

  const draft = asRecord(session.contact_draft);
  const titles = (steps ?? []).map((step) => step.title);
  const stepCount = Math.max(1, titles.length || 1);
  const step = session.current_step + 1;
  const lastActivity = session.last_activity_at ?? session.updated_at;

  return {
    id: session.id,
    name: stringField(draft, "name"),
    email: stringField(draft, "email"),
    company: stringField(draft, "company"),
    phone: stringField(draft, "phone"),
    funnel: funnel?.name ?? "Funnel",
    step,
    stepCount,
    progress: Math.min(1, step / stepCount),
    lastActivity,
    mode: session.mode,
    answers: labelAnswers(asAnswers(session.answers)),
    stops: visitStops({
      startedAt: session.created_at,
      landingPath: session.landing_path,
      currentStep: session.current_step,
      stepTitles: titles,
      events: events ?? [],
    }),
    messages: chatMessages(session.chat_messages),
  };
}
