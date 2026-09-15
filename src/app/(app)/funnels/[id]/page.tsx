import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrgContext, isAdminRole } from "@/lib/auth/org";
import { FunnelEditor } from "@/components/funnels/funnel-editor";
import { parseFunnelTab } from "@/lib/funnels/tabs";
import { parseFunnelTracking } from "@/lib/funnels/tracking";
import { parseFunnelKind } from "@/lib/funnels/kind";
import { loadStatsDashboard } from "@/lib/stats/dashboard";
import { loadFunnelAutomationBoard } from "@/lib/funnels/automations";
import { getAppUrl } from "@/lib/supabase/env";
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

  const [{ data: steps }, { data: questions }, { data: workflows }, { data: products }, { data: funnels }, { data: statuses }, stats] =
    await Promise.all([
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
        .select("id, name, status, trigger_type, trigger_config, definition")
        .eq("organization_id", ctx.organization.id)
        .neq("status", "archived")
        .order("created_at", { ascending: false }),
      supabase
        .from("products")
        .select("id, name, description, image_url, price_min, price_max, category, configurator_id")
        .eq("organization_id", ctx.organization.id)
        .eq("is_active", true)
        .order("name")
        .limit(40),
      supabase.from("configurators").select("id, name").eq("organization_id", ctx.organization.id).order("name"),
      supabase.from("quote_statuses").select("slug, label").eq("organization_id", ctx.organization.id).order("position"),
      loadStatsDashboard(supabase, ctx.organization.id, "month", funnel.id),
    ]);

  const stepIds = new Set((steps ?? []).map((step) => step.id));
  const funnelQuestions = (questions ?? []).filter((question) => stepIds.has(question.step_id));
  const origin = getAppUrl();
  const publicUrl = `${origin}/c/${ctx.organization.slug}/${funnel.slug}`;
  const kind = parseFunnelKind(funnel.theme, funnel.wizard_enabled, funnel.chat_enabled);
  const automations = await loadFunnelAutomationBoard(supabase, {
    orgId: ctx.organization.id,
    funnelId: funnel.id,
    kind,
    workflows: (workflows ?? []).map((workflow) => ({
      id: workflow.id,
      name: workflow.name,
      status: workflow.status as WorkflowStatus,
      triggerType: workflow.trigger_type as WorkflowTriggerType,
      triggerConfig: workflow.trigger_config,
      definition: workflow.definition,
    })),
  });

  return (
    <FunnelEditor
      funnel={{
        id: funnel.id,
        name: funnel.name,
        slug: funnel.slug,
        kind,
        isActive: funnel.is_active,
      }}
      steps={steps ?? []}
      questions={funnelQuestions}
      products={(() => {
        const rows = products ?? [];
        const forFunnel = rows.filter((product) => product.configurator_id === funnel.id);
        return (forFunnel.length ? forFunnel : rows).slice(0, 8).map((product) => ({
          id: product.id,
          name: product.name,
          description: product.description,
          imageUrl: product.image_url,
          priceMin: product.price_min,
          priceMax: product.price_max,
          category: product.category,
        }));
      })()}
      automations={automations}
      funnels={funnels ?? []}
      statuses={statuses ?? []}
      tracking={parseFunnelTracking(funnel.theme)}
      orgGa={ctx.organization.ga_measurement_id ?? ""}
      publicUrl={publicUrl}
      orgSlug={ctx.organization.slug}
      tab={parseFunnelTab(tabParam)}
      stats={stats}
    />
  );
}
