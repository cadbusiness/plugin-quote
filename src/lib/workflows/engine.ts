import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/lib/db/database.types";
import { createServiceClient } from "@/lib/supabase/service";
import { executeAssign, executeSendEmail, executeSetStatus } from "@/lib/workflows/actions";
import { loadSubjectContext, matchesFunnel, pickBranchHandle } from "@/lib/workflows/evaluate";
import { ensureDefaultWorkflows } from "@/lib/workflows/ensure";
import {
  parseDefinition,
  parseRunContext,
  parseTriggerConfig,
  type PendingWait,
  type RunContext,
  type WorkflowNode,
  type WorkflowTriggerType,
} from "@/lib/workflows/types";

type Client = SupabaseClient<Database>;

const MAX_STEPS = 80;

export type StartWorkflowsInput = {
  triggerType: WorkflowTriggerType;
  organizationId: string;
  subjectType: "quote" | "session";
  subjectId: string;
  statusSlug?: string;
  suiviUrl?: string;
  pin?: string;
  suggestionName?: string;
  priceMin?: number | null;
  priceMax?: number | null;
  pdf?: Buffer | null;
};

function service(): Client {
  return createServiceClient();
}

export async function startWorkflows(input: StartWorkflowsInput) {
  const supabase = service();
  await ensureDefaultWorkflows(supabase, input.organizationId);

  const { data: workflows } = await supabase
    .from("workflows")
    .select("*")
    .eq("organization_id", input.organizationId)
    .eq("status", "active")
    .eq("trigger_type", input.triggerType);

  const ctx = await loadSubjectContext(supabase, {
    organizationId: input.organizationId,
    subjectType: input.subjectType,
    subjectId: input.subjectId,
  });
  if (!ctx) return { started: 0 };

  let started = 0;
  for (const workflow of workflows ?? []) {
    const config = parseTriggerConfig(workflow.trigger_config);
    if (!matchesFunnel(ctx.configuratorId, config.configuratorIds)) continue;
    if (input.triggerType === "quote.status_changed" && config.statusSlug && config.statusSlug !== input.statusSlug) {
      continue;
    }

    const seedContext: RunContext = {
      pending: [],
      finishedNodeIds: [],
      suiviUrl: input.suiviUrl ?? ctx.suiviUrl,
      pin: input.pin,
      resumeUrl: ctx.resumeUrl,
      suggestionName: input.suggestionName,
      priceMin: input.priceMin ?? ctx.priceMin,
      priceMax: input.priceMax ?? ctx.priceMax,
    };

    const { data: run, error } = await supabase
      .from("workflow_runs")
      .insert({
        workflow_id: workflow.id,
        organization_id: input.organizationId,
        subject_type: input.subjectType,
        subject_id: input.subjectId,
        status: "running",
        context: seedContext as unknown as Json,
      })
      .select("id")
      .maybeSingle();
    if (error?.code === "23505" || !run) continue;

    await processRun(run.id, { supabase, pdf: input.pdf ?? null });
    started += 1;
  }
  return { started };
}

export async function cancelSessionRuns(organizationId: string, sessionId: string) {
  const supabase = service();
  await supabase
    .from("workflow_runs")
    .update({ status: "exited", updated_at: new Date().toISOString(), wakeup_at: null })
    .eq("organization_id", organizationId)
    .eq("subject_type", "session")
    .eq("subject_id", sessionId)
    .in("status", ["running", "waiting"]);
}

export async function runAutomations() {
  const supabase = service();
  const abandoned = await startAbandonedRuns(supabase);
  const resumed = await resumeDueRuns(supabase);
  return { started: abandoned, resumed };
}

async function startAbandonedRuns(supabase: Client) {
  const { data: orgs } = await supabase.from("organizations").select("id");
  for (const org of orgs ?? []) {
    await ensureDefaultWorkflows(supabase, org.id);
  }

  const { data: workflows } = await supabase
    .from("workflows")
    .select("*")
    .eq("status", "active")
    .eq("trigger_type", "session.abandoned");
  if (!workflows?.length) return 0;

  const { data: sessions } = await supabase
    .from("quote_sessions")
    .select("id, organization_id, configurator_id, contact_draft, submitted_quote_id")
    .is("submitted_quote_id", null);

  const orgIds = new Set(workflows.map((workflow) => workflow.organization_id));
  const { data: existing } = await supabase
    .from("workflow_runs")
    .select("workflow_id, subject_id")
    .eq("subject_type", "session")
    .in("workflow_id", workflows.map((workflow) => workflow.id));
  const seen = new Set((existing ?? []).map((row) => `${row.workflow_id}:${row.subject_id}`));

  let started = 0;
  for (const session of sessions ?? []) {
    if (!orgIds.has(session.organization_id)) continue;
    const draft = (session.contact_draft ?? {}) as { email?: string };
    if (!draft.email) continue;
    const hasOpen = workflows.some(
      (workflow) =>
        workflow.organization_id === session.organization_id && !seen.has(`${workflow.id}:${session.id}`),
    );
    if (!hasOpen) continue;
    const result = await startWorkflows({
      triggerType: "session.abandoned",
      organizationId: session.organization_id,
      subjectType: "session",
      subjectId: session.id,
    });
    started += result.started;
  }
  return started;
}

async function resumeDueRuns(supabase: Client) {
  const now = new Date().toISOString();
  const { data: runs } = await supabase
    .from("workflow_runs")
    .select("id")
    .eq("status", "waiting")
    .or(`wakeup_at.is.null,wakeup_at.lte.${now}`);

  let count = 0;
  for (const run of runs ?? []) {
    await processRun(run.id, { supabase, pdf: null });
    count += 1;
  }
  return count;
}

async function processRun(runId: string, env: { supabase: Client; pdf?: Buffer | null }) {
  const { supabase } = env;
  const { data: run } = await supabase.from("workflow_runs").select("*").eq("id", runId).maybeSingle();
  if (!run || run.status === "completed" || run.status === "exited") return;

  const { data: workflow } = await supabase.from("workflows").select("*").eq("id", run.workflow_id).maybeSingle();
  if (!workflow) {
    await failRun(supabase, run.id, "Parcours introuvable");
    return;
  }

  const definition = parseDefinition(workflow.definition);
  const nodes = new Map(definition.nodes.map((node) => [node.id, node]));
  const outgoing = (nodeId: string, handle?: string | null) =>
    definition.edges
      .filter((edge) => edge.source === nodeId && (handle == null || (edge.sourceHandle ?? null) === handle))
      .map((edge) => edge.target);

  const stored = parseRunContext(run.context);
  const ctx = await loadSubjectContext(supabase, {
    organizationId: run.organization_id,
    subjectType: run.subject_type as "quote" | "session",
    subjectId: run.subject_id,
    stored,
  });
  if (!ctx) {
    await failRun(supabase, run.id, "Sujet introuvable");
    return;
  }
  if (ctx.submitted && run.subject_type === "session") {
    await supabase
      .from("workflow_runs")
      .update({ status: "exited", wakeup_at: null, updated_at: new Date().toISOString() })
      .eq("id", run.id);
    return;
  }

  const finished = new Set(stored.finishedNodeIds);
  const pending: PendingWait[] = [];
  const queue: string[] = [];
  let failed = false;
  let lastError: string | null = null;

  for (const wait of stored.pending) {
    const node = nodes.get(wait.nodeId);
    const hours = node?.data.waitHours ?? wait.waitHours;
    const from = node?.data.waitFrom ?? wait.waitFrom;
    const wakeupAt = computeWakeup(from, hours, ctx.lastActivityAt, wait.wakeupAt);
    if (Date.parse(wakeupAt) <= Date.now()) {
      finished.add(wait.nodeId);
      await writeStep(supabase, run, wait.nodeId, "ok", { waited: true });
      queue.push(...outgoing(wait.nodeId));
    } else {
      pending.push({ ...wait, wakeupAt, waitHours: hours, waitFrom: from });
    }
  }

  if (!stored.finishedNodeIds.length && !stored.pending.length) {
    const trigger = definition.nodes.find((node) => node.type === "trigger");
    if (trigger) queue.push(trigger.id);
  }

  let steps = 0;
  while (queue.length && steps < MAX_STEPS) {
    steps += 1;
    const nodeId = queue.shift();
    if (!nodeId || finished.has(nodeId)) continue;
    const node = nodes.get(nodeId);
    if (!node) continue;

    try {
      if (node.type === "wait") {
        const hours = Math.max(0, node.data.waitHours ?? 1);
        const from = node.data.waitFrom ?? "now";
        const wakeupAt = computeWakeup(from, hours, ctx.lastActivityAt);
        if (Date.parse(wakeupAt) > Date.now()) {
          pending.push({ nodeId, wakeupAt, waitHours: hours, waitFrom: from });
          await writeStep(supabase, run, nodeId, "waiting", { wakeupAt });
          continue;
        }
        finished.add(nodeId);
        await writeStep(supabase, run, nodeId, "ok", { waited: false });
        queue.push(...outgoing(nodeId));
        continue;
      }

      if (node.type === "branch") {
        const handle = pickBranchHandle(node.data.conditions, ctx);
        finished.add(nodeId);
        await writeStep(supabase, run, nodeId, "ok", { handle });
        const targets = outgoing(nodeId, handle);
        queue.push(...(targets.length ? targets : outgoing(nodeId, "else")));
        continue;
      }

      if (node.type === "exit") {
        finished.add(nodeId);
        await writeStep(supabase, run, nodeId, "ok", { exit: true });
        continue;
      }

      if (node.type === "trigger") {
        finished.add(nodeId);
        await writeStep(supabase, run, nodeId, "ok", { trigger: workflow.trigger_type });
        queue.push(...outgoing(nodeId));
        continue;
      }

      const output = await executeNode(supabase, node, ctx, {
        pdf: env.pdf,
        suggestionName: stored.suggestionName,
      });
      finished.add(nodeId);
      await writeStep(supabase, run, nodeId, "ok", output);
      queue.push(...outgoing(nodeId));
    } catch (error) {
      failed = true;
      lastError = error instanceof Error ? error.message : "Étape en échec";
      finished.add(nodeId);
      await writeStep(supabase, run, nodeId, "failed", {}, lastError);
    }
  }

  const nextContext: RunContext = {
    ...stored,
    pending,
    finishedNodeIds: [...finished],
    suiviUrl: ctx.suiviUrl || stored.suiviUrl,
    resumeUrl: ctx.resumeUrl || stored.resumeUrl,
  };
  const wakeupAt = pending.length
    ? pending.map((item) => item.wakeupAt).sort()[0]
    : null;
  const status = pending.length ? "waiting" : failed ? "failed" : "completed";

  await supabase
    .from("workflow_runs")
    .update({
      status,
      wakeup_at: wakeupAt,
      context: nextContext as unknown as Json,
      error: lastError,
      updated_at: new Date().toISOString(),
    })
    .eq("id", run.id);
}

async function executeNode(
  supabase: Client,
  node: WorkflowNode,
  ctx: Awaited<ReturnType<typeof loadSubjectContext>> & object,
  extras: { pdf?: Buffer | null; suggestionName?: string },
) {
  if (!ctx) throw new Error("Contexte manquant");
  if (node.type === "send_email") return executeSendEmail(supabase, node, ctx, extras);
  if (node.type === "assign") return executeAssign(supabase, node, ctx);
  if (node.type === "set_status") return executeSetStatus(supabase, node, ctx);
  return {};
}

function computeWakeup(
  from: "now" | "last_activity",
  hours: number,
  lastActivityAt: string,
  existing?: string,
) {
  if (from === "last_activity") {
    return new Date(Date.parse(lastActivityAt) + hours * 3600_000).toISOString();
  }
  if (existing) return existing;
  return new Date(Date.now() + hours * 3600_000).toISOString();
}

async function writeStep(
  supabase: Client,
  run: { id: string; organization_id: string },
  nodeId: string,
  status: "ok" | "waiting" | "failed" | "skipped",
  output: Record<string, unknown>,
  error?: string,
) {
  await supabase.from("workflow_run_steps").insert({
    run_id: run.id,
    organization_id: run.organization_id,
    node_id: nodeId,
    status,
    finished_at: status === "waiting" ? null : new Date().toISOString(),
    error: error ?? null,
    output: output as Json,
  });
}

async function failRun(supabase: Client, runId: string, error: string) {
  await supabase
    .from("workflow_runs")
    .update({
      status: "failed",
      error,
      wakeup_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", runId);
}

