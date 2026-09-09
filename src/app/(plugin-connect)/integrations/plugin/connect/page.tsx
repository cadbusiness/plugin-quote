import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthUser, getOrgContext, isAdminRole } from "@/lib/auth/org";
import { parsePluginConnectRequest } from "@/lib/integrations/plugin-connect";
import { createClient } from "@/lib/supabase/server";
import { PluginConnectForm } from "./connect-form";

export default async function PluginConnectPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(raw)) {
    if (typeof value === "string") params.set(key, value);
  }
  const request = parsePluginConnectRequest(params);
  if (!request) {
    return (
      <div className="rounded-xl border border-[#efe7de] bg-white p-6">
        <h1 className="text-xl font-semibold">Connexion plugin</h1>
        <p className="mt-2 text-sm text-slate-500">
          Ouvrez QuoteBuilder depuis le plugin WordPress : <strong>Créer un compte</strong> ou
          J’ai déjà un compte.
        </p>
        <Link href="/integrations" className="mt-4 inline-block text-sm font-medium text-[#C2410C]">
          Aller aux boutiques
        </Link>
      </div>
    );
  }

  const user = await getAuthUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(`/integrations/plugin/connect?${params}`)}`);

  const ctx = await getOrgContext();
  if (!ctx) {
    redirect(`/onboarding?next=${encodeURIComponent(`/integrations/plugin/connect?${params}`)}`);
  }

  if (!isAdminRole(ctx.role)) {
    return (
      <div className="rounded-xl border border-[#efe7de] bg-white p-6">
        <h1 className="text-xl font-semibold">Droits insuffisants</h1>
        <p className="mt-2 text-sm text-slate-500">
          Seul un admin de {ctx.organization.name} peut connecter WooCommerce.
        </p>
      </div>
    );
  }

  const supabase = await createClient();
  const { data: funnels } = await supabase
    .from("configurators")
    .select("id, name")
    .eq("organization_id", ctx.organization.id)
    .order("created_at", { ascending: true });

  if (!funnels?.length) {
    return (
      <div className="rounded-xl border border-[#efe7de] bg-white p-6">
        <h1 className="text-xl font-semibold">Créez un funnel</h1>
        <p className="mt-2 text-sm text-slate-500">
          Les produits WooCommerce arrivent dans un funnel. Créez-en un, puis reconnectez le plugin.
        </p>
        <Link href="/wizard" className="mt-4 inline-block text-sm font-medium text-[#C2410C]">
          Créer un funnel
        </Link>
      </div>
    );
  }

  return (
    <PluginConnectForm
      siteUrl={request.siteUrl}
      siteName={request.siteName}
      returnUrl={request.returnUrl}
      state={request.state}
      orgName={ctx.organization.name}
      funnels={funnels}
    />
  );
}
