export const MODES = ["periode", "indeterminee", "aucune"] as const;
export const UNITES = ["mois", "jours"] as const;

export const DEFAULTS = {
  dateDebut: "2025-01-01",
  dureeInitiale: 12,
  mode: "periode",
  dureeReconduction: 12,
  preavis: 3,
  unite: "mois",
  dateCourrier: "2026-10-15",
  mensuel: 1800,
} as const;

const LIGNES_MIN = 6;

export type PreavisMode = (typeof MODES)[number];
export type PreavisUnite = (typeof UNITES)[number];
export type PreavisTone = "ok" | "warn" | "bad" | "neutral";

export type PreavisInput = {
  dateDebut?: unknown;
  dureeInitiale?: unknown;
  mode?: unknown;
  dureeReconduction?: unknown;
  preavis?: unknown;
  unite?: unknown;
  dateCourrier?: unknown;
  mensuel?: unknown;
};

export type PreavisLigne = {
  periode: string;
  du: string;
  au: string | null;
  limite: string | null;
  etatPeriode: string;
  courant: boolean;
  fin: boolean;
};

export type PreavisResult = {
  dateDebut: string | null;
  dureeInitiale: number;
  mode: PreavisMode;
  dureeReconduction: number;
  preavis: number;
  unite: PreavisUnite;
  dateCourrier: string | null;
  mensuel: number;
  valide: boolean;
  etat: PreavisTone;
  verdict: string;
  lignes: PreavisLigne[];
  conseils: string[];
  clause: string;
  recap: string;
  periodeDebut: string | null;
  periodeFin: string | null;
  periodeLibelle: string | null;
  limite: string | null;
  limiteTexte: string;
  finEffective: string | null;
  retardJours: number | null;
  prochaineLimite: string | null;
  joursEngages: number | null;
  montantEngage: number | null;
  moisRelation: number | null;
  joursRelation: number | null;
  dureeRelation: string;
};

type Ymd = { y: number; m: number; d: number };

function num(v: unknown, min: number, max: number | null, fallback: number): number {
  let n = v === "" || v == null ? Number.NaN : Number(v);
  if (!Number.isFinite(n)) n = fallback;
  if (n < min) n = min;
  if (max != null && n > max) n = max;
  return n;
}

function r2(n: number): number {
  return Math.round(n * 100) / 100;
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

export function fmtHt(n: number | null): string {
  if (n == null || !Number.isFinite(n)) return "n/a";
  return fmtEur(n) + " HT";
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function joursDansMois(y: number, m: number): number {
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}

export function parseDate(s: unknown): Ymd | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s == null ? "" : s));
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  if (mo < 1 || mo > 12 || d < 1 || d > joursDansMois(y, mo)) return null;
  return { y, m: mo, d };
}

function toDays(iso: string): number | null {
  const p = parseDate(iso);
  return p ? Date.UTC(p.y, p.m - 1, p.d) / 864e5 : null;
}

function fromDays(n: number): string {
  const dt = new Date(n * 864e5);
  return dt.getUTCFullYear() + "-" + pad(dt.getUTCMonth() + 1) + "-" + pad(dt.getUTCDate());
}

export function addDays(iso: string, n: number): string {
  return fromDays((toDays(iso) as number) + n);
}

export function addMonths(iso: string, n: number): string {
  const p = parseDate(iso);
  if (!p) return iso;
  const total = p.y * 12 + (p.m - 1) + n;
  const y = Math.floor(total / 12);
  const m = total - y * 12 + 1;
  return y + "-" + pad(m) + "-" + pad(Math.min(p.d, joursDansMois(y, m)));
}

export function fmtDate(iso: unknown): string {
  const p = parseDate(iso);
  return p ? pad(p.d) + "/" + pad(p.m) + "/" + p.y : "n/a";
}

function joursInclus(a: string, b: string): number {
  return (toDays(b) as number) - (toDays(a) as number) + 1;
}

export function fmtPreavis(n: number, unite: PreavisUnite): string {
  if (unite === "jours") return n + (n > 1 ? " jours" : " jour");
  return n + " mois";
}

export function fmtDuree(mois: number, jours: number): string {
  const parts: string[] = [];
  const ans = Math.floor(mois / 12);
  const m = mois % 12;
  if (ans) parts.push(ans + (ans > 1 ? " ans" : " an"));
  if (m) parts.push(m + " mois");
  if (jours) parts.push(jours + (jours > 1 ? " jours" : " jour"));
  if (!parts.length) return "0 jour";
  if (parts.length === 1) return parts[0] ?? "0 jour";
  return parts.slice(0, -1).join(", ") + " et " + parts[parts.length - 1];
}

export function ecart(a: string, finExclusive: string): { mois: number; jours: number } {
  let mois = 0;
  while ((toDays(addMonths(a, mois + 1)) as number) <= (toDays(finExclusive) as number)) mois++;
  return { mois, jours: (toDays(finExclusive) as number) - (toDays(addMonths(a, mois)) as number) };
}

export function dateLimite(finExclusive: string, preavis: number, unite: PreavisUnite): string {
  if (unite === "jours") return addDays(finExclusive, -preavis - 1);
  return addDays(addMonths(finExclusive, -preavis), -1);
}

export function finApresPreavis(dateCourrier: string, preavis: number, unite: PreavisUnite): string {
  if (unite === "jours") return addDays(dateCourrier, preavis);
  return addDays(addMonths(addDays(dateCourrier, 1), preavis), -1);
}

function isMode(value: unknown): value is PreavisMode {
  return typeof value === "string" && (MODES as readonly string[]).includes(value);
}

function isUnite(value: unknown): value is PreavisUnite {
  return typeof value === "string" && (UNITES as readonly string[]).includes(value);
}

function days(iso: string): number {
  return toDays(iso) as number;
}

const RECAP_CALC = "Calcul : quotebuilder.co/outils/calculateur-preavis-reconduction-tacite";

export function computePreavis(input?: PreavisInput): PreavisResult {
  const o = input ?? {};
  const dateDebut = parseDate(o.dateDebut) ? String(o.dateDebut) : null;
  const dateCourrier = parseDate(o.dateCourrier) ? String(o.dateCourrier) : null;
  const dureeInitiale = Math.round(num(o.dureeInitiale, 0, 120, 0));
  const mode: PreavisMode = isMode(o.mode) ? o.mode : "periode";
  const dureeReconduction = Math.round(num(o.dureeReconduction, 0, 120, 0));
  const unite: PreavisUnite = isUnite(o.unite) ? o.unite : "mois";
  const preavis = Math.round(num(o.preavis, 0, unite === "jours" ? 730 : 24, 0));
  const mensuel = num(o.mensuel, 0, 10000000, 0);

  const base = {
    dateDebut,
    dureeInitiale,
    mode,
    dureeReconduction,
    preavis,
    unite,
    dateCourrier,
    mensuel,
  };

  let manque: string | null = null;
  if (!dateDebut) manque = "Renseignez la date de début du contrat.";
  else if (!(dureeInitiale >= 1)) manque = "Renseignez la durée initiale, en mois.";
  else if (mode === "periode" && !(dureeReconduction >= 1)) {
    manque = "Renseignez la durée de chaque reconduction, en mois.";
  } else if (!dateCourrier) manque = "Renseignez la date de réception du courrier de résiliation.";

  if (manque || !dateDebut || !dateCourrier) {
    return {
      ...base,
      valide: false,
      etat: "neutral",
      verdict: manque ?? "Renseignez la date de début du contrat.",
      lignes: [],
      conseils: [],
      clause: "Durée du contrat : à préciser.",
      recap: "Préavis et reconduction tacite (contrat B2B)\nDonnées incomplètes\n" + RECAP_CALC,
      periodeDebut: null,
      periodeFin: null,
      periodeLibelle: null,
      limite: null,
      limiteTexte: "n/a",
      finEffective: null,
      retardJours: null,
      prochaineLimite: null,
      joursEngages: null,
      montantEngage: null,
      moisRelation: null,
      joursRelation: null,
      dureeRelation: "n/a",
    };
  }

  const debut: string = dateDebut;
  const courrier: string = dateCourrier;
  const preavisTxt = fmtPreavis(preavis, unite);
  const debutPeriode = (k: number) =>
    k === 0 ? debut : addMonths(debut, dureeInitiale + (k - 1) * dureeReconduction);
  const finExclusive = (k: number) => debutPeriode(k + 1);
  const finInitialeExcl = addMonths(debut, dureeInitiale);
  const c = days(courrier);

  let etat: PreavisTone = "neutral";
  let verdict = "";
  let finEffective = "";
  let limite: string | null = null;
  let limiteTexte = "n/a";
  let periodeDebut = debut;
  let periodeFin: string | null = null;
  let periodeLibelle = "";
  let retardJours = 0;
  let prochaineLimite: string | null = null;
  const lignes: PreavisLigne[] = [];
  let kCourant = 0;
  let kFin = 0;

  if (mode === "periode") {
    while (kCourant < 2000 && days(finExclusive(kCourant)) <= c) kCourant++;
    kFin = kCourant;
    while (kFin < kCourant + 2000 && days(dateLimite(finExclusive(kFin), preavis, unite)) < c) kFin++;
    periodeDebut = debutPeriode(kCourant);
    periodeFin = addDays(finExclusive(kCourant), -1);
    periodeLibelle = kCourant === 0 ? "Durée initiale" : "Reconduction " + kCourant;
    limite = dateLimite(finExclusive(kCourant), preavis, unite);
    limiteTexte = fmtDate(limite);
    finEffective = addDays(finExclusive(kFin), -1);
    prochaineLimite = dateLimite(finExclusive(kFin), preavis, unite);
    if (kFin === kCourant) {
      etat = "ok";
      verdict =
        "Le courrier arrive avant la date limite du " +
        fmtDate(limite) +
        " : le contrat prend fin le " +
        fmtDate(finEffective) +
        ", au terme de la période en cours.";
    } else {
      retardJours = c - days(limite);
      const nb = kFin - kCourant;
      etat = "warn";
      verdict =
        "Le courrier arrive " +
        retardJours +
        (retardJours > 1 ? " jours" : " jour") +
        " après la date limite du " +
        fmtDate(limite) +
        ". Le contrat repart pour " +
        (nb > 1 ? nb + " périodes de " : "") +
        dureeReconduction +
        " mois : il prendra fin le " +
        fmtDate(finEffective) +
        ", et non le " +
        fmtDate(periodeFin) +
        ".";
    }
    const dernier = Math.min(Math.max(LIGNES_MIN - 1, kFin + 1), kFin + 12);
    for (let i = 0; i <= dernier; i++) {
      const du = debutPeriode(i);
      const au = addDays(finExclusive(i), -1);
      lignes.push({
        periode: i === 0 ? "Durée initiale" : "Reconduction " + i,
        du,
        au,
        limite: dateLimite(finExclusive(i), preavis, unite),
        etatPeriode: days(au) < c ? "terminée" : days(du) <= c ? "en cours" : "à venir",
        courant: i === kCourant,
        fin: i === kFin,
      });
    }
  } else {
    const dansInitiale = c < days(finInitialeExcl);
    const limite0 = dateLimite(finInitialeExcl, preavis, unite);
    const finInitiale = addDays(finInitialeExcl, -1);
    if (dansInitiale) {
      periodeDebut = debut;
      periodeFin = finInitiale;
      periodeLibelle = "Durée initiale";
    } else {
      periodeDebut = finInitialeExcl;
      periodeFin = null;
      periodeLibelle = mode === "indeterminee" ? "Durée indéterminée" : "Après le terme";
    }
    if (mode === "indeterminee") {
      if (dansInitiale && c <= days(limite0)) {
        limite = limite0;
        limiteTexte = fmtDate(limite0);
        finEffective = finInitiale;
        etat = "ok";
        verdict =
          "Le courrier arrive avant la date limite du " +
          fmtDate(limite0) +
          " : le contrat prend fin le " +
          fmtDate(finInitiale) +
          ", au terme de la durée initiale.";
      } else {
        const fin = finApresPreavis(courrier, preavis, unite);
        finEffective = days(fin) < days(finInitiale) ? finInitiale : fin;
        if (dansInitiale) {
          limite = limite0;
          limiteTexte = fmtDate(limite0);
          retardJours = c - days(limite0);
          etat = "warn";
          verdict =
            "Le courrier arrive après la date limite du " +
            fmtDate(limite0) +
            ". Le contrat se poursuit à durée indéterminée et prend fin à l'issue du préavis de " +
            preavisTxt +
            ", le " +
            fmtDate(finEffective) +
            ".";
        } else {
          limiteTexte = "à tout moment, préavis de " + preavisTxt;
          etat = preavis > 0 ? "ok" : "warn";
          verdict =
            "Le contrat est à durée indéterminée depuis le " +
            fmtDate(finInitialeExcl) +
            ". Il prend fin à l'issue du préavis de " +
            preavisTxt +
            ", le " +
            fmtDate(finEffective) +
            ".";
        }
        if (preavis === 0) {
          etat = "warn";
          verdict += " Aucun préavis n'est prévu : l'article 1211 du Code civil impose alors un délai raisonnable.";
        }
      }
    } else if (dansInitiale) {
      limiteTexte = "pas de préavis : fin au terme";
      finEffective = finInitiale;
      etat = "ok";
      verdict =
        "Le contrat prend fin à son terme, le " +
        fmtDate(finInitiale) +
        ", sans reconduction. Un courrier qui le confirme évite toute ambiguïté.";
    } else {
      finEffective = finApresPreavis(courrier, preavis, unite);
      limiteTexte = "à tout moment, préavis de " + preavisTxt;
      etat = "warn";
      verdict =
        "Le contrat est arrivé à son terme le " +
        fmtDate(finInitiale) +
        ". S'il a continué à être exécuté, l'article 1215 du Code civil le traite comme reconduit, à durée indéterminée : il prend fin à l'issue du préavis, le " +
        fmtDate(finEffective) +
        "." +
        (preavis === 0 ? " Sans préavis prévu, comptez un délai raisonnable (article 1211)." : "");
    }
    lignes.push({
      periode: "Durée initiale",
      du: debut,
      au: finInitiale,
      limite: mode === "indeterminee" ? limite0 : null,
      etatPeriode: days(finInitiale) < c ? "terminée" : days(debut) <= c ? "en cours" : "à venir",
      courant: dansInitiale,
      fin: days(finEffective) === days(finInitiale),
    });
    if (mode === "indeterminee" || !dansInitiale) {
      lignes.push({
        periode: "Durée indéterminée",
        du: finInitialeExcl,
        au: null,
        limite: null,
        etatPeriode: dansInitiale ? "à venir" : "en cours",
        courant: !dansInitiale,
        fin: days(finEffective) !== days(finInitiale),
      });
    }
  }

  const depart = c < days(debut) ? debut : courrier;
  const joursEngages = days(finEffective) >= days(depart) ? joursInclus(depart, finEffective) : 0;
  const montantEngage = mensuel > 0 ? r2((mensuel * 12) / 365 * joursEngages) : null;
  const rel = ecart(debut, addDays(finEffective, 1));
  const dureeRelation = fmtDuree(rel.mois, rel.jours);

  const conseils: string[] = [];
  if (mode === "periode") {
    conseils.push(
      "Prochaine date limite pour dénoncer : " +
        fmtDate(prochaineLimite) +
        ". Notez-la avec une marge, le temps que le recommandé arrive.",
    );
  }
  if (mode === "periode") {
    conseils.push(
      "Sans clause contraire, un contrat renouvelé ou reconduit tacitement devient un nouveau contrat à durée indéterminée (articles 1214 et 1215 du Code civil). Une reconduction « par périodes de " +
        dureeReconduction +
        " mois » doit donc être écrite.",
    );
  }
  if (preavis === 0 && mode !== "aucune") {
    conseils.push(
      "Aucun préavis saisi : pour un contrat à durée indéterminée, l'article 1211 du Code civil impose au moins un délai raisonnable.",
    );
  }
  conseils.push(
    "Relation de " +
      dureeRelation +
      " à la date de fin. Entre professionnels, une rupture doit laisser un préavis écrit qui tient compte de la durée de la relation commerciale (article L442-1 II du Code de commerce), même si le contrat prévoit moins. Un préavis de 18 mois suffit toujours.",
  );
  conseils.push(
    "Entre professionnels, personne n'est tenu de vous rappeler l'échéance. L'obligation d'information des articles L215-1 et L215-3 du Code de la consommation vise les consommateurs et les non-professionnels, pas un client qui achète pour son activité.",
  );
  conseils.push(
    "Envoyez le courrier dans la forme prévue au contrat, en général une lettre recommandée avec avis de réception, et gardez la preuve de la date de réception.",
  );
  conseils.push(
    "QuoteBuilder ne gère ni durée de contrat, ni reconduction, ni préavis : la clause s'écrit dans votre devis ou votre contrat.",
  );

  let clause: string;
  if (mode === "periode") {
    clause =
      "Durée : le contrat prend effet le " +
      fmtDate(debut) +
      " pour une durée de " +
      dureeInitiale +
      " mois. Il est ensuite reconduit tacitement par périodes de " +
      dureeReconduction +
      " mois, sauf dénonciation par l'une des parties par lettre recommandée avec avis de réception reçue au moins " +
      preavisTxt +
      " avant la fin de la période en cours.";
  } else if (mode === "indeterminee") {
    clause =
      "Durée : le contrat prend effet le " +
      fmtDate(debut) +
      " pour une durée initiale de " +
      dureeInitiale +
      " mois. À son terme, il se poursuit pour une durée indéterminée. Chaque partie peut alors y mettre fin à tout moment par lettre recommandée avec avis de réception, moyennant un préavis de " +
      preavisTxt +
      ".";
  } else {
    clause =
      "Durée : le contrat prend effet le " +
      fmtDate(debut) +
      " pour une durée de " +
      dureeInitiale +
      " mois. Il prend fin à son terme, sans reconduction tacite. Toute poursuite de la prestation fera l'objet d'un nouveau devis.";
  }

  const modeTxt =
    mode === "periode"
      ? "par périodes de " + dureeReconduction + " mois"
      : mode === "indeterminee"
        ? "poursuite à durée indéterminée"
        : "aucune";
  const recap = [
    "Préavis et reconduction tacite (contrat B2B)",
    "Début : " + fmtDate(debut) + ", durée initiale " + dureeInitiale + " mois",
    "Reconduction : " + modeTxt,
    "Préavis : " + (preavis > 0 ? preavisTxt : "aucun"),
    "Courrier reçu le : " + fmtDate(courrier),
    "Période en cours : " +
      periodeLibelle +
      (periodeFin
        ? ", du " + fmtDate(periodeDebut) + " au " + fmtDate(periodeFin)
        : ", depuis le " + fmtDate(periodeDebut)) +
      ", date limite : " +
      limiteTexte,
    "Fin effective : " + fmtDate(finEffective) + " (relation de " + dureeRelation + ")",
    "Montant encore engagé : " +
      (montantEngage == null
        ? "non renseigné"
        : fmtHt(montantEngage) + " (" + fmtHt(mensuel) + " par mois, " + joursEngages + " jours)"),
    RECAP_CALC,
  ].join("\n");

  return {
    ...base,
    valide: true,
    etat,
    verdict,
    periodeDebut,
    periodeFin,
    periodeLibelle,
    limite,
    limiteTexte,
    finEffective,
    retardJours,
    prochaineLimite,
    joursEngages,
    montantEngage,
    moisRelation: rel.mois,
    joursRelation: rel.jours,
    dureeRelation,
    lignes,
    conseils,
    clause,
    recap,
  };
}

export function buildRecap(input?: PreavisInput): string {
  return computePreavis(input).recap;
}
