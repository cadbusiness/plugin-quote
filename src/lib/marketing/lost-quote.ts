function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export function computeLostQuote({
  quotesPerMonth,
  basket,
  currentRate,
  targetRate,
}: {
  quotesPerMonth: number;
  basket: number;
  currentRate: number;
  targetRate: number;
}) {
  const quotes = clamp(quotesPerMonth, 0, 10000);
  const cart = clamp(basket, 0, 10_000_000);
  const current = clamp(currentRate, 0, 100) / 100;
  const target = clamp(targetRate, 0, 100) / 100;
  const monthlyCurrent = quotes * cart * current;
  const monthlyTarget = quotes * cart * target;
  const monthlyGap = monthlyTarget - monthlyCurrent;
  return {
    quotes,
    cart,
    current,
    target,
    monthlyCurrent,
    monthlyTarget,
    monthlyGap,
    annualGap: monthlyGap * 12,
    extraWins: quotes * (target - current),
  };
}
