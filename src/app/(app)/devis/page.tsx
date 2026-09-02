import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getOrgContext } from "@/lib/auth/org";
import { DataTable, ListPanel, ListToolbar } from "@/components/ui/list-panel";
import { formatDate } from "@/lib/format";
import { redirect } from "next/navigation";

export default async function QuotesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const ctx = await getOrgContext();
  if (!ctx) redirect("/login");
  const { status, q } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("quotes")
    .select("*")
    .eq("organization_id", ctx.organization.id)
    .order("created_at", { ascending: false });
  if (status) query = query.eq("status", status);
  if (q) query = query.or(`contact_name.ilike.%${q}%,contact_email.ilike.%${q}%,contact_company.ilike.%${q}%`);

  const { data: quotes } = await query;

  return (
    <ListPanel>
      <ListToolbar>
        <form className="flex gap-2">
          <input
            name="q"
            defaultValue={q}
            placeholder="Rechercher…"
            className="rounded-md border border-slate-200 px-3 py-1.5 text-sm"
          />
          <select
            name="status"
            defaultValue={status ?? ""}
            className="rounded-md border border-slate-200 px-2 py-1.5 text-sm"
          >
            <option value="">Tous</option>
            <option value="new">Nouveau</option>
            <option value="contacted">Contacté</option>
            <option value="won">Gagné</option>
            <option value="lost">Perdu</option>
          </select>
          <button className="rounded-md border border-slate-200 px-3 py-1.5 text-sm">Filtrer</button>
        </form>
        <Link href="/devis.csv" className="rounded-md bg-slate-950 px-3 py-1.5 text-sm text-white">
          Export CSV
        </Link>
      </ListToolbar>
      <DataTable headers={["Date", "Prospect", "Société", "Score", "Statut", ""]}>
        {(quotes ?? []).map((quote) => (
          <tr key={quote.id} className="border-b border-slate-100 hover:bg-slate-50">
            <td className="px-5 py-3 text-slate-500">{formatDate(quote.created_at)}</td>
            <td className="px-5 py-3">
              <div className="font-medium">{quote.contact_name}</div>
              <div className="text-slate-500">{quote.contact_email}</div>
            </td>
            <td className="px-5 py-3">{quote.contact_company ?? "—"}</td>
            <td className="px-5 py-3">
              {quote.score ?? "—"}{" "}
              <span className="uppercase text-xs text-slate-500">{quote.score_label}</span>
            </td>
            <td className="px-5 py-3">{quote.status}</td>
            <td className="px-5 py-3 text-right">
              <Link href={`/devis/${quote.id}`} className="text-sm underline">
                Voir
              </Link>
            </td>
          </tr>
        ))}
      </DataTable>
      {(quotes ?? []).length === 0 ? (
        <p className="px-5 py-10 text-sm text-slate-500">Aucun devis pour le moment.</p>
      ) : null}
    </ListPanel>
  );
}
