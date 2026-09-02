import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrgContext, isAdminRole } from "@/lib/auth/org";
import { DataTable, ListPanel, ListToolbar } from "@/components/ui/list-panel";
import { saveWebhook, toggleWebhook } from "@/app/(app)/actions";
import { formatDate } from "@/lib/format";

export default async function WebhooksPage() {
  const ctx = await getOrgContext();
  if (!ctx) redirect("/onboarding");
  if (!isAdminRole(ctx.role)) redirect("/devis");
  const supabase = await createClient();
  const { data: hooks } = await supabase
    .from("webhooks")
    .select("*")
    .eq("organization_id", ctx.organization.id)
    .order("created_at", { ascending: false });
  const { data: deliveries } = await supabase
    .from("webhook_deliveries")
    .select("*")
    .eq("organization_id", ctx.organization.id)
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <ListPanel>
      <ListToolbar />
      <form action={saveWebhook} className="flex flex-wrap gap-2 border-b border-slate-200 px-4 py-4 lg:px-6">
        <input
          name="url"
          required
          placeholder="https://crm.example.com/hooks/quotes"
          className="min-w-64 flex-1 border border-slate-200 px-3 py-2 text-sm"
        />
        <input
          name="secret"
          required
          placeholder="Secret HMAC"
          className="w-56 border border-slate-200 px-3 py-2 text-sm"
        />
        <button className="rounded-md bg-slate-950 px-3 py-2 text-sm text-white">Ajouter</button>
      </form>
      <div className="px-4 py-4 lg:px-6">
        <h2 className="mb-3 text-sm font-medium text-slate-500">Endpoints</h2>
        <ul className="space-y-2 text-sm">
          {(hooks ?? []).map((hook) => (
            <li key={hook.id} className="flex items-center justify-between gap-4">
              <span className="truncate">{hook.url}</span>
              <form
                action={async () => {
                  "use server";
                  await toggleWebhook(hook.id, !hook.is_active);
                }}
              >
                <button className="underline">{hook.is_active ? "Désactiver" : "Activer"}</button>
              </form>
            </li>
          ))}
        </ul>
      </div>
      <ListToolbar />
      <DataTable headers={["Date", "Statut", "HTTP", "Erreur"]}>
        {(deliveries ?? []).map((d) => (
          <tr key={d.id} className="border-b border-slate-100">
            <td className="px-4 py-2.5 lg:px-6">{formatDate(d.created_at)}</td>
            <td className="px-4 py-2.5 lg:px-6">{d.status}</td>
            <td className="px-4 py-2.5 lg:px-6">{d.status_code ?? "—"}</td>
            <td className="px-4 py-2.5 text-slate-500 lg:px-6">{d.last_error ?? ""}</td>
          </tr>
        ))}
      </DataTable>
    </ListPanel>
  );
}
