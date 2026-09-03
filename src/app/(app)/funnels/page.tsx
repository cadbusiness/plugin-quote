import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrgContext, isAdminRole } from "@/lib/auth/org";
import { DataTable, ListPanel, ListToolbar } from "@/components/ui/list-panel";
import { createFunnel } from "@/app/(app)/actions";

export default async function FunnelsPage() {
  const ctx = await getOrgContext();
  if (!ctx) redirect("/onboarding");
  if (!isAdminRole(ctx.role)) redirect("/devis");
  const supabase = await createClient();
  const { data: funnels } = await supabase
    .from("configurators")
    .select("id, name, slug, wizard_enabled, chat_enabled, is_active")
    .eq("organization_id", ctx.organization.id)
    .order("created_at", { ascending: false });

  return (
    <ListPanel>
      <ListToolbar>
        <form action={createFunnel} className="mr-auto flex items-center gap-2">
          <input
            name="name"
            required
            minLength={2}
            placeholder="Cuisine résidentielle"
            className="rounded-md border border-slate-200 px-3 py-1.5 text-sm"
          />
          <button className="rounded-md bg-slate-950 px-3 py-1.5 text-sm text-white">Créer un funnel</button>
        </form>
      </ListToolbar>
      <DataTable headers={["Funnel", "Modes", "Lien public", ""]}>
        {(funnels ?? []).map((funnel) => {
          const modes = [
            funnel.wizard_enabled ? "Funnel" : null,
            funnel.chat_enabled ? "Chat IA" : null,
          ]
            .filter(Boolean)
            .join(" + ");
          const href = `/c/${ctx.organization.slug}/${funnel.slug}`;
          return (
            <tr key={funnel.id} className="border-b border-slate-100 hover:bg-slate-50">
              <td className="px-4 py-2.5 lg:px-6">
                <div className="font-medium">{funnel.name}</div>
                <div className="text-xs text-slate-500">{funnel.is_active ? "Actif" : "Brouillon"}</div>
              </td>
              <td className="px-4 py-2.5 text-slate-500 lg:px-6">{modes || "—"}</td>
              <td className="px-4 py-2.5 lg:px-6">
                <Link href={href} className="text-sm underline" target="_blank">
                  {href}
                </Link>
              </td>
              <td className="px-4 py-2.5 text-right lg:px-6">
                <Link href={`/funnels/${funnel.id}`} className="text-sm underline">
                  Éditer
                </Link>
              </td>
            </tr>
          );
        })}
      </DataTable>
      {(funnels ?? []).length === 0 ? (
        <p className="px-4 py-10 text-sm text-slate-500 lg:px-6">
          Créez un premier funnel — une séquence de steps branchée sur votre catalogue.
        </p>
      ) : null}
    </ListPanel>
  );
}
