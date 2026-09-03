import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrgContext, isAdminRole } from "@/lib/auth/org";
import { WorkflowEditor } from "@/components/workflows/workflow-editor";
import { formatRelative } from "@/lib/format";
import { nodeTitle } from "@/lib/workflows/labels";
import { parseDefinition, parseTriggerConfig, type WorkflowStatus, type WorkflowTriggerType } from "@/lib/workflows/types";

export default async function WorkflowEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const ctx = await getOrgContext();
  if (!ctx) redirect("/onboarding");
  if (!isAdminRole(ctx.role)) redirect("/devis");
  const { id } = await params;
  const supabase = await createClient();

  const { data: workflow } = await supabase
    .from("workflows")
    .select("*")
    .eq("id", id)
    .eq("organization_id", ctx.organization.id)
    .maybeSingle();
  if (!workflow) notFound();

  const [{ data: templates }, { data: statuses }, { data: members }, { data: runs }] = await Promise.all([
    supabase.from("email_templates").select("kind, subject").eq("organization_id", ctx.organization.id),
    supabase.from("quote_statuses").select("slug, label").eq("organization_id", ctx.organization.id).order("position"),
    supabase
      .from("memberships")
      .select("user_id, invited_email, role")
      .eq("organization_id", ctx.organization.id)
      .eq("status", "active")
      .not("user_id", "is", null),
    supabase
      .from("workflow_runs")
      .select("*")
      .eq("workflow_id", workflow.id)
      .order("started_at", { ascending: false })
      .limit(80),
  ]);

  const runIds = (runs ?? []).map((run) => run.id);
  const { data: steps } = runIds.length
    ? await supabase
        .from("workflow_run_steps")
        .select("run_id, node_id, status, started_at")
        .in("run_id", runIds)
        .order("started_at")
    : { data: [] };

  const definition = parseDefinition(workflow.definition);
  const nodes = new Map(definition.nodes.map((node) => [node.id, node]));
  const stats: Record<string, { ok: number; waiting: number; failed: number }> = {};
  for (const step of steps ?? []) {
    const current = stats[step.node_id] ?? { ok: 0, waiting: 0, failed: 0 };
    if (step.status === "ok") current.ok += 1;
    if (step.status === "waiting") current.waiting += 1;
    if (step.status === "failed") current.failed += 1;
    stats[step.node_id] = current;
  }

  const quoteIds = (runs ?? []).filter((run) => run.subject_type === "quote").map((run) => run.subject_id);
  const sessionIds = (runs ?? []).filter((run) => run.subject_type === "session").map((run) => run.subject_id);
  const [{ data: quotes }, { data: sessions }] = await Promise.all([
    quoteIds.length
      ? supabase.from("quotes").select("id, contact_name, contact_email").in("id", quoteIds)
      : Promise.resolve({ data: [] }),
    sessionIds.length
      ? supabase.from("quote_sessions").select("id, contact_draft").in("id", sessionIds)
      : Promise.resolve({ data: [] }),
  ]);
  const quoteById = new Map((quotes ?? []).map((quote) => [quote.id, quote]));
  const sessionById = new Map((sessions ?? []).map((session) => [session.id, session]));
  const lastStep = new Map<string, { node_id: string; status: string }>();
  for (const step of steps ?? []) {
    lastStep.set(step.run_id, step);
  }

  const config = parseTriggerConfig(workflow.trigger_config);

  return (
    <WorkflowEditor
      workflow={{
        id: workflow.id,
        name: workflow.name,
        status: workflow.status as WorkflowStatus,
        triggerType: workflow.trigger_type as WorkflowTriggerType,
        configuratorIds: config.configuratorIds ?? [],
        abandonHours: config.abandonHours ?? 1,
        statusSlug: config.statusSlug ?? "",
        definition,
      }}
      templates={templates ?? []}
      statuses={statuses ?? []}
      members={(members ?? []).map((member) => ({
        userId: member.user_id!,
        label: member.invited_email || (member.role === "owner" ? "Propriétaire" : member.role),
      }))}
      stats={stats}
      runs={(runs ?? []).map((run) => {
        const quote = run.subject_type === "quote" ? quoteById.get(run.subject_id) : undefined;
        const session = run.subject_type === "session" ? sessionById.get(run.subject_id) : undefined;
        const draft = (session?.contact_draft ?? {}) as { name?: string; email?: string };
        const step = lastStep.get(run.id);
        const node = step ? nodes.get(step.node_id) : undefined;
        return {
          id: run.id,
          subjectType: run.subject_type,
          subjectId: run.subject_id,
          participant: quote?.contact_name ?? draft.name ?? draft.email ?? quote?.contact_email ?? "Participant",
          status: run.status,
          hint: run.error ?? (node ? nodeTitle(node) : "Démarré"),
          when: formatRelative(run.updated_at),
          href: run.subject_type === "quote" ? `/devis/${run.subject_id}?tab=automations` : null,
        };
      })}
    />
  );
}
