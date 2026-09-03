import type { ReactNode } from "react";
import Link from "next/link";
import {
  addQuoteNoteForm,
  assignQuoteForm,
  changeQuoteStatusForm,
  replyToProspectForm,
} from "@/app/(app)/crm-actions";
import { AutoSubmitSelect } from "@/components/crm/quote-controls";
import { QuoteTabs, quoteTabHref, type QuoteTab } from "@/components/crm/quote-tabs";
import { Chip, scoreTone, statusTone, type ChipTone } from "@/components/ui/chip";
import { ClickableRow } from "@/components/ui/clickable-row";
import { DataTable, ListPanel, ListToolbar } from "@/components/ui/list-panel";
import { formatPrice } from "@/lib/format";
import type { QuoteAutomation, QuoteDetail } from "@/lib/crm/quote-detail";

const AUTOMATION_TONE: Record<QuoteAutomation["state"], ChipTone> = {
  sent: "emerald",
  planned: "sky",
  due: "amber",
  skipped: "slate",
};

export function QuoteDetailView({ detail, tab }: { detail: QuoteDetail; tab: QuoteTab }) {
  const { quote, funnel, status, totals } = detail;
  const changeStatus = changeQuoteStatusForm.bind(null, quote.id);
  const changeAssignee = assignQuoteForm.bind(null, quote.id);
  const addNote = addQuoteNoteForm.bind(null, quote.id);
  const reply = replyToProspectForm.bind(null, quote.id);
  const liveAutomations = detail.automations.filter((flow) => flow.state === "due" || flow.state === "planned").length;

  return (
    <ListPanel>
      <ListToolbar>
        <div className="mr-auto flex min-w-0 flex-wrap items-center gap-2">
          <span className="truncate text-sm font-medium text-slate-900">{quote.contact_name}</span>
          {quote.contact_company ? (
            <span className="truncate text-sm text-slate-500">{quote.contact_company}</span>
          ) : null}
          <Chip tone={scoreTone(quote.score_label)}>
            {(quote.score_label ?? "—").toUpperCase()}
            {quote.score != null ? ` ${quote.score}` : ""}
          </Chip>
          <Chip tone={statusTone(status?.slug ?? quote.status)}>{status?.label ?? quote.status}</Chip>
        </div>
        <a href={`mailto:${quote.contact_email}`} className="rounded-md bg-[#E85D04] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#d35400]">
          Écrire
        </a>
        {quote.contact_phone ? (
          <a href={`tel:${quote.contact_phone}`} className="rounded-md border border-slate-200 px-3 py-1.5 text-sm">
            Appeler
          </a>
        ) : null}
        {detail.suiviUrl ? (
          <a href={detail.suiviUrl} target="_blank" rel="noreferrer" className="rounded-md border border-slate-200 px-3 py-1.5 text-sm">
            Espace prospect
          </a>
        ) : null}
        <Link href="/devis" className="text-sm text-slate-500 hover:text-slate-900">
          Retour
        </Link>
      </ListToolbar>

      <QuoteTabs
        quoteId={quote.id}
        active={tab}
        counts={{
          projet: detail.items.length,
          client: detail.siblings.length,
          echanges: detail.notes.length + detail.messages.length,
          automations: liveAutomations,
        }}
      />

      {tab === "dossier" ? <DossierTab detail={detail} changeStatus={changeStatus} changeAssignee={changeAssignee} /> : null}
      {tab === "projet" ? <ProjetTab detail={detail} /> : null}
      {tab === "client" ? <ClientTab detail={detail} /> : null}
      {tab === "echanges" ? <EchangesTab detail={detail} addNote={addNote} reply={reply} /> : null}
      {tab === "automations" ? <AutomationsTab detail={detail} /> : null}
    </ListPanel>
  );
}

function DossierTab({
  detail,
  changeStatus,
  changeAssignee,
}: {
  detail: QuoteDetail;
  changeStatus: (formData: FormData) => Promise<void>;
  changeAssignee: (formData: FormData) => Promise<void>;
}) {
  const { quote, funnel, totals } = detail;
  const lastNote = detail.notes[0];
  const lastMessage = detail.messages[detail.messages.length - 1];
  const nextFlow = detail.automations.find((flow) => flow.state === "due") ?? detail.automations.find((flow) => flow.state === "planned");

  return (
    <>
      <div className="flex flex-wrap items-center gap-x-8 gap-y-3 border-b border-slate-200 px-4 py-3.5 lg:px-6">
        <div className="flex items-center gap-2.5">
          <span className="text-[1.75rem] font-semibold leading-none tabular-nums tracking-tight text-slate-900">
            {quote.score != null ? quote.score : "—"}
          </span>
          <div>
            <Chip tone={scoreTone(quote.score_label)}>{(quote.score_label ?? "—").toUpperCase()}</Chip>
            <p className="mt-0.5 text-xs text-slate-500">{detail.scoreReasons[0] ?? "Qualification automatique"}</p>
          </div>
        </div>
        <span className="hidden h-8 w-px bg-slate-200 sm:block" aria-hidden />
        <FactMini label="Fourchette" value={totals.label} hint={`${totals.count} produit${totals.count > 1 ? "s" : ""}`} />
        <FactMini label="Reçue" value={detail.received.relative} hint={detail.received.exact} />
        <FactMini label="Source" value={detail.source} hint={attributionHint(quote)} />
        <FactMini
          label="Funnel"
          value={funnel?.name ?? "—"}
          hint={detail.assignedLabel ? `Assigné à ${detail.assignedLabel}` : "Non assigné"}
        />
      </div>

      <section className="grid gap-6 border-b border-slate-100 px-4 py-5 lg:grid-cols-[minmax(0,1fr)_16rem] lg:px-6">
        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <Fact label="Email">
            <a className="underline decoration-slate-300 underline-offset-2 hover:text-slate-900" href={`mailto:${quote.contact_email}`}>
              {quote.contact_email}
            </a>
          </Fact>
          <Fact label="Téléphone">
            {quote.contact_phone ? (
              <a className="underline decoration-slate-300 underline-offset-2 hover:text-slate-900" href={`tel:${quote.contact_phone}`}>
                {quote.contact_phone}
              </a>
            ) : (
              "—"
            )}
          </Fact>
          <Fact label="Société">{quote.contact_company || "—"}</Fact>
          <Fact label="Assigné à">{detail.assignedLabel ?? "Personne"}</Fact>
        </dl>
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium uppercase tracking-wide text-slate-500">Statut</label>
          <AutoSubmitSelect
            key={quote.status_id ?? "status"}
            action={changeStatus}
            name="status_id"
            defaultValue={quote.status_id ?? ""}
            className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-sm"
          >
            {detail.statuses.map((row) => (
              <option key={row.id} value={row.id}>
                {row.label}
              </option>
            ))}
          </AutoSubmitSelect>
          <label className="mt-2 text-xs font-medium uppercase tracking-wide text-slate-500">Commercial</label>
          <AutoSubmitSelect
            key={quote.assigned_to ?? "assignee"}
            action={changeAssignee}
            name="assigned_to"
            defaultValue={quote.assigned_to ?? ""}
            className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-sm"
          >
            <option value="">Non assigné</option>
            {detail.members.map((member) => (
              <option key={member.userId} value={member.userId}>
                {member.label}
              </option>
            ))}
          </AutoSubmitSelect>
        </div>
      </section>

      {detail.scoreReasons.length ? (
        <div className="flex flex-wrap gap-1.5 border-b border-slate-100 px-4 py-3 lg:px-6">
          <span className="mr-1 text-xs font-medium uppercase tracking-wide text-slate-500">Pourquoi ce score</span>
          {detail.scoreReasons.map((reason) => (
            <Chip key={reason} tone="orange">
              {reason}
            </Chip>
          ))}
        </div>
      ) : null}

      <div className="grid border-b border-slate-100 lg:grid-cols-3">
        <Snapshot
          label="Projet"
          href={quoteTabHref(quote.id, "projet")}
          title={totals.count ? `${totals.count} produits · ${totals.label}` : "Pas encore de configuration"}
          detail={detail.items[0] ? detail.items.map((item) => `${item.quantity} × ${item.name}`).join(" · ") : "Les réponses et la config sont dans l’onglet Projet."}
        />
        <Snapshot
          label="Dernier échange"
          href={quoteTabHref(quote.id, "echanges")}
          title={lastMessage ? lastMessage.content : lastNote ? lastNote.content : "Aucun échange"}
          detail={lastMessage ? `${lastMessage.sender === "prospect" ? "Prospect" : "Équipe"} · ${lastMessage.when}` : lastNote ? `Note · ${lastNote.when}` : "Notes et messages dans Échanges."}
        />
        <Snapshot
          label="Automatisation"
          href={quoteTabHref(quote.id, "automations")}
          title={nextFlow ? nextFlow.title : "Aucun flux en cours"}
          detail={nextFlow ? `${nextFlow.stateLabel} · ${nextFlow.when ?? nextFlow.hint}` : "Voir le parcours email de cette demande."}
        />
      </div>
    </>
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
                  <td className="px-4 py-2.5 text-slate-500 lg:px-6">{item.optionsLabel ?? "—"}</td>
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

function ClientTab({ detail }: { detail: QuoteDetail }) {
  const { quote } = detail;
  return (
    <>
      <section>
        <SectionTitle>Fiche client</SectionTitle>
        <dl className="grid grid-cols-2 gap-x-8 gap-y-3 border-b border-slate-100 px-4 py-4 text-sm lg:grid-cols-3 lg:px-6">
          <Fact label="Nom">{quote.contact_name}</Fact>
          <Fact label="Société">{quote.contact_company || "—"}</Fact>
          <Fact label="Email">
            <a className="underline decoration-slate-300 underline-offset-2" href={`mailto:${quote.contact_email}`}>
              {quote.contact_email}
            </a>
          </Fact>
          <Fact label="Téléphone">
            {quote.contact_phone ? (
              <a className="underline decoration-slate-300 underline-offset-2" href={`tel:${quote.contact_phone}`}>
                {quote.contact_phone}
              </a>
            ) : (
              "—"
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
          <Fact label="Medium">{quote.utm_medium || "—"}</Fact>
          <Fact label="Campagne">{quote.utm_campaign || "—"}</Fact>
          <Fact label="Contenu">{quote.utm_content || "—"}</Fact>
          <Fact label="Terme">{quote.utm_term || "—"}</Fact>
          <Fact label="Référent">{quote.referrer ? hostOf(quote.referrer) ?? quote.referrer : "—"}</Fact>
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
                  {(row.scoreLabel ?? "—").toUpperCase()}
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
  addNote,
  reply,
}: {
  detail: QuoteDetail;
  addNote: (formData: FormData) => Promise<void>;
  reply: (formData: FormData) => Promise<void>;
}) {
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
          <SectionTitle>Messages prospect</SectionTitle>
          <div className="space-y-2 px-4 pt-3 lg:px-6">
            {detail.messages.length === 0 ? (
              <p className="text-sm text-slate-400">Aucun échange pour le moment.</p>
            ) : (
              detail.messages.map((message) => (
                <div
                  key={message.id}
                  className={`max-w-[90%] rounded-xl px-3 py-2 text-sm ${
                    message.sender === "prospect" ? "bg-slate-950 text-white" : "ml-auto bg-orange-50 text-orange-950"
                  }`}
                >
                  <p>{message.content}</p>
                  <p className={`mt-1 text-[11px] ${message.sender === "prospect" ? "text-white/60" : "text-orange-800/70"}`}>
                    {message.sender === "prospect" ? "Prospect" : "Équipe"} · {message.when}
                  </p>
                </div>
              ))
            )}
          </div>
          <form action={reply} className="mt-3 flex gap-2 px-4 pb-4 lg:px-6">
            <input
              name="content"
              required
              placeholder="Répondre au prospect…"
              className="min-w-0 flex-1 rounded-md border border-slate-200 px-3 py-2 text-sm"
            />
            <button className="rounded-md bg-slate-950 px-3 py-2 text-sm text-white">Envoyer</button>
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
        <DataTable headers={["Flux", "Déclencheur", "Délai", "Destinataire", "État"]}>
          {detail.automations.map((flow) => (
            <tr key={flow.id} className="border-b border-slate-100">
              <td className="px-4 py-2.5 lg:px-6">
                <div className="font-medium">{flow.title}</div>
                <div className="text-xs text-slate-500">{flow.hint}</div>
              </td>
              <td className="px-4 py-2.5 text-slate-500 lg:px-6">{flow.triggerLabel}</td>
              <td className="px-4 py-2.5 tabular-nums lg:px-6">{flow.delayLabel}</td>
              <td className="px-4 py-2.5 lg:px-6">{flow.recipientLabel}</td>
              <td className="px-4 py-2.5 lg:px-6">
                <Chip tone={AUTOMATION_TONE[flow.state]}>{flow.stateLabel}</Chip>
                {flow.when ? <div className="mt-1 text-xs text-slate-400">{flow.when}</div> : null}
              </td>
            </tr>
          ))}
        </DataTable>
      ) : (
        <Empty>Aucun flux actif pour cette organisation.</Empty>
      )}
    </section>
  );
}

function Snapshot({
  label,
  href,
  title,
  detail,
}: {
  label: string;
  href: string;
  title: string;
  detail: string;
}) {
  return (
    <Link href={href} className="block border-b border-slate-100 px-4 py-4 last:border-b-0 hover:bg-orange-50/40 lg:border-b-0 lg:border-r lg:last:border-r-0 lg:px-6">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 line-clamp-2 text-sm font-medium text-slate-900">{title}</p>
      <p className="mt-1 line-clamp-2 text-sm text-slate-500">{detail}</p>
    </Link>
  );
}

function FactMini({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-slate-900">{value}</p>
      <p className="text-xs text-slate-500">{hint}</p>
    </div>
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

function attributionHint(quote: QuoteDetail["quote"]) {
  const bits = [quote.utm_medium, quote.utm_campaign].filter(Boolean);
  return bits.length ? bits.join(" · ") : "Attribution de session";
}

function hostOf(referrer: string) {
  try {
    return new URL(referrer).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}
