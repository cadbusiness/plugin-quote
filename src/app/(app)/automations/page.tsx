import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrgContext, isAdminRole } from "@/lib/auth/org";
import { DataTable, ListPanel, ListToolbar } from "@/components/ui/list-panel";
import { saveAutomationDelay, toggleAutomation } from "@/app/(app)/crm-actions";

export default async function AutomationsPage() {
  const ctx = await getOrgContext();
  if (!ctx) redirect("/onboarding");
  if (!isAdminRole(ctx.role)) redirect("/devis");
  const supabase = await createClient();
  const { data: flows } = await supabase
    .from("automation_flows")
    .select("*")
    .eq("organization_id", ctx.organization.id)
    .order("delay_hours");

  return (
    <ListPanel>
      <ListToolbar />
      <DataTable headers={["Déclencheur", "Délai (h)", "Destinataire", "Template", "Actif"]}>
        {(flows ?? []).map((flow) => (
          <tr key={flow.id} className="border-b border-slate-100">
            <td className="px-4 py-2.5 lg:px-6">{flow.trigger}</td>
            <td className="px-4 py-2.5 lg:px-6">
              <form
                className="flex items-center gap-2"
                action={async (formData) => {
                  "use server";
                  await saveAutomationDelay(flow.id, Number(formData.get("hours")));
                }}
              >
                <input
                  name="hours"
                  type="number"
                  min={0}
                  defaultValue={flow.delay_hours}
                  className="w-20 border border-slate-200 px-2 py-1 text-sm"
                />
                <button className="text-sm underline">OK</button>
              </form>
            </td>
            <td className="px-4 py-2.5 lg:px-6">{flow.recipient}</td>
            <td className="px-4 py-2.5 lg:px-6">{flow.template_kind}</td>
            <td className="px-4 py-2.5 lg:px-6">
              <form
                action={async () => {
                  "use server";
                  await toggleAutomation(flow.id, !flow.active);
                }}
              >
                <button className="underline">{flow.active ? "Désactiver" : "Activer"}</button>
              </form>
            </td>
          </tr>
        ))}
      </DataTable>
    </ListPanel>
  );
}
