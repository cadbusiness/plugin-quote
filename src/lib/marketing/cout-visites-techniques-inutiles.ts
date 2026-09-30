function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function finite(value: number, fallback = 0) {
  return Number.isFinite(value) ? value : fallback;
}

function round1(n: number) {
  return Math.round((n + Number.EPSILON) * 10) / 10;
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

export const COUT_VISITES_INUTILES_DEFAULTS = {
  devis: 50,
  pctVisite: 40,
  pctInutile: 30,
  duree: 2.5,
  taux: 65,
  deplacement: 35,
  panier: 4500,
  pctPerdus: 6,
} as const;

export const COUT_VISITES_INUTILES_LABELS = {
  devis: "Devis / demandes traitées / mois",
  pctVisite: "% de demandes qui déclenchent une visite",
  pctInutile: "% de visites « inutiles »",
  duree: "Durée aller-retour + visite (h)",
  taux: "Taux horaire chargé technicien + commercial (€)",
  deplacement: "Coût déplacement fixe / visite (€)",
  panier: "Panier moyen HT (€)",
  pctPerdus: "% deals perdus faute de visite mal priorisée",
  visites: "Visites déclenchées / mois",
  inutiles: "Visites inutiles / mois",
  heures: "Heures perdues / mois (visites inutiles)",
  cout: "Coût temps + déplacement (visites inutiles)",
  opp: "Opportunité indicative / mois (deals mal priorisés)",
  total: "Coût total indicatif mensuel",
} as const;

export type CoutVisitesInutilesInput = {
  devis: number;
  pctVisite: number;
  pctInutile: number;
  duree: number;
  taux: number;
  deplacement: number;
  panier: number;
  pctPerdus: number;
};

export type CoutVisitesInutilesTone = "ok" | "warn" | "bad";
export type CoutVisitesInutilesAlertTone = CoutVisitesInutilesTone | "neutral";

export type CoutVisitesInutilesResult = {
  devis: number;
  pctVisite: number;
  pctInutile: number;
  duree: number;
  taux: number;
  deplacement: number;
  panier: number;
  pctPerdus: number;
  visites: number;
  inutiles: number;
  heures: number;
  coutTemps: number;
  coutDepl: number;
  cout: number;
  deals: number;
  /** Null quand le panier est à 0 : les opportunités ne sont pas monétisées. */
  opp: number | null;
  total: number;
  alertTone: CoutVisitesInutilesAlertTone;
  totalTone: CoutVisitesInutilesTone;
  oppTone: CoutVisitesInutilesTone | "neutral";
  alert: string;
  tip: string;
  visitesLabel: string;
  inutilesLabel: string;
  heuresLabel: string;
  coutLabel: string;
  dealsLabel: string;
  oppLabel: string;
  totalLabel: string;
  recap: string;
};

export function computeCoutVisitesInutiles(input: CoutVisitesInutilesInput): CoutVisitesInutilesResult {
  const devis = clamp(finite(input.devis), 0, 100000);
  const pctVisite = clamp(finite(input.pctVisite), 0, 100);
  const pctInutile = clamp(finite(input.pctInutile), 0, 100);
  const duree = clamp(finite(input.duree), 0, 24);
  const taux = clamp(finite(input.taux), 0, 10000);
  const deplacement = clamp(finite(input.deplacement), 0, 100000);
  const panier = clamp(finite(input.panier), 0, Number.MAX_SAFE_INTEGER);
  const pctPerdus = clamp(finite(input.pctPerdus), 0, 100);

  const visites = round1((devis * pctVisite) / 100);
  const inutiles = round1((visites * pctInutile) / 100);
  const heures = round1(inutiles * duree);
  const coutTemps = Math.round(heures * taux);
  const coutDepl = Math.round(inutiles * deplacement);
  const cout = coutTemps + coutDepl;
  const deals = round1(devis * (pctPerdus / 100));

  let opp: number | null = null;
  if (panier > 0) {
    opp = Math.round(deals * panier);
  }
  const total = cout + (opp ?? 0);

  let alertTone: CoutVisitesInutilesAlertTone = "neutral";
  let alert: string;
  let tip: string;
  if (devis <= 0) {
    alert = "Indiquez un volume de devis / mois pour estimer le coût des visites inutiles.";
    tip =
      "Même 30-40 demandes / mois avec 35 % de visites révèlent souvent des heures et des déplacements évitables.";
  } else if (total >= 20000 || heures >= 40 || inutiles >= 12) {
    alertTone = "bad";
    alert = `Friction visites élevée · environ ${fmtEuro(total)} / mois (indicatif).`;
    tip =
      "Priorité : funnel et photos avant de démarrer le fourgon. L’équipe réserve les visites aux risques réels, avec hypothèses écrites si vous chiffrez sans y aller.";
  } else if (total >= 7000 || heures >= 15 || inutiles >= 5) {
    alertTone = "warn";
    alert = `Friction visites notable · environ ${fmtEuro(total)} / mois (indicatif).`;
    tip =
      "Pilotez d’abord le % de briefs incomplets qui déclenchent encore une visite. Mesurez le délai visite → envoi devis.";
  } else {
    alertTone = "ok";
    alert = `Friction visites contenue · environ ${fmtEuro(total)} / mois (indicatif).`;
    tip = "Gardez le filtre. Surveillez quand même les dossiers peu prioritaires qui insistent pour un déplacement « pour voir ».";
  }

  const totalTone: CoutVisitesInutilesTone = total >= 20000 ? "bad" : total >= 7000 ? "warn" : "ok";
  const oppValue = opp ?? 0;
  const oppTone: CoutVisitesInutilesTone | "neutral" =
    panier <= 0 ? "neutral" : oppValue >= 15000 ? "bad" : oppValue >= 5000 ? "warn" : "ok";

  const visitesLabel = fmtNumber(visites, 1);
  const inutilesLabel = fmtNumber(inutiles, 1);
  const heuresLabel = `${fmtNumber(heures, 1)} h`;
  const coutLabel = fmtEuro(cout);
  const dealsLabel = fmtNumber(deals, 1);
  const oppLabel = panier > 0 && opp !== null ? fmtEuro(opp) : "non calculé (panier = 0)";
  const totalLabel = fmtEuro(total);

  const recap = [
    "Récap coût visites techniques inutiles (indicatif)",
    `Devis / demandes / mois : ${fmtNumber(devis, 0)}`,
    `% qui déclenchent une visite : ${fmtNumber(pctVisite, 0)} %`,
    `Visites déclenchées : ${fmtNumber(visites, 1)}`,
    `% visites inutiles : ${fmtNumber(pctInutile, 0)} %`,
    `Visites inutiles / mois : ${fmtNumber(inutiles, 1)}`,
    `Durée AR + visite : ${fmtNumber(duree, 2)} h`,
    `Heures perdues / mois : ${fmtNumber(heures, 1)} h`,
    `Taux horaire chargé : ${fmtEuro(taux)}`,
    `Coût déplacement fixe / visite : ${fmtEuro(deplacement)}`,
    `Coût temps + déplacement : ${fmtEuro(cout)} (temps ${fmtEuro(coutTemps)} + déplacement ${fmtEuro(coutDepl)})`,
    `% deals perdus faute de priorité visite : ${fmtNumber(pctPerdus, 1)} %`,
    `Deals concernés : ${dealsLabel}`,
    `Panier moyen HT : ${panier > 0 ? fmtEuro(panier) : "n/a"}`,
    `Opportunité indicative : ${panier > 0 && opp !== null ? fmtEuro(opp) : "n/a"}`,
    `Coût total indicatif : ${totalLabel}`,
    `Statut : ${alert}`,
    "",
    "Checklist rapide :",
    "- Funnel : type d’intervention, accès, photos, urgence, type client",
    "- Libellé automatique Hot / Warm / Cold, calculé sur les réponses du formulaire",
    "- Urgence, zone et délai de réponse : tri de l’équipe, hors QuoteBuilder",
    "- Pas de visite pour collecter un brief que WhatsApp aurait donné",
    "- Hypothèses écrites si chiffrage sans visite",
    "- Relances ; statut Gagné / Perdu posé par le commercial",
    "",
    "Calcul local · à adapter à votre réalité métier. Pas de planification de tournée dans cet outil.",
  ].join("\n");

  return {
    devis,
    pctVisite,
    pctInutile,
    duree,
    taux,
    deplacement,
    panier,
    pctPerdus,
    visites,
    inutiles,
    heures,
    coutTemps,
    coutDepl,
    cout,
    deals,
    opp,
    total,
    alertTone,
    totalTone,
    oppTone,
    alert,
    tip,
    visitesLabel,
    inutilesLabel,
    heuresLabel,
    coutLabel,
    dealsLabel,
    oppLabel,
    totalLabel,
    recap,
  };
}
