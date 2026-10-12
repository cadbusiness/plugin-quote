export type AutopilotLoadTone = "neutral" | "bad" | "warn" | "ok";

export type AutopilotLoadInput = {
  demandesParMois?: number | string | null;
  touchesManuellesParDemande?: number | string | null;
  minutesParTouche?: number | string | null;
  tauxHoraire?: number | string | null;
  pctSansSuiteManuelle?: number | string | null;
  panierMoyen?: number | string | null;
  tauxCloseAvecSuite?: number | string | null;
  tauxCloseSansSuite?: number | string | null;
  heuresSetupAutopilote?: number | string | null;
};

export type AutopilotLoadVerdict = {
  tone: AutopilotLoadTone;
  text: string;
};

export type AutopilotLoadResult = {
  demandes: number;
  touches: number;
  minutes: number;
  tauxHoraire: number;
  pctSansSuite: number;
  panier: number;
  tauxAvec: number;
  tauxSans: number;
  heuresSetup: number;
  touchesMois: number;
  heuresManuelles: number;
  coutTemps: number;
  demandesSansSuite: number;
  ecartTaux: number;
  dealsPerdus: number;
  caManque: number;
  heuresSetupMensuel: number;
  coutSetupMensuel: number;
  heuresNettesGagnees: number;
  coutNetMensuelEvite: number;
  coutNetAnnuelEvite: number;
  verdict: AutopilotLoadVerdict;
  conseils: string[];
  recap: string;
};

/** Exemple de l'article : 40 demandes, 4 touches, 6 min, 45 €/h, 35 %, panier 4 500 €, 22 % / 10 %, 2 h. */
export const AUTOPILOT_LOAD_DEFAULTS = {
  demandesParMois: 40,
  touchesManuellesParDemande: 4,
  minutesParTouche: 6,
  tauxHoraire: 45,
  pctSansSuiteManuelle: 35,
  panierMoyen: 4500,
  tauxCloseAvecSuite: 22,
  tauxCloseSansSuite: 10,
  heuresSetupAutopilote: 2,
} as const;

function num(v: unknown, min: number, max: number | null, fallback: number) {
  let n = v === "" || v == null ? Number.NaN : Number(v);
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

/** Montant en euros. Centimes sous 1 000 € si le montant n'est pas entier. Espace insécable avant €. */
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
  return (neg ? "-" : "") + txt + "\u00a0€";
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

/** Charge manuelle face à un parcours automatique. Calculs internes non arrondis, r6 en sortie. */
export function computeAutopilotLoad(input: AutopilotLoadInput): AutopilotLoadResult {
  const demandes = num(input.demandesParMois, 0, null, 0);
  const touches = num(input.touchesManuellesParDemande, 0, null, 0);
  const minutes = num(input.minutesParTouche, 0, null, 0);
  const tauxHoraire = num(input.tauxHoraire, 0, null, 0);
  const pctSansSuite = num(input.pctSansSuiteManuelle, 0, 100, 0);
  const panier = num(input.panierMoyen, 0, null, 0);
  const tauxAvec = num(input.tauxCloseAvecSuite, 0, 100, 0);
  const tauxSans = num(input.tauxCloseSansSuite, 0, 100, 0);
  const heuresSetup = num(input.heuresSetupAutopilote, 0, 40, 0);

  const hm = (demandes * touches * minutes) / 60;
  const dss = (demandes * pctSansSuite) / 100;
  const ecart = Math.max(0, (tauxAvec - tauxSans) / 100);
  const dp = dss * ecart;
  const hsm = heuresSetup / 12;
  const net = hm * tauxHoraire + dp * panier - hsm * tauxHoraire;

  const touchesMois = r6(demandes * touches);
  const heuresManuelles = r6(hm);
  const coutTemps = r6(hm * tauxHoraire);
  const demandesSansSuite = r6(dss);
  const ecartTaux = r6(ecart);
  const dealsPerdus = r6(dp);
  const caManque = r6(dp * panier);
  const heuresSetupMensuel = r6(hsm);
  const coutSetupMensuel = r6(hsm * tauxHoraire);
  const heuresNettesGagnees = r6(Math.max(0, hm - hsm));
  const coutNetMensuelEvite = r6(net);
  const coutNetAnnuelEvite = r6(net * 12);

  let verdict: AutopilotLoadVerdict;
  if (demandes === 0) {
    verdict = { tone: "neutral", text: "Saisissez votre nombre de demandes par mois pour lancer le calcul." };
  } else if (coutNetMensuelEvite >= 1500) {
    verdict = {
      tone: "ok",
      text:
        "Sur ces hypothèses, le suivi à la main vous coûte environ " +
        fmtEur(coutNetMensuelEvite) +
        " par mois de plus qu'un parcours automatique. La mise en place se rembourse dès le premier mois.",
    };
  } else if (coutNetMensuelEvite >= 400) {
    verdict = {
      tone: "warn",
      text:
        "Écart modéré : environ " +
        fmtEur(coutNetMensuelEvite) +
        " par mois. Le parcours vaut surtout pour la régularité des envois ; vérifiez vos taux de signature avant de conclure.",
    };
  } else {
    verdict = {
      tone: "bad",
      text:
        "Écart faible sur ces hypothèses (" +
        fmtEur(coutNetMensuelEvite) +
        " par mois). Commencez par mesurer vos volumes et vos taux de signature avant d'y passer du temps.",
    };
  }

  const conseils: string[] = [];
  if (demandes > 0 && demandes < 10) {
    conseils.push(
      "Moins de 10 demandes par mois : une affaire de plus ou de moins change tout le résultat. Jugez l'écart de signature sur au moins trois mois cumulés.",
    );
  }
  if (heuresSetup > 4) {
    conseils.push(
      "Plus de 4 heures de mise en place : dans QuoteBuilder, le Parcours demande et le Parcours abandon sont déjà installés. Commencez par relire leurs textes et leurs délais avant de dessiner un canvas complet.",
    );
  }
  if (tauxSans > tauxAvec) {
    conseils.push(
      "Votre taux de signature sans suite dépasse le taux avec suite : l'écart est compté à zéro, seul le temps passé entre dans le calcul.",
    );
  } else if (demandes > 0 && pctSansSuite > 0 && tauxAvec - tauxSans < 5) {
    conseils.push(
      "Moins de 5 points d'écart entre les deux taux de signature : le gain vient surtout du temps rendu. Mesurez cet écart sur vos propres dossiers avant de le prendre pour acquis.",
    );
  }
  if (demandes > 0 && pctSansSuite === 0) {
    conseils.push(
      "Vous estimez qu'aucune touche ne saute : le calcul ne compte que le temps passé. Vérifiez sur dix dossiers récents que chaque relance prévue est bien partie.",
    );
  }
  if (touches > 6) {
    conseils.push(
      "Plus de 6 touches écrites par demande : au-delà, chaque message doit apporter une information neuve, sinon il agace plus qu'il ne relance.",
    );
  }
  if (demandes > 0 && caManque > 0 && caManque > coutTemps * 3) {
    conseils.push(
      "Le chiffre d'affaires manqué pèse plus de trois fois le temps passé : c'est l'écart de signature qui fait le résultat. Une erreur sur ce taux change beaucoup le chiffre final.",
    );
  }
  conseils.push(
    "Un parcours envoie les emails écrits : confirmation, rappel interne, relances. L'appel du commercial et la visite restent à faire, et à compter à part.",
  );

  const recap = [
    "Hypothèses : " +
      fmtNum(demandes) +
      " demandes par mois, " +
      fmtNum(touches) +
      " touches à la main par demande, " +
      fmtNum(minutes) +
      " min par touche, coût horaire " +
      fmtEur(tauxHoraire) +
      ", " +
      fmtNum(pctSansSuite) +
      " % des demandes avec une touche qui saute, panier " +
      fmtEur(panier) +
      ", signature " +
      fmtNum(tauxAvec) +
      " % avec suite et " +
      fmtNum(tauxSans) +
      " % sans suite, mise en place " +
      fmtNum(heuresSetup) +
      " h.",
    "Suivi à la main : " +
      fmtNum(touchesMois) +
      " touches et " +
      fmtNum(heuresManuelles) +
      " h par mois, soit " +
      fmtEur(coutTemps) +
      " de temps.",
    "Demandes sans suite complète : " +
      fmtNum(demandesSansSuite) +
      " par mois, soit " +
      fmtNum(dealsPerdus) +
      (dealsPerdus >= 2 ? " affaires perdues et " : " affaire perdue et ") +
      fmtEur(caManque) +
      " de chiffre d'affaires manqué.",
    "Mise en place amortie sur 12 mois : " + fmtEur(coutSetupMensuel) + " par mois.",
    "Coût mensuel évité : " +
      fmtEur(coutNetMensuelEvite) +
      " (" +
      fmtEur(coutNetAnnuelEvite) +
      " sur 12 mois), avec " +
      fmtNum(heuresNettesGagnees) +
      " h nettes rendues par mois.",
    "Calcul : quotebuilder.co/outils/estimateur-charge-relances-manuelles-vs-autopilote",
  ].join("\n");

  return {
    demandes,
    touches,
    minutes,
    tauxHoraire,
    pctSansSuite,
    panier,
    tauxAvec,
    tauxSans,
    heuresSetup,
    touchesMois,
    heuresManuelles,
    coutTemps,
    demandesSansSuite,
    ecartTaux,
    dealsPerdus,
    caManque,
    heuresSetupMensuel,
    coutSetupMensuel,
    heuresNettesGagnees,
    coutNetMensuelEvite,
    coutNetAnnuelEvite,
    verdict,
    conseils,
    recap,
  };
}

export function buildRecap(input: AutopilotLoadInput) {
  return computeAutopilotLoad(input).recap;
}
