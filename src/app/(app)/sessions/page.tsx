import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrgContext } from "@/lib/auth/org";
import { DataTable, ListPanel, ListToolbar } from "@/components/ui/list-panel";
import { Chip } from "@/components/ui/chip";
import { ClickableRow } from "@/components/ui/clickable-row";
import { formatRelative } from "@/lib/format";
import { loadAbandonSnapshot } from "@/lib/crm/abandons";

const PROCESS = [
  { key: "visite", label: "Configure", hint: "Le prospect avance dans le funnel" },
  { key: "email", label: "Email sauvé", hint: "Le panier devient récupérable" },
  { key: "relance", label: "Relance", hint: "Le parcours abandon reprend contact" },
  { key: "reprise", label: "Reprend", hint: "Il rouvre le configurateur" },
  { key: "demande", label: "Demande", hint: "Le dossier arrive dans le pipeline" },
] as const;

function Kpi({
  label,
  value,
  hint,
  href,
  last,
}: {
  label: string;
  value: number;
  hint: string;
  href: string;
  last?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`block px-4 py-5 hover:bg-orange-50/40 lg:px-6 ${last ? "" : "border-r border-slate-200"}`}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-semibold tabular-nums tracking-tight text-slate-900">{value}</p>
      <p className="mt-1 text-sm text-slate-500">{hint}</p>
    </Link>
  );
}

export default async function AbandonedSessionsPage() {
  const ctx = await getOrgContext();
  if (!ctx) redirect("/onboarding");
  const supabase = await createClient();
  const snapshot = await loadAbandonSnapshot(supabase, ctx.organization.id);
  const processCounts = [
    snapshot.baskets + snapshot.anonymous,
    snapshot.baskets,
    snapshot.stale,
    snapshot.baskets - snapshot.stale,
    snapshot.openQuotes,
  ];

  return (
    <ListPanel>
      <ListToolbar>
        <p className="mr-auto text-sm text-slate-500">
          Paniers commencés, pas encore soumis — à relancer avant qu’ils refroidissent.
        </p>
        <Link href="/automations" className="text-sm underline">
          Parcours abandon
        </Link>
        <Link href="/devis" className="text-sm underline">
          Demandes en cours
        </Link>
      </ListToolbar>

      <div className="grid grid-cols-2 border-b border-slate-200 lg:grid-cols-4">
        <Kpi
          label="Paniers à récupérer"
          value={snapshot.baskets}
          hint="Email capturé, devis pas envoyé"
          href="/sessions"
        />
        <Kpi
          label="À relancer"
          value={snapshot.stale}
          hint="Inactifs depuis plus d’une heure"
          href="/sessions"
        />
        <Kpi
          label="Demandes en cours"
          value={snapshot.openQuotes}
          hint="Nouveau, contacté, en cours, attente"
          href="/devis"
        />
        <Kpi
          label="Hot en cours"
          value={snapshot.hotOpen}
          hint="Dossiers chauds encore ouverts"
          href="/devis?score=hot"
          last
        />
      </div>

      <section className="border-b border-slate-200">
        <div className="border-b border-slate-100 px-4 py-3 lg:px-6">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Processus de récupération</p>
          <p className="mt-0.5 text-sm text-slate-500">
            Un email suffit pour sauver le panier. Ensuite le parcours relance, le prospect reprend, la
            demande arrive.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-px bg-slate-200 sm:grid-cols-5">
          {PROCESS.map((step, index) => (
            <div key={step.key} className="bg-white px-4 py-4 lg:px-5">
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                {index + 1}. {step.label}
              </p>
              <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-900">{processCounts[index]}</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">{step.hint}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="border-b border-slate-100 px-4 py-3 lg:px-6">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Abandons</p>
        <p className="mt-0.5 text-sm text-slate-500">
          {snapshot.baskets
            ? `${snapshot.baskets} panier${snapshot.baskets > 1 ? "s" : ""} avec email`
            : "Aucun email capturé pour l’instant"}
          {snapshot.anonymous ? ` · ${snapshot.anonymous} visite${snapshot.anonymous > 1 ? "s" : ""} sans contact` : ""}
        </p>
      </div>

      {snapshot.rows.length ? (
        <DataTable headers={["Prospect", "Funnel", "Étape", "Activité", "État"]}>
          {snapshot.rows.map((row) => (
            <ClickableRow
              key={row.id}
              href={`/reprendre/${row.token}`}
              className={row.recoverable && row.stale ? "bg-amber-50/40" : ""}
            >
              <td className="px-4 py-2.5 lg:px-6">
                <div className="font-medium text-slate-900">{row.name || row.email || "Visiteur"}</div>
                <div className="text-slate-500">{row.email ?? "Pas encore d’email"}</div>
              </td>
              <td className="px-4 py-2.5 text-slate-600 lg:px-6">{row.funnel}</td>
              <td className="px-4 py-2.5 tabular-nums text-slate-600 lg:px-6">Étape {row.step}</td>
              <td className="px-4 py-2.5 text-slate-900 lg:px-6">{formatRelative(row.lastActivity)}</td>
              <td className="px-4 py-2.5 lg:px-6">
                {row.recoverable ? (
                  <Chip tone={row.stale ? "amber" : "orange"}>{row.stale ? "À relancer" : "Récupérable"}</Chip>
                ) : (
                  <Chip tone="slate">Sans email</Chip>
                )}
              </td>
            </ClickableRow>
          ))}
        </DataTable>
      ) : (
        <p className="px-4 py-10 text-sm text-slate-500 lg:px-6">
          Aucun abandon pour le moment. Dès qu’un prospect laisse son email sans soumettre, il
          apparaît ici — le parcours abandon peut le relancer tout seul.
        </p>
      )}
    </ListPanel>
  );
}
