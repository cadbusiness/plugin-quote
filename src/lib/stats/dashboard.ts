import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/lib/db/database.types";
import { classifySource } from "@/lib/stats/attribution";
import { ANALYTICS_EVENTS } from "@/lib/stats/events";
import { campaignKey, campaignsMatch, closedLoop, microsToEur } from "@/lib/ads/roi";

export type StatsRange = "day" | "week" | "month";

export type BubbleTone = "orange" | "emerald" | "amber" | "rose" | "sky" | "violet" | "slate";

export type FunnelStep = {
  key: string;
  label: string;
  help: string;
  count: number;
  rateFromPrevious: number | null;
  tone: BubbleTone;
};

export type SourceRow = {
  source: string;
  quotes: number;
  visitors: number;
  conversion: number | null;
  pipeline: number;
};

export type PipelineRow = {
  slug: string;
  label: string;
  quotes: number;
  value: number;
  tone: BubbleTone;
};

export type MonthPoint = {
  key: string;
  label: string;
  quotes: number;
  won: number;
  abandons: number;
};

export type KpiId = "visits" | "quotes" | "conversion" | "volume" | "contact";

export type Kpi = {
  id: KpiId;
  label: string;
  value: string;
  hint: string;
  deltaLabel: string;
  deltaTone: "good" | "bad" | "muted";
  tone: BubbleTone;
};

export const HOME_PULSE_IDS: KpiId[] = ["visits", "quotes", "conversion", "volume"];

export const KPI_HREF: Record<KpiId, string> = {
  visits: "/stats",
  quotes: "/devis",
  conversion: "/stats",
  volume: "/stats?tab=pipeline",
  contact: "/devis",
};

export type StatsStory = {
  headline: string;
  detail: string;
  actionHref?: string;
  actionLabel?: string;
};

export type StatsPulse = {
  visitors: number;
  emails: number;
  submitted: number;
  contacted: number;
  won: number;
  waiting: number;
  contactRate: number;
  winRate: number;
  conversion: number;
  pipeline: number;
  delayLabel: string;
  delayHours: number | null;
};

export type FunnelStatsRow = {
  id: string;
  name: string;
  slug: string;
  sector: string;
  visitors: number;
  quotes: number;
  conversion: number | null;
  contacted: number;
  won: number;
  pipeline: number;
  wonValue: number;
  costPerQuote: number | null;
  costPerWon: number | null;
  spend: number;
};

export type CampaignStatsRow = {
  campaign: string;
  source: string;
  funnelId: string | null;
  funnelName: string | null;
  visitors: number;
  quotes: number;
  conversion: number | null;
  contacted: number;
  won: number;
  pipeline: number;
  wonValue: number;
  spend: number;
  costPerQuote: number | null;
  costPerWon: number | null;
};

export type AdsSnapshot = {
  connected: boolean;
  customerName: string | null;
  status: string | null;
  lastSyncAt: string | null;
  spend: number;
  clicks: number;
  impressions: number;
};

export type StatsDashboard = {
  range: StatsRange;
  funnelId: string | null;
  story: StatsStory;
  kpis: Kpi[];
  pulse: StatsPulse;
  funnel: FunnelStep[];
  funnels: FunnelStatsRow[];
  campaigns: CampaignStatsRow[];
  ads: AdsSnapshot;
  sources: SourceRow[];
  pipeline: PipelineRow[];
  pipelineTotal: number;
  wonValue: number;
  wonCount: number;
  abandons: {
    total: number;
    withEmail: number;
    recoverable: number;
  };
  months: MonthPoint[];
};

const RANGE_DAYS: Record<StatsRange, number> = { day: 1, week: 7, month: 30 };
const OPEN_SLUGS = new Set(["new", "contacted", "in_progress", "waiting"]);
const CONTACTED_SLUGS = new Set(["contacted", "in_progress", "won", "waiting"]);

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function monthKey(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

const MONTH_LABELS = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];

function monthLabel(key: string) {
  const month = Number(key.split("-")[1] ?? "1");
  return MONTH_LABELS[(month - 1 + 12) % 12] ?? key;
}

function people(n: number, one: string, many: string) {
  return `${n} ${n > 1 ? many : one}`;
}

function buildStory(input: {
  submitted: number;
  contacted: number;
  won: number;
  abandons: number;
  abandonsWithEmail: number;
  recoverable: number;
  pipelineTotal: number;
}): StatsStory {
  const waiting = Math.max(0, input.submitted - input.contacted);
  if (input.submitted === 0 && input.abandons === 0) {
    return {
      headline: "Encore aucun devis demandé.",
      detail: "Partagez le lien du funnel. Dès qu’un prospect clique, le tableau de bord s’allume.",
    };
  }
  if (input.abandonsWithEmail > 0) {
    return {
      headline: `${people(input.abandonsWithEmail, "personne à rappeler", "personnes à rappeler")}, elles ont laissé leur email.`,
      detail:
        input.recoverable > 0
          ? `${formatKpiEur(input.recoverable)} récupérables.`
          : "Parcours commencé puis abandonné.",
      actionHref: "/sessions",
      actionLabel: "Relancer",
    };
  }
  if (waiting > 0) {
    return {
      headline: `${people(waiting, "demande sans rappel", "demandes sans rappel")}.`,
      detail:
        input.won > 0
          ? `${people(input.won, "signée", "signées")} · ${people(input.contacted, "déjà rappelée", "déjà rappelées")}.`
          : `${people(input.contacted, "déjà rappelée", "déjà rappelées")}.`,
      actionHref: "/devis",
      actionLabel: "Voir les demandes",
    };
  }
  if (input.won === 0 && input.submitted > 0) {
    return {
      headline: `${people(input.submitted, "demande reçue", "demandes reçues")}, aucune encore signée.`,
      detail:
        input.pipelineTotal > 0
          ? `${formatKpiEur(input.pipelineTotal)} attendent dans le pipeline.`
          : "Tout le monde a été rappelé. Il reste à transformer.",
    };
  }
  return {
    headline: `${people(input.submitted, "demande ce mois", "demandes ce mois")} · ${people(input.won, "signée", "signées")}.`,
    detail:
      input.pipelineTotal > 0
        ? `${formatKpiEur(input.pipelineTotal)} en pipeline.`
        : "Délai de réponse à maintenir court.",
  };
}

export function deltaMeta(current: number, previous: number, invert = false): Pick<Kpi, "deltaLabel" | "deltaTone"> {
  const pct = deltaPct(current, previous);
  if (pct == null) return { deltaLabel: "vs période préc.", deltaTone: "muted" };
  const rounded = Math.abs(Math.round(pct));
  const arrow = pct > 0 ? "+" : pct < 0 ? "−" : "=";
  const good = invert ? pct <= 0 : pct >= 0;
  return {
    deltaLabel: `${arrow}${rounded}% vs préc.`,
    deltaTone: pct === 0 ? "muted" : good ? "good" : "bad",
  };
}

function draftEmail(draft: Json) {
  if (!draft || typeof draft !== "object" || Array.isArray(draft)) return "";
  const email = (draft as { email?: unknown }).email;
  return typeof email === "string" ? email.trim() : "";
}

function hasAnswers(answers: Json) {
  return Boolean(answers && typeof answers === "object" && !Array.isArray(answers) && Object.keys(answers).length);
}

function hasChat(messages: Json) {
  return Array.isArray(messages) && messages.length > 0;
}

function itemValue(priceMin: number | null, priceMax: number | null, quantity: number) {
  const unit =
    priceMin != null && priceMax != null
      ? (priceMin + priceMax) / 2
      : (priceMin ?? priceMax);
  if (unit == null) return 0;
  return unit * (quantity || 1);
}

function rate(part: number, total: number) {
  if (!total) return null;
  return (part / total) * 100;
}

function deltaPct(current: number, previous: number) {
  if (previous === 0) return current === 0 ? 0 : null;
  return ((current - previous) / previous) * 100;
}

export function formatKpiNumber(n: number) {
  return new Intl.NumberFormat("fr-FR").format(n);
}

export function formatKpiEur(n: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);
}

function formatKpiHours(hours: number | null) {
  if (hours == null) return "-";
  if (hours < 1) return `${Math.max(1, Math.round(hours * 60))} min`;
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (m === 0) return `${h}h`;
  return `${h}h${String(m).padStart(2, "0")}`;
}

export function resolveRange(value: string | undefined): StatsRange {
  if (value === "day" || value === "week" || value === "month") return value;
  return "month";
}

export async function loadStatsDashboard(
  supabase: SupabaseClient<Database>,
  orgId: string,
  range: StatsRange,
  funnelId?: string | null,
): Promise<StatsDashboard> {
  const days = RANGE_DAYS[range];
  const now = new Date();
  const periodStart = new Date(now.getTime() - days * 86400000);
  const prevStart = new Date(periodStart.getTime() - days * 86400000);
  const sixMonths = startOfDay(new Date(now.getFullYear(), now.getMonth() - 5, 1));
  const scopedFunnel = funnelId?.trim() || null;

  const [
    { data: quotes },
    { data: statuses },
    { data: events },
    { data: sessions },
    { data: items },
    { data: steps },
    { data: products },
    { data: activities },
    { data: configurators },
    { data: adsConnection },
    { data: adsDays },
  ] = await Promise.all([
    supabase
      .from("quotes")
      .select(
        "id, status_id, status, score_label, created_at, session_id, configurator_id, utm_source, utm_medium, utm_campaign, utm_term, referrer, gclid, gbraid, wbraid",
      )
      .eq("organization_id", orgId)
      .gte("created_at", sixMonths.toISOString()),
    supabase.from("quote_statuses").select("id, label, slug, position").eq("organization_id", orgId),
    supabase
      .from("analytics_events")
      .select("event_type, session_id, visitor_id, created_at, payload, configurator_id")
      .eq("organization_id", orgId)
      .gte("created_at", sixMonths.toISOString()),
    supabase
      .from("quote_sessions")
      .select(
        "id, created_at, current_step, contact_draft, submitted_quote_id, answers, chat_messages, utm_source, utm_medium, utm_campaign, referrer, last_activity_at, configurator_id, visitor_id, gclid, gbraid, wbraid",
      )
      .eq("organization_id", orgId)
      .gte("created_at", sixMonths.toISOString()),
    supabase
      .from("quote_items")
      .select("quote_id, price_min, price_max, quantity")
      .eq("organization_id", orgId),
    supabase
      .from("wizard_steps")
      .select("configurator_id, screen_type, sort_order, title")
      .eq("organization_id", orgId),
    supabase
      .from("products")
      .select("price_min, price_max")
      .eq("organization_id", orgId)
      .eq("is_active", true),
    supabase
      .from("quote_activities")
      .select("quote_id, created_at, payload, type")
      .eq("organization_id", orgId)
      .eq("type", "status_changed")
      .gte("created_at", sixMonths.toISOString()),
    supabase
      .from("configurators")
      .select("id, name, slug, sector")
      .eq("organization_id", orgId)
      .order("created_at", { ascending: false }),
    supabase
      .from("ads_connections")
      .select("id, status, customer_name, last_sync_at")
      .eq("organization_id", orgId)
      .eq("provider", "google_ads")
      .maybeSingle(),
    supabase
      .from("ads_campaign_stats")
      .select("campaign_id, campaign_name, date, impressions, clicks, cost_micros")
      .eq("organization_id", orgId)
      .gte("date", periodStart.toISOString().slice(0, 10)),
  ]);

  const statusById = new Map((statuses ?? []).map((s) => [s.id, s]));
  const statusBySlug = new Map((statuses ?? []).map((s) => [s.slug, s]));
  const quoteValue = new Map<string, number>();
  for (const item of items ?? []) {
    quoteValue.set(
      item.quote_id,
      (quoteValue.get(item.quote_id) ?? 0) + itemValue(item.price_min, item.price_max, item.quantity),
    );
  }
  const priced = [...quoteValue.values()].filter((v) => v > 0);
  const catalog = (products ?? [])
    .map((p) => itemValue(p.price_min, p.price_max, 1))
    .filter((v) => v > 0);
  const avgDeal = priced.length
    ? priced.reduce((a, b) => a + b, 0) / priced.length
    : catalog.length
      ? catalog.reduce((a, b) => a + b, 0) / catalog.length
      : 0;
  const valueOf = (quoteId: string) => {
    const exact = quoteValue.get(quoteId);
    return exact && exact > 0 ? exact : avgDeal;
  };

  const contactIndex = new Map<string, number>();
  for (const step of steps ?? []) {
    if (step.screen_type !== "contact") continue;
    const current = contactIndex.get(step.configurator_id);
    if (current == null || step.sort_order < current) {
      contactIndex.set(step.configurator_id, step.sort_order);
    }
  }

  function slugOf(quote: { status_id: string | null; status: string }) {
    return (quote.status_id && statusById.get(quote.status_id)?.slug) || quote.status;
  }

  const inWindow = (iso: string, from: Date, to: Date) => {
    const t = new Date(iso).getTime();
    return t >= from.getTime() && t < to.getTime();
  };

  function funnelCounts(from: Date, to: Date) {
    const periodEvents = (events ?? []).filter(
      (e) => inWindow(e.created_at, from, to) && (!scopedFunnel || e.configurator_id === scopedFunnel),
    );
    const periodSessions = (sessions ?? []).filter(
      (s) => inWindow(s.created_at, from, to) && (!scopedFunnel || s.configurator_id === scopedFunnel),
    );
    const periodQuotes = (quotes ?? []).filter(
      (q) => inWindow(q.created_at, from, to) && (!scopedFunnel || q.configurator_id === scopedFunnel),
    );

    const eventVisitors = new Set(
      periodEvents
        .filter((e) => e.event_type === ANALYTICS_EVENTS.pageView && e.visitor_id)
        .map((e) => e.visitor_id as string),
    );
    const extraSessions = periodSessions.filter(
      (s) => !s.visitor_id || !eventVisitors.has(s.visitor_id),
    ).length;
    const visitors = eventVisitors.size + extraSessions || periodSessions.length;

    const openedIds = new Set<string>();
    for (const session of periodSessions) {
      if (
        session.current_step > 0 ||
        session.submitted_quote_id ||
        hasAnswers(session.answers) ||
        hasChat(session.chat_messages)
      ) {
        openedIds.add(session.id);
      }
    }
    for (const event of periodEvents) {
      if (
        event.session_id &&
        (event.event_type.startsWith("quotebuilder_step_") || event.event_type === ANALYTICS_EVENTS.started)
      ) {
        const session = periodSessions.find((s) => s.id === event.session_id);
        if (session && (session.current_step > 0 || event.event_type.startsWith("quotebuilder_step_"))) {
          openedIds.add(event.session_id);
        }
      }
    }

    const emailIds = new Set<string>();
    for (const session of periodSessions) {
      if (draftEmail(session.contact_draft) || session.submitted_quote_id) emailIds.add(session.id);
    }
    for (const event of periodEvents) {
      if (event.event_type === ANALYTICS_EVENTS.email && event.session_id) emailIds.add(event.session_id);
    }
    for (const quote of periodQuotes) {
      if (quote.session_id) emailIds.add(quote.session_id);
    }

    const completedIds = new Set<string>();
    for (const session of periodSessions) {
      const contactAt = contactIndex.get(session.configurator_id);
      if (session.submitted_quote_id || (contactAt != null && session.current_step >= contactAt)) {
        completedIds.add(session.id);
      }
    }
    for (const event of periodEvents) {
      if (event.event_type === ANALYTICS_EVENTS.completed && event.session_id) {
        completedIds.add(event.session_id);
      }
    }
    for (const quote of periodQuotes) {
      if (quote.session_id) completedIds.add(quote.session_id);
    }

    const submitted = periodQuotes.length;
    const contacted = periodQuotes.filter((q) => CONTACTED_SLUGS.has(slugOf(q))).length;
    const won = periodQuotes.filter((q) => slugOf(q) === "won").length;
    const openedRaw = openedIds.size || periodEvents.filter((e) => e.event_type === ANALYTICS_EVENTS.started).length;
    const emails = Math.max(emailIds.size, completedIds.size, submitted);
    const completed = Math.max(completedIds.size, submitted);
    const opened = Math.max(openedRaw, emails);

    return {
      visitors: Math.max(visitors, opened),
      opened,
      emails,
      completed,
      submitted,
      contacted,
      won,
      quotes: periodQuotes,
      sessions: periodSessions,
      events: periodEvents,
    };
  }

  const current = funnelCounts(periodStart, now);
  const previous = funnelCounts(prevStart, periodStart);

  const currentValue = current.quotes.reduce((sum, q) => sum + valueOf(q.id), 0);
  const previousValue = previous.quotes.reduce((sum, q) => sum + valueOf(q.id), 0);

  const firstChangeHours: number[] = [];
  const prevFirstChangeHours: number[] = [];
  const quoteCreated = new Map((quotes ?? []).map((q) => [q.id, q.created_at]));
  const seenQuote = new Set<string>();
  const prevSeenQuote = new Set<string>();
  for (const activity of activities ?? []) {
    const created = quoteCreated.get(activity.quote_id);
    if (!created) continue;
    const hours = (new Date(activity.created_at).getTime() - new Date(created).getTime()) / 3600000;
    if (inWindow(created, periodStart, now) && !seenQuote.has(activity.quote_id)) {
      seenQuote.add(activity.quote_id);
      firstChangeHours.push(hours);
    }
    if (inWindow(created, prevStart, periodStart) && !prevSeenQuote.has(activity.quote_id)) {
      prevSeenQuote.add(activity.quote_id);
      prevFirstChangeHours.push(hours);
    }
  }
  const avgDelay = firstChangeHours.length
    ? firstChangeHours.reduce((a, b) => a + b, 0) / firstChangeHours.length
    : null;

  const abandonedNow = current.sessions.filter((s) => !s.submitted_quote_id);
  const abandonedEmail = abandonedNow.filter((s) => draftEmail(s.contact_draft));
  const contactRate = rate(current.contacted, current.submitted) ?? 0;
  const prevContactRate = rate(previous.contacted, previous.submitted) ?? 0;

  const conversion = rate(current.submitted, current.visitors) ?? 0;
  const prevConversion = rate(previous.submitted, previous.visitors) ?? 0;

  const kpis: Kpi[] = [
    {
      id: "visits",
      label: "Visites",
      value: formatKpiNumber(current.visitors),
      hint: "funnel ouvert",
      tone: "slate",
      ...deltaMeta(current.visitors, previous.visitors),
    },
    {
      id: "quotes",
      label: "Devis",
      value: formatKpiNumber(current.submitted),
      hint: current.submitted ? "reçus" : "en attente du premier",
      tone: "orange",
      ...deltaMeta(current.submitted, previous.submitted),
    },
    {
      id: "conversion",
      label: "Conversion",
      value: `${Math.round(conversion)}%`,
      hint: current.visitors ? `${current.submitted} / ${current.visitors}` : "-",
      tone: "orange",
      ...deltaMeta(conversion, prevConversion),
    },
    {
      id: "volume",
      label: "CA",
      value: formatKpiEur(currentValue),
      hint:
        current.submitted && currentValue > 0
          ? `${current.submitted} × ${formatKpiEur(currentValue / current.submitted)}`
          : current.submitted
            ? "ajoutez des prix au catalogue"
            : "-",
      tone: "sky",
      ...deltaMeta(currentValue, previousValue),
    },
    {
      id: "contact",
      label: "Rappel",
      value: `${Math.round(contactRate)}%`,
      hint: current.submitted ? `${current.contacted} sur ${current.submitted}` : "-",
      tone: "emerald",
      ...deltaMeta(contactRate, prevContactRate),
    },
  ];

  const funnelDefs: Array<Omit<FunnelStep, "rateFromPrevious">> = [
    { key: "visitors", label: "Visiteurs", help: "page ouverte", count: current.visitors, tone: "sky" },
    { key: "opened", label: "Commencé", help: "première réponse", count: current.opened, tone: "violet" },
    { key: "email", label: "Email", help: "coordonnées laissées", count: current.emails, tone: "amber" },
    { key: "completed", label: "Complété", help: "parcours terminé", count: current.completed, tone: "orange" },
    { key: "submitted", label: "Devis", help: "demande soumise", count: current.submitted, tone: "orange" },
    { key: "contacted", label: "Rappelé", help: "statut contacté", count: current.contacted, tone: "emerald" },
    { key: "won", label: "Signé", help: "affaire gagnée", count: current.won, tone: "emerald" },
  ];
  const funnel: FunnelStep[] = funnelDefs.map((step, i) => ({
    ...step,
    rateFromPrevious: i === 0 ? null : rate(step.count, funnelDefs[i - 1]?.count ?? 0),
  }));

  const sourceMap = new Map<string, SourceRow>();
  function sourceBucket(source: string) {
    const row = sourceMap.get(source) ?? { source, quotes: 0, visitors: 0, conversion: null, pipeline: 0 };
    sourceMap.set(source, row);
    return row;
  }
  for (const quote of current.quotes) {
    const session = quote.session_id ? current.sessions.find((s) => s.id === quote.session_id) : undefined;
    const name = classifySource({
      utmSource: quote.utm_source ?? session?.utm_source,
      utmMedium: quote.utm_medium ?? session?.utm_medium,
      referrer: quote.referrer ?? session?.referrer,
    });
    const row = sourceBucket(name);
    row.quotes += 1;
    row.pipeline += valueOf(quote.id);
  }
  const visitorsBySource = new Map<string, Set<string>>();
  for (const event of current.events) {
    if (event.event_type !== ANALYTICS_EVENTS.pageView) continue;
    const payload = (event.payload ?? {}) as { utm_source?: string; utm_medium?: string; referrer?: string };
    const name = classifySource({
      utmSource: payload.utm_source,
      utmMedium: payload.utm_medium,
      referrer: payload.referrer,
    });
    const key = event.visitor_id || event.session_id || `${event.created_at}`;
    const set = visitorsBySource.get(name) ?? new Set<string>();
    set.add(key);
    visitorsBySource.set(name, set);
  }
  for (const [name, set] of visitorsBySource) {
    sourceBucket(name).visitors = set.size;
  }
  if (![...sourceMap.values()].some((s) => s.visitors > 0)) {
    for (const session of current.sessions) {
      const name = classifySource({
        utmSource: session.utm_source,
        utmMedium: session.utm_medium,
        referrer: session.referrer,
      });
      sourceBucket(name).visitors += 1;
    }
  }
  for (const row of sourceMap.values()) {
    if (row.visitors === 0 && row.quotes > 0) row.visitors = row.quotes;
  }
  const sources = [...sourceMap.values()]
    .map((row) => ({
      ...row,
      conversion: rate(row.quotes, row.visitors),
    }))
    .sort((a, b) => b.pipeline - a.pipeline || b.quotes - a.quotes);

  const pipelineOrder = ["new", "contacted", "in_progress", "waiting"];
  const openQuotes = (quotes ?? []).filter(
    (q) => OPEN_SLUGS.has(slugOf(q)) && (!scopedFunnel || q.configurator_id === scopedFunnel),
  );
  const pipeline: PipelineRow[] = pipelineOrder
    .filter((slug) => statusBySlug.has(slug) || openQuotes.some((q) => slugOf(q) === slug))
    .map((slug) => {
      const list = openQuotes.filter((q) => slugOf(q) === slug);
      return {
        slug,
        label: statusBySlug.get(slug)?.label ?? slug,
        quotes: list.length,
        value: list.reduce((sum, q) => sum + valueOf(q.id), 0),
        tone: (slug === "new" ? "sky" : slug === "contacted" ? "amber" : slug === "in_progress" ? "violet" : "slate") as BubbleTone,
      };
    })
    .filter((row) => row.quotes > 0 || pipelineOrder.slice(0, 3).includes(row.slug));

  const wonThisMonth = (quotes ?? []).filter((q) => {
    if (slugOf(q) !== "won") return false;
    if (scopedFunnel && q.configurator_id !== scopedFunnel) return false;
    const d = new Date(q.created_at);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  });

  const months: MonthPoint[] = [];
  for (let i = 5; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    months.push({
      key,
      label: monthLabel(key),
      quotes: (quotes ?? []).filter(
        (q) => monthKey(q.created_at) === key && (!scopedFunnel || q.configurator_id === scopedFunnel),
      ).length,
      won: (quotes ?? []).filter(
        (q) =>
          monthKey(q.created_at) === key &&
          slugOf(q) === "won" &&
          (!scopedFunnel || q.configurator_id === scopedFunnel),
      ).length,
      abandons: (sessions ?? []).filter(
        (s) =>
          monthKey(s.created_at) === key &&
          !s.submitted_quote_id &&
          (!scopedFunnel || s.configurator_id === scopedFunnel),
      ).length,
    });
  }

  const pipelineTotal = pipeline.reduce((sum, row) => sum + row.value, 0);
  const wonValue = wonThisMonth.reduce((sum, q) => sum + valueOf(q.id), 0);
  const recoverable = abandonedEmail.length * (avgDeal || 0);

  const adsSpendByKey = new Map<string, { spend: number; clicks: number; impressions: number; name: string; id: string }>();
  for (const row of adsDays ?? []) {
    const key = campaignKey(row.campaign_name) || campaignKey(row.campaign_id);
    const currentRow = adsSpendByKey.get(key) ?? {
      spend: 0,
      clicks: 0,
      impressions: 0,
      name: row.campaign_name,
      id: row.campaign_id,
    };
    currentRow.spend += microsToEur(row.cost_micros);
    currentRow.clicks += row.clicks;
    currentRow.impressions += row.impressions;
    adsSpendByKey.set(key, currentRow);
  }
  const adsList = [...adsSpendByKey.values()];
  function spendForCampaign(name: string | null | undefined) {
    if (!name) return 0;
    const hit = adsList.find((row) => campaignsMatch(name, row.name, row.id));
    return hit?.spend ?? 0;
  }

  const funnelNameById = new Map((configurators ?? []).map((row) => [row.id, row]));
  const funnelRows: FunnelStatsRow[] = (configurators ?? []).map((cfg) => {
      const funnelQuotes = current.quotes.filter((q) => q.configurator_id === cfg.id);
      const funnelSessions = current.sessions.filter((s) => s.configurator_id === cfg.id);
      const funnelEvents = current.events.filter((e) => e.configurator_id === cfg.id);
      const visitors = (() => {
        const ids = new Set(
          funnelEvents
            .filter((e) => e.event_type === ANALYTICS_EVENTS.pageView && e.visitor_id)
            .map((e) => e.visitor_id as string),
        );
        const extra = funnelSessions.filter((s) => !s.visitor_id || !ids.has(s.visitor_id)).length;
        return Math.max(ids.size + extra, funnelSessions.length, funnelQuotes.length);
      })();
      const contacted = funnelQuotes.filter((q) => CONTACTED_SLUGS.has(slugOf(q))).length;
      const won = funnelQuotes.filter((q) => slugOf(q) === "won").length;
      const pipeline = funnelQuotes.reduce((sum, q) => sum + valueOf(q.id), 0);
      const wonValue = funnelQuotes.filter((q) => slugOf(q) === "won").reduce((sum, q) => sum + valueOf(q.id), 0);
      const spend = funnelQuotes.reduce((sum, q) => {
        if (classifySource({ utmSource: q.utm_source, utmMedium: q.utm_medium, referrer: q.referrer, gclid: q.gclid }) !== "Google Ads") {
          return sum;
        }
        return sum + spendForCampaign(q.utm_campaign) / Math.max(1, current.quotes.filter((other) => other.utm_campaign === q.utm_campaign).length);
      }, 0);
      const loop = closedLoop({
        visitors,
        quotes: funnelQuotes.length,
        contacted,
        won,
        pipeline,
        wonValue,
        spend,
      });
      return {
        id: cfg.id,
        name: cfg.name,
        slug: cfg.slug,
        sector: cfg.sector,
        visitors: loop.visitors,
        quotes: loop.quotes,
        conversion: loop.conversion,
        contacted: loop.contacted,
        won: loop.won,
        pipeline: loop.pipeline,
        wonValue: loop.wonValue,
        costPerQuote: loop.costPerQuote,
        costPerWon: loop.costPerWon,
        spend: loop.spend,
      };
    })
    .sort((a, b) => b.quotes - a.quotes || b.visitors - a.visitors);

  type CampaignBucket = {
    campaign: string;
    source: string;
    funnelId: string | null;
    visitors: Set<string>;
    quotes: typeof current.quotes;
  };
  const campaignMap = new Map<string, CampaignBucket>();
  function campaignBucket(campaign: string, source: string, funnelId: string | null) {
    const key = `${campaignKey(campaign) || "(none)"}|${source}`;
    const row =
      campaignMap.get(key) ??
      { campaign: campaign || "Sans nom", source, funnelId, visitors: new Set<string>(), quotes: [] };
    if (!row.funnelId && funnelId) row.funnelId = funnelId;
    campaignMap.set(key, row);
    return row;
  }
  for (const quote of current.quotes) {
    const session = quote.session_id ? current.sessions.find((s) => s.id === quote.session_id) : undefined;
    const source = classifySource({
      utmSource: quote.utm_source ?? session?.utm_source,
      utmMedium: quote.utm_medium ?? session?.utm_medium,
      referrer: quote.referrer ?? session?.referrer,
      gclid: quote.gclid ?? session?.gclid,
    });
    const campaign = quote.utm_campaign ?? session?.utm_campaign ?? "";
    const row = campaignBucket(campaign, source, quote.configurator_id);
    row.quotes.push(quote);
  }
  for (const event of current.events) {
    if (event.event_type !== ANALYTICS_EVENTS.pageView) continue;
    const payload = (event.payload ?? {}) as {
      utm_source?: string;
      utm_medium?: string;
      utm_campaign?: string;
      referrer?: string;
      gclid?: string;
    };
    const source = classifySource({
      utmSource: payload.utm_source,
      utmMedium: payload.utm_medium,
      referrer: payload.referrer,
      gclid: payload.gclid,
    });
    const row = campaignBucket(payload.utm_campaign ?? "", source, event.configurator_id);
    row.visitors.add(event.visitor_id || event.session_id || event.created_at);
  }
  for (const session of current.sessions) {
    const source = classifySource({
      utmSource: session.utm_source,
      utmMedium: session.utm_medium,
      referrer: session.referrer,
      gclid: session.gclid,
    });
    const row = campaignBucket(session.utm_campaign ?? "", source, session.configurator_id);
    if (row.visitors.size === 0) row.visitors.add(session.id);
  }
  const campaignRows: CampaignStatsRow[] = [...campaignMap.values()]
    .map((bucket) => {
      const contacted = bucket.quotes.filter((q) => CONTACTED_SLUGS.has(slugOf(q))).length;
      const won = bucket.quotes.filter((q) => slugOf(q) === "won").length;
      const pipeline = bucket.quotes.reduce((sum, q) => sum + valueOf(q.id), 0);
      const wonValue = bucket.quotes.filter((q) => slugOf(q) === "won").reduce((sum, q) => sum + valueOf(q.id), 0);
      const spend = bucket.source === "Google Ads" ? spendForCampaign(bucket.campaign) : 0;
      const visitors = Math.max(bucket.visitors.size, bucket.quotes.length);
      const loop = closedLoop({
        visitors,
        quotes: bucket.quotes.length,
        contacted,
        won,
        pipeline,
        wonValue,
        spend,
      });
      return {
        campaign: bucket.campaign || "Sans nom",
        source: bucket.source,
        funnelId: bucket.funnelId,
        funnelName: bucket.funnelId ? (funnelNameById.get(bucket.funnelId)?.name ?? null) : null,
        visitors: loop.visitors,
        quotes: loop.quotes,
        conversion: loop.conversion,
        contacted: loop.contacted,
        won: loop.won,
        pipeline: loop.pipeline,
        wonValue: loop.wonValue,
        spend: loop.spend,
        costPerQuote: loop.costPerQuote,
        costPerWon: loop.costPerWon,
      };
    })
    .sort((a, b) => b.quotes - a.quotes || b.spend - a.spend);

  const ads: AdsSnapshot = {
    connected: Boolean(adsConnection && (adsConnection.status === "active" || adsConnection.customer_name)),
    customerName: adsConnection?.customer_name ?? null,
    status: adsConnection?.status ?? null,
    lastSyncAt: adsConnection?.last_sync_at ?? null,
    spend: adsList.reduce((sum, row) => sum + row.spend, 0),
    clicks: adsList.reduce((sum, row) => sum + row.clicks, 0),
    impressions: adsList.reduce((sum, row) => sum + row.impressions, 0),
  };

  return {
    range,
    funnelId: scopedFunnel,
    story: buildStory({
      submitted: current.submitted,
      contacted: current.contacted,
      won: current.won,
      abandons: abandonedNow.length,
      abandonsWithEmail: abandonedEmail.length,
      recoverable,
      pipelineTotal,
    }),
    kpis,
    pulse: {
      visitors: current.visitors,
      emails: current.emails,
      submitted: current.submitted,
      contacted: current.contacted,
      won: current.won,
      waiting: Math.max(0, current.submitted - current.contacted),
      contactRate,
      winRate: rate(current.won, current.submitted) ?? 0,
      conversion: rate(current.submitted, current.visitors) ?? 0,
      pipeline: pipelineTotal,
      delayLabel: formatKpiHours(avgDelay),
      delayHours: avgDelay,
    },
    funnel,
    funnels: funnelRows,
    campaigns: campaignRows,
    ads,
    sources,
    pipeline,
    pipelineTotal,
    wonValue,
    wonCount: wonThisMonth.length,
    abandons: {
      total: abandonedNow.length,
      withEmail: abandonedEmail.length,
      recoverable,
    },
    months,
  };
}
