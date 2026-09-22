import { PRODUCT_SPEC_KEYS, PRODUCT_SPEC_LABELS, type ProductSpecs } from "@/lib/catalog/specs";

export function SpecFields({ specs }: { specs: ProductSpecs }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {PRODUCT_SPEC_KEYS.map((key) => {
        const entry = specs[key];
        return (
          <div key={key} className="grid grid-cols-[minmax(0,1fr)_5.5rem] gap-2">
            <label className="text-sm">
              <span className="font-medium text-slate-900">{PRODUCT_SPEC_LABELS[key]}</span>
              <input type="hidden" name={`spec_label_${key}`} value={entry?.label || PRODUCT_SPEC_LABELS[key]} />
              <input
                name={`spec_value_${key}`}
                defaultValue={entry?.value ?? ""}
                className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
            <label className="text-sm">
              <span className="font-medium text-slate-900">Unité</span>
              <input
                name={`spec_unit_${key}`}
                defaultValue={entry?.unit ?? ""}
                className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
          </div>
        );
      })}
    </div>
  );
}
