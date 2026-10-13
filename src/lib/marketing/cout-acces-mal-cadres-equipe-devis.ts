export type AccessCostTone = "neutral" | "bad" | "warn" | "ok";

export type AccessCostInput = {
  membres?: number | string | null;
  adminsEnTrop?: number | string | null;
  incidentsParAdmin?: number | string | null;
  heuresParIncident?: number | string | null;
  blocagesParMois?: number | string | null;
  minutesParBlocage?: number | string | null;
  demandesRefroidies?: number | string | null;
  pointsSignaturePerdus?: number | string | null;
  tauxHoraire?: number | string | null;
  panierMoyen?: number | string | null;
  heuresMiseEnOrdre?: number | string | null;
};

export type AccessCostVerdict = {
  tone: AccessCostTone;
  text: string;
};

export type AccessCostResult = {
  membres: number;
  adminsEnTrop: number;
  incidentsParAdmin: number;
  heuresParIncident: number;
  blocages: number;
  minutesParBlocage: number;
  refroidies: number;
  pointsPerdus: number;
  tauxHoraire: number;
  panier: number;
  heuresMiseEnOrdre: number;
  incidentsMois: number;
  heuresIncidents: number;
  heuresBlocages: number;
  heuresTotales: number;
  coutTemps: number;
  dealsPerdus: number;
  caManque: number;
  heuresMiseEnOrdreMensuel: number;
  coutMiseEnOrdreMensuel: number;
  heuresNettes: number;
  coutNetMensuelEvite: number;
  coutNetAnnuelEvite: number;
  verdict: AccessCostVerdict;
  conseils: string[];
  recap: string;
};

/**
 * Exemple de l'article : 6 personnes, 2 Admins en trop, 0,5 incident,
 * 1,5 h, 12 blocages, 20 min, 4 demandes refroidies, 5 points,
 * 45 €/h, panier 4 500 €, mise en ordre 1 h.
 */
export const ACCESS_COST_DEFAULTS = {
  membres: 6,
  adminsEnTrop: 2,
  incidentsParAdmin: 0.5,
  heuresParIncident: 1.5,
  blocagesParMois: 12,
  minutesParBlocage: 20,
  demandesRefroidies: 4,
  pointsSignaturePerdus: 5,
  tauxHoraire: 45,
  panierMoyen: 4500,
  heuresMiseEnOrdre: 1,
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

/** Coût d'accès mal cadrés. Calculs internes non arrondis, r6 en sortie. */
export function computeAccessCost(input: AccessCostInput): AccessCostResult {
  const membres = Math.floor(num(input.membres, 0, null, 0));
  const adminsEnTrop = Math.floor(num(input.adminsEnTrop, 0, membres, 0));
  const incidentsParAdmin = num(input.incidentsParAdmin, 0, 30, 0);
  const heuresParIncident = num(input.heuresParIncident, 0, 40, 0);
  const blocages = num(input.blocagesParMois, 0, null, 0);
  const minutesParBlocage = num(input.minutesParBlocage, 0, 480, 0);
  const refroidies = num(input.demandesRefroidies, 0, blocages, 0);
  const pointsPerdus = num(input.pointsSignaturePerdus, 0, 100, 0);
  const tauxHoraire = num(input.tauxHoraire, 0, null, 0);
  const panier = num(input.panierMoyen, 0, null, 0);
  const heuresMiseEnOrdre = num(input.heuresMiseEnOrdre, 0, 40, 0);

  const inc = adminsEnTrop * incidentsParAdmin;
  const hi = inc * heuresParIncident;
  const hb = (blocages * minutesParBlocage) / 60;
  const ht = hi + hb;
  const dp = (refroidies * pointsPerdus) / 100;
  const hmo = heuresMiseEnOrdre / 12;
  const net = ht * tauxHoraire + dp * panier - hmo * tauxHoraire;

  const incidentsMois = r6(inc);
  const heuresIncidents = r6(hi);
  const heuresBlocages = r6(hb);
  const heuresTotales = r6(ht);
  const coutTemps = r6(ht * tauxHoraire);
  const dealsPerdus = r6(dp);
  const caManque = r6(dp * panier);
  const heuresMiseEnOrdreMensuel = r6(hmo);
  const coutMiseEnOrdreMensuel = r6(hmo * tauxHoraire);
  const heuresNettes = r6(Math.max(0, ht - hmo));
  const coutNetMensuelEvite = r6(net);
  const coutNetAnnuelEvite = r6(net * 12);

  let verdict: AccessCostVerdict;
  if (membres === 0) {
    verdict = {
      tone: "neutral",
      text: "Saisissez le nombre de personnes qui utilisent l'outil pour lancer le calcul.",
    };
  } else if (coutNetMensuelEvite >= 1000) {
    verdict = {
      tone: "bad",
      text:
        "Sur ces hypothèses, des accès mal cadrés vous coûtent environ " +
        fmtEur(coutNetMensuelEvite) +
        " par mois. Remettre les rôles en ordre prend moins d'une heure et se rembourse dès le premier mois.",
    };
  } else if (coutNetMensuelEvite >= 250) {
    verdict = {
      tone: "warn",
      text:
        "Coût modéré : environ " +
        fmtEur(coutNetMensuelEvite) +
        " par mois. Le gain tient surtout à la clarté : chacun sait ce qu'il peut modifier, et qui appeler quand il est bloqué.",
    };
  } else {
    verdict = {
      tone: "ok",
      text:
        "Coût faible sur ces hypothèses (" +
        fmtEur(coutNetMensuelEvite) +
        " par mois). Vos accès semblent déjà proches de l'usage réel ; gardez une revue des rôles une fois par trimestre.",
    };
  }

  const conseils: string[] = [];
  if (membres === 1) {
    conseils.push(
      "Seul dans l'espace : les rôles ne changent rien aujourd'hui. Ils servent dès la première personne invitée, pour garder un journal et des statistiques par personne.",
    );
  }
  if (membres > 1 && adminsEnTrop * 2 > membres) {
    conseils.push(
      "Plus de la moitié de l'équipe a un rôle Admin dont elle n'a pas besoin : les réglages qui touchent chaque prospect (funnels, catalogue, automatisations) ne sont plus protégés. Gardez un ou deux Admins, dont un de secours.",
    );
  }
  if (membres > 1 && adminsEnTrop === 0) {
    conseils.push(
      "Aucun Admin en trop : le gain vient des blocages. Vérifiez que chaque commercial a son propre compte et qu'un Admin de secours est nommé pour les absences du Propriétaire.",
    );
  }
  if (blocages > 20) {
    conseils.push(
      "Plus de 20 blocages par mois : c'est souvent le signe d'un identifiant partagé ou d'un seul Admin. Une invitation par personne et un Admin de secours règlent la plupart des cas.",
    );
  }
  if (pointsPerdus > 15) {
    conseils.push(
      "Plus de 15 points de signature perdus par réponse retardée : hypothèse forte. Vérifiez-la sur vos dossiers récents avant de la prendre pour acquise.",
    );
  }
  if (membres > 0 && caManque > 0 && caManque > coutTemps * 3) {
    conseils.push(
      "Le chiffre d'affaires manqué pèse plus de trois fois le temps perdu : ce sont les réponses retardées qui font le résultat. Une erreur sur ce taux change beaucoup le chiffre final.",
    );
  }
  conseils.push(
    "Dans QuoteBuilder, le rôle Commercial ferme les réglages, pas les dossiers : tous les membres actifs voient toutes les demandes de l'espace. Ce calcul ne porte pas sur la confidentialité des dossiers.",
  );

  const recap = [
    "Hypothèses : " +
      fmtNum(membres) +
      (membres >= 2 ? " personnes, " : " personne, ") +
      fmtNum(adminsEnTrop) +
      (adminsEnTrop >= 2 ? " Admins en trop, " : " Admin en trop, ") +
      fmtNum(incidentsParAdmin) +
      " incident par Admin en trop et par mois, " +
      fmtNum(heuresParIncident) +
      " h par incident, " +
      fmtNum(blocages) +
      (blocages >= 2 ? " blocages par mois de " : " blocage par mois de ") +
      fmtNum(minutesParBlocage) +
      " min, dont " +
      fmtNum(refroidies) +
      " avec un prospect qui attend, " +
      fmtNum(pointsPerdus) +
      " points de signature perdus, coût horaire " +
      fmtEur(tauxHoraire) +
      ", panier " +
      fmtEur(panier) +
      ", mise en ordre " +
      fmtNum(heuresMiseEnOrdre) +
      " h.",
    "Réglages modifiés par erreur : " +
      fmtNum(incidentsMois) +
      (incidentsMois >= 2 ? " incidents et " : " incident et ") +
      fmtNum(heuresIncidents) +
      " h par mois.",
    "Commerciaux bloqués : " +
      fmtNum(heuresBlocages) +
      " h par mois. Temps total perdu : " +
      fmtNum(heuresTotales) +
      " h, soit " +
      fmtEur(coutTemps) +
      ".",
    "Réponses retardées : " +
      fmtNum(dealsPerdus) +
      (dealsPerdus >= 2 ? " affaires refroidies et " : " affaire refroidie et ") +
      fmtEur(caManque) +
      " de chiffre d'affaires manqué par mois.",
    "Mise en ordre amortie sur 12 mois : " + fmtEur(coutMiseEnOrdreMensuel) + " par mois.",
    "Coût mensuel évité : " +
      fmtEur(coutNetMensuelEvite) +
      " (" +
      fmtEur(coutNetAnnuelEvite) +
      " sur 12 mois), avec " +
      fmtNum(heuresNettes) +
      " h nettes rendues par mois.",
    "Calcul : quotebuilder.co/outils/estimateur-cout-acces-mal-cadres-equipe-devis",
  ].join("\n");

  return {
    membres,
    adminsEnTrop,
    incidentsParAdmin,
    heuresParIncident,
    blocages,
    minutesParBlocage,
    refroidies,
    pointsPerdus,
    tauxHoraire,
    panier,
    heuresMiseEnOrdre,
    incidentsMois,
    heuresIncidents,
    heuresBlocages,
    heuresTotales,
    coutTemps,
    dealsPerdus,
    caManque,
    heuresMiseEnOrdreMensuel,
    coutMiseEnOrdreMensuel,
    heuresNettes,
    coutNetMensuelEvite,
    coutNetAnnuelEvite,
    verdict,
    conseils,
    recap,
  };
}

export function buildRecap(input: AccessCostInput) {
  return computeAccessCost(input).recap;
}
