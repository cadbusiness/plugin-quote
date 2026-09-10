"use client";

import { AutoSubmitSelect } from "@/components/crm/quote-controls";
import { QuoteValidationSection } from "@/components/crm/quote-validation";
import { Chip, scoreTone } from "@/components/ui/chip";
import { formatPrice } from "@/lib/format";
import {
  dossierJournal,
  dossierWhy,
  funnelContext,
  lastStatusChangeAt,
  quoteNextAction,
  statusUnchangedLabel,
  wantHeading,
} from "@/lib/crm/quote-next-action";
import type { QuoteCompose, QuoteTab } from "@/lib/crm/quote-tabs";
import type { QuoteDetail } from "@/lib/crm/quote-detail";

export function DossierTab({
  detail,
  changeStatus,
  toggleAssignee,
  onTab,
}: {
  detail: QuoteDetail;
  changeStatus: (formData: FormData) => Promise<void>;
  toggleAssignee: (formData: FormData) => Promise<void>;
  onTab: (tab: QuoteTab, compose?: QuoteCompose | null) => void;
}) {
  const { quote, funnel, totals } = detail;
  const next = quoteNextAction(detail);
  const journal = dossierJournal(detail);
  const assignedIds = new Set(detail.assignees.map((row) => row.userId));
  const context = funnelContext(detail.answers);
  const why = dossierWhy(detail.scoreReasons, detail.answers);
  const wantLabel = wantHeading(quote.contact_name);

  return (
    <div className="grid lg:grid-cols-[minmax(0,1fr)_18.5rem]">
      <div className="min-w-0">
        {next ? (
          <div className="px-4 pt-5 lg:px-6">
            <div className="rounded-2xl bg-[#171411] px-5 py-5 text-white">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-white/55">
                  {next.kicker}
                </p>
                <p className="max-w-[16rem] text-right text-[11px] font-medium uppercase tracking-[0.12em] text-white/40">
                  {next.automationNote}
                </p>
              </div>
              <p className="mt-3 line-clamp-3 text-xl font-semibold tracking-tight sm:text-2xl">
                {next.quoted ? `« ${next.title} »` : next.title}
              </p>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">{next.body}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onTab("echanges", "mail")}
                  className="rounded-md bg-[#E85D04] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#d35400]"
                >
                  Répondre par email
                </button>
                {quote.contact_phone ? (
                  <button
                    type="button"
                    onClick={() => onTab("echanges", "call")}
                    className="rounded-md bg-white/10 px-3 py-1.5 text-sm font-medium text-white ring-1 ring-white/15 hover:bg-white/15"
                  >
                    Appeler et noter
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => onTab("automations")}
                  className="rounded-md bg-white/10 px-3 py-1.5 text-sm font-medium text-white ring-1 ring-white/15 hover:bg-white/15"
                >
                  Lancer une relance
                </button>
              </div>
            </div>
          </div>
        ) : null}

        <div className="flex flex-wrap items-start gap-x-10 gap-y-4 border-b border-slate-200 px-4 py-5 lg:px-6">
          <div className="flex items-end gap-3">
            <span className="text-5xl font-semibold leading-none tabular-nums tracking-tight text-slate-900">
              {quote.score != null ? quote.score : "–"}
            </span>
            <div className="pb-0.5">
              <Chip tone={scoreTone(quote.score_label)}>{(quote.score_label ?? "-").toUpperCase()}</Chip>
              <p className="mt-1 text-xs text-slate-500">Score de qualification</p>
            </div>
          </div>
          {why.length ? (
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Pourquoi</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {why.map((reason) => (
                  <Chip key={reason} tone="orange">
                    {reason}
                  </Chip>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="grid border-b border-slate-200 sm:grid-cols-3">
          <FactCell label="Reçue" value={detail.received.relative} hint={detail.received.exact} />
          <FactCell label="Source" value={detail.source} hint={attributionHint(quote)} />
          <FactCell
            label="Funnel"
            value={funnel?.name ?? "-"}
            hint={detail.assignedLabel ? `Assigné à ${detail.assignedLabel}` : "Non assigné"}
          />
        </div>

        <section>
          <div className="flex items-end justify-between gap-3 px-4 pt-5 lg:px-6">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{wantLabel}</p>
              <p className="mt-1 text-lg font-semibold tracking-tight text-slate-900">
                {totals.count
                  ? `${totals.count} produit${totals.count > 1 ? "s" : ""} · ${totals.label}`
                  : "Pas encore de configuration"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onTab("projet")}
              className="shrink-0 text-sm font-medium text-[#E85D04] hover:underline"
            >
              Onglet Projet →
            </button>
          </div>
          {detail.items.length ? (
            <ul className="mt-3">
              {detail.items.map((item) => (
                <li
                  key={item.id}
                  className="grid grid-cols-[minmax(0,1fr)_2rem_auto] items-baseline gap-4 border-t border-slate-100 px-4 py-2.5 text-sm lg:px-6"
                >
                  <span className="truncate font-medium text-slate-900">{item.name}</span>
                  <span className="tabular-nums text-slate-500">{item.quantity}</span>
                  <span className="tabular-nums text-slate-800">
                    {formatPrice(item.price_min, item.price_max)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-4 py-4 text-sm text-slate-500 lg:px-6">Les produits configurés apparaîtront ici.</p>
          )}
        </section>

        {context ? (
          <p className="border-t border-slate-200 px-4 py-3 text-sm text-slate-500 lg:px-6">
            <span className="mr-2 text-[11px] font-medium uppercase tracking-wide text-slate-400">
              Contexte du funnel
            </span>
            {context}
          </p>
        ) : null}
      </div>

      <aside className="border-t border-slate-200 lg:border-l lg:border-t-0">
        <section className="border-b border-slate-100 px-4 py-5 lg:px-5">
          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Statut</p>
          <AutoSubmitSelect
            key={quote.status_id ?? "status"}
            action={changeStatus}
            name="status_id"
            defaultValue={quote.status_id ?? ""}
            className="mt-2 w-full rounded-md border border-slate-200 px-2 py-1.5 text-sm"
          >
            {detail.statuses.map((row) => (
              <option key={row.id} value={row.id}>
                {row.label}
              </option>
            ))}
          </AutoSubmitSelect>
          <p className="mt-2 text-xs text-slate-500">{statusUnchangedLabel(lastStatusChangeAt(detail))}</p>
        </section>

        <section className="border-b border-slate-100 px-4 py-5 lg:px-5">
          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Suivi par</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {detail.members.map((member) => {
              const on = assignedIds.has(member.userId);
              return (
                <form key={member.userId} action={toggleAssignee}>
                  <input type="hidden" name="user_id" value={member.userId} />
                  <input type="hidden" name="on" value={on ? "0" : "1"} />
                  <button
                    type="submit"
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      on
                        ? "bg-orange-50 text-[#C2410C] ring-1 ring-orange-200"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {member.label}
                    {on ? " ✓" : ""}
                  </button>
                </form>
              );
            })}
          </div>
        </section>

        <QuoteValidationSection
          quoteId={quote.id}
          quote={quote}
          collaborators={detail.collaborators}
          variant="rail"
        />

        <section className="px-4 py-5 lg:px-5">
          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Historique</p>
          {journal.length ? (
            <ol className="mt-3 space-y-3">
              {journal.map((item) => (
                <li key={item.id} className="flex gap-2.5 text-sm">
                  <span
                    className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${item.hot ? "bg-[#E85D04]" : "bg-slate-300"}`}
                    aria-hidden
                  />
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900">{item.title}</p>
                    <p className="text-xs text-slate-500">{item.meta}</p>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-2 text-xs text-slate-400">Les changements s’afficheront ici.</p>
          )}
          <button
            type="button"
            onClick={() => onTab("echanges")}
            className="mt-3 text-sm font-medium text-[#E85D04] hover:underline"
          >
            Toute la timeline →
          </button>
        </section>
      </aside>
    </div>
  );
}

function FactCell({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="border-b border-slate-200 px-4 py-4 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0 lg:px-6">
      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
      <p className="mt-0.5 text-xs text-slate-500">{hint}</p>
    </div>
  );
}

function attributionHint(quote: QuoteDetail["quote"]) {
  const bits = [quote.utm_medium, quote.utm_campaign].filter(Boolean);
  return bits.length ? bits.join(" · ") : "Attribution de session";
}
