import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrgContext, isAdminRole } from "@/lib/auth/org";
import { ListPanel, ListToolbar } from "@/components/ui/list-panel";
import { importProductsCsv, saveProduct, saveRule } from "@/app/(app)/actions";
import { formatPrice } from "@/lib/format";
import type { RuleConditions } from "@/lib/wizard/types";

export default async function ProductsPage() {
  const ctx = await getOrgContext();
  if (!ctx) redirect("/onboarding");
  if (!isAdminRole(ctx.role)) redirect("/devis");
  const supabase = await createClient();
  const [{ data: products }, { data: rules }, { data: imports }] = await Promise.all([
    supabase.from("products").select("*").eq("organization_id", ctx.organization.id).order("name"),
    supabase
      .from("suggestion_rules")
      .select("*")
      .eq("organization_id", ctx.organization.id)
      .order("priority", { ascending: false }),
    supabase
      .from("product_imports")
      .select("id, row_count, source, imported_at")
      .eq("organization_id", ctx.organization.id)
      .order("imported_at", { ascending: false })
      .limit(5),
  ]);

  return (
    <ListPanel>
      <ListToolbar>
        <form action={importProductsCsv} className="mr-auto flex items-center gap-2">
          <input type="file" name="file" accept=".csv,text/csv" className="text-sm" />
          <button className="rounded-md bg-slate-950 px-3 py-1.5 text-sm text-white">Importer CSV</button>
        </form>
        <span className="text-xs text-slate-500">
          Colonnes : name, sku, description, price_min, price_max, tags, category
        </span>
        <Link href="/woocommerce" className="text-sm underline">
          Sync WooCommerce
        </Link>
      </ListToolbar>
      {(imports ?? []).length ? (
        <p className="border-b border-slate-100 px-4 py-2 text-xs text-slate-500 lg:px-6">
          Dernier import : {imports![0].row_count} lignes ({imports![0].source})
        </p>
      ) : null}
      <div className="divide-y divide-slate-200">
        {(products ?? []).map((product) => (
          <form key={product.id} action={saveProduct} className="grid gap-3 px-4 py-5 sm:grid-cols-2 lg:px-6">
            <input type="hidden" name="id" value={product.id} />
            <label className="text-sm">
              Nom
              <input name="name" defaultValue={product.name} className="mt-1 w-full border border-slate-200 px-2 py-1.5" />
            </label>
            <label className="text-sm">
              SKU
              <input name="sku" defaultValue={product.sku ?? ""} className="mt-1 w-full border border-slate-200 px-2 py-1.5" />
            </label>
            <label className="text-sm">
              Tags
              <input
                name="tags"
                defaultValue={product.tags.join(", ")}
                className="mt-1 w-full border border-slate-200 px-2 py-1.5"
              />
            </label>
            <label className="text-sm">
              Catégorie
              <input
                name="category"
                defaultValue={product.category ?? ""}
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
          <h2 className="text-lg font-semibold">Si / Alors — suggestions</h2>
          <p className="mt-1 text-sm text-slate-500">
            Si le prospect répond… alors proposer ces produits. Sans code.
          </p>
          <div className="mt-4 space-y-8">
            {(rules ?? []).map((rule) => {
              const conditions = ((rule.conditions ?? {}) as RuleConditions).all ?? [];
              const rows = conditions.length ? conditions : [{ key: "", op: "eq" as const, value: "" }];
              return (
                <form key={rule.id} action={saveRule} className="grid gap-3 border-t border-slate-100 pt-4">
                  <input type="hidden" name="id" value={rule.id} />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="text-sm">
                      Nom interne
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
                  </div>
                  <p className="text-sm font-medium">Si…</p>
                  <div className="space-y-2">
                    {rows.map((cond, i) => (
                      <div key={`${rule.id}-${i}`} className="grid gap-2 sm:grid-cols-3">
                        <input
                          name="cond_key"
                          defaultValue={cond.key}
                          placeholder="clé (ex. type, surface)"
                          className="border border-slate-200 px-2 py-1.5 text-sm"
                        />
                        <select name="cond_op" defaultValue={cond.op} className="border border-slate-200 px-2 py-1.5 text-sm">
                          <option value="eq">égal</option>
                          <option value="neq">différent</option>
                          <option value="gte">≥</option>
                          <option value="lte">≤</option>
                          <option value="contains">contient</option>
                          <option value="in">parmi</option>
                        </select>
                        <input
                          name="cond_value"
                          defaultValue={Array.isArray(cond.value) ? cond.value.join(",") : String(cond.value ?? "")}
                          placeholder="valeur"
                          className="border border-slate-200 px-2 py-1.5 text-sm"
                        />
                      </div>
                    ))}
                  </div>
                  <p className="text-sm font-medium">Alors suggérer…</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {(products ?? []).map((product) => (
                      <label key={product.id} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          name="product_ids"
                          value={product.id}
                          defaultChecked={rule.product_ids.includes(product.id)}
                        />
                        {product.name}
                      </label>
                    ))}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
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
                  </div>
                  <div className="text-right">
                    <button className="rounded-md bg-slate-950 px-3 py-1.5 text-sm text-white">Enregistrer la règle</button>
                  </div>
                </form>
              );
            })}
          </div>
        </section>
      </div>
    </ListPanel>
  );
}
