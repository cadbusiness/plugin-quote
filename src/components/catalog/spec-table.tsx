import { PRODUCT_SPEC_KEYS, type ProductSpecs } from "@/lib/catalog/specs";
import type { ProductSpec } from "@/lib/wizard/types";

type SpecRow = { key: string; label: string; value: string; unit?: string };

function display(row: SpecRow) {
  return [row.value.trim(), row.unit?.trim() ?? ""].filter(Boolean).join(" ");
}

export function specRows(specs?: ProductSpec[] | ProductSpecs | null): SpecRow[] {
  if (!specs) return [];
  if (Array.isArray(specs)) {
    return specs.flatMap((spec) => {
      const value = spec.value?.trim();
      if (!spec.key || !spec.label || !value) return [];
      return [{ key: spec.key, label: spec.label, value, ...(spec.unit ? { unit: spec.unit } : {}) }];
    });
  }
  return PRODUCT_SPEC_KEYS.flatMap((key) => {
    const entry = specs[key];
    const value = entry?.value?.trim();
    if (!entry || !value) return [];
    return [{ key, label: entry.label, value, ...(entry.unit ? { unit: entry.unit } : {}) }];
  });
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
      {rows.map((row) => (
        <li
          key={row.key}
          className="max-w-full truncate rounded-full bg-slate-100 px-2 py-0.5 text-[11px] leading-4 text-slate-700"
        >
          <span className="text-slate-500">{row.label}</span> {display(row)}
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
      {rows.map((row) => (
        <div key={row.key} className="flex items-baseline justify-between gap-3 py-1.5">
          <dt className="text-slate-500">{row.label}</dt>
          <dd className="text-right font-medium text-slate-900">{display(row)}</dd>
        </div>
      ))}
    </dl>
  );
}
