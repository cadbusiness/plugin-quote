import Link from "next/link";
import {
  addQuoteNoteForm,
  assignQuoteForm,
  changeQuoteStatusForm,
  replyToProspectForm,
} from "@/app/(app)/crm-actions";
import { AutoSubmitSelect } from "@/components/crm/quote-controls";
import { Chip, scoreTone, statusTone } from "@/components/ui/chip";
import { DataTable, ListPanel, ListToolbar } from "@/components/ui/list-panel";
import { formatPrice } from "@/lib/format";
import type { QuoteDetail } from "@/lib/crm/quote-detail";

export function QuoteDetailView({ detail }: { detail: QuoteDetail }) {
  const { quote, funnel, status, totals } = detail;
  const changeStatus = changeQuoteStatusForm.bind(null, quote.id);
  const changeAssignee = assignQuoteForm.bind(null, quote.id);
  const addNote = addQuoteNoteForm.bind(null, quote.id);
  const reply = replyToProspectForm.bind(null, quote.id);

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

      <div className="grid grid-cols-2 border-b border-slate-200 lg:grid-cols-5">
        <Kpi
          label="Score"
          value={quote.score != null ? String(quote.score) : "—"}
          hint={detail.scoreReasons[0] ?? "Qualification automatique"}
          bordered
        />
        <Kpi label="Fourchette" value={totals.label} hint={`${totals.count} ligne${totals.count > 1 ? "s" : ""}`} bordered />
        <Kpi
          label="Reçue"
          value={detail.received.relative}
          hint={detail.received.exact}
          bordered
        />
        <Kpi label="Source" value={detail.source} hint={attributionHint(quote)} bordered />
        <Kpi
          label="Funnel"
          value={funnel?.name ?? "—"}
          hint={detail.assignedLabel ? `Assigné à ${detail.assignedLabel}` : "Non assigné"}
        />
      </div>

      <section className="grid gap-6 border-b border-slate-100 px-4 py-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.8fr)] lg:px-6">
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
          {quote.utm_campaign ? <Fact label="Campagne">{quote.utm_campaign}</Fact> : null}
          {quote.referrer ? (
            <Fact label="Référent">
              <span className="break-all">{hostOf(quote.referrer) ?? quote.referrer}</span>
            </Fact>
          ) : null}
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

      {detail.scoreReasons.length > 1 ? (
        <div className="flex flex-wrap gap-1.5 border-b border-slate-100 px-4 py-3 lg:px-6">
          <span className="mr-1 text-xs font-medium uppercase tracking-wide text-slate-500">Pourquoi ce score</span>
          {detail.scoreReasons.map((reason) => (
            <Chip key={reason} tone="orange">
              {reason}
            </Chip>
          ))}
        </div>
      ) : null}

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
              <span className="font-semibold tabular-nums text-slate-900">{totals.label}</span>
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
    </ListPanel>
  );
}

function Kpi({
  label,
  value,
  hint,
  bordered,
}: {
  label: string;
  value: string;
  hint: string;
  bordered?: boolean;
}) {
  return (
    <div className={`px-4 py-5 lg:px-6 ${bordered ? "border-r border-slate-200" : ""}`}>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 truncate text-2xl font-semibold tracking-tight text-slate-900 lg:text-3xl">{value}</p>
      <p className="mt-1 truncate text-sm text-slate-500">{hint}</p>
    </div>
  );
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-0.5 text-slate-900">{children}</dd>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="border-b border-slate-100 px-4 py-2 text-xs font-medium uppercase tracking-wide text-slate-500 lg:px-6">
      {children}
    </p>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
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
