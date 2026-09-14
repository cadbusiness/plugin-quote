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
import { visitColumns, type VisitContext } from "@/lib/stats/visit";
import { pickPreferredBySlug, publicConfiguratorSlugs } from "@/lib/demo/public-slugs";
import {
  gateShopCatalogRequest,
  resolveShopCatalog,
  shopCatalogError,
  type ShopCatalogGate,
} from "@/lib/shops/catalog-scope";

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
      storefrontLines: customization.storefrontLines,
    },
    submittedQuoteId: row.submitted_quote_id,
    contactDraft: (row.contact_draft ?? {}) as QuoteSession["contactDraft"],
    configuratorId: row.configurator_id,
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
  const slugs = publicConfiguratorSlugs(orgSlug, configuratorSlug);
  const { data: matches } = await supabase
    .from("configurators")
    .select("id, slug")
    .eq("organization_id", org.id)
    .in("slug", slugs)
    .eq("is_active", true);
  const cfg = pickPreferredBySlug(matches, slugs);
  if (!cfg) return null;
  return { organizationId: org.id, configuratorId: cfg.id };
}

export async function createSession(
  orgSlug: string,
  configuratorSlug: string,
  attribution?: Attribution,
  visit?: VisitContext,
) {
  const resolved = await resolvePublicConfigurator(orgSlug, configuratorSlug);
  if (!resolved) return null;
  const supabase = createServiceClient();

  const { data: cfgFlags } = await supabase
    .from("configurators")
    .select("wizard_enabled, chat_enabled")
    .eq("id", resolved.configuratorId)
    .maybeSingle();
  /** Chat-only funnels start in chat mode (commerce agent), not an empty wizard shell. */
  const initialMode =
    cfgFlags?.chat_enabled && !cfgFlags?.wizard_enabled ? "chat" : "wizard";

  const token = randomBytes(24).toString("hex");
  const base = {
    organization_id: resolved.organizationId,
    configurator_id: resolved.configuratorId,
    token,
    mode: initialMode,
    ...(attribution ? attributionColumns(attribution) : {}),
  };
  let { data, error } = await supabase
    .from("quote_sessions")
    .insert({ ...base, ...(visit ? visitColumns(visit) : {}) })
    .select("*")
    .single();
  if (error && visit) {
    ({ data, error } = await supabase.from("quote_sessions").insert(base).select("*").single());
  }
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
      gclid: attribution?.gclid ?? null,
      path: attribution?.landingPath ?? null,
      country: visit?.country ?? null,
      city: visit?.city ?? null,
      device: visit?.device ?? null,
    },
  });
  return mapSession(data);
}

export async function createShopScopedSession(input: {
  orgSlug: string;
  shopSlug: string;
  configuratorSlug?: string;
  configuratorId?: string;
  attribution?: Attribution;
  visit?: VisitContext;
}): Promise<{ ok: true; session: QuoteSession } | Extract<ShopCatalogGate, { ok: false }>> {
  const resolved = await resolveShopCatalog(input.orgSlug, input.shopSlug);
  const gate = gateShopCatalogRequest(resolved, {
    configuratorId: input.configuratorId,
    configuratorSlug: input.configuratorSlug,
  });
  if (!gate.ok) return gate;

  const supabase = createServiceClient();
  const { data: cfgFlags } = await supabase
    .from("configurators")
    .select("wizard_enabled, chat_enabled")
    .eq("id", gate.scope.configuratorId)
    .maybeSingle();
  const initialMode =
    cfgFlags?.chat_enabled && !cfgFlags?.wizard_enabled ? "chat" : "wizard";

  const token = randomBytes(24).toString("hex");
  const base = {
    organization_id: gate.scope.organizationId,
    configurator_id: gate.scope.configuratorId,
    token,
    mode: initialMode,
    ...(input.attribution ? attributionColumns(input.attribution) : {}),
  };
  let { data, error } = await supabase
    .from("quote_sessions")
    .insert({ ...base, ...(input.visit ? visitColumns(input.visit) : {}) })
    .select("*")
    .single();
  if (error && input.visit) {
    ({ data, error } = await supabase.from("quote_sessions").insert(base).select("*").single());
  }
  if (error || !data) {
    const denied = shopCatalogError("no_catalog");
    return { ok: false, reason: "no_catalog", status: denied.status, error: denied.error };
  }
  await supabase.from("analytics_events").insert({
    organization_id: gate.scope.organizationId,
    configurator_id: gate.scope.configuratorId,
    session_id: data.id,
    visitor_id: input.attribution?.visitorId ?? null,
    event_type: ANALYTICS_EVENTS.started,
    step: 0,
    payload: {
      utm_source: input.attribution?.utmSource ?? null,
      utm_medium: input.attribution?.utmMedium ?? null,
      utm_campaign: input.attribution?.utmCampaign ?? null,
      referrer: input.attribution?.referrer ?? null,
      gclid: input.attribution?.gclid ?? null,
      path: input.attribution?.landingPath ?? null,
      country: input.visit?.country ?? null,
      city: input.visit?.city ?? null,
      device: input.visit?.device ?? null,
    },
  });
  return { ok: true, session: mapSession(data) };
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
    visit?: VisitContext;
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
  if (patch.attribution || patch.visit) {
    const { data: existing } = await supabase
      .from("quote_sessions")
      .select("utm_source, visitor_id, gclid, country, device")
      .eq("id", id)
      .eq("token", token)
      .maybeSingle();
    if (existing && patch.attribution && !existing.utm_source) {
      const cols = attributionColumns(patch.attribution);
      update.utm_source = cols.utm_source;
      update.utm_medium = cols.utm_medium;
      update.utm_campaign = cols.utm_campaign;
      update.utm_content = cols.utm_content;
      update.utm_term = cols.utm_term;
      update.referrer = cols.referrer;
      update.landing_path = cols.landing_path;
    }
    if (existing && patch.attribution && !existing.visitor_id && patch.attribution.visitorId) {
      update.visitor_id = patch.attribution.visitorId;
    }
    if (existing && patch.attribution && !existing.gclid && patch.attribution.gclid) {
      const cols = attributionColumns(patch.attribution);
      update.gclid = cols.gclid;
      update.gbraid = cols.gbraid;
      update.wbraid = cols.wbraid;
    }
    if (existing && patch.visit && !existing.country && patch.visit.country) {
      const cols = visitColumns(patch.visit);
      update.country = cols.country;
      update.city = cols.city;
      update.region = cols.region;
    }
    if (existing && patch.visit && !existing.device && patch.visit.device) {
      const cols = visitColumns(patch.visit);
      update.device = cols.device;
      update.user_agent = cols.user_agent;
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
  gclid?: string | null;
  gbraid?: string | null;
  wbraid?: string | null;
  country?: string | null;
  city?: string | null;
  region?: string | null;
  user_agent?: string | null;
  device?: string | null;
};
