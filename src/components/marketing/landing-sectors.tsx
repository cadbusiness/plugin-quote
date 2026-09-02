"use client";

import { useState } from "react";

const SECTORS = [
  {
    id: "racking",
    label: "Rayonnage & stockage",
    icon: "🏭",
    blurb:
      "Le prospect explore les gammes, indique surface et charge, compose les travées. Vous recevez un brief chiffrable.",
  },
  {
    id: "kitchen",
    label: "Cuisiniste",
    icon: "🍳",
    blurb:
      "Il parcourt les modules, pose les contraintes de pièce, estime un budget. La demande arrive déjà cadré.",
  },
  {
    id: "wood",
    label: "Menuisier",
    icon: "🪵",
    blurb:
      "Essence, dimensions, usage. Il configure ce que vous fabriquez vraiment — pas un souhait impossible.",
  },
  {
    id: "garden",
    label: "Paysagiste",
    icon: "🌿",
    blurb:
      "Surface, usage, niveau d’entretien. Le projet se compose avant l’appel, pas pendant.",
  },
  {
    id: "rental",
    label: "Location matériel",
    icon: "🚚",
    blurb:
      "Durée, capacité, options. Le prospect voit ce qui est dispo et envoie une demande complète.",
  },
  {
    id: "fitout",
    label: "Aménagement industriel",
    icon: "🏗️",
    blurb:
      "Usage, contraintes de site, gammes possibles. Vous rappelez pour proposer, pas pour découvrir le besoin.",
  },
] as const;

type SectorId = (typeof SECTORS)[number]["id"];

export function LandingSectors() {
  const [active, setActive] = useState<SectorId>("racking");
  const selected = SECTORS.find((s) => s.id === active) ?? SECTORS[0];

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
        Pas un outil générique. Des templates sectoriels prêts à l’emploi — le parcours d’achat est
        configuré en moins d’une heure.
      </p>
      <p className="mx-auto mt-10 max-w-2xl text-center text-[17px] leading-8 text-[#1A1510]/75">
        {selected.blurb}
      </p>
    </div>
  );
}
