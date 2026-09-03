import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrgContext, isAdminRole } from "@/lib/auth/org";
import { ListPanel, ListToolbar } from "@/components/ui/list-panel";
import { saveGaMeasurementId } from "@/app/(app)/crm-actions";

export default async function StatsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const ctx = await getOrgContext();
  if (!ctx) redirect("/onboarding");
  const { range = "month" } = await searchParams;
  const days = range === "day" ? 1 : range === "week" ? 7 : 30;
  const since = new Date(Date.now() - days * 86400000).toISOString();
  const supabase = await createClient();

  const [{ data: quotes }, { data: statuses }, { data: events }, { data: configurators }, { data: activities }] =
    await Promise.all([
      supabase
        .from("quotes")
        .select("id, status_id, status, score_label, configurator_id, created_at")
        .eq("organization_id", ctx.organization.id)
        .gte("created_at", since),
      supabase.from("quote_statuses").select("id, label, slug").eq("organization_id", ctx.organization.id),
      supabase
        .from("analytics_events")
        .select("event_type")
        .eq("organization_id", ctx.organization.id)
        .gte("created_at", since),
      supabase.from("configurators").select("id, name").eq("organization_id", ctx.organization.id),
      supabase
        .from("quote_activities")
        .select("quote_id, created_at")
        .eq("organization_id", ctx.organization.id)
        .eq("type", "status_changed")
        .gte("created_at", since),
    ]);

  const list = quotes ?? [];
  const statusMap = new Map((statuses ?? []).map((s) => [s.id, s]));
  const byStatus = new Map<string, number>();
  for (const q of list) {
    const label = (q.status_id && statusMap.get(q.status_id)?.label) || q.status;
    byStatus.set(label, (byStatus.get(label) ?? 0) + 1);
  }
  const hot = list.filter((q) => q.score_label === "hot").length;
  const warm = list.filter((q) => q.score_label === "warm").length;
  const cold = list.filter((q) => q.score_label === "cold").length;
  const won = list.filter((q) => statusMap.get(q.status_id ?? "")?.slug === "won").length;
  const contacted = list.filter((q) =>
    ["contacted", "in_progress", "won"].includes(statusMap.get(q.status_id ?? "")?.slug ?? q.status),
  ).length;
  const conversion = list.length ? Math.round((won / list.length) * 100) : 0;
  const contactedRate = list.length ? Math.round((contacted / list.length) * 100) : 0;

  const quotesById = new Map(list.map((q) => [q.id, q]));
  const firstChange = new Map<string, number>();
  for (const a of activities ?? []) {
    if (firstChange.has(a.quote_id)) continue;
    const quote = quotesById.get(a.quote_id);
    if (quote) {
      firstChange.set(
        a.quote_id,
        (new Date(a.created_at).getTime() - new Date(quote.created_at).getTime()) / 3600000,
      );
    }
  }
  const delays = [...firstChange.values()];
  const avgDelay = delays.length ? (delays.reduce((a, b) => a + b, 0) / delays.length).toFixed(1) : "—";

  const byConfig = new Map<string, number>();
  for (const q of list) {
    byConfig.set(q.configurator_id, (byConfig.get(q.configurator_id) ?? 0) + 1);
  }
  const configNames = new Map((configurators ?? []).map((c) => [c.id, c.name]));

  const started = (events ?? []).filter((e) => e.event_type === "quotebuilder_started").length;
  const submitted = (events ?? []).filter((e) => e.event_type === "quotebuilder_submitted").length;
  const completion = started ? Math.round((submitted / started) * 100) : 0;

  const admin = isAdminRole(ctx.role);

  return (
    <ListPanel>
      <ListToolbar>
        <form className="mr-auto flex gap-2">
          <select name="range" defaultValue={range} className="rounded-md border border-slate-200 px-2 py-1.5 text-sm">
            <option value="day">Jour</option>
            <option value="week">Semaine</option>
            <option value="month">Mois</option>
          </select>
          <button className="rounded-md border border-slate-200 px-3 py-1.5 text-sm">OK</button>
        </form>
        {admin ? (
          <form action={saveGaMeasurementId} className="flex gap-2">
            <input
              name="ga_measurement_id"
              defaultValue={ctx.organization.ga_measurement_id ?? ""}
              placeholder="G-XXXXXXXX"
              className="w-40 rounded-md border border-slate-200 px-2 py-1.5 text-sm"
            />
            <button className="rounded-md border border-slate-200 px-3 py-1.5 text-sm">GA4</button>
          </form>
        ) : null}
      </ListToolbar>
      <div className="flex flex-wrap gap-x-8 gap-y-2 border-b border-slate-200 px-4 py-3 text-sm lg:px-6">
        <span>
          Demandes <strong>{list.length}</strong>
        </span>
        <span>
          Contacté <strong>{contactedRate}%</strong>
        </span>
        <span>
          Gagné <strong>{conversion}%</strong>
        </span>
        <span>
          Délai 1er statut <strong>{avgDelay}</strong> h
        </span>
        <span>
          Hot/warm/cold <strong>{hot}/{warm}/{cold}</strong>
        </span>
        <span>
          Funnel abouti <strong>{completion}%</strong>
        </span>
      </div>
      <div className="grid gap-8 px-4 py-6 text-sm lg:grid-cols-2 lg:px-6">
        <section>
          <h2 className="text-xs font-medium uppercase tracking-wide text-slate-500">Statuts</h2>
          <ul className="mt-2 space-y-1">
            {[...byStatus.entries()].map(([label, n]) => (
              <li key={label} className="flex justify-between border-b border-slate-100 py-1">
                <span>{label}</span>
                <span>{n}</span>
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h2 className="text-xs font-medium uppercase tracking-wide text-slate-500">Sources</h2>
          <ul className="mt-2 space-y-1">
            {[...byConfig.entries()].map(([id, n]) => (
              <li key={id} className="flex justify-between border-b border-slate-100 py-1">
                <span>{configNames.get(id) ?? id}</span>
                <span>{n}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </ListPanel>
  );
}
