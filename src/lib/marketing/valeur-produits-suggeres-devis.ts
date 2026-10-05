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

export const VALEUR_PRODUITS_SUGGERES_DEFAULTS = {
  demandes: 60,
  pctActuel: 15,
  pctCible: 30,
  valeur: 500,
  transfo: 25,
  minutes: 6,
  taux: 55,
} as const;

export const VALEUR_PRODUITS_SUGGERES_LABELS = {
  demandes: "Demandes via le funnel / mois",
  pctActuel: "% de dossiers avec suggestion retenue (aujourd'hui)",
  pctCible: "% visé après réglage des règles",
  valeur: "Valeur moyenne ajoutée par suggestion retenue (€)",
  transfo: "Taux de transformation des dossiers (%)",
  minutes: "Minutes gagnées par dossier avec suggestion retenue",
  taux: "Taux horaire chargé (€)",
  dossiers: "Dossiers avec suggestion retenue / mois (aujourd'hui → visé)",
  devis: "Valeur ajoutée aux devis / mois (aujourd'hui → visé)",
  ecart: "Écart de valeur ajoutée aux devis / mois",
  gagne: "Valeur gagnée indicative / mois (écart × transformation)",
  temps: "Temps commercial libéré / mois",
  total: "Total indicatif mensuel (valeur gagnée + temps)",
  an: "Sur 12 mois (indicatif)",
} as const;

export type ValeurProduitsSuggeresInput = {
  demandes: number;
  pctActuel: number;
  pctCible: number;
  valeur: number;
  transfo: number;
  minutes: number;
  taux: number;
};

export type ValeurProduitsSuggeresTone = "ok" | "warn" | "neutral";

export type ValeurProduitsSuggeresResult = {
  demandes: number;
  pctActuel: number;
  pctCible: number;
  valeur: number;
  transfo: number;
  minutes: number;
  taux: number;
  dossiersActuel: number;
  dossiersCible: number;
  ecartDossiers: number;
  devisActuel: number;
  devisCible: number;
  ecartDevis: number;
  gagne: number;
  heures: number;
  temps: number;
  total: number;
  an: number;
  alertTone: ValeurProduitsSuggeresTone;
  totalTone: ValeurProduitsSuggeresTone;
  alert: string;
  tip: string;
  dossiersLabel: string;
  devisLabel: string;
  ecartLabel: string;
  gagneLabel: string;
  tempsLabel: string;
  totalLabel: string;
  anLabel: string;
  recap: string;
};

export function computeValeurProduitsSuggeres(
  input: ValeurProduitsSuggeresInput,
): ValeurProduitsSuggeresResult {
  const demandes = clamp(finite(input.demandes), 0, 100000);
  const pctActuel = clamp(finite(input.pctActuel), 0, 100);
  const pctCible = clamp(finite(input.pctCible), 0, 100);
  const valeur = clamp(finite(input.valeur), 0, Number.MAX_SAFE_INTEGER);
  const transfo = clamp(finite(input.transfo), 0, 100);
  const minutes = clamp(finite(input.minutes), 0, 24 * 60);
  const taux = clamp(finite(input.taux), 0, 10000);

  const dossiersActuel = round1((demandes * pctActuel) / 100);
  const dossiersCible = round1((demandes * pctCible) / 100);
  const ecartDossiers = round1(Math.max(0, dossiersCible - dossiersActuel));
  const devisActuel = Math.round(dossiersActuel * valeur);
  const devisCible = Math.round(dossiersCible * valeur);
  const ecartDevis = Math.max(0, devisCible - devisActuel);
  const gagne = Math.round((ecartDevis * transfo) / 100);
  const heures = round1((ecartDossiers * minutes) / 60);
  const temps = Math.round(heures * taux);
  const total = gagne + temps;
  const an = total * 12;

  let alertTone: ValeurProduitsSuggeresTone = "neutral";
  let alert: string;
  let tip: string;
  if (demandes <= 0) {
    alert = "Indiquez un volume de demandes / mois pour estimer la valeur des suggestions.";
    tip =
      "Partez de vos dossiers du mois dernier : combien de prospects ont retenu un produit proposé à l'écran de suggestions ?";
  } else if (pctCible <= pctActuel) {
    alert = "Le % visé n'est pas supérieur au % actuel : pas d'écart à estimer.";
    tip = "Fixez un objectif réaliste après avoir testé vos règles sur cinq vrais briefs.";
  } else if (total >= 10000) {
    alertTone = "ok";
    alert = `Enjeu important · environ ${fmtEuro(total)} / mois (indicatif, selon vos hypothèses).`;
    tip =
      "Priorité : matrice réponses vers produits, une règle par cas, priorités du spécifique au général, une règle filet en priorité 0. Seuls 3 blocs s'affichent.";
  } else if (total >= 3000) {
    alertTone = "warn";
    alert = `Enjeu notable · environ ${fmtEuro(total)} / mois (indicatif, selon vos hypothèses).`;
    tip =
      "Commencez par les 2 ou 3 segments les plus fréquents. Testez chaque règle avec de vrais briefs avant d'en ajouter.";
  } else {
    alert = `Enjeu modeste · environ ${fmtEuro(total)} / mois (indicatif, selon vos hypothèses).`;
    tip = "Gardez des règles simples et relisez-les à chaque changement de catalogue ou de questions.";
  }

  const totalTone: ValeurProduitsSuggeresTone = total >= 10000 ? "ok" : total >= 3000 ? "warn" : "neutral";

  const dossiersLabel = `${fmtNumber(dossiersActuel, 1)} → ${fmtNumber(dossiersCible, 1)}`;
  const devisLabel = `${fmtEuro(devisActuel)} → ${fmtEuro(devisCible)}`;
  const ecartLabel = `${fmtEuro(ecartDevis)} (${fmtNumber(ecartDossiers, 1)} dossiers)`;
  const gagneLabel = fmtEuro(gagne);
  const tempsLabel = `${fmtNumber(heures, 1)} h · ${fmtEuro(temps)}`;
  const totalLabel = fmtEuro(total);
  const anLabel = fmtEuro(an);

  const recap = [
    "Récap valeur des produits suggérés (indicatif)",
    `Demandes via le funnel / mois : ${fmtNumber(demandes, 0)}`,
    `% avec suggestion retenue : ${fmtNumber(pctActuel, 0)} % aujourd'hui, ${fmtNumber(pctCible, 0)} % visé`,
    `Dossiers avec suggestion retenue : ${fmtNumber(dossiersActuel, 1)} → ${fmtNumber(dossiersCible, 1)}`,
    `Valeur moyenne ajoutée / suggestion : ${fmtEuro(valeur)}`,
    `Valeur ajoutée aux devis : ${fmtEuro(devisActuel)} → ${fmtEuro(devisCible)}`,
    `Écart de valeur ajoutée : ${fmtEuro(ecartDevis)}`,
    `Taux de transformation : ${fmtNumber(transfo, 0)} %`,
    `Valeur gagnée indicative / mois : ${fmtEuro(gagne)}`,
    `Temps libéré / mois : ${fmtNumber(heures, 1)} h (${fmtEuro(temps)} à ${fmtEuro(taux)} / h)`,
    `Total indicatif mensuel : ${fmtEuro(total)}`,
    `Sur 12 mois : ${fmtEuro(an)}`,
    `Statut : ${alert}`,
    "",
    "Checklist règles de suggestion :",
    "- Matrice réponses vers produits écrite avant l'outil",
    "- Une règle = un cas, nom interne clair, titre lisible pour le prospect",
    "- Priorités : cas précis en haut, une règle filet en priorité 0 (3 blocs max affichés)",
    "- Inclut pour les choix multiples, est parmi pour une réponse unique",
    "- Test sur 5 vrais briefs ; relecture à chaque changement de questions ou de catalogue",
    "- Les règles choisissent les produits suggérés, pas les étapes ni le prix ni le score",
    "",
    "Calcul local · vos hypothèses, pas un benchmark · fourchettes indicatives, pas de TVA. Pas de kits : options, variantes et produits liés.",
  ].join("\n");

  return {
    demandes,
    pctActuel,
    pctCible,
    valeur,
    transfo,
    minutes,
    taux,
    dossiersActuel,
    dossiersCible,
    ecartDossiers,
    devisActuel,
    devisCible,
    ecartDevis,
    gagne,
    heures,
    temps,
    total,
    an,
    alertTone,
    totalTone,
    alert,
    tip,
    dossiersLabel,
    devisLabel,
    ecartLabel,
    gagneLabel,
    tempsLabel,
    totalLabel,
    anLabel,
    recap,
  };
}
