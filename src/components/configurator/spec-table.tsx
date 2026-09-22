"use client";

import { orderedSpecRows, type ProductSpec } from "@/lib/catalog/specs";

const uiFont = '"Plus Jakarta Sans", ui-sans-serif, sans-serif';
const displayFont = '"Space Grotesk", ui-sans-serif, sans-serif';
const monoFont = '"IBM Plex Mono", ui-monospace, monospace';

export type SpecTableProduct = {
  id: string;
  name: string;
  specs?: Record<string, ProductSpec> | null;
};

export function SpecTable({ products }: { products: SpecTableProduct[] }) {
  const rows = products
    .map((product) => ({
      id: product.id,
      name: product.name,
      specs: orderedSpecRows(product.specs ?? {}),
    }))
    .filter((product) => product.specs.length);
  if (!rows.length) return null;

  return (
    <section className="mt-8 space-y-4" style={{ color: "#12181f", fontFamily: uiFont }} aria-label="Fiche technique">
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@500&family=Plus+Jakarta+Sans:wght@500;600&family=Space+Grotesk:wght@600&display=swap"
      />
      {rows.map((product) => (
        <article
          key={product.id}
          className="border border-[#e4ddd2] bg-white px-4 py-4 sm:px-5"
          style={{ borderRadius: 24 }}
        >
          <h2 className="text-lg tracking-tight" style={{ color: "#12181f", fontFamily: displayFont }}>
            {product.name}
          </h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {product.specs.map((spec) => (
              <li
                key={spec.key}
                className="inline-flex items-center gap-2 border border-[#e4ddd2] bg-[#f7f5f1] px-3 py-1.5 text-sm"
                style={{ borderRadius: 999 }}
              >
                <span style={{ color: "#0a5236", fontFamily: uiFont }}>{spec.label}</span>
                <span style={{ color: "#0e6b45", fontFamily: monoFont }}>
                  {spec.value}
                  {spec.unit ? ` ${spec.unit}` : ""}
                  {spec.valueAlt ? ` (${spec.valueAlt})` : ""}
                </span>
              </li>
            ))}
          </ul>
          <table className="mt-4 w-full border-collapse text-sm">
            <tbody>
              {product.specs.map((spec) => (
                <tr key={spec.key} className="border-t border-[#efeae3]">
                  <th
                    scope="row"
                    className="py-2 pr-4 text-left font-medium"
                    style={{ color: "#12161a", fontFamily: uiFont }}
                  >
                    {spec.label}
                  </th>
                  <td className="py-2 text-right" style={{ color: "#0e6b45", fontFamily: monoFont }}>
                    {spec.value}
                    {spec.unit ? ` ${spec.unit}` : ""}
                    {spec.valueAlt ? ` (${spec.valueAlt})` : ""}
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
