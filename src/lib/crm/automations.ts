import { createServiceClient } from "@/lib/supabase/service";
import { fill, sendTemplateEmail } from "@/lib/email/send";
import type { Json } from "@/lib/db/database.types";
import { appUrl } from "@/lib/prospect/access";

export async function runAutomations() {
  const supabase = createServiceClient();
  const { data: flows } = await supabase.from("automation_flows").select("*").eq("active", true);
  if (!flows?.length) return { sent: 0 };

  const { data: quotes } = await supabase.from("quotes").select("*");
  const { data: statuses } = await supabase.from("quote_statuses").select("*");
  const { data: templates } = await supabase.from("email_templates").select("*");
  const { data: orgs } = await supabase.from("organizations").select("*");
  const { data: sent } = await supabase.from("quote_activities").select("*").eq("type", "email_sent");
  const { data: sessions } = await supabase
    .from("quote_sessions")
    .select("*")
    .is("submitted_quote_id", null);
  const { data: abandonEvents } = await supabase
    .from("analytics_events")
    .select("session_id, event_type")
    .like("event_type", "abandon_email:%");

  const statusById = new Map((statuses ?? []).map((s) => [s.id, s]));
  const orgById = new Map((orgs ?? []).map((o) => [o.id, o]));
  const sentKeys = new Set(
    (sent ?? []).map((a) => `${a.quote_id}:${String((a.payload as { template_kind?: string })?.template_kind ?? "")}`),
  );
  const sessionSent = new Set(
    (abandonEvents ?? []).map((e) => `${e.session_id}:${e.event_type.replace("abandon_email:", "")}`),
  );

  let count = 0;
  const now = Date.now();

  for (const flow of flows) {
    if (flow.trigger === "submitted") continue;
    const kind = flow.template_kind;

    if (flow.trigger === "abandoned") {
      for (const session of sessions ?? []) {
        if (session.organization_id !== flow.organization_id) continue;
        const draft = (session.contact_draft ?? {}) as { email?: string; name?: string };
        if (!draft.email) continue;
        const ageH = (now - new Date(session.last_activity_at ?? session.updated_at).getTime()) / 3600000;
        if (ageH < flow.delay_hours) continue;
        if (sessionSent.has(`${session.id}:${kind}`)) continue;
        const template = (templates ?? []).find((t) => t.organization_id === session.organization_id && t.kind === kind);
        if (!template) continue;
        const vars = {
          contact_name: draft.name || "bonjour",
          contact_email: draft.email,
          resume_url: `${appUrl()}/reprendre/${session.token}`,
        };
        await sendTemplateEmail({
          to: draft.email,
          subject: fill(template.subject, vars),
          body: fill(template.body, vars),
        });
        await supabase.from("analytics_events").insert({
          organization_id: session.organization_id,
          configurator_id: session.configurator_id,
          session_id: session.id,
          event_type: `abandon_email:${kind}`,
        });
        sessionSent.add(`${session.id}:${kind}`);
        count += 1;
      }
      continue;
    }

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
      const { data: access } = await supabase
        .from("prospect_access")
        .select("token, quote_id")
        .eq("quote_id", quote.id)
        .maybeSingle();
      const vars = {
        contact_name: quote.contact_name,
        contact_email: quote.contact_email,
        contact_company: quote.contact_company ?? "",
        score: String(quote.score ?? ""),
        score_label: quote.score_label ?? "",
        suivi_url: access ? `${appUrl()}/suivi/${access.token}` : "",
        pin: "",
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
