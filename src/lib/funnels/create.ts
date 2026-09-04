import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/db/database.types";
import type { ScreenType } from "@/lib/wizard/types";
import { uniqueSlug } from "@/lib/org/slug";
import { getFunnelTemplate, type TemplateStep } from "@/lib/funnels/templates";

export type CreateFunnelInput = {
  name: string;
  sector: string;
  wizardEnabled: boolean;
  chatEnabled: boolean;
  screens: ScreenType[];
  catalogFromId: string | null;
};

const ALL_SCREENS: ScreenType[] = ["questions", "suggestions", "customize", "contact"];

export function parseCreateFunnelForm(formData: FormData): CreateFunnelInput | null {
  const name = String(formData.get("name") ?? "").trim();
  if (name.length < 2) return null;
  const sector = String(formData.get("sector") ?? "general");
  const kind = String(formData.get("kind") ?? "form") === "chat" ? "chat" : "form";
  const wizardEnabled = kind === "form";
  const chatEnabled = kind === "chat";
  const picked = formData.getAll("screens").map(String);
  const screens = (picked.length ? picked : ["questions", "contact"]).filter((s): s is ScreenType =>
    (ALL_SCREENS as readonly string[]).includes(s),
  );
  if (!screens.includes("contact")) screens.push("contact");
  const catalogFrom = String(formData.get("catalog_from") ?? "").trim();
  return {
    name,
    sector,
    wizardEnabled,
    chatEnabled,
    screens,
    catalogFromId: catalogFrom || null,
  };
}

export async function insertFunnelFromTemplate(
  supabase: SupabaseClient<Database>,
  organizationId: string,
  input: CreateFunnelInput,
) {
  const template = getFunnelTemplate(input.sector);
  const slug = await uniqueSlug(async (candidate) => {
    const { data } = await supabase
      .from("configurators")
      .select("id")
      .eq("organization_id", organizationId)
      .eq("slug", candidate)
      .maybeSingle();
    return Boolean(data);
  }, input.name);

  const { data: funnel, error } = await supabase
    .from("configurators")
    .insert({
      organization_id: organizationId,
      name: input.name,
      slug,
      sector: template.id,
      wizard_enabled: input.wizardEnabled,
      chat_enabled: input.chatEnabled,
    })
    .select("id")
    .single();
  if (error || !funnel) return null;

  const planned = pickSteps(template.steps, input.screens);
  const { data: steps } = await supabase
    .from("wizard_steps")
    .insert(
      planned.map((step, index) => ({
        organization_id: organizationId,
        configurator_id: funnel.id,
        sort_order: index,
        title: step.title,
        subtitle: step.subtitle,
        screen_type: step.screen_type,
      })),
    )
    .select("id, sort_order");

  const questions = (steps ?? []).flatMap((step) => {
    const source = planned[step.sort_order];
    return (source?.questions ?? []).map((q, index) => ({
      organization_id: organizationId,
      step_id: step.id,
      key: q.key,
      label: q.label,
      help_text: q.help_text,
      type: q.type,
      required: q.required,
      sort_order: index,
      options: q.options,
    }));
  });
  if (questions.length) {
    await supabase.from("wizard_questions").insert(questions);
  }

  if (input.catalogFromId) {
    const { data: products } = await supabase
      .from("products")
      .select("name, description, image_url, price_min, price_max, currency, tags, options, sku, category, is_active")
      .eq("organization_id", organizationId)
      .eq("configurator_id", input.catalogFromId);
    if (products?.length) {
      await supabase.from("products").insert(
        products.map((product) => ({
          ...product,
          organization_id: organizationId,
          configurator_id: funnel.id,
        })),
      );
    }
  }

  return funnel;
}

function pickSteps(steps: TemplateStep[], screens: ScreenType[]) {
  const wanted = new Set(screens);
  const picked = steps.filter((step) => wanted.has(step.screen_type));
  if (picked.length) return picked;
  return steps.filter((step) => step.screen_type === "questions" || step.screen_type === "contact");
}
