"use client";

import { useEffect, useState } from "react";
import { convertAmount, FALLBACK_RATES_EUR, formatMoney, PRODUCT_CURRENCIES } from "@/lib/catalog/fx";

export function CurrencyFields({
  currency,
  priceMin,
  priceMax,
}: {
  currency: string;
  priceMin: number | null;
  priceMax: number | null;
}) {
  const [code, setCode] = useState(currency || "EUR");
  const [min, setMin] = useState(priceMin != null ? String(priceMin) : "");
  const [max, setMax] = useState(priceMax != null ? String(priceMax) : "");
  const [rates, setRates] = useState(FALLBACK_RATES_EUR);
  const [hint, setHint] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("https://api.frankfurter.app/latest?from=EUR")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { rates?: Record<string, number> } | null) => {
        if (cancelled || !data?.rates) return;
        setRates({ EUR: 1, ...data.rates });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  function onCurrencyChange(next: string) {
    const prev = code;
    setCode(next);
    const minN = Number(min.replace(",", "."));
    const maxN = Number(max.replace(",", "."));
    if (Number.isFinite(minN) && min !== "") {
      const converted = convertAmount(minN, prev, next, rates);
      setMin(String(converted));
    }
    if (Number.isFinite(maxN) && max !== "") {
      const converted = convertAmount(maxN, prev, next, rates);
      setMax(String(converted));
    }
    if (prev !== next) {
      setHint(`Prix convertis ${prev} → ${next} (taux BCE).`);
    }
  }

  const minN = Number(min.replace(",", "."));
  const others = PRODUCT_CURRENCIES.filter((item) => item.code !== code).slice(0, 3);

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="text-sm">
        <span className="font-medium text-slate-900">Prix min</span>
        <input
          name="price_min"
          type="number"
          step="0.01"
          value={min}
          onChange={(event) => setMin(event.target.value)}
          className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
        />
      </label>
      <label className="text-sm">
        <span className="font-medium text-slate-900">Prix max</span>
        <input
          name="price_max"
          type="number"
          step="0.01"
          value={max}
          onChange={(event) => setMax(event.target.value)}
          className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
        />
      </label>
      <label className="text-sm sm:col-span-2">
        <span className="font-medium text-slate-900">Devise</span>
        <select
          name="currency"
          value={code}
          onChange={(event) => onCurrencyChange(event.target.value)}
          className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
        >
          {PRODUCT_CURRENCIES.map((item) => (
            <option key={item.code} value={item.code}>
              {item.code} — {item.label}
            </option>
          ))}
        </select>
        {Number.isFinite(minN) && min !== "" ? (
          <p className="mt-1.5 text-xs leading-5 text-slate-500">
            {minN.toLocaleString("fr-FR")} {code}
            {others.map((item) => (
              <span key={item.code}>
                {" · "}
                {formatMoney(convertAmount(minN, code, item.code, rates), item.code)}
              </span>
            ))}
          </p>
        ) : (
          <p className="mt-1.5 text-xs text-slate-500">Changer de devise convertit automatiquement les prix.</p>
        )}
        {hint ? <p className="mt-1 text-xs text-[#C2410C]">{hint}</p> : null}
      </label>
    </div>
  );
}
