import type { ReactNode } from "react";

function Window({ url, dark, children }: { url: string; dark?: boolean; children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-[0_24px_60px_-28px_rgba(80,40,10,0.4)] ring-1 ring-black/10">
      <div className={`flex items-center gap-2 px-3 py-2 ${dark ? "bg-slate-950" : "border-b border-slate-200 bg-slate-50"}`}>
        <span className="h-2.5 w-2.5 rounded-full bg-[#E8B4A2]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#F3D09A]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#C9D4C0]" />
        <span
          className={`ml-2 truncate rounded-md px-2 py-0.5 text-[11px] ${
            dark ? "bg-white/10 text-white/70" : "bg-white text-slate-500 ring-1 ring-slate-200"
          }`}
        >
          {url}
        </span>
      </div>
      {children}
    </div>
  );
}

const PRODUCTS = [
  { name: "Rayonnage mi-lourd 3 niveaux", tags: "entrepôt · 400–800 kg", price: "420 – 680 €" },
  { name: "Cantilever simple", tags: "longs · extérieur", price: "890 – 1 400 €" },
  { name: "Échelle à palette 4 niveaux", tags: "palette · allée", price: "610 – 940 €" },
];

export function CatalogShot() {
  return (
    <Window url="app.quotebuilder / produits">
      <div className="border-b border-slate-200 px-4 py-2.5">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-amber-700">Votre espace</p>
        <p className="text-sm font-medium text-slate-900">Catalogue · ce que vous livrez vraiment</p>
      </div>
      <ul className="divide-y divide-slate-100 text-sm">
        {PRODUCTS.map((product) => (
          <li key={product.name} className="flex items-start justify-between gap-3 px-4 py-3">
            <div>
              <p className="font-medium text-slate-900">{product.name}</p>
              <p className="text-slate-500">{product.tags}</p>
            </div>
            <p className="shrink-0 text-slate-500">{product.price}</p>
          </li>
        ))}
      </ul>
    </Window>
  );
}

export function WizardShot() {
  return (
    <Window url="votre-site.com / devis" dark>
      <div className="bg-slate-950 px-4 pb-3 text-white">
        <p className="text-[11px] uppercase tracking-[0.16em] text-amber-400">Configurateur</p>
        <p className="text-sm font-medium">Explorer et composer le projet</p>
        <div className="mt-3 flex gap-1.5">
          <div className="h-1 flex-1 rounded-full bg-amber-500" />
          <div className="h-1 flex-1 rounded-full bg-amber-500" />
          <div className="h-1 flex-1 rounded-full bg-white/20">
            <div className="h-1 w-1/2 rounded-full bg-amber-500" />
          </div>
          <div className="h-1 flex-1 rounded-full bg-white/20" />
        </div>
        <p className="mt-2 text-[11px] text-slate-400">Étape 2 / 4 — Type de projet</p>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-slate-900">De quoi avez-vous besoin ?</h3>
        <p className="mt-1 text-sm text-slate-500">Uniquement les gammes que vous savez livrer.</p>
        <div className="mt-4 grid gap-2">
          {["Palettes · allées", "Charges longues · cantilever", "Mi-lourd 3 à 5 niveaux"].map((label, i) => (
            <div
              key={label}
              className={`rounded-xl border px-3 py-2.5 text-sm ${
                i === 2 ? "border-slate-900 bg-slate-50 font-medium" : "border-slate-200 text-slate-600"
              }`}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    </Window>
  );
}

export function PipelineShot() {
  return (
    <Window url="app.quotebuilder / devis">
      <div className="border-b border-slate-200 px-4 py-2.5">
        <p className="text-sm font-medium text-slate-900">Dossier · Atelier Nord</p>
      </div>
      <div className="grid gap-0 text-sm sm:grid-cols-2">
        <div className="space-y-2 px-4 py-3">
          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Prospect</p>
          <p className="font-medium text-slate-900">Claire Martin</p>
          <p className="text-slate-500">Atelier Nord</p>
          <div className="flex gap-2 pt-1">
            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-800">Hot</span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">Nouveau</span>
          </div>
        </div>
        <div className="space-y-1.5 border-t border-slate-100 bg-slate-50 px-4 py-3 sm:border-l sm:border-t-0">
          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Brief</p>
          <p>Surface 1 200 m²</p>
          <p>Rayonnage mi-lourd · 14 travées</p>
          <p>Charge 800 kg / niveau</p>
          <p>Délai 6 semaines</p>
          <p className="font-medium text-slate-900">18 – 24 k€ indicatif</p>
        </div>
      </div>
    </Window>
  );
}
