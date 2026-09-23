import type { Json } from "@/lib/db/database.types";
import { createServiceClient } from "@/lib/supabase/service";
import type { VisitorQuoteInput, VisitorRequestStore } from "@/lib/visitor-requests/store";
import type { VisitorLine, VisitorRequestRecord } from "@/lib/visitor-requests/types";

function asAnswers(value: Json | null): Record<string, Json> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Record<string, Json>;
}

function asOptions(value: Json | null): Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const out: Record<string, string> = {};
  for (const [key, raw] of Object.entries(value)) {
    if (typeof raw === "string") out[key] = raw;
  }
  return out;
}

function lineFromRow(row: {
  product_id: string;
  name: string;
  quantity: number;
  options: Json;
  price_min: number | null;
  price_max: number | null;
}): VisitorLine {
  return {
    productId: row.product_id,
    name: row.name,
    quantity: row.quantity,
    options: asOptions(row.options),
    priceMin: row.price_min,
    priceMax: row.price_max,
  };
}

export function createSupabaseVisitorStore(): VisitorRequestStore {
  const supabase = createServiceClient();

  return {
    async findIdentity(input) {
      let query = supabase
        .from("visitor_identities")
        .select("id")
        .eq("organization_id", input.organizationId)
        .eq("token_hash", input.tokenHash);
      query = input.connectionId ? query.eq("connection_id", input.connectionId) : query.is("connection_id", null);
      const { data, error } = await query.maybeSingle();
      if (error) throw new Error(error.message);
      return data ? { id: data.id } : null;
    },

    async createIdentity(input) {
      const { data, error } = await supabase
        .from("visitor_identities")
        .insert({
          organization_id: input.organizationId,
          connection_id: input.connectionId,
          token_hash: input.tokenHash,
        })
        .select("id")
        .single();
      if (error || !data) throw new Error(error?.message ?? "Identité visiteur impossible");
      return { id: data.id };
    },

    async touchIdentity(id) {
      const { error } = await supabase
        .from("visitor_identities")
        .update({ last_seen_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw new Error(error.message);
    },

    async findRequestByIdentity(identityId) {
      const { data, error } = await supabase
        .from("visitor_requests")
        .select("*")
        .eq("identity_id", identityId)
        .maybeSingle();
      if (error) throw new Error(error.message);
      if (!data) return null;
      const { data: lines, error: lineError } = await supabase
        .from("visitor_request_lines")
        .select("product_id, name, quantity, options, price_min, price_max")
        .eq("request_id", data.id);
      if (lineError) throw new Error(lineError.message);
      const record: VisitorRequestRecord = {
        id: data.id,
        organizationId: data.organization_id,
        identityId: data.identity_id,
        configuratorId: data.configurator_id,
        connectionId: data.connection_id,
        status: data.status === "submitted" ? "submitted" : "draft",
        quoteId: data.quote_id,
        contact: {
          name: data.contact_name,
          email: data.contact_email,
          phone: data.contact_phone,
          company: data.contact_company,
        },
        contactChannel: data.contact_channel === "email" || data.contact_channel === "phone" ? data.contact_channel : null,
        answers: asAnswers(data.answers),
        salesNotifiedAt: data.sales_notified_at,
        submittedAt: data.submitted_at,
        lines: (lines ?? []).map(lineFromRow),
      };
      return record;
    },

    async saveRequest(record) {
      const payload = {
        organization_id: record.organizationId,
        identity_id: record.identityId,
        configurator_id: record.configuratorId,
        connection_id: record.connectionId,
        status: record.status,
        quote_id: record.quoteId,
        contact_name: record.contact.name,
        contact_email: record.contact.email,
        contact_phone: record.contact.phone,
        contact_company: record.contact.company,
        contact_channel: record.contactChannel,
        answers: record.answers,
        sales_notified_at: record.salesNotifiedAt,
        submitted_at: record.submittedAt,
      };
      const { data: existing, error: existingError } = await supabase
        .from("visitor_requests")
        .select("id")
        .eq("identity_id", record.identityId)
        .maybeSingle();
      if (existingError) throw new Error(existingError.message);
      const id = existing?.id ?? record.id;
      const write = existing
        ? supabase.from("visitor_requests").update(payload).eq("id", id)
        : supabase.from("visitor_requests").insert({ ...payload, id });
      const { error } = await write;
      if (error) throw new Error(error.message);

      const { error: deleteError } = await supabase.from("visitor_request_lines").delete().eq("request_id", id);
      if (deleteError) throw new Error(deleteError.message);
      if (record.lines.length) {
        const { error: insertError } = await supabase.from("visitor_request_lines").insert(
          record.lines.map((line) => ({
            organization_id: record.organizationId,
            request_id: id,
            product_id: line.productId,
            name: line.name,
            quantity: line.quantity,
            options: line.options,
            price_min: line.priceMin,
            price_max: line.priceMax,
          })),
        );
        if (insertError) throw new Error(insertError.message);
      }
      return { ...record, id };
    },

    async productsByIds(input) {
      if (!input.ids.length) return [];
      const { data, error } = await supabase
        .from("products")
        .select("id, name, price_min, price_max, is_active")
        .eq("organization_id", input.organizationId)
        .eq("configurator_id", input.configuratorId)
        .in("id", input.ids);
      if (error) throw new Error(error.message);
      return (data ?? []).map((row) => ({
        id: row.id,
        name: row.name,
        priceMin: row.price_min,
        priceMax: row.price_max,
        active: row.is_active,
      }));
    },

    async createQuote(input) {
      const { data: defaultStatus } = await supabase
        .from("quote_statuses")
        .select("id, slug")
        .eq("organization_id", input.organizationId)
        .eq("is_default", true)
        .maybeSingle();
      const { data: quote, error } = await supabase
        .from("quotes")
        .insert({
          organization_id: input.organizationId,
          configurator_id: input.configuratorId,
          contact_name: input.contact.name,
          contact_email: input.contact.email,
          contact_phone: input.contact.phone,
          contact_company: input.contact.company,
          consent_marketing: false,
          answers: input.answers,
          status: defaultStatus?.slug ?? "new",
          status_id: defaultStatus?.id ?? null,
        })
        .select("id")
        .single();
      if (error || !quote) throw new Error(error?.message ?? "Devis impossible");
      await replaceQuoteItems(supabase, input, quote.id);
      const { error: activityError } = await supabase.from("quote_activities").insert({
        organization_id: input.organizationId,
        quote_id: quote.id,
        type: "submitted",
        payload: { source: "visitor_request" },
      });
      if (activityError) throw new Error(activityError.message);
      return { id: quote.id };
    },

    async syncQuote(input) {
      const { error } = await supabase
        .from("quotes")
        .update({
          contact_name: input.contact.name,
          contact_email: input.contact.email,
          contact_phone: input.contact.phone,
          contact_company: input.contact.company,
          answers: input.answers,
        })
        .eq("id", input.quoteId)
        .eq("organization_id", input.organizationId);
      if (error) throw new Error(error.message);
      await replaceQuoteItems(supabase, input, input.quoteId);
    },

    async salesContext(organizationId) {
      const [{ data: org }, { data: template }] = await Promise.all([
        supabase.from("organizations").select("sales_email, sales_name").eq("id", organizationId).maybeSingle(),
        supabase
          .from("email_templates")
          .select("subject, body")
          .eq("organization_id", organizationId)
          .eq("kind", "sales_brief")
          .maybeSingle(),
      ]);
      return {
        salesEmail: org?.sales_email ?? null,
        salesName: org?.sales_name ?? null,
        template: template ? { subject: template.subject, body: template.body } : null,
      };
    },

    async recordSalesNotice(input) {
      const { error } = await supabase.from("quote_activities").insert({
        organization_id: input.organizationId,
        quote_id: input.quoteId,
        type: "email_sent",
        payload: { template_kind: "sales_brief", audience: "sales", source: "visitor_request" },
      });
      if (error) throw new Error(error.message);
    },
  };
}

async function replaceQuoteItems(
  supabase: ReturnType<typeof createServiceClient>,
  input: VisitorQuoteInput,
  quoteId: string,
) {
  const { error: deleteError } = await supabase.from("quote_items").delete().eq("quote_id", quoteId);
  if (deleteError) throw new Error(deleteError.message);
  if (!input.lines.length) return;
  const { error } = await supabase.from("quote_items").insert(
    input.lines.map((line) => ({
      organization_id: input.organizationId,
      quote_id: quoteId,
      product_id: line.productId,
      name: line.name,
      quantity: line.quantity,
      options: line.options,
      price_min: line.priceMin,
      price_max: line.priceMax,
    })),
  );
  if (error) throw new Error(error.message);
}
