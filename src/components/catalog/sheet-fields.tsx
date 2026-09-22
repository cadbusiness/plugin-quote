import { defaultSheetLabel, sheetFormRows, type ProductSheet } from "@/lib/catalog/sheet";

const ROLE_FIELD: Record<string, string> = {
  manual: "Notice (PDF ou lien)",
  certificate: "Conformité",
  warranty: "Garantie",
};

export function SheetFields({ sheet }: { sheet: ProductSheet }) {
  const rows = sheetFormRows(sheet);
  return (
    <div className="grid gap-3">
      <label className="text-sm">
        <span className="font-medium text-slate-900">Texte du mode d’emploi</span>
        <textarea
          name="manual_text"
          rows={4}
          defaultValue={sheet.manualText}
          placeholder="Court. Étapes de montage, sans recopier la description."
          className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
        />
      </label>
      {rows.map((row, index) => (
        <div key={`${row.role}-${index}`} className="grid gap-2 sm:grid-cols-[9rem_minmax(0,1fr)_minmax(0,14rem)]">
          <input type="hidden" name="sheet_doc_role" value={row.role} />
          <span className="self-center text-sm text-slate-700">{ROLE_FIELD[row.role] ?? defaultSheetLabel(row.role)}</span>
          <input
            name="sheet_doc_url"
            type="url"
            defaultValue={row.src}
            placeholder="https://"
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
          />
          <input
            name="sheet_doc_label"
            defaultValue={row.label}
            placeholder={defaultSheetLabel(row.role)}
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
          />
        </div>
      ))}
    </div>
  );
}
