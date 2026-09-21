function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export type CoutDevisExpiresInput = {
  ouverts: number;
  pctExpirent: number;
  panier: number;
  coutChiffrage: number;
  heuresChiffrage: number;
  tauxReprise: number;
  coutRechiffrage: number;
  pctSauves: number;
};

export type CoutDevisExpiresResult = {
  nbExpires: number;
  caPerdu: number;
  heuresPerdues: number;
  cout1: number;
  nbReprises: number;
  coutRechiffrageTotal: number;
  nbSauves: number;
  gainCa: number;
  gainCout: number;
  tip: string;
};

export function coutDevisExpiresTip({
  ouverts,
  pctExpirent,
  tauxReprise,
  coutRechiffrage,
  gainCa,
  pctSauves,
}: {
  ouverts: number;
  pctExpirent: number;
  tauxReprise: number;
  coutRechiffrage: number;
  gainCa: number;
  pctSauves: number;
}): string {
  if (ouverts === 0) {
    return "Indiquez un volume de devis ouverts pour obtenir une première estimation.";
  }
  if (pctExpirent >= 40) {
    return "Un fort taux d’expiration signale souvent une validité peu suivie ou des relances trop tardives. Priorisez une alerte J-5 et un statut expiré clair dans le pipeline.";
  }
  if (tauxReprise >= 30 && coutRechiffrage > 0) {
    return "Beaucoup de reprises après expiration : vous payez deux fois le chiffrage. Mieux vaut prolonger consciemment ou re-chiffrer avant la date, avec une nouvelle version.";
  }
  if (gainCa > 0 && pctSauves >= 20) {
    return "Le scénario « avant expiration » libère du CA potentiel et réduit les coûts de reprise. Validez le % évité avec 4 à 6 semaines d’historique réel (vues, relances J-5).";
  }
  return "Ajustez le % d’expiration et le panier : sur un panier élevé, quelques devis sauvés par mois pèsent plus qu’un volume de nouveaux leads mal qualifiés.";
}

export function computeCoutDevisExpires(input: CoutDevisExpiresInput): CoutDevisExpiresResult {
  const ouverts = Math.max(0, input.ouverts);
  const pctExpirent = clamp(input.pctExpirent, 0, 100);
  const panier = Math.max(0, input.panier);
  const coutChiffrage = Math.max(0, input.coutChiffrage);
  const heuresChiffrage = Math.max(0, input.heuresChiffrage);
  const tauxReprise = clamp(input.tauxReprise, 0, 100);
  const coutRechiffrage = Math.max(0, input.coutRechiffrage);
  const pctSauves = clamp(input.pctSauves, 0, 100);

  const nbExpires = (ouverts * pctExpirent) / 100;
  const caPerdu = nbExpires * panier;
  const heuresPerdues = nbExpires * heuresChiffrage;
  const cout1 = nbExpires * coutChiffrage;
  const nbReprises = (nbExpires * tauxReprise) / 100;
  const coutRechiffrageTotal = nbReprises * coutRechiffrage;
  const nbSauves = (nbExpires * pctSauves) / 100;
  const gainCa = nbSauves * panier;
  const gainCout1 = nbSauves * coutChiffrage;
  const gainRechiffrage = ((nbSauves * tauxReprise) / 100) * coutRechiffrage;
  const gainCout = gainCout1 + gainRechiffrage;

  return {
    nbExpires,
    caPerdu,
    heuresPerdues,
    cout1,
    nbReprises,
    coutRechiffrageTotal,
    nbSauves,
    gainCa,
    gainCout,
    tip: coutDevisExpiresTip({
      ouverts,
      pctExpirent,
      tauxReprise,
      coutRechiffrage,
      gainCa,
      pctSauves,
    }),
  };
}
