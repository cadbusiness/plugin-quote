export const PLAFONDS = {
  prive: 5,
  public: 5,
  public_pme: 3,
} as const;

export type Cadre = keyof typeof PLAFONDS;
export type BaseRetenue = "ttc" | "ht";
export type RetenueTone = "ok" | "warn" | "bad" | "neutral";

export const DEFAULTS = {
  montantHT: 80000,
  tva: 20,
  cadre: "prive",
  base: "ttc",
  taux: 5,
  nbVersements: 4,
  dureeMois: 6,
  dateReception: "2027-04-30",
  delaiGarantie: 12,
  tauxTreso: 6,
  commission: 1,
  fraisCaution: 0,
} as const;

export type RetenueInput = {
  montantHT?: unknown;
  tva?: unknown;
  cadre?: unknown;
  base?: unknown;
  taux?: unknown;
  nbVersements?: unknown;
  dureeMois?: unknown;
  dateReception?: unknown;
  delaiGarantie?: unknown;
  tauxTreso?: unknown;
  commission?: unknown;
  fraisCaution?: unknown;
};

export type RetenueLigne = {
  rang: number;
  mois: number;
  montant: number;
  retenue: number;
  encaisse: number;
  immo: number;
  cout: number;
};

export type RetenueResult = {
  montantHT: number;
  tva: number;
  cadre: Cadre;
  base: BaseRetenue;
  taux: number;
  nbVersements: number;
  dureeMois: number;
  delaiGarantie: number;
  tauxTreso: number;
  commission: number;
  fraisCaution: number;
  reception: number | null;
  plafond: number;
  montantTTC: number;
  baseMontant: number;
  retenue: number;
  pctHT: number;
  parVersement: number;
  versement: number;
  netTotal: number;
  moisGarantie: number;
  finGarantie: number | null;
  liberation: number | null;
  lignes: RetenueLigne[];
  coutTreso: number;
  immoMoyenne: number;
  dureeCaution: number;
  coutCaution: number;
  ecart: number;
  etat: RetenueTone;
  verdict: string;
  liberationMsg: string;
  conseils: string[];
  recap: string;
};

function num(v: unknown, min: number, max: number, fallback: number): number {
  let n = v === "" || v == null ? Number.NaN : Number(v);
  if (!Number.isFinite(n)) n = fallback;
  if (n < min) n = min;
  if (n > max) n = max;
  return n;
}

function r6(n: number): number {
  return Math.round(n * 1e6) / 1e6;
}

function groupe(entier: number): string {
  return String(entier).replace(/\B(?=(\d{3})+(?!\d))/g, "\u00a0");
}

export function fmtEur(n: number | null): string {
  if (n == null || !Number.isFinite(n)) return "n/a";
  const c = Math.round(Math.abs(n) * 100);
  const neg = n < 0 && c !== 0;
  let txt = groupe(Math.floor(c / 100));
  if (c % 100 !== 0) txt += "," + String(c % 100).padStart(2, "0");
  return (neg ? "-" : "") + txt + "\u00a0€";
}

export function fmtNum(n: number | null): string {
  if (n == null || !Number.isFinite(n)) return "n/a";
  const d = Math.round(Math.abs(n) * 100);
  const neg = n < 0 && d !== 0;
  const ent = Math.floor(d / 100);
  const dec = d % 100;
  let txt = groupe(ent);
  if (dec) txt += "," + (dec % 10 === 0 ? String(dec / 10) : String(dec).padStart(2, "0"));
  return (neg ? "-" : "") + txt;
}

export function fmtPct(n: number | null): string {
  if (n == null || !Number.isFinite(n)) return "n/a";
  return fmtNum(n) + "\u00a0%";
}

export function fmtMois(n: number | null): string {
  if (n == null || !Number.isFinite(n)) return "n/a";
  return fmtNum(n) + " mois";
}

export function parseDate(s: unknown): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s == null ? "" : s).trim());
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const t = Date.UTC(y, mo - 1, d);
  const dt = new Date(t);
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== mo - 1 || dt.getUTCDate() !== d) return null;
  return Math.round(t / 86400000);
}

export function fmtDate(day: number | null): string {
  if (day == null) return "n/a";
  const dt = new Date(day * 86400000);
  return (
    String(dt.getUTCDate()).padStart(2, "0") +
    "/" +
    String(dt.getUTCMonth() + 1).padStart(2, "0") +
    "/" +
    dt.getUTCFullYear()
  );
}

export function addMois(day: number | null, mois: number): number | null {
  if (day == null) return null;
  const dt = new Date(day * 86400000);
  const y = dt.getUTCFullYear();
  const m = dt.getUTCMonth() + mois;
  const d = dt.getUTCDate();
  const dernier = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  return Math.round(Date.UTC(y, m, Math.min(d, dernier)) / 86400000);
}

function isCadre(value: unknown): value is Cadre {
  return value === "prive" || value === "public" || value === "public_pme";
}

export function computeRetenue(input: RetenueInput = {}): RetenueResult {
  const montantHT = num(input.montantHT, 0, 1e9, 0);
  const tva = num(input.tva, 0, 100, 0);
  const cadre: Cadre = isCadre(input.cadre) ? input.cadre : "prive";
  const base: BaseRetenue = input.base === "ht" ? "ht" : "ttc";
  const taux = num(input.taux, 0, 100, 0);
  const nbVersements = Math.floor(num(input.nbVersements, 1, 60, 1));
  const dureeMois = Math.floor(num(input.dureeMois, 0, 120, 0));
  const delaiGarantie = Math.floor(num(input.delaiGarantie, 0, 120, 12));
  const tauxTreso = num(input.tauxTreso, 0, 100, 0);
  const commission = num(input.commission, 0, 100, 0);
  const fraisCaution = num(input.fraisCaution, 0, 1e6, 0);
  const reception = parseDate(input.dateReception);
  const publicMarche = cadre !== "prive";
  const plafond = PLAFONDS[cadre];

  const montantTTC = r6(montantHT * (1 + tva / 100));
  const baseMontant = base === "ttc" ? montantTTC : montantHT;
  const retenue = r6((baseMontant * taux) / 100);
  const pctHT = montantHT > 0 ? r6((retenue / montantHT) * 100) : 0;
  const parVersement = r6(retenue / nbVersements);
  const versement = r6(baseMontant / nbVersements);
  const netTotal = r6(baseMontant - retenue);

  const moisGarantie = publicMarche ? delaiGarantie : 12;
  const finGarantie = addMois(reception, moisGarantie);
  const liberation = publicMarche ? (finGarantie == null ? null : finGarantie + 30) : finGarantie;
  const apresReception = publicMarche ? delaiGarantie + 1 : 12;

  const lignes: RetenueLigne[] = [];
  let coutTreso = 0;
  let sommeImmo = 0;
  for (let k = 1; k <= nbVersements; k++) {
    const mois = r6((dureeMois * k) / nbVersements);
    const immo = r6(dureeMois - mois + apresReception);
    const cout = r6((parVersement * tauxTreso) / 100 * (immo / 12));
    coutTreso += ((parVersement * tauxTreso) / 100) * (immo / 12);
    sommeImmo += immo;
    lignes.push({
      rang: k,
      mois,
      montant: versement,
      retenue: parVersement,
      encaisse: r6(versement - parVersement),
      immo,
      cout,
    });
  }
  coutTreso = r6(coutTreso);
  const immoMoyenne = r6(sommeImmo / nbVersements);
  const dureeCaution = dureeMois + apresReception;
  const coutCaution = retenue > 0 ? r6((retenue * commission) / 100 * (dureeCaution / 12) + fraisCaution) : 0;
  const ecart = r6(coutTreso - coutCaution);

  const baseTxt = base === "ttc" ? "TTC" : "HT";
  let etat: RetenueTone;
  let verdict: string;
  if (montantHT <= 0) {
    etat = "neutral";
    verdict = "Saisissez le montant du marché pour calculer la retenue.";
  } else if (taux <= 0) {
    etat = "neutral";
    verdict =
      "Pas de retenue : rien n'est gardé sur vos versements. Vérifiez quand même que le contrat du client n'en prévoit pas.";
  } else if (taux > plafond) {
    etat = "bad";
    if (cadre === "prive") {
      verdict =
        "Une retenue de " +
        fmtPct(taux) +
        " dépasse le plafond de 5\u00a0% de la loi du 16 juillet 1971 pour un marché de travaux privé. Son article 3 rend nulles les clauses qui font échec à la loi : demandez que le taux soit ramené à 5\u00a0% au plus.";
    } else {
      verdict =
        "Une retenue de " +
        fmtPct(taux) +
        " dépasse le plafond de " +
        fmtPct(plafond) +
        " de l'article R2191-33 du Code de la commande publique. Signalez-le à l'acheteur avant de remettre votre offre.";
    }
  } else if (reception == null) {
    etat = "neutral";
    verdict =
      "Retenue de " + fmtEur(retenue) + ". Saisissez la date de réception prévue pour obtenir la date de libération.";
  } else {
    let resume =
      "Retenue de " +
      fmtEur(retenue) +
      " (" +
      fmtPct(taux) +
      " de " +
      fmtEur(baseMontant) +
      " " +
      baseTxt +
      "), soit " +
      fmtEur(parVersement) +
      " sur " +
      (nbVersements > 1 ? "chacun des " + nbVersements + " versements" : "votre versement unique") +
      ". ";
    resume += publicMarche
      ? "Remboursement au plus tard le " +
        fmtDate(liberation) +
        ", 30 jours après la fin du délai de garantie, si les réserves sont levées."
      : "Libération le " +
        fmtDate(liberation) +
        ", un an après la réception, si le maître de l'ouvrage n'a pas fait opposition.";
    if (coutCaution > coutTreso) {
      etat = "warn";
      verdict =
        resume +
        " Ici, la caution coûterait plus cher (" +
        fmtEur(coutCaution) +
        ") que la trésorerie immobilisée (" +
        fmtEur(coutTreso) +
        ") : vérifiez les taux saisis.";
    } else {
      etat = "ok";
      verdict =
        resume +
        " Une caution coûterait environ " +
        fmtEur(coutCaution) +
        ", contre " +
        fmtEur(coutTreso) +
        " de trésorerie immobilisée.";
    }
  }

  let liberationMsg: string;
  if (reception == null) liberationMsg = "Saisissez la date de réception prévue.";
  else if (publicMarche) {
    liberationMsg =
      "Marché public : la retenue est remboursée dans les 30 jours qui suivent la fin du délai de garantie. Si des réserves notifiées pendant ce délai ne sont pas levées, le remboursement attend 30 jours après leur levée.";
  } else {
    liberationMsg =
      "Marché privé : un an après la réception, avec ou sans réserves, la caution est libérée ou les sommes consignées vous sont versées, même sans mainlevée, sauf opposition motivée notifiée par lettre recommandée.";
  }

  const conseils: string[] = [];
  if (montantHT > 0 && taux > 0) {
    if (cadre === "prive") {
      conseils.push(
        "Le maître de l'ouvrage doit consigner une somme égale à la retenue chez un consignataire accepté par les deux parties. Demandez où elle sera consignée, et écrivez-le dans le marché.",
      );
    } else {
      conseils.push(
        "Sur un marché public, vous pouvez remplacer la retenue par une garantie à première demande ou, si l'acheteur ne s'y oppose pas, par une caution personnelle et solidaire.",
      );
    }
    if (base === "ttc" && tva > 0) {
      conseils.push(
        "Calculée sur le TTC, la retenue de " +
          fmtPct(taux) +
          " représente " +
          fmtPct(pctHT) +
          " du montant HT de votre marché. Regardez-la en face de votre marge, pas seulement du prix.",
      );
    }
    if (coutCaution <= coutTreso) {
      conseils.push(
        "Une caution du même montant, donnée par une banque, un établissement financier habilité ou une société de caution mutuelle, évite la retenue" +
          (cadre === "prive" ? " : la loi dit que la retenue « n'est pas pratiquée » si vous la fournissez." : ".") +
          " Coût estimé : " +
          fmtEur(coutCaution) +
          " sur " +
          fmtMois(dureeCaution) +
          ", contre " +
          fmtEur(coutTreso) +
          " de trésorerie immobilisée.",
      );
    } else {
      conseils.push(
        "Avec ces taux, garder la retenue coûte moins cher qu'une caution. Comparez quand même avec le taux réel que votre banque vous propose.",
      );
    }
    conseils.push(
      cadre === "prive"
        ? "La retenue sert à couvrir les réserves faites à la réception. Levez-les vite et par écrit : cela réduit le risque d'une opposition à la libération."
        : "La retenue couvre les réserves faites à la réception et celles notifiées pendant le délai de garantie. Levez-les vite et par écrit.",
    );
    if (reception != null) {
      conseils.push(
        publicMarche
          ? "Notez la date limite de remboursement (" +
              fmtDate(liberation) +
              ") dès la réception, et réclamez la somme si elle n'est pas arrivée à cette date."
          : "Notez la date de libération (" +
              fmtDate(liberation) +
              ") dès la réception, et réclamez à cette date les sommes consignées ou la libération de la caution, sans attendre qu'on vous les propose.",
      );
    }
  }
  conseils.push(
    "QuoteBuilder ne calcule pas de retenue de garantie : écrivez-la dans votre devis final, et demandez dès la demande de devis si le client en prévoit une.",
  );

  const cadreTxt =
    cadre === "prive"
      ? "marché privé, loi du 16 juillet 1971 (plafond 5\u00a0%)"
      : cadre === "public"
        ? "marché public (plafond 5\u00a0%)"
        : "marché public, PME (plafond 3\u00a0%)";
  const recap = [
    "Retenue de garantie (marché de travaux)",
    "Marché : " + fmtEur(montantHT) + " HT, " + fmtEur(montantTTC) + " TTC (TVA " + fmtPct(tva) + ")",
    "Cadre : " + cadreTxt,
    "Retenue : " +
      fmtPct(taux) +
      " du " +
      baseTxt +
      " = " +
      fmtEur(retenue) +
      " (" +
      fmtEur(parVersement) +
      " \u00d7 " +
      nbVersements +
      (nbVersements > 1 ? " versements)" : " versement)"),
    "Encaissé avant libération : " + fmtEur(netTotal),
    "Réception prévue le " +
      fmtDate(reception) +
      ", " +
      (publicMarche ? "remboursement au plus tard le " : "libération le ") +
      fmtDate(liberation),
    "Trésorerie immobilisée : " + fmtEur(coutTreso) + " (" + fmtPct(tauxTreso) + " par an)",
    "Caution bancaire : " + fmtEur(coutCaution) + " (" + fmtPct(commission) + " par an sur " + fmtMois(dureeCaution) + ")",
    "Calcul : quotebuilder.co/outils/calculateur-retenue-garantie",
  ].join("\n");

  return {
    montantHT,
    tva,
    cadre,
    base,
    taux,
    nbVersements,
    dureeMois,
    delaiGarantie,
    tauxTreso,
    commission,
    fraisCaution,
    reception,
    plafond,
    montantTTC,
    baseMontant,
    retenue,
    pctHT,
    parVersement,
    versement,
    netTotal,
    moisGarantie,
    finGarantie,
    liberation,
    lignes,
    coutTreso,
    immoMoyenne,
    dureeCaution,
    coutCaution,
    ecart,
    etat,
    verdict,
    liberationMsg,
    conseils,
    recap,
  };
}

export function buildRecap(input: RetenueInput = {}): string {
  return computeRetenue(input).recap;
}
