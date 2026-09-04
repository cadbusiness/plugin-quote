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

export function ProductEditorFields({
  imageUrl,
  attributes,
}: {
  imageUrl: string | null;
  attributes: ProductAttribute[];
}) {
  const [preview, setPreview] = useState(imageUrl);
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
    <>
      <div className="grid gap-4 sm:grid-cols-[10rem_minmax(0,1fr)]">
        <div className="relative overflow-hidden rounded-lg bg-slate-50 ring-1 ring-slate-200">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="" className="h-40 w-full object-cover sm:h-full" />
          ) : (
            <div className="flex h-40 items-center justify-center text-xs text-slate-400 sm:h-full">
              Aucune photo
            </div>
          )}
        </div>
        <label className="flex min-h-40 cursor-pointer flex-col justify-center rounded-lg border border-dashed border-slate-300 px-4 py-4 text-sm hover:border-[#E85D04] hover:bg-orange-50/50">
          <span className="font-medium text-slate-900">Photo du produit</span>
          <span className="mt-1 text-xs leading-relaxed text-slate-500">
            Déposez une image ou cliquez pour l’envoyer. JPG, PNG ou WebP, 8 Mo max. Elle s’affiche
            dans le catalogue et sur le devis du prospect.
          </span>
          <input
            type="file"
            name="image"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="mt-3 text-xs"
            onChange={(event) => {
              const file = event.target.files?.[0];
              setPreview(file ? URL.createObjectURL(file) : imageUrl);
            }}
          />
          <input type="hidden" name="image_url" value={imageUrl ?? ""} />
        </label>
      </div>

      <div>
        <p className="text-sm font-medium text-slate-900">Caractéristiques</p>
        <p className="mt-0.5 text-xs text-slate-500">
          Ajoutez ce que vous voulez : couleur, taille, dimensions, poids, mode d’emploi… Un choix
          est proposé au prospect ; le reste reste informatif.
        </p>
        <div className="mt-3 divide-y divide-slate-100">
          {rows.map((row) => (
            <div key={row.id} className="grid gap-2 py-3 sm:grid-cols-[11rem_minmax(0,1fr)_auto]">
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
              <div className="grid gap-2 sm:grid-cols-[12rem_minmax(0,1fr)]">
                <input
                  name="attr_label"
                  value={row.label}
                  onChange={(event) => patch(row.id, { label: event.target.value })}
                  placeholder={row.kind === "choices" ? "Couleur" : "Dimensions"}
                  className="rounded-md border border-slate-200 px-3 py-2 text-sm"
                />
                {row.kind === "note" ? (
                  <>
                    <textarea
                      name="attr_value"
                      value={row.value ?? ""}
                      onChange={(event) => patch(row.id, { value: event.target.value })}
                      rows={3}
                      placeholder="Mode d’emploi, précisions techniques…"
                      className="rounded-md border border-slate-200 px-3 py-2 text-sm"
                    />
                    <input type="hidden" name="attr_unit" value="" />
                  </>
                ) : (
                  <div className="flex gap-2">
                    <input
                      name="attr_value"
                      value={row.value ?? ""}
                      onChange={(event) => patch(row.id, { value: event.target.value })}
                      placeholder={
                        row.kind === "choices"
                          ? "Noir, Blanc, Galvanisé"
                          : row.kind === "number"
                            ? "80"
                            : "80 × 40 × 180 cm"
                      }
                      className="min-w-0 flex-1 rounded-md border border-slate-200 px-3 py-2 text-sm"
                    />
                    {row.kind === "number" ? (
                      <input
                        name="attr_unit"
                        value={row.unit ?? ""}
                        onChange={(event) => patch(row.id, { unit: event.target.value })}
                        placeholder="kg"
                        className="w-20 rounded-md border border-slate-200 px-2 py-2 text-sm"
                      />
                    ) : (
                      <input type="hidden" name="attr_unit" value="" />
                    )}
                  </div>
                )}
              </div>
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
    </>
  );
}
