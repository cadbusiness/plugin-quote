import { formatSpecDisplay, listProductSpecs, type ProductSpecs } from "@/lib/catalog/specs";

export function SpecChips({
  specs,
  limit = 6,
}: {
  specs?: ProductSpecs | null;
  limit?: number;
}) {
  const rows = listProductSpecs(specs).slice(0, limit);
  if (!rows.length) return null;
  return (
    <ul className="flex flex-wrap gap-1">
      {rows.map((row) => (
        <li
          key={row.key}
          className="max-w-full truncate rounded-full bg-slate-100 px-2 py-0.5 text-[11px] leading-4 text-slate-700"
        >
          <span className="text-slate-500">{row.label}</span> {formatSpecDisplay(row)}
        </li>
      ))}
    </ul>
  );
}

export function SpecTable({ specs }: { specs?: ProductSpecs | null }) {
  const rows = listProductSpecs(specs);
  if (!rows.length) return null;
  return (
    <dl className="mt-3 divide-y divide-slate-100 border-y border-slate-100 text-sm">
      {rows.map((row) => (
        <div key={row.key} className="flex items-baseline justify-between gap-3 py-1.5">
          <dt className="text-slate-500">{row.label}</dt>
          <dd className="text-right font-medium text-slate-900">{formatSpecDisplay(row)}</dd>
        </div>
      ))}
    </dl>
  );
}
