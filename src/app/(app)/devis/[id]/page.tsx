import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrgContext } from "@/lib/auth/org";
import { ListPanel, ListToolbar } from "@/components/ui/list-panel";
import { formatDate, formatPrice } from "@/lib/format";
import { addQuoteNote, assignQuote, changeQuoteStatus } from "@/app/(app)/crm-actions";

export default async function QuoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const ctx = await getOrgContext();
  if (!ctx) redirect("/onboarding");
  const { id } = await params;
  const supabase = await createClient();
  const { data: quote } = await supabase
    .from("quotes")
    .select("*")
    .eq("id", id)
    .eq("organization_id", ctx.organization.id)
    .maybeSingle();
  if (!quote) notFound();

  const [{ data: items }, { data: files }, { data: statuses }, { data: members }, { data: notes }, { data: activities }] =
    await Promise.all([
      supabase.from("quote_items").select("*").eq("quote_id", quote.id),
      supabase.from("quote_files").select("*").eq("quote_id", quote.id),
      supabase.from("quote_statuses").select("*").eq("organization_id", ctx.organization.id).order("position"),
      supabase.from("memberships").select("*").eq("organization_id", ctx.organization.id).eq("status", "active"),
      supabase.from("quote_notes").select("*").eq("quote_id", quote.id).order("created_at", { ascending: false }),
      supabase.from("quote_activities").select("*").eq("quote_id", quote.id).order("created_at", { ascending: false }),
    ]);

  return (
    <ListPanel>
      <ListToolbar>
        <span className="mr-auto text-sm font-medium">{quote.contact_name}</span>
        <Link href="/devis" className="text-sm underline">
          Retour
        </Link>
      </ListToolbar>
      <div className="grid gap-8 px-4 py-6 lg:grid-cols-2 lg:px-6">
        <section>
          <h2 className="text-sm font-medium text-slate-500">Prospect</h2>
          <p className="mt-2">
            <a className="underline" href={`mailto:${quote.contact_email}`}>
              {quote.contact_email}
            </a>
          </p>
          {quote.contact_phone ? (
            <p>
              <a className="underline" href={`tel:${quote.contact_phone}`}>
                {quote.contact_phone}
              </a>
            </p>
          ) : null}
          <p>{quote.contact_company}</p>
          <p className="mt-2 text-sm text-slate-500">{formatDate(quote.created_at)}</p>
          <form
            className="mt-4 flex flex-wrap gap-2"
            action={async (formData) => {
              "use server";
              await changeQuoteStatus(quote.id, String(formData.get("status_id")));
            }}
          >
            <select name="status_id" defaultValue={quote.status_id ?? ""} className="rounded-md border border-slate-200 px-2 py-1.5 text-sm">
              {(statuses ?? []).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
            <button className="rounded-md bg-slate-950 px-3 py-1.5 text-sm text-white">Statut</button>
          </form>
          <form
            className="mt-2 flex flex-wrap gap-2"
            action={async (formData) => {
              "use server";
              await assignQuote(quote.id, String(formData.get("assigned_to") ?? ""));
            }}
          >
            <select name="assigned_to" defaultValue={quote.assigned_to ?? ""} className="rounded-md border border-slate-200 px-2 py-1.5 text-sm">
              <option value="">Non assigné</option>
              {(members ?? [])
                .filter((m) => m.user_id)
                .map((m) => (
                  <option key={m.id} value={m.user_id!}>
                    {m.invited_email || m.role}
                  </option>
                ))}
            </select>
            <button className="rounded-md border border-slate-200 px-3 py-1.5 text-sm">Assigner</button>
          </form>
        </section>
        <section>
          <h2 className="text-sm font-medium text-slate-500">Qualification</h2>
          <p className="mt-2 text-2xl font-semibold">
            {quote.score ?? "—"} <span className="text-base font-normal uppercase text-slate-500">{quote.score_label}</span>
          </p>
        </section>
        <section>
          <h2 className="text-sm font-medium text-slate-500">Paramètres</h2>
          <dl className="mt-3 space-y-1 text-sm">
            {Object.entries((quote.answers ?? {}) as Record<string, unknown>).map(([key, value]) => (
              <div key={key} className="flex justify-between gap-4 border-b border-slate-100 py-1.5">
                <dt className="text-slate-500">{key}</dt>
                <dd>{Array.isArray(value) ? value.join(", ") : String(value ?? "—")}</dd>
              </div>
            ))}
          </dl>
        </section>
        <section>
          <h2 className="text-sm font-medium text-slate-500">Configuration</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {(items ?? []).map((item) => (
              <li key={item.id} className="flex justify-between">
                <span>
                  {item.quantity} × {item.name}
                </span>
                <span>{formatPrice(item.price_min, item.price_max)}</span>
              </li>
            ))}
          </ul>
          {(files ?? []).length ? (
            <p className="mt-4 text-sm text-slate-500">{files!.length} fichier(s) joint(s)</p>
          ) : null}
        </section>
        <section>
          <h2 className="text-sm font-medium text-slate-500">Notes internes</h2>
          <form
            className="mt-3"
            action={async (formData) => {
              "use server";
              await addQuoteNote(quote.id, String(formData.get("content") ?? ""));
            }}
          >
            <textarea name="content" rows={3} required className="w-full border border-slate-200 px-3 py-2 text-sm" />
            <button className="mt-2 rounded-md bg-slate-950 px-3 py-1.5 text-sm text-white">Ajouter</button>
          </form>
          <ul className="mt-4 space-y-3 text-sm">
            {(notes ?? []).map((note) => (
              <li key={note.id} className="border-b border-slate-100 pb-2">
                <p>{note.content}</p>
                <p className="mt-1 text-xs text-slate-400">{formatDate(note.created_at)}</p>
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h2 className="text-sm font-medium text-slate-500">Timeline</h2>
          <ol className="mt-3 space-y-2 text-sm">
            {(activities ?? []).map((act) => (
              <li key={act.id} className="flex justify-between gap-4 border-b border-slate-100 py-1.5">
                <span className="text-slate-700">{labelActivity(act.type)}</span>
                <span className="shrink-0 text-slate-400">{formatDate(act.created_at)}</span>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </ListPanel>
  );
}

function labelActivity(type: string) {
  switch (type) {
    case "submitted":
      return "Soumission";
    case "status_changed":
      return "Statut modifié";
    case "assigned":
      return "Assignation";
    case "note_added":
      return "Note ajoutée";
    case "email_sent":
      return "Email envoyé";
    default:
      return type;
  }
}
