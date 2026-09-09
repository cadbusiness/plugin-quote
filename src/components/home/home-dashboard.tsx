import Link from "next/link";
import type { ReactNode } from "react";
import { Chip, scoreTone, statusTone } from "@/components/ui/chip";
import { ClickableRow } from "@/components/ui/clickable-row";
import { DataTable } from "@/components/ui/list-panel";
import { GaugeRing, type GaugeTone } from "@/components/ui/gauge-ring";
import { AbandonGauges, AbandonProgress } from "@/components/crm/abandon-gauges";
import { QuoteProjectCell, QuoteReceivedCell } from "@/components/crm/quote-list-cells";
import { formatEur, formatPercent, formatRelative } from "@/lib/format";
import { TRIGGER_LABELS, WORKFLOW_STATUS_LABELS } from "@/lib/workflows/labels";
import type { WorkflowStatus, WorkflowTriggerType } from "@/lib/workflows/types";
import type { FunnelStep } from "@/lib/stats/dashboard";
import type { HomeDashboard, HomeModuleId } from "@/lib/crm/home";

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
  hint,
  href,
  hrefLabel,
  children,
}: {
  title: string;
  hint: string;
  href: string;
  hrefLabel: string;
  children: ReactNode;
}) {
  return (
    <section className="border-b border-slate-200">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-100 px-4 py-3 lg:px-6">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{title}</p>
          <p className="mt-0.5 text-sm text-slate-500">{hint}</p>
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
  return <p className="px-4 py-8 text-sm text-slate-500 lg:px-6">{children}</p>;
}

function StatGauge({
  href,
  value,
  max,
  tone,
  label,
  hint,
  last,
}: {
  href: string;
  value: number;
  max: number;
  tone: GaugeTone;
  label: string;
  hint: string;
  last?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-4 py-5 hover:bg-orange-50/50 lg:gap-4 lg:px-6 ${
        last ? "" : "border-b border-slate-200 sm:border-b-0 sm:border-r"
      }`}
    >
      <GaugeRing value={value} max={max} tone={tone} label={`${label}: ${value}`} />
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
        <p className="mt-0.5 text-sm text-slate-500">{hint}</p>
      </div>
    </Link>
  );
}

function FunnelStrip({ steps }: { steps: FunnelStep[] }) {
  const max = Math.max(1, ...steps.map((s) => s.count));
  return (
    <div className="grid grid-cols-2 gap-px bg-slate-200 sm:grid-cols-4 xl:grid-cols-7">
      {steps.map((step, i) => {
        const width = Math.max(8, Math.round((step.count / max) * 100));
        const prev = steps[i - 1];
        const lost = prev ? Math.max(0, prev.count - step.count) : 0;
        return (
          <div key={step.key} className="bg-white px-3 py-4 lg:px-4">
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">{step.label}</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-900">{step.count}</p>
            {i === 0 ? (
              <p className="mt-1 text-xs text-slate-400">entrée</p>
            ) : (
              <p className="mt-1 text-xs text-slate-500">
                {formatPercent(step.rateFromPrevious)}
                {lost > 0 ? <span className="text-rose-600"> · −{lost}</span> : null}
              </p>
            )}
            <div className="mt-3 h-1 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-slate-800" style={{ width: `${width}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function QuotesModule({ data }: { data: HomeDashboard }) {
  const statusById = new Map(data.statuses.map((s) => [s.id, s]));
  const ranked = [...data.quotes].sort((a, b) => {
    const aOpen = data.extras.get(a.id)?.opened ?? true;
    const bOpen = data.extras.get(b.id)?.opened ?? true;
    if (aOpen === bOpen) return 0;
    return aOpen ? 1 : -1;
  });
  return (
    <ModuleFrame
      title="Demandes"
      hint="Les dossiers à ouvrir d’abord, puis les plus récents."
      href="/devis"
      hrefLabel="Toutes les demandes"
    >
      {ranked.length === 0 ? (
        <Empty>
          Aucune demande pour le moment.{" "}
          <Link href="/funnels" className="font-medium text-[#E85D04] hover:underline">
            Ouvrir les funnels
          </Link>
        </Empty>
      ) : (
        <DataTable headers={["Prospect", "Projet", "Score", "Statut", "Reçue"]}>
          {ranked.map((quote) => {
            const status = quote.status_id ? statusById.get(quote.status_id) : undefined;
            const extra = data.extras.get(quote.id) ?? {
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
    </ModuleFrame>
  );
}

function AbandonsModule({ data }: { data: HomeDashboard }) {
  const snapshot = data.abandons;
  if (!snapshot) return null;
  const hot = snapshot.rows.filter((row) => row.recoverable && row.stale).slice(0, 4);
  return (
    <ModuleFrame
      title="Abandons"
      hint="Paniers commencés, email sauvé, à relancer avant qu’ils refroidissent."
      href="/sessions?vue=relance"
      hrefLabel="Relancer"
    >
      <AbandonGauges snapshot={snapshot} view="tous" />
      {hot.length ? (
        <DataTable headers={["Prospect", "Funnel", "Avancement", "Activité"]}>
          {hot.map((row) => (
            <ClickableRow key={row.id} href={`/reprendre/${row.token}`} className="bg-amber-50/40">
              <td className="px-4 py-2.5 lg:px-6">
                <div className="font-medium text-slate-900">{row.name || row.email || "Visiteur"}</div>
                <div className="text-slate-500">{row.email ?? "Pas encore d’email"}</div>
              </td>
              <td className="px-4 py-2.5 text-slate-600 lg:px-6">{row.funnel}</td>
              <td className="px-4 py-2.5 lg:px-6">
                <AbandonProgress progress={row.progress} step={row.step} stepCount={row.stepCount} />
              </td>
              <td className="px-4 py-2.5 text-slate-900 lg:px-6">{formatRelative(row.lastActivity)}</td>
            </ClickableRow>
          ))}
        </DataTable>
      ) : (
        <Empty>Rien à relancer. Les paniers inactifs avec email arriveront ici.</Empty>
      )}
    </ModuleFrame>
  );
}

function StatsModule({ data }: { data: HomeDashboard }) {
  const stats = data.stats;
  if (!stats) return null;
  const visitors = stats.funnel.find((s) => s.key === "visitors")?.count ?? 0;
  const submitted = stats.funnel.find((s) => s.key === "submitted")?.count ?? 0;
  const contacted = stats.funnel.find((s) => s.key === "contacted")?.count ?? 0;
  const won = stats.funnel.find((s) => s.key === "won")?.count ?? 0;
  return (
    <ModuleFrame title="Statistiques" hint={stats.story.headline} href="/stats" hrefLabel="Rapport complet">
      <div className="grid grid-cols-1 border-b border-slate-200 sm:grid-cols-2 xl:grid-cols-4">
        <StatGauge
          href="/stats"
          value={submitted}
          max={Math.max(visitors, submitted, 1)}
          tone="orange"
          label="Devis"
          hint={visitors ? `${formatPercent((submitted / visitors) * 100)} des visites` : "ce mois"}
        />
        <StatGauge
          href="/devis"
          value={contacted}
          max={Math.max(submitted, 1)}
          tone="emerald"
          label="Rappelés"
          hint={submitted ? `${contacted} sur ${submitted}` : "dès le premier devis"}
        />
        <StatGauge
          href="/devis"
          value={won}
          max={Math.max(submitted, 1)}
          tone="slate"
          label="Signés"
          hint={formatEur(stats.wonValue)}
        />
        <StatGauge
          href="/sessions"
          value={stats.abandons.withEmail}
          max={Math.max(stats.abandons.total, stats.abandons.withEmail, 1)}
          tone="amber"
          label="Relançables"
          hint={formatEur(stats.pipelineTotal) + " en cours"}
          last
        />
      </div>
      <FunnelStrip steps={stats.funnel} />
    </ModuleFrame>
  );
}

function AutomationsModule({ data }: { data: HomeDashboard }) {
  return (
    <ModuleFrame
      title="Automatisations"
      hint="Ce qui tourne tout seul : soumission, abandon, changement de statut."
      href="/automations"
      hrefLabel="Parcours"
    >
      {data.workflows.length === 0 ? (
        <Empty>Aucun parcours. Un admin peut en activer depuis Automatisations.</Empty>
      ) : (
        <DataTable headers={["Parcours", "Déclencheur", "En cours", "Attente", "Échecs"]}>
          {data.workflows.map((workflow) => {
            const status = workflow.status as WorkflowStatus;
            const trigger = workflow.trigger_type as WorkflowTriggerType;
            return (
              <ClickableRow key={workflow.id} href={`/automations/${workflow.id}`}>
                <td className="px-4 py-2.5 lg:px-6">
                  <div className="font-medium text-slate-900">{workflow.name}</div>
                  <Chip tone={WORKFLOW_TONE[status] ?? "slate"}>{WORKFLOW_STATUS_LABELS[status] ?? workflow.status}</Chip>
                </td>
                <td className="px-4 py-2.5 lg:px-6">
                  <Chip tone={trigger === "session.abandoned" ? "amber" : trigger === "quote.submitted" ? "emerald" : "violet"}>
                    {TRIGGER_LABELS[trigger] ?? workflow.trigger_type}
                  </Chip>
                </td>
                <td className="px-4 py-2.5 tabular-nums lg:px-6">{workflow.running}</td>
                <td className="px-4 py-2.5 tabular-nums lg:px-6">{workflow.waiting}</td>
                <td className="px-4 py-2.5 tabular-nums lg:px-6">
                  {workflow.failed ? <span className="font-medium text-rose-700">{workflow.failed}</span> : "0"}
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
  return (
    <ModuleFrame title="Emails" hint="Campagnes perso ou de groupe, sur un segment." href="/emails" hrefLabel="Campagnes">
      {data.campaigns.length === 0 ? (
        <Empty>
          Aucune campagne.{" "}
          <Link href="/emails#nouveau" className="font-medium text-[#E85D04] hover:underline">
            En créer une
          </Link>
        </Empty>
      ) : (
        <DataTable headers={["Campagne", "Mode", "Envoyés", "Statut"]}>
          {data.campaigns.map((campaign) => {
            const status = CAMPAIGN[campaign.status] ?? CAMPAIGN.draft;
            return (
              <ClickableRow key={campaign.id} href={`/emails/${campaign.id}`}>
                <td className="px-4 py-2.5 font-medium text-slate-900 lg:px-6">{campaign.name}</td>
                <td className="px-4 py-2.5 lg:px-6">
                  <Chip tone={campaign.send_mode === "group" ? "violet" : "sky"}>
                    {campaign.send_mode === "group" ? "Groupe" : "Personnel"}
                  </Chip>
                </td>
                <td className="px-4 py-2.5 tabular-nums lg:px-6">{campaign.sent_count}</td>
                <td className="px-4 py-2.5 lg:px-6">
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
  return (
    <ModuleFrame
      title="Segmentation"
      hint="B2B, hot, un funnel, jamais relancés — les campagnes s’appuient dessus."
      href="/segments"
      hrefLabel="Segments"
    >
      {data.segments.length === 0 ? (
        <Empty>
          Aucun segment.{" "}
          <Link href="/segments#nouveau" className="font-medium text-[#E85D04] hover:underline">
            Découper la base
          </Link>
        </Empty>
      ) : (
        <DataTable headers={["Segment", "Contacts"]}>
          {data.segments.map((segment) => (
            <ClickableRow key={segment.id} href={`/segments/${segment.id}`}>
              <td className="px-4 py-2.5 font-medium text-slate-900 lg:px-6">{segment.name}</td>
              <td className="px-4 py-2.5 tabular-nums lg:px-6">{segment.count}</td>
            </ClickableRow>
          ))}
        </DataTable>
      )}
    </ModuleFrame>
  );
}

function TeamModule({ data }: { data: HomeDashboard }) {
  const active = data.members.filter((m) => m.status === "active").length;
  return (
    <ModuleFrame
      title="Équipe"
      hint={`${active} actif${active > 1 ? "s" : ""} · ${data.unassigned} dossier${data.unassigned > 1 ? "s" : ""} non assigné${data.unassigned > 1 ? "s" : ""}`}
      href="/equipe"
      hrefLabel="Gérer"
    >
      {data.members.length === 0 ? (
        <Empty>Invitez un commercial pour répartir les dossiers.</Empty>
      ) : (
        <DataTable headers={["Membre", "Rôle", "Statut"]}>
          {data.members.map((member) => (
            <tr key={member.id} className="border-b border-slate-100">
              <td className="px-4 py-2.5 font-medium text-slate-900 lg:px-6">{member.label}</td>
              <td className="px-4 py-2.5 lg:px-6">
                <Chip tone={member.role === "owner" || member.role === "admin" ? "violet" : "orange"}>
                  {member.role}
                </Chip>
              </td>
              <td className="px-4 py-2.5 lg:px-6">
                <Chip tone={member.status === "active" ? "emerald" : "amber"}>{member.status}</Chip>
              </td>
            </tr>
          ))}
        </DataTable>
      )}
    </ModuleFrame>
  );
}

function FunnelsModule({ data }: { data: HomeDashboard }) {
  return (
    <ModuleFrame title="Funnels" hint="Les configurateurs à partager ou à coller en embed." href="/funnels" hrefLabel="Tous">
      {data.funnels.length === 0 ? (
        <Empty>
          Aucun funnel.{" "}
          <Link href="/funnels#nouveau" className="font-medium text-[#E85D04] hover:underline">
            En créer un
          </Link>
        </Empty>
      ) : (
        <DataTable headers={["Funnel", "Statut", "Lien"]}>
          {data.funnels.map((funnel) => (
            <ClickableRow key={funnel.id} href={`/funnels/${funnel.id}`}>
              <td className="px-4 py-2.5 font-medium text-slate-900 lg:px-6">{funnel.name}</td>
              <td className="px-4 py-2.5 lg:px-6">
                <Chip tone={funnel.is_active ? "emerald" : "amber"}>{funnel.is_active ? "Actif" : "Brouillon"}</Chip>
              </td>
              <td className="px-4 py-2.5 text-slate-500 lg:px-6">
                /c/{data.orgSlug}/{funnel.slug}
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
  if (!data.modules.length) {
    return <Empty>Aucun module affiché. Ajoutez-en un pour composer votre tableau de bord.</Empty>;
  }
  return (
    <>
      {data.modules.map((id) => {
        const render = RENDER[id];
        return render ? <div key={id}>{render(data)}</div> : null;
      })}
    </>
  );
}
