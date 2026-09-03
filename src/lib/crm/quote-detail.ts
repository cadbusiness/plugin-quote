import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json, Tables } from "@/lib/db/database.types";
import { classifySource } from "@/lib/stats/attribution";
import { formatDate, formatHours, formatPrice, formatRelative, formatWhen } from "@/lib/format";
import { scoreReasons } from "@/lib/quotes/score";
import { formatItemOptions, labelAnswers, type LabeledAnswer } from "@/lib/crm/answers";
import { appUrl } from "@/lib/prospect/access";
import type { Answers, QuestionOptions } from "@/lib/wizard/types";

export type QuoteMember = { userId: string; label: string };

export type QuoteFileView = Tables<"quote_files"> & { url: string | null; when: string };

export type QuoteItemView = Tables<"quote_items"> & {
  optionsLabel: string | null;
  productImage: string | null;
  productSku: string | null;
};

export type QuoteActivityView = Tables<"quote_activities"> & {
  label: string;
  detail: string | null;
  when: string;
};

export type QuoteNoteView = Tables<"quote_notes"> & { when: string };

export type QuoteMessageView = Tables<"prospect_messages"> & { when: string };

export type QuoteSibling = {
  id: string;
  current: boolean;
  contactName: string;
  company: string | null;
  score: number | null;
  scoreLabel: string | null;
  statusLabel: string;
  statusSlug: string;
  when: string;
};

export type QuoteAutomation = {
  id: string;
  title: string;
  triggerLabel: string;
  delayLabel: string;
  recipientLabel: string;
  active: boolean;
  state: "sent" | "planned" | "due" | "skipped";
  stateLabel: string;
  when: string | null;
  hint: string;
};

export type QuoteDetail = {
  quote: Tables<"quotes">;
  funnel: { id: string; name: string; slug: string } | null;
  status: Tables<"quote_statuses"> | undefined;
  statuses: Tables<"quote_statuses">[];
  members: QuoteMember[];
  assignedLabel: string | null;
  assignees: QuoteMember[];
  answers: LabeledAnswer[];
  scoreReasons: string[];
  items: QuoteItemView[];
  files: QuoteFileView[];
  notes: QuoteNoteView[];
  messages: QuoteMessageView[];
  activities: QuoteActivityView[];
  siblings: QuoteSibling[];
  automations: QuoteAutomation[];
  source: string;
  suiviUrl: string | null;
  suiviLastAccess: string | null;
  received: { relative: string; exact: string };
  totals: { min: number | null; max: number | null; label: string; count: number };
};

function asAnswers(value: Json): Answers {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Answers;
}

function optionMeta(row: Tables<"wizard_questions">) {
  return {
    key: row.key,
    label: row.label,
    type: row.type,
    options: (row.options ?? {}) as QuestionOptions,
  };
}

function rangeTotal(items: Tables<"quote_items">[]) {
  let min = 0;
  let max = 0;
  let hasMin = false;
  let hasMax = false;
  for (const item of items) {
    const qty = item.quantity || 1;
    if (item.price_min != null) {
      min += item.price_min * qty;
      hasMin = true;
    }
    if (item.price_max != null) {
      max += item.price_max * qty;
      hasMax = true;
    } else if (item.price_min != null) {
      max += item.price_min * qty;
      hasMax = true;
    }
  }
  return {
    min: hasMin ? min : null,
    max: hasMax ? max : null,
    label: formatPrice(hasMin ? min : null, hasMax ? max : null),
    count: items.length,
  };
}

export function activityLabel(type: string) {
  switch (type) {
    case "submitted":
      return "Demande reçue";
    case "status_changed":
      return "Statut modifié";
    case "assigned":
      return "Assignation";
    case "note_added":
      return "Note interne";
    case "email_sent":
      return "Email envoyé";
    case "message_sent":
      return "Email au prospect";
    case "call_logged":
      return "Appel";
    default:
      return type;
  }
}

function activityDetail(type: string, payload: Json, memberLabel: Map<string, string>) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return null;
  const data = payload as Record<string, unknown>;
  if (type === "status_changed") {
    if (typeof data.from === "string" && typeof data.label === "string") return `${data.from} → ${data.label}`;
    if (typeof data.label === "string") return data.label;
  }
  if (type === "assigned") {
    if (Array.isArray(data.labels) && data.labels.every((item) => typeof item === "string")) {
      return data.labels.length ? data.labels.join(", ") : "Personne";
    }
    const id = typeof data.assigned_to === "string" ? data.assigned_to : "";
    return id ? (memberLabel.get(id) ?? "Commercial") : "Non assigné";
  }
  if (type === "call_logged" && typeof data.note === "string" && data.note) return data.note;
  if (type === "email_sent" && typeof data.template_kind === "string") {
    if (data.template_kind === "prospect_confirm") return "Confirmation prospect";
    if (data.template_kind === "sales_brief") return "Brief commercial";
    return String(data.template_kind);
  }
  if (type === "submitted" && typeof data.label === "string") {
    return `Score ${data.score ?? "—"} ${String(data.label).toUpperCase()}`;
  }
  return null;
}

export async function loadQuoteDetail(
  supabase: SupabaseClient<Database>,
  orgId: string,
  quoteId: string,
): Promise<QuoteDetail | null> {
  const { data: quote } = await supabase
    .from("quotes")
    .select("*")
    .eq("id", quoteId)
    .eq("organization_id", orgId)
    .maybeSingle();
  if (!quote) return null;

  const [
    { data: items },
    { data: files },
    { data: statuses },
    { data: members },
    { data: notes },
    { data: activities },
    { data: messages },
    { data: funnel },
    { data: steps },
    { data: questions },
    { data: access },
    { data: siblingRows },
    { data: flows },
  ] = await Promise.all([
    supabase.from("quote_items").select("*").eq("quote_id", quote.id),
    supabase.from("quote_files").select("*").eq("quote_id", quote.id).order("created_at", { ascending: false }),
    supabase.from("quote_statuses").select("*").eq("organization_id", orgId).order("position"),
    supabase.from("memberships").select("*").eq("organization_id", orgId).eq("status", "active"),
    supabase.from("quote_notes").select("*").eq("quote_id", quote.id).order("created_at", { ascending: false }),
    supabase.from("quote_activities").select("*").eq("quote_id", quote.id).order("created_at", { ascending: false }),
    supabase.from("prospect_messages").select("*").eq("quote_id", quote.id).order("sent_at"),
    supabase.from("configurators").select("id, name, slug").eq("id", quote.configurator_id).maybeSingle(),
    supabase.from("wizard_steps").select("id").eq("configurator_id", quote.configurator_id),
    supabase.from("wizard_questions").select("*").eq("organization_id", orgId).order("sort_order"),
    supabase.from("prospect_access").select("token, expires_at, last_accessed").eq("quote_id", quote.id).maybeSingle(),
    supabase
      .from("quotes")
      .select("id, contact_name, contact_company, score, score_label, status_id, status, created_at")
      .eq("organization_id", orgId)
      .eq("contact_email", quote.contact_email)
      .order("created_at", { ascending: false }),
    supabase.from("automation_flows").select("*").eq("organization_id", orgId).order("delay_hours"),
  ]);

  const productIds = [...new Set((items ?? []).map((item) => item.product_id).filter(Boolean))] as string[];
  const { data: products } = productIds.length
    ? await supabase.from("products").select("id, image_url, sku").in("id", productIds)
    : { data: [] };
  const productById = new Map((products ?? []).map((p) => [p.id, p]));

  const filesWithUrls: QuoteFileView[] = await Promise.all(
    (files ?? []).map(async (file) => {
      const { data } = await supabase.storage.from("quote-uploads").createSignedUrl(file.storage_path, 3600);
      return { ...file, url: data?.signedUrl ?? null, when: formatRelative(file.created_at) };
    }),
  );

  const memberList: QuoteMember[] = (members ?? [])
    .filter((m) => m.user_id)
    .map((m) => ({
      userId: m.user_id!,
      label: m.invited_email || (m.role === "owner" ? "Propriétaire" : m.role === "admin" ? "Admin" : "Commercial"),
    }));
  const memberLabel = new Map(memberList.map((m) => [m.userId, m.label]));

  const answers = asAnswers(quote.answers);
  const status = (statuses ?? []).find((s) => s.id === quote.status_id);
  const suiviAlive = access && new Date(access.expires_at).getTime() > Date.now();
  const stepIds = new Set((steps ?? []).map((s) => s.id));
  const { data: assigneeRows } = await supabase
    .from("quote_assignees")
    .select("user_id, created_at")
    .eq("quote_id", quote.id)
    .order("created_at", { ascending: true });
  const assigneeIds = (assigneeRows ?? []).map((row) => row.user_id);
  if (quote.assigned_to && !assigneeIds.includes(quote.assigned_to)) assigneeIds.unshift(quote.assigned_to);
  const assignees: QuoteMember[] = assigneeIds.map((userId) => ({
    userId,
    label: memberLabel.get(userId) ?? "Commercial",
  }));

  return {
    quote,
    funnel: funnel ?? null,
    status,
    statuses: statuses ?? [],
    members: memberList,
    assignedLabel: assignees.length ? assignees.map((row) => row.label).join(", ") : null,
    assignees,
    answers: labelAnswers(
      answers,
      (questions ?? []).filter((q) => stepIds.has(q.step_id)).map(optionMeta),
    ),
    scoreReasons: scoreReasons(answers),
    items: (items ?? []).map((item) => {
      const product = item.product_id ? productById.get(item.product_id) : undefined;
      return {
        ...item,
        optionsLabel: formatItemOptions(item.options),
        productImage: product?.image_url ?? null,
        productSku: product?.sku ?? null,
      };
    }),
    files: filesWithUrls,
    notes: (notes ?? []).map((note) => ({ ...note, when: formatRelative(note.created_at) })),
    messages: (messages ?? []).map((message) => ({ ...message, when: formatRelative(message.sent_at) })),
    activities: (activities ?? []).map((act) => ({
      ...act,
      label: activityLabel(act.type),
      detail: activityDetail(act.type, act.payload, memberLabel),
      when: formatRelative(act.created_at),
    })),
    received: { relative: formatRelative(quote.created_at), exact: formatDate(quote.created_at) },
    source: classifySource({
      utmSource: quote.utm_source,
      utmMedium: quote.utm_medium,
      referrer: quote.referrer,
    }),
    siblings: (siblingRows ?? []).map((row) => {
      const rowStatus = row.status_id ? (statuses ?? []).find((s) => s.id === row.status_id) : undefined;
      return {
        id: row.id,
        current: row.id === quote.id,
        contactName: row.contact_name,
        company: row.contact_company,
        score: row.score,
        scoreLabel: row.score_label,
        statusLabel: rowStatus?.label ?? row.status,
        statusSlug: rowStatus?.slug ?? row.status,
        when: formatRelative(row.created_at),
      };
    }),
    automations: quoteAutomations({
      quote,
      status,
      flows: flows ?? [],
      activities: activities ?? [],
    }),
    suiviUrl: suiviAlive ? `${appUrl()}/suivi/${access.token}` : null,
    suiviLastAccess: access?.last_accessed ? formatRelative(access.last_accessed) : null,
    totals: rangeTotal(items ?? []),
  };
}

const FLOW_TITLES: Record<string, string> = {
  prospect_confirm: "Confirmation prospect",
  sales_brief: "Brief commercial",
  sales_unprocessed: "Rappel interne si non traité",
  prospect_reassure: "Email rassurant",
  prospect_followup: "Relance douce",
  prospect_photo: "Demande de photo",
  session_resume: "Reprise de session",
  session_resume_late: "Seconde relance reprise",
};

const TRIGGER_LABELS: Record<string, string> = {
  submitted: "À la soumission",
  unprocessed: "Si non traité",
  delay: "Après un délai",
  abandoned: "Session abandonnée",
};

const RECIPIENT_LABELS: Record<string, string> = {
  prospect: "Prospect",
  assignee: "Commercial",
};

function quoteAutomations(input: {
  quote: Tables<"quotes">;
  status: Tables<"quote_statuses"> | undefined;
  flows: Tables<"automation_flows">[];
  activities: Tables<"quote_activities">[];
}): QuoteAutomation[] {
  const sentAt = new Map<string, string>();
  for (const act of input.activities) {
    if (act.type !== "email_sent") continue;
    const payload = act.payload && typeof act.payload === "object" && !Array.isArray(act.payload)
      ? (act.payload as { template_kind?: string })
      : {};
    if (payload.template_kind && !sentAt.has(payload.template_kind)) {
      sentAt.set(payload.template_kind, act.created_at);
    }
  }

  const slug = input.status?.slug ?? input.quote.status;
  const closed = Boolean(input.status?.is_closed);
  const created = new Date(input.quote.created_at).getTime();

  return input.flows.map((flow) => {
      const sent = sentAt.get(flow.template_kind);
      const dueAt = new Date(created + flow.delay_hours * 3600_000);
      const overdue = Date.now() >= dueAt.getTime();
      let state: QuoteAutomation["state"] = "planned";
      let hint = `Prévu ${formatWhen(dueAt.toISOString())}`;
      if (sent) {
        state = "sent";
        hint = "Email déjà parti";
      } else if (flow.trigger === "abandoned") {
        state = "skipped";
        hint = "Concerne les sessions abandonnées, pas cette demande";
      } else if (flow.trigger === "unprocessed" && slug !== "new") {
        state = "skipped";
        hint = "La demande a déjà été prise en charge";
      } else if (flow.trigger === "delay" && closed) {
        state = "skipped";
        hint = "Dossier clôturé, plus de relance";
      } else if (!flow.active) {
        state = "skipped";
        hint = "Flux désactivé";
      } else if (overdue) {
        state = "due";
        hint = "En attente d’envoi";
      }

      return {
        id: flow.id,
        title: FLOW_TITLES[flow.template_kind] ?? flow.template_kind,
        triggerLabel: TRIGGER_LABELS[flow.trigger] ?? flow.trigger,
        delayLabel: flow.delay_hours === 0 ? "Immédiat" : formatHours(flow.delay_hours),
        recipientLabel: RECIPIENT_LABELS[flow.recipient] ?? flow.recipient,
        active: flow.active,
        state,
        stateLabel: state === "sent" ? "Envoyé" : state === "due" ? "Dû" : state === "planned" ? "Planifié" : "Ignoré",
        when: sent ? formatRelative(sent) : state === "planned" || state === "due" ? formatWhen(dueAt.toISOString()) : null,
        hint,
      };
    });
}
