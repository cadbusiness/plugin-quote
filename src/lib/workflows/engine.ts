import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/lib/db/database.types";
import { createServiceClient } from "@/lib/supabase/service";
import { executeAssign, executeSendEmail, executeSetStatus } from "@/lib/workflows/actions";
import { loadSubjectContext, matchesFunnel, pickBranchHandle } from "@/lib/workflows/evaluate";
import { ensureDefaultWorkflows } from "@/lib/workflows/ensure";
import {
  isActiveRunStatus,
  isClosedQuoteStatus,
  isOneShotTrigger,
  isSessionAbandonedDue,
  minAbandonHours,
  resolveAbandonHours,
  shouldExitRunOnClosedQuote,
} from "@/lib/workflows/policy";
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

  const existingByWorkflow = new Map<string, { id: string; status: string }[]>();
  if (workflows?.length) {
    const { data: existingRows } = await supabase
      .from("workflow_runs")
      .select("id, workflow_id, status")
      .eq("subject_type", input.subjectType)
      .eq("subject_id", input.subjectId)
      .in(
        "workflow_id",
        workflows.map((workflow) => workflow.id),
      );
    for (const row of existingRows ?? []) {
      const list = existingByWorkflow.get(row.workflow_id) ?? [];
      list.push({ id: row.id, status: row.status });
      existingByWorkflow.set(row.workflow_id, list);
    }
  }

  let started = 0;
  for (const workflow of workflows ?? []) {
    const config = parseTriggerConfig(workflow.trigger_config);
    if (!matchesFunnel(ctx.configuratorId, config.configuratorIds)) continue;
    if (input.triggerType === "quote.status_changed" && config.statusSlug && config.statusSlug !== input.statusSlug) {
      continue;
    }
    if (input.triggerType === "session.abandoned") {
      const hours = resolveAbandonHours(config);
      if (!isSessionAbandonedDue(ctx.lastActivityAt, hours)) continue;
    }

    const existing = existingByWorkflow.get(workflow.id) ?? [];
    if (isOneShotTrigger(input.triggerType) && existing.length) continue;
    if (input.triggerType === "quote.status_changed") {
      const activeIds = existing.filter((row) => isActiveRunStatus(row.status)).map((row) => row.id);
      if (activeIds.length) {
        await markRunsExited(supabase, activeIds);
      }
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
      triggerStatus: input.statusSlug,
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

export async function exitActiveQuoteRuns(
  organizationId: string,
  quoteId: string,
  options?: { excludeRunId?: string },
) {
  const supabase = service();
  let query = supabase
    .from("workflow_runs")
    .update({ status: "exited", updated_at: new Date().toISOString(), wakeup_at: null })
    .eq("organization_id", organizationId)
    .eq("subject_type", "quote")
    .eq("subject_id", quoteId)
    .in("status", ["running", "waiting"]);
  if (options?.excludeRunId) query = query.neq("id", options.excludeRunId);
  await query;
}

export async function runAutomations() {
  const supabase = service();
  const abandoned = await startAbandonedRuns(supabase);
  const closed = await exitStaleRunsOnClosedQuotes(supabase);
  const resumed = await resumeDueRuns(supabase);
  return { started: abandoned, closed, resumed };
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

  const configs = workflows.map((workflow) => parseTriggerConfig(workflow.trigger_config));
  const cutoffHours = minAbandonHours(configs);
  let sessionQuery = supabase
    .from("quote_sessions")
    .select("id, organization_id, configurator_id, contact_draft, submitted_quote_id, last_activity_at, updated_at")
    .is("submitted_quote_id", null);
  if (cutoffHours > 0) {
    const cutoff = new Date(Date.now() - cutoffHours * 3600_000).toISOString();
    sessionQuery = sessionQuery.lte("last_activity_at", cutoff);
  }

  const { data: sessions } = await sessionQuery;

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
    const lastActivity = session.last_activity_at ?? session.updated_at;
    const hasOpen = workflows.some((workflow) => {
      if (workflow.organization_id !== session.organization_id) return false;
      if (seen.has(`${workflow.id}:${session.id}`)) return false;
      const hours = resolveAbandonHours(parseTriggerConfig(workflow.trigger_config));
      return isSessionAbandonedDue(lastActivity, hours);
    });
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

async function exitStaleRunsOnClosedQuotes(supabase: Client) {
  const { data: runs } = await supabase
    .from("workflow_runs")
    .select("id, workflow_id, subject_id")
    .eq("subject_type", "quote")
    .in("status", ["running", "waiting"]);
  if (!runs?.length) return 0;

  const quoteIds = [...new Set(runs.map((run) => run.subject_id))];
  const workflowIds = [...new Set(runs.map((run) => run.workflow_id))];
  const [{ data: quotes }, { data: workflowRows }] = await Promise.all([
    supabase.from("quotes").select("id, status, status_id").in("id", quoteIds),
    supabase.from("workflows").select("id, trigger_type, trigger_config").in("id", workflowIds),
  ]);
  const statusIds = [...new Set((quotes ?? []).map((quote) => quote.status_id).filter((id): id is string => Boolean(id)))];
  const { data: statuses } = statusIds.length
    ? await supabase.from("quote_statuses").select("id, slug, is_closed").in("id", statusIds)
    : { data: [] };

  const statusById = new Map((statuses ?? []).map((status) => [status.id, status]));
  const quoteById = new Map((quotes ?? []).map((quote) => [quote.id, quote]));
  const workflowById = new Map((workflowRows ?? []).map((workflow) => [workflow.id, workflow]));

  const exitIds: string[] = [];
  for (const run of runs) {
    const quote = quoteById.get(run.subject_id);
    if (!quote) continue;
    const status = quote.status_id ? statusById.get(quote.status_id) : undefined;
    if (!isClosedQuoteStatus(status, quote.status)) continue;
    const workflow = workflowById.get(run.workflow_id);
    if (!workflow) continue;
    const config = parseTriggerConfig(workflow.trigger_config);
    const slug = status?.slug ?? quote.status;
    if (shouldExitRunOnClosedQuote(workflow.trigger_type, config.statusSlug, slug)) {
      exitIds.push(run.id);
    }
  }
  if (!exitIds.length) return 0;
  await markRunsExited(supabase, exitIds);
  return exitIds.length;
}

async function markRunsExited(supabase: Client, runIds: string[]) {
  const unique = [...new Set(runIds)];
  for (let i = 0; i < unique.length; i += 80) {
    const chunk = unique.slice(i, i + 80);
    await supabase
      .from("workflow_runs")
      .update({ status: "exited", wakeup_at: null, updated_at: new Date().toISOString() })
      .in("id", chunk);
  }
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
        runId: run.id,
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
    triggerStatus: stored.triggerStatus,
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
  extras: { pdf?: Buffer | null; suggestionName?: string; runId: string },
) {
  if (!ctx) throw new Error("Contexte manquant");
  if (node.type === "send_email") return executeSendEmail(supabase, node, ctx, extras);
  if (node.type === "assign") return executeAssign(supabase, node, ctx);
  if (node.type === "set_status") {
    const output = await executeSetStatus(supabase, node, ctx);
    if (output && "isClosed" in output && output.isClosed) {
      await exitActiveQuoteRuns(ctx.organizationId, ctx.subjectId, { excludeRunId: extras.runId });
    }
    return output;
  }
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

