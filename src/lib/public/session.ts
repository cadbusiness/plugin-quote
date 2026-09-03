import { randomBytes } from "crypto";
import { createServiceClient } from "@/lib/supabase/service";
import type { Tables } from "@/lib/db/database.types";
import type {
  Answers,
  ChatMessage,
  Customization,
  QuoteSession,
  SessionMode,
} from "@/lib/wizard/types";
import type { Json } from "@/lib/db/database.types";
import { ANALYTICS_EVENTS } from "@/lib/stats/events";
import { attributionColumns, type Attribution } from "@/lib/stats/attribution";

export function mapSession(row: Tables<"quote_sessions">): QuoteSession {
  const customization = (row.customization ?? {}) as Partial<Customization>;
  return {
    id: row.id,
    token: row.token,
    mode: row.mode as SessionMode,
    currentStep: row.current_step,
    answers: (row.answers ?? {}) as Answers,
    extractedParams: (row.extracted_params ?? {}) as Answers,
    chatMessages: (row.chat_messages ?? []) as ChatMessage[],
    selectedSuggestionId: row.selected_suggestion_id,
    customization: {
      quantities: customization.quantities ?? {},
      options: customization.options ?? {},
      notes: customization.notes,
    },
    submittedQuoteId: row.submitted_quote_id,
    contactDraft: (row.contact_draft ?? {}) as QuoteSession["contactDraft"],
  };
}

export async function resolvePublicConfigurator(orgSlug: string, configuratorSlug: string) {
  const supabase = createServiceClient();
  const { data: org } = await supabase
    .from("organizations")
    .select("id")
    .eq("slug", orgSlug)
    .maybeSingle();
  if (!org) return null;
  const { data: cfg } = await supabase
    .from("configurators")
    .select("id")
    .eq("organization_id", org.id)
    .eq("slug", configuratorSlug)
    .eq("is_active", true)
    .maybeSingle();
  if (!cfg) return null;
  return { organizationId: org.id, configuratorId: cfg.id };
}

export async function createSession(
  orgSlug: string,
  configuratorSlug: string,
  attribution?: Attribution,
) {
  const resolved = await resolvePublicConfigurator(orgSlug, configuratorSlug);
  if (!resolved) return null;
  const supabase = createServiceClient();

  const token = randomBytes(24).toString("hex");
  const { data, error } = await supabase
    .from("quote_sessions")
    .insert({
      organization_id: resolved.organizationId,
      configurator_id: resolved.configuratorId,
      token,
      ...(attribution ? attributionColumns(attribution) : {}),
    })
    .select("*")
    .single();
  if (error || !data) return null;
  await supabase.from("analytics_events").insert({
    organization_id: resolved.organizationId,
    configurator_id: resolved.configuratorId,
    session_id: data.id,
    visitor_id: attribution?.visitorId ?? null,
    event_type: ANALYTICS_EVENTS.started,
    step: 0,
    payload: {
      utm_source: attribution?.utmSource ?? null,
      utm_medium: attribution?.utmMedium ?? null,
      utm_campaign: attribution?.utmCampaign ?? null,
      referrer: attribution?.referrer ?? null,
    },
  });
  return mapSession(data);
}

export async function getSessionByToken(token: string) {
  const supabase = createServiceClient();
  const { data } = await supabase.from("quote_sessions").select("*").eq("token", token).maybeSingle();
  return data ? mapSession(data) : null;
}

export async function getSession(id: string, token: string) {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("quote_sessions")
    .select("*")
    .eq("id", id)
    .eq("token", token)
    .maybeSingle();
  return data ? mapSession(data) : null;
}

export async function updateSession(
  id: string,
  token: string,
  patch: {
    mode?: SessionMode;
    currentStep?: number;
    answers?: Answers;
    extractedParams?: Answers;
    chatMessages?: ChatMessage[];
    selectedSuggestionId?: string | null;
    customization?: Customization;
    contactDraft?: QuoteSession["contactDraft"];
    attribution?: Attribution;
  },
) {
  const supabase = createServiceClient();
  const update: DatabaseUpdate = { last_activity_at: new Date().toISOString() };
  if (patch.mode) update.mode = patch.mode;
  if (patch.currentStep != null) update.current_step = patch.currentStep;
  if (patch.answers) update.answers = patch.answers;
  if (patch.extractedParams) update.extracted_params = patch.extractedParams;
  if (patch.chatMessages) update.chat_messages = patch.chatMessages as unknown as Json;
  if (patch.selectedSuggestionId !== undefined) {
    update.selected_suggestion_id = patch.selectedSuggestionId;
  }
  if (patch.customization) update.customization = patch.customization as unknown as Json;
  if (patch.contactDraft) update.contact_draft = patch.contactDraft as unknown as Json;
  if (patch.attribution) {
    const { data: existing } = await supabase
      .from("quote_sessions")
      .select("utm_source, visitor_id")
      .eq("id", id)
      .eq("token", token)
      .maybeSingle();
    if (existing && !existing.utm_source) {
      const cols = attributionColumns(patch.attribution);
      update.utm_source = cols.utm_source;
      update.utm_medium = cols.utm_medium;
      update.utm_campaign = cols.utm_campaign;
      update.utm_content = cols.utm_content;
      update.utm_term = cols.utm_term;
      update.referrer = cols.referrer;
      update.landing_path = cols.landing_path;
    }
    if (existing && !existing.visitor_id && patch.attribution.visitorId) {
      update.visitor_id = patch.attribution.visitorId;
    }
  }

  const { data, error } = await supabase
    .from("quote_sessions")
    .update(update)
    .eq("id", id)
    .eq("token", token)
    .select("*")
    .single();
  if (error || !data) return null;
  return mapSession(data);
}

type DatabaseUpdate = {
  mode?: string;
  current_step?: number;
  answers?: Json;
  extracted_params?: Json;
  chat_messages?: Json;
  selected_suggestion_id?: string | null;
  customization?: Json;
  contact_draft?: Json;
  last_activity_at?: string;
  visitor_id?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_content?: string | null;
  utm_term?: string | null;
  referrer?: string | null;
  landing_path?: string | null;
};
