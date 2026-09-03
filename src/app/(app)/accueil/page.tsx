import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrgContext } from "@/lib/auth/org";
import { DataTable, ListPanel, ListToolbar } from "@/components/ui/list-panel";
import { formatDate } from "@/lib/format";
import { listQuotes } from "@/lib/crm/quotes";
import { getSidebarSnapshot } from "@/lib/crm/sidebar";

export default async function AccueilPage() {
  const ctx = await getOrgContext();
  if (!ctx) redirect("/onboarding");
  const supabase = await createClient();
  const [quotes, snapshot, { data: statuses }] = await Promise.all([
    listQuotes(supabase, ctx.organization.id, { limit: 8 }),
    getSidebarSnapshot(supabase, ctx.organization.id),
    supabase.from("quote_statuses").select("id, label, color").eq("organization_id", ctx.organization.id),
  ]);
  const statusById = new Map((statuses ?? []).map((s) => [s.id, s]));

  return (
    <ListPanel>
      <ListToolbar>
        <p className="mr-auto text-sm text-slate-500">
          {snapshot.monthQuotes} demandes ce mois · {snapshot.monthHot} hot · {snapshot.abandons} abandons
        </p>
        <Link href="/devis" className="text-sm underline">
          Pipeline
        </Link>
      </ListToolbar>
      <DataTable headers={["Prospect", "Score", "Statut", "Date", ""]}>
        {quotes.map((quote) => {
          const status = quote.status_id ? statusById.get(quote.status_id) : undefined;
          return (
            <tr key={quote.id} className="border-b border-slate-100 hover:bg-slate-50">
              <td className="px-4 py-2.5 lg:px-6">
                <div className="font-medium">{quote.contact_name}</div>
                <div className="text-slate-500">{quote.contact_company ?? quote.contact_email}</div>
              </td>
              <td className="px-4 py-2.5 text-xs uppercase text-slate-500 lg:px-6">
                {quote.score_label ?? "—"}
              </td>
              <td className="px-4 py-2.5 lg:px-6" style={{ color: status?.color ?? "#64748b" }}>
                {status?.label ?? quote.status}
              </td>
              <td className="px-4 py-2.5 text-slate-500 lg:px-6">{formatDate(quote.created_at)}</td>
              <td className="px-4 py-2.5 text-right lg:px-6">
                <Link href={`/devis/${quote.id}`} className="text-sm underline">
                  Voir
                </Link>
              </td>
            </tr>
          );
        })}
      </DataTable>
      {quotes.length === 0 ? (
        <p className="px-4 py-10 text-sm text-slate-500 lg:px-6">
          Aucune demande pour le moment. Partagez un funnel pour recevoir le premier dossier.
        </p>
      ) : null}
    </ListPanel>
  );
}
