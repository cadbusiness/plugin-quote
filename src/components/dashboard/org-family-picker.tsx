"use client";

import { useState, useTransition } from "react";
import { saveOrgFamily } from "@/app/(app)/parametres/actions";
import { FUNNEL_FAMILIES, type FunnelFamilyId } from "@/lib/funnels/families";

export function OrgFamilyPicker({ initialFamily }: { initialFamily: FunnelFamilyId | null }) {
  const [family, setFamily] = useState<FunnelFamilyId | null>(initialFamily);
  const [pending, startTransition] = useTransition();

  function pick(id: FunnelFamilyId) {
    setFamily(id);
    startTransition(() => {
      void saveOrgFamily(id);
    });
  }

  return (
    <div className="border-b border-slate-200 px-4 py-4 lg:px-6">
      <p className="text-sm font-medium text-slate-900">Métier de l’espace</p>
      <p className="mt-0.5 text-xs text-slate-500">
        Le wizard de création ouvre déjà cette famille. Vous pouvez toujours en choisir une autre.
      </p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {FUNNEL_FAMILIES.map((item) => {
          const on = family === item.id;
          return (
            <button
              key={item.id}
              type="button"
              disabled={pending}
              onClick={() => pick(item.id)}
              className={`rounded-lg px-3 py-2.5 text-left ring-1 transition-colors disabled:opacity-60 ${
                on ? `${item.tint} ring-current` : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50"
              }`}
            >
              <span className="block text-sm font-medium">{item.label}</span>
              <span className="mt-0.5 block text-xs leading-5 opacity-80">{item.blurb}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
