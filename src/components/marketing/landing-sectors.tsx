"use client";

import { useState } from "react";
import { FUNNEL_FAMILIES, type FunnelFamilyId } from "@/lib/funnels/families";

export function LandingSectors() {
  const [active, setActive] = useState<FunnelFamilyId>("racking");
  const selected = FUNNEL_FAMILIES.find((family) => family.id === active) ?? FUNNEL_FAMILIES[0];

  return (
    <div>
      <div className="flex flex-wrap justify-center gap-2">
        {FUNNEL_FAMILIES.map((family) => {
          const on = family.id === active;
          return (
            <button
              key={family.id}
              type="button"
              onClick={() => setActive(family.id)}
              className={`rounded-full px-3.5 py-2 text-sm ${
                on
                  ? "bg-[#1A1510] text-white"
                  : "bg-white text-[#1A1510]/70 ring-1 ring-black/10 hover:bg-[#FFF8F1]"
              }`}
            >
              {family.label}
            </button>
          );
        })}
      </div>
      <p className="mx-auto mt-6 max-w-2xl text-center text-[15px] leading-7 text-[#1A1510]/60">
        Une famille, quelques templates : questionnaire, catalogue ou brief. Pas un wizard par micro-secteur.
      </p>
      <p className="mx-auto mt-10 max-w-2xl text-center text-[17px] leading-8 text-[#1A1510]/75">
        {selected.pitch}
      </p>
    </div>
  );
}
