function clamp(value: number, min: number, max: number) {
  const n = Number.isFinite(value) ? value : 0;
  return Math.min(max, Math.max(min, n));
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

export const DEMANDES_DEVIS_ABANDONNEES_DEFAULTS = {
  sessions: 120,
  pctAbandon: 60,
  pctEmail: 25,
  pctReprise: 15,
  pctGagne: 20,
  panier: 4000,
  gainEmail: 10,
} as const;

export const DEMANDES_DEVIS_ABANDONNEES_LABELS = {
  sessions: "Parcours commencés / mois",
  pctAbandon: "% des parcours abandonnés avant l'envoi",
  pctEmail: "% des abandons qui ont laissé un email",
  pctReprise: "% des relancés qui reprennent et envoient",
  pctGagne: "% des demandes envoyées qui deviennent Gagné",
  panier: "Panier moyen d'un devis gagné (€)",
  gainEmail: "Gain testé sur la capture d'email (points)",
  abandons: "Demandes abandonnées / mois",
  relancables: "Relançables (avec email) / mois",
  anonymes: "Sans email, non relançables / mois",
  reprises: "Demandes reprises et envoyées / mois (hypothèse)",
  gagnes: "Devis gagnés en plus / mois (hypothèse)",
  ca: "Chiffre d'affaires indicatif / mois",
  an: "Sur 12 mois (indicatif)",
  plafond: "Plafond théorique / mois (relançables × panier moyen)",
  gain: "Effet du gain de capture d'email / mois",
} as const;

export type DemandesDevisAbandonneesInput = {
  sessions: number;
  pctAbandon: number;
  pctEmail: number;
  pctReprise: number;
  pctGagne: number;
  panier: number;
  gainEmail: number;
};

export type DemandesDevisAbandonneesTone = "ok" | "warn" | "bad" | "neutral";

export type DemandesDevisAbandonneesResult = {
  sessions: number;
  pctAbandon: number;
  pctEmail: number;
  pctReprise: number;
  pctGagne: number;
  panier: number;
  gainEmail: number;
  pctEmailTest: number;
  abandons: number;
  relancables: number;
  anonymes: number;
  reprises: number;
  gagnes: number;
  ca: number;
  an: number;
  plafond: number;
  gain: number;
  gainAn: number;
  alertTone: DemandesDevisAbandonneesTone;
  caTone: DemandesDevisAbandonneesTone;
  gainTone: DemandesDevisAbandonneesTone;
  alert: string;
  tip: string;
  abandonsLabel: string;
  relancablesLabel: string;
  anonymesLabel: string;
  reprisesLabel: string;
  gagnesLabel: string;
  caLabel: string;
  anLabel: string;
  plafondLabel: string;
  gainLabel: string;
  recap: string;
};

export function computeDemandesDevisAbandonnees(
  input: DemandesDevisAbandonneesInput,
): DemandesDevisAbandonneesResult {
  const sessions = clamp(input.sessions, 0, 1000000);
  const pctAbandon = clamp(input.pctAbandon, 0, 100);
  const pctEmail = clamp(input.pctEmail, 0, 100);
  const pctReprise = clamp(input.pctReprise, 0, 100);
  const pctGagne = clamp(input.pctGagne, 0, 100);
  const panier = clamp(input.panier, 0, 100000000);
  const gainEmail = clamp(input.gainEmail, 0, 100);
  const pctEmailTest = Math.min(100, pctEmail + gainEmail);

  const abandonsExact = (sessions * pctAbandon) / 100;
  const relancablesExact = (abandonsExact * pctEmail) / 100;
  const reprisesExact = (relancablesExact * pctReprise) / 100;
  const gagnesExact = (reprisesExact * pctGagne) / 100;
  const ca = Math.round(gagnesExact * panier);
  const caTest = Math.round(
    abandonsExact * (pctEmailTest / 100) * (pctReprise / 100) * (pctGagne / 100) * panier,
  );

  const abandons = round1(abandonsExact);
  const relancables = round1(relancablesExact);
  const anonymes = round1(abandonsExact - relancablesExact);
  const reprises = round1(reprisesExact);
  const gagnes = Math.round((gagnesExact + Number.EPSILON) * 100) / 100;
  const an = ca * 12;
  const plafond = Math.round(relancablesExact * panier);
  const gain = caTest - ca;
  const gainAn = gain * 12;

  let alertTone: DemandesDevisAbandonneesTone = "neutral";
  let alert: string;
  let tip: string;

  if (sessions <= 0) {
    alert = "Indiquez un nombre de parcours commencés / mois pour estimer les demandes abandonnées.";
    tip = "Partez du mois dernier : le rapport PDF de la page Statistiques donne les marches Commencé, Email et Complété de votre entonnoir.";
  } else if (abandons <= 0) {
    alert = "Aucun abandon sur ces hypothèses : rien à relancer de ce côté.";
    tip =
      "Vérifiez tout de même la page Sessions de temps en temps : l'étape où les visiteurs s'arrêtent dit quelle question simplifier.";
  } else if (relancables <= 0) {
    alertTone = "warn";
    alert = `Abandons sans email · ${fmtNumber(abandons, 1)} demandes / mois s'arrêtent, aucune n'est relançable.`;
    tip =
      "Sans email, pas de relance. Mettez en avant la sauvegarde de la configuration (prénom, email) proposée à partir de la deuxième étape.";
  } else {
    if (an >= 50000) {
      alertTone = "bad";
      alert = `Enjeu important · environ ${fmtEuro(ca)} / mois de chiffre d'affaires indicatif récupérable (selon vos hypothèses).`;
    } else if (an >= 10000) {
      alertTone = "warn";
      alert = `Enjeu notable · environ ${fmtEuro(ca)} / mois de chiffre d'affaires indicatif récupérable (selon vos hypothèses).`;
    } else {
      alert = `Enjeu modeste · environ ${fmtEuro(ca)} / mois de chiffre d'affaires indicatif récupérable (selon vos hypothèses).`;
    }
    if (gain > 0) {
      tip = `Passer de ${fmtNumber(pctEmail, 0)} % à ${fmtNumber(pctEmailTest, 0)} % d'abandons avec email ajouterait environ ${fmtEuro(gain)} / mois avec les mêmes taux. La capture d'email pèse souvent plus que le texte de la relance.`;
    } else {
      tip =
        "Le gain testé sur la capture d'email est nul. Essayez 5 ou 10 points pour voir l'effet d'une sauvegarde mieux mise en avant.";
    }
  }

  const caTone: DemandesDevisAbandonneesTone = an >= 50000 ? "bad" : an >= 10000 ? "warn" : "neutral";
  const gainTone: DemandesDevisAbandonneesTone = gain > 0 ? "ok" : "neutral";

  const abandonsLabel = fmtNumber(abandons, 1);
  const relancablesLabel = fmtNumber(relancables, 1);
  const anonymesLabel = fmtNumber(anonymes, 1);
  const reprisesLabel = fmtNumber(reprises, 1);
  const gagnesLabel = fmtNumber(gagnes, 2);
  const caLabel = fmtEuro(ca);
  const anLabel = fmtEuro(an);
  const plafondLabel = fmtEuro(plafond);
  const gainLabel = `+ ${fmtEuro(gain)} · ${fmtEuro(gainAn)} sur 12 mois`;

  const recap = [
    "Récap demandes de devis abandonnées (indicatif)",
    `Parcours commencés / mois : ${fmtNumber(sessions, 0)} (${fmtNumber(pctAbandon, 0)} % abandonnés avant l'envoi)`,
    `Demandes abandonnées / mois : ${fmtNumber(abandons, 1)}`,
    `Relançables (${fmtNumber(pctEmail, 0)} % avec email) : ${fmtNumber(relancables, 1)} · sans email : ${fmtNumber(anonymes, 1)}`,
    `Hypothèses : ${fmtNumber(pctReprise, 0)} % reprennent après relance, ${fmtNumber(pctGagne, 0)} % deviennent Gagné, panier moyen ${fmtEuro(panier)}`,
    `Demandes reprises : ${fmtNumber(reprises, 1)} / mois · devis gagnés en plus : ${fmtNumber(gagnes, 2)} / mois`,
    `Chiffre d'affaires indicatif : ${fmtEuro(ca)} / mois · ${fmtEuro(an)} sur 12 mois`,
    `Plafond théorique (relançables × panier moyen) : ${fmtEuro(plafond)} / mois`,
    `Capture d'email à ${fmtNumber(pctEmailTest, 0)} % : + ${fmtEuro(gain)} / mois · + ${fmtEuro(gainAn)} sur 12 mois`,
    `Statut : ${alert}`,
    "",
    "Checklist demandes abandonnées dans QuoteBuilder :",
    "- Bandeau de sauvegarde (Prénom, Email pour recevoir le récap) à partir de la 2e étape",
    "- Déclencheur Session abandonnée : email présent, demande non envoyée, seuil d'inactivité en heures (1 h par défaut)",
    "- Parcours abandon par défaut : relance après 1 h puis 24 h d'inactivité, avec lien de reprise",
    "- La séquence s'arrête si la demande est envoyée ; une relance par session et par automatisation",
    "- Page Sessions : onglets À relancer, Emails, Tous ; détail de la visite et étapes franchies",
    "- Une session n'a ni score ni statut ; plugin WordPress : dossier Commencée et une seule relance à 2 h",
    "- Informer au moment de la collecte de l'email (finalité, droits)",
    "",
    "Calcul local · vos hypothèses, pas un benchmark · le plafond n'est pas une prévision.",
  ].join("\n");

  return {
    sessions,
    pctAbandon,
    pctEmail,
    pctReprise,
    pctGagne,
    panier,
    gainEmail,
    pctEmailTest,
    abandons,
    relancables,
    anonymes,
    reprises,
    gagnes,
    ca,
    an,
    plafond,
    gain,
    gainAn,
    alertTone,
    caTone,
    gainTone,
    alert,
    tip,
    abandonsLabel,
    relancablesLabel,
    anonymesLabel,
    reprisesLabel,
    gagnesLabel,
    caLabel,
    anLabel,
    plafondLabel,
    gainLabel,
    recap,
  };
}
