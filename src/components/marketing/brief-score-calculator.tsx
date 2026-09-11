"use client";

import { useMemo, useState } from "react";
import { computeBriefScore, type BriefScoreAnswers } from "@/lib/marketing/brief-score";

const QUESTIONS: {
  key: keyof BriefScoreAnswers;
  title: string;
  weight: number;
  options: { value: number; label: string }[];
}[] = [
  {
    key: "products",
    title: "1. Complétude produits / configuration",
    weight: 25,
    options: [
      { value: 0, label: "Message vague, aucun produit clair" },
      { value: 10, label: "Famille de produits sans options" },
      { value: 18, label: "Produits + quantités / dimensions clés" },
      { value: 25, label: "Config complète (options, contraintes, refs)" },
    ],
  },
  {
    key: "constraints",
    title: "2. Contraintes chantier / usage",
    weight: 20,
    options: [
      { value: 0, label: "Aucune contrainte mentionnée" },
      { value: 8, label: "Quelques indices (lieu, usage)" },
      { value: 14, label: "Contraintes principales listées" },
      { value: 20, label: "Contraintes + fichiers (plan, photos)" },
    ],
  },
  {
    key: "budget",
    title: "3. Signal budget",
    weight: 20,
    options: [
      { value: 0, label: "Aucun budget, refuse d’en parler" },
      { value: 7, label: "« Le moins cher » sans fourchette" },
      { value: 14, label: "Fourchette indicative" },
      { value: 20, label: "Budget aligné panier + validation côté client" },
    ],
  },
  {
    key: "urgency",
    title: "4. Urgence et horizon de décision",
    weight: 20,
    options: [
      { value: 0, label: "Exploration lointaine" },
      { value: 8, label: "Projet dans 3–6 mois" },
      { value: 14, label: "Décision sous 30–60 jours" },
      { value: 20, label: "Deadline ferme (chantier, stock, AO)" },
    ],
  },
  {
    key: "fit",
    title: "5. Fit ICP / zone / typologie client",
    weight: 15,
    options: [
      { value: 0, label: "Hors cible ou hors zone" },
      { value: 6, label: "Limite (taille / secteur / distance)" },
      { value: 11, label: "ICP correct, zone OK" },
      { value: 15, label: "Compte idéal ou déjà client / multi-sites" },
    ],
  },
];

const BAND_COLOR: Record<string, string> = {
  pending: "#e4d8c8",
  hot: "#2f6b3a",
  warm: "#E85D04",
  cold: "#8a6a1f",
  parking: "#9b2c2c",
};

export function BriefScoreCalculator() {
  const [answers, setAnswers] = useState<BriefScoreAnswers>({
    products: null,
    constraints: null,
    budget: null,
    urgency: null,
    fit: null,
  });

  const result = useMemo(() => computeBriefScore(answers), [answers]);
  const color = BAND_COLOR[result.band];
  const pill =
    result.band === "pending"
      ? result.label
      : `${result.label} · ${result.total}/100`;
  const text =
    result.partial && result.band !== "pending"
      ? `${result.text} (score partiel : ${result.answered}/5 questions)`
      : result.text;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      <form className="rounded-[22px] bg-white p-5 ring-1 ring-black/6 sm:p-6" onSubmit={(e) => e.preventDefault()}>
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#C45C26]">Questions</p>
        {QUESTIONS.map((question) => (
          <fieldset key={question.key} className="mt-6 border-t border-[#1A1510]/8 pt-5 first:mt-4 first:border-t-0 first:pt-0">
            <legend className="text-sm font-semibold">{question.title}</legend>
            <p className="mt-1 text-[12px] text-[#1A1510]/45">Poids {question.weight}</p>
            <div className="mt-3 grid gap-2">
              {question.options.map((option) => {
                const checked = answers[question.key] === option.value;
                return (
                  <label
                    key={option.value}
                    className={`flex cursor-pointer items-start gap-2.5 rounded-xl px-3 py-2.5 text-[14px] leading-5 ring-1 ${
                      checked
                        ? "bg-[#fce8dc] ring-[#E85D04]"
                        : "bg-[#fffdf9] ring-[#1A1510]/10 hover:ring-[#d4b89a]"
                    }`}
                  >
                    <input
                      type="radio"
                      className="mt-0.5 accent-[#E85D04]"
                      name={question.key}
                      checked={checked}
                      onChange={() => setAnswers((prev) => ({ ...prev, [question.key]: option.value }))}
                    />
                    <span>{option.label}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        ))}
      </form>

      <div className="h-fit rounded-[22px] bg-[#1A1510] p-5 text-[#F6F0E8] sm:p-6 lg:sticky lg:top-24">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#F3B184]">Score live</p>
        <div className="mt-4 flex items-center gap-4">
          <div
            className="flex h-24 w-24 flex-col items-center justify-center rounded-full border-4 bg-white text-[#1A1510]"
            style={{ borderColor: color }}
            aria-live="polite"
          >
            <strong className="text-3xl font-semibold leading-none text-[#E85D04]">{result.total}</strong>
            <span className="mt-1 text-[11px] text-[#1A1510]/45">/ 100</span>
          </div>
          <div>
            <p
              className="inline-block rounded-full px-2.5 py-1 text-xs font-semibold"
              style={
                result.band === "pending"
                  ? { background: "#fce8dc", color: "#E85D04" }
                  : { background: "#fff", color, border: `1px solid ${color}` }
              }
            >
              {pill}
            </p>
            <p className="mt-2 text-sm leading-6 text-[#F6F0E8]/70">{text}</p>
          </div>
        </div>

        <h2 className="mt-8 text-sm font-semibold">Recommandation</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-[#F6F0E8]/75">
          {result.tips.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
        <p className="mt-6 text-xs leading-5 text-[#F6F0E8]/45">
          Score indicatif pour prioriser le temps de chiffrage, pas un verdict juridique ni financier. Les calculs
          restent dans votre navigateur.
        </p>
      </div>
    </div>
  );
}
