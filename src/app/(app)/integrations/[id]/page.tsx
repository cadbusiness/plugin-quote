import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  deleteConnection,
  rotateWebhookSecret,
  toggleConnection,
  updateConnection,
} from "@/app/(app)/integrations/actions";
import { Chip, type ChipTone } from "@/components/ui/chip";
import { DataTable, ListPanel, ListToolbar } from "@/components/ui/list-panel";
import { SyncButton } from "@/components/integrations/sync-button";
import { getOrgContext, isAdminRole } from "@/lib/auth/org";
import { formatDate } from "@/lib/format";
import { parseSettings, PROVIDER_LABELS, type CatalogProvider } from "@/lib/integrations/types";
import { createClient } from "@/lib/supabase/server";

// « Synchroniser maintenant » peut brasser plusieurs milliers de produits.
export const maxDuration = 300;

const STATUS: Record<string, { tone: ChipTone; label: string }> = {
  active: { tone: "emerald", label: "Connectée" },
  error: { tone: "rose", label: "En erreur" },
  disabled: { tone: "slate", label: "En pause" },
};

export default async function ConnectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ctx = await getOrgContext();
  if (!ctx) redirect("/onboarding");
  if (!isAdminRole(ctx.role)) redirect("/devis");

  const supabase = await createClient();
  const { data: connection } = await supabase
    .from("catalog_connections")
    .select("*")
    .eq("id", id)
    .eq("organization_id", ctx.organization.id)
    .maybeSingle();
  if (!connection) notFound();

  const [{ data: funnels }, { data: runs }, { count: activeCount }] = await Promise.all([
    supabase
      .from("configurators")
      .select("id, name")
      .eq("organization_id", ctx.organization.id)
      .order("created_at", { ascending: true }),
    supabase
      .from("catalog_sync_runs")
      .select("*")
      .eq("connection_id", connection.id)
      .order("started_at", { ascending: false })
      .limit(8),
    supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("connection_id", connection.id)
      .eq("is_active", true),
  ]);

  const settings = parseSettings(connection.settings);
  const provider = connection.provider as CatalogProvider;
  const status = STATUS[connection.status] ?? STATUS.active;
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/\/$/, "");
  const webhookUrl = `${appUrl}/api/integrations/${connection.id}/webhook`;

  const enabled = connection.status !== "disabled";
  const toggle = toggleConnection.bind(null, connection.id, !enabled);
  const rotate = rotateWebhookSecret.bind(null, connection.id);
  const remove = deleteConnection.bind(null, connection.id);

  return (
    <ListPanel>
      <ListToolbar>
        <div className="mr-auto flex items-center gap-2">
          <Link href="/integrations" className="text-sm text-slate-500 hover:text-slate-900">
            Boutiques
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-sm font-medium text-slate-900">{connection.label}</span>
          <Chip tone={status.tone}>{status.label}</Chip>
        </div>
        <SyncButton connectionId={connection.id} label="Synchroniser maintenant" />
      </ListToolbar>

      <div className="grid grid-cols-2 divide-x divide-slate-100 border-b border-slate-200 sm:grid-cols-4">
        <Kpi label="Produits actifs" value={String(activeCount ?? 0)} />
        <Kpi label="Canal" value={PROVIDER_LABELS[provider] ?? connection.provider} />
        <Kpi
          label="Dernière sync"
          value={connection.last_sync_at ? formatDate(connection.last_sync_at) : "Jamais"}
        />
        <Kpi label="Boutique" value={connection.store_domain} small />
      </div>

      {connection.last_error ? (
        <p className="border-b border-rose-100 bg-rose-50 px-4 py-2 text-sm text-rose-700 lg:px-6">
          {connection.last_error}
        </p>
      ) : null}

      <form action={updateConnection} className="grid gap-4 border-b border-slate-100 px-4 py-6 lg:px-6">
        <input type="hidden" name="id" value={connection.id} />
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm">
            <span className="font-medium text-slate-900">Nom affiché</span>
            <input
              name="label"
              defaultValue={connection.label}
              className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
          <label className="text-sm">
            <span className="font-medium text-slate-900">Funnel alimenté</span>
            <select
              name="configurator_id"
              defaultValue={connection.configurator_id ?? ""}
              className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
            >
              {(funnels ?? []).map((funnel) => (
                <option key={funnel.id} value={funnel.id}>
                  {funnel.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid gap-2 sm:grid-cols-3">
          <Check name="archiveMissing" defaultChecked={settings.archiveMissing} label="Retirer les produits supprimés" />
          <Check name="skipOutOfStock" defaultChecked={settings.skipOutOfStock} label="Ignorer les ruptures" />
          <Check name="importDrafts" defaultChecked={settings.importDrafts} label="Importer les brouillons" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm">
            <span className="font-medium text-slate-900">Marge sur les prix (%)</span>
            <input
              name="markupPercent"
              type="number"
              step="0.1"
              defaultValue={settings.markupPercent}
              className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
          <label className="text-sm">
            <span className="font-medium text-slate-900">Catégories importées</span>
            <input
              name="categories"
              defaultValue={settings.categories.join(", ")}
              placeholder="Vide = tout le catalogue"
              className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
        </div>

        <div className="text-right">
          <button className="rounded-md bg-slate-950 px-3 py-1.5 text-sm text-white">
            Enregistrer les réglages
          </button>
        </div>
      </form>

      <section className="border-b border-slate-100 px-4 py-6 lg:px-6">
        <h2 className="text-sm font-medium text-slate-900">Mise à jour en temps réel</h2>
        <p className="mt-1 text-sm text-slate-500">
          {provider === "woocommerce"
            ? "WooCommerce → Réglages → Avancé → Webhooks. Créez un webhook « Produit mis à jour » et un « Produit supprimé » vers cette URL, avec ce secret."
            : "Dans votre app personnalisée Shopify, abonnez products/update et products/delete à cette URL. La signature est vérifiée avec la clé secrète de l'app."}
        </p>
        <dl className="mt-3 grid gap-2 text-sm">
          <div className="flex flex-wrap items-baseline gap-2">
            <dt className="w-24 shrink-0 text-slate-500">URL</dt>
            <dd className="break-all font-mono text-xs text-slate-900">
              {appUrl ? webhookUrl : "Définissez NEXT_PUBLIC_APP_URL pour afficher l'URL publique."}
            </dd>
          </div>
          <div className="flex flex-wrap items-baseline gap-2">
            <dt className="w-24 shrink-0 text-slate-500">Secret</dt>
            <dd className="break-all font-mono text-xs text-slate-900">
              {connection.webhook_secret ?? "—"}
            </dd>
            <form action={rotate}>
              <button className="text-xs text-slate-500 underline hover:text-slate-900">
                Régénérer
              </button>
            </form>
          </div>
          <div className="flex flex-wrap items-baseline gap-2">
            <dt className="w-24 shrink-0 text-slate-500">Accès</dt>
            <dd className="font-mono text-xs text-slate-500">{connection.credentials_hint ?? "—"}</dd>
          </div>
        </dl>
      </section>

      <section>
        <p className="border-b border-slate-100 px-4 py-2 text-xs font-medium uppercase tracking-wide text-slate-500 lg:px-6">
          Historique des synchronisations
        </p>
        {(runs ?? []).length ? (
          <DataTable headers={["Quand", "Origine", "Ajoutés", "Mis à jour", "Inchangés", "Retirés", "Statut"]}>
            {(runs ?? []).map((run) => (
              <tr key={run.id} className="border-b border-slate-100">
                <td className="px-4 py-2 text-slate-500 lg:px-6">{formatDate(run.started_at)}</td>
                <td className="px-4 py-2 lg:px-6">{TRIGGERS[run.trigger] ?? run.trigger}</td>
                <td className="px-4 py-2 tabular-nums lg:px-6">{run.created_count}</td>
                <td className="px-4 py-2 tabular-nums lg:px-6">{run.updated_count}</td>
                <td className="px-4 py-2 tabular-nums text-slate-400 lg:px-6">{run.skipped_count}</td>
                <td className="px-4 py-2 tabular-nums lg:px-6">{run.archived_count}</td>
                <td className="px-4 py-2 lg:px-6">
                  {run.status === "done" ? (
                    <Chip tone="emerald">Terminée</Chip>
                  ) : run.status === "error" ? (
                    <Chip tone="rose">{run.error ? "Échec" : "Erreur"}</Chip>
                  ) : (
                    <Chip tone="amber">En cours</Chip>
                  )}
                </td>
              </tr>
            ))}
          </DataTable>
        ) : (
          <p className="px-4 py-6 text-sm text-slate-500 lg:px-6">Aucune synchronisation pour l’instant.</p>
        )}
      </section>

      <section className="mt-auto flex flex-wrap items-center gap-3 border-t border-slate-100 px-4 py-4 lg:px-6">
        <form action={toggle}>
          <button className="rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-700">
            {enabled ? "Mettre en pause" : "Réactiver"}
          </button>
        </form>
        <form action={remove}>
          <button className="rounded-md bg-rose-50 px-3 py-1.5 text-sm font-medium text-rose-700 ring-1 ring-rose-100">
            Déconnecter la boutique
          </button>
        </form>
        <span className="text-xs text-slate-400">
          La déconnexion désactive les produits importés mais ne les supprime pas.
        </span>
      </section>
    </ListPanel>
  );
}

const TRIGGERS: Record<string, string> = {
  manual: "Manuelle",
  cron: "Planifiée",
  webhook: "Boutique",
  pairing: "Appairage",
};

function Kpi({ label, value, small }: { label: string; value: string; small?: boolean }) {
  return (
    <div className="px-4 py-4 lg:px-6">
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">{label}</p>
      <p className={`mt-1 font-semibold text-slate-900 ${small ? "truncate text-sm" : "text-xl"}`}>
        {value}
      </p>
    </div>
  );
}

function Check({
  name,
  label,
  defaultChecked,
}: {
  name: string;
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm ring-1 ring-slate-200 has-checked:bg-orange-50 has-checked:ring-orange-200">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} />
      {label}
    </label>
  );
}
