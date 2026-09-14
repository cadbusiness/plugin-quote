import Link from "next/link";
import type { ReactNode } from "react";
import { Chip, statusTone } from "@/components/ui/chip";
import { ClickableRow } from "@/components/ui/clickable-row";
import { DataTable } from "@/components/ui/list-panel";
import { ScoreMark } from "@/components/crm/quote-list-cells";
import { MonthChart } from "@/components/stats/month-chart";
import { KpiStrip } from "@/components/stats/kpi-strip";
import { nameInitials } from "@/lib/crm/quote-next-action";
import { quoteTabHref } from "@/lib/crm/quote-tabs";
import { abandonStory } from "@/lib/crm/abandons";
import { WORKFLOW_STATUS_LABELS } from "@/lib/workflows/labels";
import type { WorkflowStatus } from "@/lib/workflows/types";
import { HOME_PULSE_IDS, trendStory } from "@/lib/stats/dashboard";
import {
  moduleSpan,
  rankHomeQuotes,
  rankHomeWorkflows,
  workflowActivity,
  type HomeDashboard,
  type HomeModuleId,
  type HomeWorkflow,
} from "@/lib/crm/home";

const CAMPAIGN: Record<string, { tone: "amber" | "sky" | "emerald" | "violet"; label: string }> = {
  draft: { tone: "amber", label: "Brouillon" },
  sending: { tone: "sky", label: "Envoi" },
  sent: { tone: "emerald", label: "Envoyée" },
  scheduled: { tone: "violet", label: "Planifiée" },
};

function ModuleFrame({
  title,
  href,
  hrefLabel,
  badge,
  prominent,
  children,
}: {
  title: string;
  href: string;
  hrefLabel: string;
  badge?: ReactNode;
  prominent?: boolean;
  children: ReactNode;
}) {
  return (
    <section className="h-full bg-white">
      <div className="flex items-center justify-between gap-3 px-4 py-2.5 lg:px-5">
        <div className="flex min-w-0 items-center gap-2">
          <p
            className={
              prominent
                ? "text-sm font-semibold text-slate-900"
                : "text-xs font-medium uppercase tracking-wide text-slate-500"
            }
          >
            {title}
          </p>
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

function ReasonPills({ reasons }: { reasons: string[] }) {
  if (!reasons.length) return null;
  return (
    <div className="mt-1.5 flex flex-wrap gap-1">
      {reasons.slice(0, 2).map((reason) => (
        <span
          key={reason}
          className="inline-flex items-center rounded-full border border-slate-200 px-2 py-0.5 text-[11px] text-slate-600"
        >
          {reason}
        </span>
      ))}
    </div>
  );
}

function MeterRow({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="text-slate-600">{label}</span>
        <span className="font-medium tabular-nums text-slate-900">{value}</span>
      </div>
      <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-slate-900" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function StatusDot({ on, label }: { on: boolean; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
      <span className={`h-2 w-2 rounded-full ${on ? "bg-emerald-500" : "bg-slate-300"}`} />
      {label}
    </span>
  );
}

function pauseSince(iso: string) {
  return `En pause depuis le ${new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}`;
}

function QuotesModule({ data }: { data: HomeDashboard }) {
  const statusById = new Map(data.statuses.map((s) => [s.id, s]));
  const openedById = new Map([...data.extras.entries()].map(([id, extra]) => [id, extra.opened]));
  const ranked = rankHomeQuotes(data.quotes, openedById);
  const newCount = ranked.filter((quote) => {
    const slug = quote.status_id ? statusById.get(quote.status_id)?.slug : quote.status;
    return slug === "new";
  }).length;
  return (
    <ModuleFrame
      title="Demandes"
      href="/devis"
      hrefLabel="Toutes les demandes →"
      prominent
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
        <DataTable
          headers={["Dossier", "Projet", "Priorité"]}
          headClassName="sr-only"
          tableClassName="table-fixed"
          columnClassNames={["", "hidden sm:table-cell", "w-36 lg:w-44"]}
        >
          {ranked.map((quote) => {
            const status = quote.status_id ? statusById.get(quote.status_id) : undefined;
            const extra = data.extras.get(quote.id);
            const reply = extra?.cue?.hot || extra?.opened === false;
            return (
              <ClickableRow
                key={quote.id}
                href={`/devis/${quote.id}`}
                className={extra?.opened === false ? "bg-orange-50/50" : ""}
              >
                <td className="px-4 py-4 lg:px-5">
                  <div className="flex gap-3">
                    <span
                      aria-hidden
                      className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[11px] font-semibold tracking-wide text-white"
                    >
                      {nameInitials(quote.contact_name)}
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold tracking-tight text-slate-900">{quote.contact_name}</span>
                        <Chip tone={statusTone(status?.slug ?? quote.status)}>{status?.label ?? quote.status}</Chip>
                      </div>
                      <p className="mt-0.5 text-sm text-slate-500">{quote.contact_company ?? quote.contact_email}</p>
                      {extra?.cue ? (
                        <p className={`mt-1 truncate text-sm ${extra.cue.hot ? "text-slate-800" : "text-slate-600"}`}>
                          {extra.cue.quoted ? `« ${extra.cue.title} »` : extra.cue.title}
                        </p>
                      ) : extra?.firstName ? (
                        <p className="mt-1 truncate text-sm text-slate-500">{extra.firstName}</p>
                      ) : null}
                    </div>
                  </div>
                </td>
                <td className="hidden px-4 py-4 sm:table-cell lg:px-5">
                  {extra?.itemCount ? (
                    <>
                      <div className="font-medium text-slate-900">
                        {extra.itemCount} produit{extra.itemCount > 1 ? "s" : ""}
                      </div>
                      <ReasonPills reasons={extra.reasons} />
                    </>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>
                <td className="px-4 py-4 lg:px-5">
                  <div className="flex flex-col items-end gap-2">
                    <ScoreMark score={quote.score} scoreLabel={quote.score_label} />
                    <Link
                      href={quoteTabHref(quote.id, "echanges", "mail")}
                      aria-label={`Répondre à ${quote.contact_name}`}
                      className={
                        reply
                          ? "rounded-md bg-[#E85D04] px-3 py-1 text-xs font-medium text-white hover:bg-[#D45203]"
                          : "rounded-md border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      }
                    >
                      Répondre
                    </Link>
                  </div>
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
  if (!snapshot) {
    return (
      <ModuleFrame title="Abandons" href="/sessions?vue=relance" hrefLabel="Relancer tout" prominent>
        <Empty>Aucune session récente.</Empty>
      </ModuleFrame>
    );
  }
  const story = abandonStory(snapshot);
  const abandonFlow = data.workflows.find(
    (workflow) => workflow.trigger_type === "session.abandoned" && workflow.status === "active",
  );
  const sequenceHref = abandonFlow ? `/automations/${abandonFlow.id}` : "/sessions?vue=relance";
  const pending = snapshot.stale;
  return (
    <ModuleFrame title="Abandons" href="/sessions?vue=relance" hrefLabel="Relancer tout" prominent>
      <div className="px-4 pb-4 lg:px-5">
        <p className="max-w-lg text-[15px] font-semibold leading-snug tracking-tight text-slate-900">
          {story.lead}{" "}
          {story.stress ? <span className="text-red-600">{story.stress}</span> : null}
        </p>
        <div className="mt-4 space-y-3">
          <MeterRow label="Visites abandonnées" value={snapshot.started} max={snapshot.started} />
          <MeterRow label="Email envoyé" value={snapshot.relanced} max={snapshot.started} />
          <MeterRow label="À relancer" value={pending} max={snapshot.started} />
        </div>
      </div>
      {story.waiting ? (
        <div className="mx-4 mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-orange-50 px-3 py-2.5 lg:mx-5">
          <p className="text-sm text-orange-950">
            {story.waiting.count} relance{story.waiting.count > 1 ? "s" : ""} en attente
            {story.waiting.days >= 1
              ? ` depuis ${story.waiting.days} jour${story.waiting.days > 1 ? "s" : ""}`
              : ""}
          </p>
          <Link
            href={sequenceHref}
            className="rounded-md bg-[#E85D04] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#D45203]"
          >
            Lancer la séquence
          </Link>
        </div>
      ) : null}
    </ModuleFrame>
  );
}

function StatsModule({ data }: { data: HomeDashboard }) {
  const months = data.stats?.months ?? [];
  const hasSeries = months.some((month) => month.quotes || month.won || month.abandons);
  return (
    <ModuleFrame title="Tendance · 6 mois" href="/stats" hrefLabel="Rapport" prominent>
      {hasSeries ? (
        <MonthChart months={months} headline={trendStory(months)} counts />
      ) : (
        <Empty>Pas encore de volume ce mois.</Empty>
      )}
    </ModuleFrame>
  );
}

function workflowStatus(workflow: HomeWorkflow) {
  const active = workflow.status === "active";
  if (active) return { on: true, label: WORKFLOW_STATUS_LABELS.active };
  return { on: false, label: "En pause" };
}

function AutomationsModule({ data }: { data: HomeDashboard }) {
  const rows = rankHomeWorkflows(data.workflows);
  const activeCount = data.workflows.filter((workflow) => workflow.status === "active").length;
  return (
    <ModuleFrame
      title="Automatisations"
      href="/automations"
      hrefLabel="Parcours"
      prominent
      badge={
        data.workflows.length ? (
          <span className="text-sm text-slate-500">
            · {activeCount} active{activeCount > 1 ? "s" : ""}
          </span>
        ) : undefined
      }
    >
      {rows.length === 0 ? (
        <Empty>Aucun parcours actif.</Empty>
      ) : (
        <DataTable headers={["Parcours", "État"]} headClassName="sr-only">
          {rows.map((workflow) => {
            const status = workflow.status as WorkflowStatus;
            const activity = workflowActivity(workflow.sent, workflow.lastAt);
            const mark = workflowStatus(workflow);
            return (
              <ClickableRow key={workflow.id} href={`/automations/${workflow.id}`}>
                <td className="px-4 py-3 lg:px-5">
                  <div className="font-semibold tracking-tight text-slate-900">{workflow.name}</div>
                  <p className={`mt-0.5 text-xs ${activity.hot ? "text-red-600" : "text-slate-500"}`}>
                    {status === "draft" && !workflow.sent ? pauseSince(workflow.updated_at) : activity.text}
                  </p>
                </td>
                <td className="w-28 px-4 py-3 text-right lg:px-5">
                  <StatusDot on={mark.on} label={mark.label} />
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
    <ModuleFrame title="Segmentation" href="/segments" hrefLabel="Segments" prominent>
      {rows.length === 0 ? (
        <div className="mx-4 mb-4 rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center lg:mx-5">
          <p className="text-sm font-semibold text-slate-900">Aucun segment</p>
          <p className="mx-auto mt-1 max-w-xs text-sm text-slate-500">
            Regroupez vos contacts par score, surface ou canal pour cibler vos relances.
          </p>
          <Link
            href="/segments#nouveau"
            className="mt-4 inline-flex rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800"
          >
            Créer un segment
          </Link>
          {data.segmentHint ? (
            <p className="mt-3 text-xs text-slate-400">
              Suggestion : « {data.segmentHint.label} »
              {data.segmentHint.count
                ? ` (${data.segmentHint.count} contact${data.segmentHint.count > 1 ? "s" : ""})`
                : ""}
            </p>
          ) : null}
        </div>
      ) : (
        <DataTable headers={["Segment", "Contacts"]} headClassName="sr-only">
          {rows.map((segment) => (
            <ClickableRow key={segment.id} href={`/segments/${segment.id}`}>
              <td className="px-4 py-3 font-semibold tracking-tight text-slate-900 lg:px-5">{segment.name}</td>
              <td className="px-4 py-3 text-right tabular-nums text-slate-500 lg:px-5">{segment.count}</td>
            </ClickableRow>
          ))}
        </DataTable>
      )}
    </ModuleFrame>
  );
}

function EmailsModule({ data }: { data: HomeDashboard }) {
  const rows = data.campaigns.slice(0, 4);
  return (
    <ModuleFrame title="Emails" href="/emails" hrefLabel="Campagnes" prominent>
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

function TeamModule({ data }: { data: HomeDashboard }) {
  const rows = data.members.slice(0, 4);
  return (
    <ModuleFrame title="Équipe" href="/equipe" hrefLabel="Gérer">
      {rows.length === 0 ? (
        <Empty>Invitez un commercial.</Empty>
      ) : (
        <DataTable headers={["Membre", "Rôle"]}>
          {rows.map((member) => (
            <ClickableRow key={member.id} href={`/equipe/${member.id}`}>
              <td className="px-4 py-2 font-medium text-slate-900 lg:px-5">{member.label}</td>
              <td className="px-4 py-2 lg:px-5">
                <Chip tone={member.role === "owner" || member.role === "admin" ? "violet" : "sky"}>
                  {member.roleLabel}
                </Chip>
              </td>
            </ClickableRow>
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
                <Chip tone={funnel.is_active ? "emerald" : "slate"}>{funnel.is_active ? "Actif" : "Archivé"}</Chip>
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
  const showQuotes = data.modules.includes("quotes");
  const rest = data.modules.filter((id) => id !== "quotes");
  if (!data.modules.length && !pulse.length) {
    return <Empty>Aucun module affiché. Ajoutez-en un pour composer votre tableau de bord.</Empty>;
  }
  return (
    <div className="flex flex-col gap-px bg-slate-200">
      {pulse.length || showQuotes ? (
        <div className="bg-white">
          {pulse.length ? <KpiStrip items={pulse} compact /> : null}
          {showQuotes ? (
            <div className={pulse.length ? "border-t border-slate-100" : ""}>
              <QuotesModule data={data} />
            </div>
          ) : null}
        </div>
      ) : null}
      {rest.length ? (
        <div className="grid gap-px bg-slate-200 lg:grid-cols-2">
          {rest.map((id) => {
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
