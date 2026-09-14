import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/lib/db/database.types";
import { labelAnswers, type LabeledAnswer } from "@/lib/crm/answers";
import { ANALYTICS_EVENTS } from "@/lib/stats/events";
import { classifySource } from "@/lib/stats/attribution";
import {
  countryName,
  formatVisitDuration,
  formatVisitPlace,
  referrerHost,
  visitPageLabel,
  type VisitDevice,
} from "@/lib/stats/visit";
import type { Answers } from "@/lib/wizard/types";

const STALE_MS = 60 * 60 * 1000;

export type AbandonDraft = {
  name?: string;
  email?: string;
  company?: string;
  phone?: string;
};

export type AbandonView = "relance" | "email" | "tous";

export type AbandonStop = {
  at: string;
  label: string;
  detail: string | null;
};

export type AbandonRow = {
  id: string;
  token: string;
  name: string | null;
  email: string | null;
  company: string | null;
  phone: string | null;
  step: number;
  stepCount: number;
  progress: number;
  funnel: string;
  lastActivity: string;
  startedAt: string;
  durationMs: number;
  durationLabel: string;
  country: string | null;
  countryName: string | null;
  city: string | null;
  place: string | null;
  device: VisitDevice | null;
  source: string;
  referrer: string | null;
  referrerHost: string | null;
  landingPath: string | null;
  landingLabel: string | null;
  pageCount: number;
  stops: AbandonStop[];
  answers: LabeledAnswer[];
  chatCount: number;
  mode: string;
  recoverable: boolean;
  stale: boolean;
  relanced: boolean;
};

export type AbandonSnapshot = {
  started: number;
  baskets: number;
  stale: number;
  anonymous: number;
  relanced: number;
  rows: AbandonRow[];
};

type VisitEvent = {
  id: string;
  session_id: string | null;
  visitor_id: string | null;
  event_type: string;
  payload: Json;
  created_at: string;
};

function draftOf(value: Json | null): AbandonDraft {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const row = value as Record<string, unknown>;
  return {
    name: typeof row.name === "string" ? row.name : undefined,
    email: typeof row.email === "string" ? row.email : undefined,
    company: typeof row.company === "string" ? row.company : undefined,
    phone: typeof row.phone === "string" ? row.phone : undefined,
  };
}

function asAnswers(value: Json | null): Answers {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Answers;
}

function asPayload(value: Json | null): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
}

function payloadString(payload: Record<string, unknown>, key: string) {
  const value = payload[key];
  return typeof value === "string" && value.trim() ? value : null;
}

function chatCountOf(value: Json | null) {
  return Array.isArray(value) ? value.length : 0;
}

function countBy(ids: string[]) {
  const map = new Map<string, number>();
  for (const id of ids) map.set(id, (map.get(id) ?? 0) + 1);
  return map;
}

export function resolveAbandonView(raw: string | undefined): AbandonView {
  if (raw === "relance" || raw === "email" || raw === "tous") return raw;
  return "tous";
}

export function filterAbandonRows(rows: AbandonRow[], view: AbandonView) {
  if (view === "relance") return rows.filter((row) => row.recoverable && row.stale);
  if (view === "email") return rows.filter((row) => row.recoverable);
  return rows;
}

export function visitStops(input: {
  startedAt: string;
  landingPath: string | null;
  currentStep: number;
  stepTitles: string[];
  events: { created_at: string; event_type: string; payload: Json }[];
}): AbandonStop[] {
  const stops: AbandonStop[] = [];

  function push(at: string, label: string, detail: string | null) {
    const last = stops[stops.length - 1];
    if (last && last.label === label && last.detail === detail) return;
    stops.push({ at, label, detail });
  }

  if (input.landingPath) {
    push(input.startedAt, visitPageLabel(input.landingPath), input.landingPath);
  }

  let sawStep = false;
  for (const event of input.events) {
    const payload = asPayload(event.payload);
    const path = payloadString(payload, "path") ?? payloadString(payload, "landing_path");
    const title = payloadString(payload, "title");
    if (event.event_type === ANALYTICS_EVENTS.pageView) {
      push(event.created_at, title || visitPageLabel(path), path);
      continue;
    }
    const stepMatch = /^quotebuilder_step_(\d+)$/.exec(event.event_type);
    if (stepMatch) {
      sawStep = true;
      const index = Number(stepMatch[1]);
      push(event.created_at, input.stepTitles[index] ?? `Étape ${index + 1}`, "Parcours");
      continue;
    }
    if (event.event_type === ANALYTICS_EVENTS.started) {
      push(event.created_at, "Parcours commencé", null);
      continue;
    }
    if (event.event_type === ANALYTICS_EVENTS.email) {
      push(event.created_at, "Email saisi", null);
    }
  }

  if (!sawStep && input.stepTitles.length) {
    const last = Math.min(input.currentStep, input.stepTitles.length - 1);
    for (let index = 0; index <= last; index += 1) {
      push(input.startedAt, input.stepTitles[index] ?? `Étape ${index + 1}`, "Parcours");
    }
  }

  return stops;
}

function pageCountOf(landingPath: string | null, events: VisitEvent[]) {
  const paths = new Set<string>();
  if (landingPath) paths.add(landingPath.split("?")[0] ?? landingPath);
  for (const event of events) {
    if (event.event_type !== ANALYTICS_EVENTS.pageView) continue;
    const payload = asPayload(event.payload);
    const path = payloadString(payload, "path") ?? payloadString(payload, "landing_path");
    if (path) paths.add(path.split("?")[0] ?? path);
  }
  return Math.max(1, paths.size);
}

function eventsForSession(session: { id: string; visitor_id: string | null }, events: VisitEvent[]) {
  return events
    .filter((event) => {
      if (event.session_id === session.id) return true;
      if (!session.visitor_id || event.visitor_id !== session.visitor_id) return false;
      return !event.session_id || event.session_id === session.id;
    })
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
}

type SessionVisitRow = {
  id: string;
  token: string;
  contact_draft: Json;
  current_step: number;
  last_activity_at: string;
  updated_at: string;
  created_at: string;
  configurator_id: string;
  visitor_id: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  referrer: string | null;
  landing_path: string | null;
  gclid: string | null;
  gbraid: string | null;
  wbraid: string | null;
  country?: string | null;
  city?: string | null;
  device?: string | null;
  answers: Json;
  chat_messages: Json;
  mode: string;
};

export async function loadAbandonSnapshot(
  supabase: SupabaseClient<Database>,
  orgId: string,
): Promise<AbandonSnapshot> {
  const sessionSelect =
    "id, token, contact_draft, current_step, last_activity_at, updated_at, created_at, configurator_id, visitor_id, utm_source, utm_medium, utm_campaign, referrer, landing_path, gclid, gbraid, wbraid, country, city, device, answers, chat_messages, mode";
  const sessionSelectLegacy = sessionSelect.replace(", country, city, device", "");

  const [{ data: sessionsFull, error: sessionsError }, { data: funnels }, { data: steps }, { data: runs }, { data: events }] =
    await Promise.all([
      supabase
        .from("quote_sessions")
        .select(sessionSelect)
        .eq("organization_id", orgId)
        .is("submitted_quote_id", null)
        .order("last_activity_at", { ascending: false })
        .limit(150),
      supabase.from("configurators").select("id, name").eq("organization_id", orgId),
      supabase
        .from("wizard_steps")
        .select("configurator_id, title, sort_order")
        .eq("organization_id", orgId)
        .order("sort_order", { ascending: true }),
      supabase
        .from("workflow_runs")
        .select("subject_id")
        .eq("organization_id", orgId)
        .eq("subject_type", "session")
        .limit(500),
      supabase
        .from("analytics_events")
        .select("id, session_id, visitor_id, event_type, payload, created_at")
        .eq("organization_id", orgId)
        .order("created_at", { ascending: false })
        .limit(2500),
    ]);

  let sessions = (sessionsFull ?? []) as unknown as SessionVisitRow[];
  if (sessionsError) {
    const fallback = await supabase
      .from("quote_sessions")
      .select(sessionSelectLegacy)
      .eq("organization_id", orgId)
      .is("submitted_quote_id", null)
      .order("last_activity_at", { ascending: false })
      .limit(150);
    sessions = (fallback.data ?? []) as unknown as SessionVisitRow[];
  }

  const funnelName = new Map((funnels ?? []).map((funnel) => [funnel.id, funnel.name]));
  const stepTitles = new Map<string, string[]>();
  for (const step of steps ?? []) {
    const list = stepTitles.get(step.configurator_id) ?? [];
    list.push(step.title);
    stepTitles.set(step.configurator_id, list);
  }
  const stepCounts = countBy((steps ?? []).map((step) => step.configurator_id));
  const relancedIds = new Set((runs ?? []).map((run) => run.subject_id));
  const visitEvents = (events ?? []) as VisitEvent[];
  const now = Date.now();

  const rows: AbandonRow[] = sessions.map((session) => {
    const draft = draftOf(session.contact_draft);
    const lastActivity = session.last_activity_at ?? session.updated_at;
    const startedAt = session.created_at;
    const stale = now - new Date(lastActivity).getTime() >= STALE_MS;
    const titles = stepTitles.get(session.configurator_id) ?? [];
    const stepCount = Math.max(1, stepCounts.get(session.configurator_id) ?? titles.length ?? 1);
    const step = session.current_step + 1;
    const related = eventsForSession(session, visitEvents);
    const durationMs = Math.max(0, new Date(lastActivity).getTime() - new Date(startedAt).getTime());
    const landingPath = session.landing_path;
    const geoFromEvents = related
      .map((event) => asPayload(event.payload))
      .find((payload) => payloadString(payload, "country"));
    const country = session.country ?? payloadString(geoFromEvents ?? {}, "country");
    const city = session.city ?? payloadString(geoFromEvents ?? {}, "city");
    const deviceRaw = session.device ?? payloadString(geoFromEvents ?? {}, "device");
    const device =
      deviceRaw === "mobile" || deviceRaw === "tablet" || deviceRaw === "desktop" ? deviceRaw : null;
    return {
      id: session.id,
      token: session.token,
      name: draft.name ?? null,
      email: draft.email ?? null,
      company: draft.company ?? null,
      phone: draft.phone ?? null,
      step,
      stepCount,
      progress: Math.min(1, step / stepCount),
      funnel: funnelName.get(session.configurator_id) ?? "Funnel",
      lastActivity,
      startedAt,
      durationMs,
      durationLabel: formatVisitDuration(durationMs),
      country,
      countryName: countryName(country),
      city,
      place: formatVisitPlace(city, country),
      device,
      source: classifySource({
        utmSource: session.utm_source,
        utmMedium: session.utm_medium,
        referrer: session.referrer,
        gclid: session.gclid,
        gbraid: session.gbraid,
        wbraid: session.wbraid,
      }),
      referrer: session.referrer,
      referrerHost: referrerHost(session.referrer),
      landingPath,
      landingLabel: landingPath ? visitPageLabel(landingPath) : null,
      pageCount: pageCountOf(landingPath, related),
      stops: visitStops({
        startedAt,
        landingPath,
        currentStep: session.current_step,
        stepTitles: titles,
        events: related,
      }),
      answers: labelAnswers(asAnswers(session.answers)),
      chatCount: chatCountOf(session.chat_messages),
      mode: session.mode,
      recoverable: Boolean(draft.email),
      stale,
      relanced: relancedIds.has(session.id),
    };
  });

  rows.sort((a, b) => {
    const rank = (row: AbandonRow) => {
      if (row.recoverable && row.stale && !row.relanced) return 0;
      if (row.recoverable && row.stale) return 1;
      if (row.recoverable) return 2;
      return 3;
    };
    const delta = rank(a) - rank(b);
    if (delta !== 0) return delta;
    return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime();
  });

  const recoverable = rows.filter((row) => row.recoverable);

  return {
    started: rows.length,
    baskets: recoverable.length,
    stale: recoverable.filter((row) => row.stale).length,
    anonymous: rows.filter((row) => !row.recoverable).length,
    relanced: recoverable.filter((row) => row.relanced).length,
    rows,
  };
}
