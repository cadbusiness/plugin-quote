import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/lib/db/database.types";
import type { QuoteListExtras } from "@/components/crm/quote-list-cells";
import { loadAbandonSnapshot, type AbandonSnapshot } from "@/lib/crm/abandons";
import { listQuotes, loadQuoteListExtras } from "@/lib/crm/quotes";
import { loadSegmentContacts } from "@/lib/segments/resolve";
import { matchSegment, parseSegmentRules } from "@/lib/segments/match";
import { ANALYTICS_EVENTS } from "@/lib/stats/events";
import {
  deltaMeta,
  formatKpiEur,
  formatKpiNumber,
  type Kpi,
  type MonthPoint,
} from "@/lib/stats/dashboard";

export const HOME_MODULE_IDS = [
  "quotes",
  "abandons",
  "stats",
  "automations",
  "emails",
  "segments",
  "team",
  "funnels",
] as const;

export type HomeModuleId = (typeof HOME_MODULE_IDS)[number];

export type HomeModuleDef = {
  id: HomeModuleId;
  label: string;
  hint: string;
  admin?: boolean;
  defaultOn: boolean;
  span: "full" | "half";
};

export const HOME_MODULES: HomeModuleDef[] = [
  { id: "quotes", label: "Demandes", hint: "Les 4 derniers dossiers, pleine largeur.", defaultOn: true, span: "full" },
  { id: "abandons", label: "Abandons", hint: "Jauges visites → email → relance.", defaultOn: true, span: "half" },
  { id: "stats", label: "Tendance", hint: "Devis et signés sur 6 mois.", defaultOn: true, span: "half" },
  { id: "automations", label: "Automatisations", hint: "Parcours actifs, 4 lignes.", defaultOn: true, admin: true, span: "half" },
  { id: "emails", label: "Emails", hint: "Campagnes récentes, 4 lignes.", defaultOn: true, span: "half" },
  { id: "segments", label: "Segmentation", hint: "Listes et volume de contacts.", defaultOn: true, span: "half" },
  { id: "team", label: "Équipe", hint: "Membres et rôles.", defaultOn: false, admin: true, span: "half" },
  { id: "funnels", label: "Funnels", hint: "Configurateurs à partager.", defaultOn: false, admin: true, span: "half" },
];

export function defaultHomeModules(isAdmin: boolean): HomeModuleId[] {
  return HOME_MODULES.filter((item) => item.defaultOn && (!item.admin || isAdmin)).map((item) => item.id);
}

export function parseHomeModules(raw: unknown, isAdmin: boolean): HomeModuleId[] {
  const allowed = new Set(
    HOME_MODULES.filter((item) => !item.admin || isAdmin).map((item) => item.id),
  );
  const list = Array.isArray(raw)
    ? raw
    : typeof raw === "string"
      ? raw.split(/[,\s]+/)
      : [];
  const ids = list.filter((id): id is HomeModuleId => allowed.has(id as HomeModuleId));
  return [...new Set(ids)];
}

export function resolveHomeModules(input: {
  cookie?: string | null;
  branding: Json;
  isAdmin: boolean;
}): HomeModuleId[] {
  if (input.cookie != null) {
    if (input.cookie === "" || input.cookie === "-") return [];
    return parseHomeModules(input.cookie, input.isAdmin);
  }
  const branding =
    input.branding && typeof input.branding === "object" && !Array.isArray(input.branding)
      ? (input.branding as { homeModules?: unknown }).homeModules
      : undefined;
  if (branding !== undefined) return parseHomeModules(branding, input.isAdmin);
  return defaultHomeModules(input.isAdmin);
}

export function homeModulesCookieValue(ids: HomeModuleId[]) {
  return ids.length ? ids.join(",") : "-";
}

export function moduleSpan(id: HomeModuleId) {
  return HOME_MODULES.find((item) => item.id === id)?.span ?? "half";
}

export type HomeQuote = Awaited<ReturnType<typeof listQuotes>>[number];

export type HomeCampaign = {
  id: string;
  name: string;
  status: string;
  sent_count: number;
  send_mode: string;
};

export type HomeWorkflow = {
  id: string;
  name: string;
  status: string;
  trigger_type: string;
  running: number;
  waiting: number;
  failed: number;
};

export type HomeSegment = {
  id: string;
  name: string;
  count: number;
};

export type HomeMember = {
  id: string;
  label: string;
  role: string;
  status: string;
};

export type HomeFunnel = {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
};

export type HomeStats = {
  kpis: Kpi[];
  months: MonthPoint[];
};

export type HomeDashboard = {
  modules: HomeModuleId[];
  quotes: HomeQuote[];
  extras: Map<string, QuoteListExtras>;
  statuses: { id: string; label: string; slug: string }[];
  newStatusId?: string;
  abandons: AbandonSnapshot | null;
  stats: HomeStats | null;
  campaigns: HomeCampaign[];
  workflows: HomeWorkflow[];
  segments: HomeSegment[];
  members: HomeMember[];
  unassigned: number;
  funnels: HomeFunnel[];
  orgSlug: string;
};

const MONTH_LABELS = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];

function monthKey(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function itemValue(priceMin: number | null, priceMax: number | null, quantity: number) {
  const min = priceMin ?? 0;
  const max = priceMax ?? priceMin ?? 0;
  return ((min + max) / 2) * (quantity || 1);
}

async function loadHomeStats(
  supabase: SupabaseClient<Database>,
  orgId: string,
): Promise<HomeStats> {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const sixStart = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const [{ data: quotes }, { data: statuses }, { count: visitors }, { count: prevVisitors }, { data: sessions }] =
    await Promise.all([
      supabase
        .from("quotes")
        .select("id, status, status_id, created_at")
        .eq("organization_id", orgId)
        .gte("created_at", sixStart.toISOString()),
      supabase.from("quote_statuses").select("id, slug").eq("organization_id", orgId),
      supabase
        .from("analytics_events")
        .select("id", { count: "exact", head: true })
        .eq("organization_id", orgId)
        .eq("event_type", ANALYTICS_EVENTS.pageView)
        .gte("created_at", monthStart.toISOString()),
      supabase
        .from("analytics_events")
        .select("id", { count: "exact", head: true })
        .eq("organization_id", orgId)
        .eq("event_type", ANALYTICS_EVENTS.pageView)
        .gte("created_at", prevStart.toISOString())
        .lt("created_at", monthStart.toISOString()),
      supabase
        .from("quote_sessions")
        .select("created_at, submitted_quote_id")
        .eq("organization_id", orgId)
        .gte("created_at", sixStart.toISOString())
        .limit(800),
    ]);

  const list = quotes ?? [];
  const quoteIds = list.map((quote) => quote.id);
  const { data: items } = quoteIds.length
    ? await supabase
        .from("quote_items")
        .select("quote_id, price_min, price_max, quantity")
        .in("quote_id", quoteIds)
    : { data: [] };

  const slugById = new Map((statuses ?? []).map((row) => [row.id, row.slug]));
  const slugOf = (quote: { status_id: string | null; status: string }) =>
    (quote.status_id ? slugById.get(quote.status_id) : null) ?? quote.status;
  const valueByQuote = new Map<string, number>();
  for (const item of items ?? []) {
    valueByQuote.set(
      item.quote_id,
      (valueByQuote.get(item.quote_id) ?? 0) + itemValue(item.price_min, item.price_max, item.quantity ?? 1),
    );
  }

  const inMonth = (iso: string, start: Date, end: Date) => {
    const t = new Date(iso).getTime();
    return t >= start.getTime() && t < end.getTime();
  };
  const monthQuotes = list.filter((quote) => inMonth(quote.created_at, monthStart, now));
  const prevQuotes = list.filter((quote) => inMonth(quote.created_at, prevStart, monthStart));
  const submitted = monthQuotes.length;
  const prevSubmitted = prevQuotes.length;
  const volume = monthQuotes.reduce((sum, quote) => sum + (valueByQuote.get(quote.id) ?? 0), 0);
  const prevVolume = prevQuotes.reduce((sum, quote) => sum + (valueByQuote.get(quote.id) ?? 0), 0);
  const visits = visitors ?? 0;
  const prevVisits = prevVisitors ?? 0;
  const conversion = visits ? (submitted / visits) * 100 : 0;
  const prevConversion = prevVisits ? (prevSubmitted / prevVisits) * 100 : 0;

  const kpis: Kpi[] = [
    {
      id: "visits",
      label: "Visites",
      value: formatKpiNumber(visits),
      hint: "ce mois",
      tone: "slate",
      ...deltaMeta(visits, prevVisits),
    },
    {
      id: "quotes",
      label: "Devis",
      value: formatKpiNumber(submitted),
      hint: submitted ? "reçus" : "en attente du premier",
      tone: "orange",
      ...deltaMeta(submitted, prevSubmitted),
    },
    {
      id: "conversion",
      label: "Conversion",
      value: `${Math.round(conversion)}%`,
      hint: visits ? `${submitted} / ${visits}` : "-",
      tone: "orange",
      ...deltaMeta(conversion, prevConversion),
    },
    {
      id: "volume",
      label: "CA",
      value: formatKpiEur(volume),
      hint: submitted ? "demandes du mois" : "-",
      tone: "sky",
      ...deltaMeta(volume, prevVolume),
    },
  ];

  const months: MonthPoint[] = [];
  for (let i = 5; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    months.push({
      key,
      label: MONTH_LABELS[d.getMonth()] ?? key,
      quotes: list.filter((quote) => monthKey(quote.created_at) === key).length,
      won: list.filter((quote) => monthKey(quote.created_at) === key && slugOf(quote) === "won").length,
      abandons: (sessions ?? []).filter((session) => monthKey(session.created_at) === key && !session.submitted_quote_id)
        .length,
    });
  }

  return { kpis, months };
}

export async function loadHomeDashboard(
  supabase: SupabaseClient<Database>,
  orgId: string,
  orgSlug: string,
  modules: HomeModuleId[],
): Promise<HomeDashboard> {
  const need = new Set(modules);
  const empty: HomeDashboard = {
    modules,
    quotes: [],
    extras: new Map(),
    statuses: [],
    abandons: null,
    stats: null,
    campaigns: [],
    workflows: [],
    segments: [],
    members: [],
    unassigned: 0,
    funnels: [],
    orgSlug,
  };

  const [quotes, statusesRes, abandons, stats, campaignsRes, workflowsRes, runsRes, segmentsRes, membersRes, assigneesRes, funnelsRes] =
    await Promise.all([
      need.has("quotes") ? listQuotes(supabase, orgId, { limit: 4 }) : Promise.resolve([]),
      need.has("quotes")
        ? supabase.from("quote_statuses").select("id, label, slug").eq("organization_id", orgId)
        : Promise.resolve({ data: [] as { id: string; label: string; slug: string }[] }),
      need.has("abandons") ? loadAbandonSnapshot(supabase, orgId) : Promise.resolve(null),
      loadHomeStats(supabase, orgId),
      need.has("emails")
        ? supabase
            .from("email_campaigns")
            .select("id, name, status, sent_count, send_mode")
            .eq("organization_id", orgId)
            .order("created_at", { ascending: false })
            .limit(4)
        : Promise.resolve({ data: [] as HomeCampaign[] }),
      need.has("automations")
        ? supabase
            .from("workflows")
            .select("id, name, status, trigger_type")
            .eq("organization_id", orgId)
            .neq("status", "archived")
            .order("created_at", { ascending: false })
            .limit(4)
        : Promise.resolve({ data: [] as { id: string; name: string; status: string; trigger_type: string }[] }),
      need.has("automations")
        ? supabase.from("workflow_runs").select("workflow_id, status").eq("organization_id", orgId).limit(400)
        : Promise.resolve({ data: [] as { workflow_id: string; status: string }[] }),
      need.has("segments")
        ? supabase
            .from("contact_segments")
            .select("id, name, rules")
            .eq("organization_id", orgId)
            .order("created_at", { ascending: false })
            .limit(4)
        : Promise.resolve({ data: [] as { id: string; name: string; rules: Json }[] }),
      need.has("team")
        ? supabase.from("memberships").select("id, invited_email, role, status").eq("organization_id", orgId)
        : Promise.resolve({ data: [] as { id: string; invited_email: string | null; role: string; status: string }[] }),
      need.has("team")
        ? supabase.from("quotes").select("id, assigned_to, status").eq("organization_id", orgId).in("status", ["new", "contacted", "in_progress", "waiting"])
        : Promise.resolve({ data: [] as { id: string; assigned_to: string | null; status: string }[] }),
      need.has("funnels")
        ? supabase
            .from("configurators")
            .select("id, name, slug, is_active")
            .eq("organization_id", orgId)
            .order("created_at", { ascending: false })
            .limit(4)
        : Promise.resolve({ data: [] as HomeFunnel[] }),
    ]);

  const statuses = statusesRes.data ?? [];
  const extras = quotes.length ? await loadQuoteListExtras(supabase, quotes) : new Map();

  const runTally = new Map<string, { running: number; waiting: number; failed: number }>();
  for (const run of runsRes.data ?? []) {
    const current = runTally.get(run.workflow_id) ?? { running: 0, waiting: 0, failed: 0 };
    if (run.status === "running") current.running += 1;
    if (run.status === "waiting") current.waiting += 1;
    if (run.status === "failed") current.failed += 1;
    runTally.set(run.workflow_id, current);
  }

  let segments: HomeSegment[] = [];
  if (need.has("segments") && (segmentsRes.data ?? []).length) {
    const contacts = await loadSegmentContacts(supabase, orgId, 300);
    segments = (segmentsRes.data ?? []).map((segment) => ({
      id: segment.id,
      name: segment.name,
      count: contacts.filter((contact) => matchSegment(parseSegmentRules(segment.rules), contact)).length,
    }));
  }

  const assignedIds = new Set<string>();
  if (need.has("team") && (assigneesRes.data ?? []).length) {
    const { data: assigneeRows } = await supabase
      .from("quote_assignees")
      .select("quote_id")
      .eq("organization_id", orgId)
      .in(
        "quote_id",
        (assigneesRes.data ?? []).map((row) => row.id),
      );
    for (const row of assigneeRows ?? []) assignedIds.add(row.quote_id);
  }

  const unassigned = (assigneesRes.data ?? []).filter(
    (row) => !row.assigned_to && !assignedIds.has(row.id),
  ).length;

  return {
    ...empty,
    quotes,
    extras,
    statuses,
    newStatusId: statuses.find((s) => s.slug === "new")?.id,
    abandons,
    stats,
    campaigns: campaignsRes.data ?? [],
    workflows: (workflowsRes.data ?? []).map((workflow) => ({
      ...workflow,
      ...(runTally.get(workflow.id) ?? { running: 0, waiting: 0, failed: 0 }),
    })),
    segments,
    members: (membersRes.data ?? []).map((m) => ({
      id: m.id,
      label: m.invited_email || m.role,
      role: m.role,
      status: m.status,
    })),
    unassigned,
    funnels: funnelsRes.data ?? [],
  };
}
