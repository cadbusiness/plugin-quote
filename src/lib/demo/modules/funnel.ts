import { DEMO_FUNNEL_ALIASES, DEMO_FUNNEL_SLUG } from "@/lib/demo/constants";
import { themeWithKind } from "@/lib/funnels/kind";
import { getFunnelTemplate, type TemplateStep } from "@/lib/funnels/templates";
import type { DemoClient, DemoFunnel, SeedContext, SeedModule } from "@/lib/demo/types";

async function insertSteps(supabase: DemoClient, orgId: string, funnelId: string, steps: TemplateStep[]) {
  const { data: created, error } = await supabase
    .from("wizard_steps")
    .insert(
      steps.map((step, index) => ({
        organization_id: orgId,
        configurator_id: funnelId,
        sort_order: index,
        title: step.title,
        subtitle: step.subtitle,
        screen_type: step.screen_type,
      })),
    )
    .select("id, sort_order");
  if (error) throw error;

  const questions = (created ?? []).flatMap((step) => {
    const source = steps[step.sort_order];
    return (source?.questions ?? []).map((question, index) => ({
      organization_id: orgId,
      step_id: step.id,
      key: question.key,
      label: question.label,
      help_text: question.help_text,
      type: question.type,
      required: question.required,
      sort_order: index,
      options: question.options,
    }));
  });
  if (questions.length) {
    const { error: questionError } = await supabase.from("wizard_questions").insert(questions);
    if (questionError) throw questionError;
  }
}

async function ensureSteps(ctx: SeedContext, funnel: DemoFunnel) {
  const { count } = await ctx.supabase
    .from("wizard_steps")
    .select("id", { count: "exact", head: true })
    .eq("configurator_id", funnel.id);
  if ((count ?? 0) > 0) return false;
  await insertSteps(ctx.supabase, ctx.org.id, funnel.id, getFunnelTemplate("racking").steps);
  return true;
}

export async function ensureDemoFunnel(ctx: SeedContext): Promise<{ funnel: DemoFunnel; created: boolean }> {
  const template = getFunnelTemplate("racking");
  for (const slug of DEMO_FUNNEL_ALIASES) {
    const { data } = await ctx.supabase
      .from("configurators")
      .select("*")
      .eq("organization_id", ctx.org.id)
      .eq("slug", slug)
      .maybeSingle();
    if (!data) continue;
    const { data: updated, error } = await ctx.supabase
      .from("configurators")
      .update({
        name: template.defaultName,
        slug: DEMO_FUNNEL_SLUG,
        sector: template.id,
        wizard_enabled: true,
        chat_enabled: true,
        is_active: true,
        theme: themeWithKind(
          data.theme && typeof data.theme === "object" ? data.theme : { accent: "#E85D04" },
          "form",
        ),
      })
      .eq("id", data.id)
      .select("*")
      .single();
    if (error || !updated) throw error ?? new Error("Impossible de mettre à jour le funnel démo");
    await ensureSteps(ctx, updated);
    return { funnel: updated, created: false };
  }

  const { data, error } = await ctx.supabase
    .from("configurators")
    .insert({
      organization_id: ctx.org.id,
      name: template.defaultName,
      slug: DEMO_FUNNEL_SLUG,
      sector: template.id,
      wizard_enabled: true,
      chat_enabled: true,
      is_active: true,
      theme: themeWithKind({ accent: "#E85D04" }, "form"),
    })
    .select("*")
    .single();
  if (error || !data) throw error ?? new Error("Impossible de créer le funnel démo");
  await insertSteps(ctx.supabase, ctx.org.id, data.id, template.steps);
  return { funnel: data, created: true };
}

export const funnelModule: SeedModule = {
  id: "funnel",
  title: "Funnel rayonnage",
  async run(ctx) {
    const { funnel, created } = await ensureDemoFunnel(ctx);
    ctx.funnel = funnel;
    return {
      module: "funnel",
      action: created ? "created" : "updated",
      detail: `${funnel.name} /c/${ctx.org.slug}/${funnel.slug}`,
    };
  },
};
