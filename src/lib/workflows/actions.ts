import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/lib/db/database.types";
import { fill, sendTemplateEmail } from "@/lib/email/send";
import { logActivity, notifyUser } from "@/lib/crm/activity";
import { renderQuotePdf } from "@/lib/pdf/render";
import { formatPrice } from "@/lib/format";
import type { SubjectContext, WorkflowNode } from "@/lib/workflows/types";

type Client = SupabaseClient<Database>;

function answersText(answers: Record<string, unknown>) {
  return Object.entries(answers)
    .map(([key, value]) => `- ${key}: ${Array.isArray(value) ? value.join(", ") : String(value ?? "—")}`)
    .join("\n");
}

export async function executeSendEmail(
  supabase: Client,
  node: WorkflowNode,
  ctx: SubjectContext,
  extras: { pdf?: Buffer | null; suggestionName?: string },
): Promise<{ to: string; templateKind: string }> {
  const kind = node.data.templateKind;
  if (!kind) throw new Error("Template email manquant");
  if (!ctx.contactEmail && node.data.recipient === "prospect") {
    throw new Error("Pas d’email prospect");
  }

  const { data: template } = await supabase
    .from("email_templates")
    .select("subject, body")
    .eq("organization_id", ctx.organizationId)
    .eq("kind", kind)
    .maybeSingle();
  if (!template) throw new Error(`Template ${kind} introuvable`);

  let to: string | null = null;
  if (node.data.recipient === "sales_email") {
    to = ctx.salesEmail;
  } else if (node.data.recipient === "assignee" && ctx.assigneeUserId) {
    const { data: member } = await supabase
      .from("memberships")
      .select("invited_email")
      .eq("organization_id", ctx.organizationId)
      .eq("user_id", ctx.assigneeUserId)
      .maybeSingle();
    to = member?.invited_email ?? ctx.salesEmail;
  } else if (node.data.recipient === "assignee") {
    to = ctx.salesEmail;
  } else {
    to = ctx.contactEmail;
  }
  if (!to) throw new Error("Destinataire introuvable");

  const vars = {
    contact_name: ctx.contactName,
    contact_email: ctx.contactEmail ?? "",
    contact_company: ctx.contactCompany,
    score: String(ctx.score ?? ""),
    score_label: ctx.scoreLabel ?? "",
    sales_name: ctx.salesName,
    answers_text: answersText(ctx.answers),
    suggestion_name: extras.suggestionName ?? "",
    price_range: formatPrice(ctx.priceMin, ctx.priceMax),
    suivi_url: ctx.suiviUrl,
    resume_url: ctx.resumeUrl,
    pin: ctx.pin,
  };

  let pdf = extras.pdf ?? null;
  if (node.data.attachPdf && !pdf && ctx.subjectType === "quote") {
    pdf = await tryRenderPdf(supabase, ctx, extras.suggestionName ?? "");
  }

  await sendTemplateEmail({
    to,
    subject: fill(template.subject, vars),
    body: fill(template.body, vars),
    attachments: pdf ? [{ filename: "recapitulatif.pdf", content: pdf }] : undefined,
  });

  if (ctx.subjectType === "quote") {
    await logActivity(supabase, {
      organizationId: ctx.organizationId,
      quoteId: ctx.subjectId,
      type: "email_sent",
      payload: { template_kind: kind, workflow_node: node.id },
    });
  } else {
    await supabase.from("analytics_events").insert({
      organization_id: ctx.organizationId,
      configurator_id: ctx.configuratorId,
      session_id: ctx.subjectId,
      event_type: `abandon_email:${kind}`,
    });
  }

  return { to, templateKind: kind };
}

async function tryRenderPdf(supabase: Client, ctx: SubjectContext, suggestionName: string) {
  try {
    const [{ data: org }, { data: configurator }, { data: quote }, { data: items }] = await Promise.all([
      supabase.from("organizations").select("*").eq("id", ctx.organizationId).single(),
      ctx.configuratorId
        ? supabase.from("configurators").select("*").eq("id", ctx.configuratorId).single()
        : Promise.resolve({ data: null }),
      supabase.from("quotes").select("*").eq("id", ctx.subjectId).single(),
      supabase.from("quote_items").select("*").eq("quote_id", ctx.subjectId),
    ]);
    if (!org || !configurator || !quote) return null;
    return await renderQuotePdf({
      organization: org,
      configurator,
      quote,
      items: (items ?? []).map((item) => ({
        name: item.name,
        quantity: item.quantity,
        options: (item.options ?? {}) as Record<string, string>,
        priceMin: item.price_min,
        priceMax: item.price_max,
      })),
      answers: ctx.answers as Parameters<typeof renderQuotePdf>[0]["answers"],
      suggestionName,
      priceMin: ctx.priceMin,
      priceMax: ctx.priceMax,
    });
  } catch (error) {
    console.error("Workflow PDF failed", error);
    return null;
  }
}

export async function executeAssign(supabase: Client, node: WorkflowNode, ctx: SubjectContext) {
  if (ctx.subjectType !== "quote") return { skipped: true };
  let userId = node.data.userId ?? null;
  if (!userId) {
    const { data: members } = await supabase
      .from("memberships")
      .select("user_id, role")
      .eq("organization_id", ctx.organizationId)
      .eq("status", "active")
      .not("user_id", "is", null)
      .order("created_at", { ascending: true });
    const admin = (members ?? []).find((m) => m.role === "owner" || m.role === "admin") ?? members?.[0];
    userId = admin?.user_id ?? null;
  }
  if (!userId) throw new Error("Aucun membre à assigner");

  await supabase.from("quote_assignees").upsert({
    quote_id: ctx.subjectId,
    user_id: userId,
    organization_id: ctx.organizationId,
  });
  await supabase
    .from("quotes")
    .update({ assigned_to: userId })
    .eq("id", ctx.subjectId)
    .eq("organization_id", ctx.organizationId);
  await logActivity(supabase, {
    organizationId: ctx.organizationId,
    quoteId: ctx.subjectId,
    type: "assigned",
    payload: { user_id: userId, workflow_node: node.id },
  });
  await notifyUser(supabase, {
    organizationId: ctx.organizationId,
    userId,
    quoteId: ctx.subjectId,
    type: "assigned",
    body: `Demande assignée : ${ctx.contactName}`,
  });
  return { userId };
}

export async function executeSetStatus(supabase: Client, node: WorkflowNode, ctx: SubjectContext) {
  if (ctx.subjectType !== "quote") return { skipped: true };
  const slug = node.data.statusSlug;
  if (!slug) throw new Error("Statut manquant");
  const { data: status } = await supabase
    .from("quote_statuses")
    .select("*")
    .eq("organization_id", ctx.organizationId)
    .eq("slug", slug)
    .maybeSingle();
  if (!status) throw new Error(`Statut ${slug} introuvable`);
  await supabase
    .from("quotes")
    .update({ status_id: status.id, status: status.slug })
    .eq("id", ctx.subjectId)
    .eq("organization_id", ctx.organizationId);
  await logActivity(supabase, {
    organizationId: ctx.organizationId,
    quoteId: ctx.subjectId,
    type: "status_changed",
    payload: { status: status.slug, label: status.label, workflow_node: node.id } as Json as Record<string, unknown>,
  });
  return { status: status.slug };
}
