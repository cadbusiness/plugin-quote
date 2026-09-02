"use client";

import { useState } from "react";

const SECTORS = [
  { id: "racking", label: "Rayonnage & stockage", icon: "🏭" },
  { id: "kitchen", label: "Cuisiniste", icon: "🍳" },
  { id: "wood", label: "Menuisier", icon: "🪵" },
  { id: "garden", label: "Paysagiste", icon: "🌿" },
  { id: "rental", label: "Location matériel", icon: "🚚" },
  { id: "fitout", label: "Aménagement industriel", icon: "🏗️" },
] as const;

type SectorId = (typeof SECTORS)[number]["id"];

const CASES: Partial<Record<SectorId, { quote: string; author: string; note: string }>> = {
  racking: {
    quote:
      "Avant on recevait des messages vagues — « bonjour je voudrais un devis ». Notre commercial passait 45 minutes par prospect juste à comprendre le besoin. Maintenant on reçoit surface, type de rayonnage, charge par niveau, délai. On rappelle pour conclure, pas pour découvrir.",
    author: "[Prénom Nom], Quickly International · Rayonnage industriel, Belgique",
    note: "Témoignage placeholder — à valider avec Quickly.",
  },
};

export function LandingSectors() {
  const [active, setActive] = useState<SectorId>("racking");
  const selected = SECTORS.find((s) => s.id === active) ?? SECTORS[0];
  const story = CASES[active];

  return (
    <div>
      <div className="flex flex-wrap justify-center gap-2">
        {SECTORS.map((sector) => {
          const on = sector.id === active;
          return (
            <button
              key={sector.id}
              type="button"
              onClick={() => setActive(sector.id)}
              className={`rounded-full px-3.5 py-2 text-sm ${
                on
                  ? "bg-[#1A1510] text-white"
                  : "bg-white text-[#1A1510]/70 ring-1 ring-black/10 hover:bg-[#FFF8F1]"
              }`}
            >
              <span aria-hidden>{sector.icon}</span> {sector.label}
            </button>
          );
        })}
      </div>
      <p className="mx-auto mt-6 max-w-2xl text-center text-[15px] leading-7 text-[#1A1510]/60">
        Pas un outil générique. Des templates sectoriels prêts à l’emploi — votre wizard est
        configuré en moins d’une heure.
      </p>

      <figure className="mx-auto mt-12 max-w-3xl text-center">
        {story ? (
          <>
            <blockquote className="text-xl font-medium leading-8 tracking-tight sm:text-2xl sm:leading-10">
              “{story.quote}”
            </blockquote>
            <figcaption className="mt-6 text-sm text-[#1A1510]/55">{story.author}</figcaption>
            <p className="mt-2 text-xs text-[#1A1510]/40">{story.note}</p>
          </>
        ) : (
          <p className="text-[17px] leading-8 text-[#1A1510]/65">
            Template {selected.label.toLowerCase()} — même catalogue, même pipeline. Un cas client
            sera publié ici dès qu’il est validé.
          </p>
        )}
      </figure>
    </div>
  );
}
