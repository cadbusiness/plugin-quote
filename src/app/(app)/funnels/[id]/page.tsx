import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrgContext, isAdminRole } from "@/lib/auth/org";
import { ListPanel, ListToolbar } from "@/components/ui/list-panel";
import { saveFunnel, updateQuestion } from "@/app/(app)/actions";
import { saveStepOrder } from "@/app/(app)/wizard/reorder-action";
import { WizardDnd } from "@/components/dashboard/wizard-dnd";

export default async function FunnelEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const ctx = await getOrgContext();
  if (!ctx) redirect("/onboarding");
  if (!isAdminRole(ctx.role)) redirect("/devis");
  const { id } = await params;
  const supabase = await createClient();
  const { data: funnel } = await supabase
    .from("configurators")
    .select("*")
    .eq("id", id)
    .eq("organization_id", ctx.organization.id)
    .maybeSingle();
  if (!funnel) notFound();

  const [{ data: steps }, { data: questions }] = await Promise.all([
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
  ]);

  const stepIds = new Set((steps ?? []).map((s) => s.id));
  const funnelQuestions = (questions ?? []).filter((q) => stepIds.has(q.step_id));
  const publicHref = `/c/${ctx.organization.slug}/${funnel.slug}`;

  return (
    <ListPanel>
      <ListToolbar>
        <form action={saveFunnel} className="mr-auto flex flex-wrap items-center gap-3">
          <input type="hidden" name="id" value={funnel.id} />
          <input
            name="name"
            defaultValue={funnel.name}
            className="rounded-md border border-slate-200 px-3 py-1.5 text-sm"
          />
          <label className="flex items-center gap-1.5 text-sm text-slate-600">
            <input type="checkbox" name="wizard_enabled" defaultChecked={funnel.wizard_enabled} />
            Funnel
          </label>
          <label className="flex items-center gap-1.5 text-sm text-slate-600">
            <input type="checkbox" name="chat_enabled" defaultChecked={funnel.chat_enabled} />
            Chat IA
          </label>
          <label className="flex items-center gap-1.5 text-sm text-slate-600">
            <input type="checkbox" name="is_active" defaultChecked={funnel.is_active} />
            Actif
          </label>
          <button className="rounded-md border border-slate-200 px-3 py-1.5 text-sm">Enregistrer</button>
        </form>
        <Link href={publicHref} target="_blank" className="text-sm underline">
          Aperçu
        </Link>
        <Link href="/funnels" className="text-sm underline">
          Tous les funnels
        </Link>
      </ListToolbar>
      <WizardDnd
        steps={steps ?? []}
        questions={funnelQuestions}
        saveOrder={saveStepOrder}
        saveQuestionAction={updateQuestion}
      />
    </ListPanel>
  );
}
