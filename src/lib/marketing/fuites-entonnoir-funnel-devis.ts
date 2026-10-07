function clamp(value: number, min: number, max: number) {
  const n = Number.isFinite(value) ? value : 0;
  return Math.min(max, Math.max(min, n));
}

function round1(n: number) {
  return Math.round((n + Number.EPSILON) * 10) / 10;
}

function round2(n: number) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function formatFuitesEuro(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);
}

export function formatFuitesNumber(value: number, digits = 1) {
  return new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: digits,
    minimumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);
}

export const FUITES_ENTONNOIR_STEP_LABELS = [
  "Visiteurs",
  "Commencé",
  "Email",
  "Complété",
  "Devis",
  "Rappelé",
  "Gagné",
] as const;

export const FUITES_ENTONNOIR_STEP_KEYS = [
  "visiteurs",
  "commences",
  "emails",
  "completes",
  "devis",
  "rappeles",
  "gagnes",
] as const;

export const FUITES_ENTONNOIR_TRANSITIONS = [
  "Visiteurs vers Commencé",
  "Commencé vers Email",
  "Email vers Complété",
  "Complété vers Devis",
  "Devis vers Rappelé",
  "Rappelé vers Gagné",
] as const;

export const FUITES_ENTONNOIR_TIPS = [
  "Beaucoup de visiteurs repartent sans répondre. Rendez la première question évidente (un choix visuel plutôt qu'un champ libre), et vérifiez que la page qui mène au funnel annonce bien ce que le prospect va obtenir.",
  "Peu de parcours commencés laissent un email. La sauvegarde de la configuration (prénom, email) apparaît à partir de la deuxième étape : dites clairement à quoi elle sert, par exemple recevoir le récapitulatif.",
  "Des prospects laissent leur email puis s'arrêtent. C'est la marche que les relances d'abandon peuvent rattraper : vérifiez que votre parcours abandon est activé et que l'email de reprise donne envie de revenir.",
  "Des parcours complétés ne deviennent pas des demandes. Regardez la dernière étape : champs obligatoires, message d'erreur, temps de chargement.",
  "Des demandes reçues ne sont pas rappelées. Ce n'est pas un problème de funnel : assignez chaque demande et changez son statut dès le premier contact.",
  "La perte se joue après le rappel, dans la vente elle-même. Le funnel aide en amont (brief complet, fourchette indicative), mais le levier principal est le devis, son délai et sa relance.",
] as const;

export const FUITES_ENTONNOIR_HINTS = {
  visiteurs: "Personnes qui ont ouvert le funnel.",
  commences: "Visiteurs qui ont donné une première réponse.",
  emails: "Parcours où des coordonnées ont été laissées.",
  completes: "Parcours arrivés au bout.",
  devis: "Demandes envoyées.",
  rappeles: "Demandes passées Contacté, En cours, En attente ou Gagné.",
  gagnes: "Demandes au statut Gagné (« Signé » dans le rapport).",
  panier: "Vos devis signés, pas la fourchette indicative.",
  etape: "Les taux des marches suivantes restent ceux que vous avez saisis.",
  gainPoints: "Par exemple 5 points : de 40 % à 45 %. Plafonné à 100 %.",
} as const;

export const FUITES_ENTONNOIR_DEFAULTS = {
  visiteurs: 800,
  commences: 320,
  emails: 200,
  completes: 150,
  devis: 140,
  rappeles: 120,
  gagnes: 30,
  panier: 3000,
  etape: 0,
  gainPoints: 5,
} as const;

export type FuitesEntonnoirInput = {
  visiteurs: number;
  commences: number;
  emails: number;
  completes: number;
  devis: number;
  rappeles: number;
  gagnes: number;
  panier: number;
  etape: number;
  gainPoints: number;
};

export type FuitesEntonnoirTone = "ok" | "warn" | "bad" | "neutral";

export type FuitesEntonnoirRow = {
  label: string;
  rate: number | null;
  passLabel: string;
  lost: number;
  lostLabel: string;
  weak: boolean;
};

export type FuitesEntonnoirResult = {
  counts: number[];
  capped: string[];
  panier: number;
  etape: number;
  gainPoints: number;
  rates: Array<number | null>;
  lost: number[];
  weakest: number | null;
  biggestLoss: number | null;
  conversion: number;
  globalRate: number;
  ca: number;
  rateTest: number | null;
  simulable: boolean;
  gagnesPlus: number;
  gain: number;
  gainAn: number;
  alertTone: FuitesEntonnoirTone;
  gainTone: FuitesEntonnoirTone;
  alert: string;
  tip: string;
  rows: FuitesEntonnoirRow[];
  conversionLabel: string;
  globalLabel: string;
  weakLabel: string;
  lossLabel: string;
  caLabel: string;
  gainLabel: string;
  gainAnLabel: string;
  recap: string;
};

function stepLabel(index: number | null) {
  return index == null ? "-" : FUITES_ENTONNOIR_TRANSITIONS[index];
}

export function computeFuitesEntonnoir(raw: FuitesEntonnoirInput): FuitesEntonnoirResult {
  const counts: number[] = [];
  const capped: string[] = [];
  FUITES_ENTONNOIR_STEP_KEYS.forEach((key, i) => {
    let value = Math.round(clamp(raw[key], 0, 10000000));
    const previous = counts[i - 1];
    if (i > 0 && previous != null && value > previous) {
      value = previous;
      capped.push(FUITES_ENTONNOIR_STEP_LABELS[i]);
    }
    counts.push(value);
  });
  const panier = clamp(raw.panier, 0, 100000000);
  const etapeRaw = Math.round(clamp(raw.etape, 0, 5));
  const etape = Number.isFinite(etapeRaw) ? etapeRaw : 0;
  const gainPoints = clamp(raw.gainPoints, 0, 100);

  const ratesExact: Array<number | null> = [];
  for (let i = 1; i < counts.length; i += 1) {
    const previous = counts[i - 1] ?? 0;
    const current = counts[i] ?? 0;
    ratesExact.push(previous > 0 ? (current / previous) * 100 : null);
  }
  const rates = ratesExact.map((rate) => (rate == null ? null : round1(rate)));
  const lost = counts.slice(1).map((count, i) => (counts[i] ?? 0) - count);

  let weakest: number | null = null;
  ratesExact.forEach((rate, i) => {
    if (rate == null) return;
    if (weakest == null || rate < (ratesExact[weakest] ?? 0)) weakest = i;
  });
  let biggestLoss: number | null = null;
  lost.forEach((loss, i) => {
    if ((counts[i] ?? 0) <= 0) return;
    if (biggestLoss == null || loss > (lost[biggestLoss] ?? 0)) biggestLoss = i;
  });

  const visiteurs = counts[0] ?? 0;
  const devis = counts[4] ?? 0;
  const gagnes = counts[6] ?? 0;
  const conversion = visiteurs > 0 ? round1((devis / visiteurs) * 100) : 0;
  const globalRate = visiteurs > 0 ? round2((gagnes / visiteurs) * 100) : 0;
  const ca = Math.round(gagnes * panier);

  let gagnesTest = gagnes;
  let simulable = false;
  const base = ratesExact[etape];
  if (base != null) {
    const newRate = Math.min(100, base + gainPoints);
    let value = ((counts[etape] ?? 0) * newRate) / 100;
    let ok = true;
    for (let j = etape + 1; j < ratesExact.length; j += 1) {
      const next = ratesExact[j];
      if (next == null) {
        ok = false;
        break;
      }
      value = (value * next) / 100;
    }
    if (ok) {
      gagnesTest = value;
      simulable = true;
    }
  }
  const rateTest = base == null ? null : round1(Math.min(100, base + gainPoints));
  const gagnesPlus = simulable ? round2(gagnesTest - gagnes) : 0;
  const gain = simulable ? Math.round((gagnesTest - gagnes) * panier) : 0;
  const gainAn = gain * 12;

  let alertTone: FuitesEntonnoirTone = "neutral";
  let alert: string;
  let tip: string;

  if (visiteurs <= 0) {
    alert = "Indiquez au moins un nombre de visiteurs pour calculer les taux de passage.";
    tip = "Partez des 30 derniers jours : le rapport PDF de la page Statistiques donne les sept marches dans l'ordre.";
  } else if (!simulable) {
    alertTone = "warn";
    alert = `Hypothèse non calculable · une marche en amont ou en aval de « ${stepLabel(etape)} » est à zéro.`;
    tip = "Choisissez une autre marche, ou complétez l'entonnoir jusqu'au statut Gagné.";
  } else if (capped.length) {
    alertTone = "warn";
    const plural = capped.length > 1;
    alert = `Marches corrigées · ${capped.join(", ")} dépassai${plural ? "ent" : "t"} la marche précédente et ${plural ? "ont été ramenées" : "a été ramenée"} à sa valeur.`;
    tip = `${FUITES_ENTONNOIR_TIPS[weakest ?? 0]} Avec votre hypothèse, passer « ${stepLabel(etape)} » de ${formatFuitesNumber(rates[etape] ?? 0, 1)} % à ${formatFuitesNumber(rateTest ?? 0, 1)} % ajouterait environ ${formatFuitesNumber(gagnesPlus, 2)} affaire(s) et ${formatFuitesEuro(gain)} sur la période.`;
  } else {
    alert = `Marche la plus faible : ${stepLabel(weakest)} (${formatFuitesNumber(weakest == null ? 0 : (rates[weakest] ?? 0), 1)} %). Plus gros volume perdu : ${stepLabel(biggestLoss)} (${formatFuitesNumber(biggestLoss == null ? 0 : (lost[biggestLoss] ?? 0), 0)}).`;
    tip = `${FUITES_ENTONNOIR_TIPS[weakest ?? 0]} Avec votre hypothèse, passer « ${stepLabel(etape)} » de ${formatFuitesNumber(rates[etape] ?? 0, 1)} % à ${formatFuitesNumber(rateTest ?? 0, 1)} % ajouterait environ ${formatFuitesNumber(gagnesPlus, 2)} affaire(s) et ${formatFuitesEuro(gain)} sur la période.`;
  }

  const rows: FuitesEntonnoirRow[] = rates.map((rate, i) => ({
    label: FUITES_ENTONNOIR_TRANSITIONS[i] ?? "",
    rate,
    passLabel: rate == null ? "-" : `${formatFuitesNumber(rate, 1)} %`,
    lost: lost[i] ?? 0,
    lostLabel: formatFuitesNumber(lost[i] ?? 0, 0),
    weak: i === weakest,
  }));

  const lines = [
    "Récap fuites de l'entonnoir de devis (indicatif)",
    `Marches : ${FUITES_ENTONNOIR_STEP_LABELS.map((label, i) => `${label} ${formatFuitesNumber(counts[i] ?? 0, 0)}`).join(" · ")}`,
  ];
  rates.forEach((rate, i) => {
    lines.push(
      `- ${FUITES_ENTONNOIR_TRANSITIONS[i]} : ${rate == null ? "-" : `${formatFuitesNumber(rate, 1)} %`} (${formatFuitesNumber(lost[i] ?? 0, 0)} perdus)`,
    );
  });
  lines.push(
    `Demandes envoyées / visiteurs : ${formatFuitesNumber(conversion, 1)} % · affaires gagnées / visiteurs : ${formatFuitesNumber(globalRate, 2)} %`,
    `Marche la plus faible : ${stepLabel(weakest)} · plus gros volume perdu : ${stepLabel(biggestLoss)}`,
    `Chiffre d'affaires de la période : ${formatFuitesEuro(ca)} (montant moyen ${formatFuitesEuro(panier)})`,
    `Hypothèse : + ${formatFuitesNumber(gainPoints, 0)} points sur « ${stepLabel(etape)} » : ${simulable ? `+ ${formatFuitesNumber(gagnesPlus, 2)} affaires, + ${formatFuitesEuro(gain)} sur la période, + ${formatFuitesEuro(gainAn)} sur 12 périodes` : "non calculable"}`,
    `Statut : ${alert}`,
    "",
    "Checklist mesure dans QuoteBuilder :",
    "- Page Statistiques : périodes Aujourd'hui, 7 jours, 30 jours, comparées à la période précédente",
    "- Rapport PDF : Tunnel de conversion en sept marches avec le taux depuis la marche précédente",
    "- Filtrer par funnel avant de comparer, onglets Funnels, Campagnes, Sources, Pipeline",
    "- Rappelé = Contacté, En cours, En attente ou Gagné ; Signé = Gagné",
    "- Poser le statut Gagné ou Perdu sur chaque dossier, sinon la dernière marche reste vide",
    "- Liens de campagne avec paramètres UTM pour lire les sources",
    "",
    "Calcul local · vos chiffres, pas un benchmark · taux constants en aval, une hypothèse.",
  );

  return {
    counts,
    capped,
    panier,
    etape,
    gainPoints,
    rates,
    lost,
    weakest,
    biggestLoss,
    conversion,
    globalRate,
    ca,
    rateTest,
    simulable,
    gagnesPlus,
    gain,
    gainAn,
    alertTone,
    gainTone: gain > 0 ? "ok" : "neutral",
    alert,
    tip,
    rows,
    conversionLabel: `${formatFuitesNumber(conversion, 1)} %`,
    globalLabel: `${formatFuitesNumber(globalRate, 2)} %`,
    weakLabel:
      weakest == null ? "-" : `${stepLabel(weakest)} · ${formatFuitesNumber(rates[weakest] ?? 0, 1)} %`,
    lossLabel:
      biggestLoss == null
        ? "-"
        : `${stepLabel(biggestLoss)} · ${formatFuitesNumber(lost[biggestLoss] ?? 0, 0)} perdus`,
    caLabel: formatFuitesEuro(ca),
    gainLabel: simulable
      ? `+ ${formatFuitesNumber(gagnesPlus, 2)} affaires · + ${formatFuitesEuro(gain)}`
      : "-",
    gainAnLabel: simulable ? `+ ${formatFuitesEuro(gainAn)}` : "-",
    recap: lines.join("\n"),
  };
}
