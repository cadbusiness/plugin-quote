"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  PRICING_MATRIX,
  PUBLIC_PLANS,
  type PricingCell,
  type PublicPlan,
} from "@/lib/marketing/content";

type Billing = "monthly" | "annual";

const PAID_PLANS = PUBLIC_PLANS.filter((plan) => plan.id !== "free");
const FREE_PLAN = PUBLIC_PLANS.find((plan) => plan.id === "free")!;

function planHref(plan: PublicPlan, billing: Billing) {
  if (plan.id === "free") return plan.href;
  return `${plan.href}&billing=${billing}`;
}

function priceParts(plan: PublicPlan, billing: Billing) {
  if (plan.monthlyPrice === 0) {
    return { amount: "0 €", note: "sans carte" };
  }
  const amount = billing === "monthly" ? plan.monthlyPrice! : plan.annualMonthly!;
  return {
    amount: `${amount} €`,
    note: billing === "annual" ? `${plan.annualTotal} € / an` : "facturé mensuellement",
  };
}

function CellValue({ value }: { value: PricingCell }) {
  if (value === true) {
    return (
      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#1A1510] text-[11px] font-bold text-white">
        ✓
      </span>
    );
  }
  if (value === false) {
    return <span className="text-[#1A1510]/22">–</span>;
  }
  return <span className="text-[13px] font-medium text-[#1A1510]">{value}</span>;
}

function Tip({ text }: { text: string }) {
  return (
    <span className="group/tip relative ml-1 inline-flex align-middle">
      <button
        type="button"
        className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-[#1A1510]/15 text-[10px] font-semibold text-[#1A1510]/40 hover:border-[#1A1510]/30 hover:text-[#1A1510]"
        aria-label={text}
      >
        i
      </button>
      <span className="pointer-events-none absolute bottom-[calc(100%+8px)] left-1/2 z-20 w-56 -translate-x-1/2 rounded-md bg-[#1A1510] px-3 py-2 text-left text-[12px] font-normal leading-4 text-white opacity-0 shadow-lg transition group-hover/tip:opacity-100 group-focus-within/tip:opacity-100">
        {text}
      </span>
    </span>
  );
}

export function PricingPlans() {
  const [billing, setBilling] = useState<Billing>("annual");
  const gridClass = useMemo(
    () => "grid grid-cols-[minmax(200px,1.2fr)_repeat(3,minmax(0,1fr))]",
    [],
  );

  return (
    <div className="mx-auto max-w-6xl">
      <div className="overflow-x-auto pb-2">
        <div className="min-w-[780px]">
          {/* Sticky header: paid plans only */}
          <div className="sticky top-[4.25rem] z-30 overflow-hidden rounded-t-xl border border-[#1A1510]/10 bg-[#F6F0E8]/95 backdrop-blur-md">
            <div className={gridClass}>
              <div className="flex items-end border-r border-[#1A1510]/08 px-4 pb-4 pt-4">
                <div
                  className="inline-flex rounded-full border border-[#1A1510]/12 bg-white p-0.5"
                  role="group"
                  aria-label="Facturation"
                >
                  <button
                    type="button"
                    onClick={() => setBilling("monthly")}
                    className={`rounded-full px-3 py-1.5 text-[12px] font-medium transition ${
                      billing === "monthly"
                        ? "bg-[#1A1510] text-white"
                        : "text-[#1A1510]/55 hover:text-[#1A1510]"
                    }`}
                  >
                    Mensuel
                  </button>
                  <button
                    type="button"
                    onClick={() => setBilling("annual")}
                    className={`rounded-full px-3 py-1.5 text-[12px] font-medium transition ${
                      billing === "annual"
                        ? "bg-[#1A1510] text-white"
                        : "text-[#1A1510]/55 hover:text-[#1A1510]"
                    }`}
                  >
                    Annuel
                    <span className="ml-1 text-[11px] text-[#E85D04]">-2 mois</span>
                  </button>
                </div>
              </div>

              {PAID_PLANS.map((plan) => {
                const price = priceParts(plan, billing);
                const featured = plan.highlight === "featured";
                return (
                  <div
                    key={plan.id}
                    className={`flex flex-col border-r border-[#1A1510]/08 px-3 pb-4 pt-4 last:border-r-0 ${
                      featured ? "bg-[#1A1510] text-[#F6F0E8]" : ""
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <p className="text-[13px] font-semibold tracking-tight">{plan.name}</p>
                      {plan.badge ? (
                        <span className="rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide bg-[#E85D04] text-white">
                          {plan.badge}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-2 text-[22px] font-semibold tracking-tight">
                      {price.amount}
                      <span className={`ml-1 text-[12px] font-medium ${featured ? "text-white/45" : "text-[#1A1510]/40"}`}>
                        /mois
                      </span>
                    </p>
                    <p className={`mt-0.5 text-[11px] ${featured ? "text-white/45" : "text-[#1A1510]/45"}`}>
                      {price.note}
                    </p>
                    <Link
                      href={planHref(plan, billing)}
                      className={`mt-3 inline-flex h-8 items-center justify-center rounded-md border text-[12px] font-semibold transition ${
                        featured
                          ? "border-white/20 bg-white text-[#1A1510] hover:bg-[#FFF4EB]"
                          : "border-[#1A1510]/15 bg-white text-[#1A1510] hover:border-[#1A1510] hover:bg-[#1A1510] hover:text-white"
                      }`}
                    >
                      {plan.cta}
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Matrix body */}
          <div className="overflow-hidden rounded-b-xl border-x border-b border-[#1A1510]/10 bg-white">
            {PRICING_MATRIX.map((section) => (
              <div key={section.id}>
                <div className={`${gridClass} border-t border-[#1A1510]/08 bg-[#F6F0E8]/55`}>
                  <div className="col-span-4 px-4 py-2.5">
                    <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#1A1510]/45">
                      {section.title}
                    </p>
                  </div>
                </div>

                {section.rows.map((row) => (
                  <div
                    key={row.label}
                    className={`${gridClass} border-t border-[#1A1510]/06`}
                  >
                    <div className="flex items-center border-r border-[#1A1510]/06 px-4 py-3.5">
                      <span className="text-[13px] font-medium text-[#1A1510]/80">
                        {row.label}
                        {row.tip ? <Tip text={row.tip} /> : null}
                      </span>
                    </div>
                    {PAID_PLANS.map((plan) => (
                      <div
                        key={plan.id}
                        className={`flex items-center justify-center border-r border-[#1A1510]/06 px-2 py-3.5 last:border-r-0 ${
                          plan.highlight === "featured" ? "bg-[#1A1510]/[0.03]" : ""
                        }`}
                      >
                        <CellValue value={row.values[plan.id]} />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Free: single discreet framed line */}
      <div className="mt-5 overflow-hidden rounded-xl border border-[#1A1510]/10 bg-white/70">
        <div className="flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[13px] font-semibold text-[#1A1510]">{FREE_PLAN.name}</p>
              <span className="rounded bg-[#1A1510]/06 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#1A1510]/55">
                {FREE_PLAN.badge}
              </span>
              <span className="text-[13px] font-semibold text-[#1A1510]/70">0 €</span>
            </div>
            <p className="mt-1 text-[12px] leading-5 text-[#1A1510]/50">
              1 funnel · Wizard · 10 soumissions au total · sans carte. Pour voir l’interface avant
              d’upgrader.
            </p>
          </div>
          <Link
            href={FREE_PLAN.href}
            className="inline-flex h-8 shrink-0 items-center justify-center rounded-md border border-[#1A1510]/12 bg-transparent px-3.5 text-[12px] font-semibold text-[#1A1510]/70 transition hover:border-[#1A1510]/30 hover:bg-[#1A1510]/[0.03] hover:text-[#1A1510]"
          >
            {FREE_PLAN.cta}
          </Link>
        </div>
      </div>
    </div>
  );
}
