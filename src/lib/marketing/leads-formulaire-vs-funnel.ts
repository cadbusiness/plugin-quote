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

export const LEADS_FORMULAIRE_DEFAULTS = {
  demandes: 40,
  exploitPct: 35,
  minutes: 18,
  tauxActuel: 45,
  tauxCible: 80,
  panier: 4500,
  convPct: 12,
} as const;

export type LeadsFormulaireVsFunnelInput = {
  demandes: number;
  exploitPct: number;
  minutes: number;
  tauxActuel: number;
  tauxCible: number;
  panier: number;
  convPct: number;
};

export type LeadsScoreTone = "ok" | "warn" | "bad";
export type LeadsAlertTone = LeadsScoreTone | "neutral";

export type LeadsFormulaireVsFunnelResult = {
  demandes: number;
  exploitPct: number;
  minutes: number;
  tauxActuel: number;
  tauxCible: number;
  panier: number;
  convPct: number;
  heures: number;
  mortes: number;
  recup: number;
  /** Null quand le panier est à 0 : le coût d’opportunité n’est pas calculé. */
  cout: number | null;
  score: number;
  scoreTone: LeadsScoreTone;
  alertTone: LeadsAlertTone;
  alert: string;
  tip: string;
  heuresLabel: string;
  mortesLabel: string;
  recupLabel: string;
  coutLabel: string;
  scoreLabel: string;
  recap: string;
};

export function computeLeadsFormulaireVsFunnel(
  input: LeadsFormulaireVsFunnelInput,
): LeadsFormulaireVsFunnelResult {
  const demandes = clamp(finite(input.demandes), 0, 100000);
  const exploitPct = clamp(finite(input.exploitPct), 0, 100);
  const minutes = clamp(finite(input.minutes), 0, 480);
  const tauxActuel = clamp(finite(input.tauxActuel), 0, 100);
  const tauxCible = clamp(finite(input.tauxCible), 0, 100);
  const panier = clamp(finite(input.panier), 0, Number.MAX_SAFE_INTEGER);
  const convPct = clamp(finite(input.convPct), 0, 100);

  const heures = round1((demandes * minutes) / 60);
  const nonExploit = demandes * (1 - exploitPct / 100);
  const ecartTaux = Math.max(0, (tauxCible - tauxActuel) / 100);
  const recup = round1(demandes * ecartTaux);
  const mortes = round1(nonExploit * 0.55 + demandes * (1 - tauxActuel / 100) * 0.35);

  let cout: number | null = null;
  if (panier > 0) {
    cout = Math.round(recup * (convPct / 100) * panier);
  }

  const scoreExploit = exploitPct;
  const scoreVitesse = tauxActuel;
  const scoreFriction = Math.max(0, 100 - Math.min(100, (minutes / 30) * 100));
  const score = Math.round(scoreExploit * 0.4 + scoreVitesse * 0.4 + scoreFriction * 0.2);
  const scoreTone: LeadsScoreTone = score >= 70 ? "ok" : score >= 45 ? "warn" : "bad";

  let alertTone: LeadsAlertTone = "neutral";
  let alert: string;
  let tip: string;
  if (demandes <= 0) {
    alert = "Indiquez un volume de demandes / mois pour estimer l’écart formulaire vs funnel.";
    tip = "Même un petit volume (10–15) révèle souvent des heures de ressaisie et un délai 24 h fragile.";
  } else if (score < 45) {
    alertTone = "bad";
    alert = `Pipeline fragile · score ${score} / 100.`;
    tip =
      "Priorité : brancher un parcours qui crée un devis (pas un mail), réduire la ressaisie, et viser un taux de réponse sous 24 h proche de votre cible.";
  } else if (score < 70) {
    alertTone = "warn";
    alert = `Pipeline en construction · score ${score} / 100.`;
    tip =
      "Vous gagnez déjà des dossiers exploitables, mais l’écart 24 h et la ressaisie laissent encore des demandes mortes. Widget dual-mode + notif commerciale aident.";
  } else {
    alertTone = "ok";
    alert = `Pipeline plutôt mature · score ${score} / 100.`;
    tip =
      "Gardez le funnel / dossier auto, surveillez variantes Woo et SLA. Le prochain levier est souvent la qualité catalogue, pas un nouveau formulaire.";
  }

  const heuresLabel = `${fmtNumber(heures, 1)} h`;
  const mortesLabel = fmtNumber(mortes, 1);
  const recupLabel = fmtNumber(recup, 1);
  const coutLabel = panier > 0 && cout !== null ? fmtEuro(cout) : "non calculé (panier = 0)";
  const scoreLabel = String(score);

  const recap = [
    "Récap formulaire contact vs funnel WP (indicatif)",
    `Demandes / mois : ${fmtNumber(demandes, 0)}`,
    `% exploitables sans rappel : ${fmtNumber(exploitPct, 0)} %`,
    `Minutes ressaisie / demande : ${fmtNumber(minutes, 0)}`,
    `Heures / mois perdues : ${heuresLabel}`,
    `Taux réponse < 24 h actuel : ${fmtNumber(tauxActuel, 0)} %`,
    `Taux réponse < 24 h cible : ${fmtNumber(tauxCible, 0)} %`,
    `Demandes mortes estimées : ${mortesLabel}`,
    `Demandes potentiellement récupérées : ${recupLabel}`,
    `Panier moyen HT : ${panier > 0 ? fmtEuro(panier) : "n/a"}`,
    `Coût d’opportunité indicatif : ${panier > 0 && cout !== null ? fmtEuro(cout) : "n/a"}`,
    `Score maturité pipeline : ${score} / 100`,
    `Statut : ${alert.replace(/^Pipeline [^·]+ · /, "")}`,
    "",
    "Checklist rapide :",
    "- Remplacer le mail contact par un devis créé (origine Site Web)",
    "- Sync catalogue Woo + variantes réelles",
    "- Clé site + CORS pour le widget navigateur",
    "- Notif commerciale (pas nurture prospect auto non voulu)",
    "- SLA première réponse sous 24 h (idéalement sous 1–4 h)",
    "",
    "Calcul local · à adapter à votre réalité métier.",
  ].join("\n");

  return {
    demandes,
    exploitPct,
    minutes,
    tauxActuel,
    tauxCible,
    panier,
    convPct,
    heures,
    mortes,
    recup,
    cout,
    score,
    scoreTone,
    alertTone,
    alert,
    tip,
    heuresLabel,
    mortesLabel,
    recupLabel,
    coutLabel,
    scoreLabel,
    recap,
  };
}
