import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrgContext, isAdminRole } from "@/lib/auth/org";
import { FunnelEditor } from "@/components/funnels/funnel-editor";
import { parseFunnelTab } from "@/lib/funnels/tabs";
import { parseFunnelTracking } from "@/lib/funnels/tracking";
import { getAppUrl } from "@/lib/supabase/env";
import { parseTriggerConfig } from "@/lib/workflows/types";
import type { WorkflowStatus, WorkflowTriggerType } from "@/lib/workflows/types";

export default async function FunnelEditorPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const ctx = await getOrgContext();
  if (!ctx) redirect("/onboarding");
  if (!isAdminRole(ctx.role)) redirect("/devis");
  const { id } = await params;
  const { tab: tabParam } = await searchParams;
  const supabase = await createClient();
  const { data: funnel } = await supabase
    .from("configurators")
    .select("*")
    .eq("id", id)
    .eq("organization_id", ctx.organization.id)
    .maybeSingle();
  if (!funnel) notFound();

  const [{ data: steps }, { data: questions }, { data: workflows }] = await Promise.all([
    supabase
      .from("wizard_steps")
      .select("*")
      .eq("organization_id", ctx.organization.id)
      .eq("configurator_id", funnel.id)
      .order("sort_order", { ascending: true }),
    supabase
      .from("wizard_questions")
      .select("*")
      .eq("organization_id", ctx.organization.id)
      .order("sort_order", { ascending: true }),
    supabase
      .from("workflows")
      .select("id, name, status, trigger_type, trigger_config")
      .eq("organization_id", ctx.organization.id)
      .neq("status", "archived")
      .order("created_at", { ascending: false }),
  ]);

  const stepIds = new Set((steps ?? []).map((step) => step.id));
  const funnelQuestions = (questions ?? []).filter((question) => stepIds.has(question.step_id));
  const origin = getAppUrl();
  const publicUrl = `${origin}/c/${ctx.organization.slug}/${funnel.slug}`;

  return (
    <FunnelEditor
      funnel={{
        id: funnel.id,
        name: funnel.name,
        slug: funnel.slug,
        wizardEnabled: funnel.wizard_enabled,
        chatEnabled: funnel.chat_enabled,
        isActive: funnel.is_active,
        hasCatalog: (steps ?? []).some((step) => step.screen_type === "suggestions"),
      }}
      steps={steps ?? []}
      questions={funnelQuestions}
      workflows={(workflows ?? []).map((workflow) => {
        const ids = parseTriggerConfig(workflow.trigger_config).configuratorIds ?? [];
        return {
          id: workflow.id,
          name: workflow.name,
          status: workflow.status as WorkflowStatus,
          triggerType: workflow.trigger_type as WorkflowTriggerType,
          scope: !ids.length ? "all" : ids.includes(funnel.id) ? "this" : "other",
        };
      })}
      tracking={parseFunnelTracking(funnel.theme)}
      orgGa={ctx.organization.ga_measurement_id ?? ""}
      publicUrl={publicUrl}
      orgSlug={ctx.organization.slug}
      tab={parseFunnelTab(tabParam)}
    />
  );
}
