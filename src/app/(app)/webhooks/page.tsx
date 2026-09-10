import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrgContext, isAdminRole } from "@/lib/auth/org";
import { DataTable, ListPanel, ListToolbar } from "@/components/ui/list-panel";
import { saveWebhook, toggleWebhook } from "@/app/(app)/actions";
import { consumeApiKeyFlash, createApiKey, revokeApiKey } from "@/app/(app)/webhooks/actions";
import { listOrgApiKeys } from "@/lib/api/keys";
import { formatDate } from "@/lib/format";
import { ApiKeyCreatedBanner } from "@/components/integrations/api-key-created-banner";

export default async function WebhooksPage() {
  const ctx = await getOrgContext();
  if (!ctx) redirect("/onboarding");
  if (!isAdminRole(ctx.role)) redirect("/devis");

  const createdToken = await consumeApiKeyFlash();
  const supabase = await createClient();
  const [{ data: hooks }, { data: deliveries }, apiKeys] = await Promise.all([
    supabase
      .from("webhooks")
      .select("*")
      .eq("organization_id", ctx.organization.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("webhook_deliveries")
      .select("id, webhook_id, status, created_at, status_code, last_error")
      .eq("organization_id", ctx.organization.id)
      .order("created_at", { ascending: false })
      .limit(50),
    listOrgApiKeys(ctx.organization.id),
  ]);

  return (
    <ListPanel>
      <ListToolbar />
      {createdToken ? <ApiKeyCreatedBanner token={createdToken} /> : null}

      <div className="border-b border-slate-200 px-4 py-4 lg:px-6">
        <h2 className="mb-1 text-sm font-medium text-slate-900">Clés API (MCP / Claude)</h2>
        <p className="mb-3 text-sm text-slate-500">
          Utilisez une clé <code className="text-xs">qb_live_…</code> dans Claude Desktop pour piloter
          leads, stats et relances.
        </p>
        <form action={createApiKey} className="flex flex-wrap gap-2">
          <input
            name="name"
            placeholder="MCP / Claude Desktop"
            className="min-w-64 flex-1 border border-slate-200 px-3 py-2 text-sm"
          />
          <button className="rounded-md bg-[#E85D04] px-3 py-2 text-sm font-medium text-white">
            Créer une clé
          </button>
        </form>
        <ul className="mt-4 space-y-2 text-sm">
          {apiKeys.map((key) => (
            <li key={key.id} className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="font-medium text-slate-900">{key.name}</span>
                <span className="ml-2 font-mono text-xs text-slate-500">{key.key_prefix}…</span>
                <span className="ml-2 text-xs text-slate-400">
                  {key.revoked_at
                    ? `révoquée ${formatDate(key.revoked_at)}`
                    : key.last_used_at
                      ? `utilisée ${formatDate(key.last_used_at)}`
                      : `créée ${formatDate(key.created_at)}`}
                </span>
              </div>
              {!key.revoked_at ? (
                <form action={revokeApiKey}>
                  <input type="hidden" name="id" value={key.id} />
                  <button className="underline text-slate-600">Révoquer</button>
                </form>
              ) : (
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">Révoquée</span>
              )}
            </li>
          ))}
          {!apiKeys.length ? (
            <li className="text-slate-500">Aucune clé API pour le moment.</li>
          ) : null}
        </ul>
      </div>

      <form action={saveWebhook} className="flex flex-wrap gap-2 border-b border-slate-200 px-4 py-4 lg:px-6">
        <input
          name="url"
          required
          placeholder="https://crm.example.com/hooks/quotes"
          className="min-w-64 flex-1 border border-slate-200 px-3 py-2 text-sm"
        />
        <input
          name="secret"
          required
          placeholder="Secret HMAC"
          className="w-56 border border-slate-200 px-3 py-2 text-sm"
        />
        <button className="rounded-md bg-slate-950 px-3 py-2 text-sm text-white">Ajouter</button>
      </form>
      <div className="px-4 py-4 lg:px-6">
        <h2 className="mb-3 text-sm font-medium text-slate-500">Webhooks sortants</h2>
        <ul className="space-y-2 text-sm">
          {(hooks ?? []).map((hook) => (
            <li key={hook.id} className="flex items-center justify-between gap-4">
              <span className="truncate">{hook.url}</span>
              <form
                action={async () => {
                  "use server";
                  await toggleWebhook(hook.id, !hook.is_active);
                }}
              >
                <button className="underline">{hook.is_active ? "Désactiver" : "Activer"}</button>
              </form>
            </li>
          ))}
        </ul>
      </div>
      <ListToolbar />
      <DataTable headers={["Date", "Statut", "HTTP", "Erreur"]}>
        {(deliveries ?? []).map((d) => (
          <tr key={d.id} className="border-b border-slate-100">
            <td className="px-4 py-2.5 lg:px-6">{formatDate(d.created_at)}</td>
            <td className="px-4 py-2.5 lg:px-6">{d.status}</td>
            <td className="px-4 py-2.5 lg:px-6">{d.status_code ?? "-"}</td>
            <td className="px-4 py-2.5 text-slate-500 lg:px-6">{d.last_error ?? ""}</td>
          </tr>
        ))}
      </DataTable>
    </ListPanel>
  );
}
