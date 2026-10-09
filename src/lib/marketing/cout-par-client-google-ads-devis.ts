export type AdsCostTone = "neutral" | "bad" | "warn" | "ok";

export type AdsCostInput = {
  budget?: number | string;
  cpc?: number | string;
  tauxDemande?: number | string;
  tauxGagne?: number | string;
  panier?: number | string;
  marge?: number | string;
  delai?: number | string;
};

export type AdsCostVerdict = {
  tone: AdsCostTone;
  text: string;
};

export type AdsCostResult = {
  budget: number;
  cpc: number;
  delai: number;
  clics: number;
  demandes: number;
  clients: number;
  coutDevis: number | null;
  coutClient: number | null;
  ca: number;
  margeBrute: number;
  resultat: number;
  ratio: number | null;
  maxClient: number;
  maxDevis: number;
  maxCpc: number;
  lectureJours: number;
  verdict: AdsCostVerdict;
  conseils: string[];
  recap: string;
};

/** Exemple de l'article : budget 1 500 €, CPC 2,50 €, 4 %, 20 %, panier 6 000 €, marge 30 %, délai 45 j. */
export const ADS_COST_DEFAULTS = {
  budget: 1500,
  cpc: 2.5,
  tauxDemande: 4,
  tauxGagne: 20,
  panier: 6000,
  marge: 30,
  delai: 45,
} as const;

function num(v: unknown, min: number, max: number | null, fallback: number) {
  let n = Number(v);
  if (!Number.isFinite(n)) n = fallback;
  if (n < min) n = min;
  if (max != null && n > max) n = max;
  return n;
}

function r6(n: number) {
  return Math.round(n * 1e6) / 1e6;
}

function groupe(entier: number) {
  return String(entier).replace(/\B(?=(\d{3})+(?!\d))/g, "\u00a0");
}

/** Montant en euros, espace insécable avant €. Centimes sous 1 000 € si le montant n'est pas entier. */
export function fmtEur(n: number | null) {
  if (n == null || !Number.isFinite(n)) return "n/a";
  const neg = n < 0;
  const a = Math.abs(n);
  let txt: string;
  if (a < 1000 && Math.round(a * 100) % 100 !== 0) {
    const c = Math.round(a * 100);
    txt = groupe(Math.floor(c / 100)) + "," + String(c % 100).padStart(2, "0");
  } else {
    txt = groupe(Math.round(a));
  }
  return (neg ? "-" : "") + txt + "\u00a0€";
}

export function fmtNum(n: number | null) {
  if (n == null || !Number.isFinite(n)) return "n/a";
  const d = Math.round(n * 10) / 10;
  if (d % 1 === 0) return groupe(d);
  return groupe(Math.floor(d)) + "," + Math.round((d % 1) * 10);
}

/** Coût par devis, coût par client et plafond à l'équilibre. Calcul local, mêmes bornes que le HTML source. */
export function computeAdsCost(input: AdsCostInput): AdsCostResult {
  const budget = num(input.budget, 0, null, 0);
  const cpc = num(input.cpc, 0, null, 0);
  const td = num(input.tauxDemande, 0, 100, 0) / 100;
  const tg = num(input.tauxGagne, 0, 100, 0) / 100;
  const panier = num(input.panier, 0, null, 0);
  const marge = num(input.marge, 0, 100, 0) / 100;
  const delai = Math.round(num(input.delai, 0, 730, 0));

  const clics = cpc > 0 ? r6(budget / cpc) : 0;
  const demandes = r6(clics * td);
  const clients = r6(demandes * tg);
  const coutDevis = demandes > 0 ? r6(budget / demandes) : null;
  const coutClient = clients > 0 ? r6(budget / clients) : null;
  const ca = r6(clients * panier);
  const margeBrute = r6(ca * marge);
  const resultat = r6(margeBrute - budget);
  const ratio = budget > 0 ? r6(margeBrute / budget) : null;
  const maxClient = r6(panier * marge);
  const maxDevis = r6(maxClient * tg);
  const maxCpc = r6(maxDevis * td);
  const lectureJours = delai <= 30 ? 30 : Math.ceil(delai / 30) * 30;

  let verdict: AdsCostVerdict;
  if (budget <= 0 || cpc <= 0) {
    verdict = { tone: "neutral", text: "Saisissez un budget et un coût par clic pour lancer le calcul." };
  } else if (clients <= 0) {
    verdict = { tone: "bad", text: "Aucun client sur ces hypothèses : vérifiez vos deux taux de transformation." };
  } else if (ratio != null && ratio < 1) {
    verdict = { tone: "bad", text: "Déficitaire sur ces hypothèses : la marge générée ne couvre pas la dépense." };
  } else if (ratio != null && ratio < 1.5) {
    verdict = { tone: "warn", text: "Marge fine : la publicité est couverte, mais il reste peu pour payer le temps de chiffrage." };
  } else {
    verdict = { tone: "ok", text: "Rentable sur ces hypothèses : " + fmtEur(ratio) + " de marge brute par euro dépensé." };
  }

  const conseils: string[] = [];
  if (delai > 90) {
    conseils.push(
      "Délai de " +
        delai +
        " jours : au-delà de 90 jours après le clic, la fenêtre des actions de conversion créées par QuoteBuilder, Google Ads ne rattache plus la signature à l'annonce. Le client reste visible dans QuoteBuilder.",
    );
  }
  conseils.push(
    "Lisez le coût par client sur au moins " +
      lectureJours +
      " jours" +
      (delai > 30 ? ", car les signatures d'un mois de dépense arrivent en partie les mois suivants." : "."),
  );
  if (clients > 0 && clients < 3) {
    conseils.push(
      "Moins de 3 clients par mois : une signature de plus ou de moins change beaucoup le coût par client. Pilotez au coût par devis et jugez le coût par client sur un cumul de trois mois.",
    );
  }
  if (cpc > 0 && maxCpc > 0 && cpc > maxCpc) {
    conseils.push(
      "Votre coût par clic (" +
        fmtEur(cpc) +
        ") dépasse le maximum à l'équilibre (" +
        fmtEur(maxCpc) +
        ") : à taux constants, chaque clic coûte plus qu'il ne rapporte.",
    );
  }
  conseils.push(
    "Ces chiffres supposent que chaque affaire signée passe au statut Gagné. Sans mise à jour des statuts, le coût par client est faux.",
  );

  const recap = [
    "Hypothèses : budget " +
      fmtEur(budget) +
      " par mois, coût par clic " +
      fmtEur(cpc) +
      ", " +
      fmtNum(td * 100) +
      " % des clics en demande, " +
      fmtNum(tg * 100) +
      " % des demandes gagnées, panier " +
      fmtEur(panier) +
      ", marge " +
      fmtNum(marge * 100) +
      " %, délai " +
      delai +
      " jours.",
    "Résultat : " +
      fmtNum(clics) +
      " clics, " +
      fmtNum(demandes) +
      " demandes, " +
      fmtNum(clients) +
      " clients par mois. Un devis coûte " +
      fmtEur(coutDevis) +
      ", un client coûte " +
      fmtEur(coutClient) +
      ".",
    "Marge brute " + fmtEur(margeBrute) + ", soit " + fmtEur(resultat) + " après dépense publicitaire.",
    "Maximum à l'équilibre : " +
      fmtEur(maxClient) +
      " par client, " +
      fmtEur(maxDevis) +
      " par devis, " +
      fmtEur(maxCpc) +
      " par clic.",
    "Calcul : quotebuilder.co/outils/calculateur-cout-par-client-google-ads-devis",
  ].join("\n");

  return {
    budget,
    cpc,
    delai,
    clics,
    demandes,
    clients,
    coutDevis,
    coutClient,
    ca,
    margeBrute,
    resultat,
    ratio,
    maxClient,
    maxDevis,
    maxCpc,
    lectureJours,
    verdict,
    conseils,
    recap,
  };
}
