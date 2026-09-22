import type { ProductSpec } from "@/lib/catalog/specs";

export function ProductSpecs({ specs }: { specs?: Record<string, ProductSpec> | null }) {
  const rows = Object.entries(specs ?? {}).filter(([, spec]) => spec.label && spec.value);
  if (!rows.length) return null;
  return (
    <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
      {rows.map(([key, spec]) => (
        <div key={key} className="min-w-0">
          <dt className="text-xs text-slate-500">{spec.label}</dt>
          <dd className="font-medium text-slate-800">
            {spec.value}
            {spec.unit ? ` ${spec.unit}` : ""}
          </dd>
        </div>
      ))}
    </dl>
  );
}
