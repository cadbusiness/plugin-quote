function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function fmtEuro(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);
}

function fmtNumber(value: number, digits = 1) {
  return new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: digits,
    minimumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);
}

export type GainTempsCatalogueInput = {
  nbDevis: number;
  minManuel: number;
  pctBiblio: number;
  minGagnees: number;
  taux: number;
};

export type GainTempsCatalogueResult = {
  nbDevis: number;
  minManuel: number;
  pctBiblio: number;
  minGagnees: number;
  taux: number;
  minMois: number;
  hMois: number;
  euroMois: number;
  hAn: number;
  euroAn: number;
  minApres: number;
  alert: string;
  tip: string;
  tone: "gain" | "neutral";
  recap: string;
};

export function computeGainTempsCatalogue(input: GainTempsCatalogueInput): GainTempsCatalogueResult {
  const nbDevis = clamp(input.nbDevis, 0, 100000);
  const minManuel = clamp(input.minManuel, 0, 24 * 60);
  const pctBiblio = clamp(input.pctBiblio, 0, 100);
  let minGagnees = clamp(input.minGagnees, 0, 24 * 60);
  const taux = clamp(input.taux, 0, 10000);
  if (minGagnees > minManuel) minGagnees = minManuel;

  const minMois = nbDevis * minGagnees;
  const hMois = minMois / 60;
  const euroMois = hMois * taux;
  const hAn = hMois * 12;
  const euroAn = euroMois * 12;
  const minApres = Math.max(0, minManuel - minGagnees);

  let alert: string;
  let tip: string;
  let tone: GainTempsCatalogueResult["tone"];
  if (nbDevis <= 0 || minManuel <= 0) {
    tone = "neutral";
    alert = "Indiquez un volume et un temps de saisie pour estimer le gain.";
    tip = "Sans baseline, le gain catalogue reste une impression.";
  } else if (minGagnees <= 0) {
    tone = "neutral";
    alert = "Aucune minute gagnée saisie : le catalogue n’apporte pas encore de gain mesuré.";
    tip = "Pilotez 2 semaines avec 5 kits cœur de métier, puis mesurez.";
  } else {
    tone = "gain";
    alert = `Gain estimé : ${fmtNumber(hMois, 1)} h / mois · ${fmtEuro(euroMois)} / mois`;
    tip = `Hypothèse : ${fmtNumber(pctBiblio, 0)} % de lignes depuis la biblio, ${fmtNumber(minGagnees, 0)} min gagnées / devis. Adaptez après un pilote réel.`;
  }

  const recap = [
    "Récap gain temps catalogue / kits (indicatif)",
    `Devis / mois : ${fmtNumber(nbDevis, 0)}`,
    `Minutes / devis (manuel) : ${fmtNumber(minManuel, 0)}`,
    `% lignes depuis biblio : ${fmtNumber(pctBiblio, 0)} %`,
    `Minutes gagnées / devis : ${fmtNumber(minGagnees, 0)}`,
    `Taux horaire chargé : ${fmtEuro(taux)} / h`,
    "",
    `Minutes gagnées / mois : ${fmtNumber(minMois, 0)}`,
    `Heures gagnées / mois : ${fmtNumber(hMois, 1)}`,
    `Équivalent € / mois : ${fmtEuro(euroMois)}`,
    `Heures / an : ${fmtNumber(hAn, 0)}`,
    `Équivalent € / an : ${fmtEuro(euroAn)}`,
    `Temps moyen / devis après gain : ${fmtNumber(minApres, 0)} min`,
    "",
    "Checklist rapide :",
    "- 5 à 10 kits cœur de métier en place",
    "- % lignes biblio suivi chaque mois",
    "- Prix HT versionnés (pas de reprise d’anciens devis)",
    "- Options hors kit de base (évite les kits fourre-tout)",
    "",
    "Calcul local · à adapter à votre charge réelle.",
  ].join("\n");

  return {
    nbDevis,
    minManuel,
    pctBiblio,
    minGagnees,
    taux,
    minMois,
    hMois,
    euroMois,
    hAn,
    euroAn,
    minApres,
    alert,
    tip,
    tone,
    recap,
  };
}
