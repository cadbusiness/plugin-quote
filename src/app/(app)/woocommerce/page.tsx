import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrgContext, isAdminRole } from "@/lib/auth/org";
import { ListPanel, ListToolbar } from "@/components/ui/list-panel";
import { saveWooConnection } from "@/app/(app)/actions";

export default async function WooPage() {
  const ctx = await getOrgContext();
  if (!ctx) redirect("/onboarding");
  if (!isAdminRole(ctx.role)) redirect("/devis");
  const supabase = await createClient();
  const { data: connection } = await supabase
    .from("woo_connections")
    .select("*")
    .eq("organization_id", ctx.organization.id)
    .maybeSingle();

  return (
    <ListPanel>
      <ListToolbar>
        <p className="mr-auto text-sm text-slate-500">
          QuoteBuilder alimente WooCommerce — il ne le remplace pas.
        </p>
      </ListToolbar>
      <form action={saveWooConnection} className="grid max-w-xl gap-3 px-4 py-6 lg:px-6">
        <label className="text-sm">
          URL du site
          <input
            name="site_url"
            defaultValue={connection?.site_url ?? ""}
            placeholder="https://boutique.example.com"
            className="mt-1 w-full border border-slate-200 px-2 py-1.5"
          />
        </label>
        <label className="text-sm">
          Consumer key
          <input
            name="consumer_key"
            defaultValue={connection?.consumer_key ?? ""}
            className="mt-1 w-full border border-slate-200 px-2 py-1.5"
          />
        </label>
        <label className="text-sm">
          Consumer secret
          <input
            name="consumer_secret"
            type="password"
            defaultValue={connection?.consumer_secret ?? ""}
            className="mt-1 w-full border border-slate-200 px-2 py-1.5"
          />
        </label>
        <p className="text-xs text-slate-500">
          L’import catalogue Woo et la création de commande « Devis en attente » à la soumission
          utilisent cette connexion. Plugin WordPress : shortcode [quotebuilder].
        </p>
        <div>
          <button className="rounded-md bg-slate-950 px-3 py-1.5 text-sm text-white">Enregistrer</button>
        </div>
      </form>
    </ListPanel>
  );
}
