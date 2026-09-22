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
    <div className="mx-auto max-w-3xl px-5 py-10">
      {!embedded ? (
        <p
          className={
            themed
              ? "text-[11px] font-semibold uppercase tracking-[0.16em]"
              : "text-[11px] font-semibold uppercase tracking-[0.16em] text-mk-accent"
          }
          style={themed ? { color: accent } : undefined}
        >
          {orgName}
        </p>
      ) : null}
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-mk-ink">{title}</h1>
      <p className={themed ? "mt-2 opacity-70" : "mt-2 text-mk-faint"}>
        Décrivez le besoin. Les produits du catalogue sont facultatifs. Même dossier côté vendeur.
      </p>

      <label className="mt-9 block text-sm">
        <span className="mb-1.5 block font-semibold text-mk-ink">Votre besoin</span>
        <textarea
          value={need}
          onChange={(event) => onNeedChange(event.target.value)}
          rows={5}
          placeholder="Quantités, contraintes, délai, usage…"
          className="w-full rounded-xl border border-mk-border bg-white px-3.5 py-2.5 text-mk-ink outline-none transition focus:border-mk-accent focus:ring-4 focus:ring-mk-accent/15"
        />
        {errors.need ? <p className="mt-2 text-sm text-red-600">{errors.need}</p> : null}
      </label>

      <div className="mt-9 grid gap-5 sm:grid-cols-2">
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
        <label className="sm:col-span-2 flex items-start gap-2.5 text-sm text-mk-faint">
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
        <section className="mt-12 border-t border-mk-border pt-8">
          <h2 className="text-lg font-semibold tracking-tight text-mk-ink">Produits (optionnel)</h2>
          <p className={themed ? "mt-1 text-sm opacity-70" : "mt-1 text-sm text-mk-faint"}>
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

      <div className="mt-9 flex items-center justify-between gap-4 border-t border-mk-border pt-6">
        <p className="text-sm text-mk-faint">
          {lines ? `${lines} article${lines > 1 ? "s" : ""} dans la demande` : "Sans ligne catalogue"}
        </p>
        <button
          type="button"
          onClick={onSubmit}
          disabled={busy}
          className={
            themed
              ? "rounded-full px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:opacity-50"
              : "rounded-full bg-mk-accent px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-mk-accent-hover disabled:opacity-50"
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
      <span className="mb-1.5 block font-medium text-mk-ink">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-mk-border bg-white px-3.5 py-2.5 text-mk-ink outline-none transition focus:border-mk-accent focus:ring-4 focus:ring-mk-accent/15"
      />
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
    </label>
  );
}
