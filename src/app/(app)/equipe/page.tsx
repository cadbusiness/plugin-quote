import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrgContext, isAdminRole } from "@/lib/auth/org";
import { DataTable, ListPanel, ListToolbar } from "@/components/ui/list-panel";
import { inviteMember, updateMemberRole } from "@/app/(app)/crm-actions";
import { formatDate } from "@/lib/format";

export default async function EquipePage() {
  const ctx = await getOrgContext();
  if (!ctx) redirect("/onboarding");
  if (!isAdminRole(ctx.role)) redirect("/devis");
  const supabase = await createClient();
  const { data: members } = await supabase
    .from("memberships")
    .select("*")
    .eq("organization_id", ctx.organization.id)
    .order("created_at");

  return (
    <ListPanel>
      <ListToolbar>
        <form action={inviteMember} className="mr-auto flex flex-wrap gap-2">
          <input
            name="email"
            type="email"
            required
            placeholder="email@equipe.com"
            className="rounded-md border border-slate-200 px-3 py-1.5 text-sm"
          />
          <select name="role" className="rounded-md border border-slate-200 px-2 py-1.5 text-sm">
            <option value="sales">Commercial</option>
            <option value="admin">Admin</option>
          </select>
          <button className="rounded-md bg-slate-950 px-3 py-1.5 text-sm text-white">Inviter</button>
        </form>
      </ListToolbar>
      <DataTable headers={["Email / rôle", "Statut", "Depuis", ""]}>
        {(members ?? []).map((m) => (
          <tr key={m.id} className="border-b border-slate-100">
            <td className="px-4 py-2.5 lg:px-6">
              <div className="font-medium">{m.invited_email || m.role}</div>
              <div className="text-xs text-slate-500">{m.role}</div>
            </td>
            <td className="px-4 py-2.5 lg:px-6">{m.status}</td>
            <td className="px-4 py-2.5 text-slate-500 lg:px-6">{formatDate(m.created_at)}</td>
            <td className="px-4 py-2.5 text-right lg:px-6">
              {m.role !== "owner" ? (
                <form
                  action={async (formData) => {
                    "use server";
                    await updateMemberRole(m.id, String(formData.get("role")));
                  }}
                >
                  <select name="role" defaultValue={m.role} className="border border-slate-200 px-2 py-1 text-sm">
                    <option value="admin">Admin</option>
                    <option value="sales">Commercial</option>
                  </select>
                  <button className="ml-2 text-sm underline">OK</button>
                </form>
              ) : (
                "Owner"
              )}
            </td>
          </tr>
        ))}
      </DataTable>
    </ListPanel>
  );
}
