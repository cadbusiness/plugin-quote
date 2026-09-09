"use client";

import { useState } from "react";

const SECTORS = [
  {
    id: "racking",
    label: "Rayonnage & stockage",
    blurb:
      "Le prospect compose les travées, charge et surface. Vous recevez un brief chiffrable — puis l’autopilote relance et assigne.",
  },
  {
    id: "kitchen",
    label: "Cuisiniste",
    blurb:
      "Modules, contraintes de pièce, budget. La demande arrive cadrée ; le suivi (confirmation, J+1, J+3) part sans vous.",
  },
  {
    id: "wood",
    label: "Menuisier",
    blurb:
      "Essence, dimensions, usage. Il configure ce que vous fabriquez vraiment — le dossier entre dans le pipeline, score inclus.",
  },
  {
    id: "garden",
    label: "Paysagiste",
    blurb:
      "Surface, usage, entretien. Le projet se compose avant l’appel ; les abandons sont relancés automatiquement.",
  },
  {
    id: "rental",
    label: "Location matériel",
    blurb:
      "Durée, capacité, options. Demande complète → assignation commercial → rappel si non traité sous 4 h.",
  },
  {
    id: "fitout",
    label: "Aménagement industriel",
    blurb:
      "Usage, site, gammes. Vous rappelez pour proposer, pas pour découvrir — le workflow a déjà préparé le terrain.",
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
              {sector.label}
            </button>
          );
        })}
      </div>
      <p className="mx-auto mt-6 max-w-2xl text-center text-[15px] leading-7 text-[#1A1510]/60">
        Templates sectoriels : parcours + relances de base, prêts en moins d’une heure.
      </p>
      <p className="mx-auto mt-10 max-w-2xl text-center text-[17px] leading-8 text-[#1A1510]/75">
        {selected.blurb}
      </p>
    </div>
  );
}
