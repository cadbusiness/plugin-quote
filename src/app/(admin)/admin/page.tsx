import Link from "next/link";
import { DataTable, ListPanel, ListToolbar } from "@/components/ui/list-panel";
import { listPlatformOrgs } from "@/lib/admin/orgs";
import { formatDate } from "@/lib/format";

export default async function AdminPage() {
  const orgs = await listPlatformOrgs();

  return (
    <ListPanel>
      <ListToolbar>
        <p className="mr-auto text-sm text-slate-500">{orgs.length} espace{orgs.length > 1 ? "s" : ""}</p>
      </ListToolbar>
      <DataTable headers={["Espace", "Slug", "Plan", "Membres", "Devis", "Créé", ""]}>
        {orgs.map((org) => (
          <tr key={org.id} className="border-b border-slate-100 hover:bg-slate-50">
            <td className="px-4 py-2.5 font-medium lg:px-6">{org.name}</td>
            <td className="px-4 py-2.5 text-slate-500 lg:px-6">{org.slug}</td>
            <td className="px-4 py-2.5 text-slate-500 lg:px-6">{org.plan}</td>
            <td className="px-4 py-2.5 lg:px-6">{org.members}</td>
            <td className="px-4 py-2.5 lg:px-6">{org.quotes}</td>
            <td className="px-4 py-2.5 text-slate-500 lg:px-6">{formatDate(org.created_at)}</td>
            <td className="px-4 py-2.5 lg:px-6">
              <Link href={`/admin/${org.id}`} className="text-sm text-slate-900 underline">
                Ouvrir
              </Link>
            </td>
          </tr>
        ))}
      </DataTable>
    </ListPanel>
  );
}
