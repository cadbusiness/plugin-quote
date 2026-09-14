"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import {
  resendMemberAccess,
  revokeMemberInvite,
  sendMemberPassword,
  setMemberStatus,
  updateMemberRole,
} from "@/app/(app)/equipe/actions";
import { Chip, statusTone } from "@/components/ui/chip";
import { ClickableRow } from "@/components/ui/clickable-row";
import { DataTable, ListPanel } from "@/components/ui/list-panel";
import { LocalTabNav, replaceClientUrl } from "@/components/ui/local-tabs";
import { formatDate, formatPercent, formatRelative } from "@/lib/format";
import {
  canManageMember,
  conversionRate,
  memberListLabel,
  memberStatusLabel,
  memberStatusTone,
  quoteStatusLabel,
  roleBlurb,
  roleLabel,
  roleTone,
  type TeamMemberDetail,
} from "@/lib/crm/team";
import { TEAM_TABS, teamMemberHref, type TeamTab } from "@/lib/crm/team-tabs";

const FLASH: Record<string, string> = {
  access: "Lien d’accès envoyé.",
  password: "Lien mot de passe envoyé.",
  role: "Rôle mis à jour.",
  status: "Statut mis à jour.",
};

const ERRORS: Record<string, string> = {
  access: "Impossible d’envoyer l’accès. Vérifiez l’email.",
  password: "Impossible d’envoyer le mot de passe. Le compte n’existe peut-être pas encore.",
  role: "Ce rôle ne peut pas être modifié.",
  status: "Ce compte ne peut pas être suspendu.",
};

export function MemberDetailView({
  member,
  actorRole,
  actorUserId,
  tab: initialTab,
  flash,
  error,
}: {
  member: TeamMemberDetail;
  actorRole: string;
  actorUserId: string;
  tab: TeamTab;
  flash?: string | null;
  error?: string | null;
}) {
  const [tab, setTab] = useState(initialTab);
  const manageable = canManageMember(actorRole, { role: member.role, userId: member.userId }, actorUserId);
  const pending = member.status === "pending";
  const conversion = conversionRate(member.stats);

  function openTab(next: TeamTab) {
    setTab(next);
    replaceClientUrl(teamMemberHref(member.id, next));
  }

  return (
    <ListPanel>
      <div className="sticky top-0 z-20 bg-white">
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 px-4 py-3 lg:px-6">
          <Link
            href="/equipe"
            className="inline-flex shrink-0 items-center gap-0.5 rounded-full border border-slate-200 px-2.5 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
            Équipe
          </Link>
          <div className="mr-auto min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="truncate text-base font-semibold tracking-tight text-slate-900">
                {memberListLabel(member.email, member.role)}
              </span>
              <Chip tone={roleTone(member.role)}>{roleLabel(member.role)}</Chip>
              <Chip tone={memberStatusTone(member.status)}>{memberStatusLabel(member.status)}</Chip>
              {member.isYou ? <Chip tone="orange">Vous</Chip> : null}
            </div>
            <p className="mt-0.5 truncate text-sm text-slate-500">{roleBlurb(member.role)}</p>
          </div>
          {member.email && member.status !== "disabled" ? (
            <form action={resendMemberAccess.bind(null, member.id)}>
              <button className="rounded-md bg-[#E85D04] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#d35400]">
                {pending ? "Renvoyer l’accès" : "Envoyer l’accès"}
              </button>
            </form>
          ) : null}
          {member.email && member.status === "active" ? (
            <form action={sendMemberPassword.bind(null, member.id)}>
              <button className="rounded-md border border-slate-200 px-3 py-1.5 text-sm hover:bg-slate-50">
                Mot de passe
              </button>
            </form>
          ) : null}
        </div>
        {flash && FLASH[flash] ? (
          <p className="border-b border-emerald-100 bg-emerald-50 px-4 py-2 text-sm text-emerald-800 lg:px-6">{FLASH[flash]}</p>
        ) : null}
        {error && ERRORS[error] ? (
          <p className="border-b border-rose-100 bg-rose-50 px-4 py-2 text-sm text-rose-800 lg:px-6">{ERRORS[error]}</p>
        ) : null}
        <LocalTabNav
          items={TEAM_TABS}
          active={tab}
          onSelect={openTab}
          counts={{ demandes: member.stats.assigned, journal: member.logs.length }}
        />
      </div>

      {tab === "compte" ? (
        <CompteTab member={member} conversion={conversion} manageable={manageable} />
      ) : null}
      {tab === "acces" ? <AccesTab member={member} /> : null}
      {tab === "demandes" ? <DemandesTab member={member} /> : null}
      {tab === "journal" ? <JournalTab member={member} /> : null}

      {manageable && tab === "compte" ? (
        <section>
          <SectionTitle>Gestion</SectionTitle>
          <div className="flex flex-wrap gap-2 px-4 py-4 lg:px-6">
            <form action={updateMemberRole.bind(null, member.id)} className="flex flex-wrap items-center gap-2">
              <select
                name="role"
                defaultValue={member.role === "admin" ? "admin" : "sales"}
                className="rounded-md border border-slate-200 px-2 py-1.5 text-sm"
              >
                <option value="sales">Commercial</option>
                <option value="admin">Admin</option>
              </select>
              <button className="rounded-md border border-slate-200 px-3 py-1.5 text-sm hover:bg-slate-50">
                Enregistrer le rôle
              </button>
            </form>
            {pending ? (
              <form action={revokeMemberInvite.bind(null, member.id)}>
                <button className="rounded-md border border-rose-200 px-3 py-1.5 text-sm text-rose-700 hover:bg-rose-50">
                  Révoquer l’invitation
                </button>
              </form>
            ) : member.status === "disabled" ? (
              <form action={setMemberStatus.bind(null, member.id, "active")}>
                <button className="rounded-md border border-emerald-200 px-3 py-1.5 text-sm text-emerald-800 hover:bg-emerald-50">
                  Réactiver
                </button>
              </form>
            ) : (
              <form action={setMemberStatus.bind(null, member.id, "disabled")}>
                <button className="rounded-md border border-rose-200 px-3 py-1.5 text-sm text-rose-700 hover:bg-rose-50">
                  Suspendre
                </button>
              </form>
            )}
          </div>
        </section>
      ) : null}
    </ListPanel>
  );
}

function CompteTab({
  member,
  conversion,
  manageable,
}: {
  member: TeamMemberDetail;
  conversion: number | null;
  manageable: boolean;
}) {
  return (
    <>
      <div className="grid grid-cols-2 gap-px bg-slate-200 lg:grid-cols-4">
        <Kpi label="Demandes" value={String(member.stats.assigned)} hint={`${member.stats.open} en cours`} />
        <Kpi label="Gagnés" value={String(member.stats.won)} hint={`${member.stats.lost} perdus`} />
        <Kpi label="Conversion" value={formatPercent(conversion)} hint={member.stats.hot ? `${member.stats.hot} hot` : "Score hot"} />
        <Kpi
          label="Dernière activité"
          value={member.lastActivityAt ? formatRelative(member.lastActivityAt) : "—"}
          hint={member.lastSignInAt ? `Connexion ${formatRelative(member.lastSignInAt)}` : "Pas encore connecté"}
        />
      </div>
      <section>
        <SectionTitle>Compte</SectionTitle>
        <dl>
          <Fact label="Email">{member.email ?? "Non renseigné"}</Fact>
          <Fact label="Rôle">{roleLabel(member.role)}</Fact>
          <Fact label="Statut">{memberStatusLabel(member.status)}</Fact>
          <Fact label="Depuis">{formatDate(member.createdAt)}</Fact>
          <Fact label="Connexion">{member.lastSignInAt ? formatDate(member.lastSignInAt) : "Jamais"}</Fact>
          {manageable ? null : (
            <Fact label="Modification">
              {member.role === "owner" ? "Le propriétaire ne peut pas être modifié." : "Vous ne pouvez pas modifier votre propre compte ici."}
            </Fact>
          )}
        </dl>
      </section>
    </>
  );
}

function AccesTab({ member }: { member: TeamMemberDetail }) {
  return (
    <section>
      <SectionTitle>Ce que ce compte peut faire</SectionTitle>
      <ul>
        {member.capabilities.map((item) => (
          <li
            key={item.id}
            className="grid grid-cols-[minmax(8rem,16rem)_minmax(0,1fr)_auto] gap-4 border-b border-slate-100 px-4 py-2.5 text-sm lg:px-6"
          >
            <span className="font-medium text-slate-900">{item.area}</span>
            <span className="text-slate-500">{item.hint}</span>
            <Chip tone={item.allowed ? "emerald" : "slate"}>{item.allowed ? "Oui" : "Non"}</Chip>
          </li>
        ))}
      </ul>
    </section>
  );
}

function DemandesTab({ member }: { member: TeamMemberDetail }) {
  if (!member.userId) {
    return <Empty>Pas encore de compte actif, donc aucune demande assignée.</Empty>;
  }
  if (!member.quotes.length) {
    return <Empty>Aucune demande assignée pour le moment.</Empty>;
  }
  return (
    <DataTable headers={["Dossier", "Statut", "Reçue"]}>
      {member.quotes.map((quote) => (
        <ClickableRow key={quote.id} href={`/devis/${quote.id}`}>
          <td className="px-4 py-2.5 lg:px-6">
            <div className="font-medium text-slate-900">{quote.contactName}</div>
            {quote.company ? <p className="text-xs text-slate-500">{quote.company}</p> : null}
          </td>
          <td className="px-4 py-2.5 lg:px-6">
            <Chip tone={statusTone(quote.status)}>{quoteStatusLabel(quote.status)}</Chip>
          </td>
          <td className="px-4 py-2.5 text-slate-500 lg:px-6">{formatRelative(quote.createdAt)}</td>
        </ClickableRow>
      ))}
    </DataTable>
  );
}

function JournalTab({ member }: { member: TeamMemberDetail }) {
  if (!member.logs.length) {
    return <Empty>Aucune action enregistrée sur les demandes.</Empty>;
  }
  return (
    <ol>
      {member.logs.map((log) => (
        <li
          key={log.id}
          className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 border-b border-slate-100 px-4 py-2.5 text-sm lg:px-6"
        >
          <div>
            <p className="font-medium text-slate-900">{log.label}</p>
            <Link href={`/devis/${log.quoteId}`} className="text-sm text-slate-500 hover:text-slate-800">
              {log.contactName}
            </Link>
          </div>
          <span className="shrink-0 text-xs text-slate-400">{log.when}</span>
        </li>
      ))}
    </ol>
  );
}

function Kpi({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="bg-white px-4 py-3.5 lg:px-5">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-900">{value}</p>
      <p className="mt-1 text-xs text-slate-400">{hint}</p>
    </div>
  );
}

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[minmax(8rem,16rem)_minmax(0,1fr)] gap-4 border-b border-slate-100 px-4 py-2.5 text-sm lg:px-6">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-slate-900">{children}</dd>
    </div>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <p className="border-b border-slate-100 px-4 py-2 text-xs font-medium uppercase tracking-wide text-slate-500 lg:px-6">
      {children}
    </p>
  );
}

function Empty({ children }: { children: ReactNode }) {
  return <p className="px-4 py-6 text-sm text-slate-500 lg:px-6">{children}</p>;
}
