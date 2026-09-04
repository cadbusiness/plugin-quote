import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrgContext } from "@/lib/auth/org";
import { DataTable, ListPanel, ListToolbar } from "@/components/ui/list-panel";
import { Chip, scoreTone } from "@/components/ui/chip";
import { ClickableRow } from "@/components/ui/clickable-row";
import { QuoteProjectCell, QuoteReceivedCell } from "@/components/crm/quote-list-cells";
import { listQuotes, loadQuoteListExtras } from "@/lib/crm/quotes";
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
  const extras = await loadQuoteListExtras(supabase, quotes);

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
      <DataTable headers={["Prospect", "Projet", "Score", "Statut", "Reçue"]}>
        {quotes.map((quote) => {
          const status = quote.status_id ? statusById.get(quote.status_id) : undefined;
          const extra = extras.get(quote.id) ?? {
            itemCount: 0,
            firstName: null,
            priceMin: null,
            priceMax: null,
            opened: quote.status !== "new",
          };
          return (
            <ClickableRow
              key={quote.id}
              href={`/devis/${quote.id}`}
              className={extra.opened ? "" : "bg-orange-50/50"}
            >
              <td className="px-4 py-2.5 lg:px-6">
                <div className="font-medium text-slate-900">{quote.contact_name}</div>
                <div className="text-slate-500">{quote.contact_company ?? quote.contact_email}</div>
              </td>
              <QuoteProjectCell extras={extra} />
              <td className="px-4 py-2.5 lg:px-6">
                <Chip tone={scoreTone(quote.score_label)}>
                  {(quote.score_label ?? "—").toUpperCase()}
                  {quote.score != null ? ` ${quote.score}` : ""}
                </Chip>
              </td>
              <td className="px-4 py-2.5 lg:px-6" style={{ color: status?.color ?? "#64748b" }}>
                {status?.label ?? quote.status}
              </td>
              <QuoteReceivedCell createdAt={quote.created_at} extras={extra} />
            </ClickableRow>
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
