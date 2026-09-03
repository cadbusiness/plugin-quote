import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/lib/db/database.types";
import { classifySource } from "@/lib/stats/attribution";
import { ANALYTICS_EVENTS } from "@/lib/stats/events";

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

export type Kpi = {
  label: string;
  value: string;
  hint: string;
  deltaLabel: string;
  deltaTone: "good" | "bad" | "muted";
  tone: BubbleTone;
};

export type StatsStory = {
  headline: string;
  detail: string;
  actionHref?: string;
  actionLabel?: string;
};

export type StatsDashboard = {
  range: StatsRange;
  story: StatsStory;
  kpis: Kpi[];
  funnel: FunnelStep[];
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
      headline: `${people(input.abandonsWithEmail, "personne à rappeler", "personnes à rappeler")} — elles ont laissé leur email.`,
      detail:
        input.recoverable > 0
          ? `${formatKpiEur(input.recoverable)} peuvent encore revenir. Un message suffit souvent.`
          : "Elles ont commencé et sont parties. Relancez-les maintenant.",
      actionHref: "/sessions",
      actionLabel: "Relancer",
    };
  }
  if (waiting > 0) {
    return {
      headline: `${people(waiting, "demande encore chaude", "demandes encore chaudes")} — pas encore rappelée${waiting > 1 ? "s" : ""}.`,
      detail:
        input.won > 0
          ? `${people(input.won, "affaire signée", "affaires signées")}. ${people(input.contacted, "déjà rappelée", "déjà rappelées")}.`
          : `${people(input.contacted, "déjà rappelée", "déjà rappelées")}. C’est là que le business se joue.`,
      actionHref: "/devis",
      actionLabel: "Voir les nouvelles",
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
        ? `${formatKpiEur(input.pipelineTotal)} encore en jeu.`
        : "Le rythme est bon. Gardez le délai de réponse court.",
  };
}

function deltaMeta(current: number, previous: number, invert = false): Pick<Kpi, "deltaLabel" | "deltaTone"> {
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

function formatKpiNumber(n: number) {
  return new Intl.NumberFormat("fr-FR").format(n);
}

function formatKpiEur(n: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);
}

function formatKpiHours(hours: number | null) {
  if (hours == null) return "—";
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
): Promise<StatsDashboard> {
  const days = RANGE_DAYS[range];
  const now = new Date();
  const periodStart = new Date(now.getTime() - days * 86400000);
  const prevStart = new Date(periodStart.getTime() - days * 86400000);
  const sixMonths = startOfDay(new Date(now.getFullYear(), now.getMonth() - 5, 1));

  const [
    { data: quotes },
    { data: statuses },
    { data: events },
    { data: sessions },
    { data: items },
    { data: steps },
    { data: products },
    { data: activities },
  ] = await Promise.all([
    supabase
      .from("quotes")
      .select(
        "id, status_id, status, score_label, created_at, session_id, utm_source, utm_medium, referrer",
      )
      .eq("organization_id", orgId)
      .gte("created_at", sixMonths.toISOString()),
    supabase.from("quote_statuses").select("id, label, slug, position").eq("organization_id", orgId),
    supabase
      .from("analytics_events")
      .select("event_type, session_id, visitor_id, created_at, payload")
      .eq("organization_id", orgId)
      .gte("created_at", sixMonths.toISOString()),
    supabase
      .from("quote_sessions")
      .select(
        "id, created_at, current_step, contact_draft, submitted_quote_id, answers, chat_messages, utm_source, utm_medium, referrer, last_activity_at, configurator_id, visitor_id",
      )
      .eq("organization_id", orgId)
      .gte("created_at", sixMonths.toISOString()),
    supabase
      .from("quote_items")
      .select("quote_id, price_min, price_max, quantity")
      .eq("organization_id", orgId),
    supabase
      .from("wizard_steps")
      .select("configurator_id, screen_type, sort_order")
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
    const periodEvents = (events ?? []).filter((e) => inWindow(e.created_at, from, to));
    const periodSessions = (sessions ?? []).filter((s) => inWindow(s.created_at, from, to));
    const periodQuotes = (quotes ?? []).filter((q) => inWindow(q.created_at, from, to));

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
  const prevDelay = prevFirstChangeHours.length
    ? prevFirstChangeHours.reduce((a, b) => a + b, 0) / prevFirstChangeHours.length
    : null;

  const abandonedNow = current.sessions.filter((s) => !s.submitted_quote_id);
  const abandonedEmail = abandonedNow.filter((s) => draftEmail(s.contact_draft));
  const abandonedPrev = previous.sessions.filter((s) => !s.submitted_quote_id);
  const contactRate = rate(current.contacted, current.submitted) ?? 0;
  const prevContactRate = rate(previous.contacted, previous.submitted) ?? 0;

  const kpis: Kpi[] = [
    {
      label: "Devis demandés",
      value: formatKpiNumber(current.submitted),
      hint: current.submitted ? "dossiers reçus" : "en attente du premier",
      tone: "orange",
      ...deltaMeta(current.submitted, previous.submitted),
    },
    {
      label: "Vous avez rappelé",
      value: `${Math.round(contactRate)}%`,
      hint: current.submitted ? `${current.contacted} sur ${current.submitted}` : "rien à rappeler",
      tone: "emerald",
      ...deltaMeta(contactRate, prevContactRate),
    },
    {
      label: "Argent en jeu",
      value: formatKpiEur(currentValue),
      hint:
        current.submitted && currentValue > 0
          ? `${current.submitted} × ${formatKpiEur(currentValue / current.submitted)}`
          : current.submitted
            ? "mettez des prix sur le catalogue"
            : "pas encore de devis",
      tone: "sky",
      ...deltaMeta(currentValue, previousValue),
    },
    {
      label: "Temps pour répondre",
      value: formatKpiHours(avgDelay),
      hint: avgDelay == null ? "pas encore de 1er appel" : avgDelay <= 4 ? "bon rythme" : "un peu long",
      tone: avgDelay != null && avgDelay > 4 ? "amber" : "slate",
      ...(avgDelay != null && prevDelay != null
        ? deltaMeta(avgDelay, prevDelay, true)
        : { deltaLabel: "dès le 1er statut", deltaTone: "muted" as const }),
    },
    {
      label: "Partis en route",
      value: formatKpiNumber(abandonedNow.length),
      hint: abandonedEmail.length ? `${abandonedEmail.length} avec un email` : "sans email — plus durs à rattraper",
      tone: abandonedNow.length ? "rose" : "slate",
      ...deltaMeta(abandonedNow.length, abandonedPrev.length, true),
    },
  ];

  const funnelDefs: Array<Omit<FunnelStep, "rateFromPrevious">> = [
    { key: "visitors", label: "Arrivés", help: "ont ouvert la page", count: current.visitors, tone: "sky" },
    { key: "opened", label: "Ont commencé", help: "première réponse", count: current.opened, tone: "violet" },
    { key: "email", label: "Email laissé", help: "on peut les relancer", count: current.emails, tone: "amber" },
    { key: "completed", label: "Parcours fini", help: "jusqu’au bout", count: current.completed, tone: "orange" },
    { key: "submitted", label: "Devis demandé", help: "dossier reçu", count: current.submitted, tone: "orange" },
    { key: "contacted", label: "Rappelés", help: "vous avez appelé", count: current.contacted, tone: "emerald" },
    { key: "won", label: "Signés", help: "affaire gagnée", count: current.won, tone: "emerald" },
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
  const openQuotes = (quotes ?? []).filter((q) => OPEN_SLUGS.has(slugOf(q)));
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
      quotes: (quotes ?? []).filter((q) => monthKey(q.created_at) === key).length,
      won: (quotes ?? []).filter((q) => monthKey(q.created_at) === key && slugOf(q) === "won").length,
      abandons: (sessions ?? []).filter(
        (s) => monthKey(s.created_at) === key && !s.submitted_quote_id,
      ).length,
    });
  }

  const pipelineTotal = pipeline.reduce((sum, row) => sum + row.value, 0);
  const wonValue = wonThisMonth.reduce((sum, q) => sum + valueOf(q.id), 0);
  const recoverable = abandonedEmail.length * (avgDeal || 0);

  return {
    range,
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
    funnel,
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
