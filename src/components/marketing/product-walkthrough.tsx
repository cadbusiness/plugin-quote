"use client";

import { useMemo, useState } from "react";

type Product = { name: string; tags: string; min: string; max: string };
type QuoteRow = { name: string; company: string; score: string; status: string; product: string };

const START_PRODUCTS: Product[] = [
  { name: "Rayonnage mi-lourd 3 niveaux", tags: "entrepôt, lourd", min: "420", max: "680" },
  { name: "Cantilever simple", tags: "longs, extérieur", min: "890", max: "1400" },
];

const START_QUOTES: QuoteRow[] = [
  { name: "Thomas Berger", company: "LogiSpace", score: "Warm", status: "Contacté", product: "Cantilever simple" },
  { name: "Léa Moreau", company: "Hôtel Rivage", score: "Hot", status: "En cours", product: "Rayonnage mi-lourd 3 niveaux" },
];

const PHASES = [
  { id: "catalog", label: "1. Votre catalogue" },
  { id: "client", label: "2. Le client configure" },
  { id: "inbox", label: "3. Vous recevez le devis" },
] as const;

type Phase = (typeof PHASES)[number]["id"];

function Window({ url, children }: { url: string; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-[0_24px_60px_-28px_rgba(80,40,10,0.4)] ring-1 ring-black/10">
      <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-3 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-[#E8B4A2]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#F3D09A]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#C9D4C0]" />
        <span className="ml-2 truncate rounded-md bg-white px-2 py-0.5 text-[11px] text-slate-500 ring-1 ring-slate-200">
          {url}
        </span>
      </div>
      {children}
    </div>
  );
}

export function ProductWalkthrough() {
  const [phase, setPhase] = useState<Phase>("catalog");
  const [products, setProducts] = useState<Product[]>(START_PRODUCTS);
  const [draft, setDraft] = useState({ name: "Échelle à palette 4 niveaux", tags: "palette, entrepôt", min: "610", max: "940" });
  const [savedName, setSavedName] = useState<string | null>(null);
  const [height, setHeight] = useState("4,5 m");
  const [qty, setQty] = useState("12");
  const [quotes, setQuotes] = useState<QuoteRow[]>(START_QUOTES);
  const [received, setReceived] = useState(false);

  const liveProduct = savedName ?? draft.name;

  const catalogHint = useMemo(() => {
    if (!savedName) return "Enregistrez le produit. C’est celui que le client pourra choisir.";
    return "Le produit est dans le catalogue. Passez au configurateur client.";
  }, [savedName]);

  function saveProduct(e: React.FormEvent) {
    e.preventDefault();
    if (products.some((p) => p.name === draft.name)) {
      setSavedName(draft.name);
      return;
    }
    setProducts((prev) => [...prev, { ...draft }]);
    setSavedName(draft.name);
  }

  function submitClient(e: React.FormEvent) {
    e.preventDefault();
    const row: QuoteRow = {
      name: "Claire Martin",
      company: "Atelier Nord",
      score: "Hot",
      status: "Nouveau",
      product: `${liveProduct} · ${qty} × ${height}`,
    };
    setQuotes((prev) => [row, ...prev.filter((q) => q.name !== "Claire Martin")]);
    setReceived(true);
    setPhase("inbox");
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap gap-2">
        {PHASES.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setPhase(item.id)}
            className={`rounded-full px-3 py-1.5 text-sm ${
              phase === item.id ? "bg-[#1A1510] text-white" : "bg-white text-[#1A1510]/70 ring-1 ring-black/10"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-5">
        {phase === "catalog" ? (
          <Window url="app.quotebuilder / produits">
            <div className="grid gap-0 lg:grid-cols-[1fr_280px]">
              <div>
                <div className="border-b border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-900">
                  Produits
                </div>
                <ul className="divide-y divide-slate-100 text-sm">
                  {products.map((product) => (
                    <li key={product.name} className="px-4 py-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium text-slate-900">{product.name}</p>
                          <p className="text-slate-500">{product.tags}</p>
                        </div>
                        <p className="shrink-0 text-slate-500">
                          {product.min} – {product.max} €
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <form onSubmit={saveProduct} className="border-t border-slate-200 bg-slate-50 p-4 lg:border-l lg:border-t-0">
                <p className="text-sm font-medium text-slate-900">Nouveau produit</p>
                <label className="mt-3 block text-xs text-slate-600">
                  Nom
                  <input
                    value={draft.name}
                    onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                    className="mt-1 w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-sm"
                  />
                </label>
                <label className="mt-2 block text-xs text-slate-600">
                  Tags
                  <input
                    value={draft.tags}
                    onChange={(e) => setDraft((d) => ({ ...d, tags: e.target.value }))}
                    className="mt-1 w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-sm"
                  />
                </label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <label className="text-xs text-slate-600">
                    Prix min
                    <input
                      value={draft.min}
                      onChange={(e) => setDraft((d) => ({ ...d, min: e.target.value }))}
                      className="mt-1 w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-sm"
                    />
                  </label>
                  <label className="text-xs text-slate-600">
                    Prix max
                    <input
                      value={draft.max}
                      onChange={(e) => setDraft((d) => ({ ...d, max: e.target.value }))}
                      className="mt-1 w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-sm"
                    />
                  </label>
                </div>
                <button
                  type="submit"
                  className="mt-4 w-full rounded-md bg-slate-950 py-2 text-sm text-white"
                >
                  {savedName ? "Enregistré" : "Enregistrer"}
                </button>
                <p className="mt-3 text-xs leading-5 text-slate-500">{catalogHint}</p>
                {savedName ? (
                  <button
                    type="button"
                    onClick={() => setPhase("client")}
                    className="mt-2 w-full text-sm font-medium text-[#E85D04]"
                  >
                    Voir côté client →
                  </button>
                ) : null}
              </form>
            </div>
          </Window>
        ) : null}

        {phase === "client" ? (
          <Window url="votre-site.com / devis">
            <form onSubmit={submitClient} className="p-5 sm:p-6">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Étape 2 / 3</p>
              <h3 className="mt-2 text-xl font-semibold text-slate-900">Quel produit pour votre projet ?</h3>
              <p className="mt-1 text-sm text-slate-500">
                Uniquement ce qui est dans votre catalogue. Rien n’est inventé.
              </p>
              <div className="mt-5 grid gap-2">
                {products.map((product) => (
                  <label
                    key={product.name}
                    className={`flex cursor-pointer items-center justify-between rounded-xl border px-3 py-3 text-sm ${
                      liveProduct === product.name
                        ? "border-slate-900 bg-slate-50"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <span>
                      <input
                        type="radio"
                        name="product"
                        className="mr-2"
                        checked={liveProduct === product.name}
                        onChange={() => setSavedName(product.name)}
                      />
                      {product.name}
                    </span>
                    <span className="text-slate-500">
                      {product.min} – {product.max} €
                    </span>
                  </label>
                ))}
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <label className="text-sm text-slate-600">
                  Hauteur
                  <select
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="mt-1 w-full rounded-md border border-slate-200 px-2 py-2 text-sm"
                  >
                    <option>3,0 m</option>
                    <option>4,5 m</option>
                    <option>6,0 m</option>
                  </select>
                </label>
                <label className="text-sm text-slate-600">
                  Quantité
                  <input
                    value={qty}
                    onChange={(e) => setQty(e.target.value)}
                    className="mt-1 w-full rounded-md border border-slate-200 px-2 py-2 text-sm"
                  />
                </label>
              </div>
              <p className="mt-4 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
                Brief : {liveProduct}, {qty} unités, {height}. Contact : Claire Martin, Atelier Nord.
              </p>
              <button type="submit" className="mt-4 rounded-md bg-[#E85D04] px-4 py-2 text-sm font-medium text-white">
                Envoyer le devis
              </button>
            </form>
          </Window>
        ) : null}

        {phase === "inbox" ? (
          <Window url="app.quotebuilder / devis">
            <div className="border-b border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-900">
              Devis
            </div>
            <table className="w-full text-left text-sm">
              <thead className="text-[11px] uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-4 py-2 font-medium">Prospect</th>
                  <th className="px-2 py-2 font-medium">Produit</th>
                  <th className="px-2 py-2 font-medium">Score</th>
                  <th className="px-4 py-2 font-medium">Statut</th>
                </tr>
              </thead>
              <tbody>
                {quotes.map((row) => (
                  <tr
                    key={row.name}
                    className={`border-t border-slate-100 ${row.name === "Claire Martin" && received ? "bg-amber-50" : ""}`}
                  >
                    <td className="px-4 py-2.5">
                      <div className="font-medium text-slate-900">{row.name}</div>
                      <div className="text-slate-500">{row.company}</div>
                    </td>
                    <td className="px-2 py-2.5 text-slate-600">{row.product}</td>
                    <td className="px-2 py-2.5 text-amber-800">{row.score}</td>
                    <td className="px-4 py-2.5 text-slate-600">{row.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="border-t border-slate-100 px-4 py-3 text-xs text-slate-500">
              {received
                ? "La ligne jaune, c’est le devis qui vient d’arriver — avec le produit du catalogue, pas un texte libre."
                : "Envoyez d’abord un devis côté client pour le voir apparaître ici."}
            </p>
          </Window>
        ) : null}
      </div>
    </div>
  );
}
