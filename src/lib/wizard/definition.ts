import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/lib/db/database.types";
import type {
  ConfiguratorDefinition,
  Product,
  ProductOption,
  QuestionOptions,
  QuestionType,
  ScreenType,
  WizardQuestion,
} from "@/lib/wizard/types";

function asRecord(value: Json): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

function mapProduct(row: Database["public"]["Tables"]["products"]["Row"]): Product {
  const options = Array.isArray(row.options) ? (row.options as ProductOption[]) : [];
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    imageUrl: row.image_url,
    priceMin: row.price_min,
    priceMax: row.price_max,
    currency: row.currency,
    tags: row.tags ?? [],
    options,
  };
}

export async function loadDefinition(
  supabase: SupabaseClient<Database>,
  orgSlug: string,
  configuratorSlug: string,
): Promise<ConfiguratorDefinition | null> {
  const { data: org } = await supabase
    .from("organizations")
    .select("*")
    .eq("slug", orgSlug)
    .maybeSingle();
  if (!org) return null;

  const { data: configurator } = await supabase
    .from("configurators")
    .select("*")
    .eq("organization_id", org.id)
    .eq("slug", configuratorSlug)
    .eq("is_active", true)
    .maybeSingle();
  if (!configurator) return null;

  const { data: steps } = await supabase
    .from("wizard_steps")
    .select("*")
    .eq("configurator_id", configurator.id)
    .order("sort_order", { ascending: true });

  const stepIds = (steps ?? []).map((s) => s.id);
  const { data: questions } = stepIds.length
    ? await supabase
        .from("wizard_questions")
        .select("*")
        .in("step_id", stepIds)
        .order("sort_order", { ascending: true })
    : { data: [] };

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("configurator_id", configurator.id)
    .eq("is_active", true);

  const questionsByStep = new Map<string, WizardQuestion[]>();
  for (const q of questions ?? []) {
    const list = questionsByStep.get(q.step_id) ?? [];
    list.push({
      id: q.id,
      key: q.key,
      label: q.label,
      helpText: q.help_text,
      type: q.type as QuestionType,
      required: q.required,
      sortOrder: q.sort_order,
      options: asRecord(q.options) as QuestionOptions,
    });
    questionsByStep.set(q.step_id, list);
  }

  return {
    organization: {
      id: org.id,
      name: org.name,
      slug: org.slug,
      salesEmail: org.sales_email,
      salesName: org.sales_name,
      salesPhone: org.sales_phone,
      branding: asRecord(org.branding),
    },
    configurator: {
      id: configurator.id,
      name: configurator.name,
      slug: configurator.slug,
      sector: configurator.sector,
      wizardEnabled: configurator.wizard_enabled,
      chatEnabled: configurator.chat_enabled,
      theme: asRecord(configurator.theme),
    },
    steps: (steps ?? []).map((s) => ({
      id: s.id,
      title: s.title,
      subtitle: s.subtitle,
      screenType: s.screen_type as ScreenType,
      sortOrder: s.sort_order,
      questions: questionsByStep.get(s.id) ?? [],
    })),
    products: (products ?? []).map(mapProduct),
  };
}

export function mapProductRow(row: Database["public"]["Tables"]["products"]["Row"]) {
  return mapProduct(row);
}
