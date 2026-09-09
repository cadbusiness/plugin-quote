import Link from "next/link";
import type { ReactNode } from "react";
import { notFound, redirect } from "next/navigation";
import {
  deleteConnection,
  rotateWebhookSecret,
  toggleConnection,
  updateConnection,
  updateStorefront,
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
  const sf = settings.storefront;
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

        <input type="hidden" name="sync_policy" value="1" />
        <div className="grid gap-2 sm:grid-cols-3">
          <Check name="pullFromStore" defaultChecked={settings.pullFromStore} label="Importer depuis la boutique" />
          <Check name="protectLocalEdits" defaultChecked={settings.protectLocalEdits} label="Garder nos modifications" />
          <Check
            name="pushToStore"
            defaultChecked={settings.pushToStore}
            label={provider === "woocommerce" ? "Renvoyer vers WordPress" : "Push Shopify (bientôt)"}
          />
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

      <form action={updateStorefront} className="border-b border-slate-100">
        <input type="hidden" name="id" value={connection.id} />
        <div className="border-b border-slate-100 px-4 py-4 lg:px-6">
          <p className="text-sm font-medium text-slate-900">Vitrine devis</p>
          <p className="mt-1 text-sm text-slate-500">
            Même contrat que le plugin WordPress. La liste d’exclusion et les rôles se règlent
            dans WooCommerce ; enregistrer ici ne les écrase pas.
          </p>
        </div>

        <div className="grid gap-2 border-b border-slate-100 px-4 py-4 sm:grid-cols-2 lg:px-6">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400 sm:col-span-2">Bouton</p>
          <Check name="hidePrices" defaultChecked={sf.hidePrices} label="Masquer les prix" />
          <Check name="hideAddToCart" defaultChecked={sf.hideAddToCart} label="Masquer Ajouter au panier" />
          <Check name="hideSaleFlash" defaultChecked={sf.hideSaleFlash} label="Masquer les badges promo" />
          <Check name="hideCheckout" defaultChecked={sf.hideCheckout} label="Masquer Commander" />
          <Check name="showOnProduct" defaultChecked={sf.showOnProduct} label="Fiche produit" />
          <Check name="showOnShop" defaultChecked={sf.showOnShop} label="Boutique / catégories" />
          <Check name="showOnBlocks" defaultChecked={sf.showOnBlocks} label="Blocs WooCommerce" />
          <Check name="showOnCart" defaultChecked={sf.showOnCart} label="Page panier" />
          <Check name="showOnCheckout" defaultChecked={sf.showOnCheckout} label="Page paiement" />
          <Check name="showFloatingButton" defaultChecked={sf.showFloatingButton} label="Bouton flottant" />
          <Field name="audience" label="Visible pour" defaultValue={sf.audience}>
            <option value="all">Tous</option>
            <option value="logged_in">Connectés</option>
            <option value="guests">Invités</option>
            <option value="roles">Rôles (réglés dans WordPress)</option>
          </Field>
          <Field name="stockMode" label="Rupture de stock" defaultValue={sf.stockMode}>
            <option value="all">Tous les produits</option>
            <option value="oos_only">Ruptures seulement</option>
            <option value="hide_oos">Masquer en rupture</option>
          </Field>
          <Field name="productButtonPosition" label="Position fiche" defaultValue={sf.productButtonPosition}>
            <option value="inline">En ligne avec le panier</option>
            <option value="below">Sous le panier</option>
          </Field>
          <Field name="afterAdd" label="Après un ajout" defaultValue={sf.afterAdd}>
            <option value="drawer">Ouvrir le tiroir</option>
            <option value="notice">Afficher un lien</option>
            <option value="list">Aller à la liste</option>
            <option value="stay">Rester sur la page</option>
          </Field>
          <Field name="scope" label="Périmètre" defaultValue={sf.scope}>
            <option value="all">Tous les produits</option>
            <option value="exclude">Tous sauf la liste</option>
            <option value="include">Liste uniquement</option>
          </Field>
          <Text name="priceLabel" label="Texte à la place du prix" defaultValue={sf.priceLabel} />
          <Text name="buttonLabel" label="Ajouter au devis" defaultValue={sf.buttonLabel} />
          <Text name="requestQuoteLabel" label="Demander un devis (panier)" defaultValue={sf.requestQuoteLabel} />
        </div>

        <div className="grid gap-2 border-b border-slate-100 px-4 py-4 sm:grid-cols-2 lg:px-6">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400 sm:col-span-2">Page liste</p>
          <Check name="showFormWhenEmpty" defaultChecked={sf.showFormWhenEmpty} label="Formulaire si liste vide" />
          <Check name="showBackToShop" defaultChecked={sf.showBackToShop} label="Retour boutique" />
          <Check name="showUpdateList" defaultChecked={sf.showUpdateList} label="Mettre à jour la liste" />
          <Check name="showClearList" defaultChecked={sf.showClearList} label="Effacer la liste" />
          <Check name="showImages" defaultChecked={sf.showImages} label="Images" />
          <Check name="showSku" defaultChecked={sf.showSku} label="UGS" />
          <Check name="showQty" defaultChecked={sf.showQty} label="Quantité" />
          <Check name="showPrice" defaultChecked={sf.showPrice} label="Prix" />
          <Check name="showLineTotal" defaultChecked={sf.showLineTotal} label="Total ligne" />
          <Check name="showGrandTotal" defaultChecked={sf.showGrandTotal} label="Montant total" />
          <Check name="showTaxes" defaultChecked={sf.showTaxes} label="Taxes" />
          <Check name="showUniqueCount" defaultChecked={sf.showUniqueCount} label="Nombre de produits" />
          <Field name="pageLayout" label="Mise en page" defaultValue={sf.pageLayout}>
            <option value="split">Liste à gauche</option>
            <option value="stack">Liste au-dessus</option>
          </Field>
          <Text name="listTitle" label="Titre de la liste" defaultValue={sf.listTitle} />
          <Text name="formTitle" label="Titre avant le formulaire" defaultValue={sf.formTitle} />
          <Text name="funnelCta" label="Bouton d’envoi" defaultValue={sf.funnelCta} />
          <Text name="emptyMessage" label="Liste vide" defaultValue={sf.emptyMessage} />
          <Text name="continueShoppingLabel" label="Retour boutique" defaultValue={sf.continueShoppingLabel} />
        </div>

        <div className="grid gap-2 px-4 py-4 sm:grid-cols-2 lg:px-6">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400 sm:col-span-2">Style</p>
          <Field name="buttonStyle" label="Style ajouter au devis" defaultValue={sf.buttonStyle}>
            <option value="button">Bouton</option>
            <option value="link">Lien texte</option>
          </Field>
          <label className="text-sm">
            <span className="font-medium text-slate-900">Fond</span>
            <input name="buttonBg" type="color" defaultValue={sf.buttonBg} className="mt-1 h-10 w-full rounded-md border border-slate-200 px-2 py-1" />
          </label>
          <label className="text-sm">
            <span className="font-medium text-slate-900">Fond survol</span>
            <input name="buttonBgHover" type="color" defaultValue={sf.buttonBgHover} className="mt-1 h-10 w-full rounded-md border border-slate-200 px-2 py-1" />
          </label>
          <label className="text-sm">
            <span className="font-medium text-slate-900">Texte</span>
            <input name="buttonColor" type="color" defaultValue={sf.buttonColor} className="mt-1 h-10 w-full rounded-md border border-slate-200 px-2 py-1" />
          </label>
          <Text name="addedLabel" label="Produit ajouté" defaultValue={sf.addedLabel} />
          <Text name="alreadyInListLabel" label="Déjà dans la liste" defaultValue={sf.alreadyInListLabel} />
          <Text name="browseListLabel" label="Lien vers la liste" defaultValue={sf.browseListLabel} />
          <div className="sm:col-span-2 text-right">
            <button className="rounded-md bg-[#E85D04] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#d35400]">
              Enregistrer la vitrine
            </button>
          </div>
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
              {connection.webhook_secret ?? "-"}
            </dd>
            <form action={rotate}>
              <button className="text-xs text-slate-500 underline hover:text-slate-900">
                Régénérer
              </button>
            </form>
          </div>
          <div className="flex flex-wrap items-baseline gap-2">
            <dt className="w-24 shrink-0 text-slate-500">Accès</dt>
            <dd className="font-mono text-xs text-slate-500">{connection.credentials_hint ?? "-"}</dd>
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

function Text({ name, label, defaultValue }: { name: string; label: string; defaultValue: string }) {
  return (
    <label className="text-sm">
      <span className="font-medium text-slate-900">{label}</span>
      <input
        name={name}
        defaultValue={defaultValue}
        className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
      />
    </label>
  );
}

function Field({
  name,
  label,
  defaultValue,
  children,
}: {
  name: string;
  label: string;
  defaultValue: string;
  children: ReactNode;
}) {
  return (
    <label className="text-sm">
      <span className="font-medium text-slate-900">{label}</span>
      <select
        name={name}
        defaultValue={defaultValue}
        className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
      >
        {children}
      </select>
    </label>
  );
}
