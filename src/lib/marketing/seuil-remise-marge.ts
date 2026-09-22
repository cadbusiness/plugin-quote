function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, Number.isFinite(n) ? n : min));
}

function round2(n: number) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function fmtEuro(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);
}

function fmtNumber(value: number, digits = 1) {
  return new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: digits,
    minimumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);
}

export type SeuilRemiseMode = "cout" | "marge";
export type SeuilRemiseAlert = "neutral" | "ok" | "bad";

export type SeuilRemiseInput = {
  prix: number;
  mode: SeuilRemiseMode;
  cout: number;
  margeActuelle: number;
  tva: number;
  plancher: number;
  remise: number;
};

export type SeuilRemiseResult = {
  prix: number;
  cout: number;
  tva: number;
  plancherPct: number;
  remisePct: number;
  margeEuro: number;
  margePct: number;
  remiseMaxPct: number;
  remiseMaxEuro: number;
  prixPlancher: number;
  prixPlancherTtc: number;
  prixApresRemise: number;
  margeApresEuro: number;
  margeApresPct: number;
  alert: SeuilRemiseAlert;
  alertText: string;
  tip: string;
  recap: string;
};

export function computeSeuilRemiseMarge(input: SeuilRemiseInput): SeuilRemiseResult {
  const prix = clamp(input.prix, 0, Number.MAX_SAFE_INTEGER);
  const tva = clamp(input.tva, 0, 100);
  const plancherPct = clamp(input.plancher, 0, 99);
  const remisePct = clamp(input.remise, 0, 100);
  const mode: SeuilRemiseMode = input.mode === "marge" ? "marge" : "cout";

  let cout: number;
  if (mode === "marge") {
    const margeSaisie = clamp(input.margeActuelle, 0, 99);
    cout = prix > 0 ? round2(prix * (1 - margeSaisie / 100)) : 0;
  } else {
    cout = clamp(input.cout, 0, Number.MAX_SAFE_INTEGER);
  }

  const margeEuro = round2(prix - cout);
  const margePct = prix > 0 ? (margeEuro / prix) * 100 : 0;

  let prixPlancher = 0;
  let remiseMaxPct = 0;
  let remiseMaxEuro = 0;
  if (cout > 0) {
    prixPlancher = round2(cout / (1 - plancherPct / 100));
    if (prix > 0) {
      remiseMaxEuro = round2(Math.max(0, prix - prixPlancher));
      remiseMaxPct = (remiseMaxEuro / prix) * 100;
    }
  } else if (prix > 0) {
    remiseMaxPct = Math.max(0, 100 - plancherPct);
    remiseMaxEuro = round2((prix * remiseMaxPct) / 100);
    prixPlancher = round2(prix - remiseMaxEuro);
  }

  const prixApresRemise = round2(prix * (1 - remisePct / 100));
  const margeApresEuro = round2(prixApresRemise - cout);
  const margeApresPct = prixApresRemise > 0 ? (margeApresEuro / prixApresRemise) * 100 : 0;
  const prixPlancherTtc = round2(prixPlancher * (1 + tva / 100));

  let alert: SeuilRemiseAlert = "neutral";
  let alertText = "";
  let tip = "";

  if (prix <= 0) {
    alertText = "Indiquez un prix catalogue HT pour calculer le seuil.";
    tip = "Sans prix de référence, le plancher de marge ne peut pas se traduire en remise max.";
  } else if (cout > prix) {
    alert = "bad";
    alertText = "KO · Le coût de revient dépasse déjà le prix catalogue.";
    tip = "Corrigez le chiffrage avant toute négociation. Une remise empire un dossier déjà négatif.";
  } else if (margePct + 0.05 < plancherPct) {
    alert = "bad";
    alertText = "KO · Même sans remise, la marge actuelle est sous le plancher.";
    tip = "Remontez le prix, réduisez le périmètre (variante), ou validez une exception écrite. Ne rattrapez pas avec une remise.";
  } else if (remisePct > 0 && margeApresPct + 0.05 < plancherPct) {
    alert = "bad";
    alertText = `KO · La remise envisagée (${fmtNumber(remisePct, 1)} %) passe sous le plancher.`;
    tip = `Remise max pour rester au plancher : ${fmtNumber(remiseMaxPct, 1)} %. Proposez une variante moins chère ou une validation directeur si l’exception est stratégique.`;
  } else if (remisePct > 0) {
    alert = "ok";
    alertText = "OK · Remise envisagée compatible avec le plancher.";
    tip = `Marge restante ${fmtNumber(margeApresPct, 1)} % (plancher ${fmtNumber(plancherPct, 1)} %). Affichez catalogue / geste / net et liez l’acceptation à cette version.`;
  } else {
    alert = "ok";
    alertText = "OK · Seuil calculé (aucune remise saisie).";
    tip = `Vous pouvez aller jusqu’à ${fmtNumber(remiseMaxPct, 1)} % de remise sans passer sous ${fmtNumber(plancherPct, 1)} % de marge. Au-delà : validation manager / directeur.`;
  }

  const statut = alertText.replace(/^OK · |^KO · /, "");
  const lines = [
    "Récap seuil remise / marge (indicatif)",
    `Prix catalogue HT : ${fmtEuro(prix)}`,
    `Coût de revient HT : ${fmtEuro(cout)}`,
    `Marge actuelle : ${fmtEuro(margeEuro)} (${fmtNumber(margePct, 1)} %)`,
    `Plancher de marge cible : ${fmtNumber(plancherPct, 1)} %`,
    `Remise max autorisée : ${fmtNumber(remiseMaxPct, 1)} % · ${fmtEuro(remiseMaxEuro)}`,
    `Prix plancher HT : ${fmtEuro(prixPlancher)}`,
    `Prix plancher TTC (TVA ${fmtNumber(tva, 1)} %) : ${fmtEuro(prixPlancherTtc)}`,
    "",
    `Remise envisagée : ${fmtNumber(remisePct, 1)} %`,
    `Prix après remise HT : ${fmtEuro(prixApresRemise)}`,
    `Marge restante : ${fmtEuro(margeApresEuro)} (${fmtNumber(margeApresPct, 1)} %)`,
    `Statut : ${statut}`,
    "",
    "Checklist rapide :",
    "- Coût de revient renseigné avant négociation",
    "- Remise max calculée vs plancher",
    "- Seuil auto / manager / directeur respecté",
    "- Alternative testée (variante, phasage, validité, acompte)",
    "- Remise affichée (catalogue / geste / net) sur la bonne version",
    "",
    "Calcul local · à adapter à votre grille métier.",
  ];

  return {
    prix,
    cout,
    tva,
    plancherPct,
    remisePct,
    margeEuro,
    margePct,
    remiseMaxPct,
    remiseMaxEuro,
    prixPlancher,
    prixPlancherTtc,
    prixApresRemise,
    margeApresEuro,
    margeApresPct,
    alert,
    alertText,
    tip,
    recap: lines.join("\n"),
  };
}
