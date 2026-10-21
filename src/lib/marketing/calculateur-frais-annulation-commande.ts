export const REGIMES = ["acompte", "arrhes", "aucun"] as const;

export type Regime = (typeof REGIMES)[number];
export type Auteur = "client" | "prestataire";
export type AnnulationTone = "ok" | "warn" | "bad" | "neutral";

export const DEFAULTS = {
  montantHT: 8000,
  dateDebut: "2027-03-15",
  regime: "acompte",
  verse: 2400,
  dateAnnulation: "2027-02-20",
  auteur: "client",
  s1: 60,
  s2: 30,
  s3: 15,
  p1: 10,
  p2: 30,
  p3: 50,
  p4: 80,
  fraisEngages: 900,
  marge: 60,
} as const;

export type AnnulationInput = {
  montantHT?: unknown;
  dateDebut?: unknown;
  regime?: unknown;
  verse?: unknown;
  dateAnnulation?: unknown;
  auteur?: unknown;
  s1?: unknown;
  s2?: unknown;
  s3?: unknown;
  p1?: unknown;
  p2?: unknown;
  p3?: unknown;
  p4?: unknown;
  fraisEngages?: unknown;
  marge?: unknown;
};

export type AnnulationLigne = {
  rang: number;
  label: string;
  pct: number;
  indemnite: number;
  apres: number | null;
  courant: boolean;
};

export type AnnulationResult = {
  montantHT: number;
  regime: Regime;
  auteur: Auteur;
  verse: number;
  s1: number;
  s2: number;
  s3: number;
  p: number[];
  fraisEngages: number;
  marge: number;
  debut: number | null;
  annulation: number | null;
  coherent: boolean;
  joursAvant: number | null;
  palier: number | null;
  palierLabel: string | null;
  pct: number | null;
  indemnite: number | null;
  perte: number;
  garde: number | null;
  soldeLabel: string;
  solde: number | null;
  couverture: number | null;
  lignes: AnnulationLigne[];
  etat: AnnulationTone;
  verdict: string;
  conseils: string[];
  recap: string;
};

function num(v: unknown, min: number, max: number | null, fallback: number): number {
  let n = v === "" || v == null ? Number.NaN : Number(v);
  if (!Number.isFinite(n)) n = fallback;
  if (n < min) n = min;
  if (max != null && n > max) n = max;
  return n;
}

function r6(n: number): number {
  return Math.round(n * 1e6) / 1e6;
}

function groupe(entier: number): string {
  return String(entier).replace(/\B(?=(\d{3})+(?!\d))/g, "\u00a0");
}

function isRegime(value: unknown): value is Regime {
  return value === "acompte" || value === "arrhes" || value === "aucun";
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

export function fmtJours(n: number | null): string {
  if (n == null || !Number.isFinite(n)) return "n/a";
  return fmtNum(n) + (Math.abs(n) >= 2 ? " jours" : " jour");
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

export function palierLabels(s1: number, s2: number, s3: number): string[] {
  return [
    s1 + " jours et plus",
    s2 + " à " + (s1 - 1) + " jours",
    s3 + " à " + (s2 - 1) + " jours",
    s3 > 0 ? "moins de " + s3 + " jours" : "n/a",
  ];
}

export function palierDe(jours: number, s1: number, s2: number, s3: number): number {
  if (jours >= s1) return 1;
  if (jours >= s2) return 2;
  if (jours >= s3) return 3;
  return 4;
}

export function computeAnnulation(input: AnnulationInput): AnnulationResult {
  const montantHT = num(input.montantHT, 0, 1e9, 0);
  const regime: Regime = isRegime(input.regime) ? input.regime : "acompte";
  const auteur: Auteur = input.auteur === "prestataire" ? "prestataire" : "client";
  const verse = regime === "aucun" ? 0 : Math.min(num(input.verse, 0, 1e9, 0), montantHT);
  const s1 = Math.floor(num(input.s1, 0, 3650, 0));
  const s2 = Math.floor(num(input.s2, 0, 3650, 0));
  const s3 = Math.floor(num(input.s3, 0, 3650, 0));
  const p = [
    num(input.p1, 0, 100, 0),
    num(input.p2, 0, 100, 0),
    num(input.p3, 0, 100, 0),
    num(input.p4, 0, 100, 0),
  ];
  const fraisEngages = num(input.fraisEngages, 0, 1e9, 0);
  const marge = num(input.marge, 0, 100, 0);
  const debut = parseDate(input.dateDebut);
  const annulation = parseDate(input.dateAnnulation);

  const labels = palierLabels(s1, s2, s3);
  const coherent = s1 > s2 && s2 > s3 && p[0]! <= p[1]! && p[1]! <= p[2]! && p[2]! <= p[3]!;
  const joursAvant = debut != null && annulation != null ? debut - annulation : null;
  const palier = joursAvant != null && joursAvant >= 0 ? palierDe(joursAvant, s1, s2, s3) : null;
  const pct = palier ? p[palier - 1]! : null;
  const indemnite = palier ? r6((montantHT * pct!) / 100) : null;
  const perte = r6(fraisEngages + (montantHT * marge) / 100);

  const lignes: AnnulationLigne[] = [];
  for (let i = 0; i < 4; i++) {
    const ind = r6((montantHT * p[i]!) / 100);
    const apres = regime === "acompte" ? r6(ind - verse) : regime === "aucun" ? ind : null;
    lignes.push({
      rang: i + 1,
      label: labels[i]!,
      pct: p[i]!,
      indemnite: ind,
      apres,
      courant: palier === i + 1,
    });
  }

  const regimeTxt = regime === "acompte" ? "acompte" : regime === "arrhes" ? "arrhes" : "rien versé";
  let garde: number | null = null;
  let soldeLabel: string;
  let solde: number | null = null;
  if (palier != null) {
    if (auteur === "client") {
      if (regime === "arrhes") {
        garde = verse;
        soldeLabel = "Arrhes conservées";
        solde = verse;
      } else if (regime === "acompte") {
        garde = indemnite;
        const s = r6(indemnite! - verse);
        if (s >= 0) {
          soldeLabel = "Reste à facturer";
          solde = s;
        } else {
          soldeLabel = "À rembourser au client";
          solde = r6(-s);
        }
      } else {
        garde = indemnite;
        soldeLabel = "Reste à facturer";
        solde = indemnite;
      }
    } else if (regime === "arrhes") {
      garde = r6(-verse);
      soldeLabel = "À restituer au client (le double des arrhes)";
      solde = r6(2 * verse);
    } else {
      garde = 0;
      soldeLabel = "À rembourser au client";
      solde = verse;
    }
  } else {
    soldeLabel = "Reste à facturer";
  }
  const couverture = garde != null && perte > 0 ? r6((garde / perte) * 100) : null;

  let etat: AnnulationTone;
  let verdict: string;
  if (montantHT <= 0) {
    etat = "neutral";
    verdict = "Saisissez le montant de la commande.";
  } else if (debut == null || annulation == null) {
    etat = "neutral";
    verdict = "Saisissez la date de début et la date de l'annulation.";
  } else if (joursAvant != null && joursAvant < 0) {
    etat = "neutral";
    verdict =
      "L'annulation tombe après la date de début : ce n'est plus une annulation avant exécution. Ce qui est dû dépend de ce qui a été fait et de votre contrat, ce calcul ne s'applique pas.";
  } else if (!coherent) {
    etat = "bad";
    verdict =
      "Barème incohérent : les seuils doivent diminuer d'un palier à l'autre (par exemple 60, 30 et 15 jours) et les pourcentages augmenter quand la date approche.";
  } else if (auteur === "prestataire") {
    etat = "warn";
    if (regime === "arrhes") {
      verdict =
        "Vous annulez : vous restituez le double des arrhes, soit " +
        fmtEur(2 * verse) +
        ", dont " +
        fmtEur(verse) +
        " de plus que ce que vous aviez reçu (article 1590 du Code civil, sauf clause contraire de votre contrat).";
    } else if (regime === "acompte") {
      verdict =
        "Vous annulez : vous remboursez l'acompte de " +
        fmtEur(verse) +
        ", et le client peut demander l'exécution ou des dommages et intérêts. Le barème ne joue pas en votre faveur.";
    } else {
      verdict =
        "Vous annulez : rien à rembourser, mais le client peut demander l'exécution ou des dommages et intérêts. Le barème ne joue pas en votre faveur.";
    }
  } else {
    const tete =
      "Annulation à " +
      fmtJours(joursAvant) +
      " du début : palier " +
      palier +
      " (" +
      labels[palier! - 1] +
      "), " +
      fmtPct(pct) +
      ", soit " +
      fmtEur(indemnite) +
      " HT. ";
    if (regime === "arrhes") {
      if (verse < fraisEngages) {
        etat = "bad";
        verdict =
          "Le client se dédit en perdant ses arrhes : vous gardez " +
          fmtEur(verse) +
          ", moins que vos frais déjà engagés (" +
          fmtEur(fraisEngages) +
          "). Avec des arrhes, votre barème (" +
          fmtEur(indemnite) +
          ") ne s'applique pas, sauf clause de votre contrat.";
      } else {
        etat = "ok";
        verdict =
          "Le client se dédit en perdant ses arrhes : vous gardez " +
          fmtEur(verse) +
          ". Avec des arrhes, votre barème (" +
          fmtEur(indemnite) +
          ") ne s'applique pas, sauf clause de votre contrat.";
      }
    } else if (garde != null && garde < fraisEngages) {
      etat = "bad";
      verdict =
        tete +
        "C'est moins que vos frais déjà engagés (" +
        fmtEur(fraisEngages) +
        ") : votre barème ne couvre pas ce que vous avez dépensé.";
    } else if (perte > 0 && garde != null && garde > perte) {
      etat = "warn";
      verdict =
        tete +
        "C'est plus que votre perte estimée (" +
        fmtEur(perte) +
        "). Si la clause est une clause pénale, le juge peut la réduire si elle est manifestement excessive (article 1231-5 du Code civil).";
    } else {
      etat = "ok";
      if (regime === "acompte") {
        verdict =
          tete +
          "L'acompte de " +
          fmtEur(verse) +
          " s'impute : " +
          (soldeLabel === "Reste à facturer" ? "reste à facturer " : "à rembourser au client ") +
          fmtEur(solde) +
          " HT.";
      } else {
        verdict = tete + "Rien n'a été versé : l'indemnité est à facturer, puis à recouvrer.";
      }
    }
  }

  const conseils: string[] = [];
  if (regime === "acompte") {
    conseils.push(
      "Écrivez « acompte » dans le devis et sur la facture d'acompte. Entre professionnels, il n'y a pas de présomption légale comme celle du Code de la consommation : c'est votre contrat qui qualifie la somme. Face à un consommateur, une somme versée d'avance sans précision vaut arrhes (article L214-1 du Code de la consommation).",
    );
  } else if (regime === "arrhes") {
    conseils.push(
      "Avec des arrhes, chaque partie peut se dédire : le client en les perdant, vous en restituant le double (article 1590 du Code civil). Si vous voulez un engagement ferme, parlez d'acompte et prévoyez un barème.",
    );
  } else {
    conseils.push(
      "Sans versement, l'indemnité se facture après coup, et il faut ensuite la recouvrer. Un acompte au moins égal à vos frais engagés évite d'avancer de l'argent.",
    );
  }
  conseils.push(
    "Écrivez le barème dans le devis signé, pas seulement dans des CGV que le client n'a pas lues : les paliers, la date de référence (ici la date de début) et la façon de compter les jours.",
  );
  if (montantHT > 0 && palier != null && coherent && auteur === "client") {
    if (garde != null && garde < fraisEngages) {
      conseils.push(
        "À ce stade, ce que vous gardez ne couvre pas vos frais engagés. Montez le pourcentage du palier, ou demandez un acompte plus élevé à la commande.",
      );
    } else if (perte > 0 && garde != null && garde > perte) {
      conseils.push(
        "Une indemnité au-dessus de votre perte réelle se défend mal. Une clause de dédit (le prix d'une faculté d'annuler) et une clause pénale (la sanction d'une inexécution) ne se traitent pas de la même façon : faites relire la rédaction.",
      );
    } else if (couverture != null) {
      conseils.push(
        "Ce que vous gardez couvre " +
          fmtPct(couverture) +
          " de votre perte estimée. Le reste est le risque que vous acceptez en laissant au client une porte de sortie.",
      );
    }
  }
  conseils.push(
    "Si vous pouvez revendre le créneau ou la production à un autre client, votre perte réelle baisse. Gardez-le en tête avant de réclamer le maximum du barème.",
  );
  conseils.push("Demandez l'annulation par écrit et gardez sa date de réception : c'est elle qui fixe le palier.");
  conseils.push(
    "QuoteBuilder ne calcule pas de frais d'annulation et n'encaisse ni acompte ni arrhes : écrivez votre barème dans la description de vos produits et dans votre devis final.",
  );

  const recap = [
    "Frais d'annulation (commande B2B)",
    "Commande : " + fmtEur(montantHT) + " HT, début le " + fmtDate(debut),
    "Annulation le " +
      fmtDate(annulation) +
      " par " +
      (auteur === "client" ? "le client" : "vous") +
      " : " +
      (joursAvant == null ? "n/a" : fmtJours(joursAvant) + " avant le début"),
    "Barème : " + (palier ? "palier " + palier + " (" + labels[palier - 1] + "), " + fmtPct(pct) : "n/a"),
    "Indemnité selon le barème : " + (indemnite == null ? "n/a" : fmtEur(indemnite) + " HT"),
    "Versé à la commande : " + (regime === "aucun" ? "rien" : fmtEur(verse) + " (" + regimeTxt + ")"),
    soldeLabel + " : " + (solde == null ? "n/a" : fmtEur(solde) + " HT"),
    "Perte estimée : " + fmtEur(perte) + " (frais engagés " + fmtEur(fraisEngages) + ", marge " + fmtPct(marge) + ")",
    "Calcul : quotebuilder.co/outils/calculateur-frais-annulation-commande",
  ].join("\n");

  return {
    montantHT,
    regime,
    auteur,
    verse,
    s1,
    s2,
    s3,
    p,
    fraisEngages,
    marge,
    debut,
    annulation,
    coherent,
    joursAvant,
    palier,
    palierLabel: palier ? labels[palier - 1]! : null,
    pct,
    indemnite,
    perte,
    garde,
    soldeLabel,
    solde,
    couverture,
    lignes,
    etat,
    verdict,
    conseils,
    recap,
  };
}

export function buildRecap(input: AnnulationInput): string {
  return computeAnnulation(input).recap;
}
