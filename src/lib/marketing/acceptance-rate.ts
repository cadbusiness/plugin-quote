function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export type AcceptanceRateInput = {
  envoyes: number;
  tauxActuel: number;
  panier: number;
  delai: number;
  tauxCible: number;
  marge: number;
};

export type AcceptanceRateResult = {
  envoyes: number;
  tauxActuel: number;
  panier: number;
  delai: number;
  tauxCible: number;
  marge: number;
  acceptesActuel: number;
  acceptesCible: number;
  delta: number;
  caGagne: number;
  margeGagnee: number;
  nonAcceptes: number;
  pipeline: number;
  coutAttente: number;
  tip: string;
};

export function acceptanceRateTip({
  envoyes,
  tauxActuel,
  tauxCible,
  delta,
  delai,
  pipeline,
  caGagne,
}: {
  envoyes: number;
  tauxActuel: number;
  tauxCible: number;
  delta: number;
  delai: number;
  pipeline: number;
  caGagne: number;
}): string {
  if (envoyes === 0) {
    return "Indiquez un volume de devis envoyés pour obtenir une première estimation.";
  }
  if (tauxCible < tauxActuel) {
    return "La cible est inférieure au taux actuel. Utile pour simuler une baisse, mais visez plutôt un gain réaliste (+3 à +8 points) via suivi de vue, versions uniques et relances.";
  }
  if (delta < 1 && tauxCible > tauxActuel) {
    return "Le gain en nombre de devis reste faible sur ce volume. Travaillez d’abord le délai de signature et la qualité du brief, pas seulement le pourcentage.";
  }
  if (delai >= 21 && pipeline > 0) {
    return "Le délai moyen est long : une partie du CA reste immobilisée. Réduire le temps envoi → acceptation (espace prospect, questions centralisées) baisse souvent le coût d’attente avant même de monter le taux.";
  }
  if (caGagne > 0) {
    return "Le scénario cible libère du CA et de la marge. Validez le taux avec un historique réel, puis suivez séparément le taux de vue et le délai d’acceptation.";
  }
  return "Ajustez taux actuel et cible pour voir l’écart. Un point de taux sur un panier élevé compte souvent plus qu’un volume de devis supplémentaire mal qualifié.";
}

export function computeAcceptanceRate(input: AcceptanceRateInput): AcceptanceRateResult {
  const envoyes = Math.max(0, input.envoyes);
  const tauxActuel = clamp(input.tauxActuel, 0, 100);
  const panier = Math.max(0, input.panier);
  const delai = Math.max(0, input.delai);
  const tauxCible = clamp(input.tauxCible, 0, 100);
  const marge = clamp(input.marge, 0, 100);

  const acceptesActuel = (envoyes * tauxActuel) / 100;
  const acceptesCible = (envoyes * tauxCible) / 100;
  const delta = acceptesCible - acceptesActuel;
  const caGagne = delta * panier;
  const margeGagnee = (caGagne * marge) / 100;
  const nonAcceptes = Math.max(0, envoyes - acceptesActuel);
  const pipeline = nonAcceptes * panier;
  const coutAttente = pipeline * (delai / 30);

  return {
    envoyes,
    tauxActuel,
    panier,
    delai,
    tauxCible,
    marge,
    acceptesActuel,
    acceptesCible,
    delta,
    caGagne,
    margeGagnee,
    nonAcceptes,
    pipeline,
    coutAttente,
    tip: acceptanceRateTip({
      envoyes,
      tauxActuel,
      tauxCible,
      delta,
      delai,
      pipeline,
      caGagne,
    }),
  };
}
