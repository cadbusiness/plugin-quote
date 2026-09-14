function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export type PipelineBucket = {
  mix: number;
  win: number;
};

export type PipelineMix = {
  hot: PipelineBucket;
  warm: PipelineBucket;
  cold: PipelineBucket;
};

export type PipelineValueInput = {
  openQuotes: number;
  basket: number;
  currentRate: number;
  targetRate: number;
  mix?: PipelineMix;
};

export type PipelineValueResult = {
  openQuotes: number;
  basket: number;
  currentRate: number;
  targetRate: number;
  brut: number;
  caActuel: number;
  caCible: number;
  gap: number;
  annual: number;
  weighted: number | null;
  mixTotal: number | null;
  tip: string | null;
};

const BUCKETS = ["hot", "warm", "cold"] as const;

export function computePipelineValue({
  openQuotes,
  basket,
  currentRate,
  targetRate,
  mix,
}: PipelineValueInput): PipelineValueResult {
  const quotes = clamp(openQuotes, 0, 10_000);
  const cart = clamp(basket, 0, 10_000_000);
  const current = clamp(currentRate, 0, 100);
  const target = clamp(targetRate, 0, 100);

  const brut = quotes * cart;
  const caActuel = brut * (current / 100);
  const caCible = brut * (target / 100);
  const gap = caCible - caActuel;

  let weighted: number | null = null;
  let mixTotal: number | null = null;
  let tip: string | null = null;

  if (mix) {
    weighted = 0;
    mixTotal = 0;
    const wins: Record<(typeof BUCKETS)[number], number> = {
      hot: 0,
      warm: 0,
      cold: 0,
    };
    for (const key of BUCKETS) {
      const share = clamp(mix[key].mix, 0, 100);
      const win = clamp(mix[key].win, 0, 100);
      wins[key] = win;
      mixTotal += share;
      weighted += quotes * (share / 100) * cart * (win / 100);
    }
    if (wins.hot > wins.cold) {
      tip =
        "Un dossier Hot convertit mieux qu’un Cold. Déplacer du mix du Cold vers le Hot augmente le CA pondéré sans ouvrir plus de devis.";
    } else if (wins.cold > wins.hot) {
      tip =
        "Le Cold affiche un meilleur taux que le Hot : vérifiez le scoring avant d’élargir le volume Cold.";
    }
  }

  return {
    openQuotes: quotes,
    basket: cart,
    currentRate: current,
    targetRate: target,
    brut,
    caActuel,
    caCible,
    gap,
    annual: gap * 12,
    weighted,
    mixTotal,
    tip,
  };
}
