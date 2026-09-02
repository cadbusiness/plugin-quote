import { createServiceClient } from "@/lib/supabase/service";
import { fill, sendTemplateEmail } from "@/lib/email/send";
import type { Json } from "@/lib/db/database.types";

export async function runAutomations() {
  const supabase = createServiceClient();
  const { data: flows } = await supabase.from("automation_flows").select("*").eq("active", true);
  if (!flows?.length) return { sent: 0 };

  const { data: quotes } = await supabase.from("quotes").select("*");
  const { data: statuses } = await supabase.from("quote_statuses").select("*");
  const { data: templates } = await supabase.from("email_templates").select("*");
  const { data: orgs } = await supabase.from("organizations").select("*");
  const { data: sent } = await supabase.from("quote_activities").select("*").eq("type", "email_sent");

  const statusById = new Map((statuses ?? []).map((s) => [s.id, s]));
  const orgById = new Map((orgs ?? []).map((o) => [o.id, o]));
  const sentKeys = new Set(
    (sent ?? []).map((a) => `${a.quote_id}:${String((a.payload as { template_kind?: string })?.template_kind ?? "")}`),
  );

  let count = 0;
  const now = Date.now();

  for (const flow of flows) {
    if (flow.trigger === "submitted") continue;
    const kind = flow.template_kind;
    for (const quote of quotes ?? []) {
      if (quote.organization_id !== flow.organization_id) continue;
      const status = quote.status_id ? statusById.get(quote.status_id) : undefined;
      const ageH = (now - new Date(quote.created_at).getTime()) / 3600000;
      if (ageH < flow.delay_hours) continue;
      if (sentKeys.has(`${quote.id}:${kind}`)) continue;
      if (flow.trigger === "unprocessed" && (status?.slug ?? quote.status) !== "new") continue;
      if (flow.trigger === "delay" && status?.is_closed) continue;

      const org = orgById.get(quote.organization_id);
      const template = (templates ?? []).find((t) => t.organization_id === quote.organization_id && t.kind === kind);
      const to =
        flow.recipient === "prospect" ? quote.contact_email : org?.sales_email;
      if (!to || !template) continue;
      const vars = {
        contact_name: quote.contact_name,
        contact_email: quote.contact_email,
        contact_company: quote.contact_company ?? "",
        score: String(quote.score ?? ""),
        score_label: quote.score_label ?? "",
      };
      await sendTemplateEmail({
        to,
        subject: fill(template.subject, vars),
        body: fill(template.body, vars),
      });
      await supabase.from("quote_activities").insert({
        organization_id: quote.organization_id,
        quote_id: quote.id,
        type: "email_sent",
        payload: { template_kind: kind } as Json,
      });
      sentKeys.add(`${quote.id}:${kind}`);
      count += 1;
    }
  }
  return { sent: count };
}
