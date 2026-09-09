"use client";

import { useState } from "react";
import { ListAddRow } from "@/components/ui/list-panel";
import {
  ATTRIBUTE_KINDS,
  type ProductAttribute,
  type ProductAttributeKind,
} from "@/lib/catalog/attributes";

type Row = ProductAttribute & { id: string };

function emptyRow(kind: ProductAttributeKind = "choices"): Row {
  return { id: crypto.randomUUID(), key: "", label: "", kind, values: [], value: "", unit: "" };
}

export function ProductEditorFields({ attributes }: { attributes: ProductAttribute[] }) {
  const [rows, setRows] = useState<Row[]>(() =>
    attributes.length
      ? attributes.map((attribute) => ({
          ...attribute,
          id: attribute.key || crypto.randomUUID(),
          value: attribute.value ?? attribute.values?.map((value) => value.label).join(", ") ?? "",
        }))
      : [emptyRow()],
  );

  function patch(id: string, partial: Partial<Row>) {
    setRows((current) => current.map((row) => (row.id === id ? { ...row, ...partial } : row)));
  }

  return (
    <div className="max-w-3xl">
      <p className="text-sm font-medium text-slate-900">Caractéristiques</p>
      <p className="mt-0.5 text-xs text-slate-500">
        Couleur, taille, dimensions… Un choix est proposé au prospect ; le reste reste informatif.
      </p>
      <div className="mt-3 divide-y divide-slate-100">
        {rows.map((row) => (
          <div key={row.id} className="grid gap-2 py-3 sm:grid-cols-[10rem_minmax(0,14rem)_minmax(0,1fr)_auto]">
            <select
              name="attr_kind"
              value={row.kind}
              onChange={(event) => patch(row.id, { kind: event.target.value as ProductAttributeKind })}
              className="rounded-md border border-slate-200 px-2 py-2 text-sm"
            >
              {ATTRIBUTE_KINDS.map((kind) => (
                <option key={kind.id} value={kind.id}>
                  {kind.label}
                </option>
              ))}
            </select>
            <input
              name="attr_label"
              value={row.label}
              onChange={(event) => patch(row.id, { label: event.target.value })}
              placeholder={row.kind === "choices" ? "Couleur" : "Dimensions"}
              className="rounded-md border border-slate-200 px-3 py-2 text-sm"
            />
            {row.kind === "note" ? (
              <div>
                <textarea
                  name="attr_value"
                  value={row.value ?? ""}
                  onChange={(event) => patch(row.id, { value: event.target.value })}
                  rows={2}
                  placeholder="Mode d’emploi…"
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                />
                <input type="hidden" name="attr_unit" value="" />
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  name="attr_value"
                  value={row.value ?? ""}
                  onChange={(event) => patch(row.id, { value: event.target.value })}
                  placeholder={
                    row.kind === "choices" ? "Noir, Blanc" : row.kind === "number" ? "80" : "80 × 40 cm"
                  }
                  className="min-w-0 flex-1 rounded-md border border-slate-200 px-3 py-2 text-sm"
                />
                {row.kind === "number" ? (
                  <input
                    name="attr_unit"
                    value={row.unit ?? ""}
                    onChange={(event) => patch(row.id, { unit: event.target.value })}
                    placeholder="kg"
                    className="w-16 rounded-md border border-slate-200 px-2 py-2 text-sm"
                  />
                ) : (
                  <input type="hidden" name="attr_unit" value="" />
                )}
              </div>
            )}
            <button
              type="button"
              onClick={() => setRows((current) => current.filter((item) => item.id !== row.id))}
              className="self-start rounded-md px-2 py-2 text-xs text-slate-400 hover:bg-rose-50 hover:text-rose-700"
            >
              Retirer
            </button>
          </div>
        ))}
      </div>
      <ListAddRow onClick={() => setRows((current) => [...current, emptyRow()])}>
        Ajouter une caractéristique
      </ListAddRow>
    </div>
  );
}
