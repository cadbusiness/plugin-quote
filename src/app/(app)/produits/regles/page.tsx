import Link from "next/link";
import { redirect } from "next/navigation";
import { saveRule } from "@/app/(app)/produits/actions";
import { ListPanel, ListToolbar } from "@/components/ui/list-panel";
import { getOrgContext, isAdminRole } from "@/lib/auth/org";
import { createClient } from "@/lib/supabase/server";
import type { RuleConditions } from "@/lib/wizard/types";

export default async function RulesPage() {
  const ctx = await getOrgContext();
  if (!ctx) redirect("/onboarding");
  if (!isAdminRole(ctx.role)) redirect("/devis");

  const supabase = await createClient();
  const [{ data: rules }, { data: products }] = await Promise.all([
    supabase
      .from("suggestion_rules")
      .select("*")
      .eq("organization_id", ctx.organization.id)
      .order("priority", { ascending: false }),
    supabase
      .from("products")
      .select("id, name, is_active")
      .eq("organization_id", ctx.organization.id)
      .order("name"),
  ]);

  return (
    <ListPanel>
      <ListToolbar>
        <div className="mr-auto flex items-center gap-2">
          <Link href="/produits" className="text-sm text-slate-500 hover:text-slate-900">
            Catalogue
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-sm font-medium text-slate-900">Règles Si / Alors</span>
        </div>
        <p className="text-sm text-slate-500">
          Si le prospect répond… alors proposer ces produits. Sans code.
        </p>
      </ListToolbar>

      {(rules ?? []).length ? (
        <div className="divide-y divide-slate-100">
          {(rules ?? []).map((rule) => {
            const conditions = ((rule.conditions ?? {}) as RuleConditions).all ?? [];
            const rows = conditions.length ? conditions : [{ key: "", op: "eq" as const, value: "" }];
            return (
              <form key={rule.id} action={saveRule} className="grid gap-3 px-4 py-6 lg:px-6">
                <input type="hidden" name="id" value={rule.id} />
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="text-sm">
                    <span className="font-medium text-slate-900">Nom interne</span>
                    <input
                      name="name"
                      defaultValue={rule.name}
                      className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="text-sm">
                    <span className="font-medium text-slate-900">Priorité</span>
                    <input
                      name="priority"
                      type="number"
                      defaultValue={rule.priority}
                      className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="text-sm sm:col-span-2">
                    <span className="font-medium text-slate-900">Titre affiché</span>
                    <input
                      name="headline"
                      defaultValue={rule.headline ?? ""}
                      className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="text-sm sm:col-span-2">
                    <span className="font-medium text-slate-900">Description</span>
                    <textarea
                      name="description"
                      defaultValue={rule.description ?? ""}
                      className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                    />
                  </label>
                </div>

                <p className="text-sm font-medium text-slate-900">Si…</p>
                <div className="space-y-2">
                  {rows.map((cond, i) => (
                    <div key={`${rule.id}-${i}`} className="grid gap-2 sm:grid-cols-3">
                      <input
                        name="cond_key"
                        defaultValue={cond.key}
                        placeholder="clé (ex. type, surface)"
                        className="rounded-md border border-slate-200 px-3 py-2 text-sm"
                      />
                      <select
                        name="cond_op"
                        defaultValue={cond.op}
                        className="rounded-md border border-slate-200 px-3 py-2 text-sm"
                      >
                        <option value="eq">égal</option>
                        <option value="neq">différent</option>
                        <option value="gte">≥</option>
                        <option value="lte">≤</option>
                        <option value="contains">contient</option>
                        <option value="in">parmi</option>
                      </select>
                      <input
                        name="cond_value"
                        defaultValue={
                          Array.isArray(cond.value) ? cond.value.join(",") : String(cond.value ?? "")
                        }
                        placeholder="valeur"
                        className="rounded-md border border-slate-200 px-3 py-2 text-sm"
                      />
                    </div>
                  ))}
                </div>

                <p className="text-sm font-medium text-slate-900">Alors suggérer…</p>
                {(products ?? []).length ? (
                  <div className="grid gap-2 sm:grid-cols-3">
                    {(products ?? []).map((product) => (
                      <label key={product.id} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          name="product_ids"
                          value={product.id}
                          defaultChecked={rule.product_ids.includes(product.id)}
                        />
                        <span className={product.is_active ? "" : "text-slate-400"}>{product.name}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">
                    Aucun produit au catalogue.{" "}
                    <Link href="/produits" className="underline">
                      Ajoutez-en un
                    </Link>{" "}
                    ou connectez une boutique.
                  </p>
                )}

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="text-sm">
                    <span className="font-medium text-slate-900">Prix min</span>
                    <input
                      name="price_min"
                      type="number"
                      defaultValue={rule.price_min ?? ""}
                      className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="text-sm">
                    <span className="font-medium text-slate-900">Prix max</span>
                    <input
                      name="price_max"
                      type="number"
                      defaultValue={rule.price_max ?? ""}
                      className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                    />
                  </label>
                </div>

                <div className="text-right">
                  <button className="rounded-md bg-slate-950 px-3 py-1.5 text-sm text-white">
                    Enregistrer la règle
                  </button>
                </div>
              </form>
            );
          })}
        </div>
      ) : (
        <div className="px-4 py-16 text-center lg:px-6">
          <p className="text-sm font-medium text-slate-900">Aucune règle de suggestion</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
            Les règles naissent avec le funnel : créez-en un depuis un template pour obtenir un jeu de
            suggestions prêt à ajuster.
          </p>
        </div>
      )}
    </ListPanel>
  );
}
