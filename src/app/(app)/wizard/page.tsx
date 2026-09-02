import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrgContext } from "@/lib/auth/org";
import { ListPanel, ListToolbar } from "@/components/ui/list-panel";
import { updateQuestion } from "@/app/(app)/actions";
import { saveStepOrder } from "@/app/(app)/wizard/reorder-action";
import { WizardDnd } from "@/components/dashboard/wizard-dnd";

export default async function WizardAdminPage() {
  const ctx = await getOrgContext();
  if (!ctx) redirect("/onboarding");
  const supabase = await createClient();
  const { data: steps } = await supabase
    .from("wizard_steps")
    .select("*")
    .eq("organization_id", ctx.organization.id)
    .order("sort_order", { ascending: true });
  const { data: questions } = await supabase
    .from("wizard_questions")
    .select("*")
    .eq("organization_id", ctx.organization.id)
    .order("sort_order", { ascending: true });

  return (
    <ListPanel>
      <ListToolbar />
      <WizardDnd
        steps={steps ?? []}
        questions={questions ?? []}
        saveOrder={saveStepOrder}
        saveQuestionAction={updateQuestion}
      />
    </ListPanel>
  );
}
