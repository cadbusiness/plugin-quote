"use client";

import Link from "next/link";
import { useState } from "react";
import {
  PRICING_COMPARE_ROWS,
  PUBLIC_PLANS,
  type PublicPlan,
} from "@/lib/marketing/content";

type Billing = "monthly" | "annual";

const PAID_PLANS = PUBLIC_PLANS.filter((plan) => plan.id !== "free");
const FREE_PLAN = PUBLIC_PLANS.find((plan) => plan.id === "free")!;

function planHref(plan: PublicPlan, billing: Billing) {
  if (plan.id === "free") return plan.href;
  return `${plan.href}&billing=${billing}`;
}

function priceLabel(plan: PublicPlan, billing: Billing) {
  if (plan.monthlyPrice === 0) return { main: "0 €", suffix: "pour toujours" };
  const value = billing === "monthly" ? plan.monthlyPrice! : plan.annualMonthly!;
  return { main: `${value} €`, suffix: "/mois" };
}

function cardClass(plan: PublicPlan) {
  if (plan.highlight === "featured") {
    return "border-mk-dark bg-mk-dark text-mk-on-dark shadow-[0_18px_40px_-28px_rgba(26,21,16,0.55)]";
  }
  return "border-mk-border bg-white text-mk-ink";
}

export function PricingPlans() {
  const [billing, setBilling] = useState<Billing>("annual");

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex justify-center">
        <div
          className="inline-flex rounded-md border border-mk-border bg-white p-0.5"
          role="group"
          aria-label="Facturation"
        >
          <button
            type="button"
            onClick={() => setBilling("monthly")}
            className={`rounded-[5px] px-3 py-1.5 text-[13px] font-medium transition ${
              billing === "monthly" ? "bg-mk-dark text-white" : "text-mk-muted hover:text-mk-ink"
            }`}
          >
            Mensuel
          </button>
          <button
            type="button"
            onClick={() => setBilling("annual")}
            className={`rounded-[5px] px-3 py-1.5 text-[13px] font-medium transition ${
              billing === "annual" ? "bg-mk-dark text-white" : "text-mk-muted hover:text-mk-ink"
            }`}
          >
            Annuel
            <span className={`ml-1.5 text-[11px] ${billing === "annual" ? "text-mk-accent" : "text-mk-accent"}`}>
              -2 mois
            </span>
          </button>
        </div>
      </div>

      {/* Paid plans: same compact cards as before */}
      <div className="mt-8 grid gap-3 md:grid-cols-3">
        {PAID_PLANS.map((plan) => {
          const price = priceLabel(plan, billing);
          const featured = plan.highlight === "featured";
          const muted = featured ? "text-white/50" : "text-mk-faint";
          const body = featured ? "text-white/72" : "text-mk-muted";

          return (
            <article
              key={plan.id}
              className={`relative flex flex-col rounded-xl border px-4 pb-4 pt-4 ${cardClass(plan)}`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-[13px] font-semibold tracking-tight">{plan.name}</p>
                {plan.badge ? (
                  <span className="rounded bg-mk-accent px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                    {plan.badge}
                  </span>
                ) : (
                  <span className="h-4" />
                )}
              </div>
              <p className={`mt-1 text-[11px] leading-4 ${muted}`}>{plan.audience}</p>

              <div className="mt-4 min-h-[3.25rem]">
                <p className="flex items-baseline gap-1">
                  <span className="text-[1.75rem] font-semibold tracking-tight">{price.main}</span>
                  <span className={`text-[12px] ${muted}`}>{price.suffix}</span>
                </p>
                {billing === "annual" ? (
                  <p className={`mt-0.5 text-[11px] ${muted}`}>{plan.annualTotal}&nbsp;€ / an</p>
                ) : (
                  <p className={`mt-0.5 text-[11px] ${muted}`}>
                    ou {plan.annualMonthly}&nbsp;€/mois en annuel
                  </p>
                )}
              </div>

              <Link
                href={planHref(plan, billing)}
                className={`mt-4 inline-flex h-9 items-center justify-center rounded-md text-[13px] font-semibold transition ${
                  featured
                    ? "bg-white text-mk-ink hover:bg-mk-accent-soft"
                    : "bg-mk-dark text-white hover:bg-mk-accent"
                }`}
              >
                {plan.cta}
              </Link>

              <ul
                className={`mt-4 space-y-1.5 border-t pt-3 text-[12px] leading-4 ${body} ${
                  featured ? "border-white/12" : "border-mk-border"
                }`}
              >
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-2">
                    <span className={`shrink-0 ${featured ? "text-mk-accent" : "text-mk-accent"}`} aria-hidden>
                      ·
                    </span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </article>
          );
        })}
      </div>

      {/* Free: single discreet framed line at the bottom */}
      <div className="mt-4 rounded-xl border border-mk-border bg-mk-band">
        <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[13px] font-semibold text-mk-ink">{FREE_PLAN.name}</p>
              <span className="rounded bg-mk-dark/06 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-mk-muted">
                {FREE_PLAN.badge}
              </span>
              <span className="text-[13px] font-semibold text-mk-muted">0 €</span>
            </div>
            <p className="mt-1 text-[12px] leading-5 text-mk-muted">
              1 funnel · Wizard · 10 soumissions au total · sans carte. Pour voir l’interface avant
              d’upgrader.
            </p>
          </div>
          <Link
            href={FREE_PLAN.href}
            className="inline-flex h-8 shrink-0 items-center justify-center rounded-md border border-mk-border px-3.5 text-[12px] font-semibold text-mk-muted transition hover:border-mk-dark/25 hover:bg-mk-dark/[0.03] hover:text-mk-ink"
          >
            {FREE_PLAN.cta}
          </Link>
        </div>
      </div>

      {/* Compact compare: paid plans */}
      <div className="mt-10 overflow-hidden rounded-xl border border-mk-border bg-white">
        <div className="border-b border-mk-border px-4 py-3">
          <p className="text-[13px] font-semibold text-mk-ink">Comparer en un coup d’œil</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[560px] w-full text-left text-[12px]">
            <thead>
              <tr className="border-b border-mk-border text-mk-faint">
                <th className="px-4 py-2.5 font-medium">Capacité</th>
                {PAID_PLANS.map((plan) => (
                  <th key={plan.id} className="px-3 py-2.5 font-semibold text-mk-ink">
                    {plan.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PRICING_COMPARE_ROWS.map((row) => (
                <tr key={row.label} className="border-b border-mk-dark/06 last:border-0">
                  <td className="px-4 py-2.5 font-medium text-mk-muted">{row.label}</td>
                  {PAID_PLANS.map((plan) => (
                    <td key={plan.id} className="px-3 py-2.5 text-mk-muted">
                      {row.values[plan.id]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
