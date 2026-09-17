function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export type RoiLogicielDevisInput = {
  demandes: number;
  tempsAvant: number;
  coutHoraire: number;
  tauxAvant: number;
  panier: number;
  tempsApres: number;
  /** Si `null` / `undefined`, le taux actuel est conservé. */
  tauxApres?: number | null;
  abonnement: number;
  marge: number;
};

export type RoiLogicielDevisResult = {
  demandes: number;
  tempsAvant: number;
  coutHoraire: number;
  tauxAvant: number;
  panier: number;
  tempsApres: number;
  tauxApres: number;
  abonnement: number;
  marge: number;
  heuresAvant: number;
  heuresApres: number;
  coutAvant: number;
  coutApres: number;
  gainTemps: number;
  deltaDeals: number;
  gainMarge: number;
  gainBrut: number;
  roiNet: number;
  paybackDays: number | null;
  tip: string;
};

export function roiLogicielDevisTip({
  demandes,
  roiNet,
  abonnement,
  paybackDays,
}: {
  demandes: number;
  roiNet: number;
  abonnement: number;
  paybackDays: number | null;
}): string {
  if (demandes === 0) {
    return "Indiquez un volume de demandes pour obtenir une première estimation.";
  }
  if (roiNet < 0) {
    return "Le scénario reste négatif après abonnement. Testez d’abord un périmètre simple, comme les modèles récurrents, ou vérifiez votre temps réel de chiffrage avant de généraliser l’outil.";
  }
  if (roiNet < abonnement) {
    return "Le gain existe mais reste limité. Mesurez le temps passé sur les relances, les reprises et les erreurs de devis : ce sont souvent les postes oubliés.";
  }
  if (paybackDays !== null && paybackDays <= 30) {
    return "Le retour est rapide sur ce scénario. Commencez par les demandes les plus fréquentes et comparez le temps réellement passé après quelques semaines.";
  }
  return "Le scénario est favorable. Validez le taux d’acceptation avec un historique réel et suivez séparément le temps gagné et les ventes additionnelles.";
}

export function computeRoiLogicielDevis(input: RoiLogicielDevisInput): RoiLogicielDevisResult {
  const demandes = Math.max(0, input.demandes);
  const tempsAvant = Math.max(0, input.tempsAvant);
  const coutHoraire = Math.max(0, input.coutHoraire);
  const tauxAvant = clamp(input.tauxAvant, 0, 100);
  const panier = Math.max(0, input.panier);
  const tempsApres = Math.max(0, input.tempsApres);
  const tauxApres =
    input.tauxApres === null || input.tauxApres === undefined
      ? tauxAvant
      : clamp(input.tauxApres, 0, 100);
  const abonnement = Math.max(0, input.abonnement);
  const marge = clamp(input.marge, 0, 100);

  const heuresAvant = (demandes * tempsAvant) / 60;
  const heuresApres = (demandes * tempsApres) / 60;
  const coutAvant = heuresAvant * coutHoraire;
  const coutApres = heuresApres * coutHoraire;
  const gainTemps = coutAvant - coutApres;
  const deltaDeals = (demandes * (tauxApres - tauxAvant)) / 100;
  const gainMarge = (deltaDeals * panier * marge) / 100;
  const gainBrut = gainTemps + gainMarge;
  const roiNet = gainBrut - abonnement;
  const paybackDays = gainBrut > 0 && abonnement > 0 ? (abonnement / gainBrut) * 30 : null;

  return {
    demandes,
    tempsAvant,
    coutHoraire,
    tauxAvant,
    panier,
    tempsApres,
    tauxApres,
    abonnement,
    marge,
    heuresAvant,
    heuresApres,
    coutAvant,
    coutApres,
    gainTemps,
    deltaDeals,
    gainMarge,
    gainBrut,
    roiNet,
    paybackDays,
    tip: roiLogicielDevisTip({ demandes, roiNet, abonnement, paybackDays }),
  };
}
