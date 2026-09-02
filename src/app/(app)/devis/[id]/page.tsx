import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrgContext } from "@/lib/auth/org";
import { ListPanel, ListToolbar } from "@/components/ui/list-panel";
import { formatDate, formatPrice } from "@/lib/format";
import { updateQuoteStatus } from "@/app/(app)/actions";

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

  const { data: items } = await supabase.from("quote_items").select("*").eq("quote_id", quote.id);
  const { data: files } = await supabase.from("quote_files").select("*").eq("quote_id", quote.id);

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
          <p className="mt-2">{quote.contact_email}</p>
          <p>{quote.contact_phone}</p>
          <p>{quote.contact_company}</p>
          <p className="mt-2 text-sm text-slate-500">{formatDate(quote.created_at)}</p>
          <form
            className="mt-4"
            action={async (formData) => {
              "use server";
              await updateQuoteStatus(quote.id, String(formData.get("status")));
            }}
          >
            <select name="status" defaultValue={quote.status} className="rounded-md border border-slate-200 px-2 py-1.5 text-sm">
              <option value="new">Nouveau</option>
              <option value="contacted">Contacté</option>
              <option value="won">Gagné</option>
              <option value="lost">Perdu</option>
            </select>
            <button className="ml-2 rounded-md bg-slate-950 px-3 py-1.5 text-sm text-white">Mettre à jour</button>
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
            <p className="mt-4 text-sm text-slate-500">
              {files!.length} fichier(s) joint(s)
            </p>
          ) : null}
        </section>
      </div>
    </ListPanel>
  );
}
