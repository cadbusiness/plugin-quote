import Link from "next/link";
import type { ReactNode } from "react";
import { Chip, scoreTone, statusTone } from "@/components/ui/chip";
import { ClickableRow } from "@/components/ui/clickable-row";
import { DataTable } from "@/components/ui/list-panel";
import { AbandonGauges } from "@/components/crm/abandon-gauges";
import { MonthChart } from "@/components/stats/month-chart";
import { KpiStrip } from "@/components/stats/kpi-strip";
import { WORKFLOW_STATUS_LABELS } from "@/lib/workflows/labels";
import type { WorkflowStatus } from "@/lib/workflows/types";
import { HOME_PULSE_IDS } from "@/lib/stats/dashboard";
import { moduleSpan, type HomeDashboard, type HomeModuleId } from "@/lib/crm/home";

const CAMPAIGN: Record<string, { tone: "amber" | "sky" | "emerald" | "violet"; label: string }> = {
  draft: { tone: "amber", label: "Brouillon" },
  sending: { tone: "sky", label: "Envoi" },
  sent: { tone: "emerald", label: "Envoyée" },
  scheduled: { tone: "violet", label: "Planifiée" },
};

const WORKFLOW_TONE: Record<WorkflowStatus, "amber" | "emerald" | "slate"> = {
  draft: "amber",
  active: "emerald",
  archived: "slate",
};

function ModuleFrame({
  title,
  href,
  hrefLabel,
  badge,
  children,
}: {
  title: string;
  href: string;
  hrefLabel: string;
  badge?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="h-full bg-white">
      <div className="flex items-center justify-between gap-3 px-4 py-2 lg:px-5">
        <div className="flex min-w-0 items-center gap-2">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{title}</p>
          {badge}
        </div>
        <Link href={href} className="text-sm font-medium text-[#E85D04] hover:underline">
          {hrefLabel}
        </Link>
      </div>
      {children}
    </section>
  );
}

function Empty({ children }: { children: ReactNode }) {
  return <p className="px-4 py-5 text-sm text-slate-500 lg:px-5">{children}</p>;
}

function QuotesModule({ data }: { data: HomeDashboard }) {
  const statusById = new Map(data.statuses.map((s) => [s.id, s]));
  const ranked = [...data.quotes]
    .sort((a, b) => {
      const aOpen = data.extras.get(a.id)?.opened ?? true;
      const bOpen = data.extras.get(b.id)?.opened ?? true;
      if (aOpen === bOpen) return 0;
      return aOpen ? 1 : -1;
    })
    .slice(0, 4);
  const newCount = ranked.filter((quote) => {
    const slug = quote.status_id ? statusById.get(quote.status_id)?.slug : quote.status;
    return slug === "new";
  }).length;
  return (
    <ModuleFrame
      title="Demandes"
      href="/devis"
      hrefLabel="Toutes"
      badge={
        newCount ? (
          <Chip tone="orange">
            {newCount} nouveau{newCount > 1 ? "x" : ""}
          </Chip>
        ) : undefined
      }
    >
      {ranked.length === 0 ? (
        <Empty>
          Aucune demande.{" "}
          <Link href="/funnels" className="font-medium text-[#E85D04] hover:underline">
            Ouvrir les funnels
          </Link>
        </Empty>
      ) : (
        <DataTable headers={["Dossier", "Projet", "Score"]}>
          {ranked.map((quote) => {
            const status = quote.status_id ? statusById.get(quote.status_id) : undefined;
            const extra = data.extras.get(quote.id);
            return (
              <ClickableRow
                key={quote.id}
                href={`/devis/${quote.id}`}
                className={extra?.opened === false ? "bg-orange-50/50" : ""}
              >
                <td className="px-4 py-2.5 lg:px-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-slate-900">{quote.contact_name}</span>
                    <Chip tone={statusTone(status?.slug ?? quote.status)}>{status?.label ?? quote.status}</Chip>
                  </div>
                  <div className="text-slate-500">{quote.contact_company ?? quote.contact_email}</div>
                  {extra?.cue ? (
                    <p className="mt-1 truncate text-sm text-slate-700">
                      {extra.cue.quoted ? `« ${extra.cue.title} »` : extra.cue.title}
                    </p>
                  ) : extra?.firstName ? (
                    <p className="mt-1 truncate text-sm text-slate-500">{extra.firstName}</p>
                  ) : null}
                </td>
                <td className="px-4 py-2.5 lg:px-5">
                  {extra?.itemCount ? (
                    <>
                      <div className="font-medium text-slate-900">
                        {extra.itemCount} produit{extra.itemCount > 1 ? "s" : ""}
                      </div>
                      {extra.reasons[0] ? (
                        <p className="text-xs text-slate-500">{extra.reasons.slice(0, 2).join(" · ")}</p>
                      ) : null}
                    </>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>
                <td className="px-4 py-2.5 lg:px-5">
                  <Chip tone={scoreTone(quote.score_label)}>
                    {(quote.score_label ?? "-").toUpperCase()}
                    {quote.score != null ? ` ${quote.score}` : ""}
                  </Chip>
                </td>
              </ClickableRow>
            );
          })}
        </DataTable>
      )}
    </ModuleFrame>
  );
}

function AbandonsModule({ data }: { data: HomeDashboard }) {
  const snapshot = data.abandons;
  return (
    <ModuleFrame title="Abandons" href="/sessions?vue=relance" hrefLabel="Relancer">
      {snapshot ? <AbandonGauges snapshot={snapshot} view="tous" compact /> : <Empty>Aucune session récente.</Empty>}
    </ModuleFrame>
  );
}

function StatsModule({ data }: { data: HomeDashboard }) {
  const months = data.stats?.months ?? [];
  const hasSeries = months.some((month) => month.quotes || month.won || month.abandons);
  return (
    <ModuleFrame title="Tendance" href="/stats" hrefLabel="Rapport">
      {hasSeries ? <MonthChart months={months} /> : <Empty>Pas encore de volume ce mois.</Empty>}
    </ModuleFrame>
  );
}

function AutomationsModule({ data }: { data: HomeDashboard }) {
  const rows = data.workflows.slice(0, 4);
  return (
    <ModuleFrame title="Automatisations" href="/automations" hrefLabel="Parcours">
      {rows.length === 0 ? (
        <Empty>Aucun parcours actif.</Empty>
      ) : (
        <DataTable headers={["Parcours", "État"]}>
          {rows.map((workflow) => {
            const status = workflow.status as WorkflowStatus;
            return (
              <ClickableRow key={workflow.id} href={`/automations/${workflow.id}`}>
                <td className="px-4 py-2 lg:px-5">
                  <div className="font-medium text-slate-900">{workflow.name}</div>
                  {workflow.failed ? (
                    <span className="text-xs text-rose-700">
                      {workflow.failed} échec{workflow.failed > 1 ? "s" : ""}
                    </span>
                  ) : null}
                </td>
                <td className="px-4 py-2 lg:px-5">
                  <Chip tone={WORKFLOW_TONE[status] ?? "slate"}>{WORKFLOW_STATUS_LABELS[status] ?? workflow.status}</Chip>
                </td>
              </ClickableRow>
            );
          })}
        </DataTable>
      )}
    </ModuleFrame>
  );
}

function EmailsModule({ data }: { data: HomeDashboard }) {
  const rows = data.campaigns.slice(0, 4);
  return (
    <ModuleFrame title="Emails" href="/emails" hrefLabel="Campagnes">
      {rows.length === 0 ? (
        <Empty>
          <Link href="/emails#nouveau" className="font-medium text-[#E85D04] hover:underline">
            Nouvelle campagne
          </Link>
        </Empty>
      ) : (
        <DataTable headers={["Campagne", "Statut"]}>
          {rows.map((campaign) => {
            const status = CAMPAIGN[campaign.status] ?? CAMPAIGN.draft;
            return (
              <ClickableRow key={campaign.id} href={`/emails/${campaign.id}`}>
                <td className="px-4 py-2 font-medium text-slate-900 lg:px-5">{campaign.name}</td>
                <td className="px-4 py-2 lg:px-5">
                  <Chip tone={status.tone}>{status.label}</Chip>
                </td>
              </ClickableRow>
            );
          })}
        </DataTable>
      )}
    </ModuleFrame>
  );
}

function SegmentsModule({ data }: { data: HomeDashboard }) {
  const rows = data.segments.slice(0, 4);
  return (
    <ModuleFrame title="Segmentation" href="/segments" hrefLabel="Segments">
      {rows.length === 0 ? (
        <Empty>
          <Link href="/segments#nouveau" className="font-medium text-[#E85D04] hover:underline">
            Nouveau segment
          </Link>
        </Empty>
      ) : (
        <DataTable headers={["Segment", "Contacts"]}>
          {rows.map((segment) => (
            <ClickableRow key={segment.id} href={`/segments/${segment.id}`}>
              <td className="px-4 py-2 font-medium text-slate-900 lg:px-5">{segment.name}</td>
              <td className="px-4 py-2 tabular-nums lg:px-5">{segment.count}</td>
            </ClickableRow>
          ))}
        </DataTable>
      )}
    </ModuleFrame>
  );
}

function TeamModule({ data }: { data: HomeDashboard }) {
  const rows = data.members.slice(0, 4);
  return (
    <ModuleFrame title="Équipe" href="/equipe" hrefLabel="Gérer">
      {rows.length === 0 ? (
        <Empty>Invitez un commercial.</Empty>
      ) : (
        <DataTable headers={["Membre", "Rôle"]}>
          {rows.map((member) => (
            <tr key={member.id} className="border-b border-slate-100">
              <td className="px-4 py-2 font-medium text-slate-900 lg:px-5">{member.label}</td>
              <td className="px-4 py-2 lg:px-5">
                <Chip tone={member.role === "owner" || member.role === "admin" ? "violet" : "orange"}>
                  {member.role}
                </Chip>
              </td>
            </tr>
          ))}
        </DataTable>
      )}
    </ModuleFrame>
  );
}

function FunnelsModule({ data }: { data: HomeDashboard }) {
  const rows = data.funnels.slice(0, 4);
  return (
    <ModuleFrame title="Funnels" href="/funnels" hrefLabel="Tous">
      {rows.length === 0 ? (
        <Empty>
          <Link href="/funnels#nouveau" className="font-medium text-[#E85D04] hover:underline">
            Nouveau funnel
          </Link>
        </Empty>
      ) : (
        <DataTable headers={["Funnel", "Statut"]}>
          {rows.map((funnel) => (
            <ClickableRow key={funnel.id} href={`/funnels/${funnel.id}`}>
              <td className="px-4 py-2 font-medium text-slate-900 lg:px-5">{funnel.name}</td>
              <td className="px-4 py-2 lg:px-5">
                <Chip tone={funnel.is_active ? "emerald" : "amber"}>{funnel.is_active ? "Actif" : "Brouillon"}</Chip>
              </td>
            </ClickableRow>
          ))}
        </DataTable>
      )}
    </ModuleFrame>
  );
}

const RENDER: Record<HomeModuleId, (data: HomeDashboard) => ReactNode> = {
  quotes: (data) => <QuotesModule data={data} />,
  abandons: (data) => <AbandonsModule data={data} />,
  stats: (data) => <StatsModule data={data} />,
  automations: (data) => <AutomationsModule data={data} />,
  emails: (data) => <EmailsModule data={data} />,
  segments: (data) => <SegmentsModule data={data} />,
  team: (data) => <TeamModule data={data} />,
  funnels: (data) => <FunnelsModule data={data} />,
};

export function HomeDashboardView({ data }: { data: HomeDashboard }) {
  const pulse = (data.stats?.kpis ?? []).filter((kpi) => HOME_PULSE_IDS.includes(kpi.id));
  if (!data.modules.length && !pulse.length) {
    return <Empty>Aucun module affiché. Ajoutez-en un pour composer votre tableau de bord.</Empty>;
  }
  return (
    <div className="flex flex-col gap-px bg-slate-200">
      {pulse.length ? <KpiStrip items={pulse} compact /> : null}
      {data.modules.length ? (
        <div className="grid gap-px bg-slate-200 lg:grid-cols-2">
          {data.modules.map((id) => {
            const render = RENDER[id];
            if (!render) return null;
            const span = moduleSpan(id);
            return (
              <div key={id} className={span === "full" ? "min-h-0 lg:col-span-2" : "min-h-0"}>
                {render(data)}
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
