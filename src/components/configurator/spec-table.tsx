"use client";

import type { ProductSpec } from "@/lib/wizard/types";

const monoFont = '"IBM Plex Mono", ui-monospace, monospace';
const SPEC_ORDER = ["charge", "hauteur", "profondeur", "materiau", "delai"];

export type SpecTableProduct = {
  id: string;
  name: string;
  specs?: ProductSpec[] | null;
};

function specRank(key: string) {
  const index = SPEC_ORDER.indexOf(key);
  return index === -1 ? SPEC_ORDER.length : index;
}

export function orderedSpecs(specs: ProductSpec[] | null | undefined): ProductSpec[] {
  return (specs ?? [])
    .filter((spec) => spec.label.trim() && spec.value.trim())
    .sort((a, b) => specRank(a.key) - specRank(b.key) || a.label.localeCompare(b.label, "fr"));
}

export function specValueText(spec: Pick<ProductSpec, "value" | "unit" | "valueAlt">): string {
  const unit = spec.unit?.trim();
  const alt = spec.valueAlt?.trim();
  const core = unit ? `${spec.value} ${unit}` : spec.value;
  return alt ? `${core} (${alt})` : core;
}

export function SpecTable({
  products,
  showName = true,
}: {
  products: SpecTableProduct[];
  showName?: boolean;
}) {
  const rows = products
    .map((product) => ({ id: product.id, name: product.name, specs: orderedSpecs(product.specs) }))
    .filter((product) => product.specs.length);
  if (!rows.length) return null;

  return (
    <section className="mt-6 space-y-4" aria-label="Fiche technique">
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@500&display=swap"
      />
      {rows.map((product) => (
        <article key={product.id} className="border border-slate-200 bg-white px-4 py-4 sm:px-5">
          {showName ? <h2 className="text-lg font-medium text-slate-950">{product.name}</h2> : null}
          <ul className={showName ? "mt-3 flex flex-wrap gap-2" : "flex flex-wrap gap-2"}>
            {product.specs.map((spec) => (
              <li
                key={spec.key}
                className="inline-flex items-center border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm"
                style={{ borderRadius: 999, display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
              >
                <span style={{ fontFamily: "inherit" }}>{spec.label}</span>
                <span style={{ fontFamily: monoFont }}>{specValueText(spec)}</span>
              </li>
            ))}
          </ul>
          <table className="mt-4 w-full border-collapse text-sm">
            <tbody>
              {product.specs.map((spec) => (
                <tr key={spec.key} className="border-t border-slate-100">
                  <th
                    scope="row"
                    className="py-2 pr-4 text-left font-medium text-slate-700"
                    style={{ fontFamily: "inherit", paddingRight: "1rem" }}
                  >
                    {spec.label}
                  </th>
                  <td className="py-2 text-right text-slate-950" style={{ fontFamily: monoFont }}>
                    {specValueText(spec)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>
      ))}
    </section>
  );
}
