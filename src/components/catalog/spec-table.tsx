import { PRODUCT_SPEC_KEYS, type ProductSpecs } from "@/lib/catalog/specs";
import type { ProductSpec } from "@/lib/wizard/types";

const monoFont = '"IBM Plex Mono", ui-monospace, monospace';

type SpecRow = { key: string; label: string; value: string; unit?: string; valueAlt?: string };

function display(row: SpecRow) {
  const core = [row.value.trim(), row.unit?.trim() ?? ""].filter(Boolean).join(" ");
  const alt = row.valueAlt?.trim();
  return alt ? `${core} (${alt})` : core;
}

function rank(key: string) {
  const index = (PRODUCT_SPEC_KEYS as readonly string[]).indexOf(key);
  return index === -1 ? PRODUCT_SPEC_KEYS.length : index;
}

function order(rows: SpecRow[]) {
  return [...rows].sort((a, b) => rank(a.key) - rank(b.key) || a.label.localeCompare(b.label, "fr"));
}

export function specRows(specs?: ProductSpec[] | ProductSpecs | null): SpecRow[] {
  if (!specs) return [];
  if (Array.isArray(specs)) {
    return order(
      specs.flatMap((spec) => {
        const value = spec.value?.trim();
        if (!spec.key || !spec.label || !value) return [];
        return [
          {
            key: spec.key,
            label: spec.label,
            value,
            ...(spec.unit ? { unit: spec.unit } : {}),
            ...(spec.valueAlt ? { valueAlt: spec.valueAlt } : {}),
          },
        ];
      }),
    );
  }
  return order(
    PRODUCT_SPEC_KEYS.flatMap((key) => {
      const entry = specs[key];
      const value = entry?.value?.trim();
      if (!entry || !value) return [];
      return [
        {
          key,
          label: entry.label,
          value,
          ...(entry.unit ? { unit: entry.unit } : {}),
          ...(entry.valueAlt ? { valueAlt: entry.valueAlt } : {}),
        },
      ];
    }),
  );
}

function MonoFont() {
  return (
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@500&display=swap" />
  );
}

export function SpecChips({
  specs,
  limit = 6,
}: {
  specs?: ProductSpec[] | ProductSpecs | null;
  limit?: number;
}) {
  const rows = specRows(specs).slice(0, limit);
  if (!rows.length) return null;
  return (
    <ul className="flex flex-wrap gap-1">
      <MonoFont />
      {rows.map((row) => (
        <li
          key={row.key}
          className="inline-flex max-w-full items-center truncate rounded-full bg-slate-100 px-2 py-0.5 text-[11px] leading-4 text-slate-700"
          style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}
        >
          <span className="text-slate-500" style={{ fontFamily: "inherit" }}>
            {row.label}
          </span>
          <span style={{ fontFamily: monoFont }}>{display(row)}</span>
        </li>
      ))}
    </ul>
  );
}

export function SpecTable({ specs }: { specs?: ProductSpec[] | ProductSpecs | null }) {
  const rows = specRows(specs);
  if (!rows.length) return null;
  return (
    <dl className="mt-3 divide-y divide-slate-100 border-y border-slate-100 text-sm">
      <MonoFont />
      {rows.map((row) => (
        <div key={row.key} className="flex items-baseline justify-between gap-3 py-1.5">
          <dt className="text-slate-500" style={{ fontFamily: "inherit" }}>
            {row.label}
          </dt>
          <dd className="text-right font-medium text-slate-900" style={{ fontFamily: monoFont }}>
            {display(row)}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function QuoteSpecSheets({
  products,
}: {
  products: { id: string; name: string; specs?: ProductSpec[] | ProductSpecs | null }[];
}) {
  const rows = products.filter((product) => specRows(product.specs).length);
  if (!rows.length) return null;
  return (
    <div className="mt-6 space-y-4" aria-label="Fiche technique">
      {rows.map((product) => (
        <section key={product.id}>
          <h2 className="text-lg font-medium text-slate-950">{product.name}</h2>
          <SpecTable specs={product.specs} />
        </section>
      ))}
    </div>
  );
}
