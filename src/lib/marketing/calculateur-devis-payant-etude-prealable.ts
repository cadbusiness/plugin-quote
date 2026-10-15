export type DevisPayantTone = "neutral" | "bad" | "warn" | "ok";

export type DevisPayantInput = {
  demandes?: number | string | null;
  heuresEtude?: number | string | null;
  tauxHoraire?: number | string | null;
  signatureActuelle?: number | string | null;
  margeContrat?: number | string | null;
  prixEtude?: number | string | null;
  partAcceptent?: number | string | null;
  signatureApres?: number | string | null;
  deduite?: boolean | string | number | null;
};

export const DEVIS_PAYANT_DEFAULTS = {
  demandes: 40,
  heuresEtude: 6,
  tauxHoraire: 50,
  signatureActuelle: 20,
  margeContrat: 1500,
  prixEtude: 250,
  partAcceptent: 45,
  signatureApres: 40,
  deduite: true,
} as const;

export type DevisPayantVerdict = {
  tone: DevisPayantTone;
  text: string;
};

export type DevisPayantResult = {
  demandes: number;
  heuresEtude: number;
  tauxHoraire: number;
  signatureActuelle: number;
  margeContrat: number;
  prixEtude: number;
  partAcceptent: number;
  signatureApres: number;
  deduite: boolean;
  heuresActuelles: number;
  coutActuel: number;
  coutEtudesPerdues: number;
  contratsActuels: number;
  etudesPayees: number;
  heuresApres: number;
  heuresRecuperees: number;
  valeurTempsRecupere: number;
  contratsApres: number;
  ecartContrats: number;
  ecartMarge: number;
  etudesFacturees: number;
  recettesEtudes: number;
  bilanPrudent: number;
  bilanComplet: number;
  bilanPrudentAnnuel: number;
  bilanCompletAnnuel: number;
  acceptationEquilibre: number | null;
  verdict: DevisPayantVerdict;
  conseils: string[];
  recap: string;
};

const NB = "\u00a0";

function num(v: number | string | null | undefined, min: number, max: number | null, fallback: number) {
  const parsed = v === "" || v == null ? Number.NaN : Number(v);
  let n = Number.isFinite(parsed) ? parsed : fallback;
  if (n < min) n = min;
  if (max != null && n > max) n = max;
  return n;
}

function r6(n: number) {
  return Math.round(n * 1e6) / 1e6;
}

function groupe(entier: number) {
  return String(entier).replace(/\B(?=(\d{3})+(?!\d))/g, NB);
}

export function fmtEur(n: number | null | undefined) {
  if (n == null || !Number.isFinite(n)) return "n/a";
  let neg = n < 0;
  const a = Math.abs(n);
  let txt: string;
  if (a < 1000 && Math.round(a * 100) % 100 !== 0) {
    const c = Math.round(a * 100);
    txt = groupe(Math.floor(c / 100)) + "," + String(c % 100).padStart(2, "0");
  } else {
    txt = groupe(Math.round(a));
  }
  if (txt === "0") neg = false;
  return (neg ? "-" : "") + txt + NB + "€";
}

export function fmtNum(n: number | null | undefined) {
  if (n == null || !Number.isFinite(n)) return "n/a";
  let neg = n < 0;
  const d = Math.round(Math.abs(n) * 10);
  const ent = Math.floor(d / 10);
  const dec = d % 10;
  if (d === 0) neg = false;
  return (neg ? "-" : "") + groupe(ent) + (dec ? "," + dec : "");
}

function pl(n: number, one: string, many: string) {
  return Math.abs(n) >= 2 ? many : one;
}

function bool(v: boolean | string | number | null | undefined) {
  return v === true || v === "true" || v === "on" || v === 1 || v === "1";
}

export function computeDevisPayant(input: DevisPayantInput = {}): DevisPayantResult {
  const demandes = Math.floor(num(input.demandes, 0, null, 0));
  const heuresEtude = num(input.heuresEtude, 0, 80, 0);
  const tauxHoraire = num(input.tauxHoraire, 0, null, 0);
  const signatureActuelle = num(input.signatureActuelle, 0, 100, 0);
  const margeContrat = num(input.margeContrat, 0, null, 0);
  const prixEtude = num(input.prixEtude, 0, null, 0);
  const partAcceptent = num(input.partAcceptent, 0, 100, 0);
  const signatureApres = num(input.signatureApres, 0, 100, 0);
  const deduite = input.deduite === undefined ? true : bool(input.deduite);

  const s1 = signatureActuelle / 100;
  const a = partAcceptent / 100;
  const s2 = signatureApres / 100;
  const ha = demandes * heuresEtude;
  const ep = demandes * a;
  const hap = ep * heuresEtude;
  const hr = ha - hap;
  const ca = demandes * s1;
  const cap = ep * s2;
  const ef = deduite ? ep * (1 - s2) : ep;
  const rec = ef * prixEtude;
  const em = (cap - ca) * margeContrat;
  const bp = rec + em;
  const vt = hr * tauxHoraire;
  const bc = bp + vt;

  const k = deduite ? (1 - s2) * prixEtude : prixEtude;
  const den = k + s2 * margeContrat;
  let eq: number | null = null;
  if (den > 0) {
    const x = (s1 * margeContrat) / den;
    if (x <= 1 + 1e-12) eq = r6(Math.min(1, x) * 100);
  }

  const heuresActuelles = r6(ha);
  const coutActuel = r6(ha * tauxHoraire);
  const coutEtudesPerdues = r6(demandes * (1 - s1) * heuresEtude * tauxHoraire);
  const contratsActuels = r6(ca);
  const etudesPayees = r6(ep);
  const heuresApres = r6(hap);
  const heuresRecuperees = r6(hr);
  const valeurTempsRecupere = r6(vt);
  const contratsApres = r6(cap);
  const ecartContrats = r6(cap - ca);
  const ecartMarge = r6(em);
  const etudesFacturees = r6(ef);
  const recettesEtudes = r6(rec);
  const bilanPrudent = r6(bp);
  const bilanComplet = r6(bc);
  const bilanPrudentAnnuel = r6(bp * 12);
  const bilanCompletAnnuel = r6(bc * 12);
  const coutTempsEtude = r6(heuresEtude * tauxHoraire);

  let verdict: DevisPayantVerdict;
  if (demandes === 0) {
    verdict = {
      tone: "neutral",
      text: "Saisissez le nombre de demandes qui demandent une étude pour lancer le calcul.",
    };
  } else if (bilanPrudent >= 300) {
    verdict = {
      tone: "ok",
      text:
        "Sur ces hypothèses, faire payer l'étude rapporte environ " +
        fmtEur(bilanPrudent) +
        " par mois sans compter le temps récupéré, et " +
        fmtEur(bilanComplet) +
        " en le comptant.",
    };
  } else if (bilanPrudent >= -300) {
    verdict = {
      tone: "warn",
      text:
        "Bilan serré sans le temps récupéré (" +
        fmtEur(bilanPrudent) +
        " par mois). L'étude payante se justifie surtout si les heures récupérées servent vraiment à autre chose.",
    };
  } else {
    verdict = {
      tone: "bad",
      text:
        "Sur ces hypothèses, les contrats perdus coûtent plus que ce que rapportent les études (" +
        fmtEur(bilanPrudent) +
        " par mois sans le temps récupéré). Gardez l'étude gratuite, ou réservez-la aux gros projets.",
    };
  }

  const conseils: string[] = [];
  if (demandes > 0 && signatureApres < signatureActuelle) {
    conseils.push(
      "Vous supposez que les clients qui paient l'étude signent moins souvent qu'aujourd'hui. C'est inhabituel : un client qui a payé est en général plus engagé. Vérifiez cette hypothèse.",
    );
  }
  if (partAcceptent > 80) {
    conseils.push(
      "Plus de 80 % d'acceptation : hypothèse forte. Si presque tous les clients acceptent, le filtre joue peu et le temps récupéré reste faible.",
    );
  }
  if (coutTempsEtude > 0 && prixEtude > coutTempsEtude) {
    conseils.push(
      "Le prix de l'étude dépasse le coût du temps passé (" +
        fmtEur(coutTempsEtude) +
        "). Le client risque d'y voir une marge sur le devis lui-même.",
    );
  } else if (coutTempsEtude > 0 && prixEtude > 0 && prixEtude < 0.2 * coutTempsEtude) {
    conseils.push(
      "Prix inférieur à 20 % du temps passé : montant presque symbolique, qui filtre peu et agace autant qu'un prix juste.",
    );
  }
  if (deduite) {
    conseils.push(
      "Avec la déduction, les études des clients qui signent ne rapportent rien : elles sont remboursées sur la commande. Fixez une durée de déduction, par exemple 3 ou 6 mois, et écrivez-la avec le prix.",
    );
  } else {
    conseils.push(
      "Sans déduction, le client paie l'étude même s'il signe. Ça se défend quand le livrable est utilisable sans vous, comme un relevé ou un diagnostic.",
    );
  }
  if (demandes > 0) {
    if (eq === null) {
      conseils.push("Avec ces hypothèses, aucun taux d'acceptation n'équilibre le bilan sans le temps récupéré.");
    } else {
      conseils.push(
        "Point d'équilibre sans le temps récupéré : il faut qu'au moins " +
          fmtNum(eq) +
          NB +
          "% des clients acceptent l'étude payante.",
      );
    }
  }
  conseils.push(
    "QuoteBuilder n'encaisse pas l'étude : il l'annonce dans le funnel (un produit du catalogue, une question d'accord) et la réponse du client arrive dans la fiche. Le paiement passe par votre circuit habituel.",
  );

  const recap = [
    "Hypothèses : " +
      fmtNum(demandes) +
      pl(demandes, " demande avec étude", " demandes avec étude") +
      " par mois, " +
      fmtNum(heuresEtude) +
      " h par étude, coût horaire " +
      fmtEur(tauxHoraire) +
      ", " +
      fmtNum(signatureActuelle) +
      NB +
      "% signées aujourd'hui, étude à " +
      fmtEur(prixEtude) +
      " HT " +
      (deduite ? "déduite de la commande" : "non déduite") +
      ", " +
      fmtNum(partAcceptent) +
      NB +
      "% d'acceptation, " +
      fmtNum(signatureApres) +
      NB +
      "% de signature après étude payée, marge " +
      fmtEur(margeContrat) +
      " par contrat.",
    "Aujourd'hui : " +
      fmtNum(heuresActuelles) +
      " h d'étude par mois (" +
      fmtEur(coutActuel) +
      "), " +
      fmtNum(contratsActuels) +
      pl(contratsActuels, " contrat", " contrats") +
      ", dont " +
      fmtEur(coutEtudesPerdues) +
      " de temps sur des études non signées.",
    "Étude payante : " +
      fmtNum(etudesPayees) +
      pl(etudesPayees, " étude payée", " études payées") +
      ", " +
      fmtNum(heuresRecuperees) +
      " h récupérées (" +
      fmtEur(valeurTempsRecupere) +
      "), " +
      fmtNum(contratsApres) +
      pl(contratsApres, " contrat", " contrats") +
      " (écart " +
      fmtNum(ecartContrats) +
      ", soit " +
      fmtEur(ecartMarge) +
      " de marge).",
    "Études facturées : " + fmtNum(etudesFacturees) + " pour " + fmtEur(recettesEtudes) + ".",
    "Bilan mensuel : " +
      fmtEur(bilanPrudent) +
      " sans le temps récupéré, " +
      fmtEur(bilanComplet) +
      " en le comptant (" +
      fmtEur(bilanPrudentAnnuel) +
      " et " +
      fmtEur(bilanCompletAnnuel) +
      " sur 12 mois).",
    "Équilibre sans le temps récupéré : " +
      (eq === null ? "aucun taux d'acceptation ne suffit." : fmtNum(eq) + NB + "% d'acceptation au minimum."),
    "Calcul : quotebuilder.co/outils/calculateur-devis-payant-etude-prealable",
  ].join("\n");

  return {
    demandes,
    heuresEtude,
    tauxHoraire,
    signatureActuelle,
    margeContrat,
    prixEtude,
    partAcceptent,
    signatureApres,
    deduite,
    heuresActuelles,
    coutActuel,
    coutEtudesPerdues,
    contratsActuels,
    etudesPayees,
    heuresApres,
    heuresRecuperees,
    valeurTempsRecupere,
    contratsApres,
    ecartContrats,
    ecartMarge,
    etudesFacturees,
    recettesEtudes,
    bilanPrudent,
    bilanComplet,
    bilanPrudentAnnuel,
    bilanCompletAnnuel,
    acceptationEquilibre: eq,
    verdict,
    conseils,
    recap,
  };
}

export function buildRecap(input: DevisPayantInput = {}) {
  return computeDevisPayant(input).recap;
}
