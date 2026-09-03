import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json, Tables } from "@/lib/db/database.types";
import { classifySource } from "@/lib/stats/attribution";
import { formatDate, formatPrice, formatRelative } from "@/lib/format";
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

export type QuoteDetail = {
  quote: Tables<"quotes">;
  funnel: { id: string; name: string; slug: string } | null;
  status: Tables<"quote_statuses"> | undefined;
  statuses: Tables<"quote_statuses">[];
  members: QuoteMember[];
  assignedLabel: string | null;
  answers: LabeledAnswer[];
  scoreReasons: string[];
  items: QuoteItemView[];
  files: QuoteFileView[];
  notes: QuoteNoteView[];
  messages: QuoteMessageView[];
  activities: QuoteActivityView[];
  source: string;
  suiviUrl: string | null;
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
      return "Message au prospect";
    default:
      return type;
  }
}

function activityDetail(type: string, payload: Json, memberLabel: Map<string, string>) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return null;
  const data = payload as Record<string, unknown>;
  if (type === "status_changed" && typeof data.label === "string") return data.label;
  if (type === "assigned") {
    const id = typeof data.assigned_to === "string" ? data.assigned_to : "";
    return id ? (memberLabel.get(id) ?? "Commercial") : "Non assigné";
  }
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
    supabase.from("prospect_access").select("token, expires_at").eq("quote_id", quote.id).maybeSingle(),
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

  return {
    quote,
    funnel: funnel ?? null,
    status,
    statuses: statuses ?? [],
    members: memberList,
    assignedLabel: quote.assigned_to ? (memberLabel.get(quote.assigned_to) ?? null) : null,
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
    suiviUrl: suiviAlive ? `${appUrl()}/suivi/${access.token}` : null,
    totals: rangeTotal(items ?? []),
  };
}
