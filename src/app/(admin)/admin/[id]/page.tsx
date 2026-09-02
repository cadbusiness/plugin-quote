import Link from "next/link";
import { notFound } from "next/navigation";
import { DataTable, ListPanel, ListToolbar } from "@/components/ui/list-panel";
import { getPlatformOrg } from "@/lib/admin/orgs";
import { formatDate } from "@/lib/format";

export default async function AdminOrgPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const detail = await getPlatformOrg(id);
  if (!detail) notFound();
  const { org, members, quotes, configurators } = detail;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ListPanel>
        <ListToolbar>
          <Link href="/admin" className="mr-auto text-sm text-slate-600 hover:text-slate-900">
            ← Espaces
          </Link>
          <span className="text-sm text-slate-500">{org.name}</span>
        </ListToolbar>
        <div className="border-b border-slate-100 px-4 py-3 text-sm text-slate-600 lg:px-6">
          {org.slug} · {org.plan} · {configurators.length} configurateur{configurators.length > 1 ? "s" : ""}
        </div>
        <DataTable headers={["Membre", "Rôle", "Statut"]}>
          {members.map((member) => (
            <tr key={member.id} className="border-b border-slate-100">
              <td className="px-4 py-2.5 lg:px-6">{member.invited_email || member.user_id}</td>
              <td className="px-4 py-2.5 lg:px-6">{member.role}</td>
              <td className="px-4 py-2.5 text-slate-500 lg:px-6">{member.status}</td>
            </tr>
          ))}
        </DataTable>
        <div className="border-t border-slate-200 px-4 py-2 text-xs font-medium uppercase tracking-wide text-slate-500 lg:px-6">
          Derniers devis
        </div>
        <DataTable headers={["Prospect", "Score", "Date"]}>
          {quotes.map((quote) => (
            <tr key={quote.id} className="border-b border-slate-100">
              <td className="px-4 py-2.5 lg:px-6">
                <div className="font-medium">{quote.contact_name}</div>
                <div className="text-slate-500">{quote.contact_company}</div>
              </td>
              <td className="px-4 py-2.5 uppercase text-slate-500 lg:px-6">{quote.score_label}</td>
              <td className="px-4 py-2.5 text-slate-500 lg:px-6">{formatDate(quote.created_at)}</td>
            </tr>
          ))}
        </DataTable>
      </ListPanel>
    </div>
  );
}
