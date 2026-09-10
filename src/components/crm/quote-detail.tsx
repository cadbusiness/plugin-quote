"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { ChevronLeft, Mail, Phone } from "lucide-react";
import { replaceClientUrl } from "@/components/ui/local-tabs";
import {
  addQuoteNoteForm,
  changeQuoteStatusForm,
  logQuoteCallForm,
  replyToProspectForm,
  toggleQuoteAssigneeForm,
} from "@/app/(app)/crm-actions";
import { DossierTab } from "@/components/crm/quote-dossier";
import { QuoteTabs, quoteTabHref, type QuoteCompose, type QuoteTab } from "@/components/crm/quote-tabs";
import { Chip, scoreTone, statusTone, type ChipTone } from "@/components/ui/chip";
import { ClickableRow } from "@/components/ui/clickable-row";
import { DataTable, ListPanel } from "@/components/ui/list-panel";
import { formatPrice } from "@/lib/format";
import type { QuoteAutomation, QuoteDetail } from "@/lib/crm/quote-detail";

const AUTOMATION_TONE: Record<QuoteAutomation["state"], ChipTone> = {
  running: "sky",
  waiting: "amber",
  completed: "emerald",
  failed: "rose",
  exited: "slate",
};

export function QuoteDetailView({
  detail,
  tab: initialTab,
  compose: initialCompose,
}: {
  detail: QuoteDetail;
  tab: QuoteTab;
  compose: QuoteCompose | null;
}) {
  const { quote, status } = detail;
  const [tab, setTab] = useState(initialTab);
  const [compose, setCompose] = useState(initialCompose);
  const changeStatus = changeQuoteStatusForm.bind(null, quote.id);
  const toggleAssignee = toggleQuoteAssigneeForm.bind(null, quote.id);
  const addNote = addQuoteNoteForm.bind(null, quote.id);
  const reply = replyToProspectForm.bind(null, quote.id);
  const logCall = logQuoteCallForm.bind(null, quote.id);
  const liveAutomations = detail.automations.filter((flow) => flow.state === "waiting" || flow.state === "running").length;
  const callCount = detail.activities.filter((act) => act.type === "call_logged").length;

  function openTab(next: QuoteTab, nextCompose: QuoteCompose | null = null) {
    setTab(next);
    setCompose(nextCompose);
    replaceClientUrl(quoteTabHref(quote.id, next, nextCompose));
  }

  const contactLine = [quote.contact_company, quote.contact_email, quote.contact_phone].filter(Boolean).join(" · ");

  return (
    <ListPanel>
      <div className="sticky top-0 z-20 bg-white">
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 px-4 py-3 lg:px-6">
          <Link
            href="/devis"
            className="inline-flex shrink-0 items-center gap-0.5 rounded-full border border-slate-200 px-2.5 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
            Demandes
          </Link>
          <div className="mr-auto min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="truncate text-base font-semibold tracking-tight text-slate-900">{quote.contact_name}</span>
              <Chip tone={scoreTone(quote.score_label)}>
                {(quote.score_label ?? "-").toUpperCase()}
                {quote.score != null ? ` ${quote.score}` : ""}
              </Chip>
              <Chip tone={statusTone(status?.slug ?? quote.status)}>{status?.label ?? quote.status}</Chip>
            </div>
            {contactLine ? <p className="mt-0.5 truncate text-sm text-slate-500">{contactLine}</p> : null}
          </div>
          <button
            type="button"
            onClick={() => openTab("echanges", "mail")}
            className="rounded-md bg-[#E85D04] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#d35400]"
          >
            Écrire
          </button>
          {quote.contact_phone ? (
            <button
              type="button"
              onClick={() => openTab("echanges", "call")}
              className="rounded-md border border-slate-200 px-3 py-1.5 text-sm hover:bg-slate-50"
            >
              Appeler
            </button>
          ) : null}
          {detail.suiviUrl ? (
            <a
              href={detail.suiviUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-md border border-slate-200 px-3 py-1.5 text-sm"
            >
              Espace prospect
            </a>
          ) : null}
        </div>

        <QuoteTabs
          quoteId={quote.id}
          active={tab}
          onSelect={(next) => openTab(next)}
          counts={{
            projet: detail.items.length,
            client: detail.siblings.length,
            echanges: detail.notes.length + detail.messages.length + callCount,
            automations: liveAutomations,
          }}
        />
      </div>

      {tab === "dossier" ? (
        <DossierTab detail={detail} changeStatus={changeStatus} toggleAssignee={toggleAssignee} onTab={openTab} />
      ) : null}
      {tab === "projet" ? <ProjetTab detail={detail} /> : null}
      {tab === "client" ? (
        <ClientTab
          detail={detail}
          onWrite={() => openTab("echanges", "mail")}
          onCall={() => openTab("echanges", "call")}
        />
      ) : null}
      {tab === "echanges" ? <EchangesTab detail={detail} compose={compose} addNote={addNote} reply={reply} logCall={logCall} /> : null}
      {tab === "automations" ? <AutomationsTab detail={detail} /> : null}
    </ListPanel>
  );
}

function ProjetTab({ detail }: { detail: QuoteDetail }) {
  return (
    <>
      <section>
        <SectionTitle>Réponses du funnel</SectionTitle>
        {detail.answers.length ? (
          <dl>
            {detail.answers.map((row) => (
              <div
                key={row.key}
                className="grid grid-cols-[minmax(8rem,16rem)_minmax(0,1fr)] gap-4 border-b border-slate-100 px-4 py-2.5 text-sm lg:px-6"
              >
                <dt className="text-slate-500">{row.label}</dt>
                <dd className="font-medium text-slate-900">{row.value}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <Empty>Aucune réponse enregistrée. Le prospect n’a pas encore cadré son projet dans le funnel.</Empty>
        )}
      </section>

      <section>
        <SectionTitle>Configuration demandée</SectionTitle>
        {detail.items.length ? (
          <>
            <DataTable headers={["Produit", "Qté", "Options", "Fourchette"]}>
              {detail.items.map((item) => (
                <tr key={item.id} className="border-b border-slate-100">
                  <td className="px-4 py-2.5 lg:px-6">
                    <div className="flex items-center gap-3">
                      {item.productImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.productImage} alt="" className="h-10 w-10 shrink-0 rounded-md object-cover ring-1 ring-slate-200" />
                      ) : null}
                      <div>
                        <div className="font-medium text-slate-900">{item.name}</div>
                        {item.productSku ? <div className="text-xs text-slate-500">{item.productSku}</div> : null}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 tabular-nums lg:px-6">{item.quantity}</td>
                  <td className="px-4 py-2.5 text-slate-500 lg:px-6">{item.optionsLabel ?? "-"}</td>
                  <td className="px-4 py-2.5 tabular-nums lg:px-6">{formatPrice(item.price_min, item.price_max)}</td>
                </tr>
              ))}
            </DataTable>
            <div className="flex justify-between border-b border-slate-200 px-4 py-3 text-sm lg:px-6">
              <span className="text-slate-500">Total indicatif</span>
              <span className="font-semibold tabular-nums text-slate-900">{detail.totals.label}</span>
            </div>
          </>
        ) : (
          <Empty>Pas encore de produits associés. Les suggestions du funnel apparaîtront ici.</Empty>
        )}
      </section>

      <section>
        <SectionTitle>Pièces jointes</SectionTitle>
        {detail.files.length ? (
          <ul>
            {detail.files.map((file) => (
              <li key={file.id} className="flex items-center justify-between gap-4 border-b border-slate-100 px-4 py-2.5 text-sm lg:px-6">
                <span className="min-w-0 truncate font-medium">{file.file_name}</span>
                {file.url ? (
                  <a href={file.url} target="_blank" rel="noreferrer" className="shrink-0 text-[#E85D04] hover:underline">
                    Ouvrir
                  </a>
                ) : (
                  <span className="shrink-0 text-xs text-slate-400">{file.when}</span>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <Empty>Aucun fichier. Plans et photos envoyés par le prospect s’afficheront ici.</Empty>
        )}
      </section>
    </>
  );
}

function ClientTab({
  detail,
  onWrite,
  onCall,
}: {
  detail: QuoteDetail;
  onWrite: () => void;
  onCall: () => void;
}) {
  const { quote } = detail;
  return (
    <>
      <section>
        <SectionTitle>Fiche client</SectionTitle>
        <dl className="grid grid-cols-2 gap-x-8 gap-y-3 border-b border-slate-100 px-4 py-4 text-sm lg:grid-cols-3 lg:px-6">
          <Fact label="Nom">{quote.contact_name}</Fact>
          <Fact label="Société">{quote.contact_company || "-"}</Fact>
          <Fact label="Email">
            <span className="inline-flex items-center gap-1.5">
              <span>{quote.contact_email}</span>
              <button type="button" onClick={onWrite} aria-label="Écrire un email" className="rounded p-0.5 text-slate-400 hover:bg-orange-50 hover:text-[#E85D04]">
                <Mail className="h-3.5 w-3.5" />
              </button>
            </span>
          </Fact>
          <Fact label="Téléphone">
            {quote.contact_phone ? (
              <span className="inline-flex items-center gap-1.5">
                <span>{quote.contact_phone}</span>
                <button type="button" onClick={onCall} aria-label="Appeler" className="rounded p-0.5 text-slate-400 hover:bg-orange-50 hover:text-[#E85D04]">
                  <Phone className="h-3.5 w-3.5" />
                </button>
              </span>
            ) : (
              "-"
            )}
          </Fact>
          <Fact label="Demandes">{detail.siblings.length}</Fact>
          <Fact label="Espace prospect">
            {detail.suiviUrl ? (
              <a href={detail.suiviUrl} target="_blank" rel="noreferrer" className="text-[#E85D04] hover:underline">
                Ouvrir{detail.suiviLastAccess ? ` · vu ${detail.suiviLastAccess}` : ""}
              </a>
            ) : (
              "Pas encore créé"
            )}
          </Fact>
        </dl>
      </section>

      <section>
        <SectionTitle>Attribution</SectionTitle>
        <dl className="grid grid-cols-2 gap-x-8 gap-y-3 border-b border-slate-100 px-4 py-4 text-sm lg:grid-cols-3 lg:px-6">
          <Fact label="Source">{detail.source}</Fact>
          <Fact label="Medium">{quote.utm_medium || "-"}</Fact>
          <Fact label="Campagne">{quote.utm_campaign || "-"}</Fact>
          <Fact label="Contenu">{quote.utm_content || "-"}</Fact>
          <Fact label="Terme">{quote.utm_term || "-"}</Fact>
          <Fact label="gclid">{quote.gclid || quote.gbraid || quote.wbraid || "-"}</Fact>
          <Fact label="Référent">{quote.referrer ? hostOf(quote.referrer) ?? quote.referrer : "-"}</Fact>
        </dl>
      </section>

      <section>
        <SectionTitle>Demandes de ce client</SectionTitle>
        <DataTable headers={["Demande", "Score", "Statut", "Date"]}>
          {detail.siblings.map((row) => (
            <ClickableRow
              key={row.id}
              href={quoteTabHref(row.id, "dossier")}
              className={row.current ? "bg-orange-50/50" : ""}
            >
              <td className="px-4 py-2.5 lg:px-6">
                <div className="font-medium">
                  {row.contactName}
                  {row.current ? <span className="ml-2 text-xs font-normal text-[#C2410C]">Cette fiche</span> : null}
                </div>
                <div className="text-slate-500">{row.company ?? quote.contact_email}</div>
              </td>
              <td className="px-4 py-2.5 lg:px-6">
                <Chip tone={scoreTone(row.scoreLabel)}>
                  {(row.scoreLabel ?? "-").toUpperCase()}
                  {row.score != null ? ` ${row.score}` : ""}
                </Chip>
              </td>
              <td className="px-4 py-2.5 lg:px-6">
                <Chip tone={statusTone(row.statusSlug)}>{row.statusLabel}</Chip>
              </td>
              <td className="px-4 py-2.5 text-slate-500 lg:px-6">{row.when}</td>
            </ClickableRow>
          ))}
        </DataTable>
      </section>
    </>
  );
}

function EchangesTab({
  detail,
  compose,
  addNote,
  reply,
  logCall,
}: {
  detail: QuoteDetail;
  compose: QuoteCompose | null;
  addNote: (formData: FormData) => Promise<void>;
  reply: (formData: FormData) => Promise<void>;
  logCall: (formData: FormData) => Promise<void>;
}) {
  const phone = detail.quote.contact_phone;
  const calls = detail.activities.filter((act) => act.type === "call_logged");
  const thread = [
    ...detail.messages.map((message) => ({
      id: message.id,
      kind: "mail" as const,
      at: message.sent_at,
      when: message.when,
      content: message.content,
      sender: message.sender,
    })),
    ...calls.map((act) => ({
      id: act.id,
      kind: "call" as const,
      at: act.created_at,
      when: act.when,
      content: act.detail ?? "Appel",
      sender: "team",
    })),
  ].sort((a, b) => a.at.localeCompare(b.at));

  return (
    <>
      <div className="grid border-b border-slate-100 lg:grid-cols-2">
        <section className="border-b border-slate-100 lg:border-b-0 lg:border-r">
          <SectionTitle>Notes internes</SectionTitle>
          <form action={addNote} className="px-4 pt-3 lg:px-6">
            <textarea
              name="content"
              rows={3}
              required
              placeholder="Point d’avancement, prochain appel, contrainte chantier…"
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
            />
            <button className="mt-2 rounded-md bg-slate-950 px-3 py-1.5 text-sm text-white">Ajouter</button>
          </form>
          {detail.notes.length ? (
            <ul className="mt-2">
              {detail.notes.map((note) => (
                <li key={note.id} className="border-t border-slate-100 px-4 py-3 text-sm lg:px-6">
                  <p className="whitespace-pre-wrap text-slate-800">{note.content}</p>
                  <p className="mt-1 text-xs text-slate-400">{note.when}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-4 py-4 text-sm text-slate-400 lg:px-6">Rien de noté pour l’instant.</p>
          )}
        </section>

        <section>
          <SectionTitle>Emails et appels</SectionTitle>
          {compose === "call" ? (
            <div className="space-y-3 border-b border-slate-100 px-4 py-3 lg:px-6">
              {phone ? (
                <a href={`tel:${phone}`} className="inline-flex items-center gap-1.5 rounded-md bg-[#E85D04] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#d35400]">
                  <Phone className="h-3.5 w-3.5" />
                  Appeler {phone}
                </a>
              ) : (
                <p className="text-sm text-slate-500">Pas de numéro. Notez quand même l’appel.</p>
              )}
              <form action={logCall}>
                <textarea
                  name="note"
                  rows={2}
                  autoFocus
                  placeholder="Compte-rendu : décroché, rappel, devis envoyé…"
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                />
                <button className="mt-2 rounded-md bg-slate-950 px-3 py-1.5 text-sm text-white">Noter l’appel</button>
              </form>
            </div>
          ) : null}
          <div className="space-y-2 px-4 pt-3 lg:px-6">
            {thread.length === 0 ? (
              <p className="text-sm text-slate-400">Aucun échange pour le moment.</p>
            ) : (
              thread.map((item) =>
                item.kind === "call" ? (
                  <div key={item.id} className="max-w-[90%] rounded-xl bg-sky-50 px-3 py-2 text-sm text-sky-950">
                    <p className="inline-flex items-center gap-1.5 font-medium">
                      <Phone className="h-3.5 w-3.5" />
                      Appel
                    </p>
                    <p className="mt-1">{item.content}</p>
                    <p className="mt-1 text-[11px] text-sky-800/70">Équipe · {item.when}</p>
                  </div>
                ) : (
                  <div
                    key={item.id}
                    className={`max-w-[90%] rounded-xl px-3 py-2 text-sm ${
                      item.sender === "prospect" ? "bg-slate-950 text-white" : "ml-auto bg-orange-50 text-orange-950"
                    }`}
                  >
                    <p>{item.content}</p>
                    <p className={`mt-1 text-[11px] ${item.sender === "prospect" ? "text-white/60" : "text-orange-800/70"}`}>
                      {item.sender === "prospect" ? "Prospect" : "Email"} · {item.when}
                    </p>
                  </div>
                ),
              )
            )}
          </div>
          <form action={reply} className="mt-3 px-4 pb-4 lg:px-6">
            <textarea
              name="content"
              required
              rows={compose === "mail" ? 3 : 2}
              autoFocus={compose === "mail"}
              placeholder={`Email à ${detail.quote.contact_email}…`}
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
            />
            <button className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-slate-950 px-3 py-1.5 text-sm text-white">
              <Mail className="h-3.5 w-3.5" />
              Envoyer l’email
            </button>
          </form>
        </section>
      </div>

      <section>
        <SectionTitle>Timeline</SectionTitle>
        {detail.activities.length ? (
          <ol>
            {detail.activities.map((act) => (
              <li
                key={act.id}
                className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 border-b border-slate-100 px-4 py-2.5 text-sm lg:px-6"
              >
                <div>
                  <span className="font-medium text-slate-900">{act.label}</span>
                  {act.detail ? <span className="text-slate-500"> · {act.detail}</span> : null}
                </div>
                <span className="shrink-0 text-slate-400">{act.when}</span>
              </li>
            ))}
          </ol>
        ) : (
          <Empty>La timeline se remplit dès la soumission, les emails et les changements de statut.</Empty>
        )}
      </section>
    </>
  );
}

function AutomationsTab({ detail }: { detail: QuoteDetail }) {
  return (
    <section>
      <SectionTitle>Parcours de cette demande</SectionTitle>
      {detail.automations.length ? (
        <ul>
          {detail.automations.map((flow) => (
            <li key={flow.id} className="border-b border-slate-100">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 px-4 py-3 lg:px-6">
                <div>
                  <div className="font-medium text-slate-900">{flow.title}</div>
                  <div className="mt-0.5 text-xs text-slate-500">
                    {flow.triggerLabel} · {flow.hint}
                  </div>
                </div>
                <div className="text-right">
                  <Chip tone={AUTOMATION_TONE[flow.state]}>{flow.stateLabel}</Chip>
                  {flow.when ? <div className="mt-1 text-xs text-slate-400">{flow.when}</div> : null}
                </div>
              </div>
              {flow.steps.length ? (
                <ol className="border-t border-slate-50 px-4 py-2 lg:px-6">
                  {flow.steps.map((step) => (
                    <li key={step.id} className="flex items-center justify-between gap-3 py-1 text-sm">
                      <span>
                        {step.label}
                        {step.error ? <span className="text-rose-600">, {step.error}</span> : null}
                      </span>
                      <span className="shrink-0 text-xs text-slate-400">
                        {step.statusLabel} · {step.when}
                      </span>
                    </li>
                  ))}
                </ol>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <Empty>Aucun parcours n’a encore démarré pour cette demande.</Empty>
      )}
    </section>
  );
}

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-0.5 text-slate-900">{children}</dd>
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

function hostOf(referrer: string) {
  try {
    return new URL(referrer).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}
