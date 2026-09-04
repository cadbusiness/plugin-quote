import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrgContext, isAdminRole } from "@/lib/auth/org";
import { FunnelEditor } from "@/components/funnels/funnel-editor";
import { parseFunnelTab } from "@/lib/funnels/tabs";
import { parseFunnelTracking } from "@/lib/funnels/tracking";
import { getAppUrl } from "@/lib/supabase/env";
import { nodeTitle } from "@/lib/workflows/labels";
import { parseDefinition, parseTriggerConfig } from "@/lib/workflows/types";
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

  const [{ data: steps }, { data: questions }, { data: workflows }, { data: products }, { data: funnels }, { data: statuses }] =
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
        .select("id, name, description, image_url, price_min, price_max, configurator_id")
        .eq("organization_id", ctx.organization.id)
        .eq("is_active", true)
        .order("name")
        .limit(40),
      supabase.from("configurators").select("id, name").eq("organization_id", ctx.organization.id).order("name"),
      supabase.from("quote_statuses").select("slug, label").eq("organization_id", ctx.organization.id).order("position"),
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
      }}
      orgName={ctx.organization.name}
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
        }));
      })()}
      workflows={(workflows ?? []).map((workflow) => {
        const ids = parseTriggerConfig(workflow.trigger_config).configuratorIds ?? [];
        const definition = parseDefinition(workflow.definition);
        return {
          id: workflow.id,
          name: workflow.name,
          status: workflow.status as WorkflowStatus,
          triggerType: workflow.trigger_type as WorkflowTriggerType,
          scope: !ids.length ? "all" : ids.includes(funnel.id) ? "this" : "other",
          steps: definition.nodes
            .filter((node) => node.type !== "trigger" && node.type !== "exit")
            .map((node) => nodeTitle(node)),
        };
      })}
      funnels={funnels ?? []}
      statuses={statuses ?? []}
      tracking={parseFunnelTracking(funnel.theme)}
      orgGa={ctx.organization.ga_measurement_id ?? ""}
      publicUrl={publicUrl}
      orgSlug={ctx.organization.slug}
      tab={parseFunnelTab(tabParam)}
    />
  );
}
