import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrgContext } from "@/lib/auth/org";
import { ListPanel, ListToolbar } from "@/components/ui/list-panel";
import { saveProduct, saveRule } from "@/app/(app)/actions";
import { formatPrice } from "@/lib/format";

export default async function ProductsPage() {
  const ctx = await getOrgContext();
  if (!ctx) redirect("/onboarding");
  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("organization_id", ctx.organization.id)
    .order("name");
  const { data: rules } = await supabase
    .from("suggestion_rules")
    .select("*")
    .eq("organization_id", ctx.organization.id)
    .order("priority", { ascending: false });

  return (
    <ListPanel>
      <ListToolbar />
      <div className="divide-y divide-slate-200">
        {(products ?? []).map((product) => (
          <form key={product.id} action={saveProduct} className="grid gap-3 px-4 py-5 sm:grid-cols-2 lg:px-6">
            <input type="hidden" name="id" value={product.id} />
            <label className="text-sm">
              Nom
              <input name="name" defaultValue={product.name} className="mt-1 w-full border border-slate-200 px-2 py-1.5" />
            </label>
            <label className="text-sm">
              Tags
              <input
                name="tags"
                defaultValue={product.tags.join(", ")}
                className="mt-1 w-full border border-slate-200 px-2 py-1.5"
              />
            </label>
            <label className="text-sm sm:col-span-2">
              Description
              <textarea
                name="description"
                defaultValue={product.description ?? ""}
                className="mt-1 w-full border border-slate-200 px-2 py-1.5"
              />
            </label>
            <label className="text-sm">
              Prix min
              <input
                name="price_min"
                type="number"
                defaultValue={product.price_min ?? ""}
                className="mt-1 w-full border border-slate-200 px-2 py-1.5"
              />
            </label>
            <label className="text-sm">
              Prix max
              <input
                name="price_max"
                type="number"
                defaultValue={product.price_max ?? ""}
                className="mt-1 w-full border border-slate-200 px-2 py-1.5"
              />
            </label>
            <div className="sm:col-span-2 text-right">
              <span className="mr-3 text-xs text-slate-500">{formatPrice(product.price_min, product.price_max)}</span>
              <button className="rounded-md bg-slate-950 px-3 py-1.5 text-sm text-white">Enregistrer</button>
            </div>
          </form>
        ))}
        <section className="px-4 py-6 lg:px-6">
          <h2 className="text-lg font-semibold">Règles de suggestion</h2>
          <div className="mt-4 space-y-4">
            {(rules ?? []).map((rule) => (
              <form key={rule.id} action={saveRule} className="grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-2">
                <input type="hidden" name="id" value={rule.id} />
                <label className="text-sm">
                  Nom
                  <input name="name" defaultValue={rule.name} className="mt-1 w-full border border-slate-200 px-2 py-1.5" />
                </label>
                <label className="text-sm">
                  Priorité
                  <input
                    name="priority"
                    type="number"
                    defaultValue={rule.priority}
                    className="mt-1 w-full border border-slate-200 px-2 py-1.5"
                  />
                </label>
                <label className="text-sm sm:col-span-2">
                  Titre affiché
                  <input
                    name="headline"
                    defaultValue={rule.headline ?? ""}
                    className="mt-1 w-full border border-slate-200 px-2 py-1.5"
                  />
                </label>
                <label className="text-sm sm:col-span-2">
                  Description
                  <textarea
                    name="description"
                    defaultValue={rule.description ?? ""}
                    className="mt-1 w-full border border-slate-200 px-2 py-1.5"
                  />
                </label>
                <label className="text-sm">
                  Prix min
                  <input
                    name="price_min"
                    type="number"
                    defaultValue={rule.price_min ?? ""}
                    className="mt-1 w-full border border-slate-200 px-2 py-1.5"
                  />
                </label>
                <label className="text-sm">
                  Prix max
                  <input
                    name="price_max"
                    type="number"
                    defaultValue={rule.price_max ?? ""}
                    className="mt-1 w-full border border-slate-200 px-2 py-1.5"
                  />
                </label>
                <div className="sm:col-span-2 text-right">
                  <button className="rounded-md bg-slate-950 px-3 py-1.5 text-sm text-white">Enregistrer</button>
                </div>
              </form>
            ))}
          </div>
        </section>
      </div>
    </ListPanel>
  );
}
