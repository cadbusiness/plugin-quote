import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrgContext } from "@/lib/auth/org";
import { DataTable, ListPanel, ListToolbar } from "@/components/ui/list-panel";
import { Chip, scoreTone } from "@/components/ui/chip";
import { ClickableRow } from "@/components/ui/clickable-row";
import { formatDate } from "@/lib/format";
import { csvQuery, listQuotes } from "@/lib/crm/quotes";

export default async function QuotesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; assigned?: string; score?: string; from?: string; to?: string }>;
}) {
  const ctx = await getOrgContext();
  if (!ctx) redirect("/onboarding");
  const filters = await searchParams;
  const supabase = await createClient();
  const [{ data: statuses }, { data: members }, quotes] = await Promise.all([
    supabase.from("quote_statuses").select("*").eq("organization_id", ctx.organization.id).order("position"),
    supabase.from("memberships").select("*").eq("organization_id", ctx.organization.id).eq("status", "active"),
    listQuotes(supabase, ctx.organization.id, { ...filters, limit: 150 }),
  ]);
  const statusById = new Map((statuses ?? []).map((s) => [s.id, s]));
  const memberLabel = new Map(
    (members ?? []).map((m) => [m.user_id ?? "", m.invited_email || m.role]),
  );
  const { data: assigneeRows } = quotes.length
    ? await supabase.from("quote_assignees").select("quote_id, user_id").in("quote_id", quotes.map((quote) => quote.id))
    : { data: [] };
  const assigneesByQuote = new Map<string, string[]>();
  for (const row of assigneeRows ?? []) {
    const labels = assigneesByQuote.get(row.quote_id) ?? [];
    labels.push(memberLabel.get(row.user_id) ?? "Commercial");
    assigneesByQuote.set(row.quote_id, labels);
  }

  return (
    <ListPanel>
      <ListToolbar>
        <form className="mr-auto flex flex-wrap items-center gap-2">
          <input
            name="q"
            defaultValue={filters.q}
            placeholder="Rechercher…"
            className="rounded-md border border-slate-200 px-3 py-1.5 text-sm"
          />
          <select name="status" defaultValue={filters.status ?? ""} className="rounded-md border border-slate-200 px-2 py-1.5 text-sm">
            <option value="">Tous statuts</option>
            {(statuses ?? []).map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
          <select name="assigned" defaultValue={filters.assigned ?? ""} className="rounded-md border border-slate-200 px-2 py-1.5 text-sm">
            <option value="">Tous assignés</option>
            <option value="none">Non assigné</option>
            {(members ?? [])
              .filter((m) => m.user_id)
              .map((m) => (
                <option key={m.id} value={m.user_id!}>
                  {m.invited_email || m.role}
                </option>
              ))}
          </select>
          <select name="score" defaultValue={filters.score ?? ""} className="rounded-md border border-slate-200 px-2 py-1.5 text-sm">
            <option value="">Tous scores</option>
            <option value="hot">Hot</option>
            <option value="warm">Warm</option>
            <option value="cold">Cold</option>
          </select>
          <input type="date" name="from" defaultValue={filters.from} className="rounded-md border border-slate-200 px-2 py-1.5 text-sm" />
          <input type="date" name="to" defaultValue={filters.to} className="rounded-md border border-slate-200 px-2 py-1.5 text-sm" />
          <button className="rounded-md border border-slate-200 px-3 py-1.5 text-sm">Filtrer</button>
        </form>
        <Link href={csvQuery(filters)} className="rounded-md bg-slate-950 px-3 py-1.5 text-sm text-white">
          Export CSV
        </Link>
      </ListToolbar>
      <DataTable headers={["Prospect", "Score", "Statut", "Assigné à", "Date"]}>
        {quotes.map((quote) => {
          const status = quote.status_id ? statusById.get(quote.status_id) : undefined;
          return (
            <ClickableRow key={quote.id} href={`/devis/${quote.id}`}>
              <td className="px-4 py-2.5 lg:px-6">
                <div className="font-medium">{quote.contact_name}</div>
                <div className="text-slate-500">{quote.contact_company ?? quote.contact_email}</div>
              </td>
              <td className="px-4 py-2.5 lg:px-6">
                <Chip tone={scoreTone(quote.score_label)}>
                  {(quote.score_label ?? "—").toUpperCase()}
                  {quote.score != null ? ` ${quote.score}` : ""}
                </Chip>
              </td>
              <td className="px-4 py-2.5 lg:px-6">
                <span
                  className="inline-flex items-center gap-1.5 text-sm"
                  style={{ color: status?.color ?? "#64748b" }}
                >
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: status?.color ?? "#64748b" }} />
                  {status?.label ?? quote.status}
                </span>
              </td>
              <td className="px-4 py-2.5 text-slate-500 lg:px-6">
                {(assigneesByQuote.get(quote.id) ?? (quote.assigned_to ? [memberLabel.get(quote.assigned_to) ?? "—"] : [])).join(", ") || "—"}
              </td>
              <td className="px-4 py-2.5 text-slate-500 lg:px-6">{formatDate(quote.created_at)}</td>
            </ClickableRow>
          );
        })}
      </DataTable>
      {quotes.length === 0 ? (
        <p className="px-4 py-10 text-sm text-slate-500 lg:px-6">Aucun devis pour le moment.</p>
      ) : null}
    </ListPanel>
  );
}
