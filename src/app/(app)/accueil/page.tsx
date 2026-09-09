import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrgContext } from "@/lib/auth/org";
import { DataTable, ListPanel, ListToolbar } from "@/components/ui/list-panel";
import { Chip, scoreTone, statusTone } from "@/components/ui/chip";
import { ClickableRow } from "@/components/ui/clickable-row";
import { QuoteProjectCell, QuoteReceivedCell } from "@/components/crm/quote-list-cells";
import { listQuotes, loadQuoteListExtras } from "@/lib/crm/quotes";
import { getSidebarSnapshot } from "@/lib/crm/sidebar";

function Kpi({
  label,
  value,
  hint,
  href,
  valueClass,
  last,
}: {
  label: string;
  value: number;
  hint: string;
  href: string;
  valueClass?: string;
  last?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`block px-4 py-5 hover:bg-orange-50/40 lg:px-6 ${last ? "" : "border-r border-slate-200"}`}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-1 text-3xl font-semibold tabular-nums tracking-tight ${valueClass ?? "text-slate-900"}`}>
        {value}
      </p>
      <p className="mt-1 text-sm text-slate-500">{hint}</p>
    </Link>
  );
}

export default async function AccueilPage() {
  const ctx = await getOrgContext();
  if (!ctx) redirect("/onboarding");
  const supabase = await createClient();
  const [quotes, snapshot, { data: statuses }] = await Promise.all([
    listQuotes(supabase, ctx.organization.id, { limit: 8 }),
    getSidebarSnapshot(supabase, ctx.organization.id),
    supabase.from("quote_statuses").select("id, label, slug").eq("organization_id", ctx.organization.id),
  ]);
  const statusById = new Map((statuses ?? []).map((s) => [s.id, s]));
  const newStatusId = (statuses ?? []).find((s) => s.slug === "new")?.id;
  const extras = await loadQuoteListExtras(supabase, quotes);
  const ranked = [...quotes].sort((a, b) => {
    const aOpen = extras.get(a.id)?.opened ?? true;
    const bOpen = extras.get(b.id)?.opened ?? true;
    if (aOpen === bOpen) return 0;
    return aOpen ? 1 : -1;
  });

  return (
    <ListPanel>
      <ListToolbar>
        <p className="mr-auto text-sm text-slate-500">
          {snapshot.newQuotes
            ? `${snapshot.newQuotes} nouveau${snapshot.newQuotes > 1 ? "x" : ""} à traiter ce mois`
            : "Aucune nouvelle demande ce mois"}
        </p>
        <Link
          href="/devis"
          className="rounded-md bg-[#E85D04] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#D45203]"
        >
          Toutes les demandes
        </Link>
      </ListToolbar>

      <div className="grid grid-cols-2 border-b border-slate-200 lg:grid-cols-4">
        <Kpi label="Demandes" value={snapshot.monthQuotes} hint="Reçues ce mois" href="/devis" />
        <Kpi
          label="Nouveaux"
          value={snapshot.newQuotes}
          hint="Pas encore contactés"
          href={newStatusId ? `/devis?status=${newStatusId}` : "/devis"}
          valueClass="text-[#C2410C]"
        />
        <Kpi
          label="Hot"
          value={snapshot.monthHot}
          hint="À relancer en priorité"
          href="/devis?score=hot"
          valueClass="text-rose-700"
        />
        <Kpi
          label="Abandons"
          value={snapshot.abandons}
          hint="Paniers avec email"
          href="/sessions"
          valueClass="text-amber-800"
          last
        />
      </div>

      <section>
        <div className="border-b border-slate-100 px-4 py-3 lg:px-6">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Dernières demandes</p>
          <p className="mt-0.5 text-sm text-slate-500">
            {quotes.length
              ? "Les dossiers à ouvrir d’abord, puis les plus récents."
              : "Partagez un funnel pour recevoir le premier dossier."}
          </p>
        </div>
        {quotes.length === 0 ? (
          <p className="px-4 py-10 text-sm text-slate-500 lg:px-6">
            Aucune demande pour le moment.{" "}
            <Link href="/funnels" className="font-medium text-[#E85D04] hover:underline">
              Ouvrir les funnels
            </Link>
          </p>
        ) : (
          <DataTable headers={["Prospect", "Projet", "Score", "Statut", "Reçue"]}>
            {ranked.map((quote) => {
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
                  <td className="px-4 py-2.5 lg:px-6">
                    <Chip tone={statusTone(status?.slug ?? quote.status)}>{status?.label ?? quote.status}</Chip>
                  </td>
                  <QuoteReceivedCell createdAt={quote.created_at} extras={extra} />
                </ClickableRow>
              );
            })}
          </DataTable>
        )}
      </section>
    </ListPanel>
  );
}
