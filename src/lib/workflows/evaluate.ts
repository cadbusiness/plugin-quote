import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/lib/db/database.types";
import { appUrl } from "@/lib/prospect/access";
import type { BranchCondition, RunContext, SubjectContext, WorkflowSubjectType } from "@/lib/workflows/types";

type Client = SupabaseClient<Database>;

function asRecord(value: Json | null | undefined): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
}

export async function loadSubjectContext(
  supabase: Client,
  input: {
    organizationId: string;
    subjectType: WorkflowSubjectType;
    subjectId: string;
    stored?: RunContext;
  },
): Promise<SubjectContext | null> {
  const { data: org } = await supabase
    .from("organizations")
    .select("sales_email, sales_name")
    .eq("id", input.organizationId)
    .maybeSingle();

  if (input.subjectType === "quote") {
    const { data: quote } = await supabase
      .from("quotes")
      .select("*")
      .eq("id", input.subjectId)
      .eq("organization_id", input.organizationId)
      .maybeSingle();
    if (!quote) return null;

    const [{ data: status }, { data: items }, { data: access }] = await Promise.all([
      quote.status_id
        ? supabase.from("quote_statuses").select("slug, is_closed").eq("id", quote.status_id).maybeSingle()
        : Promise.resolve({ data: null }),
      supabase.from("quote_items").select("product_id, name, price_min, price_max").eq("quote_id", quote.id),
      supabase.from("prospect_access").select("token").eq("quote_id", quote.id).maybeSingle(),
    ]);

    const prices = (items ?? []).flatMap((item) => [item.price_min, item.price_max]).filter((n): n is number => n != null);
    const suiviUrl = access?.token ? `${appUrl()}/suivi/${access.token}` : input.stored?.suiviUrl ?? "";

    return {
      subjectType: "quote",
      subjectId: quote.id,
      organizationId: quote.organization_id,
      configuratorId: quote.configurator_id,
      contactName: quote.contact_name,
      contactEmail: quote.contact_email,
      contactCompany: quote.contact_company ?? "",
      score: quote.score,
      scoreLabel: quote.score_label,
      statusSlug: status?.slug ?? quote.status,
      isClosed: Boolean(status?.is_closed),
      assigned: Boolean(quote.assigned_to),
      assigneeUserId: quote.assigned_to,
      answers: asRecord(quote.answers),
      productIds: (items ?? []).map((item) => item.product_id).filter((id): id is string => Boolean(id)),
      productNames: (items ?? []).map((item) => item.name),
      priceMin: input.stored?.priceMin ?? (prices.length ? Math.min(...prices) : null),
      priceMax: input.stored?.priceMax ?? (prices.length ? Math.max(...prices) : null),
      lastActivityAt: quote.created_at,
      resumeUrl: input.stored?.resumeUrl ?? "",
      suiviUrl,
      pin: input.stored?.pin ?? "",
      salesEmail: org?.sales_email ?? null,
      salesName: org?.sales_name ?? "",
      submitted: true,
    };
  }

  const { data: session } = await supabase
    .from("quote_sessions")
    .select("*")
    .eq("id", input.subjectId)
    .eq("organization_id", input.organizationId)
    .maybeSingle();
  if (!session) return null;

  const draft = asRecord(session.contact_draft);
  const email = typeof draft.email === "string" ? draft.email : null;
  const name = typeof draft.name === "string" ? draft.name : "bonjour";
  const company = typeof draft.company === "string" ? draft.company : "";

  return {
    subjectType: "session",
    subjectId: session.id,
    organizationId: session.organization_id,
    configuratorId: session.configurator_id,
    contactName: name,
    contactEmail: email,
    contactCompany: company,
    score: null,
    scoreLabel: null,
    statusSlug: null,
    isClosed: false,
    assigned: false,
    assigneeUserId: null,
    answers: asRecord(session.answers),
    productIds: [],
    productNames: [],
    priceMin: null,
    priceMax: null,
    lastActivityAt: session.last_activity_at ?? session.updated_at,
    resumeUrl: `${appUrl()}/reprendre/${session.token}`,
    suiviUrl: "",
    pin: "",
    salesEmail: org?.sales_email ?? null,
    salesName: org?.sales_name ?? "",
    submitted: Boolean(session.submitted_quote_id),
  };
}

function scalar(value: unknown): string {
  if (Array.isArray(value)) return value.map((item) => String(item)).join(",");
  if (value == null) return "";
  return String(value);
}

export function matchCondition(condition: BranchCondition, ctx: SubjectContext): boolean {
  const op = condition.op ?? "eq";
  const expected = condition.value;

  const compare = (actual: unknown) => {
    if (op === "gte") return Number(actual) >= Number(expected);
    if (op === "contains") return scalar(actual).toLowerCase().includes(scalar(expected).toLowerCase());
    if (op === "neq") return scalar(actual) !== scalar(expected);
    if (typeof expected === "boolean") return Boolean(actual) === expected;
    return scalar(actual) === scalar(expected);
  };

  switch (condition.field) {
    case "score_label":
      return compare(ctx.scoreLabel);
    case "score_gte":
      return (ctx.score ?? 0) >= Number(expected);
    case "status":
      return compare(ctx.statusSlug);
    case "answer":
      return compare(ctx.answers[condition.answerKey ?? ""]);
    case "has_product": {
      const needle = scalar(expected).toLowerCase();
      return (
        ctx.productIds.includes(scalar(expected)) ||
        ctx.productNames.some((name) => name.toLowerCase().includes(needle))
      );
    }
    case "assigned":
      return compare(ctx.assigned);
    case "has_company":
      return compare(Boolean(ctx.contactCompany.trim()));
    case "is_closed":
      return compare(ctx.isClosed);
    default:
      return false;
  }
}

export function pickBranchHandle(conditions: BranchCondition[] | undefined, ctx: SubjectContext): string {
  for (const condition of conditions ?? []) {
    if (matchCondition(condition, ctx)) return condition.id;
  }
  return "else";
}

export function matchesFunnel(configuratorId: string | null, ids?: string[]): boolean {
  if (!ids?.length) return true;
  return Boolean(configuratorId && ids.includes(configuratorId));
}
