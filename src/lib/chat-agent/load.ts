import { publicProductSpecs } from "@/lib/catalog/specs";
import { parseProductSheet } from "@/lib/catalog/sheet";
import type { ChatDraft, ChatTurnMessage } from "@/lib/chat-agent/draft";
import { appendChatTranscript, phoneKey, pickExistingDraft } from "@/lib/chat-agent/draft";
import type { MerchantInbox } from "@/lib/chat-agent/escalate";
import { sourcesFromCatalog } from "@/lib/chat-agent/sources";
import type { Json } from "@/lib/db/database.types";
import type { PluginConnection } from "@/lib/integrations/plugin";
import { notifyUser } from "@/lib/crm/activity";
import { createServiceClient } from "@/lib/supabase/service";
import type { VisitorContact } from "@/lib/visitor-requests/types";
import type { Product } from "@/lib/wizard/types";

const EMAIL_PROVIDERS = ["gmail", "outlook", "imap"] as const;

function asAnswers(value: Json | null): Record<string, Json> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Record<string, Json>;
}

function contactOf(row: {
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  contact_company: string | null;
}): VisitorContact {
  return {
    name: row.contact_name,
    email: row.contact_email,
    phone: row.contact_phone,
    company: row.contact_company,
  };
}

function mapProduct(row: {
  id: string;
  name: string;
  description: string | null;
  price_min: number | null;
  price_max: number | null;
  currency: string;
  tags: string[] | null;
  category: string | null;
  options: Json;
  specs: Json;
  sheet: Json;
  stock_status: string | null;
  external_id: string | null;
}): Product {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    imageUrl: null,
    images: [],
    priceMin: row.price_min,
    priceMax: row.price_max,
    currency: row.currency,
    tags: row.tags ?? [],
    category: row.category,
    options: [],
    specs: publicProductSpecs(row.options, row.specs),
    sheet: parseProductSheet(row.sheet),
    stockStatus: row.stock_status,
    externalId: row.external_id,
  };
}

export async function loadConnectionSources(connection: PluginConnection) {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("products")
    .select("id, name, description, price_min, price_max, currency, tags, category, options, specs, sheet, stock_status, external_id")
    .eq("organization_id", connection.organization_id)
    .eq("connection_id", connection.id)
    .eq("is_active", true)
    .eq("archived_by_sync", false)
    .order("name", { ascending: true })
    .limit(300);
  if (error) throw new Error(error.message);
  return sourcesFromCatalog((data ?? []).map(mapProduct));
}

const DRAFT_COLUMNS =
  "id, organization_id, quote_id, contact_name, contact_email, contact_phone, contact_company, answers";

type DraftRow = {
  id: string;
  organization_id: string;
  quote_id: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  contact_company: string | null;
  answers: Json;
};

function toDraft(row: DraftRow): ChatDraft {
  return {
    id: row.id,
    organizationId: row.organization_id,
    quoteId: row.quote_id,
    contact: contactOf(row),
    answers: asAnswers(row.answers),
  };
}

/** Existing visitor dossier only. This function never inserts a request. */
export async function findChatDraft(input: {
  organizationId: string;
  visitorRequestId?: string | null;
  email?: string | null;
  phone?: string | null;
}): Promise<ChatDraft | null> {
  const supabase = createServiceClient();
  const rows: DraftRow[] = [];
  const id = input.visitorRequestId?.trim();
  if (id) {
    const { data, error } = await supabase
      .from("visitor_requests")
      .select(DRAFT_COLUMNS)
      .eq("id", id)
      .eq("organization_id", input.organizationId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (data) rows.push(data);
  }
  const email = input.email?.trim().toLowerCase().replace(/[%_\\]/g, "") ?? "";
  if (email.includes("@")) {
    const { data, error } = await supabase
      .from("visitor_requests")
      .select(DRAFT_COLUMNS)
      .eq("organization_id", input.organizationId)
      .ilike("contact_email", email)
      .order("updated_at", { ascending: false })
      .limit(1);
    if (error) throw new Error(error.message);
    rows.push(...(data ?? []));
  }
  if (phoneKey(input.phone)) {
    const { data, error } = await supabase
      .from("visitor_requests")
      .select(DRAFT_COLUMNS)
      .eq("organization_id", input.organizationId)
      .not("contact_phone", "is", null)
      .order("updated_at", { ascending: false })
      .limit(30);
    if (error) throw new Error(error.message);
    rows.push(...(data ?? []));
  }
  return pickExistingDraft(rows.map(toDraft), input);
}

/** Writes the transcript onto the same request and, when present, the same quote. */
export async function saveChatTranscript(draft: ChatDraft, messages: ChatTurnMessage[]) {
  const supabase = createServiceClient();
  let base = draft.answers;
  if (draft.quoteId) {
    const { data, error } = await supabase
      .from("quotes")
      .select("answers")
      .eq("id", draft.quoteId)
      .eq("organization_id", draft.organizationId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    base = { ...asAnswers(data?.answers ?? null), ...draft.answers };
  }
  const answers = appendChatTranscript(base, messages) as Json;
  const { error } = await supabase
    .from("visitor_requests")
    .update({ answers })
    .eq("id", draft.id)
    .eq("organization_id", draft.organizationId);
  if (error) throw new Error(error.message);
  if (!draft.quoteId) return;
  const { error: quoteError } = await supabase
    .from("quotes")
    .update({ answers })
    .eq("id", draft.quoteId)
    .eq("organization_id", draft.organizationId);
  if (quoteError) throw new Error(quoteError.message);
}

export async function loadMerchantInbox(organizationId: string, draft: ChatDraft | null): Promise<MerchantInbox> {
  const supabase = createServiceClient();
  const [{ data: org }, { data: template }, { data: channel }] = await Promise.all([
    supabase.from("organizations").select("name, sales_email, sales_name").eq("id", organizationId).maybeSingle(),
    supabase
      .from("email_templates")
      .select("subject, body")
      .eq("organization_id", organizationId)
      .eq("kind", "sales_brief")
      .maybeSingle(),
    supabase
      .from("comm_channels")
      .select("address")
      .eq("organization_id", organizationId)
      .eq("scope", "org")
      .eq("status", "connected")
      .in("provider", [...EMAIL_PROVIDERS])
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  let assigneeUserId: string | null = null;
  let assigneeEmail: string | null = null;
  if (draft?.quoteId) {
    const { data: quote, error } = await supabase
      .from("quotes")
      .select("assigned_to")
      .eq("id", draft.quoteId)
      .eq("organization_id", organizationId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    assigneeUserId = quote?.assigned_to ?? null;
    if (assigneeUserId) {
      const { data: member, error: memberError } = await supabase
        .from("memberships")
        .select("invited_email")
        .eq("organization_id", organizationId)
        .eq("user_id", assigneeUserId)
        .eq("status", "active")
        .maybeSingle();
      if (memberError) throw new Error(memberError.message);
      assigneeEmail = member?.invited_email ?? null;
    }
  }

  return {
    assigneeEmail,
    assigneeUserId,
    salesEmail: org?.sales_email ?? null,
    salesName: org?.sales_name ?? null,
    channelAddress: channel?.address ?? null,
    template: template ? { subject: template.subject, body: template.body } : null,
    organizationName: org?.name ?? null,
  };
}

export async function recordChatEscalation(input: {
  organizationId: string;
  quoteId: string | null;
  assigneeUserId: string | null;
  note: string;
}) {
  if (!input.quoteId && !input.assigneeUserId) return;
  const supabase = createServiceClient();
  const note = input.note.slice(0, 2000);
  if (input.quoteId) {
    const { error } = await supabase.from("quote_activities").insert({
      organization_id: input.organizationId,
      quote_id: input.quoteId,
      type: "email_sent",
      payload: { template_kind: "sales_brief", audience: "sales", source: "chat_agent" },
    });
    if (error) throw new Error(error.message);
    const { error: noteError } = await supabase.from("quote_notes").insert({
      organization_id: input.organizationId,
      quote_id: input.quoteId,
      content: note,
    });
    if (noteError) throw new Error(noteError.message);
  }
  if (input.assigneeUserId) {
    await notifyUser(supabase, {
      organizationId: input.organizationId,
      userId: input.assigneeUserId,
      quoteId: input.quoteId,
      type: "chat_escalation",
      body: note.slice(0, 280),
    });
  }
}
