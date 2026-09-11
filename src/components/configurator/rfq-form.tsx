"use client";

import { CatalogBrowse } from "@/components/configurator/catalog-browse";
import { quoteLineCount } from "@/lib/funnels/kind";
import type { ContactDraft, Customization, Product } from "@/lib/wizard/types";

export function RfqForm({
  orgName,
  shopName,
  products,
  customization,
  contact,
  need,
  accent,
  themed,
  embedded,
  busy,
  errors,
  onNeedChange,
  onContactChange,
  onCatalogChange,
  onSubmit,
}: {
  orgName: string;
  shopName?: string;
  products: Product[];
  customization: Customization;
  contact: ContactDraft & { consentMarketing?: boolean };
  need: string;
  accent: string;
  themed?: boolean;
  embedded?: boolean;
  busy?: boolean;
  errors: Record<string, string>;
  onNeedChange: (value: string) => void;
  onContactChange: (patch: Partial<ContactDraft & { consentMarketing?: boolean }>) => void;
  onCatalogChange: (customization: Customization) => void;
  onSubmit: () => void;
}) {
  const lines = quoteLineCount(customization);
  const title = shopName ? `Demander un devis — ${shopName}` : "Demander un devis";

  return (
    <div className="mx-auto max-w-3xl px-5 py-8">
      {!embedded ? (
        <p
          className={
            themed
              ? "text-xs uppercase tracking-[0.16em]"
              : "text-xs uppercase tracking-[0.16em] text-amber-600"
          }
          style={themed ? { color: accent } : undefined}
        >
          {orgName}
        </p>
      ) : null}
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">{title}</h1>
      <p className={themed ? "mt-2 opacity-70" : "mt-2 text-slate-600"}>
        Décrivez le besoin. Les produits du catalogue sont facultatifs. Même dossier côté vendeur.
      </p>

      <label className="mt-8 block text-sm">
        <span className="mb-1.5 block font-medium">Votre besoin</span>
        <textarea
          value={need}
          onChange={(event) => onNeedChange(event.target.value)}
          rows={5}
          placeholder="Quantités, contraintes, délai, usage…"
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 outline-none ring-amber-500/30 focus:ring-4"
        />
        {errors.need ? <p className="mt-2 text-sm text-red-600">{errors.need}</p> : null}
      </label>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <RfqField
          label="Nom"
          value={contact.name ?? ""}
          error={errors.name}
          onChange={(value) => onContactChange({ name: value })}
        />
        <RfqField
          label="Email"
          type="email"
          value={contact.email ?? ""}
          error={errors.email}
          onChange={(value) => onContactChange({ email: value })}
        />
        <RfqField
          label="Téléphone"
          value={contact.phone ?? ""}
          onChange={(value) => onContactChange({ phone: value })}
        />
        <RfqField
          label="Société"
          value={contact.company ?? ""}
          onChange={(value) => onContactChange({ company: value })}
        />
        <label className="sm:col-span-2 flex items-start gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            className="mt-1"
            checked={Boolean(contact.consentMarketing)}
            onChange={(event) => onContactChange({ consentMarketing: event.target.checked })}
          />
          <span>
            J’accepte d’être recontacté par email pour des offres liées à ma demande (consentement marketing,
            facultatif). Vos données sont traitées pour établir ce devis.
          </span>
        </label>
      </div>

      {products.length ? (
        <section className="mt-10">
          <h2 className="text-lg font-medium">Produits (optionnel)</h2>
          <p className={themed ? "mt-1 text-sm opacity-70" : "mt-1 text-sm text-slate-600"}>
            Le catalogue affiché est celui de cette boutique.
          </p>
          <CatalogBrowse
            products={products}
            customization={customization}
            accent={accent}
            themed={themed}
            hideContinue
            onChange={onCatalogChange}
          />
        </section>
      ) : null}

      {errors.submit ? <p className="mt-6 text-sm text-red-600">{errors.submit}</p> : null}

      <div className="mt-8 flex items-center justify-between gap-4">
        <p className="text-sm text-slate-500">
          {lines ? `${lines} article${lines > 1 ? "s" : ""} dans la demande` : "Sans ligne catalogue"}
        </p>
        <button
          type="button"
          onClick={onSubmit}
          disabled={busy}
          className={
            themed
              ? "rounded-lg px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
              : "rounded-lg bg-slate-950 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
          }
          style={themed ? { background: accent } : undefined}
        >
          {busy ? "Envoi…" : "Envoyer ma demande"}
        </button>
      </div>
    </div>
  );
}

function RfqField({
  label,
  value,
  onChange,
  type = "text",
  error,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  error?: string;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block text-slate-600">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 outline-none ring-amber-500/30 focus:ring-4"
      />
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
    </label>
  );
}
