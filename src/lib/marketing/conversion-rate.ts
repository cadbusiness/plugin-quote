function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export type ConversionBucket = {
  mix: number;
  win: number;
};

export type ConversionMix = {
  hot: ConversionBucket;
  warm: ConversionBucket;
  cold: ConversionBucket;
};

export type ConversionRateInput = {
  quotesSent: number;
  basket: number;
  currentRate: number;
  targetRate: number;
  mix?: ConversionMix;
};

export type ConversionRateResult = {
  quotesSent: number;
  basket: number;
  currentRate: number;
  targetRate: number;
  monthlyCurrent: number;
  monthlyTarget: number;
  monthlyGain: number;
  annualGain: number;
  weighted: number | null;
  mixTotal: number | null;
  mixOk: boolean;
  tip: string;
};

const BUCKETS = ["hot", "warm", "cold"] as const;

export function conversionTip({
  quotesSent,
  basket,
  currentRate,
  targetRate,
  monthlyGain,
  mixOpen,
  mixOk,
  mix,
}: {
  quotesSent: number;
  basket: number;
  currentRate: number;
  targetRate: number;
  monthlyGain: number;
  mixOpen: boolean;
  mixOk: boolean;
  mix?: ConversionMix;
}): string {
  if (quotesSent === 0 || basket === 0) {
    return "Renseignez le volume de devis envoyés et le panier moyen pour voir le CA.";
  }
  if (mixOpen && mixOk && mix) {
    if (mix.hot.mix >= 30 && mix.cold.mix <= 25) {
      return "Beaucoup de Hot : un point de conversion en plus sur ce seau pèse fort. Priorisez délai de réponse et relances courtes.";
    }
    if (mix.cold.mix >= 45) {
      return "Beaucoup de Cold. Avant de pousser le volume d’envois, peaufinez la qualification : un Cold envoyé gonfle l’activité sans CA.";
    }
    if (targetRate > currentRate + 8) {
      return "Écart de taux ambitieux. Visez d’abord +3 à +5 points (brief, score, relances) avant une cible plus haute.";
    }
    return "Mix correct. Le gain vient surtout d’une meilleure exécution sur Warm et Hot, pas d’un miracle sur le Cold.";
  }
  if (targetRate > currentRate + 8) {
    return "Écart de taux ambitieux. Commencez par sécuriser +3 à +5 points avant de viser plus haut.";
  }
  if (monthlyGain > 0) {
    return "Même un petit gain de conversion sur le même volume d’envois change le CA du mois, sans recruter plus de leads.";
  }
  return "Fixez un taux cible un peu au-dessus de l’actuel pour voir le gain €. Ouvrez le mix Hot/Warm/Cold si vous scorez déjà.";
}

export function computeConversionRate({
  quotesSent,
  basket,
  currentRate,
  targetRate,
  mix,
}: ConversionRateInput): ConversionRateResult {
  const quotes = clamp(quotesSent, 0, 10_000);
  const cart = clamp(basket, 0, 10_000_000);
  const current = clamp(currentRate, 0, 100);
  const target = clamp(Math.max(targetRate, currentRate), 0, 100);

  const monthlyCurrent = quotes * cart * (current / 100);
  const monthlyTarget = quotes * cart * (target / 100);
  const monthlyGain = Math.max(monthlyTarget - monthlyCurrent, 0);

  let weighted: number | null = null;
  let mixTotal: number | null = null;
  let mixOk = false;

  if (mix) {
    mixTotal = 0;
    weighted = 0;
    for (const key of BUCKETS) {
      const share = clamp(mix[key].mix, 0, 100);
      const win = clamp(mix[key].win, 0, 100);
      mixTotal += share;
      weighted += quotes * (share / 100) * cart * (win / 100);
    }
    mixOk = mixTotal === 100;
    if (!mixOk) weighted = null;
  }

  return {
    quotesSent: quotes,
    basket: cart,
    currentRate: current,
    targetRate: target,
    monthlyCurrent,
    monthlyTarget,
    monthlyGain,
    annualGain: monthlyGain * 12,
    weighted,
    mixTotal,
    mixOk,
    tip: conversionTip({
      quotesSent: quotes,
      basket: cart,
      currentRate: current,
      targetRate: target,
      monthlyGain,
      mixOpen: Boolean(mix),
      mixOk,
      mix,
    }),
  };
}
