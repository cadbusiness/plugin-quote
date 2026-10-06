import type { SupabaseClient } from "@supabase/supabase-js";
import type { QuestionMeta } from "@/lib/crm/answers";
import type { Database } from "@/lib/db/database.types";
import type { QuestionOptions } from "@/lib/wizard/types";

export async function loadConfiguratorQuestionMeta(
  supabase: SupabaseClient<Database>,
  configuratorId: string,
): Promise<QuestionMeta[]> {
  const { data: steps } = await supabase.from("wizard_steps").select("id").eq("configurator_id", configuratorId);
  const ids = (steps ?? []).map((step) => step.id);
  if (!ids.length) return [];
  const { data: questions } = await supabase
    .from("wizard_questions")
    .select("key, label, type, options")
    .in("step_id", ids);
  return (questions ?? []).map((question) => ({
    key: question.key,
    label: question.label,
    type: question.type,
    options: (question.options ?? {}) as QuestionOptions,
  }));
}
